"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
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

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
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

    // Previously this always sent everyone to "/", regardless of role, so a
    // seller or admin logging in still landed on the storefront homepage
    // instead of their own dashboard. Look up their roles and route
    // accordingly, honoring an explicit redirectTo (e.g. from middleware
    // bouncing an unauthenticated visit to a protected page) when present.
    let roles: AppRole[] = [];
    if (signInData.user) {
      const { data: roleRows } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", signInData.user.id);
      roles = normalizeRoles((roleRows ?? []).map((row: { role: AppRole }) => row.role));
    }

    const destination = resolvePostLoginPath(roles, searchParams.get("redirectTo"));
    router.push(destination);
    router.refresh();
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <Link href="/" className="text-2xl font-bold tracking-tight">
            Zuri Market
          </Link>
          <h1 className="mt-6 text-2xl font-semibold tracking-tight">Welcome back</h1>
          <p className="mt-2 text-sm text-muted-foreground">Sign in to your account</p>
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

        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href={
              searchParams.get("redirectTo")
                ? `/auth/register?redirectTo=${encodeURIComponent(searchParams.get("redirectTo")!)}`
                : "/auth/register"
            }
            className="font-medium text-primary hover:underline"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
