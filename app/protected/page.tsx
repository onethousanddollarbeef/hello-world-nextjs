import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";

export default async function ProtectedPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/");
    }

    const signOut = async () => {
        "use server";

        const supabase = await createClient();
        await supabase.auth.signOut();
        redirect("/");
    };

    return (
        <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-6 py-16">
            <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Protected Route</p>
            <h1 className="text-4xl font-semibold">Gated UI</h1>
            <p className="text-zinc-300">
                You are signed in as <span className="font-medium">{user.email}</span>.
            </p>

            <div className="rounded-xl border border-zinc-700 bg-zinc-900 p-5">
                <p className="font-medium">Secret content unlocked 🎉</p>
                <p className="mt-2 text-sm text-zinc-400">Only authenticated users can view this page.</p>
            </div>

            <div className="flex gap-3">
                <Link className="rounded-lg border border-zinc-700 px-4 py-2 text-sm" href="/">
                    Back Home
                </Link>
                <form action={signOut}>
                    <button className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black" type="submit">
                        Sign out
                    </button>
                </form>
            </div>
        </main>
    );
}