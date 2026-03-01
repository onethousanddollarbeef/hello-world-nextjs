"use client";

import { createClient } from "@/utils/supabase/client";

export default function LoginButton() {
    const handleLogin = async () => {
        const supabase = createClient();

        await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        });
    };

    return (
        <button
            className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black"
            onClick={handleLogin}
            type="button"
        >
            Sign in with Google
        </button>
    );
}
