'use server'

import { getAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function getUsers() {
    try {
        const supabase = getAdminClient()

        // 1. Fetch Auth Users
        const { data: { users: authUsers }, error: authError } = await supabase.auth.admin.listUsers()

        if (authError) {
            console.error('Error fetching auth users:', authError)
            return []
        }

        // 2. Fetch Profiles from public table
        const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('*')

        if (profilesError) {
            console.error('Error fetching profiles:', profilesError)
        }

        // 3. Merge Data
        // Create a map of profiles for faster lookup
        const profileMap = new Map(profiles?.map(p => [p.id, p]) || [])

        const combinedUsers = authUsers.map(user => {
            const profile = profileMap.get(user.id)
            return {
                ...user,
                // Add profile fields (safely access in case profile is missing)
                username: profile?.username || null,
                full_name: profile?.full_name || null, // Assuming full_name exists in profiles, if not, adjust
                avatar_url: profile?.avatar_url || null,
            }
        })

        return combinedUsers
    } catch (error) {
        console.error('Error in getUsers (likely missing env vars):', error)
        return [] // Return empty array so page doesn't crash
    }
}

export async function deleteUser(userId: string) {
    try {
        const supabase = getAdminClient()
        const { error } = await supabase.auth.admin.deleteUser(userId)

        if (error) {
            throw error
        }

        revalidatePath('/admin')
        return { success: true }
    } catch (error: any) {
        return { success: false, error: error.message }
    }
}
