import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import LoginButton from "@/app/auth/login-button";
import { createClient } from "@/utils/supabase/server";
import VoteSavedFlash from "@/app/project1/vote-saved-flash";

type CaptionRow = {
    id: string;
    content?: string | null;
    image_id?: string | null;
    is_public?: boolean | null;
};

type ImageRow = {
    id: string;
    url?: string | null;
};

type VoteRow = {
    caption_id: string;
    vote_value: number;
    profile_id: string;
};

type Project1PageProps = {
    searchParams?: Promise<{
        i?: string;
        vote?: string;
        reason?: string;
        showVotes?: string;
    }>;
};

function parseIndex(rawIndex: string | undefined, itemCount: number) {
    if (itemCount === 0) {
        return 0;
    }

    const parsed = Number(rawIndex ?? 0);

    if (!Number.isFinite(parsed)) {
        return 0;
    }

    return Math.min(Math.max(Math.trunc(parsed), 0), itemCount - 1);
}

function formatScore(score: number) {
    if (score > 0) {
        return `+${score}`;
    }

    return String(score);
}


function isVoteVisible(flag: string | undefined) {
    return flag !== "0";
}

function voteMessage(voteState?: string, reason?: string) {
    if (voteState === "saved") {
        return "Vote saved.";
    }

    if (voteState === "login_required") {
        return "You must be logged in to vote.";
    }

    if (voteState === "failed") {
        if (reason) {
            return `Vote failed: ${decodeURIComponent(reason)}`;
        }

        return "Vote failed. Please try again.";
    }

    return null;
}

async function resolveProfileId(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
    const byUserId = await supabase.from("profiles").select("id").eq("user_id", userId).maybeSingle();

    if (!byUserId.error && byUserId.data?.id) {
        return String(byUserId.data.id);
    }

    const byId = await supabase.from("profiles").select("id").eq("id", userId).maybeSingle();

    if (!byId.error && byId.data?.id) {
        return String(byId.data.id);
    }

    return null;
}

