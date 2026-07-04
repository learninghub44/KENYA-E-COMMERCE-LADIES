import type { SupabaseClient } from "@supabase/supabase-js"
import type { ProfileRepository } from "./types"

export function createSupabaseProfileRepository(client: SupabaseClient): ProfileRepository {
  return {
    async findByUserId(userId: string) {
      const { data, error } = await client
        .from("profiles")
        .select("id, email, display_name, phone, avatar_url")
        .eq("id", userId)
        .maybeSingle()

      if (error) throw new Error(`Failed to load profile: ${error.message}`)
      if (!data) return null

      return {
        id: data.id as string,
        email: data.email as string,
        displayName: data.display_name as string | null,
        phone: data.phone as string | null,
        avatarUrl: data.avatar_url as string | null,
      }
    },

    async updateProfile(input) {
      const values: Record<string, unknown> = {}
      if (input.displayName !== undefined) values.display_name = input.displayName
      if (input.email !== undefined) values.email = input.email
      if (input.phone !== undefined) values.phone = input.phone
      if (input.avatarUrl !== undefined) values.avatar_url = input.avatarUrl

      const { error } = await client.from("profiles").update(values).eq("id", input.userId)
      if (error) throw new Error(`Failed to update profile: ${error.message}`)
    },

    async createProfile(input) {
      const { error } = await client.from("profiles").insert({
        id: input.id,
        email: input.email,
        display_name: input.fullName ?? null,
      })
      if (error) throw new Error(`Failed to create profile: ${error.message}`)
    },

    async setProfileStatus(userId, status) {
      const { error } = await client.from("profiles").update({ status }).eq("id", userId)
      if (error) throw new Error(`Failed to set profile status: ${error.message}`)
    },
  }
}
