import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Terms of Service for using Turfzo — India's premium turf and sports venue booking platform.",
  alternates: { canonical: "https://turfzo.app/terms" },
};

export default function TermsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-bg text-text-main">
      <Navbar />
      <main className="flex-grow pt-24 pb-16">
        <article className="max-w-3xl mx-auto px-6 md:px-8 prose prose-invert">
          <h1 className="font-poppins text-4xl font-extrabold mb-2">
            Terms of Service
          </h1>
          <p className="text-text-muted text-sm mb-8">
            Last updated: {new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}
          </p>

          <Section title="1. Acceptance of Terms">
            <p>
              By accessing or using Turfzo (the &ldquo;Platform&rdquo;), you agree to be bound by these
              Terms of Service (&ldquo;Terms&rdquo;). If you do not agree, do not use the Platform.
            </p>
          </Section>

          <Section title="2. Service Description">
            <p>
              Turfzo is an online marketplace that allows users to discover, book, and pay for
              sports venues (turfs, courts, grounds) operated by independent venue owners.
              Turfzo is not the operator of any venue and is not a party to the booking
              contract between you and the venue.
            </p>
          </Section>

          <Section title="3. Account Registration">
            <p>
              To make a booking, you must create an account using a valid email address or
              sign in with Google. You are responsible for maintaining the security of your
              account and for all activity that occurs under your credentials.
            </p>
          </Section>

          <Section title="4. Bookings and Payment">
            <ul>
              <li>All bookings are subject to venue availability.</li>
              <li>Prices are listed in Indian Rupees (INR) and include applicable GST.</li>
              <li>Payment is processed securely by Razorpay. Turfzo does not store your card details.</li>
              <li>A booking is confirmed only after successful payment authorization.</li>
            </ul>
          </Section>

          <Section title="5. Cancellation and Refunds">
            <p>Cancellations are subject to the following refund policy:</p>
            <ul>
              <li>24+ hours before slot start: full refund.</li>
              <li>6–24 hours before slot start: 50% refund.</li>
              <li>Less than 6 hours before slot start: no refund.</li>
            </ul>
            <p>
              Refunds are processed within 5–7 business days to the original payment method.
            </p>
          </Section>

          <Section title="6. User Conduct">
            <p>You agree not to:</p>
            <ul>
              <li>Use the Platform for any unlawful purpose.</li>
              <li>Make fraudulent bookings or abuse promotional offers.</li>
              <li>Damage venue property. You will be held liable for any damage caused.</li>
              <li>Misrepresent your identity or impersonate another person.</li>
            </ul>
          </Section>

          <Section title="7. Limitation of Liability">
            <p>
              To the maximum extent permitted by law, Turfzo&apos;s total liability for any claim
              arising from your use of the Platform is limited to the amount you paid in the
              transaction giving rise to the claim. Turfzo is not liable for indirect,
              incidental, or consequential damages.
            </p>
          </Section>

          <Section title="8. Governing Law">
            <p>
              These Terms are governed by the laws of India. Any disputes shall be subject
              to the exclusive jurisdiction of courts in Bengaluru, Karnataka.
            </p>
          </Section>

          <Section title="9. Changes to Terms">
            <p>
              We may update these Terms from time to time. Material changes will be
              communicated via email or in-app notice. Continued use after changes
              constitutes acceptance.
            </p>
          </Section>

          <Section title="10. Contact">
            <p>
              Questions about these Terms?{" "}
              <Link href="/contact" className="text-brand-lime underline">
                Contact us
              </Link>{" "}
              or email legal@turfzo.app.
            </p>
          </Section>
        </article>
      </main>
      <Footer />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="font-poppins text-2xl font-bold mb-3 text-text-main">{title}</h2>
      <div className="text-text-muted text-sm font-sans leading-relaxed space-y-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1">
        {children}
      </div>
    </section>
  );
}
