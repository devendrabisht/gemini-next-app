"use client";

import { useState } from "react";

export default function QuickStart() {
    const [model, setModel] = useState("gemini-3-flash-preview");
    // const [pdfUrl, setPdfUrl] = useState("");
    const [prompt, setPrompt] = useState("Summarize this document");

    const [geminiResponseData, setGeminiResponsData] = useState("");

    const nextAPIRequest = async () => {
        const response = await fetch("/api/documents", {
            method: "POST",
            body: JSON.stringify({
                model: model,
                // pdfUrl: pdfUrl,
                prompt: prompt,
            })
        });
        const result = await response.json();

        const geminiResponse = result.data;
        setGeminiResponsData(geminiResponse);
    }

    return (
        <>
            <h1>Quickstart with Gemini API</h1>
            {/* <p>
                <input type="url" onChange={ (event) => setPdfUrl(event.target.value) } value={pdfUrl} />
            </p> */}
            <p>
                <input type="text" onChange={ (event) => setPrompt(event.target.value) } value={prompt} />
            </p>
            <p>
                <button onClick={nextAPIRequest}>Make request to Gemini</button>
            </p>
            <hr/>
            <p>{geminiResponseData}</p>
        </>
    );
}