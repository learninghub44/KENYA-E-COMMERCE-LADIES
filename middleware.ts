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

// Seller Hub is a single permission surface: only the "seller" role carries
// "seller.profile.manage" (see lib/roles/index.ts), so every /seller/* page is
// covered by this one check without needing a per-route map.
const SELLER_ROUTE_PERMISSION: Permission = "seller.profile.manage";

// Where to send a signed-in user who does NOT hold the required role for the
// section they tried to reach, instead of the generic "/" bounce that silently
// hides why access was denied.
const DENIED_REDIRECT: Record<"admin" | "seller", string> = {
  admin: "/",
  seller: "/become-a-seller",
};

function permissionForPath(pathname: string): Permission | "admin.access" {
  for (const { prefix, permission } of ADMIN_ROUTE_PERMISSIONS) {
    if (pathname === prefix || pathname.startsWith(prefix + "/")) return permission;
  }
  if (pathname === "/admin") return "admin.access";
  // Analytics, business intelligence, search analytics, notifications, settings, platform/* —
  // general-admin-only surface area.
  return "admin.role.manage";
}

function sectionForPath(pathname: string): "admin" | "seller" | null {
  if (pathname.startsWith("/admin")) return "admin";
  if (pathname.startsWith("/seller")) return "seller";
  return null;
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const section = sectionForPath(pathname);
  if (!section) return NextResponse.next();

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

  const required = section === "admin" ? permissionForPath(pathname) : SELLER_ROUTE_PERMISSION;
  if (!hasPermission(roles, required)) {
    return NextResponse.redirect(new URL(DENIED_REDIRECT[section], request.url));
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*", "/seller/:path*"],
};
