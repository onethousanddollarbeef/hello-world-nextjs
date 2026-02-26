import Link from "next/link";
import Week5UploadClient from "@/app/week5/upload-client";

export default function Week5Page() {
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
                <Link className="rounded-lg border border-zinc-700 px-4 py-2 text-sm transition active:translate-y-0.5" href="/">
                    Back to Home
                </Link>
            </div>

            <Week5UploadClient />
        </main>
    );
}
