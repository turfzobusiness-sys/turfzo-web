import Link from "next/link";
import Image from "next/image";

const COLUMNS: { heading: string; links: { label: string; href: string }[] }[] = [
  {
    heading: "Marketplace",
    links: [
      { label: "Find a Turf", href: "/explore" },
      { label: "Tournaments", href: "/tournaments" },
      { label: "How it works", href: "/how-it-works" },
    ],
  },
  {
    heading: "Owners",
    links: [
      { label: "For Owners", href: "/owners" },
      { label: "List your Turf", href: "/owners/register" },
    ],
  },
  {
    heading: "Support",
    links: [
      { label: "Help", href: "/contact" },
      { label: "Refund policy", href: "/refund-policy" },
      { label: "Terms", href: "/terms" },
      { label: "Privacy", href: "/privacy" },
    ],
  },
];

/** Compact public footer. */
export default function MarketingFooter() {
  return (
    <footer className="border-t border-border-default bg-surface">
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-12 grid grid-cols-2 md:grid-cols-[1.5fr_1fr_1fr_1fr] gap-8">
        <div>
          <div className="flex items-center gap-2">
            <Image src="/turfzo_mascot.svg" alt="" width={24} height={24} className="w-6 h-6" />
            <span className="font-sans text-base font-extrabold tracking-tight text-text-main">Turfzo</span>
          </div>
          <p className="mt-3 text-sm text-text-muted font-sans leading-relaxed max-w-xs">
            Find and book verified local sports turfs. Real slots, clear prices.
          </p>
        </div>
        {COLUMNS.map((col) => (
          <nav key={col.heading} aria-label={col.heading}>
            <h3 className="text-xs font-semibold tracking-wider uppercase text-text-muted">{col.heading}</h3>
            <ul className="mt-3 space-y-2.5">
              {col.links.map((link) => (
                <li key={link.href + link.label}>
                  <Link href={link.href} className="text-sm text-text-main hover:text-brand-lime transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-border-subtle">
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-5 text-xs text-text-muted font-sans">
          © {new Date().getFullYear()} Turfzo. Play more.
        </div>
      </div>
    </footer>
  );
}
