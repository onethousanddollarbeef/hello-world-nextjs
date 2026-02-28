import Link from "next/link";
import LoginButton from "@/app/auth/login-button";

const heroImageUrl = "https://images5.alphacoders.com/131/1317816.jpeg";
const tashaCardImageUrl = "https://www.mtgnexus.com/img/ccc/ren/5697/255177.jpg?t=2024-07-11-15:08:54";

const spellArt = {
    friends: "https://bg3.wiki/w/images/2/22/Friends.webp?20231106090137",
    guidance: "https://bg3.wiki/w/images/8/8b/Guidance.webp",
    thaumaturgy: "https://bg3.wiki/w/images/c/cf/Thaumaturgy.webp",
    produceFlame: "https://bg3.wiki/w/images/3/39/Produce_Flame.webp",
    hideousLaughter: "https://www.mtgnexus.com/img/ccc/ren/5697/255177.jpg?t=2024-07-11-15:08:54",
    project1: "https://bg3.wiki/w/images/3/39/Produce_Flame.webp",
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
        skill: "Tasha's Hideous Laughter",
        description: "Upload an image and run the 4-step API caption pipeline.",
        href: "/week5",
        cta: "Open Week 5 card",
        overlayImageUrl: spellArt.hideousLaughter,
    },
    {
        week: "Project 1",
        title: "Meme Voter",
        skill: "Produce Flame",
        description: "Rate shared uploaded memes from the database with upvote/downvote.",
        href: "/project1",
        cta: "Open Project 1",
        overlayImageUrl: spellArt.project1,
    },
];

export default function Home() {
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
                <p className="text-zinc-200">Leave a creature Prone Prone with laughter, without the ability to get up. The creature must have an Intelligence of 5 or more!</p>
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
                                {card.week === "Week 3" ? <LoginButton /> : null}
                            </div>
                        </article>
                    ))}
                </div>

                <aside className="overflow-hidden rounded-2xl border border-zinc-200/20 bg-black/45 p-3 backdrop-blur-sm">
                    <div
                        className="relative h-full min-h-[360px] w-full rounded-xl bg-cover bg-center"
                        style={{
                            backgroundImage: `linear-gradient(rgba(5, 5, 12, 0.2), rgba(5, 5, 12, 0.7)), url('${tashaCardImageUrl}')`,
                        }}
                    >
                        <div className="absolute inset-x-0 bottom-0 rounded-b-xl bg-black/45 p-4">
                            <p className="text-xs uppercase tracking-[0.25em] text-zinc-300">Signature Spell Card</p>
                            <p className="mt-2 text-lg font-semibold">Tasha&apos;s Hideous Laughter</p>
                            <p className="mt-1 text-sm text-zinc-200">Risum Peniatis! (&quot;Laugh out loud&quot;)</p>
                        </div>
                    </div>
                </aside>
            </section>

            <section className="rounded-xl border border-zinc-200/20 bg-black/45 p-5 backdrop-blur-sm">
                <p className="font-medium">Quick notes</p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-200">
                    <li>Week 2 and Week 4 depend on <code>SUPABASE_TABLE</code>.</li>
                    <li>Week 5 requires a logged-in user and API calls to <code>https://api.almostcrackd.ai</code>.</li>
                    <li>Week 3 sign-in returns through <code>/auth/callback</code>.</li>
                    <li>Week 4 stores votes as <code>+1/-1</code> and updates on re-vote.</li>
                    <li>Project 1 reads shared captions/images and uses the same vote mutation model.</li>
                </ul>
            </section>
        </main>
    );
}