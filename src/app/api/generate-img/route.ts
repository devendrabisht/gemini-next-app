import { GoogleGenAI } from "@google/genai";

import fs from "node:fs";
import path from "node:path";

// import mime from "mime-types";

// ✅ Use file info instead:
// const contentType = file.type || "application/octet-stream";


// or

// const ext = path.extname(file.name);

import { writeFile } from "fs/promises";

import Replicate from "replicate";

type ReplicateFile = {
    url: () => string;
};

export async function POST(req: Request) {
    const { model, prompt } = await req.json();

    const tempDirName = "temp";
    const tempDirPath = path.join(process.cwd(), "public", tempDirName); // Absolute path to /public/temp
    
    // Ensure directory exists
    if (!fs.existsSync(tempDirPath)) {
        fs.mkdirSync(tempDirPath, { recursive: true });
    }
    
    
    // const input = {
    //     prompt,
    //     aspect_ratio: "16:9",
    //     safety_filter_level: "block_medium_and_above"
    // };

    const input = {
        prompt,
        resolution: "1 MP",
        aspect_ratio: "1:1",
        input_images: [],
        output_format: "webp",
        output_quality: 80,
        safety_tolerance: 2,
        prompt_upsampling: false
    };

    const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });
    const output = await replicate.run(model, { input });
    console.log(JSON.stringify(output, null, 2));

    // const imageUrl = output.url(); // To access the file URL
    // const file = output as ReplicateFile;
    // const imageUrl = file.url();
    // console.log(imageUrl);

    const imgName = `generated-${Math.random() * 1000}.png`;
    const imgPath = path.join(tempDirPath, imgName);
    const imgUrl = `${tempDirName}/${imgName}`;
    await writeFile(imgPath, output); // To write the file to disk

    const imageUrl = output.url(); // To access the file URL
    
    return Response.json({
        image: imageUrl, // Passing image URL of generated image to frontend to be used as `src` of `img` tag
        imgUrl: imgUrl, // Passing image URL of generated image to frontend to be used as `src` of `img` tag
    });


    // return;



    // const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });
    // const response = await ai.models.generateContent({
    //     model: "gemini-3-pro-image-preview",
    //     contents: prompt,
    // });
    // console.log(JSON.stringify(response, null, 2));
    
    // for (const part of response.candidates[0].content.parts) {
    //     if (part.text) {
    //         console.log(part.text);
    //     } else if (part.inlineData) {
    //         const imgName = `generated-${Math.random() * 1000}.png`;
    //         const imgPath = path.join(tempDirPath, imgName);
    //         const imgUrl = `${tempDirName}/${imgName}`;

    //         const base64ImgData = part.inlineData.data;
    //         const imgBuffer = Buffer.from(base64ImgData, "base64");
    //         fs.writeFileSync(imgPath, imgBuffer); // Writing image to provided location as buffer(raw binary data)
    //         console.log(`Image saved at ${imgPath}`);

            
    //         return Response.json({
    //             image: imgUrl, // Passing image URL of generated image to frontend to be used as `src` of `img` tag
    //         });
    //     }
    // }

    // console.log("AFTER LOOP");
    
    // // const imageUrl = "https://goo.gle/instrument-img";
    // // const fetchResponse = await fetch(imageUrl);
    // // const imageArrayBuffer = await fetchResponse.arrayBuffer();
    // // const base64ImageData = Buffer.from(imageArrayBuffer).toString('base64');
    
    
    
    
    
    
    
    
    // const imagePath = path.join(
    //     process.cwd(),
    //     "public",
    //     "", // images
    //     "screenshot.png"
    // );
    
    // const mimeType = mime.lookup(imagePath) || "image/png"; // Getting MimeType of image
    
    // const imageBuffer = fs.readFileSync(imagePath); // Reading image from provided location as buffer(raw binary data)
    // const base64ImageData = imageBuffer.toString("base64"); // Converting buffer(bytes) to base64 string
    
    // // return Response.json({
    // //     image: `data:${mimeType};base64,${base64ImageData}`, // Generating Data URL using base64 image data to be used as `src` of `img` tag
    // // });
    
    // const fileName = `generated-${Math.random() * 1000}.png`;
    // const filePath = path.join(tempDir, fileName);

    // const imgBuffer = Buffer.from(base64ImageData, "base64"); // Converting base64 string to buffer(bytes)
    
    // console.log(filePath);
    // fs.writeFileSync(filePath, imgBuffer); // Writing image to provided location as buffer(raw binary data)
    
    // const imageUrl = `temp/${fileName}`;
    // return Response.json({
    //     image: imageUrl, // Passing image URL of generated image to frontend to be used as `src` of `img` tag
    // });
    
    return new Response("No image generated", { status: 500 });
}