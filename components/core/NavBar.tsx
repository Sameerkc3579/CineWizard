'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Heart, User, Sparkles } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { cn } from '@/lib/utils'
import { tmdb } from '@/lib/tmdb'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import { createClient } from '@/lib/supabase/client'
import { LoginModal } from '@/components/auth/LoginModal'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

export function NavBar() {
    const { isSearchOpen, setSearchOpen, searchQuery, setSearchQuery } = useStore()
    const [scrolled, setScrolled] = useState(false)
    const [searchResults, setSearchResults] = useState<any[]>([])
    const [isSearching, setIsSearching] = useState(false)
    const [isLoginOpen, setIsLoginOpen] = useState(false)
    const [user, setUser] = useState<any>(null)
    const supabase = createClient()

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)
        }
        getUser()

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null)
        })
        return () => subscription.unsubscribe()
    }, [])

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    // Debounced Search ... (existing code)
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchQuery.length > 2) {
                setIsSearching(true)
                try {
                    const res = await tmdb.searchMovies(searchQuery)
                    setSearchResults(res.results.slice(0, 5))
                } catch (error) {
                    console.error(error)
                } finally {
                    setIsSearching(false)
                }
            } else {
                setSearchResults([])
            }
        }, 500)

        return () => clearTimeout(delayDebounceFn)
    }, [searchQuery])

    const handleSignOut = async () => {
        await supabase.auth.signOut()
    }

    return (
        <>
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.5 }}
                className={cn(
                    "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-transparent",
                    scrolled ? "bg-background/60 backdrop-blur-xl border-white/5 py-3" : "bg-transparent py-5"
                )}
            >
                <div className="container mx-auto px-4 flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="group flex items-center gap-2">
                        <div className="relative w-8 h-8 flex items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary group-hover:shadow-[0_0_15px_rgba(217,70,239,0.5)] transition-shadow">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-2xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 group-hover:to-primary transition-all">
                            CineWizard
                        </span>
                    </Link>

                    {/* Center Search (Desktop) */}
                    <div className="hidden md:flex flex-1 max-w-md mx-8 relative">
                        {/* ... Search Input ... */}
                        <div className="relative w-full group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            </div>
                            <Input
                                type="text"
                                placeholder="Search movies..."
                                className="pl-10 bg-white/5 border-white/10 focus:border-primary/50 focus:bg-black/80 rounded-full transition-all duration-300"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        {/* Search Results Dropdown */}
                        <AnimatePresence>
                            {(searchResults.length > 0 || (searchQuery.length > 2 && isSearching)) && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="absolute top-full left-0 right-0 mt-2 bg-[#0a0a0a] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50"
                                >
                                    {isSearching ? (
                                        <div className="p-4 text-center text-sm text-gray-400">Searching...</div>
                                    ) : (
                                        <ul>
                                            {searchResults.map(movie => (
                                                <li key={movie.id} className="border-b border-white/5 last:border-0">
                                                    <Link
                                                        href={`/movie/${movie.id}`}
                                                        className="flex items-center gap-3 p-3 hover:bg-white/10 transition-colors"
                                                        onClick={() => {
                                                            setSearchQuery('')
                                                            setSearchResults([])
                                                        }}
                                                    >
                                                        <div className="relative w-10 h-14 bg-gray-800 rounded overflow-hidden shrink-0">
                                                            {movie.poster_path && (
                                                                <Image src={tmdb.getImageUrl(movie.poster_path, 'w300')} alt={movie.title} fill className="object-cover" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="text-white font-medium text-sm line-clamp-1">{movie.title}</p>
                                                            <p className="text-gray-500 text-xs">{movie.release_date?.split('-')[0]}</p>
                                                        </div>
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard">
                            <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10 hover:text-primary hidden sm:flex">
                                <Heart className="w-5 h-5" />
                            </Button>
                        </Link>

                        {user ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger>
                                    <Avatar className="h-9 w-9 border-2 border-primary/50 cursor-pointer hover:border-primary transition-colors">
                                        <AvatarImage src={user.user_metadata?.avatar_url} />
                                        <AvatarFallback>{user.email?.[0].toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="bg-[#111] border-white/10 text-white">
                                    <DropdownMenuItem className="focus:bg-white/10">Profile</DropdownMenuItem>
                                    <DropdownMenuItem className="focus:bg-white/10" onClick={handleSignOut}>Sign Out</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <Button
                                onClick={() => setIsLoginOpen(true)}
                                className="rounded-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/80 hover:to-purple-700 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all"
                            >
                                <User className="w-4 h-4 mr-2" />
                                Sign In
                            </Button>
                        )}
                    </div>
                </div>
            </motion.nav>
            <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
        </>
    )
}
