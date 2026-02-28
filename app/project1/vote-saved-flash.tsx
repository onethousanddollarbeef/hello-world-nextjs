"use client";

import { useEffect, useState } from "react";

type VoteSavedFlashProps = {
    imageSrc: string;
};

export default function VoteSavedFlash({ imageSrc }: VoteSavedFlashProps) {
    const [visible, setVisible] = useState(true);
    const [imageAvailable, setImageAvailable] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(false);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    if (!visible) {
        return null;
    }

    return (
        <section className="fixed inset-x-0 top-4 z-50 mx-auto w-[min(92vw,560px)] rounded-2xl border border-amber-300/70 bg-black/90 p-4 text-center shadow-2xl">
            <p className="text-lg font-semibold text-amber-200">Vote Saved!</p>
            <img
                alt="Vote saved celebration"
                className="mx-auto mt-2 h-24 w-auto rounded-lg border border-amber-200/40 object-cover"
                onError={() => setImageAvailable(false)}
                src={imageSrc}
            />
            {!imageAvailable ? (
                <p className="mt-1 text-xs text-amber-200">Upload your image to public/vote-saved.png</p>
            ) : null}
            <p className="mt-2 text-sm uppercase tracking-[0.2em] text-amber-100">CRITICAL SUCCESS</p>
        </section>
    );
}