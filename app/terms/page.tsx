import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/ui/header-2";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Terms of Service | Turfzo",
  description:
    "Terms of Service for using Turfzo — India's premium turf and sports venue booking platform.",
  alternates: { canonical: "https://turfzo.com/terms" },
};

export default function TermsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-bg text-text-main">
      <Header />
      <main className="flex-grow pt-28 pb-20">
        <article className="max-w-3xl mx-auto px-6 md:px-8">
          <div className="border-b border-border-default pb-6 mb-8">
            <span className="text-xs font-semibold uppercase tracking-wider text-brand-lime">
              Legal Agreement
            </span>
            <h1 className="font-sans text-4xl md:text-5xl font-extrabold mt-2 mb-3 tracking-tight">
              Terms of Service
            </h1>
            <p className="text-text-muted text-xs font-sans">
              Last updated: June 8, 2026
            </p>
          </div>

          <Section title="1. Acceptance of Terms">
            <p>
              Welcome to Turfzo (the &ldquo;Platform&rdquo;), owned and operated by Turfzo Sports Technologies Pvt. Ltd. (&ldquo;Company&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;). By accessing, browsing, registering for, or using the Platform, website (turfzo.com), or mobile application, you agree to be bound by these Terms of Service (&ldquo;Terms&rdquo;) and all applicable laws. If you do not agree to these Terms, you must immediately cease all use of our services.
            </p>
          </Section>

          <Section title="2. Service facilitator Disclaimer (Marketplace Role)">
            <p>
              Turfzo operates strictly as a technology-based marketplace platform that connects sports enthusiasts (&ldquo;Users&rdquo;) with third-party sports arenas, fields, and courts (&ldquo;Partners&rdquo; or &ldquo;Venue Owners&rdquo;).
            </p>
            <p>
              Please note that:
            </p>
            <ul>
              <li>The actual contract for the booking and usage of any sports venue is entered into directly between the User and the Partner.</li>
              <li>Turfzo is not a party to this transaction and has no control over, nor assumes any liability for, the safety, condition, availability, specifications, or quality of the venues.</li>
              <li>Partners are solely responsible for ensuring compliance with all local safety regulations, fire codes, lighting standards, and insurance requirements.</li>
            </ul>
          </Section>

          <Section title="3. User Account Registration & Security">
            <p>
              To book slots or register for tournaments, you must create a Turfzo account. You agree to provide accurate, current, and complete information during registration and keep it updated.
            </p>
            <p>
              You are entirely responsible for safeguarding your account credentials (whether password or Google OAuth tokens). Any activity performed through your account is deemed to be authorized by you, and you agree to notify us immediately at <a href="mailto:security@turfzo.com" className="text-brand-lime hover:underline">security@turfzo.com</a> of any unauthorized access or breach of security.
            </p>
          </Section>

          <Section title="4. Pricing, Payments, and Taxes">
            <p>
              All prices listed on the Platform are determined by the respective Partners and are in Indian Rupees (INR).
            </p>
            <ul>
              <li>Prices are inclusive of applicable Goods and Services Tax (GST) as designated by the Partner.</li>
              <li>Online payments are processed securely through our RBI-authorized third-party payment gateway, Razorpay.</li>
              <li>You agree to pay all charges incurred by your account, including any booking convenience fees or processing fees charged by Turfzo, which will be clearly shown at the checkout screen.</li>
              <li>A booking is officially confirmed only after Turfzo receives successful payment authorization from the payment gateway and issues a booking confirmation code.</li>
            </ul>
          </Section>

          <Section title="5. Cancellation & Refund Policy">
            <p>
              We implement a structured, automated cancellation window to balance User flexibility with Partner venue utilization. Unless specified otherwise on a particular venue&apos;s details page, the default policy is:
            </p>
            <ul>
              <li><strong>24+ hours prior to slot start time:</strong> Full (100%) refund of the booking amount, minus any non-refundable convenience/payment gateway fees.</li>
              <li><strong>6 to 24 hours prior to slot start time:</strong> Fifty percent (50%) refund of the booking amount.</li>
              <li><strong>Less than 6 hours prior to slot start time:</strong> No refund is applicable.</li>
              <li><strong>Force Majeure & Inclement Weather:</strong> Partners are responsible for declaring playability due to rain or power outages. If a Partner cancels a slot due to unplayability or technical issues, the User will receive a full refund.</li>
            </ul>
            <p>
              Approved refunds are initiated automatically and processed within 5 to 7 business days to the original payment source.
            </p>
          </Section>

          <Section title="6. User Code of Conduct & Liabilities">
            <p>
              By booking a venue through Turfzo, you agree to respect the venue&apos;s rules, timing slots, and equipment requirements (e.g., wearing non-marking shoes on wooden floors, avoiding metal spikes on artificial turf).
            </p>
            <p>
              You shall be solely held liable for any damages to the Partner&apos;s property, equipment, turf surface, or lighting fixtures caused by you or your co-players. You agree to indemnify the Partner and Turfzo for any restoration costs. Fraudulent bookings, chargeback abuse, or use of abusive language toward staff is grounds for immediate account termination.
            </p>
          </Section>

          <Section title="7. Intellectual Property Rights">
            <p>
              The design, source code, text, graphics, interactive animations, logos, and mascots (including &ldquo;Turfzo&rdquo; trademarks) are the exclusive intellectual property of Turfzo Sports Technologies Pvt. Ltd. and are protected by Indian copyright and trademark laws. You are granted a limited, non-exclusive, non-transferable license to access the Platform solely for personal, non-commercial venue booking purposes.
            </p>
          </Section>

          <Section title="8. Limitation of Liability & Indemnification">
            <p>
              To the maximum extent permitted under applicable law, Turfzo and its directors, employees, or agents shall not be liable for any direct, indirect, incidental, special, or consequential damages, including but not limited to loss of profits, data, or personal injuries/medical emergencies occurring during play at any booked venue.
            </p>
            <p>
              You agree to defend, indemnify, and hold harmless Turfzo and its affiliates from and against any claims, damages, obligations, losses, liabilities, costs, or debt arising from your violation of these Terms or your use of the booked sports facilities.
            </p>
          </Section>

          <Section title="9. Governing Law & Dispute Resolution">
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the Republic of India.
            </p>
            <p>
              Any dispute, controversy, or claim arising out of or relating to these Terms, including the validity or breach thereof, shall be subject to the exclusive jurisdiction of the competent courts located in Bengaluru, Karnataka.
            </p>
          </Section>

          <Section title="10. Changes to Terms & Contact">
            <p>
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 7 days&apos; notice via email or push notifications. Continued usage of the Platform after changes are published constitutes acceptance of the new Terms.
            </p>
            <p>
              For legal inquiries, copyright notices, or general questions, please write to our legal desk at <a href="mailto:legal@turfzo.com" className="text-brand-lime hover:underline">legal@turfzo.com</a> or contact us through the <Link href="/contact" className="text-brand-lime underline">Contact Us</Link> portal.
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
