"use client";

import { useState, useEffect } from "react";

import {
    NativeSelect,
    NativeSelectOptGroup,
    NativeSelectOption,
} from "@/components/ui/native-select"

export default function ImageGenerator() {
    const [model, setModel] = useState("");
    const [prompt, setPrompt] = useState("");
    const [image, setImage] = useState<string | null>(null);
    // const [image, setImage] = useState<string | null>("/tabla.jpeg");
    const [loading, setLoading] = useState(false);

    // alert(image);

    useEffect(() => {
        setImage("/tabla.jpeg");
    }, []);
    
    const generateImage = async () => {
        setLoading(true);
        setImage(null);
        
        const res = await fetch("/api/generate-img", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model,
                prompt
            }),
        });
        
        const data = await res.json();
        setImage(data.image);
        setLoading(false);
    };
    
    return (
        <div className="space-y-4">
            <NativeSelect onChange={
                (event) => {
                    setModel(event.target.value)
                }
            }>
                <NativeSelectOption value="">Select your Model</NativeSelectOption>
                <NativeSelectOption value="google/imagen-4">google/imagen-4</NativeSelectOption>
                <NativeSelectOption value="black-forest-labs/flux-2-pro">black-forest-labs/flux-2-pro</NativeSelectOption>
                <NativeSelectOption value="blueberry">Blueberry</NativeSelectOption>
                <NativeSelectOption value="pineapple">Pineapple</NativeSelectOption>
            </NativeSelect>

            <h1>Model Selected: {model}</h1>

            <input
                className="border p-2 w-full"
                placeholder="Enter prompt..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
            />
            
            <button
                onClick={generateImage}
                className="px-4 py-2 bg-black text-white rounded"
                disabled={loading}
            >
            Generate
            </button>
            
            {loading && (
                <>
                    <p>Generating image… ⏳</p>
                    <div className="animate-pulse w-64 h-64 bg-gray-200 rounded" />
                </>
            )}
            
            {image && (
                <img
                    src={image}
                    alt="Generated"
                    className="rounded-lg max-w-md transition-opacity duration-500 opacity-0"
                    onLoad={(e) => e.currentTarget.classList.remove("opacity-0")} //Fade-in animation
                />
            )}
        </div>
    );
}