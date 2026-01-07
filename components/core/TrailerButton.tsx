'use client'

import { useState } from 'react'
import { Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { getTrailer } from '@/lib/actions'
import { cn } from '@/lib/utils'

interface TrailerButtonProps {
    movieId: number
    movieTitle: string
    variant?: 'default' | 'outline' | 'ghost' | 'hero'
    className?: string
}

export function TrailerButton({ movieId, movieTitle, variant = 'default', className }: TrailerButtonProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [trailerKey, setTrailerKey] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const handleWatchTrailer = async () => {
        setIsOpen(true)
        if (trailerKey) return // Already fetched

        setLoading(true)
        try {
            const { key } = await getTrailer(movieId)
            if (key) {
                setTrailerKey(key)
            }
        } catch (e) {
            console.error("Failed to fetch trailer", e)
        } finally {
            setLoading(false)
        }
    }

    const buttonStyles = {
        default: "rounded-full",
        hero: "rounded-full bg-white text-black hover:bg-gray-200 text-md font-bold px-8",
        outline: "rounded-full border-white/20 hover:bg-white/10",
        ghost: "rounded-full hover:bg-white/10"
    }

    return (
        <>
            <Button
                size={variant === 'hero' ? 'lg' : 'default'}
                variant={variant === 'hero' ? 'default' : variant as any}
                className={cn(buttonStyles[variant as keyof typeof buttonStyles] || buttonStyles.default, className)}
                onClick={handleWatchTrailer}
            >
                <Play className={cn("w-5 h-5 mr-2", variant === 'hero' ? "fill-current" : "")} />
                Watch Trailer
            </Button>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="sm:max-w-[800px] border-none bg-black p-0 overflow-hidden text-white">
                    <DialogTitle className="sr-only">Trailer for {movieTitle}</DialogTitle>
                    <div className="aspect-video w-full bg-black flex items-center justify-center">
                        {trailerKey ? (
                            <iframe
                                width="100%"
                                height="100%"
                                src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1`}
                                title={`Trailer for ${movieTitle}`}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                className="w-full h-full"
                            />
                        ) : (
                            <div className="flex flex-col items-center gap-2">
                                {loading ? (
                                    <>
                                        <span className="animate-spin text-primary text-4xl">C</span>
                                        <p>Summoning Trailer...</p>
                                    </>
                                ) : (
                                    <p className="text-gray-400">Trailer unavailable</p>
                                )}
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}
