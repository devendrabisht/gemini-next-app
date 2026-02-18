"use server";

import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;

export async function POST(request: Request) {
    try {
        const formData = await request.formData();

        const model = formData.get("model");
        const prompt = formData.get("prompt");
        const imageUrlValue = formData.get("imageUrl");
        const imageFile = formData.get("image") as File | null;

        if (!model || typeof model !== "string") {
            return NextResponse.json(
                { success: false, message: "model is required" },
                { status: 422 }
            );
        }

        if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
            return NextResponse.json(
                { success: false, message: "prompt is required" },
                { status: 422 }
            );
        }

        const imageUrl = typeof imageUrlValue === "string" ? imageUrlValue.trim() : "";

        if (!imageFile && !imageUrl) {
            return NextResponse.json(
                { success: false, message: "Either an uploaded image or imageUrl is required" },
                { status: 422 }
            );
        }

        let base64ImageData: string;
        let mimeType = "image/jpeg";

        if (imageFile) {
            const arrayBuffer = await imageFile.arrayBuffer();
            base64ImageData = Buffer.from(arrayBuffer).toString("base64");
            mimeType = imageFile.type || mimeType;
        } else {
            const fetchResponse = await fetch(imageUrl);

            if (!fetchResponse.ok) {
                return NextResponse.json(
                    { success: false, message: "Unable to fetch image from URL" },
                    { status: 400 }
                );
            }

            const contentType = fetchResponse.headers.get("content-type");
            if (contentType) {
                mimeType = contentType.split(";")[0] || mimeType;
            }

            const imageArrayBuffer = await fetchResponse.arrayBuffer();
            base64ImageData = Buffer.from(imageArrayBuffer).toString("base64");
        }

        const contents = [
            {
                text: prompt,
            },
            {
                inlineData: {
                    mimeType,
                    data: base64ImageData,
                },
            },
        ];

        const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
        const response = await ai.models.generateContent({
            model,
            contents,
        });

        // Align with existing usage style in multimodal route
        const result: any = (response as any).text ?? "";

        return NextResponse.json(
            {
                success: true,
                data: result,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { success: false, message: "Invalid request body" },
            { status: 400 }
        );
    }
}
