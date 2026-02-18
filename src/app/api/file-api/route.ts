import { NextResponse } from "next/server";
import {
    GoogleGenAI,
    createPartFromUri,
} from "@google/genai";

export const runtime = "nodejs"; // IMPORTANT

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY!,
});

// In-memory conversation store (demo only)
let conversation: any[] = [];
let uploadedFile: any = null;

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { prompt } = body;
        
        if (!prompt) {
            return NextResponse.json(
                { success: false, message: "Prompt is required" },
                { status: 422 }
            );
        }
        
        // Upload file only once
        if (!uploadedFile) {
            uploadedFile = await ai.files.upload({
                file: "public/tabla.jpeg", // or pdf
                config: { mimeType: "image/jpeg" },
            });
            
            // Initial message with file
            conversation.push({
                role: "user",
                parts: [
                    createPartFromUri(uploadedFile.uri, uploadedFile.mimeType),
                    { text: prompt },
                ],
            });
        } else {
            // Subsequent prompts
            conversation.push({
                role: "user",
                parts: [{ text: prompt }],
            });
        }
        
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: conversation,
        });
        
        const text = response.text;
        
        conversation.push({
            role: "model",
            parts: [{ text }],
        });

        console.log(conversation);
        console.log("-------------------------------------");
        
        return NextResponse.json({
            success: true,
            reply: text,
        });
        
    } catch (error: any) {
        console.error(error);
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}