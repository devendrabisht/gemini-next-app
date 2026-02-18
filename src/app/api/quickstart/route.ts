import { NextResponse } from "next/server";

import { cookies } from "next/headers";



import { GoogleGenAI } from "@google/genai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;

// GET – Fetch users
// export async function GET() {
//     try {
//         const requestUrl  = `${API_BASE_URL}/wc/store/v1/cart/items`;
        
//         // Read cart token from HTTP Cookie
//         const cartToken = await requireCartToken();
//         if( !cartToken ) {
//             return NextResponse.json(
//                 { success: false, message: "Cart Token is required" },
//                 { status: 422 }
//             );
//         }
        
//         const res = await fetch(requestUrl , {
//             method: "GET",
//             headers: {
//                 "Content-Type": "application/json",
//                 "Cart-Token": cartToken,
//             },
//             cache: "no-store", // Woo API should never be cached
//         });
        
//         if (!res.ok) {
//             const errorText  = await res.text();
//             return NextResponse.json(
//                 {
//                     success: false,
//                     status: res.status,
//                     message: errorText
//                 },
//                 {   status: res.status  }
//             );
//         }
        
//         // Parse response body as JSON
//         const cart = await res.json();
//         // console.log(cart);
        
//         return NextResponse.json(
//             {
//                 success: true,
//                 data: cart
//             },
//             {   status: 200 }
//         );
//     } catch (error) {
//         console.error("❌ Error: " + error);
//         return NextResponse.json(
//             {
//                 success: false,
//                 message: "Failed to fetch WooCommerce products",
//             },
//             {   status: 500 }
//         );
//     }
// }

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

        if (!body?.contents) {
            return NextResponse.json(
                { success: false, message: "contents is required" },
                { status: 422 }
            );
        }

        const model = body.model;
        const contents = body.contents;

        const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
        const response = await ai.models.generateContent({
            model: model, // "gemini-3-flash-preview",
            contents: contents, // "Explain how AI works in a few words",
        });
        const result = response.text;
        // console.log(result);
        
        return NextResponse.json(
            {
                success: true,
                data: result
            },
            {   status: 200 }
        );
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { success: false, message: "Invalid request body" },
            { status: 400 }
        );
    }
}