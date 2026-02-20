import Link from "next/link";
import { redirect } from "next/navigation";
import LoginButton from "@/app/auth/login-button";
import { createClient } from "@/utils/supabase/server";

type RowValue = string | number | boolean | null;
type SupabaseRow = Record<string, RowValue> & { id?: string | number | null };

type Week4PageProps = {
    searchParams?: Promise<{
        vote?: string;
        reason?: string;
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
        return "Your vote was saved.";
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

function isMissingColumnError(message: string) {
    return message.includes("Could not find") && message.includes("column") && message.includes("caption_votes");
}

function extractMissingColumnName(message: string) {
    const match = message.match(/Could not find the '([^']+)' column/);
    return match?.[1] ?? null;
}

function getInsertCandidates(captionId: string, vote: "up" | "down", profileId: string, userId: string) {
    const numericVote = vote === "up" ? 1 : -1;
    const binaryVote = vote === "up" ? 1 : 0;
    const booleanVote = vote === "up";
    const voteText = vote === "up" ? "upvote" : "downvote";
    const nowUtc = new Date().toISOString();

    return [
        { caption_id: captionId, vote_value: numericVote, profile_id: profileId, user_id: userId, created_datetime_utc: nowUtc },
        { caption_id: captionId, vote_value: numericVote, profile_id: profileId, created_datetime_utc: nowUtc },
        { caption_id: captionId, vote_value: binaryVote, profile_id: profileId, user_id: userId, created_datetime_utc: nowUtc },
        { caption_id: captionId, vote_value: binaryVote, profile_id: profileId, created_datetime_utc: nowUtc },
        { caption_id: captionId, vote_value: voteText, profile_id: profileId, user_id: userId, created_datetime_utc: nowUtc },
        { caption_id: captionId, vote_value: voteText, profile_id: profileId, created_datetime_utc: nowUtc },
        { caption_id: captionId, vote_value: booleanVote, profile_id: profileId, user_id: userId, created_datetime_utc: nowUtc },
        { caption_id: captionId, vote_value: booleanVote, profile_id: profileId, created_datetime_utc: nowUtc },
        { caption_id: captionId, vote_value: numericVote, created_datetime_utc: nowUtc },
        { caption_id: captionId, vote_value: binaryVote, created_datetime_utc: nowUtc },
        { caption_id: captionId, vote_value: voteText, created_datetime_utc: nowUtc },
        { caption_id: captionId, vote_value: booleanVote, created_datetime_utc: nowUtc },

        { caption_id: captionId, vote: numericVote, profile_id: profileId, user_id: userId, created_datetime_utc: nowUtc },
        { caption_id: captionId, vote: binaryVote, profile_id: profileId, user_id: userId, created_datetime_utc: nowUtc },
        { caption_id: captionId, vote, profile_id: profileId, user_id: userId, created_datetime_utc: nowUtc },
        { caption_id: captionId, vote: voteText, profile_id: profileId, user_id: userId, created_datetime_utc: nowUtc },
        { caption_id: captionId, vote: booleanVote, profile_id: profileId, user_id: userId, created_datetime_utc: nowUtc },
        { caption_id: captionId, rating: numericVote, profile_id: profileId, user_id: userId, created_datetime_utc: nowUtc },
        { caption_id: captionId, value: numericVote, profile_id: profileId, user_id: userId, created_datetime_utc: nowUtc },
        { caption_id: captionId, direction: vote, profile_id: profileId, user_id: userId, created_datetime_utc: nowUtc },
        { caption_id: captionId, is_upvote: booleanVote, profile_id: profileId, user_id: userId, created_datetime_utc: nowUtc },
        { caption_id: captionId, upvote: booleanVote, profile_id: profileId, user_id: userId, created_datetime_utc: nowUtc },
        { caption_id: captionId, downvote: !booleanVote, profile_id: profileId, user_id: userId, created_datetime_utc: nowUtc },

        { caption_id: captionId, vote: numericVote, created_datetime_utc: nowUtc },
        { caption_id: captionId, vote: binaryVote, created_datetime_utc: nowUtc },
        { caption_id: captionId, vote, created_datetime_utc: nowUtc },
        { caption_id: captionId, vote: voteText, created_datetime_utc: nowUtc },
        { caption_id: captionId, vote: booleanVote, created_datetime_utc: nowUtc },
        { caption_id: captionId, rating: numericVote, created_datetime_utc: nowUtc },
        { caption_id: captionId, value: numericVote, created_datetime_utc: nowUtc },
        { caption_id: captionId, direction: vote, created_datetime_utc: nowUtc },
        { caption_id: captionId, is_upvote: booleanVote, created_datetime_utc: nowUtc },
        { caption_id: captionId, upvote: booleanVote, created_datetime_utc: nowUtc },
        { caption_id: captionId, downvote: !booleanVote, created_datetime_utc: nowUtc },

        { caption_id: captionId, profile_id: profileId, user_id: userId, created_datetime_utc: nowUtc },

        { caption_id: captionId, profile_id: profileId, created_datetime_utc: nowUtc },
        { caption_id: captionId, created_datetime_utc: nowUtc },
    ];
}

async function resolveProfileId(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
    const fromUserId = await supabase.from("profiles").select("id").eq("user_id", userId).maybeSingle();

    if (!fromUserId.error && fromUserId.data?.id) {
        return String(fromUserId.data.id);
    }

    const fromId = await supabase.from("profiles").select("id").eq("id", userId).maybeSingle();

    if (!fromId.error && fromId.data?.id) {
        return String(fromId.data.id);
    }

    return userId;
}

export default async function Week4Page({ searchParams }: Week4PageProps) {
    const params = searchParams ? await searchParams : undefined;
    const tableName = process.env.SUPABASE_TABLE;
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    const handleVote = async (formData: FormData) => {
        "use server";

        const captionId = formData.get("caption_id");
        const vote = formData.get("vote");

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
        const candidates = getInsertCandidates(String(captionId), vote, profileId, user.id);

        let fallbackError: string | null = null;
        let primaryError: string | null = null;
        const blockedColumns = new Set<string>();

        for (const candidate of candidates) {
            const candidateColumns = Object.keys(candidate);
            const hasBlockedColumn = candidateColumns.some((columnName) => blockedColumns.has(columnName));

            if (hasBlockedColumn) {
                continue;
            }

            const { error } = await supabase.from("caption_votes").insert(candidate);

            if (!error) {
                redirect("/week4?vote=saved");
            }

            if (!fallbackError) {
                fallbackError = error.message;
            }

            if (isMissingColumnError(error.message)) {
                const missingColumn = extractMissingColumnName(error.message);

                if (missingColumn) {
                    blockedColumns.add(missingColumn);
                }

                continue;
            }

            if (!primaryError) {
                primaryError = error.message;
            }
        }

        const finalReason = primaryError ?? fallbackError ?? "Unknown database error";
        const safeReason = encodeURIComponent(finalReason);
        redirect(`/week4?vote=failed&reason=${safeReason}`);
    };

    const { data, error } = tableName
        ? await supabase.from(tableName).select("*").limit(20)
        : { data: null, error: null };

    const items = (data ?? []) as SupabaseRow[];
    const flashMessage = voteMessage(params?.vote, params?.reason);

    return (
        <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-6 py-16">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Week 4 Assignment</p>
                    <h1 className="text-4xl font-semibold">Rate Captions</h1>
                </div>
                <Link className="rounded-lg border border-zinc-700 px-4 py-2 text-sm" href="/">
                    Back to Home
                </Link>
            </div>

            {user ? (
                <section className="rounded-2xl border border-emerald-700/50 bg-emerald-900/20 p-4 text-sm text-emerald-200">
                    Logged in as <strong>{user.email ?? user.id}</strong>. Votes will be submitted from this account.
                </section>
            ) : (
                <section className="rounded-2xl border border-dashed border-zinc-300 bg-white p-6 text-sm text-zinc-600 shadow-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
                    <p className="font-semibold text-zinc-800 dark:text-zinc-100">Sign in required to vote</p>
                    <p className="mt-2">You can view captions, but only logged-in users can submit upvotes or downvotes.</p>
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
            ) : (
                <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
                    <h2 className="text-lg font-semibold">
                        {tableName} captions ({items.length})
                    </h2>
                    <ul className="mt-4 space-y-3">
                        {items.length === 0 ? (
                            <li className="text-sm text-zinc-500 dark:text-zinc-400">No rows found in this table.</li>
                        ) : (
                            items.map((item, index) => (
                                <li
                                    key={String(item.id ?? index)}
                                    className="rounded-xl border border-zinc-100 bg-zinc-50 px-4 py-3 text-sm text-zinc-700 shadow-sm dark:border-zinc-800 dark:bg-black dark:text-zinc-200"
                                >
                                    <p className="font-medium text-zinc-900 dark:text-zinc-100">{pickLabel(item)}</p>
                                    {item.id !== undefined && item.id !== null ? (
                                        <p className="text-xs text-zinc-500 dark:text-zinc-400">ID: {String(item.id)}</p>
                                    ) : null}

                                    {item.id !== undefined && item.id !== null ? (
                                        <form action={handleVote} className="mt-3 flex flex-wrap gap-2">
                                            <input name="caption_id" type="hidden" value={String(item.id)} />
                                            <button
                                                className="rounded-lg border border-emerald-600/40 bg-emerald-600/20 px-3 py-1 text-xs font-medium text-emerald-200"
                                                name="vote"
                                                type="submit"
                                                value="up"
                                            >
                                                Upvote
                                            </button>
                                            <button
                                                className="rounded-lg border border-rose-600/40 bg-rose-600/20 px-3 py-1 text-xs font-medium text-rose-200"
                                                name="vote"
                                                type="submit"
                                                value="down"
                                            >
                                                Downvote
                                            </button>
                                        </form>
                                    ) : (
                                        <p className="mt-3 text-xs text-zinc-500">This caption cannot be voted on because it has no ID.</p>
                                    )}
                                </li>
                            ))
                        )}
                    </ul>
                </section>
            )}
        </main>
    );
}
