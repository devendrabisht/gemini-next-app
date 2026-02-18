"use client";

import { useState, DragEvent, FormEvent, ChangeEvent } from "react";

export default function ImageUnderstandingPage() {
    const [model, setModel] = useState("gemini-3-flash-preview");
    const [prompt, setPrompt] = useState("Tell me about this image");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imageUrl, setImageUrl] = useState("");
    const [dragActive, setDragActive] = useState(false);
    const [loading, setLoading] = useState(false);
    const [responseText, setResponseText] = useState("");
    const [error, setError] = useState<string | null>(null);

    const handleFileSelect = (file: File | null) => {
        if (!file) {
            setImageFile(null);
            return;
        }

        if (!file.type.startsWith("image/")) {
            setError("Please upload a valid image file.");
            setImageFile(null);
            return;
        }

        setError(null);
        setImageFile(file);
    };

    const handleDrop = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setDragActive(false);

        const file = event.dataTransfer.files?.[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        if (!dragActive) {
            setDragActive(true);
        }
    };

    const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setDragActive(false);
    };

    const handleFileInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] ?? null;
        handleFileSelect(file);
    };

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setError(null);
        setResponseText("");

        if (!prompt.trim()) {
            setError("Prompt is required.");
            return;
        }

        if (!imageFile && !imageUrl.trim()) {
            setError("Please upload an image or provide an image URL.");
            return;
        }

        try {
            setLoading(true);
            const formData = new FormData();
            formData.append("model", model);
            formData.append("prompt", prompt);

            if (imageFile) {
                formData.append("image", imageFile);
            }

            if (imageUrl.trim()) {
                formData.append("imageUrl", imageUrl.trim());
            }

            const response = await fetch("/api/img-understanding", {
                method: "POST",
                body: formData,
            });

            const result = await response.json();

            if (!response.ok || !result?.success) {
                throw new Error(result?.message || "Request failed");
            }

            setResponseText(result.data ?? "");
        } catch (err: any) {
            setError(err?.message || "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main style={{ maxWidth: "720px", margin: "0 auto", padding: "2rem 1rem" }}>
            <h1>Image Understanding with Gemini</h1>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem" }}>
                <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                    <span>Model</span>
                    <select value={model} onChange={(e) => setModel(e.target.value)} style={{ padding: "0.5rem" }}>
                        <option value="gemini-3-flash-preview">gemini-3-flash-preview</option>
                        <option value="gemini-1.5-flash">gemini-1.5-flash</option>
                        <option value="gemini-1.5-pro">gemini-1.5-pro</option>
                    </select>
                </label>

                <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                    <span>Prompt</span>
                    <input
                        type="text"
                        value={prompt}
                        onChange={(event) => setPrompt(event.target.value)}
                        style={{ padding: "0.5rem" }}
                        placeholder="Describe what you want to know about the image"
                    />
                </label>

                <section style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <span>Upload Image (drag &amp; drop or browse)</span>
                    <div
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        style={{
                            border: "2px dashed #888",
                            borderRadius: "8px",
                            padding: "1.5rem",
                            textAlign: "center",
                            backgroundColor: dragActive ? "#f0f4ff" : "transparent",
                            cursor: "pointer",
                        }}
                    >
                        <p style={{ margin: 0 }}>Drag &amp; drop an image here</p>
                        <p style={{ margin: "0.5rem 0" }}>or</p>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileInputChange}
                        />
                        {imageFile && (
                            <p style={{ marginTop: "0.5rem", fontSize: "0.9rem" }}>
                                Selected file: <strong>{imageFile.name}</strong>
                            </p>
                        )}
                    </div>
                </section>

                <section style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                    <span>Or provide an image URL</span>
                    <input
                        type="url"
                        value={imageUrl}
                        onChange={(event) => setImageUrl(event.target.value)}
                        style={{ padding: "0.5rem" }}
                        placeholder="https://example.com/image.jpg"
                    />
                </section>

                <p style={{ fontSize: "0.85rem", color: "#555" }}>
                    The server will use the uploaded image if provided; otherwise it will fetch the image from the URL.
                </p>

                <button type="submit" disabled={loading} style={{ padding: "0.75rem 1rem", fontWeight: 600 }}>
                    {loading ? "Analyzing image..." : "Submit to Gemini"}
                </button>

                {error && (
                    <p style={{ color: "red", marginTop: "0.5rem" }}>
                        {error}
                    </p>
                )}
            </form>

            <hr style={{ margin: "2rem 0" }} />

            <section>
                <h2>Response</h2>
                <div
                    style={{
                        minHeight: "4rem",
                        padding: "1rem",
                        borderRadius: "8px",
                        border: "1px solid #ddd",
                        whiteSpace: "pre-wrap",
                    }}
                >
                    {responseText || "The response from Gemini will appear here."}
                </div>
            </section>
        </main>
    );
}
