import { tmdb } from '@/lib/tmdb'
import { HeroBanner } from '@/components/core/HeroBanner'
import { BentoGrid } from '@/components/core/BentoGrid'
import { MovieCard } from '@/components/core/MovieCard'
import { NavBar } from '@/components/core/NavBar'
import { GenreFilter } from '@/components/core/GenreFilter'

export default async function Home({ searchParams }: { searchParams: Promise<{ genre?: string }> }) {
  const params = await searchParams
  const genreId = params.genre

  // Fetch data in parallel
  const trendingPromise = tmdb.getTrending().catch(e => { console.error(e); return null })
  const popularPromise = tmdb.getPopular().catch(e => { console.error(e); return null })
  // If genre is selected, fetch discover
  const genrePromise = genreId ? tmdb.getDiscover(genreId).catch(e => { console.error(e); return null }) : Promise.resolve(null)

  const [trendingRes, popularRes, genreRes] = await Promise.all([
    trendingPromise,
    popularPromise,
    genrePromise
  ])

  const heroMovie = trendingRes?.results[0]

  // Decide what to show in the main grid
  let mainMovies = []
  let sectionTitle = "Trending"

  if (genreId && genreRes) {
    mainMovies = genreRes.results
    sectionTitle = "Top Picks"
  } else {
    // Exclude the hero movie if showing trending
    mainMovies = trendingRes?.results.slice(1, 13) || []
  }

  if (!heroMovie) {
    return (
      <main className="min-h-screen bg-background flex flex-col items-center justify-center text-white">
        <NavBar />
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Connection Error</h1>
          <p>Could not fetch movies. Please check your API Key.</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background text-foreground pb-20 overflow-x-hidden">
      <NavBar />
      <HeroBanner movie={heroMovie} />

      <section className="container mx-auto px-4 mt-[-100px] relative z-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 px-2 gap-4">
          <h2 className="text-3xl md:text-5xl font-bold text-white drop-shadow-lg flex-shrink-0">
            {sectionTitle} <span className="text-primary text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Now</span>
          </h2>
          <div className="w-full md:w-auto overflow-hidden">
            <GenreFilter />
          </div>
        </div>

        <BentoGrid>
          {mainMovies.map((movie, i) => {
            // Bento Grid Logic: Make 1st, 5th, 9th items larger (only if not filtered? or always?)
            // Let's keep it for visual interest
            const isLarge = i === 0 || i === 3 || i === 6;
            return (
              <MovieCard
                key={movie.id}
                movie={movie}
                index={i}
                className={isLarge ? "md:col-span-2 md:row-span-2 aspect-square md:aspect-auto" : ""}
                preferBackdrop={isLarge}
              />
            )
          })}
        </BentoGrid>
      </section>

      {/* Popular Section (Only show if not filtering, or keep it?) */}
      {/* Keeping it adds more content */}
      {!genreId && popularRes && (
        <section className="container mx-auto px-4 mt-20">
          <h2 className="text-3xl font-bold text-white mb-6">Popular Hits</h2>
          <BentoGrid>
            {popularRes.results.slice(0, 8).map((movie, i) => (
              <MovieCard key={movie.id} movie={movie} index={i} />
            ))}
          </BentoGrid>
        </section>
      )}
    </main>
  )
}
