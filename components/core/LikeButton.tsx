'use client'

import { useState } from 'react'
import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { toggleLike } from '@/lib/actions'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface LikeButtonProps {
    movieId: number
    initialLiked?: boolean
}

export function LikeButton({ movieId, initialLiked = false }: LikeButtonProps) {
    const [liked, setLiked] = useState(initialLiked)
    const [loading, setLoading] = useState(false)
    const pathname = usePathname()
    const supabase = createClient()

    const handleToggle = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        // Check auth client-side first for immediate feedback
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            // Trigger login modal? Or just alert
            alert("Please sign in to like movies!")
            return
        }

        // Optimistic update
        setLiked(!liked)
        setLoading(true)

        try {
            const result = await toggleLike(movieId, pathname)
            if (result && 'error' in result && result.error) {
                throw new Error(result.error)
            }
        } catch (error: any) {
            setLiked(!liked) // Revert
            console.error(error)
            alert("Error: " + error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={handleToggle}
            disabled={loading}
            className={cn(
                "rounded-full transition-all duration-300 hover:scale-110 active:scale-95",
                liked ? "bg-red-500/10 text-red-500 hover:bg-red-500/20" : "bg-white/10 hover:bg-white/20 text-white"
            )}
        >
            <motion.div
                animate={liked ? { scale: [1, 1.5, 1] } : { scale: 1 }}
                transition={{ duration: 0.3 }}
            >
                <Heart className={cn("w-6 h-6", liked && "fill-current")} />
            </motion.div>
        </Button>
    )
}
