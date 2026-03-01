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

function getAuthCallbackOrigin() {
    const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();

    if (!configured) {
        return window.location.origin;
    }

    try {
        return new URL(configured).origin;
    } catch {
        return window.location.origin;
    }
}

export default function LoginButton({ nextPath }: LoginButtonProps) {
    const handleLogin = async () => {
        const supabase = createClient();
        const destination = nextPath ?? getCurrentPath();
        const callbackOrigin = getAuthCallbackOrigin();
        const callbackUrl = new URL("/auth/callback", callbackOrigin);
        callbackUrl.searchParams.set("next", destination);

        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: callbackUrl.toString(),
                skipBrowserRedirect: true,
            },
        });

        if (error) {
            console.error("OAuth start failed", error.message);
            return;
        }

        if (!data?.url) {
            console.error("OAuth start failed: missing redirect URL");
            return;
        }

        const oauthUrl = new URL(data.url);
        oauthUrl.searchParams.set("redirect_to", callbackUrl.toString());
        window.location.assign(oauthUrl.toString());
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