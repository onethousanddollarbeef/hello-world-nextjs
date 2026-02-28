import Link from "next/link";
import LoginButton from "@/app/auth/login-button";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

const heroImageUrl = "https://images5.alphacoders.com/131/1317816.jpeg";
const project1SignatureImageUrl = "https://www.mtgnexus.com/img/ccc/ren/5697/255177.jpg?t=2024-07-11-15:08:54";

const spellArt = {
    friends: "https://bg3.wiki/w/images/2/22/Friends.webp?20231106090137",
    guidance: "https://bg3.wiki/w/images/8/8b/Guidance.webp",
    thaumaturgy: "https://bg3.wiki/w/images/c/cf/Thaumaturgy.webp",
    produceFlame: "https://bg3.wiki/w/images/3/39/Produce_Flame.webp",
    viciousMockery: "https://bg3.wiki/w/images/9/9f/Vicious_Mockery.webp",
    hideousLaughter: "https://www.mtgnexus.com/img/ccc/ren/5697/255177.jpg?t=2024-07-11-15:08:54",
    project1: "https://www.mtgnexus.com/img/ccc/ren/5697/255177.jpg?t=2024-07-11-15:08:54",
};

type WeekCard = {
    week: string;
    title: string;
    skill: string;
    description: string;
    href: string;
    cta: string;
    overlayImageUrl: string;
};

const weekCards: WeekCard[] = [
    {
        week: "Week 1",
        title: "Hello World",
        skill: "Friends",
        description: "First deployment basics: set up your app and start charming users.",
        href: "/",
        cta: "You are here",
        overlayImageUrl: spellArt.friends,
    },
    {
        week: "Week 2",
        title: "Supabase List",
        skill: "Guidance",
        description: "Use data guidance to query, inspect, and render table rows clearly.",
        href: "/week2",
        cta: "Open Week 2 card",
        overlayImageUrl: spellArt.guidance,
    },
    {
        week: "Week 3",
        title: "Protected Route",
        skill: "Thaumaturgy",
        description: "Secure route magic: auth flow, gated content, and dramatic protections.",
        href: "/protected",
        cta: "Open Week 3 card",
        overlayImageUrl: spellArt.thaumaturgy,
    },
    {
        week: "Week 4",
        title: "Caption Rating",
        skill: "Produce Flame",
        description: "Spark fast one-at-a-time voting with upvote/downvote updates.",
        href: "/week4",
        cta: "Open Week 4 card",
        overlayImageUrl: spellArt.produceFlame,
    },
    {
        week: "Week 5",
        title: "Upload + Captions",
        skill: "Vicious Mockery",
        description: "Upload an image and run the 4-step API caption pipeline.",
        href: "/week5",
        cta: "Open Week 5 card",
        overlayImageUrl: spellArt.viciousMockery,
    },
    {
        week: "Project 1",
        title: "Humor Project",
        skill: "Tasha's Hideous Laughter",
        description: "Rate shared uploaded memes from the database with upvote/downvote.",
        href: "/project1",
        cta: "Open Project 1",
        overlayImageUrl: spellArt.project1,
    },
];

