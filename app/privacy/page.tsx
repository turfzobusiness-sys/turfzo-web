import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/ui/header-2";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy | Turfzo",
  description:
    "How Turfzo collects, uses, and protects your personal data under the DPDP Act 2023.",
  alternates: { canonical: "https://turfzo.com/privacy" },
};

export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-bg text-text-main">
      <Header />
      <main className="flex-grow pt-28 pb-20">
        <article className="max-w-3xl mx-auto px-6 md:px-8">
          <div className="border-b border-border-default pb-6 mb-8">
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-lime">
              Privacy & Consent
            </span>
            <h1 className="font-sans text-4xl md:text-5xl font-extrabold mt-2 mb-3 tracking-tight">
              Privacy Policy
            </h1>
            <p className="text-text-muted text-xs font-sans">
              Last updated: June 8, 2026
            </p>
          </div>

          <Section title="1. Introduction">
            <p>
              Turfzo Sports Technologies Pvt. Ltd. (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) is committed to protecting the privacy of our users (&ldquo;you&rdquo;). This Privacy Policy explains how we collect, store, share, and process your personal information when you use our website (turfzo.com), mobile application, or any associated venue booking services. We strictly adhere to the Digital Personal Data Protection (DPDP) Act, 2023, of India and other applicable data security regulations.
            </p>
          </Section>

          <Section title="2. Consent and Purpose Limitation">
            <p>
              By signing up on Turfzo, completing booking checkout, or submitting inquiry forms, you provide your explicit consent for us to process your personal data for the specific purposes outlined in this policy. You have the right to withdraw your consent at any time by emailing us at <a href="mailto:privacy@turfzo.com" className="text-brand-lime hover:underline">privacy@turfzo.com</a>. Please note that withdrawing consent may limit our ability to provide booking facilitation services to you.
            </p>
          </Section>

          <Section title="3. Information We Collect">
            <p>We collect personal information necessary to process bookings, prevent fraud, and run the Platform:</p>
            <ul>
              <li><strong>Account Registration Data:</strong> Full name, email address, mobile phone number, and avatar image (obtained via Google OAuth login if selected).</li>
              <li><strong>Booking History:</strong> Venue selections, play dates, slot timings, sport category preferences, tournament entry registrations, and transaction amounts.</li>
              <li><strong>Device Telemetry:</strong> IP address, device type, operating system, browser configuration, page navigation paths, and time spent on pages.</li>
              <li><strong>Payment Processing:</strong> All payment details are collected directly by our RBI-compliant payment aggregator, Razorpay. Turfzo <strong>never</strong> views or stores your raw card numbers, CVVs, net banking credentials, or UPI PINs.</li>
            </ul>
          </Section>

          <Section title="4. How We Use Your Information">
            <p>We process your personal data under the DPDP Act guidelines only to:</p>
            <ul>
              <li>Facilitate, confirm, and manage your sports venue bookings.</li>
              <li>Deliver transactional SMS and email notifications (booking confirmations, QR codes, payment receipts, slot reminders, and cancellation alerts).</li>
              <li>Verify user identities and prevent fraudulent or abusive bookings.</li>
              <li>Analyze usage trends to improve page layout, navigation speeds, and add new sports arenas.</li>
              <li>Comply with statutory tax auditing, accounting, and legal requirements.</li>
            </ul>
          </Section>

          <Section title="5. Data Sharing and Disclosures">
            <p>We do not sell, rent, or lease your personal data. We share information only with trusted third parties for service delivery:</p>
            <ul>
              <li><strong>Partner Venues:</strong> When you book a slot, we share your name and mobile number with the respective Partner (turf owner) to verify your entry at the ground.</li>
              <li><strong>Payment aggregators:</strong> Razorpay (to process checkout payments securely).</li>
              <li><strong>Notification Services:</strong> Email and SMS gateways to dispatch automated confirmation logs.</li>
              <li><strong>Legal Obligations:</strong> We may disclose data if required by law enforcement or competent judicial bodies under a valid government warrant.</li>
            </ul>
          </Section>

          <Section title="6. Cookies and Trackers">
            <p>
              We use first-party cookies to manage secure sessions, remember authentication tokens, and keep you logged in. You can disable cookies in your browser settings, but doing so will prevent you from making bookings or logging in. We also use analytics tools (such as PostHog) to aggregate non-identifying telemetry patterns to improve our UI flows.
            </p>
          </Section>

          <Section title="7. Data Security and Storage Safeguards">
            <p>
              We implement robust technical and organizational security controls:
            </p>
            <ul>
              <li>All database communication is protected via end-to-end HTTPS/TLS encryption.</li>
              <li>User passwords and profiles are securely stored and encrypted via Firebase Auth services.</li>
              <li>We perform regular code audits, linting checks, and use dependency alerts to prevent vulnerability injections.</li>
            </ul>
          </Section>

          <Section title="8. Data Retention and Deletion Rights">
            <p>
              We retain your account details as long as your account remains active. Transactional history and invoice logs are retained for a period of 7 years in compliance with Indian tax laws.
            </p>
            <p>
              You have the right to request complete erasure of your account. You can trigger deletion directly from your <Link href="/profile" className="text-brand-lime underline">profile page</Link> or by sending an email to <a href="mailto:privacy@turfzo.com" className="text-brand-lime hover:underline">privacy@turfzo.com</a>. Upon verification, we will permanently purge all non-statutory data within 30 days.
            </p>
          </Section>

          <Section title="9. Grievance Officer details (DPDP Act Compliance)">
            <p>
              In compliance with the Digital Personal Data Protection Act, 2023, you can address any privacy concerns, data rights requests, or complaints to our designated Grievance Officer:
            </p>
            <div className="bg-surface border border-border-default p-4 rounded-[8px] font-mono text-xs text-text-muted mt-2 space-y-1">
              <strong>Name:</strong> Akram Shaikh, Co-Founder
              <br />
              <strong>Email:</strong> <a href="mailto:grievance@turfzo.com" className="text-brand-lime hover:underline">grievance@turfzo.com</a>
              <br />
              <strong>Address:</strong> Turfzo Sports Technologies Pvt. Ltd., 100 Feet Rd, HSR Layout, Bengaluru, Karnataka 560102
            </div>
          </Section>

          <Section title="10. Policy Updates">
            <p>
              We may update this Privacy Policy periodically. We will notify you of any changes by posting the revised version on this page and updating the &quot;Last updated&quot; date. We encourage you to review this page regularly to stay informed.
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
