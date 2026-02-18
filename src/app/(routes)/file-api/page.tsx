"use client";

import { useState } from "react";

type Message = {
    role: "user" | "model";
    text: string;
};

export default function ChatPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    
    async function sendMessage() {
        if (!input.trim()) return;
        
        const userMessage: Message = { role: "user", text: input };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setLoading(true);
        
        const res = await fetch("/api/file-api", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt: userMessage.text }),
        });
        
        const data = await res.json();
        
        if (data.success) {
            setMessages((prev) => [
                ...prev,
                { role: "model", text: data.reply },
            ]);
        }
        
        setLoading(false);
    }
    
    return (
        <div style={{ maxWidth: 700, margin: "40px auto" }}>
        <h2>Gemini Chat</h2>
        
        <div style={{ border: "1px solid #ccc", padding: 16, minHeight: 300 }}>
        {messages.map((m, i) => (
            <div key={i} style={{ marginBottom: 12 }}>
            <b>{m.role === "user" ? "You" : "Gemini"}:</b>
            <p>{m.text}</p>
            </div>
        ))}
        {loading && <p>Thinking...</p>}
        </div>
        
        <div style={{ display: "flex", marginTop: 12 }}>
        <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Ask something..."
        style={{ flex: 1, padding: 8 }}
        />
        <button onClick={sendMessage} style={{ marginLeft: 8 }}>
        Send
        </button>
        </div>
        </div>
    );
}