export default async function Home() {
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
        <main className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 overflow-hidden px-6 py-16 text-zinc-100">
            <div
                aria-hidden="true"
                className="absolute inset-0 -z-10 bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage: `linear-gradient(rgba(10, 10, 18, 0.75), rgba(10, 10, 18, 0.85)), url('${heroImageUrl}')`,
                }}
            />

            <header className="space-y-3 rounded-xl border border-zinc-200/20 bg-black/40 p-6 backdrop-blur-sm">
                <p className="text-sm uppercase tracking-[0.3em] text-zinc-300">Assignment Hub</p>
                <h1 className="text-4xl font-semibold">Julia&apos;s Hideous Laughter</h1>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                    {user ? (
                        <form action={handleSignOut}>
                            <button
                                className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-black"
                                type="submit"
                            >
                                Log out
                            </button>
                        </form>
                    ) : (
                        <LoginButton />
                    )}
                    <p className="rounded-lg border border-emerald-700/40 bg-emerald-900/20 px-3 py-2 text-sm text-emerald-200">
                        {user ? <>Logged in as <strong>{user.email ?? user.id}</strong>.</> : "Not logged in"}
                    </p>
                </div>
                <p className="text-zinc-200">Leave a creature prone with laughter, without the ability to get up. The creature must have an Intelligence of 5 or more!</p>
            </header>

            <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {weekCards.map((card) => (
                        <article
                            key={card.week}
                            className="relative overflow-hidden rounded-2xl border border-zinc-200/20 bg-black/45 p-5 backdrop-blur-sm transition-transform duration-150 hover:-translate-y-1"
                        >
                            <div
                                aria-hidden="true"
                                className="pointer-events-none absolute -right-5 -top-8 h-36 w-36 opacity-35 blur-[0.2px]"
                                style={{
                                    backgroundImage: `url('${card.overlayImageUrl}')`,
                                    backgroundRepeat: "no-repeat",
                                    backgroundPosition: "center",
                                    backgroundSize: "contain",
                                    filter: "drop-shadow(0 0 10px rgba(255,200,140,0.4))",
                                }}
                            />

                            <p className="text-xs uppercase tracking-[0.2em] text-zinc-300">{card.week}</p>
                            <h2 className="mt-2 text-xl font-semibold">{card.title}</h2>
                            <p className="mt-1 text-xs uppercase tracking-[0.2em] text-amber-300">Spell Theme: {card.skill}</p>
                            <p className="mt-2 text-sm text-zinc-200">{card.description}</p>
                            <div className="mt-4 flex flex-wrap gap-2">
                                <Link
                                    className="rounded-lg border border-zinc-200/40 bg-black/30 px-4 py-2 text-sm transition active:translate-y-0.5"
                                    href={card.href}
                                >
                                    {card.cta}
                                </Link>
                            </div>
                        </article>
                    ))}
                </div>

                <aside className="overflow-hidden rounded-2xl border border-zinc-200/20 bg-black/45 p-3 backdrop-blur-sm">
                    <div
                        className="relative h-full min-h-[360px] w-full rounded-xl bg-cover bg-center"
                        style={{
                            backgroundImage: `linear-gradient(rgba(5, 5, 12, 0.2), rgba(5, 5, 12, 0.7)), url('${project1SignatureImageUrl}')`,
                        }}
                    >
                        <div className="absolute inset-x-0 bottom-0 rounded-b-xl bg-black/45 p-4">
                            <p className="text-xs uppercase tracking-[0.25em] text-zinc-300">Project 1 Finale</p>
                            <p className="mt-2 text-lg font-semibold">Humor Project</p>
                            <p className="mt-1 text-sm text-zinc-200">Culmination challenge: vote through shared memes one at a time.</p>
                        </div>
                    </div>
                </aside>
            </section>

            <section className="rounded-xl border border-zinc-200/20 bg-black/45 p-5 backdrop-blur-sm">
                <p className="font-medium">Baldur&apos;s Gate 3 appreciation corner</p>
                <div className="mt-2 space-y-3 text-sm text-zinc-200">
                    <p>
                        Baldur&apos;s Gate 3 is an all-timer RPG: incredible writing, unforgettable companions,
                        and the kind of player freedom that makes every playthrough feel genuinely different!
                    </p>
                    <p>
                        The game absolutely nails turn-based combat, environmental creativity, and class expression.
                        BG3 RULES! DND RULES!
                    </p>
                    <p>
                        From the soundtrack to voice acting to world design, it&apos;s just consistently excellent.
                        It&apos;s one of the best modern examples of how ambitious, story-rich games can still feel personal.
                    </p>
                    <p>
                        10/10 game. Peak fantasy adventure. Praise be to Baldur&apos;s Gate 3.
                    </p>
                </div>
            </section>
        </main>
    );
}