"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type AutoDismissNoticeProps = {
    message: string;
};

export default function AutoDismissNotice({ message }: AutoDismissNoticeProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            const params = new URLSearchParams(searchParams.toString());
            params.delete("vote");
            params.delete("reason");
            const nextQuery = params.toString();
            router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname);
        }, 1000);

        return () => clearTimeout(timeoutId);
    }, [pathname, router, searchParams]);

    return (
        <section className="rounded-2xl border border-pink-300 bg-pink-100 p-4 text-sm font-semibold text-pink-900 dark:border-pink-400/40 dark:bg-pink-500/10 dark:text-pink-100">
            {message}
        </section>
    );
}
