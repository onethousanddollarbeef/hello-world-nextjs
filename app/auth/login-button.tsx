"use client";

import { createClient } from "@/utils/supabase/client";

type LoginButtonProps = {
    nextPath?: string;
};

const postLoginPathCookieName = "post_login_path";

function getCurrentPath() {
    if (typeof window === "undefined") {
        return "/";
    }

    return `${window.location.pathname}${window.location.search}${window.location.hash}`;
}

export default function LoginButton({ nextPath }: LoginButtonProps) {
    const handleLogin = async () => {
        const supabase = createClient();
        const destination = nextPath ?? getCurrentPath();

        document.cookie = `${postLoginPathCookieName}=${encodeURIComponent(destination)}; Max-Age=600; Path=/; SameSite=Lax`;

        const callbackUrl = new URL("/auth/callback", window.location.origin);
        callbackUrl.searchParams.set("next", destination);

        await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: callbackUrl.toString(),
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