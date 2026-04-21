import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get("code");
    const nextPath = requestUrl.searchParams.get("next");
    const safeNextPath = nextPath && nextPath.startsWith("/") ? nextPath : "/project1";

    if (!code) {
        return NextResponse.redirect(new URL("/?auth=missing_code", request.url));
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
        return NextResponse.redirect(new URL("/?auth=failed", request.url));
    }

    return NextResponse.redirect(new URL(safeNextPath, request.url));
}
