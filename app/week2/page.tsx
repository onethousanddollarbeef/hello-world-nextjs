import Link from "next/link";
import { createClient } from "@/utils/supabase/server";

type RowValue = string | number | boolean | null;
type SupabaseRow = Record<string, RowValue> & { id?: string | number | null };

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

export default async function Week2Page() {
    const tableName = process.env.SUPABASE_TABLE;
    const supabase = await createClient();

    const { data, error } = tableName
        ? await supabase.from(tableName).select("*").limit(20)
        : { data: null, error: null };

    const items = (data ?? []) as SupabaseRow[];

    return (
        <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 px-6 py-16">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Week 2 Assignment</p>
                    <h1 className="text-4xl font-semibold">Supabase List Page</h1>
                </div>
                <Link className="rounded-lg border border-zinc-700 px-4 py-2 text-sm" href="/">
                    Back to Week 3
                </Link>
            </div>

            {!tableName ? (
                <section className="rounded-2xl border border-dashed border-zinc-300 bg-white p-6 text-sm text-zinc-600 shadow-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
                    <p className="font-semibold text-zinc-800 dark:text-zinc-100">Missing SUPABASE_TABLE</p>
                    <p className="mt-2">Set the environment variable <code>SUPABASE_TABLE</code> to your existing table name.</p>
                </section>
            ) : error ? (
                <section className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-200">
                    <p className="font-semibold">Unable to load Supabase data</p>
                    <p className="mt-2">{error.message}</p>
                </section>
            ) : (
                <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
                    <h2 className="text-lg font-semibold">
                        {tableName} items ({items.length})
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
                                </li>
                            ))
                        )}
                    </ul>
                </section>
            )}
        </main>
    );
}
