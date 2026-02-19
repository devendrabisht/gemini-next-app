import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}


// import { headers } from "next/headers";

// export async function GET() {
//   const headersList = headers();
//   const host = headersList.get("host") ?? "";

//   const isLocalhost =
//     host.includes("localhost") || host.startsWith("127.0.0.1");

//   return Response.json({ isLocalhost });
// }

export function getBaseUrl(req: Request): string {
    // 1️⃣ Best & stable
    if (process.env.NEXT_PUBLIC_APP_URL) {
        return process.env.NEXT_PUBLIC_APP_URL;
    }
    
    // 2️⃣ Proxy-safe (Vercel, Cloudflare, Nginx)
    const host = req.headers.get("x-forwarded-host");
    const proto = req.headers.get("x-forwarded-proto") ?? "https";
    
    if (host) {
        return `${proto}://${host}`;
    }
    
    // 3️⃣ Browser fallback
    const origin = req.headers.get("origin");
    if (origin) {
        return origin;
    }
    
    throw new Error("Unable to determine base URL");
}