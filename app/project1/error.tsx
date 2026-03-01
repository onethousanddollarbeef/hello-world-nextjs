"use client";

import Link from "next/link";

type Project1ErrorProps = {
    error: Error & { digest?: string };
    reset: () => void;
};

export default function Project1Error({ error, reset }: Project1ErrorProps) {
    return (
        <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 px-6 py-16">
            <section className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-200">
                <p className="font-semibold">Unable to load Project 1 right now</p>
                <p className="mt-2">{error.message || "An unexpected error occurred."}</p>
                {error.digest ? <p className="mt-2 text-xs">Digest: {error.digest}</p> : null}
            </section>
            <div className="flex flex-wrap gap-3">
                <button
                    className="rounded-lg border border-zinc-700 px-4 py-2 text-sm transition active:translate-y-0.5"
                    onClick={reset}
                    type="button"
                >
                    Try again
                </button>
                <Link className="rounded-lg border border-zinc-700 px-4 py-2 text-sm transition active:translate-y-0.5" href="/">
                    Back to Home
                </Link>
            </div>
        </main>
    );
}