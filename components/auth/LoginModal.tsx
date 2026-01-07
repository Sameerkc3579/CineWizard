'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Github, Mail } from 'lucide-react'
import { useState } from 'react'
import { useStore } from '@/store/useStore' // Assuming we might want to trigger it from store? Or just props.

interface LoginModalProps {
    isOpen: boolean
    onClose: () => void
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
    const [loading, setLoading] = useState(false)
    const supabase = createClient()

    const handleLogin = async (provider: 'google' | 'github') => {
        setLoading(true)
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`
                }
            })
            if (error) throw error
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-[#0a0a0a] border-white/10 text-white">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                        Welcome Back
                    </DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Sign in to save movies and see your personalized dashboard.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-4 py-4">
                    <Button
                        variant="outline"
                        onClick={() => handleLogin('google')}
                        disabled={loading}
                        className="w-full bg-white text-black hover:bg-gray-200 border-none h-12 text-md font-bold"
                    >
                        <Mail className="mr-2 h-5 w-5" />
                        Sign in with Google
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => handleLogin('github')}
                        disabled={loading}
                        className="w-full bg-[#333] border-none text-white hover:bg-[#444] h-12 text-md font-bold"
                    >
                        <Github className="mr-2 h-5 w-5" />
                        Sign in with GitHub
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
