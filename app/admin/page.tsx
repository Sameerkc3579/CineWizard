import { getUsers, deleteUser } from '@/lib/admin-actions'
import { NavBar } from '@/components/core/NavBar'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/')
    }

    // TODO: In a real app, verify if the user has an 'admin' role or specific email
    // For now, we assume if you can access this and have the Service Key configured, you are the admin.
    // const isAdmin = user.email === 'your-admin-email@example.com'

    // Fetch all users
    const users = await getUsers()

    return (
        <main className="min-h-screen bg-background text-foreground">
            <NavBar />
            <div className="container mx-auto px-4 py-24">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400">
                        Admin Dashboard
                    </h1>
                    <div className="text-sm text-gray-500">
                        Total Users: <span className="text-white font-bold">{users.length}</span>
                    </div>
                </div>

                <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden backdrop-blur-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-white/5 border-b border-white/10 text-gray-400 uppercase text-xs">
                                <tr>
                                    <th className="px-6 py-4">User</th>
                                    <th className="px-6 py-4">ID</th>
                                    <th className="px-6 py-4">Last Sign In</th>
                                    <th className="px-6 py-4">Created</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {users.map((u: any) => (
                                    <tr key={u.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
                                                    {u.avatar_url ? (
                                                        <img src={u.avatar_url} alt={u.username} className="h-full w-full object-cover" />
                                                    ) : (
                                                        <div className="text-xs font-bold text-white/50">
                                                            {(u.username?.[0] || u.email?.[0] || '?').toUpperCase()}
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-white">{u.username || 'No Username'}</div>
                                                    <div className="text-xs text-gray-500">{u.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <code className="bg-black/30 px-2 py-1 rounded text-xs font-mono text-gray-400">
                                                {u.id}
                                            </code>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-400">
                                            {u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleDateString() : 'Never'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-400">
                                            {new Date(u.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <form action={async () => {
                                                'use server'
                                                await deleteUser(u.id)
                                            }}>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    className="h-8 w-8 p-0"
                                                    title="Delete User"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </form>
                                        </td>
                                    </tr>
                                ))}
                                {users.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                            No users found (or Service Key missing).
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </main>
    )
}
