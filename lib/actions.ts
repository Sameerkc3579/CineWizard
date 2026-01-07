'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleLike(movieId: number, movieTitle: string, interactionType: string, pathname: string) {
    const supabase = await createClient()

    // Check auth
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    // Check if exists
    const { data: existing, error: fetchError } = await supabase
        .from('user_interactions')
        .select('id')
        .eq('user_id', user.id)
        .eq('movie_id', movieId)
        .eq('interaction_type', interactionType) // Check for specific interaction type
        .maybeSingle()

    if (fetchError) {
        console.error('Error fetching interaction:', fetchError)
        return { error: fetchError.message }
    }

    if (existing) {
        // Delete
        const { error: deleteError } = await supabase.from('user_interactions').delete().eq('id', existing.id)
        if (deleteError) {
            console.error('Error deleting interaction:', deleteError)
            return { error: deleteError.message }
        }
    } else {
        // Insert
        const { error: insertError } = await supabase.from('user_interactions').insert({
            user_id: user.id,
            movie_id: movieId,
            movie_title: movieTitle,
            interaction_type: interactionType
        })
        if (insertError) {
            console.error('Error inserting interaction:', insertError)
            return { error: insertError.message }
        }
    }

    revalidatePath(pathname)
    revalidatePath('/dashboard')
    return { success: true }
}

import { tmdb } from '@/lib/tmdb'

export async function getTrailer(movieId: number) {
    try {
        const videos = await tmdb.getMovieVideos(movieId)
        const trailer = videos.results.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube')
        return { key: trailer ? trailer.key : (videos.results[0]?.key || null) }
    } catch (e) {
        console.error("Failed to fetch trailer", e)
        return { key: null }
    }
}

export async function updatePreferences(genres: string[]) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Unauthorized' }

    const { error } = await supabase
        .from('profiles')
        .update({ favorite_genres: genres })
        .eq('id', user.id)

    if (error) {
        console.error('Error updating preferences:', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/')
    return { success: true }
}
