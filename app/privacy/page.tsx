import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Turfzo collects, uses, and protects your personal information.",
  alternates: { canonical: "https://turfzo.com/privacy" },
};

export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-bg-dark text-text-main">
      <Navbar />
      <main className="flex-grow pt-24 pb-16">
        <article className="max-w-3xl mx-auto px-6 md:px-8">
          <h1 className="font-poppins text-4xl font-extrabold mb-2">
            Privacy Policy
          </h1>
          <p className="text-text-muted text-sm mb-8">
            Last updated: {new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}
          </p>

          <Section title="1. Information We Collect">
            <p>We collect the following types of information:</p>
            <ul>
              <li>
                <strong>Account data:</strong> name, email, phone number, profile photo (if you
                sign in with Google).
              </li>
              <li>
                <strong>Booking data:</strong> venue selections, payment amounts, booking history.
              </li>
              <li>
                <strong>Device data:</strong> IP address, browser type, device identifiers,
                pages visited.
              </li>
              <li>
                <strong>Payment data:</strong> processed by Razorpay. We never see or store
                your card number, CVV, or UPI PIN.
              </li>
            </ul>
          </Section>

          <Section title="2. How We Use Information">
            <p>We use your information to:</p>
            <ul>
              <li>Process and confirm bookings.</li>
              <li>Send transactional emails (confirmations, reminders, cancellations, refunds).</li>
              <li>Detect and prevent fraud.</li>
              <li>Improve the Platform and develop new features.</li>
              <li>Comply with legal obligations.</li>
            </ul>
          </Section>

          <Section title="3. Sharing of Information">
            <p>We share information only with:</p>
            <ul>
              <li>Venues you book (your name, phone, booking details).</li>
              <li>Payment processor Razorpay (to process your payment).</li>
              <li>Email service providers (to send confirmations).</li>
              <li>Analytics providers (PostHog or similar), in aggregated form.</li>
              <li>Law enforcement, when required by valid legal process.</li>
            </ul>
            <p>
              We <strong>never</strong> sell your personal data to third parties.
            </p>
          </Section>

          <Section title="4. Cookies">
            <p>
              We use essential cookies for authentication and session management, and
              optional analytics cookies (only with your consent) to understand usage
              patterns.
            </p>
          </Section>

          <Section title="5. Data Security">
            <p>
              We use industry-standard encryption (HTTPS/TLS), hashed passwords via Firebase
              Auth, and least-privilege access controls. However, no system is 100%
              secure, and we cannot guarantee absolute security.
            </p>
          </Section>

          <Section title="6. Your Rights">
            <p>
              You can access, update, or delete your account data at any time from your{" "}
              <Link href="/profile" className="text-brand-lime underline">
                profile page
              </Link>
              . To request complete data deletion, email privacy@turfzo.com. We respond within
              30 days.
            </p>
          </Section>

          <Section title="7. Data Retention">
            <p>
              We retain your account data while your account is active. Booking records are
              retained for 7 years for tax and legal compliance. After deletion, data is
              purged within 90 days except where retention is legally required.
            </p>
          </Section>

          <Section title="8. Children&apos;s Privacy">
            <p>
              Turfzo is not intended for users under 13. We do not knowingly collect data
              from children. Parents can request deletion of any inadvertently collected
              data by emailing privacy@turfzo.com.
            </p>
          </Section>

          <Section title="9. Grievance Officer (India DPDP Act 2023)">
            <p>
              In accordance with the Digital Personal Data Protection Act, 2023, our
              Grievance Officer is:
            </p>
            <p>
              <strong>Name:</strong> [To be appointed]
              <br />
              <strong>Email:</strong> grievance@turfzo.com
              <br />
              <strong>Address:</strong> 100 Feet Rd, HSR Layout, Bengaluru, Karnataka 560102
            </p>
          </Section>

          <Section title="10. Contact">
            <p>
              For privacy questions or to exercise your rights, email{" "}
              <a href="mailto:privacy@turfzo.com" className="text-brand-lime underline">
                privacy@turfzo.com
              </a>
              .
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
