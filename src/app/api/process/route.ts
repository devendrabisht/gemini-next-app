import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

import { getBaseUrl } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/* IMPORTANT CONFIG */
/* ------------------------------------------------------------------ */

// Required for file uploads
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import Replicate from "replicate";

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

    const baseUrl = getBaseUrl(req);


    /* -------------------------------------------------------------- */
    /* Create temp folder */
    /* -------------------------------------------------------------- */

    const uploadDir = path.join(process.cwd(), "public", "temp");
    await mkdir(uploadDir, { recursive: true });

    /* -------------------------------------------------------------- */
    /* Save uploaded files (ORDER PRESERVED) */
    /* -------------------------------------------------------------- */

    const savedFiles: string[] = [];

    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const ext = path.extname(file.name) || ".png";
      const filename = `${crypto.randomUUID()}${ext}`;
      const filepath = path.join(uploadDir, filename);

      await writeFile(filepath, buffer);
      savedFiles.push(`${baseUrl}/temp/${filename}`);
    }

    // console.log(savedFiles);

    /* -------------------------------------------------------------- */
    /* 👉 CALL AI HERE (Replicate / Gemini / etc.)
       Use:
       - prompt
       - savedFiles[] (already ordered)
    -------------------------------------------------------------- */

    // MOCK RESULT (replace with AI output later)
    // const resultImageUrl = savedFiles[0];
    const input = {
        prompt,
        resolution: "1 MP",
        aspect_ratio: "match_input_image",
        input_images: savedFiles,
        output_format: "jpg",
        output_quality: 80,
        safety_tolerance: 2,
        prompt_upsampling: false
    };

    const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });
    const output = await replicate.run(model, { input });
    const stream = output as unknown as ReadableStream<Uint8Array>;
    const buffer = await streamToBuffer(stream);
    // console.log(JSON.stringify(output, null, 2));

    // const imageUrl = output.url(); // To access the file URL
    // console.log(imageUrl);

    const imgName = `generated-${Math.random() * 1000}.png`;
    const imgPath = path.join(tempDirPath, imgName);
    const imgUrl = `${tempDirName}/${imgName}`;
    await writeFile(imgPath, buffer); // To write the file to disk

    // return Response.json({
    //     image: imageUrl, // Passing image URL of generated image to frontend to be used as `src` of `img` tag
    //     imgUrl: imgUrl, // Passing image URL of generated image to frontend to be used as `src` of `img` tag
    // });

    /* -------------------------------------------------------------- */
    /* Response */
    /* -------------------------------------------------------------- */

    // const imageUrl = output.url().href; // To access the file URL

    return NextResponse.json({
      success: true,
      prompt,
      inputImages: savedFiles,
      resultImageUrl: imgUrl,
    });

  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}