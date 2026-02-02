import { supabase } from "@/lib/supabase";

type SupabaseRow = {
  id: string | number;
  name?: string | null;
  title?: string | null;
};

export default async function Home() {
  const tableName = process.env.SUPABASE_TABLE;
  const hasConfig = Boolean(supabase && tableName);

  const { data, error } = hasConfig
      ? await supabase!
          .from<SupabaseRow>(tableName!)
          .select("id,name,title")
          .limit(20)
      : { data: null, error: null };

  const items = data ?? [];

  return (
      <div className="min-h-screen bg-zinc-50 px-6 py-16 text-zinc-900 dark:bg-black dark:text-zinc-50">
        <main className="mx-auto flex w-full max-w-3xl flex-col gap-8">
          <header className="space-y-3">
            <p className="text-sm uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400">
              Supabase List
            </p>
            <h1 className="text-4xl font-semibold">Hello World</h1>
            <p className="text-base text-zinc-600 dark:text-zinc-300">
              This page loads rows from Supabase and renders them in a list.
            </p>
          </header>

          {!hasConfig ? (
              <section className="rounded-2xl border border-dashed border-zinc-300 bg-white p-6 text-sm text-zinc-600 shadow-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
                <p className="font-semibold text-zinc-800 dark:text-zinc-100">
                  Supabase configuration missing
                </p>
                <p className="mt-2">
                  Add <code>SUPABASE_URL</code>, <code>SUPABASE_ANON_KEY</code>, and{" "}
                  <code>SUPABASE_TABLE</code> environment variables to fetch data.
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
                  {tableName} items ({items.length})
                </h2>
                <ul className="mt-4 space-y-3">
                  {items.length === 0 ? (
                      <li className="text-sm text-zinc-500 dark:text-zinc-400">
                        No rows found in this table.
                      </li>
                  ) : (
                      items.map((item) => (
                          <li
                              key={String(item.id)}
                              className="rounded-xl border border-zinc-100 bg-zinc-50 px-4 py-3 text-sm text-zinc-700 shadow-sm dark:border-zinc-800 dark:bg-black dark:text-zinc-200"
                          >
                            <p className="font-medium text-zinc-900 dark:text-zinc-100">
                              {item.title ?? item.name ?? `Row ${item.id}`}
                            </p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                              ID: {item.id}
                            </p>
                          </li>
                      ))
                  )}
                </ul>
              </section>
          )}
        </main>
      </div>
  );
}
