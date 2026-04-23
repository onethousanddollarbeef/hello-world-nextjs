import Link from "next/link";
import { redirect } from "next/navigation";
import SessionButton from "@/app/auth/session-button";
import { createClient } from "@/utils/supabase/server";
import Week5UploadClient from "@/app/week5/upload-client";

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

type Project1AppPageProps = {
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

async function resolveProfileId(
    supabase: Awaited<ReturnType<typeof createClient>>,
    userId: string,
    email: string,
) {
    const byEmail = await supabase.from("profiles").select("id").eq("email", email).maybeSingle();

    if (!byEmail.error && byEmail.data?.id) {
        return String(byEmail.data.id);
    }

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

export default async function Project1AppPageContent({ searchParams }: Project1AppPageProps) {
    const params = searchParams ? await searchParams : undefined;
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    const profileId = user?.email ? await resolveProfileId(supabase, user.id, user.email) : null;
    const isVerifiedUser = Boolean(user?.email_confirmed_at && profileId);
    const showVotes = isVoteVisible(params?.showVotes);

    async function handleVote(formData: FormData) {
        "use server";

        const captionId = formData.get("caption_id");
        const vote = formData.get("vote");
        const currentIndex = Number(formData.get("index") ?? 0);
        const showVotesFlag = String(formData.get("showVotes") ?? "1");

        if (!captionId || !vote || (vote !== "up" && vote !== "down")) {
            redirect("/project1/app?vote=failed");
        }

        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user || !user.email || !user.email_confirmed_at) {
            redirect("/project1/app?vote=login_required");
        }

        const profileId = await resolveProfileId(supabase, user.id, user.email);

        if (!profileId) {
            const safeReason = encodeURIComponent("Your email is not in profiles, so voting is disabled.");
            redirect(`/project1/app?vote=failed&reason=${safeReason}`);
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
            redirect(`/project1/app?vote=failed&reason=${safeReason}&i=${currentIndex}&showVotes=${showVotesFlag}`);
        }

        const nextIndex = Number.isFinite(currentIndex) ? currentIndex : 0;
        redirect(`/project1/app?vote=saved&i=${nextIndex}&showVotes=${showVotesFlag}`);
    }

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

    const allMemeItems = captions
        .map((caption) => ({
            captionId: caption.id,
            content: caption.content ?? "(No caption text)",
            imageUrl: caption.image_id ? imagesById.get(caption.image_id) ?? null : null,
        }))
        .filter((item) => Boolean(item.imageUrl));

    let votedCaptionIds = new Set<string>();
    if (profileId) {
        const { data: priorVotesData } = await supabase
            .from("caption_votes")
            .select("caption_id")
            .eq("profile_id", profileId);

        votedCaptionIds = new Set((priorVotesData ?? []).map((row) => String(row.caption_id)));
    }

    const memeItems = profileId
        ? allMemeItems.filter((item) => !votedCaptionIds.has(item.captionId))
        : allMemeItems;

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

    return (
        <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 bg-zinc-950 px-6 py-10 text-zinc-100">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">📝 Vote on Captions</p>
                    <h1 className="text-4xl font-semibold">Caption Rating App</h1>
                    <p className="mt-2 text-sm text-zinc-300">
                        Welcome, {user?.email ?? "guest"}. Vote and the next caption loads automatically.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Link className="rounded-lg border border-yellow-200 bg-yellow-400 px-4 py-2 text-base font-bold text-zinc-950 transition active:translate-y-0.5" href="/assignments">
                        Previous assignments
                    </Link>
                    <Link className="rounded-lg border border-yellow-200 bg-yellow-400 px-4 py-2 text-base font-bold text-zinc-950 transition active:translate-y-0.5" href="/">
                        Home
                    </Link>
                    <SessionButton returnTo="/project1/app" />
                </div>
            </div>

            {flashMessage ? (
                <section className="rounded-2xl border border-zinc-300 bg-zinc-100 p-4 text-sm text-zinc-800 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">
                    {flashMessage}
                </section>
            ) : null}

            {user && !isVerifiedUser ? (
                <section className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200">
                    Your account must have a verified email and a matching row in <code>profiles.email</code> before you can vote.
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
                <section className="mx-auto w-full max-w-3xl rounded-2xl border border-zinc-700 bg-zinc-900 p-6 shadow-sm">
                    <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                        Meme {activeIndex + 1} of {memeItems.length}
                    </p>

                    <div className="mt-4 rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-4">
                        <p className="text-xs text-cyan-500">&quot;</p>
                        <p className="text-lg font-medium text-zinc-100">{activeItem.content}</p>
                        <p className="text-right text-xs text-cyan-500">&quot;</p>
                    </div>
                    {showVotes ? (
                        <p className="mt-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300">Current score: {formatScore(score)}</p>
                    ) : (
                        <p className="mt-3 text-sm font-semibold text-zinc-500 dark:text-zinc-400">Score hidden</p>
                    )}

                    <form action={handleVote} className="mt-5 flex w-full flex-wrap items-center justify-center gap-3">
                        <input name="caption_id" type="hidden" value={activeItem.captionId} />
                        <input name="index" type="hidden" value={String(activeIndex)} />
                        <input name="showVotes" type="hidden" value={showVotes ? "1" : "0"} />
                        <button
                            className={`rounded-lg border px-4 py-2 text-sm font-medium transition-transform duration-100 active:translate-y-0.5 active:scale-95 ${
                                userVote === -1
                                    ? "border-red-300 bg-red-600 text-white"
                                    : "border-red-300 bg-red-500 text-white"
                            }`}
                            disabled={!isVerifiedUser}
                            name="vote"
                            type="submit"
                            value="down"
                        >
                            👎 Not funny
                        </button>
                        <button
                            className={`rounded-lg border px-4 py-2 text-sm font-medium transition-transform duration-100 active:translate-y-0.5 active:scale-95 ${
                                userVote === 1
                                    ? "border-green-300 bg-green-600 text-white"
                                    : "border-green-300 bg-green-500 text-white"
                            }`}
                            disabled={!isVerifiedUser}
                            name="vote"
                            type="submit"
                            value="up"
                        >
                            👍 LOL!
                        </button>
                        {userVote ? (
                            <span className="text-xs text-zinc-500 dark:text-zinc-400">
                                Your current vote: {userVote === 1 ? "Upvote" : "Downvote"}
                            </span>
                        ) : null}
                    </form>

                    <div className="mt-6 flex items-center justify-between gap-2">
                        <Link className="rounded-lg border border-yellow-200 bg-yellow-400 px-4 py-2 text-base font-bold text-zinc-950 transition active:translate-y-0.5" href={`/project1/app?i=${previousIndex}&showVotes=${showVotes ? "1" : "0"}`}>
                            Previous
                        </Link>
                        <p className="text-sm font-semibold text-zinc-600">{activeIndex + 1} / {memeItems.length}</p>
                        <Link className="rounded-lg border border-blue-300 bg-blue-500 px-4 py-2 text-base font-bold text-white transition active:translate-y-0.5" href={`/project1/app?i=${nextIndex}&showVotes=${showVotes ? "1" : "0"}`}>
                            Skip →
                        </Link>
                    </div>
                </section>
            )}

            <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
                <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Project 1 Extension</p>
                <h2 className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Upload an image and generate captions</h2>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
                    Use the 4-step pipeline below to upload a photo, generate captions, and then vote in the meme rater above.
                </p>

                <div className="mt-5">
                    <Week5UploadClient />
                </div>
            </section>
        </main>
    );
}
