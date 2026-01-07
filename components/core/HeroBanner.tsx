'use client'

import { Movie } from '@/types/tmdb'
import { motion, AnimatePresence } from 'framer-motion'
import { tmdb } from '@/lib/tmdb'
import { TrailerButton } from '@/components/core/TrailerButton'
import { Button } from '@/components/ui/button'
import { Info } from 'lucide-react'
import Link from 'next/link'
import { useRef, useState, useEffect } from 'react'
import { div } from 'framer-motion/client'

interface HeroBannerProps {
    movies: Movie[]
}

export function HeroBanner({ movies }: HeroBannerProps) {
    const ref = useRef<HTMLDivElement>(null)
    const [index, setIndex] = useState(0)

    // Auto-rotate the hero movie every 8 seconds
    useEffect(() => {
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % movies.length)
        }, 8000)
        return () => clearInterval(timer)
    }, [movies.length])

    // Safety check if no movies are passed
    if (!movies || movies.length === 0) return null

    const movie = movies[index]

    return (
        <div ref={ref} className="relative w-full h-[80vh] md:h-[85vh] overflow-hidden bg-black">
            <AnimatePresence initial={false} mode='wait'>
                <motion.div
                    key={movie.id}
                    initial={{ opacity: 0, x: "100%" }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: "-100%" }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    className="absolute inset-0 w-full h-full"
                >
                    {/* Parallax Background Container */}
                    <div className="absolute inset-0 w-full h-full">
                        {/* Desktop Image (Backdrop - Cover) */}
                        <div
                            className="hidden md:block absolute inset-0 bg-cover bg-center transition-all duration-1000"
                            style={{ backgroundImage: `url(${tmdb.getImageUrl(movie.backdrop_path, 'original')})` }}
                        />

                        {/* Mobile: Tumbler/Blurred Background (Fills entire screen for ambience) */}
                        <div
                            className="block md:hidden absolute inset-0 bg-cover bg-center opacity-30 blur-2xl scale-110 transition-all duration-1000"
                            style={{ backgroundImage: `url(${tmdb.getImageUrl(movie.poster_path, 'w500')})` }}
                        />

                        {/* Mobile: Main Poster (Restricted to Top 70% to reserve space for content below) */}
                        <div
                            className="block md:hidden absolute top-4 left-0 right-0 h-[65%] bg-contain bg-center bg-no-repeat transition-all duration-1000 z-0"
                            style={{ backgroundImage: `url(${tmdb.getImageUrl(movie.poster_path, 'w780')})` }}
                        />

                        {/* Gradients */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-transparent" />
                    </div>

                    {/* --- CONTENT LAYER --- */}
                    <div className="relative z-10 container mx-auto px-4 h-full flex flex-col justify-end md:justify-center pb-24 md:pb-0">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="max-w-2xl"
                        >
                            {/* Movie Title */}
                            <h1
                                className="text-4xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70 tracking-tighter mb-4"
                                style={{
                                    textShadow: "0px 4px 10px rgba(0,0,0,0.5)",
                                    fontFamily: 'var(--font-playfair)', // Ensure this font exists in your global CSS
                                }}
                            >
                                {movie.title}
                            </h1>

                            {/* Overview Text */}
                            <p className="text-sm md:text-xl text-gray-300 line-clamp-3 mb-6 md:mb-8 max-w-xl leading-relaxed drop-shadow-md">
                                {movie.overview}
                            </p>

                            {/* Action Buttons */}
                            <div className="flex flex-wrap gap-4">
                                <TrailerButton
                                    movieId={movie.id}
                                    movieTitle={movie.title}
                                    variant="hero"
                                />

                                <Link href={`/movie/${movie.id}`}>
                                    <Button size="lg" variant="outline" className="rounded-full border-white/20 hover:bg-white/10 backdrop-blur-sm text-white text-md font-bold px-8 h-12 md:h-14">
                                        <Info className="w-5 h-5 mr-2" />
                                        More Info
                                    </Button>
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Pagination Dots (Bottom Right) */}
            <div className="absolute bottom-8 right-8 z-20 flex gap-2">
                {movies.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setIndex(i)}
                        className={`h-1.5 rounded-full transition-all duration-300 ${i === index ? 'w-8 bg-primary' : 'w-2 bg-white/30 hover:bg-white'}`}
                        aria-label={`Go to slide ${i + 1}`}
                    />
                ))}
            </div>
        </div >
    )
}