"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Phone,
  Clock,
  Send,
  Check,
  Loader2,
  MessageSquare,
  ChevronDown,
  User,
} from "lucide-react";
import { Header } from "@/components/ui/header-2";
import Footer from "@/components/Footer";
import { FaqAccordion } from "@/components/ui/faq-accordion";
import { FAQPageSchema } from "@/lib/schema";
import { convexClient } from "@/lib/convex";
import { useAuth } from "@/lib/auth-context";

const contactFaqItems = [
  { question: "How do I contact Turfzo support?", answer: "You can reach us via email at support@turfzo.com, call us at +91 (80) 4567-8900, or use the contact form on this page. We respond within 24 hours." },
  { question: "How do I cancel a booking?", answer: "You can cancel a booking from your booking history in the app or website. Cancellations up to 6 hours before the slot get a full refund." },
  { question: "I have a partnership inquiry. Who do I contact?", answer: "For turf owner partnerships, venue listings, or business inquiries, email us at partnerships@turfzo.com or use the contact form with subject 'Partnership Inquiry'." },
  { question: "How do I list my turf on Turfzo?", answer: "Turf owners can list their venue by contacting us at owners@turfzo.com. We'll guide you through the onboarding process which takes about 24 hours." },
  { question: "What cities does Turfzo operate in?", answer: "Turfzo currently operates in Bangalore, Mumbai, Delhi, Hyderabad, Pune, Chennai, Kolkata, Ahmedabad, and CSN (Aurangabad). We're expanding to more cities soon." },
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
      await convexClient.action(
        "contact:submitContact",
        { name, email, subject, message },
        firebaseUser ? await firebaseUser.getIdToken() : undefined
      );
      setFormStep('submitted');
    } catch (err) {
      const { getErrorMessage } = await import("@/lib/errors");
      setErrorMsg(getErrorMessage(err, "Failed to send message. Please try again."));
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
    <div className="flex flex-col min-h-screen bg-bg text-text-main">
      <head>
        <title>Contact Us | Get in Touch with Turfzo</title>
        <meta name="description" content="Have questions about turf booking? Contact Turfzo support via email, phone, or our contact form. We're here to help with bookings, cancellations, and partnerships." />
        <link rel="canonical" href="https://turfzo.app/contact" />
        <meta property="og:title" content="Contact Us | Turfzo" />
        <meta property="og:description" content="Get in touch with Turfzo for booking support, partnerships, and general inquiries." />
        <meta property="og:url" content="https://turfzo.app/contact" />
      </head>
      <FAQPageSchema items={contactFaqItems} />
      <Header />

      <main className="flex-grow pt-32 md:pt-40 pb-20">
        <div className="max-w-7xl mx-auto px-6 md:px-8 w-full">
          
          {/* Section Header */}
          <div className="relative text-center max-w-3xl mx-auto mb-20">
            <motion.div
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="relative z-10"
            >
              <h1 className="font-sans text-4xl sm:text-5xl font-extrabold text-text-main leading-tight tracking-tight">
                Get In <span className="text-brand-lime">Touch With Us</span>
              </h1>
              <p className="mt-4 text-text-muted text-sm sm:text-base font-sans max-w-xl mx-auto leading-relaxed">
                Have questions about booking? Or want to list your turf? Send us a message, and our support team will assist you shortly.
              </p>
            </motion.div>
          </div>

          {/* Two Columns Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start text-left">
            
            {/* Left Column: Network Operations & Direct Channels */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="lg:col-span-5 flex flex-col gap-6 w-full"
            >
              <div className="bg-surface/50 border border-border-default rounded-lg p-6 sm:p-8 flex flex-col gap-8 shadow-card-shadow">
                
                {/* Status Indicator */}
                <div className="flex items-center justify-between border-b border-border-subtle pb-4">
                  <div>
                    <h2 className="font-sans font-bold text-lg text-text-main">Support Center</h2>
                    <p className="text-[10px] text-text-muted mt-0.5">Live platform operations</p>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-brand-lime/10 border border-brand-lime/20 text-brand-lime text-[10px] font-sans font-semibold tracking-wide uppercase select-none">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-lime animate-pulse" />
                    Operational
                  </div>
                </div>



                {/* Channels List */}
                <div className="flex flex-col gap-6">
                  
                  {/* Email Support Row */}
                  <div className="flex gap-4 items-start group">
                    <div className="w-10 h-10 rounded-lg bg-surface border border-border-default flex items-center justify-center text-text-muted group-hover:text-brand-lime group-hover:border-brand-lime/30 transition-all duration-300">
                      <Mail className="w-5 h-5 stroke-[1.5]" />
                    </div>
                    <div className="flex-grow space-y-1">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">Email Support</h3>
                      <div className="flex flex-col gap-1 sm:flex-row sm:gap-4">
                        <a href="mailto:support@turfzo.com" className="text-sm font-semibold text-text-main hover:text-brand-lime transition-colors">
                          support@turfzo.com
                        </a>
                        <span className="hidden sm:inline text-text-muted/30">|</span>
                        <a href="mailto:partnerships@turfzo.com" className="text-sm font-semibold text-text-main hover:text-brand-lime transition-colors">
                          partnerships@turfzo.com
                        </a>
                      </div>
                      <p className="text-[10px] text-text-muted">We respond to support queries within 2 hours.</p>
                    </div>
                  </div>

                  {/* Phone Row */}
                  <div className="flex gap-4 items-start group">
                    <div className="w-10 h-10 rounded-lg bg-surface border border-border-default flex items-center justify-center text-text-muted group-hover:text-brand-lime group-hover:border-brand-lime/30 transition-all duration-300">
                      <Phone className="w-5 h-5 stroke-[1.5]" />
                    </div>
                    <div className="flex-grow space-y-1">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">Direct Line</h3>
                      <a href="tel:+918045678900" className="text-sm font-semibold text-text-main hover:text-brand-lime transition-colors">
                        +91 (80) 4567-8900
                      </a>
                      <p className="text-[10px] text-text-muted">Call desk operational daily: 09:00 AM - 09:00 PM.</p>
                    </div>
                  </div>

                  {/* Operating Hours Row */}
                  <div className="flex gap-4 items-start group">
                    <div className="w-10 h-10 rounded-lg bg-surface border border-border-default flex items-center justify-center text-text-muted group-hover:text-brand-lime group-hover:border-brand-lime/30 transition-all duration-300">
                      <Clock className="w-5 h-5 stroke-[1.5]" />
                    </div>
                    <div className="flex-grow space-y-1">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">Support Hours</h3>
                      <p className="text-sm font-semibold text-text-main">
                        Daily: 06:00 AM - 11:00 PM
                      </p>
                      <p className="text-[10px] text-brand-lime font-medium">
                        Online Booking Portal remains active 24/7.
                      </p>
                    </div>
                  </div>

                </div>
              </div>
            </motion.div>

            {/* Right Column: Premium Contact Form */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="lg:col-span-7 bg-surface/50 backdrop-blur-sm border border-border-default rounded-lg p-6 sm:p-8 shadow-card-shadow w-full transition-all hover:border-border-strong duration-300"
            >
              <div className="border-b border-border-subtle pb-4 mb-6">
                <h2 className="font-sans font-bold text-lg text-text-main">Send a Message</h2>
                <p className="text-[10px] text-text-muted mt-0.5">Please provide your details below</p>
              </div>

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
                        <label htmlFor="contact-name" className="text-text-muted font-semibold uppercase tracking-wider text-[10px]">Full Name</label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted/40">
                            <User className="w-4 h-4 stroke-[1.5]" />
                          </span>
                          <input 
                            id="contact-name"
                            type="text" 
                            required
                            placeholder="Your name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-elevated/40 border border-border-subtle focus:border-brand-lime/40 focus:ring-1 focus:ring-brand-lime/25 rounded pl-10 pr-4 py-3.5 text-sm text-text-main placeholder-text-muted/30 focus:outline-none transition-all duration-200"
                          />
                        </div>
                      </div>

                      {/* Email */}
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="contact-email" className="text-text-muted font-semibold uppercase tracking-wider text-[10px]">Email Address</label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted/40">
                            <Mail className="w-4 h-4 stroke-[1.5]" />
                          </span>
                          <input 
                            id="contact-email"
                            type="email" 
                            required
                            placeholder="Your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-elevated/40 border border-border-subtle focus:border-brand-lime/40 focus:ring-1 focus:ring-brand-lime/25 rounded pl-10 pr-4 py-3.5 text-sm text-text-main placeholder-text-muted/30 focus:outline-none transition-all duration-200"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Subject Choice */}
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="contact-subject" className="text-text-muted font-semibold uppercase tracking-wider text-[10px]">Subject Category</label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted/40 pointer-events-none">
                          <MessageSquare className="w-4 h-4 stroke-[1.5]" />
                        </span>
                        <select
                          id="contact-subject"
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          className="w-full bg-elevated/40 border border-border-subtle focus:border-brand-lime/40 focus:ring-1 focus:ring-brand-lime/25 text-sm text-text-main pl-10 pr-10 py-3.5 rounded font-semibold focus:outline-none appearance-none cursor-pointer transition-all duration-200"
                        >
                          <option className="bg-white text-black dark:bg-[#111111] dark:text-[#ededed]">General Inquiry</option>
                          <option className="bg-white text-black dark:bg-[#111111] dark:text-[#ededed]">Booking Issue</option>
                          <option className="bg-white text-black dark:bg-[#111111] dark:text-[#ededed]">List a Venue (Turf Owner)</option>
                          <option className="bg-white text-black dark:bg-[#111111] dark:text-[#ededed]">Tournament Inquiry</option>
                        </select>
                        <ChevronDown className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted/60" />
                      </div>
                    </div>

                    {/* Message comments */}
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="contact-message" className="text-text-muted font-semibold uppercase tracking-wider text-[10px]">Message Details</label>
                      <textarea
                        id="contact-message"
                        required
                        rows={5}
                        placeholder="Write details of your inquiry here..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="w-full bg-elevated/40 border border-border-subtle focus:border-brand-lime/40 focus:ring-1 focus:ring-brand-lime/25 rounded px-4 py-3.5 text-sm text-text-main placeholder-text-muted/30 focus:outline-none resize-none leading-relaxed transition-all duration-200"
                      />
                    </div>

                    {/* Submit Button */}
                    <button
                      id="contact-submit"
                      type="submit"
                      className="bg-brand-btn-bg border border-brand-lime/30 text-white hover:border-brand-lime/60 hover:bg-brand-btn-bg-hover font-sans font-bold text-sm py-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-sm"
                    >
                      Send Message
                      <Send className="w-4 h-4" />
                    </button>

                  </motion.form>
                )}

                {/* Submitting state */}
                {formStep === 'submitting' && (
                  <motion.div
                    key="contact-submitting"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="py-20 flex flex-col items-center justify-center gap-4 text-center"
                  >
                    <Loader2 className="w-10 h-10 text-brand-lime animate-spin stroke-[2]" />
                    <h3 className="font-sans font-semibold text-base text-text-main">Sending Message</h3>
                    <p className="text-xs text-text-muted max-w-xs leading-relaxed">
                      Securing transmission and delivering message to Turfzo Support...
                    </p>
                  </motion.div>
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
                    <div className="w-14 h-14 bg-error/10 rounded-full flex items-center justify-center border-2 border-error/30 select-none">
                      <span className="text-error text-2xl font-bold font-sans">!</span>
                    </div>
                    <h3 className="font-sans font-bold text-lg text-text-main">Submission Failed</h3>
                    <p className="text-xs text-text-muted max-w-xs font-sans leading-relaxed">
                      {errorMsg ?? "Something went wrong. Please try again or email us directly at support@turfzo.com."}
                    </p>
                    <button
                      onClick={() => setFormStep('form')}
                      className="bg-surface border border-border-default hover:border-brand-lime/30 text-text-main font-semibold text-xs px-6 py-2.5 rounded-md transition-all mt-2"
                    >
                      Try Again
                    </button>
                  </motion.div>
                )}

                {/* Success confirmation */}
                {formStep === 'submitted' && (
                  <motion.div 
                    key="contact-submitted"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="py-16 flex flex-col items-center justify-center gap-4 text-center"
                  >
                    <div className="w-14 h-14 bg-brand-lime/10 rounded-full flex items-center justify-center border-2 border-brand-lime/30 shadow-md select-none">
                      <Check className="w-7 h-7 text-brand-lime stroke-[3]" />
                    </div>
                    
                    <h3 className="font-sans font-bold text-xl text-text-main">Message Received!</h3>
                    <p className="text-xs text-text-muted max-w-xs font-sans leading-relaxed">
                      Thank you, <span className="text-brand-lime font-bold">{name}</span>. Your inquiry has been safely received. A support specialist will respond to <span className="font-semibold text-text-main">{email}</span> within 2 hours.
                    </p>

                    <button 
                      onClick={handleReset}
                      className="bg-brand-btn-bg border border-brand-lime/30 text-white hover:border-brand-lime/60 hover:bg-brand-btn-bg-hover font-semibold text-xs px-6 py-2.5 rounded-md transition-all mt-4"
                    >
                      Send Another Message
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

            </motion.div>

          </div>

        </div>
      </main>

      {/* FAQ Section */}
      <div className="max-w-3xl mx-auto px-6 md:px-8 pb-24 w-full">
        <h2 className="font-sans font-bold text-2xl text-text-main mb-8 text-center">
          Frequently Asked Questions
        </h2>
        <FaqAccordion items={contactFaqItems} />
      </div>

      <Footer />
    </div>
  );
}

