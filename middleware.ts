import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { AppRole } from "./types/roles";
import type { Permission } from "./types/permissions";
import { hasPermission, normalizeRoles } from "./lib/permissions/index";

// Maps admin sub-sections to the permission required to view them. Any prefix not listed
// here falls back to "admin.role.manage" (admin / super_admin only) as the safe default,
// so a new /admin/* page is protected automatically even if this map isn't updated.
const ADMIN_ROUTE_PERMISSIONS: Array<{ prefix: string; permission: Permission }> = [
  { prefix: "/admin/kyc", permission: "kyc.review" },
  { prefix: "/admin/moderation", permission: "admin.moderate" },
  { prefix: "/admin/reviews", permission: "admin.moderate" },
  { prefix: "/admin/products", permission: "admin.moderate" },
  { prefix: "/admin/users", permission: "user.manage" },
  { prefix: "/admin/sellers", permission: "user.manage" },
  { prefix: "/admin/orders", permission: "order.manage" },
];

function permissionForPath(pathname: string): Permission | "admin.access" {
  for (const { prefix, permission } of ADMIN_ROUTE_PERMISSIONS) {
    if (pathname === prefix || pathname.startsWith(prefix + "/")) return permission;
  }
  if (pathname === "/admin") return "admin.access";
  // Analytics, business intelligence, search analytics, notifications, settings, platform/* —
  // general-admin-only surface area.
  return "admin.role.manage";
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  if (!pathname.startsWith("/admin")) return NextResponse.next();

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const { data: roleRows } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
  const roles = normalizeRoles((roleRows ?? []).map((row: { role: AppRole }) => row.role));

  const required = permissionForPath(pathname);
  if (!hasPermission(roles, required)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
