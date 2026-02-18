// export const runtime = "nodejs";

import { NextResponse } from "next/server";

import { GoogleGenAI } from "@google/genai";

import * as fs from 'fs';
import path from "path";

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
        
        if (!body?.prompt) {
            return NextResponse.json(
                { success: false, message: "prompt is required" },
                { status: 422 }
            );
        }
        
        const { model, prompt } = body;
        // console.log(prompt );

        
        const imgPath = path.join(process.cwd(), "public", "tabla.jpeg");
        // console.log(imgPath );

        // ✅ Prepare Gemini contents
        // const contents = [
        //     {
        //         text: prompt //"Summarize this document"
        //     },
        //     {
        //         inlineData: {
        //             mimeType: 'image/jpeg',
        //             data: Buffer.from(fs.readFileSync(imgPath)).toString("base64")
        //         }
        //     }
        // ];
        // console.log(contents);


        const imageUrl = "https://goo.gle/instrument-img";
        const fetchResponse = await fetch(imageUrl);
        const imageArrayBuffer = await fetchResponse.arrayBuffer();
        const base64ImageData = Buffer.from(imageArrayBuffer).toString('base64');

        const contents = [
            {
                text: prompt //"Summarize this document"
            },
            {
                inlineData: {
                    mimeType: 'image/jpeg',
                    data: base64ImageData
                }
            }
        ];
        
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