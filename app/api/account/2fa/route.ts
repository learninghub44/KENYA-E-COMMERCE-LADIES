import { NextRequest, NextResponse } from "next/server"
import { createSupabaseClient } from "../../../../lib/supabase/server"
import crypto from "crypto"

const BASE32_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567"

// Encode buffer to base32
function base32Encode(buffer: Buffer): string {
  let bits = ""
  for (const byte of buffer) {
    bits += byte.toString(2).padStart(8, "0")
  }
  let result = ""
  for (let i = 0; i < bits.length; i += 5) {
    const chunk = bits.slice(i, i + 5).padEnd(5, "0")
    const index = parseInt(chunk, 2)
    result += BASE32_CHARS[index]
  }
  return result
}

// Decode base32 to buffer
function base32Decode(secret: string): Buffer {
  const normalized = secret.toUpperCase().replace(/[^A-Z2-7]/g, "")
  let bits = ""
  for (const char of normalized) {
    const index = BASE32_CHARS.indexOf(char)
    if (index === -1) continue
    bits += index.toString(2).padStart(5, "0")
  }
  const bytes = []
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.slice(i, i + 8), 2))
  }
  return Buffer.from(bytes)
}

// Generate a TOTP secret (base32 encoded for authenticator apps)
function generateSecret(): string {
  const buffer = crypto.randomBytes(20)
  return base32Encode(buffer)
}

// Generate TOTP URI for authenticator apps
function generateTOTPUri(secret: string, email: string, issuer: string = "Zuri Market"): string {
  const encodedIssuer = encodeURIComponent(issuer)
  const encodedEmail = encodeURIComponent(email)
  return `otpauth://totp/${encodedIssuer}:${encodedEmail}?secret=${secret}&issuer=${encodedIssuer}&algorithm=SHA1&digits=6&period=30`
}

// Generate HMAC-SHA1 TOTP code (RFC 4226 / RFC 6238 compliant)
function generateHOTP(secret: string, counter: number): string {
  const key = base32Decode(secret)

  // Write counter as 8-byte big-endian
  const counterBuffer = Buffer.alloc(8, 0)
  let temp = counter
  for (let i = 7; i >= 0; i--) {
    counterBuffer[i] = temp & 0xff
    temp = Math.floor(temp / 256)
  }

  const hmac = crypto.createHmac("sha1", key)
  hmac.update(counterBuffer)
  const hash = hmac.digest()

  // Dynamic truncation per RFC 4226
  const lastByte = hash[hash.length - 1]
  if (lastByte === undefined) return "000000"
  const offset = lastByte & 0x0f

  const b1 = hash[offset] ?? 0
  const b2 = hash[offset + 1] ?? 0
  const b3 = hash[offset + 2] ?? 0
  const b4 = hash[offset + 3] ?? 0

  const binary =
    ((b1 & 0x7f) << 24) |
    ((b2 & 0xff) << 16) |
    ((b3 & 0xff) << 8) |
    (b4 & 0xff)

  const otp = binary % 1000000
  return otp.toString().padStart(6, "0")
}

// Verify TOTP code (check current and adjacent time windows)
function verifyTOTP(secret: string, code: string): boolean {
  const timeStep = 30
  const epoch = Math.floor(Date.now() / 1000)
  const counter = Math.floor(epoch / timeStep)

  // Check current time window and ±1 window (90 seconds total)
  for (let i = -1; i <= 1; i++) {
    const testCounter = counter + i
    const expectedCode = generateHOTP(secret, testCounter)
    if (code === expectedCode) return true
  }

  return false
}

// POST - Enable 2FA (generates secret and returns QR code URI)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { action, code } = body

    if (action === "setup") {
      // Generate new secret
      const secret = generateSecret()
      const uri = generateTOTPUri(secret, user.email ?? "")

      // Store secret temporarily (will be confirmed when user verifies code)
      await supabase.auth.updateUser({
        data: {
          two_factor_secret: secret,
          two_factor_pending: true,
        },
      })

      return NextResponse.json({
        secret,
        uri,
        message: "Scan the QR code with your authenticator app, then verify with a code.",
      })
    }

    if (action === "verify" && code) {
      // Get the pending secret from user metadata
      const { data: userData } = await supabase.auth.getUser()
      const secret = userData.user?.user_metadata?.two_factor_secret

      if (!secret) {
        return NextResponse.json({ error: "No pending 2FA setup found" }, { status: 400 })
      }

      // Verify the code
      if (!verifyTOTP(secret, code)) {
        return NextResponse.json({ error: "Invalid verification code" }, { status: 400 })
      }

      // Enable 2FA
      await supabase.auth.updateUser({
        data: {
          two_factor_enabled: true,
          two_factor_secret: secret,
          two_factor_pending: false,
        },
      })

      // Store in profiles table for persistence
      await supabase.from("profiles").update({
        two_factor_enabled: true,
        two_factor_secret: secret,
      }).eq("id", user.id)

      return NextResponse.json({
        message: "Two-factor authentication enabled successfully",
        enabled: true,
      })
    }

    if (action === "disable") {
      await supabase.auth.updateUser({
        data: {
          two_factor_enabled: false,
          two_factor_secret: null,
          two_factor_pending: false,
        },
      })

      await supabase.from("profiles").update({
        two_factor_enabled: false,
        two_factor_secret: null,
      }).eq("id", user.id)

      return NextResponse.json({
        message: "Two-factor authentication disabled",
        enabled: false,
      })
    }

    if (action === "status") {
      const { data: profile } = await supabase
        .from("profiles")
        .select("two_factor_enabled")
        .eq("id", user.id)
        .single()

      return NextResponse.json({
        enabled: profile?.two_factor_enabled ?? false,
      })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("2FA API error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}
