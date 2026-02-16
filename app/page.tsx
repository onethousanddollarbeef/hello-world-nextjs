import Link from "next/link";

export default function Home() {
    return (
        <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-6 py-16">
            <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Week 3 Assignment</p>
            <h1 className="text-4xl font-semibold">Hello World</h1>
            <p className="text-zinc-300">
                This is a safe Week 3 landing page without automatic auth redirects.
            </p>

            <div className="rounded-xl border border-zinc-700 bg-zinc-900 p-5">
                <p className="font-medium">Choose a section:</p>
                <div className="mt-4 flex flex-wrap gap-3">
                    <Link className="rounded-lg border border-zinc-700 px-4 py-2 text-sm" href="/week2">
                        Open Week 2 list page
                    </Link>
                    <Link className="rounded-lg border border-zinc-700 px-4 py-2 text-sm" href="/protected">
                        Open Week 3 protected page
                    </Link>
                </div>
                <p className="mt-3 text-sm text-zinc-400">
                    If auth is misconfigured, use <code>/week2</code> for submission stability.
                </p>
            </div>
        </main>
    );
}
