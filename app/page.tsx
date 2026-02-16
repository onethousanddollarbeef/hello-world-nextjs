import Link from "next/link";
import LoginButton from "@/app/auth/login-button";

export default function Home() {
    return (
        <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-8 px-6 py-16">
            <header className="space-y-3">
                <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Assignment Hub</p>
                <h1 className="text-4xl font-semibold">Hello World Portal</h1>
                <p className="text-zinc-300">
                    All assignments are accessible from this page so you can test everything from one place.
                </p>
            </header>

            <section className="grid gap-4 md:grid-cols-3">
                <article className="rounded-xl border border-zinc-700 bg-zinc-900 p-5">
                    <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Week 1</p>
                    <h2 className="mt-2 text-xl font-semibold">Hello World</h2>
                    <p className="mt-2 text-sm text-zinc-400">Base app and deployment assignment.</p>
                    <div className="mt-4">
                        <Link className="rounded-lg border border-zinc-700 px-4 py-2 text-sm" href="/">
                            You are here
                        </Link>
                    </div>
                </article>

                <article className="rounded-xl border border-zinc-700 bg-zinc-900 p-5">
                    <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Week 2</p>
                    <h2 className="mt-2 text-xl font-semibold">Supabase List</h2>
                    <p className="mt-2 text-sm text-zinc-400">Read from Supabase and render rows from your table.</p>
                    <div className="mt-4">
                        <Link className="rounded-lg border border-zinc-700 px-4 py-2 text-sm" href="/week2">
                            Open Week 2 page
                        </Link>
                    </div>
                </article>

                <article className="rounded-xl border border-zinc-700 bg-zinc-900 p-5">
                    <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Week 3</p>
                    <h2 className="mt-2 text-xl font-semibold">Protected Route</h2>
                    <p className="mt-2 text-sm text-zinc-400">Google OAuth + gated UI route.</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                        <Link className="rounded-lg border border-zinc-700 px-4 py-2 text-sm" href="/protected">
                            Open protected page
                        </Link>
                        <LoginButton />
                    </div>
                </article>
            </section>

            <section className="rounded-xl border border-zinc-700 bg-zinc-900 p-5">
                <p className="font-medium">Quick notes</p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-400">
                    <li>Week 2 depends on <code>SUPABASE_TABLE</code>.</li>
                    <li>Week 3 sign-in returns through <code>/auth/callback</code>.</li>
                    <li>If OAuth is restricted by shared settings, Week 2 remains fully testable.</li>
                </ul>
            </section>
        </main>
    );
}
