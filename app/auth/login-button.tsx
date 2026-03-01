"use client";

import { createClient } from "@/utils/supabase/client";

type LoginButtonProps = {
    nextPath?: string;
};

function getCurrentPath() {
    if (typeof window === "undefined") {
        return "/";
    }

    return `${window.location.pathname}${window.location.search}${window.location.hash}`;
}

export default function LoginButton({ nextPath }: LoginButtonProps) {
    const startOAuthLogin = async () => {
        const supabase = createClient();
        const destination = nextPath ?? getCurrentPath();
        const callbackUrl = new URL("/auth/callback", window.location.origin);
        callbackUrl.searchParams.set("next", destination);

        const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: callbackUrl.toString(),
            },
        });

        if (error) {
            console.error("OAuth start failed", error.message);
        }
    };

    return (
        <div className="flex flex-wrap gap-2">
            <button
                className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black"
                onClick={startOAuthLogin}
                type="button"
            >
                Sign in with Google
            </button>

            <button
                className="rounded-lg border border-white/50 bg-transparent px-4 py-2 text-sm font-medium text-white"
                onClick={startOAuthLogin}
                type="button"
            >
                test login
            </button>
        </div>
    );
}