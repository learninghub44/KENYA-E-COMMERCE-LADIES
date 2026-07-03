import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { normalizeRoles } from "../../../lib/permissions/index"
import { resolvePostLoginPath } from "../../../lib/auth/post-login-redirect"
import type { AppRole } from "../../../types/roles"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next")

  if (!code) {
    return NextResponse.redirect(new URL("/auth/login?error=no_code", request.url))
  }

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    return NextResponse.redirect(new URL("/auth/login?error=auth_error", request.url))
  }

  // Same role-based landing as password login (see lib/auth/post-login-redirect.ts):
  // OAuth users go to /admin, /seller, or / depending on role, or to an
  // explicit next target when one was set before the Google redirect.
  let roles: AppRole[] = []
  if (data.user) {
    const { data: roleRows } = await supabase.from("user_roles").select("role").eq("user_id", data.user.id)
    roles = normalizeRoles((roleRows ?? []).map((row: { role: AppRole }) => row.role))
  }

  return NextResponse.redirect(new URL(resolvePostLoginPath(roles, next), request.url))
}
