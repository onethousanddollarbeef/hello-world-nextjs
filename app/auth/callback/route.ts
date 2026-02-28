import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

const postLoginPathCookieName = "post_login_path";

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

export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get("code");
    const queryNext = sanitizeNextPath(requestUrl.searchParams.get("next"));
    const cookieNext = sanitizeNextPath(readCookieNextPath(request));
    const nextPath = queryNext !== "/" ? queryNext : cookieNext;

    if (!code) {
        return NextResponse.redirect(new URL("/?auth=missing_code", request.url));
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
        return NextResponse.redirect(new URL("/?auth=failed", request.url));
    }

    const response = NextResponse.redirect(new URL(nextPath, request.url));
    response.cookies.set(postLoginPathCookieName, "", {
        maxAge: 0,
        path: "/",
        sameSite: "lax",
    });

    return response;
}