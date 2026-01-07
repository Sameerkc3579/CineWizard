'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleLike(movieId: number, pathname: string) {
    const supabase = await createClient()

    // Check auth
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    // Check if exists
    const { data: existing } = await supabase
        .from('user_interactions')
        .select('id')
        .eq('user_id', user.id)
        .eq('movie_id', movieId)
        .eq('action', 'like')
        .single()

    if (existing) {
        // Delete
        await supabase.from('user_interactions').delete().eq('id', existing.id)
    } else {
        // Insert
        await supabase.from('user_interactions').insert({
            user_id: user.id,
            movie_id: movieId,
            action: 'like'
        })
    }

    revalidatePath(pathname)
    return { success: true }
}
