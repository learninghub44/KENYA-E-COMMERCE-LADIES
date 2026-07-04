"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { createSupabaseBrowserClient } from "../../../lib/supabase/client";
import { resolvePostLoginPath } from "../../../lib/auth/post-login-redirect";
import { normalizeRoles } from "../../../lib/permissions/index";
import type { AppRole } from "../../../types/roles";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

// Roles that satisfy each entry-point. "customer" has no gate — anyone who
// can authenticate lands on the storefront. Seller/admin entry points exist
// for clarity of navigation only; they are NOT a security boundary (the
// middleware + server-side permission checks are what actually protect
// /seller/* and /admin/*). A role mismatch here just means "wrong door" —
// we tell the person and point them to the door that matches their account,
// rather than silently dropping them somewhere unexpected.
const ADMIN_AREA_ROLES: readonly AppRole[] = [
  "super_admin",
  "admin",
  "moderator",
  "kyc_reviewer",
  "support",
];

export type LoginVariant = "customer" | "seller" | "admin";

interface VariantCopy {
  title: string;
  subtitle: string;
  defaultRedirect: string;
  mismatchMessage: string;
  registerHref: string | null;
}

const VARIANT_COPY: Record<LoginVariant, VariantCopy> = {
  customer: {
    title: "Welcome back",
    subtitle: "Sign in to your account",
    defaultRedirect: "/",
    mismatchMessage: "", // no gate for customers
    registerHref: "/auth/register",
  },
  seller: {
    title: "Seller Login",
    subtitle: "Sign in to your Seller Hub",
    defaultRedirect: "/seller",
    mismatchMessage:
      "This account isn't registered as a seller. Sign in at the regular login page, or apply to become a seller.",
    registerHref: "/become-a-seller",
  },
  admin: {
    title: "Admin Login",
    subtitle: "Sign in to the admin console",
    defaultRedirect: "/admin",
    mismatchMessage: "This account doesn't have admin access.",
    registerHref: null,
  },
};

function roleMatchesVariant(variant: LoginVariant, roles: readonly AppRole[]): boolean {
  if (variant === "customer") return true;
  if (variant === "seller") return roles.includes("seller");
  return roles.some((role) => ADMIN_AREA_ROLES.includes(role));
}

export function LoginForm({ variant }: { variant: LoginVariant }) {
  const copy = VARIANT_COPY[variant];
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setAuthError(null);
    const supabase = createSupabaseBrowserClient();
    const { data: signInData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });
    if (error) {
      setAuthError(error.message);
      return;
    }

    let roles: AppRole[] = [];
    if (signInData.user) {
      const { data: roleRows } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", signInData.user.id);
      roles = normalizeRoles((roleRows ?? []).map((row: { role: AppRole }) => row.role));
    }

    // Entry-point gate: this only affects UX (where we send a correctly
    // authenticated user), it is not what protects /seller or /admin — the
    // middleware re-checks permissions server-side on every request there.
    if (!roleMatchesVariant(variant, roles)) {
      await supabase.auth.signOut();
      setAuthError(copy.mismatchMessage);
      return;
    }

    const redirectTo = searchParams.get("redirectTo");
    const destination =
      variant === "customer"
        ? resolvePostLoginPath(roles, redirectTo)
        : redirectTo && redirectTo.startsWith("/") && !redirectTo.startsWith("//")
          ? redirectTo
          : copy.defaultRedirect;

    router.push(destination);
    router.refresh();
  };

  const redirectTo = searchParams.get("redirectTo");
  const registerHref = copy.registerHref
    ? redirectTo
      ? `${copy.registerHref}?redirectTo=${encodeURIComponent(redirectTo)}`
      : copy.registerHref
    : null;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <Link href="/" className="text-2xl font-bold tracking-tight">
            Zuri Market
          </Link>
          <h1 className="mt-6 text-2xl font-semibold tracking-tight">{copy.title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{copy.subtitle}</p>
        </div>

        <div className="space-y-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {authError && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {authError}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="pl-10"
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs text-muted-foreground hover:text-primary"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="pl-10 pr-10"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </div>

        {variant === "customer" && registerHref && (
          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href={registerHref} className="font-medium text-primary hover:underline">
              Create one
            </Link>
          </p>
        )}

        {variant === "seller" && registerHref && (
          <p className="text-center text-sm text-muted-foreground">
            Not a seller yet?{" "}
            <Link href={registerHref} className="font-medium text-primary hover:underline">
              Apply here
            </Link>
          </p>
        )}

        {variant !== "admin" && (
          <p className="text-center text-xs text-muted-foreground">
            {variant === "seller" ? (
              <>
                Buyer instead?{" "}
                <Link href="/auth/login" className="hover:text-primary hover:underline">
                  Sign in here
                </Link>
              </>
            ) : (
              <>
                Selling on Zuri Market?{" "}
                <Link href="/seller/login" className="hover:text-primary hover:underline">
                  Seller login
                </Link>
              </>
            )}
          </p>
        )}
      </div>
    </div>
  );
}
