export default function Footer() {
    return (
        <footer className="bg-white border-t">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-sm text-gray-500 flex flex-col md:flex-row justify-between gap-4">
                <p>© 2026 MyWebsite. All rights reserved.</p>
                <div className="flex gap-6">
                    <a href="#" className="hover:text-black">Privacy</a>
                    <a href="#" className="hover:text-black">Terms</a>
                    <a href="#" className="hover:text-black">Support</a>
                </div>
            </div>
        </footer>
    );
}