'use client'

import { Movie } from '@/types/tmdb'
import { motion, useScroll, useTransform } from 'framer-motion'
import { tmdb } from '@/lib/tmdb'
import { Button } from '@/components/ui/button'
import { Play, Info, X } from 'lucide-react'
import Link from 'next/link'
import { useRef, useState } from 'react'
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '@/components/ui/dialog'

interface HeroBannerProps {
    movie: Movie
}

export function HeroBanner({ movie }: HeroBannerProps) {
    const ref = useRef<HTMLDivElement>(null)
    const { scrollY } = useScroll()
    const y = useTransform(scrollY, [0, 500], [0, 200]) // Parallax effect
    const opacity = useTransform(scrollY, [0, 400], [1, 0])
    const [trailerKey, setTrailerKey] = useState<string | null>(null)

    const imageUrl = tmdb.getImageUrl(movie.backdrop_path, 'original')

    const handleWatchTrailer = async () => {
        try {
            const videos = await tmdb.getMovieVideos(movie.id)
            const trailer = videos.results.find(v => v.type === 'Trailer' && v.site === 'YouTube')
            if (trailer) {
                setTrailerKey(trailer.key)
            } else {
                // Fallback to first video or notify
                if (videos.results.length > 0) setTrailerKey(videos.results[0].key)
            }
        } catch (e) {
            console.error("Failed to fetch trailer", e)
        }
    }

    return (
        <div ref={ref} className="relative w-full h-[85vh] overflow-hidden">
            {/* Parallax Background */}
            <motion.div
                style={{ y, opacity }}
                className="absolute inset-0"
            >
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${imageUrl})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent" />
            </motion.div>

            {/* Content */}
            <div className="relative z-10 container mx-auto px-4 h-full flex flex-col justify-center pt-20">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="max-w-2xl"
                >
                    <motion.h1
                        className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70 tracking-tighter mb-4 drop-shadow-[0_5px_5px_rgba(0,0,0,0.5)]"
                        style={{
                            textShadow: "0px 4px 10px rgba(0,0,0,0.5), 0px 0px 30px rgba(217,70,239,0.3)" // Neon glow + 3D-ish shadow
                        }}
                    >
                        {movie.title}
                    </motion.h1>

                    <p className="text-lg md:text-xl text-gray-300 line-clamp-3 mb-8 max-w-xl leading-relaxed">
                        {movie.overview}
                    </p>

                    <div className="flex flex-wrap gap-4">
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button
                                    size="lg"
                                    className="rounded-full bg-white text-black hover:bg-gray-200 text-md font-bold px-8"
                                    onClick={handleWatchTrailer}
                                >
                                    <Play className="w-5 h-5 mr-2 fill-current" />
                                    Watch Trailer
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[800px] border-none bg-black p-0 overflow-hidden text-white">
                                <DialogTitle className="sr-only">Trailer</DialogTitle>
                                <div className="aspect-video w-full bg-black flex items-center justify-center">
                                    {trailerKey ? (
                                        <iframe
                                            width="100%"
                                            height="100%"
                                            src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1`}
                                            title="Movie Trailer"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                            className="w-full h-full"
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center gap-2">
                                            <span className="animate-spin text-primary text-4xl">C</span>
                                            <p>Summoning Trailer...</p>
                                        </div>
                                    )}
                                </div>
                            </DialogContent>
                        </Dialog>

                        <Link href={`/movie/${movie.id}`}>
                            <Button size="lg" variant="outline" className="rounded-full border-white/20 hover:bg-white/10 backdrop-blur-sm text-white text-md font-bold px-8">
                                <Info className="w-5 h-5 mr-2" />
                                More Info
                            </Button>
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
