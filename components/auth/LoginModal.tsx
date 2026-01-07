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

    const [email, setEmail] = useState('')
    const [message, setMessage] = useState('')

    const handleLogin = async (provider: 'google' | 'github') => {
        setLoading(true)
        setMessage('')
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
            alert(e.message || "An error occurred during login")
        } finally {
            setLoading(false)
        }
    }

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage('')
        try {
            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`
                }
            })
            if (error) throw error
            setMessage('Check your email for the magic link!')
        } catch (e: any) {
            alert(e.message)
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
                    {message ? (
                        <div className="p-3 bg-green-500/10 text-green-500 rounded-md text-sm text-center">
                            {message}
                        </div>
                    ) : (
                        <form onSubmit={handleEmailLogin} className="flex flex-col gap-2">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="w-full bg-[#333] border-none text-white p-3 rounded-md focus:ring-2 focus:ring-primary outline-none"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            <Button
                                type="submit"
                                variant="default"
                                disabled={loading}
                                className="w-full bg-primary hover:bg-primary/80 text-white font-bold"
                            >
                                Send Magic Link
                            </Button>
                        </form>
                    )}

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-white/10" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-[#0a0a0a] px-2 text-muted-foreground">Or continue with</span>
                        </div>
                    </div>

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
