import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

const postLoginPathCookieName = "post_login_path";
const fixedAppOrigin = "https://hello-world-nextjs-25phnbs5p-onethousanddollarbeefs-projects.vercel.app";

function sanitizeNextPath(nextValue: string | null) {
    if (!nextValue) {
        return "/";
    }

    if (!nextValue.startsWith("/")) {
        return "/";
    }

    if (nextValue.startsWith("//")) {
        return "/";
    }

    return nextValue;
}

function readCookieNextPath(request: NextRequest) {
    const cookieValue = request.cookies.get(postLoginPathCookieName)?.value;

    if (!cookieValue) {
        return null;
    }

    try {
        return decodeURIComponent(cookieValue);
    } catch {
        return cookieValue;
    }
}

function toFixedAppUrl(path: string) {
    return new URL(path, fixedAppOrigin);
}

export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get("code");
    const queryNext = sanitizeNextPath(requestUrl.searchParams.get("next"));
    const cookieNext = sanitizeNextPath(readCookieNextPath(request));
    const nextPath = queryNext !== "/" ? queryNext : cookieNext;

    if (!code) {
        return NextResponse.redirect(toFixedAppUrl("/?auth=missing_code"));
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
        return NextResponse.redirect(toFixedAppUrl("/?auth=failed"));
    }

    const response = NextResponse.redirect(toFixedAppUrl(nextPath));
    response.cookies.set(postLoginPathCookieName, "", {
        maxAge: 0,
        path: "/",
        sameSite: "lax",
    });

    return response;
}