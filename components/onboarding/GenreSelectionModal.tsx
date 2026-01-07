'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { updatePreferences } from '@/lib/actions'
import { cn } from '@/lib/utils'
import { Check, Clapperboard } from 'lucide-react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

const GENRES = [
    "Action", "Adventure", "Animation", "Comedy", "Crime",
    "Documentary", "Drama", "Family", "Fantasy", "History",
    "Horror", "Music", "Mystery", "Romance", "Science Fiction",
    "Thriller", "War", "Western"
]

interface GenreSelectionModalProps {
    isOpen: boolean
    userId: string
}

export function GenreSelectionModal({ isOpen, userId }: GenreSelectionModalProps) {
    const [selectedGenres, setSelectedGenres] = useState<string[]>([])
    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(isOpen)
    const router = useRouter()

    const toggleGenre = (genre: string) => {
        if (selectedGenres.includes(genre)) {
            setSelectedGenres(selectedGenres.filter(g => g !== genre))
        } else {
            if (selectedGenres.length >= 5) return // Limit to 5
            setSelectedGenres([...selectedGenres, genre])
        }
    }

    const handleSave = async () => {
        if (selectedGenres.length === 0) return

        setLoading(true)
        try {
            const result = await updatePreferences(selectedGenres)
            if (result.success) {
                setOpen(false)
                router.refresh()
            } else {
                alert('Failed to save preferences. Please try again.')
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={() => { }}>
            <DialogContent className="sm:max-w-3xl bg-[#0a0a0a] border-white/10 text-white p-0 gap-0 overflow-hidden [&>button]:hidden">
                <div className="p-8">
                    <DialogHeader className="mb-6">
                        <motion.div
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="flex items-center gap-3 mb-2"
                        >
                            <div className="p-3 rounded-xl bg-primary/20 text-primary">
                                <Clapperboard className="w-6 h-6" />
                            </div>
                            <DialogTitle className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
                                Personalize Your Experience
                            </DialogTitle>
                        </motion.div>
                        <DialogDescription className="text-lg text-gray-400">
                            Select up to 5 genres you love, and we'll tailor recommendations just for you.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-8">
                        {GENRES.map((genre) => {
                            const isSelected = selectedGenres.includes(genre)
                            return (
                                <motion.button
                                    key={genre}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => toggleGenre(genre)}
                                    className={cn(
                                        "relative h-14 rounded-xl border flex items-center justify-center font-medium transition-all duration-300",
                                        isSelected
                                            ? "bg-primary border-primary text-white shadow-[0_0_15px_rgba(217,70,239,0.4)]"
                                            : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20"
                                    )}
                                >
                                    {genre}
                                    {isSelected && (
                                        <div className="absolute top-2 right-2">
                                            <Check className="w-3 h-3" />
                                        </div>
                                    )}
                                </motion.button>
                            )
                        })}
                    </div>

                    <div className="flex justify-end gap-3">
                        <div className="text-sm text-gray-500 self-center mr-auto">
                            {selectedGenres.length} / 5 selected
                        </div>
                        <Button
                            onClick={handleSave}
                            disabled={loading || selectedGenres.length === 0}
                            className="bg-white text-black hover:bg-gray-200 font-bold px-8 h-12 rounded-full text-md transition-all"
                        >
                            {loading ? 'Saving...' : 'Start Exploring'}
                        </Button>
                    </div>
                </div>

                {/* Decorative background gradients */}
                <div className="absolute top-0 right-0 p-32 bg-primary/10 blur-[100px] -z-10 rounded-full" />
                <div className="absolute bottom-0 left-0 p-32 bg-blue-500/10 blur-[100px] -z-10 rounded-full" />
            </DialogContent>
        </Dialog>
    )
}
