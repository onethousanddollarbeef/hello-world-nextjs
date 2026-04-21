import Link from "next/link";

export default function Project1IntroPage() {
    return (
        <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-8 px-6 py-16">
            <header>
                <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Project 1</p>
                <h1 className="mt-2 text-4xl font-semibold text-zinc-900 dark:text-zinc-100">Caption Rating App</h1>
                <p className="mt-3 text-base text-zinc-700 dark:text-zinc-300">
                    Follow these quick steps, then jump into the app.
                </p>
            </header>

            <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
                <div className="space-y-4 text-base text-zinc-800 dark:text-zinc-200">
                    <p>
                        <span className="font-bold">Step 1:</span> Sign in and vote captions as funny or not funny.
                    </p>
                    <p>
                        <span className="font-bold">Step 2:</span> Optionally upload an image and run the caption pipeline.
                    </p>
                </div>

                <div className="mt-8 flex flex-wrap items-center gap-3">
                    <Link
                        className="rounded-lg border border-yellow-200 bg-yellow-400 px-5 py-3 text-base font-bold text-zinc-950 transition hover:bg-yellow-300 active:translate-y-0.5"
                        href="/project1/app"
                    >
                        Let&apos;s get started
                    </Link>
                    <Link
                        className="rounded-lg border border-yellow-200 bg-yellow-400 px-5 py-3 text-base font-bold text-zinc-950 transition hover:bg-yellow-300 active:translate-y-0.5"
                        href="/assignments"
                    >
                        Previous assignments
                    </Link>
                </div>
            </section>
        </main>
    );
}
