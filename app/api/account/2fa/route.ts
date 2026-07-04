import { NextRequest, NextResponse } from "next/server"
import { createSupabaseClient } from "../../../../lib/supabase/server"
import crypto from "crypto"

// Generate a TOTP secret (hex-encoded for simplicity)
function generateSecret(): string {
  const buffer = crypto.randomBytes(20)
  return buffer.toString("hex")
}

// Generate TOTP URI for authenticator apps
function generateTOTPUri(secret: string, email: string, issuer: string = "Zuri Market"): string {
  const encodedIssuer = encodeURIComponent(issuer)
  const encodedEmail = encodeURIComponent(email)
  return `otpauth://totp/${encodedIssuer}:${encodedEmail}?secret=${secret}&issuer=${encodedIssuer}&algorithm=SHA1&digits=6&period=30`
}

// Verify TOTP code (check current and adjacent time windows)
function verifyTOTP(secret: string, code: string): boolean {
  const timeStep = 30
  const epoch = Math.floor(Date.now() / 1000)
  const counter = Math.floor(epoch / timeStep)

  // Check current time window and ±1 window (90 seconds total)
  for (let i = -1; i <= 1; i++) {
    const testCounter = counter + i
    const hmac = crypto.createHmac("sha1", Buffer.from(secret, "hex"))
    hmac.update(Buffer.from(testCounter.toString(16).padStart(16, "0")))
    const hash = hmac.digest()

    const offset = (hash[hash.length - 1] ?? 0) & 0x0f
    const generatedCode =
      (((hash[offset] ?? 0) & 0x7f) << 24) |
      (((hash[offset + 1] ?? 0) & 0xff) << 16) |
      (((hash[offset + 2] ?? 0) & 0xff) << 8) |
      ((hash[offset + 3] ?? 0) & 0xff)

    const expectedCode = (generatedCode % 1000000).toString().padStart(6, "0")
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
      if (!verifyTOTP(code, secret)) {
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
