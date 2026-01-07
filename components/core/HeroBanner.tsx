'use client'

import { Movie } from '@/types/tmdb'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { tmdb } from '@/lib/tmdb'
import { TrailerButton } from '@/components/core/TrailerButton'
import { Button } from '@/components/ui/button'
import { Info } from 'lucide-react'
import Link from 'next/link'
import { useRef, useState, useEffect } from 'react'

interface HeroBannerProps {
    movies: Movie[]
}

export function HeroBanner({ movies }: HeroBannerProps) {
    const ref = useRef<HTMLDivElement>(null)
    const { scrollY } = useScroll()
    const y = useTransform(scrollY, [0, 500], [0, 200])
    const opacity = useTransform(scrollY, [0, 400], [1, 0])
    const [index, setIndex] = useState(0)

    // Auto-rotate
    useEffect(() => {
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % movies.length)
        }, 4000)
        return () => clearInterval(timer)
    }, [movies.length])

    if (!movies || movies.length === 0) return null
    const movie = movies[index]
    const imageUrl = tmdb.getImageUrl(movie.backdrop_path, 'original')

    return (
        <div ref={ref} className="relative w-full h-[85vh] overflow-hidden bg-black">
            <AnimatePresence initial={false}>
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
                        <div
                            className="absolute inset-0 bg-cover bg-center transition-all duration-1000"
                            style={{ backgroundImage: `url(${imageUrl})` }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent" />
                    </div>

                    {/* Content */}
                    <div className="relative z-10 container mx-auto px-4 h-full flex flex-col justify-center pt-20">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                            className="max-w-2xl"
                        >
                            <h1
                                className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70 tracking-tighter mb-4 drop-shadow-[0_5px_5px_rgba(0,0,0,0.5)]"
                                style={{
                                    textShadow: "0px 4px 10px rgba(0,0,0,0.5), 0px 0px 30px rgba(217,70,239,0.3)",
                                    fontFamily: 'var(--font-playfair)',
                                    letterSpacing: '-0.02em' // Tighter for elegant serif display
                                }}
                            >
                                {movie.title}
                            </h1>

                            <p className="text-lg md:text-xl text-gray-300 line-clamp-3 mb-8 max-w-xl leading-relaxed">
                                {movie.overview}
                            </p>

                            <div className="flex flex-wrap gap-4">
                                <TrailerButton
                                    movieId={movie.id}
                                    movieTitle={movie.title}
                                    variant="hero"
                                />

                                <Link href={`/movie/${movie.id}`}>
                                    <Button size="lg" variant="outline" className="rounded-full border-white/20 hover:bg-white/10 backdrop-blur-sm text-white text-md font-bold px-8">
                                        <Info className="w-5 h-5 mr-2" />
                                        More Info
                                    </Button>
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Indicators */}
            <div className="absolute bottom-8 right-8 z-20 flex gap-2">
                {movies.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setIndex(i)}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${i === index ? 'w-8 bg-primary' : 'bg-white/50 hover:bg-white'}`}
                    />
                ))}
            </div>
        </div>
    )
}
