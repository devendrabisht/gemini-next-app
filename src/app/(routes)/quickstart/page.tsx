"use client";

import { useState } from "react";

export default function QuickStart() {

    const [model, setModel] = useState("gemini-3-flash-preview");
    const [contents, setContents] = useState("Explain how AI works in a few words");
    const [geminiResponseData, setGeminiResponsData] = useState("");

    const nextAPIRequest = async () => {
        const response = await fetch("/api/quickstart", {
            method: "POST",
            body: JSON.stringify({
                model: model,
                contents: contents,
            })
        });
        const result = await response.json();

        const geminiResponse = result.data;
        setGeminiResponsData(geminiResponse);
    }

    return (
        <>
            <h1>Quickstart with Gemini API</h1>
            <textarea onChange={ (event) => setContents(event.target.value) } value={contents}></textarea>
            <button onClick={nextAPIRequest}>Make request to Gemini</button>
            <hr/>
            <p>{geminiResponseData}</p>
        </>
    );
}