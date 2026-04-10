"use client";

import { useFormStatus } from "react-dom";

type VoteButtonProps = {
    className: string;
    disabled?: boolean;
    label: string;
    value: "up" | "down";
};

export default function VoteButton({ className, disabled, label, value }: VoteButtonProps) {
    const { pending } = useFormStatus();

    return (
        <button
            className={className}
            disabled={pending || disabled}
            name="vote"
            type="submit"
            value={value}
        >
            {pending ? "Saving..." : label}
        </button>
    );
}
