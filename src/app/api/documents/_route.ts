export const runtime = "nodejs";

import { NextResponse } from "next/server";

import { GoogleGenAI } from "@google/genai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;

// POST – Add to Cart
export async function POST(request: Request) {
    try {
        const body = await request.json();
        // console.log(body);
        
        if (!body?.model) {
            return NextResponse.json(
                { success: false, message: "model is required" },
                { status: 422 }
            );
        }
        
        if (!body?.pdfUrl) {
            return NextResponse.json(
                { success: false, message: "pdfUrl is required" },
                { status: 422 }
            );
        }
        
        if (!body?.prompt) {
            return NextResponse.json(
                { success: false, message: "prompt is required" },
                { status: 422 }
            );
        }
        
        const { model, pdfUrl, prompt } = body;
        console.log(pdfUrl );

        
        const pdfResponse = await fetch(pdfUrl, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122 Safari/537.36",
                "Accept": "application/pdf"
            }
        });
        
        const pdfArrayBuffer = await pdfResponse.arrayBuffer();
        if ( !pdfArrayBuffer || pdfArrayBuffer.byteLength === 0 ) {
            return NextResponse.json(
                { success: false, message: "Invalid PDF response" },
                { status: 422 }
            );
        }
        // console.log(pdfArrayBuffer );

        
        // ✅ Prepare Gemini contents
        const contents = [
            {
                text: prompt //"Summarize this document"
            },
            {
                inlineData: {
                    mimeType: 'application/pdf',
                    data: Buffer.from(pdfArrayBuffer).toString("base64")
                }
            }
        ];
        // console.log(contents);
        
        // ✅ Init Gemini
        const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
        const response = await ai.models.generateContent({
            model: model, // "gemini-3-flash-preview",
            contents: contents
        });
        const result = response.text;
        console.log(result);
        
        return NextResponse.json(
            {
                success: true,
                data: result
            },
            {   status: 200 }
        );
    } catch (error) {
        console.log(error);
        console.error(error);
        return NextResponse.json(
            { success: false, message: "Invalid request body" },
            { status: 400 }
        );
    }
}