import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

const assignments = [
    { label: "Week 2 - Supabase List", href: "/week2" },
    { label: "Week 3 - Protected Route", href: "/protected" },
    { label: "Week 4 - Caption Rating", href: "/week4" },
    { label: "Week 5 - Upload + Captions", href: "/week5" },
    { label: "Project 1 - Caption Rating App", href: "/project1" },
];

export default async function AssignmentsPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    const handleSignOut = async () => {
        "use server";

        const supabase = await createClient();
        await supabase.auth.signOut();
        redirect("/");
    };

    return (
        <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 px-6 py-16">
            <header className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Assignments</p>
                    <h1 className="text-3xl font-semibold text-zinc-900 dark:text-zinc-100">Previous Assignment Pages</h1>
                </div>
                <div className="flex items-center gap-2">
                    <Link className="rounded-lg border border-zinc-700 px-4 py-2 text-sm" href="/project1">
                        Back to Project 1
                    </Link>
                    {user ? (
                        <form action={handleSignOut}>
                            <button className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black" type="submit">
                                Sign out
                            </button>
                        </form>
                    ) : null}
                </div>
            </header>

            <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
                <ul className="space-y-3">
                    {assignments.map((item) => (
                        <li key={item.href}>
                            <Link
                                className="block rounded-lg border border-zinc-700 px-4 py-3 text-sm text-zinc-800 transition hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
                                href={item.href}
                            >
                                {item.label}
                            </Link>
                        </li>
                    ))}
                </ul>
            </section>
        </main>
    );
}
