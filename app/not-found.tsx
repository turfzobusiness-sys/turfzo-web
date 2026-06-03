import Link from "next/link";
import Image from "next/image";
import { Home, Search } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-screen bg-bg-dark text-text-main">
      <Navbar />
      <main className="flex-grow flex items-center justify-center px-6 py-16">
        <div className="max-w-md w-full text-center">
          <div className="flex justify-center mb-6">
            <Image
              src="/turfzo_mascot.svg"
              alt="Mascot couldn't find the page"
              width={192}
              height={192}
              className="w-48 h-48 drop-shadow-xl"
            />
          </div>
          <h1 className="font-poppins text-3xl font-extrabold text-text-main mb-3">
            Page not found
          </h1>
          <p className="text-text-muted text-sm font-sans mb-8 leading-relaxed">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="bg-brand-lime hover:bg-brand-lime-hover text-black font-semibold text-sm px-6 py-3 rounded-md transition-all flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              Go home
            </Link>
            <Link
              href="/explore"
              className="bg-surface-dark border border-white/10 hover:border-brand-lime/30 text-text-main font-semibold text-sm px-6 py-3 rounded-md transition-all flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              Browse turfs
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
