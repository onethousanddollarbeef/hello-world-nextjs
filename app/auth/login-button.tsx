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
            className="rounded-lg border border-white bg-pink-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-pink-500"
            onClick={handleLogin}
            type="button"
        >
            Sign in with Google
        </button>
    );
}
