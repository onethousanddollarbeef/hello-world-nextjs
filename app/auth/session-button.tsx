import { redirect } from "next/navigation";
import LoginButton from "@/app/auth/login-button";
import { createClient } from "@/utils/supabase/server";

type SessionButtonProps = {
    returnTo: string;
};

export default async function SessionButton({ returnTo }: SessionButtonProps) {
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
                className="rounded-lg border border-white bg-pink-600 px-4 py-2 text-base font-bold text-white"
                type="submit"
            >
                Sign out
            </button>
        </form>
    );
}
