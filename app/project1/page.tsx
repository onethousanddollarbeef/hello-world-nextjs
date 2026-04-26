import Link from "next/link";
import SessionButton from "@/app/auth/session-button";

export default function Project1IntroPage() {
    return (
        <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-8 px-6 py-16">
            <div className="flex justify-start">
                <SessionButton returnTo="/project1" />
            </div>
            <header>
                <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Project 1</p>
                <h1 className="mt-2 text-4xl font-bold text-zinc-950 dark:text-zinc-50">Caption Rating App</h1>
                <p className="mt-3 text-base font-semibold text-zinc-800 dark:text-zinc-200">
                    Follow these quick steps, then jump into the app.
                </p>
            </header>

            <section className="rounded-2xl border border-zinc-300 bg-white p-6 shadow-sm dark:border-zinc-600 dark:bg-zinc-900">
                <div className="space-y-4 text-base font-medium text-zinc-900 dark:text-zinc-100">
                    <p>
                        You can look, but you must be signed in to vote and generate captions.
                    </p>
                    <p>
                        Part 1: If a caption and image make you laugh, click UPVOTE! If you&apos;re cringing, click DOWNVOTE.
                    </p>
                    <p>
                        Part 2: How fun would it be if you could make your own captions? Upload an image, wait a minute, and
                        VOILA! Hilarious captions at your disposal.
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
