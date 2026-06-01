"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  Check,
  Loader2,
  MessageSquare,
  ChevronDown,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { FAQPageSchema } from "@/lib/schema";
import { convexClient } from "@/lib/convex";
import { useAuth } from "@/lib/auth-context";

const contactFaqItems = [
  { question: "How do I contact Turfzo support?", answer: "You can reach us via email at support@turfzo.com, call us at +91 (80) 4567-8900, or use the contact form on this page. We respond within 24 hours." },
  { question: "How do I cancel a booking?", answer: "You can cancel a booking from your booking history in the app or website. Cancellations up to 6 hours before the slot get a full refund." },
  { question: "I have a partnership inquiry. Who do I contact?", answer: "For turf owner partnerships, venue listings, or business inquiries, email us at partnerships@turfzo.com or use the contact form with subject 'Partnership Inquiry'." },
  { question: "How do I list my turf on Turfzo?", answer: "Turf owners can list their venue by contacting us at owners@turfzo.com. We'll guide you through the onboarding process which takes about 24 hours." },
  { question: "What cities does Turfzo operate in?", answer: "Turfzo currently operates in Bangalore, Mumbai, Delhi, Hyderabad, Pune, Chennai, Kolkata, and Ahmedabad. We're expanding to more cities soon." },
];

