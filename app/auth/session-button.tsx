import { redirect } from "next/navigation";
import LoginButton from "@/app/auth/login-button";
import { hasSupabaseEnv } from "@/utils/supabase/env";
import { createClient } from "@/utils/supabase/server";

type SessionButtonProps = {
    returnTo: string;
};

export default async function SessionButton({ returnTo }: SessionButtonProps) {
    if (!hasSupabaseEnv) {
        return (
            <span className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200">
                Configure Supabase env vars to enable sign in
            </span>
        );
    }

    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    async function handleSignOut() {
        "use server";

        const supabase = await createClient();
        await supabase.auth.signOut();
        redirect(returnTo);
    }

    if (!user) {
        return <LoginButton returnTo={returnTo} />;
    }

    return (
        <form action={handleSignOut}>
            <button
                className="rounded-lg border border-yellow-200 bg-yellow-400 px-4 py-2 text-base font-bold text-zinc-950"
                type="submit"
            >
                Sign out
            </button>
        </form>
    );
}
