import { NextResponse } from "next/server";
// import { writeFile, mkdir } from "fs/promises";
// import path from "path";
// import crypto from "crypto";

// import { getBaseUrl } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* IMPORTANT CONFIG */
/* ------------------------------------------------------------------ */

// Required for file uploads
// export const runtime = "nodejs";
// export const dynamic = "force-dynamic";

// import fs from "node:fs";
// import path from "node:path";
// import os from "node:os";

import Replicate from "replicate";;




async function streamToBuffer(stream: ReadableStream) {
    const reader = stream.getReader();
    const chunks: Uint8Array[] = [];
    
    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
    }
    
    return Buffer.concat(chunks);
}

// async function fileToBase64(file: File) {
//     const buffer = Buffer.from(await file.arrayBuffer());
//     return `data:${file.type};base64,${buffer.toString("base64")}`;
// }

/* ------------------------------------------------------------------ */
/* POST Handler */
/* ------------------------------------------------------------------ */

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        
        const prompt = formData.get("prompt") as string | null;
        const files = formData.getAll("files") as File[];
        
        if (!prompt || files.length === 0) {
            return NextResponse.json(
                { error: "Prompt and at least one image are required" },
                { status: 400 }
            );
        }
        
        /* -------------------------------------------------------------- */
        /* Resolve request origin (IMPORTANT) */
        /* -------------------------------------------------------------- */
        
        // const baseUrl = getBaseUrl(req);
        
        
        /* -------------------------------------------------------------- */
        /* Save uploaded files (ORDER PRESERVED) */
        /* -------------------------------------------------------------- */
        
        
        const inputImagesAsDataUrl: string[] = [];
        


        
        for (const file of files) {
            const imgBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(imgBuffer);
            const imageBase64 = buffer.toString("base64");
            const dataUrl = `data:${file.type};base64,${imageBase64}`;
            inputImagesAsDataUrl.push(dataUrl);
        } // file.type is like 'image/png'
        
        // console.log(inputImagesAsDataUrl);
        
        /* -------------------------------------------------------------- */
        /* 👉 CALL AI HERE (Replicate / Gemini / etc.)
        Use:
        - prompt
        - savedFiles[] (already ordered)
        -------------------------------------------------------------- */
        
        // MOCK RESULT (replace with AI output later)
        // const resultImageUrl = savedFiles[0];

        const model = "black-forest-labs/flux-2-pro";
        const outputFormat = "jpg";

        const input = {
            prompt,
            resolution: "1 MP",
            aspect_ratio: "match_input_image",
            input_images: inputImagesAsDataUrl,
            output_format: outputFormat,
            output_quality: 80,
            safety_tolerance: 2,
            prompt_upsampling: false
        };
        // console.log(input);
        
        
        
        const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });
        const output = await replicate.run(model, { input });
        // To access the file URL:
        // console.log(output.url()); //=> "http://example.com"
        
        // To write the file to disk:
        // fs.writeFile("my-image.png", output);
        
        
        const stream = output as unknown as ReadableStream<Uint8Array>;
        const buffer = await streamToBuffer(stream);
        const base64ImageData = buffer.toString("base64"); // Converting buffer(bytes) to base64 string
        // console.log(JSON.stringify(output, null, 2));
        
        // // // const imageUrl = output.url(); // To access the file URL
        // // // console.log(imageUrl);
        
        const imgName = `generated-${Math.random() * 1000}.${outputFormat}`;
        



        // const imgPath = path.join(tempDirPath, imgName);
        // const imgUrl = `${baseUrl}/${tempDirName}/${imgName}`;
        // await writeFile(imgPath, buffer); // To write the file to disk
        
        /* -------------------------------------------------------------- */
        /* Response */
        /* -------------------------------------------------------------- */
        const mimeType = `image/${outputFormat}`;
        return Response.json({
            success: true,
            resultImageUrl: `data:${mimeType};base64,${base64ImageData}`, // Generating Data URL using base64 image data to be used as `src` of `img` tag
            imgName
        });


        return Response.json({
            success: true,
            // resultImageUrl: imgUrl, // Passing image URL of generated image to frontend to be used as `src` of `img` tag
        });
        
        // const replicateImageUrl = output.url().href; // To access the file URL
        
        // return NextResponse.json({
        //   success: true,
        //   prompt,
        //   inputImages: savedFiles,
        //   resultImageUrl: imgUrl,
        //   output: output,
        // });
        
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}