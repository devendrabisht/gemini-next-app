import Link from "next/link";

export default function Header() {
    return (
        <header className="bg-white border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                <h1 className="text-lg font-semibold">MyWebsite</h1>

                <nav className="hidden md:flex gap-6 text-sm">
                <Link href="#" className="hover:text-black">Home</Link>
                <Link href="/file-api" className="hover:text-black">File API</Link>
                <Link href="/img-understanding" className="hover:text-black">Img Understanding</Link>
                <Link href="#" className="hover:text-black">Contact</Link>
                </nav>

                <button className="md:hidden text-sm">Menu</button>
            </div>
        </header>
    );
}