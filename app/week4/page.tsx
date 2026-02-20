import Link from "next/link";
import { redirect } from "next/navigation";
import LoginButton from "@/app/auth/login-button";
import { createClient } from "@/utils/supabase/server";

type RowValue = string | number | boolean | null;
type SupabaseRow = Record<string, RowValue> & { id?: string | number | null };

type VoteRow = {
    caption_id: string;
    vote_value: number;
    profile_id: string;
};

type Week4PageProps = {
    searchParams?: Promise<{
        vote?: string;
        reason?: string;
        i?: string;
    }>;
};

function pickLabel(row: SupabaseRow) {
    const preferredKeys = ["content", "title", "name", "caption", "text", "description"];

    for (const key of preferredKeys) {
        const value = row[key];
        if (typeof value === "string" && value.trim().length > 0) {
            return value;
        }
    }

    const firstStringValue = Object.values(row).find(
        (value): value is string => typeof value === "string" && value.trim().length > 0
    );

    return firstStringValue ?? `Row ${row.id ?? "unknown"}`;
}

function voteMessage(voteState?: string, reason?: string) {
    if (voteState === "saved") {
        return "Your vote was saved and your next caption is ready.";
    }

    if (voteState === "login_required") {
        return "Please sign in before voting.";
    }

    if (voteState === "failed") {
        if (reason) {
            return `Vote could not be saved: ${decodeURIComponent(reason)}`;
        }

        return "Vote could not be saved. Please try again.";
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

function formatScore(score: number) {
    if (score > 0) {
        return `+${score}`;
    }

    return String(score);
}

function parseIndex(rawIndex: string | undefined, itemCount: number) {
    const fallback = 0;

    if (itemCount === 0) {
        return 0;
    }

    const parsed = Number(rawIndex ?? fallback);

    if (!Number.isFinite(parsed)) {
        return 0;
    }

    return Math.min(Math.max(Math.trunc(parsed), 0), itemCount - 1);
}

export default async function Week4Page({ searchParams }: Week4PageProps) {
    const params = searchParams ? await searchParams : undefined;
    const tableName = process.env.SUPABASE_TABLE;
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    const profileId = user ? await resolveProfileId(supabase, user.id) : null;

    const handleVote = async (formData: FormData) => {
        "use server";

        const captionId = formData.get("caption_id");
        const vote = formData.get("vote");
        const currentIndex = Number(formData.get("index") ?? 0);

        if (!captionId || !vote || (vote !== "up" && vote !== "down")) {
            redirect("/week4?vote=failed");
        }

        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            redirect("/week4?vote=login_required");
        }

        const profileId = await resolveProfileId(supabase, user.id);

        if (!profileId) {
            const safeReason = encodeURIComponent("No profile found for this authenticated user.");
            redirect(`/week4?vote=failed&reason=${safeReason}`);
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
            { onConflict: "profile_id,caption_id" }
        );

        if (error) {
            const safeReason = encodeURIComponent(error.message);
            redirect(`/week4?vote=failed&reason=${safeReason}&i=${currentIndex}`);
        }

        const nextIndex = Number.isFinite(currentIndex) ? currentIndex + 1 : 0;
        redirect(`/week4?vote=saved&i=${nextIndex}`);
    };

    const { data, error } = tableName
        ? await supabase.from(tableName).select("*").limit(200)
        : { data: null, error: null };

    const items = (data ?? []) as SupabaseRow[];
    const activeIndex = parseIndex(params?.i, items.length);
    const activeCaption = items[activeIndex] ?? null;
    const activeCaptionId =
        activeCaption && activeCaption.id !== undefined && activeCaption.id !== null
            ? String(activeCaption.id)
            : null;

    const { data: votesData } = activeCaptionId
        ? await supabase.from("caption_votes").select("caption_id,vote_value,profile_id").eq("caption_id", activeCaptionId)
        : { data: null };

    const votes = (votesData ?? []) as VoteRow[];
    const score = votes.reduce((sum, row) => sum + row.vote_value, 0);
    const userVote = profileId ? votes.find((row) => row.profile_id === profileId)?.vote_value : undefined;
    const flashMessage = voteMessage(params?.vote, params?.reason);

    const previousIndex = Math.max(activeIndex - 1, 0);
    const nextIndex = items.length > 0 ? Math.min(activeIndex + 1, items.length - 1) : 0;

    return (
        <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-6 py-16">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Week 4 Assignment</p>
                    <h1 className="text-4xl font-semibold">Caption Match</h1>
                    <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                        Dating app style: one caption at a time.
                    </p>
                </div>
                <Link className="rounded-lg border border-zinc-700 px-4 py-2 text-sm" href="/">
                    Back to Home
                </Link>
            </div>

            {user ? (
                <section className="rounded-2xl border border-emerald-700/50 bg-emerald-900/20 p-4 text-sm text-emerald-200">
                    Logged in as <strong>{user.email ?? user.id}</strong>. Your vote updates your existing choice for this caption.
                </section>
            ) : (
                <section className="rounded-2xl border border-dashed border-zinc-300 bg-white p-6 text-sm text-zinc-600 shadow-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
                    <p className="font-semibold text-zinc-800 dark:text-zinc-100">Sign in required to vote</p>
                    <p className="mt-2">You can browse captions, but only logged-in users can submit votes.</p>
                    <div className="mt-4">
                        <LoginButton />
                    </div>
                </section>
            )}

            {flashMessage ? (
                <section className="rounded-2xl border border-zinc-300 bg-zinc-100 p-4 text-sm text-zinc-800 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">
                    {flashMessage}
                </section>
            ) : null}

            {!tableName ? (
                <section className="rounded-2xl border border-dashed border-zinc-300 bg-white p-6 text-sm text-zinc-600 shadow-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
                    <p className="font-semibold text-zinc-800 dark:text-zinc-100">Missing SUPABASE_TABLE</p>
                    <p className="mt-2">
                        Set the environment variable <code>SUPABASE_TABLE</code> to your existing captions table name.
                    </p>
                </section>
            ) : error ? (
                <section className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-200">
                    <p className="font-semibold">Unable to load Supabase data</p>
                    <p className="mt-2">{error.message}</p>
                </section>
            ) : !activeCaption ? (
                <section className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600 shadow-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
                    No captions found in this table.
                </section>
            ) : (
                <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
                    <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                        Caption {activeIndex + 1} of {items.length}
                    </p>
                    <p className="mt-4 text-lg font-medium text-zinc-900 dark:text-zinc-100">{pickLabel(activeCaption)}</p>
                    {activeCaptionId ? (
                        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">ID: {activeCaptionId}</p>
                    ) : null}
                    <p className="mt-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300">Current score: {formatScore(score)}</p>

                    {activeCaptionId ? (
                        <form action={handleVote} className="mt-5 flex flex-wrap items-center gap-2">
                            <input name="caption_id" type="hidden" value={activeCaptionId} />
                            <input name="index" type="hidden" value={String(activeIndex)} />
                            <button
                                className={`rounded-lg border px-4 py-2 text-sm font-medium ${
                                    userVote === 1
                                        ? "border-emerald-500 bg-emerald-500/40 text-emerald-100"
                                        : "border-emerald-600/40 bg-emerald-600/20 text-emerald-200"
                                }`}
                                name="vote"
                                type="submit"
                                value="up"
                            >
                                Upvote
                            </button>
                            <button
                                className={`rounded-lg border px-4 py-2 text-sm font-medium ${
                                    userVote === -1
                                        ? "border-rose-500 bg-rose-500/40 text-rose-100"
                                        : "border-rose-600/40 bg-rose-600/20 text-rose-200"
                                }`}
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
                    ) : (
                        <p className="mt-4 text-xs text-zinc-500">This caption cannot be voted on because it has no ID.</p>
                    )}

                    <div className="mt-6 flex items-center justify-between gap-2">
                        <Link className="rounded-lg border border-zinc-700 px-4 py-2 text-sm" href={`/week4?i=${previousIndex}`}>
                            Previous
                        </Link>
                        <Link className="rounded-lg border border-zinc-700 px-4 py-2 text-sm" href={`/week4?i=${nextIndex}`}>
                            Next
                        </Link>
                    </div>
                </section>
            )}
        </main>
    );
}
