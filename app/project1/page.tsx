import Link from "next/link";

export default function Project1IntroPage() {
    return (
        <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-6 py-16">
            <section className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
                <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Project 1</p>
                <h1 className="mt-2 text-4xl font-semibold text-zinc-900 dark:text-zinc-100">Caption Rating App</h1>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">Follow these two steps to use the app correctly.</p>

                <div className="mt-6 space-y-4">
                    <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800/60">
                        <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Step 1</p>
                        <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-200">
                            Sign in, then rate memes one-by-one in the app:
                            <strong> “EH I&apos;VE SEEN BETTER”</strong> (left) or <strong>“FUNNY!!!!”</strong> (right).
                        </p>
                    </div>
                    <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800/60">
                        <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Step 2</p>
                        <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-200">
                            (Optional) Upload your own image and run the 4-step caption pipeline to add new meme content.
                        </p>
                    </div>
                </div>

                <div className="mt-8 flex flex-wrap items-center gap-3">
                    <Link className="rounded-lg border border-pink-500 bg-pink-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-pink-500 active:translate-y-0.5" href="/project1/app">
                        Let&apos;s get started
                    </Link>
                    <Link className="rounded-lg border border-zinc-700 px-4 py-3 text-sm" href="/assignments">
                        Previous assignments
                    </Link>
                </div>
            </section>
        </main>
    );
}
