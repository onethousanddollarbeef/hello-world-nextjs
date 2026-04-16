"use client";

import { useMemo, useRef, useState } from "react";
import { createClient } from "@/utils/supabase/client";

type PipelineCaption = {
    id?: string;
    content?: string;
    [key: string]: unknown;
};

const apiBaseUrl = "https://api.almostcrackd.ai";
const supportedTypes = new Set([
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/heic",
]);

function formatStepStatus(status: string) {
    if (status === "idle") {
        return "Ready";
    }

    if (status === "running") {
        return "In progress...";
    }

    if (status === "done") {
        return "Done";
    }

    return status;
}

export default function Week5UploadClient() {
    const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState("idle");
    const [currentStep, setCurrentStep] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [captions, setCaptions] = useState<PipelineCaption[]>([]);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [imageId, setImageId] = useState<string | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    const canSubmit = useMemo(() => file !== null && status !== "running", [file, status]);
    const totalSteps = 4;
    const progressPercent = Math.min(Math.max((currentStep / totalSteps) * 100, 0), 100);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        abortControllerRef.current?.abort();
        abortControllerRef.current = null;
        setStatus("idle");
        const selected = event.target.files?.[0] ?? null;
        setCaptions([]);
        setError(null);
        setImageUrl(null);
        setImageId(null);
        setCurrentStep(0);

        if (!selected) {
            setFile(null);
            return;
        }

        if (!supportedTypes.has(selected.type)) {
            setFile(null);
            setError(
                "Unsupported file type. Use image/jpeg, image/jpg, image/png, image/webp, image/gif, or image/heic.",
            );
            return;
        }

        setFile(selected);
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!file) {
            setError("Please choose an image first.");
            return;
        }

        setStatus("running");
        setCurrentStep(0);
        setError(null);
        setCaptions([]);
        abortControllerRef.current?.abort();
        const controller = new AbortController();
        abortControllerRef.current = controller;

        const supabase = createClient();
        const {
            data: { session },
        } = await supabase.auth.getSession();

        const token = session?.access_token;

        if (!token) {
            setStatus("idle");
            setError("You must be logged in to call the caption pipeline.");
            return;
        }

        const authHeaders = {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        };

        const fetchWithStepTimeout = async (url: string, options: RequestInit, timeoutMs = 30000) => {
            const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
            try {
                return await fetch(url, { ...options, signal: controller.signal });
            } finally {
                clearTimeout(timeoutId);
            }
        };

        try {
            const presignedResponse = await fetchWithStepTimeout(`${apiBaseUrl}/pipeline/generate-presigned-url`, {
                method: "POST",
                headers: authHeaders,
                body: JSON.stringify({ contentType: file.type }),
            });

            if (!presignedResponse.ok) {
                const body = await presignedResponse.text();
                setStatus("idle");
                setCurrentStep(0);
                setError(`Step 1 failed: ${body || presignedResponse.statusText}`);
                return;
            }
            setCurrentStep(1);

            const presignedPayload = (await presignedResponse.json()) as {
                presignedUrl: string;
                cdnUrl: string;
            };

            const uploadResponse = await fetchWithStepTimeout(
                presignedPayload.presignedUrl,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": file.type,
                    },
                    body: file,
                },
                60000,
            );

            if (!uploadResponse.ok) {
                const body = await uploadResponse.text();
                setStatus("idle");
                setCurrentStep(0);
                setError(`Step 2 failed: ${body || uploadResponse.statusText}`);
                return;
            }
            setCurrentStep(2);

            setImageUrl(presignedPayload.cdnUrl);

            const registerResponse = await fetchWithStepTimeout(`${apiBaseUrl}/pipeline/upload-image-from-url`, {
                method: "POST",
                headers: authHeaders,
                body: JSON.stringify({ imageUrl: presignedPayload.cdnUrl, isCommonUse: false }),
            });

            if (!registerResponse.ok) {
                const body = await registerResponse.text();
                setStatus("idle");
                setCurrentStep(0);
                setError(`Step 3 failed: ${body || registerResponse.statusText}`);
                return;
            }
            setCurrentStep(3);

            const registerPayload = (await registerResponse.json()) as { imageId: string };
            setImageId(registerPayload.imageId);

            const captionsResponse = await fetchWithStepTimeout(
                `${apiBaseUrl}/pipeline/generate-captions`,
                {
                    method: "POST",
                    headers: authHeaders,
                    body: JSON.stringify({ imageId: registerPayload.imageId }),
                },
                60000,
            );

            if (!captionsResponse.ok) {
                const body = await captionsResponse.text();
                setStatus("idle");
                setCurrentStep(0);
                setError(`Step 4 failed: ${body || captionsResponse.statusText}`);
                return;
            }

            const captionsPayload = (await captionsResponse.json()) as PipelineCaption[];
            setCaptions(Array.isArray(captionsPayload) ? captionsPayload : []);
            setCurrentStep(4);
            setStatus("done");
        } catch (caughtError) {
            const message = caughtError instanceof Error ? caughtError.message : "Unexpected pipeline error.";
            setStatus("idle");
            setCurrentStep(0);
            if (controller.signal.aborted) {
                setError("Pipeline stopped. You can choose another photo and run it again.");
                return;
            }

            setError(`Pipeline failed: ${message}`);
        } finally {
            abortControllerRef.current = null;
        }
    };

    return (
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
            <h2 className="text-lg font-semibold">Upload an image and generate captions</h2>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">Status: {formatStepStatus(status)}</p>
            <div className="mt-3">
                <div className="mb-2 flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-300">
                    <span>
                        Step {Math.min(currentStep + (status === "running" ? 1 : 0), totalSteps)} of {totalSteps}
                    </span>
                    <span>{Math.round(progressPercent)}%</span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full border border-pink-300 bg-zinc-200 dark:border-pink-500/40 dark:bg-zinc-800">
                    <div
                        className="h-full bg-pink-500 transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-zinc-600 dark:text-zinc-300 md:grid-cols-4">
                    <span className={currentStep >= 1 ? "font-semibold text-pink-700 dark:text-pink-200" : ""}>1) Presign URL</span>
                    <span className={currentStep >= 2 ? "font-semibold text-pink-700 dark:text-pink-200" : ""}>2) Upload image</span>
                    <span className={currentStep >= 3 ? "font-semibold text-pink-700 dark:text-pink-200" : ""}>3) Register image</span>
                    <span className={currentStep >= 4 ? "font-semibold text-pink-700 dark:text-pink-200" : ""}>4) Generate captions</span>
                </div>
            </div>

            <form className="mt-4 flex flex-col gap-3" onSubmit={handleSubmit}>
                <input
                    accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/heic"
                    className="w-fit cursor-pointer rounded-lg border border-pink-700 bg-pink-100 px-3 py-2 text-sm text-pink-900 file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-pink-700 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-pink-50 hover:bg-pink-200"
                    onChange={handleFileChange}
                    type="file"
                />
                <button
                    className="w-fit rounded-lg border border-pink-700 bg-pink-100 px-4 py-2 text-sm font-medium text-pink-900 transition active:translate-y-0.5 disabled:opacity-50 dark:border-pink-300 dark:bg-pink-900/40 dark:text-pink-50"
                    disabled={!canSubmit}
                    type="submit"
                >
                    {status === "running" ? "Running..." : captions.length > 0 ? "Run pipeline again" : "Run 4-step caption pipeline"}
                </button>
            </form>

            {error ? (
                <p className="mt-4 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-200">
                    {error}
                </p>
            ) : null}

            {imageUrl ? (
                <p className="mt-4 break-all text-xs text-zinc-500 dark:text-zinc-400">Uploaded image URL: {imageUrl}</p>
            ) : null}

            {imageId ? (
                <p className="mt-1 break-all text-xs text-zinc-500 dark:text-zinc-400">Image ID: {imageId}</p>
            ) : null}

            {captions.length > 0 ? (
                <ul className="mt-5 space-y-2">
                    {captions.map((caption, index) => (
                        <li
                            className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-black"
                            key={String(caption.id ?? index)}
                        >
                            {typeof caption.content === "string" && caption.content.trim().length > 0
                                ? caption.content
                                : JSON.stringify(caption)}
                        </li>
                    ))}
                </ul>
            ) : null}
        </section>
    );
}
