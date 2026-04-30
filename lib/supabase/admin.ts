import { createClient } from '@supabase/supabase-js';

// This uses the service role key — NEVER expose this on the client side.
// Add to your .env.local:
//   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
// Find it in: Supabase Dashboard → Project Settings → API → service_role

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL');
}
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY');
}

export const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    }
);