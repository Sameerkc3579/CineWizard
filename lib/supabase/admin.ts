import { createClient } from '@supabase/supabase-js'

// Note: This client uses the SERVICE_ROLE_KEY which bypasses Row Level Security.
// Use this ONLY on the server-side and never expose it to the client.
export const getAdminClient = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error(`Missing Supabase environment variables. 
        NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? 'Set' : 'Missing'}
        SUPABASE_SERVICE_ROLE_KEY: ${supabaseServiceKey ? 'Set' : 'Missing'}
        
        Make sure these are defined in your .env or .env.local file and you have restarted the server.`)
    }

    return createClient(
        supabaseUrl,
        supabaseServiceKey,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    )
}
