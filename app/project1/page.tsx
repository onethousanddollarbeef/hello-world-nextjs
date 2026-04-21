import Link from "next/link";

export default function Project1IntroPage() {
    return (
        <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 px-6 py-16">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Project 1</p>
                    <h1 className="text-4xl font-semibold">Humor Project</h1>
                    <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                        View shared uploaded images + captions and vote up/down one meme at a time.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    {user ? (
                        <p className="rounded-lg border border-emerald-700/40 bg-emerald-900/20 px-3 py-2 text-xs text-emerald-200">
                            {user.email ?? user.id}
                        </p>
                    ) : (
                        <LoginButton />
                    )}
                    <Link className="rounded-lg border border-yellow-200 bg-yellow-400 px-4 py-2 text-base font-bold text-zinc-950 transition active:translate-y-0.5" href="/assignments">
                        Previous assignments
                    </Link>
                </div>
            </div>

            <div>
                <Link className="rounded-lg border border-yellow-200 bg-yellow-400 px-4 py-2 text-base font-bold text-zinc-950 transition active:translate-y-0.5" href={toggleVoteViewHref}>
                    {showVotes ? "Hide current score" : "Show current score"}
                </Link>
            </div>

            {params?.vote === "saved" ? (
                <VoteSavedFlash imageSrc="/vote-saved.png" />
            ) : flashMessage ? (
                <section className="rounded-2xl border border-zinc-300 bg-zinc-100 p-4 text-sm text-zinc-800 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">
                    {flashMessage}
                </section>
            ) : null}

            {captionsError ? (
                <section className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-200">
                    <p className="font-semibold">Unable to load captions</p>
                    <p className="mt-2">{captionsError.message}</p>
                </section>
            ) : !activeItem ? (
                <section className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600 shadow-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
                    No memes found yet.
                </section>
            ) : (
                <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
                    <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                        Meme {activeIndex + 1} of {memeItems.length}
                    </p>

                    {activeItem.imageUrl ? (
                        <Image
                            alt="Uploaded meme"
                            className="mt-4 max-h-[420px] w-full rounded-xl border border-zinc-200 bg-zinc-100 object-contain dark:border-zinc-700 dark:bg-zinc-800"
                            height={420}
                            src={activeItem.imageUrl}
                            unoptimized
                            width={1200}
                        />
                    ) : null}

                    <p className="mt-4 text-lg font-medium text-zinc-900 dark:text-zinc-100">{activeItem.content}</p>
                    <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">Caption ID: {activeItem.captionId}</p>
                    {showVotes ? (
                        <p className="mt-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300">Current score: {formatScore(score)}</p>
                    ) : (
                        <p className="mt-3 text-sm font-semibold text-zinc-500 dark:text-zinc-400">Score hidden</p>
                    )}

                    <form action={handleVote} className="mt-5 flex flex-wrap items-center gap-2">
                        <input name="caption_id" type="hidden" value={activeItem.captionId} />
                        <input name="index" type="hidden" value={String(activeIndex)} />
                        <input name="showVotes" type="hidden" value={showVotes ? "1" : "0"} />
                        <button
                            className={`rounded-lg border px-4 py-2 text-sm font-medium transition-transform duration-100 active:translate-y-0.5 active:scale-95 ${
                                userVote === 1
                                    ? "border-yellow-200 bg-yellow-300 text-zinc-950"
                                    : "border-yellow-200 bg-yellow-400 text-zinc-950"
                            }`}
                            disabled={!user}
                            name="vote"
                            type="submit"
                            value="up"
                        >
                            Upvote
                        </button>
                        <button
                            className={`rounded-lg border px-4 py-2 text-sm font-medium transition-transform duration-100 active:translate-y-0.5 active:scale-95 ${
                                userVote === -1
                                    ? "border-yellow-200 bg-yellow-300 text-zinc-950"
                                    : "border-yellow-200 bg-yellow-400 text-zinc-950"
                            }`}
                            disabled={!user}
                            name="vote"
                            type="submit"
                            value="down"
                        >
                            Downvote
                        </button>
                        {userVote ? (
                            <span className="text-xs text-zinc-500 dark:text-zinc-400">
                                Your current vote: {userVote === 1 ? "Upvote" : "Downvote"}
                            </span>
                        ) : null}
                    </form>

                    <div className="mt-6 flex items-center justify-between gap-2">
                        <Link className="rounded-lg border border-yellow-200 bg-yellow-400 px-4 py-2 text-base font-bold text-zinc-950 transition active:translate-y-0.5" href={`/project1?i=${previousIndex}&showVotes=${showVotes ? "1" : "0"}`}>
                            Previous
                        </Link>
                        <Link className="rounded-lg border border-yellow-200 bg-yellow-400 px-4 py-2 text-base font-bold text-zinc-950 transition active:translate-y-0.5" href={`/project1?i=${nextIndex}&showVotes=${showVotes ? "1" : "0"}`}>
                            Next
                        </Link>
                    </div>
                    <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800/60">
                        <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Step 2</p>
                        <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-200">Upload an image and generate fresh captions when you want more content.</p>
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
