import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Refund Policy",
  description:
    "Turfzo's refund and cancellation policy for turf bookings and tournament registrations.",
  alternates: { canonical: "https://turfzo.com/refund-policy" },
};

export default function RefundPolicyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-bg text-text-main">
      <Navbar />
      <main className="flex-grow pt-24 pb-16">
        <article className="max-w-3xl mx-auto px-6 md:px-8">
          <h1 className="font-poppins text-4xl font-extrabold mb-2">
            Refund & Cancellation Policy
          </h1>
          <p className="text-text-muted text-sm mb-8">
            Last updated: {new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}
          </p>

          <Section title="Summary">
            <p>
              We want you to be flexible. If your plans change, you can cancel most
              bookings for a full or partial refund. The exact refund amount depends on
              how far in advance you cancel.
            </p>
          </Section>

          <Section title="Turf Bookings — Refund Schedule">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border-default">
                    <th className="text-left py-2 font-semibold text-text-main">Time Before Slot</th>
                    <th className="text-left py-2 font-semibold text-text-main">Refund</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border-subtle">
                    <td className="py-2">24+ hours</td>
                    <td className="py-2 text-brand-lime font-semibold">100% refund</td>
                  </tr>
                  <tr className="border-b border-border-subtle">
                    <td className="py-2">6 to 24 hours</td>
                    <td className="py-2 text-warning font-semibold">50% refund</td>
                  </tr>
                  <tr>
                    <td className="py-2">Less than 6 hours</td>
                    <td className="py-2 text-error font-semibold">No refund</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p>
              Example: If your slot starts at 6:00 PM and you cancel at 2:00 PM the same
              day (4 hours notice), you will <strong>not</strong> receive a refund.
            </p>
          </Section>

          <Section title="Tournament Registrations">
            <ul>
              <li>Cancelled 7+ days before tournament start: full refund.</li>
              <li>Cancelled 1–7 days before start: 50% refund.</li>
              <li>Cancelled less than 24 hours before start: no refund.</li>
              <li>Tournament cancelled by organizer: full refund to all teams.</li>
            </ul>
          </Section>

          <Section title="How to Cancel">
            <p>
              You can cancel a booking from your{" "}
              <Link href="/bookings" className="text-brand-lime underline">
                booking history
              </Link>
              . The refund will be automatically initiated to the original payment
              method.
            </p>
          </Section>

          <Section title="Refund Processing Time">
            <p>
              Once your cancellation is processed, refunds take:
            </p>
            <ul>
              <li>UPI / Net Banking: 1–3 business days</li>
              <li>Credit / Debit Card: 5–7 business days</li>
              <li>Wallets: 1–2 business days</li>
            </ul>
            <p>
              The actual time depends on your bank or payment provider. If you don&apos;t
              see the refund after 7 business days, email refunds@turfzo.com with your
              booking code.
            </p>
          </Section>

          <Section title="Force Majeure">
            <p>
              If a venue is closed unexpectedly (e.g. natural disaster, government order),
              Turfzo will refund your booking in full within 5 business days, regardless
              of the cancellation schedule above.
            </p>
          </Section>

          <Section title="Disputes">
            <p>
              If you believe a refund was processed incorrectly, contact us at{" "}
              <a href="mailto:refunds@turfzo.com" className="text-brand-lime underline">
                refunds@turfzo.com
              </a>{" "}
              within 30 days of the cancellation. We&apos;ll review and respond within 5
              business days.
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
