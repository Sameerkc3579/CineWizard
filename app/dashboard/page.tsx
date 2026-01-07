import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { tmdb } from '@/lib/tmdb'
import { MovieCard } from '@/components/core/MovieCard'
import { NavBar } from '@/components/core/NavBar'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function Dashboard() {
    const supabase = await createClient()

    // Verify Auth
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/')
    }

    // Fetch liked movies from Supabase
    const { data: interactions } = await supabase
        .from('user_interactions')
        .select('movie_id')
        .eq('user_id', user.id)

    const movieIds = interactions?.map(i => i.movie_id) || []

    const movies = await Promise.all(
        movieIds.map(id => tmdb.getMovieDetails(id).catch(e => null))
    )

    const validMovies = movies.filter(Boolean) as any[]

    return (
        <main className="min-h-screen bg-background text-foreground">
            <NavBar />
            <div className="container mx-auto px-4 py-24">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">My Library</h1>
                    <div className="text-sm text-gray-500">{user ? user.email : 'Guest Mode'}</div>
                </div>

                {validMovies.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {validMovies.map((m, i) => (
                            <MovieCard key={m.id} movie={m} index={i} />
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-400">No movies liked yet.</p>
                )}
            </div>
        </main>
    )
}
