import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

/* ------------------------------------------------------------------ */
/* IMPORTANT CONFIG */
/* ------------------------------------------------------------------ */

// Required for file uploads
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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
      savedFiles.push(`/temp/${filename}`);
    }

    /* -------------------------------------------------------------- */
    /* 👉 CALL AI HERE (Replicate / Gemini / etc.)
       Use:
       - prompt
       - savedFiles[] (already ordered)
    -------------------------------------------------------------- */

    // MOCK RESULT (replace with AI output later)
    const resultImageUrl = savedFiles[0];

    /* -------------------------------------------------------------- */
    /* Response */
    /* -------------------------------------------------------------- */

    return NextResponse.json({
      success: true,
      prompt,
      inputImages: savedFiles,
      resultImageUrl,
    });

  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}