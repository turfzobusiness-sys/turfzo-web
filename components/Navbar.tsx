"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Search, Bell, User, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { status, convexUser, signOut } = useAuth();
  const isAuthed = status === "authenticated";

  const activeLink = (() => {
    if (pathname === "/explore") return "Explore Turfs";
    if (pathname === "/tournaments") return "Tournaments";
    if (pathname === "/how-it-works") return "How It Works";
    if (pathname === "/contact") return "Contact Us";
    if (pathname?.startsWith("/profile")) return "Profile";
    if (pathname?.startsWith("/bookings")) return "Bookings";
    return "Home";
  })();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Explore Turfs", href: "/explore" },
    { name: "Tournaments", href: "/tournaments" },
    { name: "How It Works", href: "/how-it-works" },
    { name: "Contact Us", href: "/contact" },
  ];

  return (
    <>
      <motion.header
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] as const }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-bg-dark/85 backdrop-blur-md border-b border-white/5 py-4 shadow-card-shadow"
            : "bg-transparent py-6 border-b border-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-8 flex items-center justify-between">
          
          {/* Logo & Tagline */}
          <Link href="/" className="flex items-center gap-2.5 group select-none">
            <Image
              src="/turfzo_mascot.svg"
              alt="Turfzo Logo"
              width={38}
              height={38}
              className="w-9.5 h-9.5"
            />
            <div className="flex flex-col justify-center leading-none">
              <span className="font-poppins font-extrabold text-[22px] text-text-main tracking-tight flex items-center">
                turf<span className="text-brand-lime">zo</span>
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`relative font-sans text-sm font-medium tracking-wide transition-colors py-2 ${
                  activeLink === link.name ? "text-text-main" : "text-text-muted hover:text-text-main"
                }`}
              >
                {link.name}
                {activeLink === link.name && (
                  <motion.span
                    layoutId="activeNavIndicator"
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand-lime rounded-full"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            ))}
          </nav>

          {/* Desktop Right Actions (Search, Bell, Auth) */}
          <div className="hidden md:flex items-center gap-4">
            {/* Search Button */}
            <button className="p-2.5 bg-surface-dark border border-white/5 hover:border-white/20 rounded-[12px] text-text-muted hover:text-text-main transition-all duration-300">
              <Search className="w-4 h-4" />
            </button>

            {/* Notification Bell */}
            <button className="relative p-2.5 bg-surface-dark border border-white/5 hover:border-white/20 rounded-[12px] text-text-muted hover:text-text-main transition-all duration-300">
              <Bell className="w-4 h-4" />
              <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-brand-lime rounded-full" />
            </button>

            {isAuthed ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/profile"
                  className="flex items-center gap-2 bg-surface-dark border border-white/5 hover:border-brand-lime/20 rounded-[12px] px-4 py-2 transition-all duration-300"
                >
                  <div className="w-7 h-7 rounded-full bg-brand-lime/20 flex items-center justify-center">
                    <User className="w-4 h-4 text-brand-lime" />
                  </div>
                  <span className="font-sans text-sm font-medium text-text-main">
                    {convexUser?.display_name ?? convexUser?.email?.split("@")[0] ?? "User"}
                  </span>
                </Link>
                <button
                  onClick={signOut}
                  className="p-2.5 bg-surface-dark border border-white/5 hover:border-red-500/20 rounded-[12px] text-text-muted hover:text-red-400 transition-all duration-300"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="bg-brand-lime text-black font-poppins font-semibold px-6 py-2.5 rounded-[12px] hover:bg-brand-lime-hover transition-all duration-300 active:scale-98"
              >
                Login / Sign Up
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-3">
            <button className="p-2 bg-surface-dark border border-white/5 rounded-[10px] text-text-muted hover:text-text-main">
              <Search className="w-4 h-4" />
            </button>
            <button className="relative p-2 bg-surface-dark border border-white/5 rounded-[10px] text-text-muted hover:text-text-main">
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-brand-lime rounded-full" />
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-text-main hover:text-brand-lime transition-colors focus:outline-none"
              aria-label="Toggle Menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>

        {/* Mobile Drawer Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="absolute top-full left-0 right-0 z-40 bg-surface-dark/95 backdrop-blur-lg border-b border-white/5 md:hidden overflow-hidden shadow-card-shadow"
            >
              <div className="px-6 py-8 flex flex-col gap-6">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={`font-poppins text-lg font-medium tracking-wide transition-colors ${
                      activeLink === link.name ? "text-brand-lime" : "text-text-muted hover:text-text-main"
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
                {isAuthed ? (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2 px-1">
                      <div className="w-8 h-8 rounded-full bg-brand-lime/20 flex items-center justify-center">
                        <User className="w-4 h-4 text-brand-lime" />
                      </div>
                      <span className="font-sans text-sm text-text-muted">
                        {convexUser?.display_name ?? convexUser?.email ?? "User"}
                      </span>
                    </div>
                    <button
                      onClick={() => { setIsOpen(false); signOut(); }}
                      className="bg-surface-dark border border-white/5 text-text-muted text-center font-poppins font-semibold py-3.5 rounded-pill hover:text-red-400 transition-all duration-300 w-full"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/auth/login"
                    onClick={() => setIsOpen(false)}
                    className="bg-brand-lime text-black text-center font-poppins font-semibold py-3 rounded-[12px] hover:bg-brand-lime-hover transition-all duration-300 w-full block"
                  >
                    Login / Sign Up
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>
    </>
  );
}
