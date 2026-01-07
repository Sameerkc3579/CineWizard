import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { NavBar } from '@/components/core/NavBar'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/')
    }

    // Fetch Profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    // Fetch Stats
    const { count } = await supabase
        .from('user_interactions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('interaction_type', 'like')

    return (
        <main className="min-h-screen bg-background text-foreground">
            <NavBar />
            <div className="container mx-auto px-4 py-24">
                {/* Profile Header */}
                <div className="flex flex-col md:flex-row items-center gap-8 mb-12 p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                    <Avatar className="w-32 h-32 border-4 border-primary/20 shadow-xl">
                        <AvatarImage src={profile?.avatar_url || user.user_metadata?.avatar_url} />
                        <AvatarFallback className="text-4xl bg-gradient-to-br from-primary to-purple-800 text-white">
                            {user.email?.[0].toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div className="text-center md:text-left space-y-2">
                        <h1 className="text-4xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                            {profile?.username || user.user_metadata?.full_name || 'CineWizard User'}
                        </h1>
                        <p className="text-gray-400 text-lg">{user.email}</p>
                        <div className="flex gap-4 justify-center md:justify-start mt-4">
                            <div className="px-6 py-3 rounded-xl bg-black/40 border border-white/10 text-center hover:border-primary/50 transition-colors">
                                <span className="block text-3xl font-bold text-primary">{count || 0}</span>
                                <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Movies Liked</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Preferences */}
                <section className="bg-white/5 rounded-2xl p-8 border border-white/10">
                    <h2 className="text-2xl font-bold text-white mb-6">Your Vibe</h2>
                    <div className="flex flex-wrap gap-3">
                        {profile?.favorite_genres && profile.favorite_genres.length > 0 ? (
                            profile.favorite_genres.map((g: string) => (
                                <Badge key={g} variant="secondary" className="px-4 py-2 text-base bg-white/10 hover:bg-primary/20 text-white border border-white/5 transition-colors">
                                    {g}
                                </Badge>
                            ))
                        ) : (
                            <div className="flex flex-col gap-2">
                                <p className="text-gray-500 italic">No genres selected yet.</p>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </main>
    )
}
