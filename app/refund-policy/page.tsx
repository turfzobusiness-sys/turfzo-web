import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/ui/header-2";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy | Turfzo",
  description:
    "Turfzo's refund and cancellation policy for turf bookings and tournament registrations.",
  alternates: { canonical: "https://turfzo.app/refund-policy" },
};

export default function RefundPolicyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-bg text-text-main">
      <Header />
      <main className="flex-grow pt-28 pb-20">
        <article className="max-w-3xl mx-auto px-6 md:px-8">
          <div className="border-b border-border-default pb-6 mb-8">
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-lime">
              Settlements & Reversals
            </span>
            <h1 className="font-sans text-4xl md:text-5xl font-extrabold mt-2 mb-3 tracking-tight">
              Refund & Cancellation Policy
            </h1>
            <p className="text-text-muted text-xs font-sans">
              Last updated: June 8, 2026
            </p>
          </div>

          <Section title="1. Summary of Cancellation Policy">
            <p>
              At Turfzo, we strive to maintain a fair balance between flexibility for our players and booking certainty for our sports arena partners. If your plans change, you can cancel your confirmed slots directly through the Platform. Refund eligibility is calculated automatically based on how far in advance the cancellation is requested prior to the scheduled slot start time.
            </p>
          </Section>

          <Section title="2. Turf Bookings — Refund Schedule">
            <p>
              The refund amount is determined according to the timeline below:
            </p>
            <div className="overflow-x-auto my-6 border border-border-default rounded-[12px] bg-surface/30">
              <table className="w-full text-sm font-sans text-left border-collapse">
                <thead>
                  <tr className="border-b border-border-default bg-surface/50 text-text-main font-semibold">
                    <th className="py-3 px-4">Cancellation Window</th>
                    <th className="py-3 px-4">Refund Percentage</th>
                    <th className="py-3 px-4">Applicable Fees</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  <tr className="text-text-muted">
                    <td className="py-3.5 px-4 font-medium text-text-main">24+ hours before slot start</td>
                    <td className="py-3.5 px-4 text-brand-lime font-bold">100% Refund</td>
                    <td className="py-3.5 px-4 text-xs">Excludes convenience/PG fees</td>
                  </tr>
                  <tr className="text-text-muted">
                    <td className="py-3.5 px-4 font-medium text-text-main">6 to 24 hours before slot start</td>
                    <td className="py-3.5 px-4 text-amber-500 font-bold">50% Refund</td>
                    <td className="py-3.5 px-4 text-xs">Excludes convenience/PG fees</td>
                  </tr>
                  <tr className="text-text-muted">
                    <td className="py-3.5 px-4 font-medium text-text-main">Less than 6 hours before slot start</td>
                    <td className="py-3.5 px-4 text-error font-bold">No Refund (0%)</td>
                    <td className="py-3.5 px-4 text-xs">Not eligible for refund</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-text-muted/80">
              <strong>Example:</strong> If your booking is scheduled for 8:00 PM on a Friday, you must cancel before 8:00 PM on Thursday to get a 100% refund, or before 2:00 PM on Friday to get a 50% refund.
            </p>
          </Section>

          <Section title="3. Tournament Registrations">
            <p>
              Because tournament brackets, fixture draws, and scheduling are finalized in advance, cancellations for tournament entries differ from standard slot bookings:
            </p>
            <ul>
              <li><strong>7+ days prior to tournament start:</strong> 100% refund of the registration fee (minus processing fees).</li>
              <li><strong>1 to 7 days prior to tournament start:</strong> 50% refund of the registration fee.</li>
              <li><strong>Less than 24 hours before start:</strong> Non-refundable.</li>
              <li><strong>Event Cancellation:</strong> If a tournament is cancelled by the organizer or Turfzo, all registered teams will receive a 100% refund of the entry fee.</li>
            </ul>
          </Section>

          <Section title="4. How to Request Cancellation">
            <p>
              Cancellations must be processed directly through the Turfzo platform:
            </p>
            <ol className="list-decimal pl-6 space-y-2 text-text-muted text-sm leading-relaxed">
              <li>Log in to your account on <Link href="/" className="text-brand-lime hover:underline">turfzo.app</Link> or the mobile app.</li>
              <li>Navigate to your <Link href="/bookings" className="text-brand-lime underline">Booking History</Link>.</li>
              <li>Select the active booking slot or tournament registration you wish to cancel.</li>
              <li>Click &ldquo;Cancel Booking&rdquo; and confirm. The refund calculations will display on-screen.</li>
            </ol>
          </Section>

          <Section title="5. Refund Processing Timelines">
            <p>
              Once initiated, refunds are processed securely via our payment gateway aggregator, Cashfree, back to the original source method. The timeline depends on your payment provider:
            </p>
            <ul>
              <li><strong>UPI (GPay, PhonePe, Paytm, etc.):</strong> 1 to 2 business days.</li>
              <li><strong>Net Banking:</strong> 2 to 4 business days.</li>
              <li><strong>Credit / Debit Cards:</strong> 5 to 7 business days.</li>
            </ul>
            <p>
              If you do not see the refund credit in your statement after 7 business days, please contact our settlement team at <a href="mailto:refunds@turfzo.com" className="text-brand-lime hover:underline">refunds@turfzo.com</a> with your booking confirmation code.
            </p>
          </Section>

          <Section title="6. Force Majeure & Ground Playability">
            <p>
              If a venue is closed unexpectedly due to natural disasters, heavy rain (for outdoor pitches without coverings), power failures, or government mandates, the Partner venue owner will declare the grounds unplayable.
            </p>
            <p>
              In such cases, the booking will be cancelled, and you will receive a full 100% refund. Users should not attempt to play in dangerous weather. If you arrive and the pitch is unusable but not flagged in the app, please notify the venue manager to initiate the refund process.
            </p>
          </Section>

          <Section title="7. Dispute Resolution">
            <p>
              If you have any questions or disputes regarding a refund calculation or cancellation eligibility, please reach out to us within 30 days of the transaction at <a href="mailto:refunds@turfzo.com" className="text-brand-lime hover:underline">refunds@turfzo.com</a>. We review all claims and respond within 3 to 5 business days.
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
      <h2 className="font-sans text-xl md:text-2xl font-bold mb-3 text-text-main tracking-tight">{title}</h2>
      <div className="text-text-muted text-sm font-sans leading-relaxed space-y-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1.5">
        {children}
      </div>
    </section>
  );
}
