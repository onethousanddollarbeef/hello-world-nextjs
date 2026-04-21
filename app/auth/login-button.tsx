"use client";

import { createClient } from "@/utils/supabase/client";

type LoginButtonProps = {
    returnTo?: string;
};

export default function LoginButton({ returnTo }: LoginButtonProps) {
    const handleLogin = async () => {
        const supabase = createClient();
        const nextPath = returnTo ?? window.location.pathname ?? "/";
        const callbackUrl = new URL("/auth/callback", window.location.origin);
        callbackUrl.searchParams.set("next", nextPath);

        await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: callbackUrl.toString(),
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
