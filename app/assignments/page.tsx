import Link from "next/link";
import SessionButton from "@/app/auth/session-button";

const assignments = [
    { label: "Week 2 - Supabase List", href: "/week2" },
    { label: "Week 3 - Protected Route", href: "/protected" },
    { label: "Week 4 - Caption Rating", href: "/week4" },
    { label: "Week 5 - Upload + Captions", href: "/week5" },
];

export default function AssignmentsPage() {
    return (
        <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 px-6 py-16">
            <div className="flex justify-start">
                <SessionButton returnTo="/assignments" />
            </div>
            <header className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Assignments</p>
                    <h1 className="text-3xl font-semibold text-zinc-900 dark:text-zinc-100">Previous Assignment Pages</h1>
                </div>
                <Link className="rounded-lg border border-yellow-200 bg-yellow-400 px-4 py-2 text-base font-bold text-zinc-950" href="/project1">
                    Back to Project 1
                </Link>
            </header>

            <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
                <ul className="space-y-3">
                    {assignments.map((item) => (
                        <li key={item.href}>
                            <Link
                                className="block rounded-lg border border-yellow-200 bg-yellow-400 px-4 py-3 text-base font-bold text-zinc-950 transition hover:bg-yellow-300"
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
