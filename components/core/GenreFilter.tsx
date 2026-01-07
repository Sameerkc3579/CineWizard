'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'

const GENRES = [
    { id: 28, name: "Action" },
    { id: 878, name: "Sci-Fi" },
    { id: 16, name: "Anime" },
    { id: 53, name: "Thriller" },
    { id: 35, name: "Comedy" },
    { id: 27, name: "Horror" },
    { id: 18, name: "Drama" },
    { id: 12, name: "Adventure" },
]

export function GenreFilter() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const currentGenre = searchParams.get('genre')

    const handleGenre = (id: number) => {
        if (currentGenre === id.toString()) {
            router.push('/')
        } else {
            router.push(`/?genre=${id}`)
        }
    }

    return (
        <div className="flex gap-3 overflow-x-auto py-4 hide-scrollbar mask-gradient-sides">
            {GENRES.map(g => (
                <button
                    key={g.id}
                    onClick={() => handleGenre(g.id)}
                    className={cn(
                        "px-6 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap border backdrop-blur-md",
                        currentGenre === g.id.toString()
                            ? "bg-primary border-primary text-black shadow-[0_0_20px_rgba(217,70,239,0.5)] scale-105"
                            : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:border-white/30 hover:text-white"
                    )}
                >
                    {g.name}
                </button>
            ))}
        </div>
    )
}
