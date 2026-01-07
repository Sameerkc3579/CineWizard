'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Mail } from 'lucide-react'
import { useState } from 'react'

interface LoginModalProps {
    isOpen: boolean
    onClose: () => void
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
    const [loading, setLoading] = useState(false)
    const supabase = createClient()

    const handleLogin = async (provider: 'google') => {
        setLoading(true)
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'select_account'
                    }
                }
            })
            if (error) throw error
        } catch (e: any) {
            console.error(e)
            if (e.message?.includes('provider is not enabled')) {
                alert("⚠️ CONFIGURATION ERROR: You must enable Google in your Supabase Dashboard -> Authentication -> Providers.")
            } else {
                alert(e.message || "An error occurred during login")
            }
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
                </div>
            </DialogContent>
        </Dialog>
    )
}
