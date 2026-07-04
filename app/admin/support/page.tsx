import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { createSupabaseClient } from "../../../lib/supabase/server"
import { SupportClient } from "./support-client"

export const metadata: Metadata = {
  title: "Support Tickets — Admin",
  description: "Manage customer support tickets",
}

export default async function SupportPage() {
  const supabase = await createSupabaseClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  const { data: roleRows } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)

  const roles = (roleRows ?? []).map((r: { role: string }) => r.role)
  const isAdmin = roles.some((r) => ["admin", "super_admin", "support"].includes(r))

  if (!isAdmin) {
    redirect("/")
  }

  return <SupportClient />
}
