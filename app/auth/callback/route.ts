import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);

    // 1. Google sends us a "code" (the ticket)
    const code = searchParams.get("code");

    // 2. Where should we go next? (Default to dashboard)
    const next = searchParams.get("next") ?? "/dashboard";

    if (code) {
        // 3. Exchange the ticket for a real User Session
        const supabase = await createClient();
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error) {
            // 4. Success! Forward the user to the dashboard
            return NextResponse.redirect(`${origin}${next}`);
        }
    }

    // 5. If something broke, send them back to login
    return NextResponse.redirect(`${origin}/login?error=auth-code-error`);
}