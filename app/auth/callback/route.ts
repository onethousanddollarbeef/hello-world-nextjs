import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

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

export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get("code");
    const nextPath = sanitizeNextPath(requestUrl.searchParams.get("next"));

    if (!code) {
        return NextResponse.redirect(new URL("/?auth=missing_code", request.url));
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
        return NextResponse.redirect(new URL("/?auth=failed", request.url));
    }

    return NextResponse.redirect(new URL(nextPath, request.url));
}