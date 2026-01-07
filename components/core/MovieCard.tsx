'use client'

import { Movie } from '@/types/tmdb'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { tmdb } from '@/lib/tmdb'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MovieCardProps {
    movie: Movie
    index?: number
    className?: string
    preferBackdrop?: boolean
}

export function MovieCard({ movie, index = 0, className, preferBackdrop = false }: MovieCardProps) {
    const imageUrl = tmdb.getImageUrl(preferBackdrop && movie.backdrop_path ? movie.backdrop_path : movie.poster_path, 'w500')

    return (
        <Link href={`/movie/${movie.id}`} className={cn("block h-full", className)}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02, y: -5 }}
                className="group relative w-full h-full min-h-[300px] rounded-xl overflow-hidden bg-muted border border-white/5 shadow-sm hover:shadow-[0_0_20px_rgba(217,70,239,0.3)] transition-all duration-300 cursor-pointer"
            >
                <Image
                    src={imageUrl}
                    alt={movie.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                />

                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="text-white font-bold truncate text-lg drop-shadow-md">{movie.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        <span className="text-xs text-gray-300 font-medium">{movie.vote_average.toFixed(1)}</span>
                        <span className="text-xs text-gray-500">•</span>
                        <span className="text-xs text-gray-300">{movie.release_date.split('-')[0]}</span>
                    </div>
                </div>

                {/* Hover Glow Border Effect (CSS pseudo-element simulated via div) */}
                <div className="absolute inset-0 border-2 border-primary/0 group-hover:border-primary/50 rounded-xl transition-colors duration-300 pointer-events-none" />
            </motion.div>
        </Link>
    )
}
