import { Mail, Clock, MessageSquare } from "lucide-react";
import { Header } from "@/components/ui/header-2";
import Footer from "@/components/Footer";
import { FaqAccordion } from "@/components/ui/faq-accordion";
import {
  FAQPageSchema,
  ContactPageSchema,
  BreadcrumbListSchema,
} from "@/lib/schema";
import ContactFormCard from "@/components/contact/contact-form";

const SUPPORT_EMAIL = "support@turfzo.app";
const PARTNERSHIPS_EMAIL = "partnerships@turfzo.app";
const OWNERS_EMAIL = "owners@turfzo.app";
const RESPONSE_TARGET = "2 business days";

const contactFaqItems = [
  {
    question: "How do I contact Turfzo support?",
    answer: `Email us at ${SUPPORT_EMAIL} or use the contact form on this page. We aim to reply within ${RESPONSE_TARGET}.`,
  },
  {
    question: "How do I cancel a booking?",
    answer:
      "You can cancel a booking from your booking history in the app or website. Cancellations more than 24 hours before the slot are refunded in full on the slot price, between 6 and 24 hours receive 50% of the slot price, and cancellations under 6 hours are non-refundable. The service fee is retained in every case.",
  },
  {
    question: "I have a partnership inquiry. Who do I contact?",
    answer: `For turf owner partnerships, venue listings, or business inquiries, email ${PARTNERSHIPS_EMAIL} or use the contact form with subject 'List a Venue (Turf Owner)'.`,
  },
  {
    question: "How do I list my turf on Turfzo?",
    answer: `Turf owners can register and list their venue from the Owners dashboard, or email ${OWNERS_EMAIL} to get help with onboarding.`,
  },
  {
    question: "What cities does Turfzo operate in?",
    answer:
      "Turfzo is launching city by city across India — with live venues in Mumbai and expanding across major metros including Bangalore, Delhi NCR, Hyderabad, Pune, and Chennai. Check the explore page for current venues, or contact us to request your city.",
  },
];

export default function ContactPage() {
  return (
    <div className="flex flex-col min-h-screen bg-bg text-text-main">
      <BreadcrumbListSchema
        items={[
          { name: "Home", url: "https://turfzo.app" },
          { name: "Contact", url: "https://turfzo.app/contact" },
        ]}
      />
      <ContactPageSchema
        name="Contact Turfzo Support & Partnerships"
        description="Get in touch with the Turfzo team for booking support, venue owner onboarding, or partnership inquiries."
        url="https://turfzo.app/contact"
        email={SUPPORT_EMAIL}
      />
      <FAQPageSchema items={contactFaqItems} />
      <Header />

      <main className="flex-grow pt-32 md:pt-40 pb-20">
        <div className="max-w-7xl mx-auto px-6 md:px-8 w-full">
          {/* Section Header */}
          <div className="relative text-center max-w-3xl mx-auto mb-20">
            <div className="relative z-10">
              <h1 className="font-sans text-4xl sm:text-5xl font-extrabold text-text-main leading-tight tracking-tight">
                Get In <span className="text-brand-lime">Touch With Us</span>
              </h1>
              <p className="mt-4 text-text-muted text-sm sm:text-base font-sans max-w-xl mx-auto leading-relaxed">
                Have questions about booking? Or want to list your turf? Send us
                a message, and our support team will assist you shortly.
              </p>
            </div>
          </div>

          {/* Two Columns Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start text-left">
            {/* Left Column: Direct Channels */}
            <div className="lg:col-span-5 flex flex-col gap-6 w-full">
              <div className="bg-surface/50 border border-border-default rounded-lg p-6 sm:p-8 flex flex-col gap-8 shadow-card-shadow">
                <div className="flex items-center justify-between border-b border-border-subtle pb-4">
                  <div>
                    <h2 className="font-sans font-bold text-lg text-text-main">
                      Support Center
                    </h2>
                    <p className="text-[10px] text-text-muted mt-0.5">
                      Booking and payments online
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-brand-lime/10 border border-brand-lime/20 text-brand-lime text-[10px] font-sans font-semibold tracking-wide uppercase select-none">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-lime animate-pulse" />
                    Online
                  </div>
                </div>

                <div className="flex flex-col gap-6">
                  <div className="flex gap-4 items-start group">
                    <div className="w-10 h-10 rounded-lg bg-surface border border-border-default flex items-center justify-center text-text-muted group-hover:text-brand-lime group-hover:border-brand-lime/30 transition-all duration-300">
                      <Mail className="w-5 h-5 stroke-[1.5]" />
                    </div>
                    <div className="flex-grow space-y-1">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                        Email Support
                      </h3>
                      <div className="flex flex-col gap-1 sm:flex-row sm:gap-4">
                        <a
                          href={`mailto:${SUPPORT_EMAIL}`}
                          className="text-sm font-semibold text-text-main hover:text-brand-lime transition-colors"
                        >
                          {SUPPORT_EMAIL}
                        </a>
                        <span className="hidden sm:inline text-text-muted/30">
                          |
                        </span>
                        <a
                          href={`mailto:${PARTNERSHIPS_EMAIL}`}
                          className="text-sm font-semibold text-text-main hover:text-brand-lime transition-colors"
                        >
                          {PARTNERSHIPS_EMAIL}
                        </a>
                      </div>
                      <p className="text-[10px] text-text-muted">
                        We aim to reply within {RESPONSE_TARGET}.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start group">
                    <div className="w-10 h-10 rounded-lg bg-surface border border-border-default flex items-center justify-center text-text-muted group-hover:text-brand-lime group-hover:border-brand-lime/30 transition-all duration-300">
                      <MessageSquare className="w-5 h-5 stroke-[1.5]" />
                    </div>
                    <div className="flex-grow space-y-1">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                        Urgent Booking Issue
                      </h3>
                      <p className="text-sm font-semibold text-text-main">
                        Email {SUPPORT_EMAIL} with your booking code
                      </p>
                      <p className="text-[10px] text-text-muted">
                        Include the booking code from My Bookings so we can look
                        it up immediately.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start group">
                    <div className="w-10 h-10 rounded-lg bg-surface border border-border-default flex items-center justify-center text-text-muted group-hover:text-brand-lime group-hover:border-brand-lime/30 transition-all duration-300">
                      <Clock className="w-5 h-5 stroke-[1.5]" />
                    </div>
                    <div className="flex-grow space-y-1">
                      <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                        Response Target
                      </h3>
                      <p className="text-sm font-semibold text-text-main">
                        Within {RESPONSE_TARGET}
                      </p>
                      <p className="text-[10px] text-brand-lime font-medium">
                        Booking and payment are available 24/7 — the form works
                        at any hour.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Contact Form */}
            <ContactFormCard
              supportEmail={SUPPORT_EMAIL}
              responseTarget={RESPONSE_TARGET}
            />
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
