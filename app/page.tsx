import Link from "next/link";
import LoginButton from "@/app/auth/login-button";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

const assignments = [
    { label: "Week 2 - Supabase List", href: "/week2" },
    { label: "Week 3 - Protected Route", href: "/protected" },
    { label: "Week 4 - Caption Rating", href: "/week4" },
    { label: "Week 5 - Upload + Captions", href: "/week5" },
    { label: "Project 1 - Caption Rating App", href: "/project1" },
];

export default async function Home() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (user) {
        redirect("/project1");
    }

    return (
        <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-8 px-6 py-16">
            <header className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
                <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Welcome</p>
                <h1 className="mt-2 text-3xl font-semibold text-zinc-900 dark:text-zinc-100">Caption Rating App</h1>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
                    Sign in to start voting immediately in Project 1.
                </p>
                <div className="mt-5">
                    <LoginButton />
                </div>
            </header>

            <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Assignment links</h2>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
                    You can still open previous assignments directly.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                    {assignments.map((item) => (
                        <Link
                            className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-800 transition active:translate-y-0.5 dark:text-zinc-200"
                            href={item.href}
                            key={item.href}
                        >
                            {item.label}
                        </Link>
                    ))}
                </div>
            </section>
        </main>
    );
}
