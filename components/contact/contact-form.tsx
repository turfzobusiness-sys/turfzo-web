"use client";

import { useState } from "react";
import {
  Mail,
  Send,
  Check,
  Loader2,
  MessageSquare,
  ChevronDown,
  User,
} from "lucide-react";
import { convexClient } from "@/lib/convex";
import { useAuth } from "@/lib/auth-context";
import { getErrorMessage } from "@/lib/errors";
import { TurnstileWidget } from "@/components/ui/turnstile-widget";
import { isTurnstileConfigured } from "@/lib/turnstile";

export default function ContactFormCard({
  supportEmail,
  responseTarget,
}: {
  supportEmail: string;
  responseTarget: string;
}) {
  const { firebaseUser } = useAuth();
  const [formStep, setFormStep] = useState<
    "form" | "submitting" | "submitted" | "error"
  >("form");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("General Inquiry");
  const [message, setMessage] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string>("");
  const [turnstileResetKey, setTurnstileResetKey] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const turnstileEnforced = isTurnstileConfigured();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    if (turnstileEnforced && !turnstileToken) {
      setErrorMsg("Please complete the bot verification.");
      setFormStep("error");
      return;
    }
    setFormStep("submitting");
    setErrorMsg(null);
    try {
      await convexClient.action(
        "contact:submitContact",
        turnstileToken
          ? { name, email, subject, message, turnstileToken }
          : { name, email, subject, message },
        firebaseUser ? await firebaseUser.getIdToken() : undefined,
      );
      setTurnstileToken("");
      setFormStep("submitted");
    } catch (err) {
      setTurnstileToken("");
      setTurnstileResetKey((k) => k + 1);
      setErrorMsg(
        getErrorMessage(err, "Failed to send message. Please try again."),
      );
      setFormStep("error");
    }
  };

  const handleReset = () => {
    setName("");
    setEmail("");
    setSubject("General Inquiry");
    setMessage("");
    setTurnstileToken("");
    setTurnstileResetKey((k) => k + 1);
    setFormStep("form");
  };

  return (
    <div className="lg:col-span-7 bg-surface/50 backdrop-blur-sm border border-border-default rounded-lg p-6 sm:p-8 shadow-card-shadow w-full transition-all hover:border-border-strong duration-300">
      <div className="border-b border-border-subtle pb-4 mb-6">
        <h2 className="font-sans font-bold text-lg text-text-main">
          Send a Message
        </h2>
        <p className="text-[10px] text-text-muted mt-0.5">
          Please provide your details below
        </p>
      </div>

      {formStep === "form" && (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-5 text-xs font-sans"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="contact-name"
                className="text-text-muted font-semibold uppercase tracking-wider text-[10px]"
              >
                Full Name
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted">
                  <User className="w-4 h-4 stroke-[2]" />
                </span>
                <input
                  id="contact-name"
                  type="text"
                  required
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-elevated border border-border-default focus:border-brand-lime/40 focus:ring-1 focus:ring-brand-lime/25 rounded pl-10 pr-4 py-3.5 text-sm text-text-main placeholder:text-text-muted focus:outline-none transition-all duration-200"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="contact-email"
                className="text-text-muted font-semibold uppercase tracking-wider text-[10px]"
              >
                Email Address
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted">
                  <Mail className="w-4 h-4 stroke-[2]" />
                </span>
                <input
                  id="contact-email"
                  type="email"
                  required
                  placeholder="Your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-elevated border border-border-default focus:border-brand-lime/40 focus:ring-1 focus:ring-brand-lime/25 rounded pl-10 pr-4 py-3.5 text-sm text-text-main placeholder:text-text-muted focus:outline-none transition-all duration-200"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="contact-subject"
              className="text-text-muted font-semibold uppercase tracking-wider text-[10px]"
            >
              Subject Category
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
                <MessageSquare className="w-4 h-4 stroke-[2]" />
              </span>
              <select
                id="contact-subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-elevated border border-border-default focus:border-brand-lime/40 focus:ring-1 focus:ring-brand-lime/25 text-sm text-text-main pl-10 pr-10 py-3.5 rounded font-semibold focus:outline-none appearance-none cursor-pointer transition-all duration-200"
              >
                <option className="bg-surface text-text-main">
                  General Inquiry
                </option>
                <option className="bg-surface text-text-main">
                  Booking Issue
                </option>
                <option className="bg-surface text-text-main">
                  List a Venue (Turf Owner)
                </option>
                <option className="bg-surface text-text-main">
                  Tournament Inquiry
                </option>
              </select>
              <ChevronDown className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted" />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="contact-message"
              className="text-text-muted font-semibold uppercase tracking-wider text-[10px]"
            >
              Message Details
            </label>
            <textarea
              id="contact-message"
              required
              rows={5}
              placeholder="Write details of your inquiry here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-elevated border border-border-default focus:border-brand-lime/40 focus:ring-1 focus:ring-brand-lime/25 rounded px-4 py-3.5 text-sm text-text-main placeholder:text-text-muted focus:outline-none resize-none leading-relaxed transition-all duration-200"
            />
          </div>

          <TurnstileWidget
            action="contact"
            onToken={setTurnstileToken}
            onExpire={() => setTurnstileToken("")}
            resetKey={turnstileResetKey}
          />

          <button
            id="contact-submit"
            type="submit"
            className="bg-brand-btn-bg border border-brand-lime/30 text-white hover:border-brand-lime/60 hover:bg-brand-btn-bg-hover font-sans font-bold text-sm py-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-sm cursor-pointer"
          >
            Send Message
            <Send className="w-4 h-4" />
          </button>
        </form>
      )}

      {formStep === "submitting" && (
        <div className="py-20 flex flex-col items-center justify-center gap-4 text-center">
          <Loader2 className="w-10 h-10 text-brand-lime animate-spin stroke-[2]" />
          <h3 className="font-sans font-semibold text-base text-text-main">
            Sending Message
          </h3>
          <p className="text-xs text-text-muted max-w-xs leading-relaxed">
            Securing transmission and delivering message to Turfzo Support...
          </p>
        </div>
      )}

      {formStep === "error" && (
        <div className="py-16 flex flex-col items-center justify-center gap-4 text-center">
          <div className="w-14 h-14 bg-error/10 rounded-full flex items-center justify-center border-2 border-error/30 select-none">
            <span className="text-error text-2xl font-bold font-sans">!</span>
          </div>
          <h3 className="font-sans font-bold text-lg text-text-main">
            Submission Failed
          </h3>
          <p className="text-xs text-text-muted max-w-xs font-sans leading-relaxed">
            {errorMsg ??
              `Something went wrong. Please try again or email us directly at ${supportEmail}.`}
          </p>
          <button
            onClick={() => setFormStep("form")}
            className="bg-surface border border-border-default hover:border-brand-lime/30 text-text-main font-semibold text-xs px-6 py-2.5 rounded-md transition-all mt-2 cursor-pointer"
          >
            Try Again
          </button>
        </div>
      )}

      {formStep === "submitted" && (
        <div className="py-16 flex flex-col items-center justify-center gap-4 text-center">
          <div className="w-14 h-14 bg-brand-lime/10 rounded-full flex items-center justify-center border-2 border-brand-lime/30 shadow-md select-none">
            <Check className="w-7 h-7 text-brand-lime stroke-[3]" />
          </div>
          <h3 className="font-sans font-bold text-xl text-text-main">
            Message Received!
          </h3>
          <p className="text-xs text-text-muted max-w-xs font-sans leading-relaxed">
            Thank you, <span className="text-brand-lime font-bold">{name}</span>
            . Your inquiry has been received. A support specialist will respond
            to <span className="font-semibold text-text-main">{email}</span>{" "}
            within {responseTarget}.
          </p>
          <button
            onClick={handleReset}
            className="bg-brand-btn-bg border border-brand-lime/30 text-white hover:border-brand-lime/60 hover:bg-brand-btn-bg-hover font-semibold text-xs px-6 py-2.5 rounded-md transition-all mt-4 cursor-pointer"
          >
            Send Another Message
          </button>
        </div>
      )}
    </div>
  );
}
