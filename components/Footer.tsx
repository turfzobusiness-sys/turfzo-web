import Image from "next/image";
import { Mail, Phone, MapPin, ArrowRight } from "lucide-react";

// Local SVG Brand Icons
const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const TwitterIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

const YoutubeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17z" />
    <polygon points="10 15 15 12 10 9" />
  </svg>
);

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: InstagramIcon, href: "#", label: "Instagram" },
    { icon: TwitterIcon, href: "#", label: "Twitter" },
    { icon: YoutubeIcon, href: "#", label: "YouTube" },
  ];


  const companyLinks = [
    { name: "About Us", href: "#" },
    { name: "Careers", href: "#" },
    { name: "Press & Media", href: "#" },
    { name: "Privacy Policy", href: "#" },
  ];

  const exploreLinks = [
    { name: "Football Grounds", href: "#" },
    { name: "Cricket Nets", href: "#" },
    { name: "Badminton Courts", href: "#" },
    { name: "Tennis Courts", href: "#" },
  ];

  const supportLinks = [
    { name: "Help Center", href: "#" },
    { name: "Safety & Rules", href: "#" },
    { name: "Refund Policy", href: "#" },
    { name: "Contact Support", href: "#" },
  ];

  return (
    <footer id="contact" className="relative bg-[#080b0a] border-t border-white/5 pt-20 pb-8 overflow-hidden">
      {/* Background glow ambient reflection */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[500px] h-[200px] bg-brand-lime/[0.015] rounded-full blur-[80px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10">
        
        {/* Main Columns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 pb-16 border-b border-white/5">
          
          {/* Brand Info & Newsletter (Lg: 4 columns) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <a href="#home" className="flex items-center gap-2 w-fit group">
              <Image
                src="/turfzo_mascot.svg"
                alt="Turfzo Logo"
                width={28}
                height={28}
                className="w-7 h-7 group-hover:rotate-6 transition-transform duration-500"
              />
              <span className="font-poppins font-bold text-xl text-text-main tracking-tight">
                turf<span className="text-brand-lime">zo</span>
              </span>
            </a>
            <p className="text-text-muted text-sm font-sans leading-relaxed max-w-sm">
              Discover and book premier, floodlight-covered sport venues and pitches. Turfzo is the ultimate luxury turf booking software for players.
            </p>
            
            {/* Newsletter Subscription input */}
            <div className="flex flex-col gap-2.5">
              <span className="text-xs font-poppins font-bold text-text-main tracking-wider uppercase">
                Stay updated
              </span>
              <div className="relative flex items-center">
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="w-full max-w-sm bg-surface-dark border border-white/5 focus:border-brand-lime/30 rounded-pill py-3 pl-5 pr-12 text-sm text-text-main placeholder-text-muted/50 focus:outline-none transition-colors duration-300"
                />
                <button 
                  className="absolute right-1.5 p-2 bg-brand-lime hover:bg-brand-lime-hover text-black rounded-full transition-colors duration-300 focus:outline-none hover:scale-105 active:scale-95"
                  aria-label="Subscribe"
                >
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>
            </div>
          </div>

          {/* Navigation Links Columns (Lg: 5 columns) */}
          <div className="lg:col-span-5 grid grid-cols-3 gap-6 sm:gap-8">
            {/* Col 1 */}
            <div className="flex flex-col gap-4">
              <span className="text-xs font-poppins font-bold text-text-main tracking-wider uppercase">
                Company
              </span>
              <ul className="flex flex-col gap-2.5">
                {companyLinks.map((link) => (
                  <li key={link.name}>
                    <a href={link.href} className="text-sm font-sans text-text-muted hover:text-brand-lime transition-colors">
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 2 */}
            <div className="flex flex-col gap-4">
              <span className="text-xs font-poppins font-bold text-text-main tracking-wider uppercase">
                Explore
              </span>
              <ul className="flex flex-col gap-2.5">
                {exploreLinks.map((link) => (
                  <li key={link.name}>
                    <a href={link.href} className="text-sm font-sans text-text-muted hover:text-brand-lime transition-colors">
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Col 3 */}
            <div className="flex flex-col gap-4">
              <span className="text-xs font-poppins font-bold text-text-main tracking-wider uppercase">
                Support
              </span>
              <ul className="flex flex-col gap-2.5">
                {supportLinks.map((link) => (
                  <li key={link.name}>
                    <a href={link.href} className="text-sm font-sans text-text-muted hover:text-brand-lime transition-colors">
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Contact Details Column (Lg: 3 columns) */}
          <div className="lg:col-span-3 flex flex-col gap-5">
            <span className="text-xs font-poppins font-bold text-text-main tracking-wider uppercase">
              Get in Touch
            </span>
            <ul className="flex flex-col gap-3.5">
              <li className="flex items-start gap-3 text-sm text-text-muted">
                <MapPin className="w-5 h-5 text-brand-lime shrink-0 stroke-[1.8]" />
                <span className="font-sans leading-relaxed">
                  100 Feet Rd, HSR Layout, Bengaluru, Karnataka 560102
                </span>
              </li>
              <li className="flex items-center gap-3 text-sm text-text-muted">
                <Phone className="w-4 h-4 text-brand-lime shrink-0 stroke-[1.8]" />
                <span className="font-sans">
                  +91 (80) 4567-8900
                </span>
              </li>
              <li className="flex items-center gap-3 text-sm text-text-muted">
                <Mail className="w-4 h-4 text-brand-lime shrink-0 stroke-[1.8]" />
                <span className="font-sans hover:text-brand-lime transition-colors cursor-pointer">
                  support@turfzo.com
                </span>
              </li>
            </ul>

            {/* Social Icons row */}
            <div className="flex items-center gap-3.5 mt-2">
              {socialLinks.map((social) => {
                const IconComp = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    className="w-9 h-9 rounded-full bg-surface-dark border border-white/5 hover:border-brand-lime/20 flex items-center justify-center text-text-muted hover:text-brand-lime hover:shadow-glow-lime transition-all duration-300 hover:-translate-y-0.5"
                    aria-label={social.label}
                  >
                    <IconComp className="w-4 h-4" />
                  </a>
                );
              })}
            </div>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Terms */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-sans text-text-muted">
          <span>
            © {currentYear} Turfzo Technologies Pvt Ltd. All rights reserved.
          </span>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-brand-lime transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-brand-lime transition-colors">Sitemap</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
