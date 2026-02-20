import Link from "next/link";
import LoginButton from "@/app/auth/login-button";

const heroImageUrl = "https://images5.alphacoders.com/131/1317816.jpeg";

export default function Home() {
    return (
        <main className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 overflow-hidden px-6 py-16 text-zinc-100">
            <div
                aria-hidden="true"
                className="absolute inset-0 -z-10 bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage: `linear-gradient(rgba(10, 10, 18, 0.75), rgba(10, 10, 18, 0.85)), url('${heroImageUrl}')`,
                }}
            />

            <header className="space-y-3 rounded-xl border border-zinc-200/20 bg-black/40 p-6 backdrop-blur-sm">
                <p className="text-sm uppercase tracking-[0.3em] text-zinc-300">Assignment Hub</p>
                <h1 className="text-4xl font-semibold">Julia&apos;s Hideous Laughter</h1>
                <p className="text-zinc-200">All assignments are accessible from this page so you can test everything from one place.</p>
            </header>

            <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
                <div className="grid gap-4 sm:grid-cols-2">
                    <article className="rounded-2xl border border-zinc-200/20 bg-black/45 p-5 backdrop-blur-sm transition-transform duration-150 hover:-translate-y-1">
                        <p className="text-xs uppercase tracking-[0.2em] text-zinc-300">Week 1</p>
                        <h2 className="mt-2 text-xl font-semibold">Hello World</h2>
                        <p className="mt-2 text-sm text-zinc-200">Base app and deployment assignment.</p>
                        <div className="mt-4">
                            <Link className="rounded-lg border border-zinc-200/40 bg-black/30 px-4 py-2 text-sm transition active:translate-y-0.5" href="/">
                                You are here
                            </Link>
                        </div>
                    </article>

                    <article className="rounded-2xl border border-zinc-200/20 bg-black/45 p-5 backdrop-blur-sm transition-transform duration-150 hover:-translate-y-1">
                        <p className="text-xs uppercase tracking-[0.2em] text-zinc-300">Week 2</p>
                        <h2 className="mt-2 text-xl font-semibold">Supabase List</h2>
                        <p className="mt-2 text-sm text-zinc-200">Read captions from Supabase.</p>
                        <div className="mt-4">
                            <Link className="rounded-lg border border-zinc-200/40 bg-black/30 px-4 py-2 text-sm transition active:translate-y-0.5" href="/week2">
                                Open Week 2 card
                            </Link>
                        </div>
                    </article>

                    <article className="rounded-2xl border border-zinc-200/20 bg-black/45 p-5 backdrop-blur-sm transition-transform duration-150 hover:-translate-y-1">
                        <p className="text-xs uppercase tracking-[0.2em] text-zinc-300">Week 3</p>
                        <h2 className="mt-2 text-xl font-semibold">Protected Route</h2>
                        <p className="mt-2 text-sm text-zinc-200">Google OAuth + gated UI route.</p>
                        <div className="mt-4 flex flex-wrap gap-2">
                            <Link className="rounded-lg border border-zinc-200/40 bg-black/30 px-4 py-2 text-sm transition active:translate-y-0.5" href="/protected">
                                Open Week 3 card
                            </Link>
                            <LoginButton />
                        </div>
                    </article>

                    <article className="rounded-2xl border border-zinc-200/20 bg-black/45 p-5 backdrop-blur-sm transition-transform duration-150 hover:-translate-y-1">
                        <p className="text-xs uppercase tracking-[0.2em] text-zinc-300">Week 4</p>
                        <h2 className="mt-2 text-xl font-semibold">Caption Rating</h2>
                        <p className="mt-2 text-sm text-zinc-200">One-caption-at-a-time voting with upvote/downvote updates.</p>
                        <div className="mt-4">
                            <Link className="rounded-lg border border-zinc-200/40 bg-black/30 px-4 py-2 text-sm transition active:translate-y-0.5" href="/week4">
                                Open Week 4 card
                            </Link>
                        </div>
                    </article>
                </div>

                <aside className="overflow-hidden rounded-2xl border border-zinc-200/20 bg-black/45 p-3 backdrop-blur-sm">
                    <img
                        alt="Main page side artwork"
                        className="h-full min-h-[360px] w-full rounded-xl object-cover"
                        src={heroImageUrl}
                    />
                </aside>
            </section>

            <section className="rounded-xl border border-zinc-200/20 bg-black/45 p-5 backdrop-blur-sm">
                <p className="font-medium">Quick notes</p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-200">
                    <li>Week 2 and Week 4 depend on <code>SUPABASE_TABLE</code>.</li>
                    <li>Week 3 sign-in returns through <code>/auth/callback</code>.</li>
                    <li>Week 4 stores votes as <code>+1/-1</code> and updates on re-vote.</li>
                </ul>
            </section>
        </main>
    );
}
