"use client";

import { createClient } from "@/utils/supabase/client";

export default function LoginButton() {
    const handleLogin = async () => {
        const supabase = createClient();

        await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
                queryParams: {
                    prompt: "select_account",
                },
            },
        });
    };

    return (
        <button
            className="rounded-lg border border-pink-400 bg-pink-900/40 px-4 py-2 text-sm font-medium text-pink-50"
            onClick={handleLogin}
            type="button"
        >
            Sign in with Google
        </button>
    );
}
