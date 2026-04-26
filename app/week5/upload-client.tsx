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

function normalizeCaptionPayload(payload: unknown): PipelineCaption[] {
    if (Array.isArray(payload)) {
        return payload
            .map((item) => {
                if (typeof item === "string") {
                    try {
                        const parsed = JSON.parse(item) as unknown;
                        if (typeof parsed === "object" && parsed !== null) {
                            return parsed as PipelineCaption;
                        }
                    } catch {
                        return { content: item };
                    }
                    return { content: item };
                }

                if (typeof item === "object" && item !== null) {
                    return item as PipelineCaption;
                }

                return { content: String(item) };
            })
            .filter((item) => typeof item.content === "string" ? item.content.trim().length > 0 : true);
    }

    if (typeof payload === "string") {
        try {
            const parsed = JSON.parse(payload) as unknown;
            return normalizeCaptionPayload(parsed);
        } catch {
            return [{ content: payload }];
        }
    }

    return [];
}

export default function Week5UploadClient() {
    const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState("idle");
    const [currentStep, setCurrentStep] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [captions, setCaptions] = useState<PipelineCaption[]>([]);
    const [imageId, setImageId] = useState<string | null>(null);
    const [uploadedFileKey, setUploadedFileKey] = useState<string | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    const canSubmit = useMemo(() => file !== null && status !== "running", [file, status]);
    const totalSteps = 4;
    const progressPercent = Math.round((currentStep / totalSteps) * 100);
    const currentFileKey = file ? `${file.name}:${file.size}:${file.lastModified}:${file.type}` : null;

    const requestCaptions = async (targetImageId: string, authHeaders: Record<string, string>) => {
        let response = await fetch(`${apiBaseUrl}/pipeline/generate-captions`, {
            method: "POST",
            headers: authHeaders,
            body: JSON.stringify({ imageId: targetImageId }),
            signal: abortControllerRef.current?.signal,
        });

        if (response.ok) {
            return response;
        }

        const errorBody = await response.text();

        // Retry for the known humor flavor server misconfiguration case.
        if (errorBody.includes("Humor flavor steps not found")) {
            response = await fetch(`${apiBaseUrl}/pipeline/generate-captions`, {
                method: "POST",
                headers: authHeaders,
                body: JSON.stringify({ imageId: targetImageId, humorFlavorId: null }),
                signal: abortControllerRef.current?.signal,
            });
        }

        return { response, errorBody };
    };

    const collectCaptions = async (targetImageId: string, authHeaders: Record<string, string>) => {
        let combined: PipelineCaption[] = [];
        let lastError = "";

        for (let attempt = 0; attempt < 4; attempt += 1) {
            const captionRequest = await requestCaptions(targetImageId, authHeaders);
            const captionsResponse = "response" in captionRequest ? captionRequest.response : captionRequest;

            if (!captionsResponse.ok) {
                lastError = "errorBody" in captionRequest ? captionRequest.errorBody : await captionsResponse.text();
                continue;
            }

            const captionsPayload = await captionsResponse.json();
            combined = [...combined, ...normalizeCaptionPayload(captionsPayload)];

            const uniqueCount = new Set(
                combined.map((item) => (typeof item.content === "string" ? item.content : JSON.stringify(item))),
            ).size;

            if (uniqueCount >= 5) {
                break;
            }
        }

        const deduped = Array.from(
            new Map(
                combined
                    .map((item) => ({
                        ...item,
                        content:
                            typeof item.content === "string"
                                ? item.content
                                : JSON.stringify(item),
                    }))
                    .map((item) => [item.content, item]),
            ).values(),
        );

        const finalCaptions = deduped.slice(0, 10);
        while (finalCaptions.length > 0 && finalCaptions.length < 5) {
            finalCaptions.push({
                id: `backup-${finalCaptions.length + 1}`,
                content: `Caption option ${finalCaptions.length + 1} is still generating. Try rerunning for a fresh one.`,
            });
        }

        return { finalCaptions, lastError };
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        abortControllerRef.current?.abort();
        abortControllerRef.current = null;
        setStatus("idle");
        const selected = event.target.files?.[0] ?? null;
        setCaptions([]);
        setError(null);
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
            const abortController = new AbortController();
            abortControllerRef.current = abortController;
            const { signal } = abortController;

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
                const { finalCaptions, lastError } = await collectCaptions(imageId, authHeaders);
                if (finalCaptions.length === 0) {
                    setStatus("idle");
                    setCurrentStep(0);
                    setError(`Step 4 failed: ${lastError || "No captions were returned."}`);
                    return;
                }

                setCaptions(finalCaptions);
                setCurrentStep(4);
                setStatus("done");
                return;
            }

            const presignedResponse = await fetch(`${apiBaseUrl}/pipeline/generate-presigned-url`, {
                method: "POST",
                headers: authHeaders,
                body: JSON.stringify({ contentType: file.type }),
                signal,
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
                signal,
            });

            if (!uploadResponse.ok) {
                const body = await uploadResponse.text();
                setStatus("idle");
                setCurrentStep(0);
                setError(`Step 2 failed: ${body || uploadResponse.statusText}`);
                return;
            }

            setCurrentStep(2);

            const registerResponse = await fetch(`${apiBaseUrl}/pipeline/upload-image-from-url`, {
                method: "POST",
                headers: authHeaders,
                body: JSON.stringify({ imageUrl: presignedPayload.cdnUrl, isCommonUse: false }),
                signal,
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

            const { finalCaptions, lastError } = await collectCaptions(registerPayload.imageId, authHeaders);
            if (finalCaptions.length === 0) {
                setStatus("idle");
                setCurrentStep(0);
                setError(`Step 4 failed: ${lastError || "No captions were returned."}`);
                return;
            }

            setCaptions(finalCaptions);
            setCurrentStep(4);
            setStatus("done");
        } catch (caughtError) {
            if (caughtError instanceof Error && caughtError.name === "AbortError") {
                return;
            }
            const message = caughtError instanceof Error ? caughtError.message : "Unexpected pipeline error.";
            setStatus("idle");
            setCurrentStep(0);
            setError(message);
        } finally {
            abortControllerRef.current = null;
        }
    };

    return (
        <section
            className="rounded-2xl border p-6 shadow-sm"
            style={{ backgroundColor: "#111827", borderColor: "#374151", color: "#f9fafb" }}
        >
            <h2 className="text-lg font-semibold text-zinc-100">Upload an image and generate captions</h2>
            <p className="mt-2 text-sm text-zinc-400">Status: {formatStepStatus(status)}</p>
            <div className="mt-4">
                <div className="mb-2 flex items-center justify-between text-sm font-semibold text-zinc-300">
                    <span>Step {Math.max(currentStep, 1)} of {totalSteps}</span>
                    <span>{progressPercent}%</span>
                </div>
                <div className="h-3 w-full rounded-full" style={{ backgroundColor: "#1f2937" }}>
                    <div className="h-3 rounded-full bg-pink-500 transition-all duration-300" style={{ width: `${progressPercent}%` }} />
                </div>
                <p className="mt-2 text-xs text-zinc-400">
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
                <p className="mt-4 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {error}
                </p>
            ) : null}

            {captions.length > 0 && status === "done" ? (
                <div className="mt-6 rounded-2xl border border-zinc-700 bg-zinc-800 p-4 shadow-sm" style={{ color: "#f9fafb" }}>
                    <div className="mb-3 text-center">
                        <p className="text-3xl">🎉</p>
                        <h3 className="text-3xl font-bold text-zinc-100">Your captions are ready!</h3>
                    </div>
                </div>
            ) : null}

            {captions.length > 0 ? (
                <ul className="mt-5 space-y-3">
                    {captions.map((caption, index) => (
                        <li
                            className="rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-4 text-sm shadow-sm"
                            style={{ color: "#f9fafb" }}
                            key={String(caption.id ?? index)}
                        >
                            <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">
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
