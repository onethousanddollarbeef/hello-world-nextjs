"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
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
    const [uploadedFileKey, setUploadedFileKey] = useState<string | null>(null);

    const canSubmit = useMemo(() => file !== null && status !== "running", [file, status]);
    const totalSteps = 4;
    const progressPercent = Math.round((currentStep / totalSteps) * 100);
    const currentFileKey = file ? `${file.name}:${file.size}:${file.lastModified}:${file.type}` : null;

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
        setCurrentStep(1);
        setError(null);
        setCaptions([]);
        abortControllerRef.current?.abort();
        const controller = new AbortController();
        abortControllerRef.current = controller;

        try {
            const supabase = createClient();
            const {
                data: { session },
            } = await supabase.auth.getSession();

            const token = session?.access_token;

            if (!token) {
                setStatus("idle");
                setCurrentStep(0);
                setError("You must be logged in to call the caption pipeline.");
                return;
            }

            const authHeaders = {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            };

            // Fast path: if this exact file was already uploaded in this session,
            // reuse the known imageId and only run caption generation.
            if (currentFileKey && uploadedFileKey === currentFileKey && imageId) {
                setCurrentStep(4);
                const captionsResponse = await fetch(`${apiBaseUrl}/pipeline/generate-captions`, {
                    method: "POST",
                    headers: authHeaders,
                    body: JSON.stringify({ imageId }),
                });

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
                return;
            }

            const presignedResponse = await fetch(`${apiBaseUrl}/pipeline/generate-presigned-url`, {
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

            const presignedPayload = (await presignedResponse.json()) as {
                presignedUrl: string;
                cdnUrl: string;
            };

            const uploadResponse = await fetch(presignedPayload.presignedUrl, {
                method: "PUT",
                headers: {
                    "Content-Type": file.type,
                },
                body: file,
            });

            if (!uploadResponse.ok) {
                const body = await uploadResponse.text();
                setStatus("idle");
                setCurrentStep(0);
                setError(`Step 2 failed: ${body || uploadResponse.statusText}`);
                return;
            }

            setCurrentStep(2);
            setImageUrl(presignedPayload.cdnUrl);

            const registerResponse = await fetch(`${apiBaseUrl}/pipeline/upload-image-from-url`, {
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

            const registerPayload = (await registerResponse.json()) as { imageId: string };
            setImageId(registerPayload.imageId);
            setUploadedFileKey(currentFileKey);
            setCurrentStep(3);

            const captionsResponse = await fetch(`${apiBaseUrl}/pipeline/generate-captions`, {
                method: "POST",
                headers: authHeaders,
                body: JSON.stringify({ imageId: registerPayload.imageId }),
            });

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
            setError(message);
        }
    };

    return (
        <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
            <h2 className="text-lg font-semibold">Upload an image and generate captions</h2>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">Status: {formatStepStatus(status)}</p>
            <div className="mt-4">
                <div className="mb-2 flex items-center justify-between text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                    <span>Step {Math.max(currentStep, 1)} of {totalSteps}</span>
                    <span>{progressPercent}%</span>
                </div>
                <div className="h-3 w-full rounded-full bg-zinc-200 dark:bg-zinc-800">
                    <div
                        className="h-3 rounded-full bg-pink-500 transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
                <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                    {currentStep <= 1 && "1) Generate presigned URL"}
                    {currentStep === 2 && "2) Upload image bytes"}
                    {currentStep === 3 && "3) Register image URL"}
                    {currentStep >= 4 && "4) Generate captions"}
                </p>
            </div>

            <form className="mt-4 flex flex-col gap-3" onSubmit={handleSubmit}>
                <input
                    accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/heic"
                    className="w-full rounded-lg border border-yellow-200 bg-zinc-950 px-3 py-2 text-base text-white file:mr-4 file:rounded-lg file:border file:border-yellow-200 file:bg-yellow-400 file:px-4 file:py-2 file:font-bold file:text-zinc-950 file:transition hover:file:bg-yellow-300"
                    onChange={handleFileChange}
                    type="file"
                />
                <button
                    className="w-fit rounded-lg border border-yellow-200 bg-yellow-400 px-4 py-2 text-base font-bold text-zinc-950 transition active:translate-y-0.5 disabled:opacity-50"
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
                <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
                    <div className="mb-3 text-center">
                        <p className="text-3xl">🎉</p>
                        <h3 className="text-3xl font-bold text-zinc-900">Your captions are ready!</h3>
                        <p className="text-sm text-zinc-500">The AI has spoken. Judge accordingly.</p>
                    </div>
                    <Image
                        alt="Uploaded meme preview"
                        className="mx-auto max-h-[360px] rounded-lg border border-zinc-200 object-contain"
                        height={360}
                        src={imageUrl}
                        unoptimized
                        width={360}
                    />
                </div>
            ) : null}

            {imageId ? (
                <p className="mt-1 break-all text-xs text-zinc-500 dark:text-zinc-400">Image ID: {imageId}</p>
            ) : null}

            {captions.length > 0 ? (
                <ul className="mt-5 space-y-3">
                    {captions.map((caption, index) => (
                        <li
                            className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-4 text-sm text-zinc-900 shadow-sm"
                            key={String(caption.id ?? index)}
                        >
                            <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">
                                😂 Caption {index + 1}
                            </p>
                            <p>
                                {typeof caption.content === "string" && caption.content.trim().length > 0
                                    ? caption.content
                                    : "No caption text returned."}
                            </p>
                        </li>
                    ))}
                </ul>
            ) : null}
        </section>
    );
}
