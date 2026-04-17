import Link from "next/link";
import LoginButton from "@/app/auth/login-button";
import Week5UploadClient from "@/app/week5/upload-client";
import { createClient } from "@/utils/supabase/server";

export default async function Week5Page() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    async function handleSignOut() {
        "use server";

        const supabase = await createClient();
        await supabase.auth.signOut();
    }

    return (
        <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 px-6 py-16">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Week 5 Assignment</p>
                    <h1 className="text-4xl font-semibold">Image Upload + Caption Pipeline</h1>
                    <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                        1) Presigned URL → 2) Upload bytes → 3) Register URL → 4) Generate captions.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {user ? (
                        <form action={handleSignOut}>
                            <button className="rounded-lg border border-pink-400 bg-white px-4 py-2 text-sm font-medium text-pink-700" type="submit">
                                Log out
                            </button>
                        </form>
                    ) : (
                        <LoginButton />
                    )}
                    <Link className="rounded-lg border border-pink-400 bg-white px-4 py-2 text-sm font-medium text-pink-700 transition active:translate-y-0.5" href="/">
                        Back to Home
                    </Link>
                </div>
            </div>

            <Week5UploadClient />
        </main>
    );
}
