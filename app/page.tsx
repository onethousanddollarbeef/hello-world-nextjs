import Link from "next/link";
import LoginButton from "@/app/auth/login-button";

export default function Home() {
    return (
        <main className="relative mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-8 overflow-hidden px-6 py-16 text-zinc-100">
            <div
                aria-hidden="true"
                className="absolute inset-0 -z-10 bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage:
                        "linear-gradient(rgba(10, 10, 18, 0.75), rgba(10, 10, 18, 0.85)), url('https://images5.alphacoders.com/131/1317816.jpeg')",
                }}
            />

            <header className="space-y-3 rounded-xl border border-zinc-200/20 bg-black/40 p-6 backdrop-blur-sm">
                <p className="text-sm uppercase tracking-[0.3em] text-zinc-300">Assignment Hub</p>
                <h1 className="text-4xl font-semibold">Tasha&apos;s Hideous Laughter</h1>
                <p className="text-zinc-200">
                    All assignments are accessible from this page so you can test everything from one place.
                </p>
            </header>

            <section className="grid gap-4 md:grid-cols-4">
                <article className="rounded-xl border border-zinc-200/20 bg-black/45 p-5 backdrop-blur-sm">
                    <p className="text-xs uppercase tracking-[0.2em] text-zinc-300">Week 1</p>
                    <h2 className="mt-2 text-xl font-semibold">Hello World</h2>
                    <p className="mt-2 text-sm text-zinc-200">Base app and deployment assignment.</p>
                    <div className="mt-4">
                        <Link className="rounded-lg border border-zinc-200/40 bg-black/30 px-4 py-2 text-sm" href="/">
                            You are here
                        </Link>
                    </div>
                </article>

                <article className="rounded-xl border border-zinc-200/20 bg-black/45 p-5 backdrop-blur-sm">
                    <p className="text-xs uppercase tracking-[0.2em] text-zinc-300">Week 2</p>
                    <h2 className="mt-2 text-xl font-semibold">Supabase List</h2>
                    <p className="mt-2 text-sm text-zinc-200">Read captions from Supabase.</p>
                    <div className="mt-4">
                        <Link className="rounded-lg border border-zinc-200/40 bg-black/30 px-4 py-2 text-sm" href="/week2">
                            Open Week 2 tab
                        </Link>
                    </div>
                </article>

                <article className="rounded-xl border border-zinc-200/20 bg-black/45 p-5 backdrop-blur-sm">
                    <p className="text-xs uppercase tracking-[0.2em] text-zinc-300">Week 3</p>
                    <h2 className="mt-2 text-xl font-semibold">Protected Route</h2>
                    <p className="mt-2 text-sm text-zinc-200">Google OAuth + gated UI route.</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                        <Link className="rounded-lg border border-zinc-200/40 bg-black/30 px-4 py-2 text-sm" href="/protected">
                            Open Week 3 tab
                        </Link>
                        <LoginButton />
                    </div>
                </article>

                <article className="rounded-xl border border-zinc-200/20 bg-black/45 p-5 backdrop-blur-sm">
                    <p className="text-xs uppercase tracking-[0.2em] text-zinc-300">Week 4</p>
                    <h2 className="mt-2 text-xl font-semibold">Caption Rating</h2>
                    <p className="mt-2 text-sm text-zinc-200">Submit upvotes/downvotes to caption_votes.</p>
                    <div className="mt-4">
                        <Link className="rounded-lg border border-zinc-200/40 bg-black/30 px-4 py-2 text-sm" href="/week4">
                            Open Week 4 tab
                        </Link>
                    </div>
                </article>
            </section>

            <section className="rounded-xl border border-zinc-200/20 bg-black/45 p-5 backdrop-blur-sm">
                <p className="font-medium">Quick notes</p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-200">
                    <li>Week 2 and Week 4 depend on <code>SUPABASE_TABLE</code>.</li>
                    <li>Week 3 sign-in returns through <code>/auth/callback</code>.</li>
                    <li>Week 4 inserts rows into <code>caption_votes</code> for authenticated users only.</li>
                </ul>
            </section>
        </main>
    );
}