export default function ContactPage() {
  const { firebaseUser } = useAuth();
  const [formStep, setFormStep] = useState<'form' | 'submitting' | 'submitted' | 'error'>('form');
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("General Inquiry");
  const [message, setMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    setFormStep('submitting');
    setErrorMsg(null);
    try {
      await convexClient.mutation(
        "contact:submitContact",
        { name, email, subject, message },
        firebaseUser ? await firebaseUser.getIdToken() : undefined
      );
      setFormStep('submitted');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to send message");
      setFormStep('error');
    }
  };

  const handleReset = () => {
    setName("");
    setEmail("");
    setSubject("General Inquiry");
    setMessage("");
    setFormStep('form');
  };

  return (
    <div className="flex flex-col min-h-screen bg-bg-dark text-text-main">
      <head>
        <title>Contact Us | Get in Touch with Turfzo</title>
        <meta name="description" content="Have questions about turf booking? Contact Turfzo support via email, phone, or our contact form. We're here to help with bookings, cancellations, and partnerships." />
        <link rel="canonical" href="https://turfzo.com/contact" />
        <meta property="og:title" content="Contact Us | Turfzo" />
        <meta property="og:description" content="Get in touch with Turfzo for booking support, partnerships, and general inquiries." />
        <meta property="og:url" content="https://turfzo.com/contact" />
      </head>
      <FAQPageSchema items={contactFaqItems} />
      <Navbar />

      <main className="flex-grow pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6 md:px-8 w-full">
          
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-surface-dark border border-white/10 text-[10px] font-sans font-bold uppercase tracking-wider text-brand-lime">
              <MessageSquare className="w-3.5 h-3.5" /> Support Center
            </span>
            <h1 className="font-poppins text-4xl sm:text-5xl font-extrabold text-text-main mt-4 leading-tight tracking-tight">
              Get In <span className="text-brand-lime">Touch With Us</span>
            </h1>
            <p className="mt-4 text-text-muted text-sm sm:text-base font-sans max-w-xl mx-auto leading-relaxed">
              Have questions about booking? Or want to list your turf? Send us a message, and our team will get back to you within 2 hours.
            </p>
          </div>

          {/* Two Columns Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start text-left">
            
            {/* Left Column: Contact Cards & Custom SVG Map (5 Cols) */}
            <div className="lg:col-span-5 flex flex-col gap-6 w-full">
              <h2 className="font-poppins font-bold text-xl text-text-main pb-2 border-b border-white/5 mb-2">
                Office Information
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Mail Card */}
                <div className="bg-surface-dark border border-white/5 rounded-md p-5 flex flex-col gap-3">
                  <div className="w-9 h-9 rounded-full bg-brand-lime/10 flex items-center justify-center text-brand-lime">
                    <Mail className="w-4.5 h-4.5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-text-muted uppercase font-sans">Email us</span>
                    <span className="text-xs font-semibold text-text-main mt-1 hover:text-brand-lime transition-colors cursor-pointer">support@turfzo.com</span>
                  </div>
                </div>

                {/* Phone Card */}
                <div className="bg-surface-dark border border-white/5 rounded-md p-5 flex flex-col gap-3">
                  <div className="w-9 h-9 rounded-full bg-brand-lime/10 flex items-center justify-center text-brand-lime">
                    <Phone className="w-4.5 h-4.5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-text-muted uppercase font-sans">Call support</span>
                    <span className="text-xs font-semibold text-text-main mt-1">+91 (80) 4567-8900</span>
                  </div>
                </div>

                {/* Address Card */}
                <div className="bg-surface-dark border border-white/5 rounded-md p-5 flex flex-col gap-3 sm:col-span-2">
                  <div className="w-9 h-9 rounded-full bg-brand-lime/10 flex items-center justify-center text-brand-lime">
                    <MapPin className="w-4.5 h-4.5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-text-muted uppercase font-sans">Headquarters</span>
                    <span className="text-xs font-semibold text-text-main mt-1 leading-relaxed">
                      100 Feet Rd, HSR Layout, Sector 2, Bengaluru, Karnataka 560102
                    </span>
                  </div>
                </div>

                {/* Hours Card */}
                <div className="bg-surface-dark border border-white/5 rounded-md p-5 flex flex-col gap-3 sm:col-span-2">
                  <div className="w-9 h-9 rounded-full bg-brand-lime/10 flex items-center justify-center text-brand-lime">
                    <Clock className="w-4.5 h-4.5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] text-text-muted uppercase font-sans">Working Hours</span>
                    <span className="text-xs font-semibold text-text-main mt-1 leading-relaxed">
                      Monday - Sunday: 06:00 AM - 11:00 PM <br />
                      <span className="text-brand-lime font-bold mt-1 inline-block">Online Bookings: 24/7 Active</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Custom-Styled Dark Vector Map in SVG */}
              <div className="relative rounded-md overflow-hidden border border-white/5 bg-surface-dark h-52 w-full flex items-center justify-center shadow-md">
                
                {/* SVG Dark Map Representation */}
                <svg viewBox="0 0 400 200" className="w-full h-full opacity-60 text-white/5">
                  <defs>
                    <radialGradient id="mapRadar" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#9FE870" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#9FE870" stopOpacity="0" />
                    </radialGradient>
                  </defs>

                  {/* Simulated grid map roads */}
                  <path d="M 0 50 L 400 50" stroke="currentColor" strokeWidth="2" />
                  <path d="M 0 150 L 400 150" stroke="currentColor" strokeWidth="2" />
                  <path d="M 80 0 L 80 200" stroke="currentColor" strokeWidth="2" />
                  <path d="M 280 0 L 280 200" stroke="currentColor" strokeWidth="2" />
                  <path d="M 0 100 Q 200 40 400 100" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
                  
                  {/* Radar pulse at coordinates */}
                  <circle cx="200" cy="100" r="30" fill="url(#mapRadar)" className="animate-pulse" />
                  <circle cx="200" cy="100" r="1.5" fill="#9FE870" />
                </svg>

                {/* Floating GPS Indicator Card */}
                <div className="absolute bg-black/80 backdrop-blur-md border border-white/10 rounded px-3 py-1.5 flex items-center gap-2">
                  <div className="w-2.5 h-2.5 bg-brand-lime rounded-full animate-ping" />
                  <span className="text-[10px] font-sans font-bold tracking-wide text-text-main uppercase">
                    Turfzo HQ · HSR Layout
                  </span>
                </div>
              </div>

            </div>

            {/* Right Column: Contact Message Form (7 Cols) */}
            <div className="lg:col-span-7 bg-surface-dark border border-white/5 rounded-md p-6 sm:p-8 shadow-card-shadow w-full">
              <h2 className="font-poppins font-bold text-xl text-text-main pb-2 border-b border-white/5 mb-6">
                Send a Message
              </h2>

              <AnimatePresence mode="wait">
                {formStep === 'form' && (
                  <motion.form 
                    key="contact-form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleSubmit} 
                    className="flex flex-col gap-5 text-xs font-sans"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {/* Name */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-text-muted font-semibold uppercase tracking-wider text-[10px]">Full Name</label>
                        <input 
                          type="text" 
                          required
                          placeholder="Your name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="bg-elevated-dark border border-white/5 rounded px-4 py-3 text-text-main placeholder-text-muted/40 focus:outline-none focus:border-brand-lime/30"
                        />
                      </div>

                      {/* Email */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-text-muted font-semibold uppercase tracking-wider text-[10px]">Email Address</label>
                        <input 
                          type="email" 
                          required
                          placeholder="Your email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="bg-elevated-dark border border-white/5 rounded px-4 py-3 text-text-main placeholder-text-muted/40 focus:outline-none focus:border-brand-lime/30"
                        />
                      </div>
                    </div>

                    {/* Subject Choice */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-text-muted font-semibold uppercase tracking-wider text-[10px]">Subject Category</label>
                      <div className="relative">
                        <select
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          className="w-full bg-elevated-dark border border-white/5 text-text-main py-3 pl-4 pr-10 rounded font-semibold focus:outline-none appearance-none cursor-pointer"
                        >
                          <option>General Inquiry</option>
                          <option>Booking Issue</option>
                          <option>List a Venue (Turf Owner)</option>
                          <option>Tournament Inquiry</option>
                        </select>
                        <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>

                    {/* Message comments */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-text-muted font-semibold uppercase tracking-wider text-[10px]">Message Details</label>
                      <textarea 
                        required
                        rows={5}
                        placeholder="Write your details here..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="bg-elevated-dark border border-white/5 rounded px-4 py-3 text-text-main placeholder-text-muted/40 focus:outline-none focus:border-brand-lime/30 resize-none leading-relaxed"
                      />
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      className="bg-brand-lime hover:bg-brand-lime-hover text-black font-poppins font-bold text-sm py-3.5 rounded-md transition-all duration-300 hover:scale-102 flex items-center justify-center gap-1.5"
                    >
                      Send Message
                      <Send className="w-4 h-4" />
                    </button>

                  </motion.form>
                )}

                {/* Error state */}
                {formStep === 'error' && (
                  <motion.div
                    key="contact-error"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="py-16 flex flex-col items-center justify-center gap-4 text-center"
                  >
                    <div className="w-14 h-14 bg-red-500/10 rounded-full flex items-center justify-center border-2 border-red-500/30">
                      <span className="text-red-400 text-2xl">!</span>
                    </div>
                    <h3 className="font-poppins font-bold text-lg text-text-main">Could not send</h3>
                    <p className="text-xs text-text-muted max-w-xs font-sans leading-relaxed">
                      {errorMsg ?? "Something went wrong. Please try again or email us directly at support@turfzo.com."}
                    </p>
                    <button
                      onClick={() => setFormStep('form')}
                      className="bg-surface-dark border border-white/10 hover:border-brand-lime/30 text-text-main font-semibold text-xs px-6 py-2.5 rounded-pill transition-all"
                    >
                      Try again
                    </button>
                  </motion.div>
                )}

                {/* Success confirmation */}
                {formStep === 'submitted' && (
                  <motion.div 
                    key="contact-submitted"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="py-16 flex flex-col items-center justify-center gap-4 text-center"
                  >
                    <div className="w-14 h-14 bg-brand-lime/10 rounded-full flex items-center justify-center border-2 border-brand-lime/30 shadow-glow-lime select-none">
                      <Check className="w-7 h-7 text-brand-lime stroke-[3]" />
                    </div>
                    
                    <h3 className="font-poppins font-bold text-xl text-text-main">Message Sent!</h3>
                    <p className="text-xs text-text-muted max-w-xs font-sans leading-relaxed">
                      Thank you, <span className="text-brand-lime font-bold">{name}</span>. Your inquiry has been safely received. A support specialist will respond to <span className="font-semibold text-text-main">{email}</span> within 2 hours.
                    </p>

                    <button 
                      onClick={handleReset}
                      className="bg-brand-lime hover:bg-brand-lime-hover text-black font-semibold text-xs px-6 py-2.5 rounded-pill transition-all mt-4 hover:scale-102"
                    >
                      Send Another Message
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>

          </div>

        </div>
      </main>

      {/* FAQ Section */}
      <div className="max-w-3xl mx-auto px-6 md:px-8 pb-16">
        <h2 className="font-poppins font-bold text-2xl text-text-main mb-8 text-center">
          Frequently Asked Questions
        </h2>
        <div className="flex flex-col gap-4">
          {contactFaqItems.map((item, idx) => (
            <details
              key={idx}
              className="bg-surface-dark border border-white/5 rounded-md p-5 group"
            >
              <summary className="font-poppins font-semibold text-sm text-text-main cursor-pointer list-none flex items-center justify-between">
                {item.question}
                <ChevronDown className="w-4 h-4 text-text-muted group-open:rotate-180 transition-transform" />
              </summary>
              <p className="mt-3 text-xs text-text-muted font-sans leading-relaxed">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}
