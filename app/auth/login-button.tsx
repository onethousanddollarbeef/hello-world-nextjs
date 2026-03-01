"use client";

import { createClient } from "@/utils/supabase/client";

type LoginButtonProps = {
    nextPath?: string;
};

const postLoginPathCookieName = "post_login_path";
const fixedAuthCallbackOrigin = "https://hello-world-nextjs-25phnbs5p-onethousanddollarbeefs-projects.vercel.app";

function getCurrentPath() {
    if (typeof window === "undefined") {
        return "/";
    }

    return `${window.location.pathname}${window.location.search}${window.location.hash}`;
}

function getExpectedAuthOrigin() {
    const configuredSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();

    if (!configuredSupabaseUrl) {
        return null;
    }

    try {
        return new URL(configuredSupabaseUrl).origin;
    } catch {
        return null;
    }
}

export default function LoginButton({ nextPath }: LoginButtonProps) {
    const handleLogin = async () => {
        const supabase = createClient();
        const destination = nextPath ?? getCurrentPath();

        document.cookie = `${postLoginPathCookieName}=${encodeURIComponent(destination)}; Max-Age=600; Path=/; SameSite=Lax`;

        const callbackUrl = new URL("/auth/callback", fixedAuthCallbackOrigin);
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
        const expectedAuthOrigin = getExpectedAuthOrigin();

        if (expectedAuthOrigin) {
            const expected = new URL(expectedAuthOrigin);
            oauthUrl.protocol = expected.protocol;
            oauthUrl.host = expected.host;
        }

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