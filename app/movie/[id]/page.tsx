import { tmdb } from '@/lib/tmdb'
import { NavBar } from '@/components/core/NavBar'
import { LikeButton } from '@/components/core/LikeButton'
import { TrailerButton } from '@/components/core/TrailerButton'
import { MovieCard } from '@/components/core/MovieCard'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'

export default async function MoviePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const movieId = parseInt(id)

    const [movie, recommendations, credits] = await Promise.all([
        tmdb.getMovieDetails(movieId).catch(() => null),
        tmdb.getRecommendations(movieId).catch(() => null),
        tmdb.getMovieCredits(movieId).catch(() => null)
    ])

    if (!movie) {
        return (
            <div className="min-h-screen flex items-center justify-center text-white">
                <h1>Movie Not Found</h1>
            </div>
        )
    }

    const backdropUrl = tmdb.getImageUrl(movie.backdrop_path, 'original')
    const posterUrl = tmdb.getImageUrl(movie.poster_path, 'w500')
    const recs = recommendations?.results || []
    const director = credits?.crew.find(c => c.job === 'Director')

    return (
        <main className="min-h-screen bg-background text-foreground pb-20 overflow-x-hidden">
            <NavBar />

            {/* Hero / Header */}
            <div className="relative w-full h-[60vh] md:h-[70vh]">
                <div className="absolute inset-0">
                    <Image
                        src={backdropUrl}
                        alt={movie.title}
                        fill
                        className="object-cover opacity-60"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
                </div>

                <div className="absolute bottom-0 left-0 right-0 container mx-auto px-4 pb-12 flex flex-col md:flex-row items-end gap-8">
                    <div className="relative shrink-0 hidden md:block w-64 aspect-[2/3] rounded-xl overflow-hidden shadow-2xl border border-white/10 group">
                        <Image src={posterUrl} alt={movie.title} fill className="object-cover" />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                    </div>

                    <div className="flex-1 mb-4">
                        <div className="flex items-center gap-4 mb-4">
                            <Badge variant="outline" className="text-primary border-primary">{movie.status}</Badge>
                            {movie.vote_average > 0 && (
                                <span className="text-yellow-400 font-bold flex items-center gap-1">
                                    ★ {movie.vote_average.toFixed(1)}
                                </span>
                            )}
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-white mb-2 drop-shadow-lg">{movie.title}</h1>
                        <p className="text-xl text-gray-300 italic mb-6">{movie.tagline}</p>

                        <div className="flex flex-wrap gap-2 mb-6">
                            {movie.genres.map(g => (
                                <Badge key={g.id} variant="secondary" className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-md">
                                    {g.name}
                                </Badge>
                            ))}
                        </div>

                        <div className="flex gap-4">
                            <TrailerButton movieId={movie.id} movieTitle={movie.title} />
                            <LikeButton movieId={movie.id} movieTitle={movie.title} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-12">
                {/* Main Info */}
                <div className="md:col-span-2 space-y-8">
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">Overview</h2>
                        <p className="text-gray-300 leading-relaxed text-lg">{movie.overview}</p>
                    </section>

                    {/* Cast */}
                    <section>
                        <h2 className="text-2xl font-bold text-white mb-4">Top Cast</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {credits?.cast.slice(0, 8).map(actor => (
                                <a
                                    key={actor.id}
                                    href={`https://www.google.com/search?q=${encodeURIComponent(actor.name + " actor")}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-white/5 p-3 rounded-lg flex items-center gap-3 hover:bg-white/10 transition-colors cursor-pointer group"
                                >
                                    <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-700 shrink-0 border border-transparent group-hover:border-primary transition-colors">
                                        {actor.profile_path ? (
                                            <Image src={tmdb.getImageUrl(actor.profile_path, 'w300')} alt={actor.name} fill className="object-cover" />
                                        ) : <div className="w-full h-full flex items-center justify-center text-xs">?</div>}
                                    </div>
                                    <div>
                                        <p className="text-white font-medium text-sm line-clamp-1 group-hover:text-primary transition-colors">{actor.name}</p>
                                        <p className="text-gray-400 text-xs line-clamp-1">{actor.character}</p>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <div className="bg-white/5 p-6 rounded-xl border border-white/5 backdrop-blur-sm">
                        <h3 className="text-lg font-bold text-white mb-4">Info</h3>
                        <div className="space-y-4 text-sm">
                            {director && (
                                <div>
                                    <p className="text-gray-500">Director</p>
                                    <p className="text-white font-medium">{director.name}</p>
                                </div>
                            )}
                            <div>
                                <p className="text-gray-500">Runtime</p>
                                <p className="text-white font-medium">{Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Release Date</p>
                                <p className="text-white font-medium">{movie.release_date}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Budget</p>
                                <p className="text-white font-medium">${(movie.budget / 1000000).toFixed(1)}M</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recommendations (The Predictor) */}
            {recs.length > 0 && (
                <section className="container mx-auto px-4 py-12 border-t border-white/10">
                    <h2 className="text-3xl font-bold text-white mb-8">Because you watched <span className="text-primary">{movie.title}</span></h2>
                    <div className="flex overflow-x-auto pb-8 gap-6 snap-x hide-scrollbar">
                        {recs.map((m, i) => (
                            <div key={m.id} className="min-w-[200px] w-[200px] snap-start">
                                <MovieCard movie={m} index={i} className="" />
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </main>
    )
}
