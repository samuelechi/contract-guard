import { createClient } from "@/lib/supabase/client";
import { useState } from "react";

export const useGoogleAuth = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    // 1. Create the client
    const supabase = createClient();

    const signInWithGoogle = async () => {
        // 🔍 DEBUGGING LOGS (Add these!)
        console.log("1. Google Function Started");
        console.log("2. Supabase URL check:", process.env.NEXT_PUBLIC_SUPABASE_URL);

        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                },
            });

            if (error) throw error;

            // If success, this log should appear
            console.log("3. Redirecting to Google...");

        } catch (err: any) {
            console.error("Google sign in error:", err);
            setError(err);
            setLoading(false);
        }
    };
    return { signInWithGoogle, loading, error }
}