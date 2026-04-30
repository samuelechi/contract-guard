import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);

    const code = searchParams.get("code");
    const token_hash = searchParams.get("token_hash");
    const type = searchParams.get("type");
    const next = searchParams.get("next") ?? "/dashboard/settings";

    const supabase = await createClient();

    if (token_hash && type) {
        const { error } = await supabase.auth.verifyOtp({
            type: type as any,
            token_hash,
        });
        if (!error) return NextResponse.redirect(`${origin}${next}`);
    }

    if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) return NextResponse.redirect(`${origin}${next}`);
    }

    return NextResponse.redirect(`${origin}/login?error=auth-code-error`);
}