export default async function Project1Page({ searchParams }: Project1PageProps) {
    const params = searchParams ? await searchParams : undefined;
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    const profileId = user ? await resolveProfileId(supabase, user.id) : null;
    const showVotes = isVoteVisible(params?.showVotes);

    const handleVote = async (formData: FormData) => {
        "use server";

        const captionId = formData.get("caption_id");
        const vote = formData.get("vote");
        const currentIndex = Number(formData.get("index") ?? 0);
        const showVotesFlag = String(formData.get("showVotes") ?? "1");

        if (!captionId || !vote || (vote !== "up" && vote !== "down")) {
            redirect("/project1?vote=failed");
        }

        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            redirect("/project1?vote=login_required");
        }

        const profileId = await resolveProfileId(supabase, user.id);

        if (!profileId) {
            const safeReason = encodeURIComponent("No profile found for this authenticated user.");
            redirect(`/project1?vote=failed&reason=${safeReason}`);
        }

        const voteValue = vote === "up" ? 1 : -1;
        const nowUtc = new Date().toISOString();

        const { error } = await supabase.from("caption_votes").upsert(
            {
                caption_id: String(captionId),
                profile_id: profileId,
                vote_value: voteValue,
                created_datetime_utc: nowUtc,
                modified_datetime_utc: nowUtc,
            },
            { onConflict: "profile_id,caption_id" },
        );

        if (error) {
            const safeReason = encodeURIComponent(error.message);
            redirect(`/project1?vote=failed&reason=${safeReason}&i=${currentIndex}&showVotes=${showVotesFlag}`);
        }

        const nextIndex = Number.isFinite(currentIndex) ? currentIndex + 1 : 0;
        redirect(`/project1?vote=saved&i=${nextIndex}&showVotes=${showVotesFlag}`);
    };

    const { data: captionsData, error: captionsError } = await supabase
        .from("captions")
        .select("id,content,image_id,is_public")
        .eq("is_public", true)
        .order("id", { ascending: false })
        .limit(200);

    const captions = ((captionsData ?? []) as CaptionRow[]).filter((caption) => Boolean(caption.image_id));

    const imageIds = Array.from(
        new Set(captions.map((caption) => caption.image_id).filter((id): id is string => Boolean(id))),
    );

    const imagesById = new Map<string, string>();

    if (imageIds.length > 0) {
        const { data: imagesData } = await supabase.from("images").select("id,url").in("id", imageIds);

        ((imagesData ?? []) as ImageRow[]).forEach((image) => {
            if (image.url) {
                imagesById.set(image.id, image.url);
            }
        });
    }

    const memeItems = captions
        .map((caption) => ({
            captionId: caption.id,
            content: caption.content ?? "(No caption text)",
            imageUrl: caption.image_id ? imagesById.get(caption.image_id) ?? null : null,
        }))
        .filter((item) => Boolean(item.imageUrl));

    const activeIndex = parseIndex(params?.i, memeItems.length);
    const activeItem = memeItems[activeIndex] ?? null;

    const { data: votesData } = activeItem
        ? await supabase
            .from("caption_votes")
            .select("caption_id,vote_value,profile_id")
            .eq("caption_id", activeItem.captionId)
        : { data: null };

    const votes = (votesData ?? []) as VoteRow[];
    const score = votes.reduce((sum, row) => sum + row.vote_value, 0);
    const userVote = profileId ? votes.find((row) => row.profile_id === profileId)?.vote_value : undefined;
    const flashMessage = voteMessage(params?.vote, params?.reason);

    const previousIndex = Math.max(activeIndex - 1, 0);
    const nextIndex = memeItems.length > 0 ? Math.min(activeIndex + 1, memeItems.length - 1) : 0;
    const toggleVoteViewHref = `/project1?i=${activeIndex}&showVotes=${showVotes ? "0" : "1"}`;

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
                <Link className="rounded-lg border border-zinc-700 px-4 py-2 text-sm transition active:translate-y-0.5" href="/">
                    Back to Home
                </Link>
            </div>

            <div>
                <Link className="rounded-lg border border-zinc-700 px-4 py-2 text-xs uppercase tracking-[0.18em] text-zinc-300 transition active:translate-y-0.5" href={toggleVoteViewHref}>
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

            <section className="rounded-xl border border-zinc-700/70 bg-black/30 px-4 py-3 text-sm text-zinc-200">
                {user ? (
                    <>Logged in as <strong>{user.email ?? user.id}</strong>.</>
                ) : (
                    <div className="flex flex-wrap items-center gap-3">
                        <span>Sign in required to vote.</span>
                        <LoginButton />
                    </div>
                )}
            </section>

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
                            className="mt-4 max-h-[420px] w-full rounded-xl border border-zinc-200 object-cover dark:border-zinc-700"
                            height={420}
                            loader={({ src }) => src}
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
                                    ? "border-emerald-500 bg-emerald-500/40 text-emerald-100"
                                    : "border-emerald-600/40 bg-emerald-600/20 text-emerald-200"
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
                                    ? "border-rose-500 bg-rose-500/40 text-rose-100"
                                    : "border-rose-600/40 bg-rose-600/20 text-rose-200"
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
                        <Link className="rounded-lg border border-zinc-700 px-4 py-2 text-sm transition active:translate-y-0.5" href={`/project1?i=${previousIndex}&showVotes=${showVotes ? "1" : "0"}`}>
                            Previous
                        </Link>
                        <Link className="rounded-lg border border-zinc-700 px-4 py-2 text-sm transition active:translate-y-0.5" href={`/project1?i=${nextIndex}&showVotes=${showVotes ? "1" : "0"}`}>
                            Next
                        </Link>
                    </div>
                </section>
            )}
        </main>
    );
}