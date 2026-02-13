import Link from "next/link";
import LoginButton from "@/app/auth/login-button";
import { createClient } from "@/utils/supabase/server";

export default async function Home() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    return (
        <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-6 py-16">
            <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Week 3 Assignment</p>
            <h1 className="text-4xl font-semibold">Hello World</h1>
            <p className="text-zinc-300">
                This is the Week 3 main page. It protects <code>/protected</code> and uses Google OAuth with Supabase.
            </p>

            <div className="rounded-xl border border-zinc-700 bg-zinc-900 p-5">
                {user ? (
                    <>
                        <p className="font-medium">Signed in as {user.email}</p>
                        <div className="mt-4 flex flex-wrap gap-3">
                            <Link className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black" href="/protected">
                                Go to protected page
                            </Link>
                            <Link className="rounded-lg border border-zinc-700 px-4 py-2 text-sm" href="/week2">
                                Open Week 2 list page
                            </Link>
                        </div>
                    </>
                ) : (
                    <>
                        <p className="font-medium">You are not signed in.</p>
                        <p className="mt-2 text-sm text-zinc-400">Sign in to access the gated UI.</p>
                        <div className="mt-4">
                            <LoginButton />
                        </div>
                        <div className="mt-3">
                            <Link className="rounded-lg border border-zinc-700 px-4 py-2 text-sm" href="/week2">
                                Open Week 2 list page
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </main>
    );
}
