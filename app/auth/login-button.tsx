"use client";

import { createClient } from "@/utils/supabase/client";

type LoginButtonProps = {
    returnTo?: string;
};

export default function LoginButton({ returnTo: _returnTo }: LoginButtonProps) {
    void _returnTo;

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
            className="rounded-lg border border-yellow-200 bg-yellow-400 px-4 py-2 text-base font-bold text-zinc-950"
            onClick={handleLogin}
            type="button"
        >
            Sign in with Google
        </button>
    );
}
