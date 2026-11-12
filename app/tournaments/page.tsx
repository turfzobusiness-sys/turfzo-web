import TournamentsClient, {
  type Tournament,
} from "@/components/tournaments/tournaments-client";
import { convexClient } from "@/lib/convex";
import {
  BreadcrumbListSchema,
  FAQPageSchema,
  ItemListSchema,
} from "@/lib/schema";

export const revalidate = 300;

const TOURNAMENT_FAQS = [
  {
    question: "How do I register a team for a turf tournament on Turfzo?",
    answer:
      "Browse open competitions on this page, check the sport format, squad cap, and entry fee, and complete registration online. Paid entries issue an instant QR check-in pass upon confirmation.",
  },
  {
    question: "Can venue owners host their own knockout brackets on Turfzo?",
    answer:
      "Yes. Turf owners and organizers can list 5v5 football cups, box cricket knockouts, or badminton opens, manage single-elimination brackets, and collect entry fees online.",
  },
  {
    question: "How are tournament entry fees collected?",
    answer:
      "All online tournament entry fees are processed securely via Cashfree without needing manual screenshot tracking across messaging groups.",
  },
];

export default async function TournamentsPage() {
  let initialTournaments: Tournament[] | undefined;

  if (process.env.NEXT_PUBLIC_CONVEX_DEPLOYMENT_URL) {
    try {
      const data = await convexClient.query<Tournament[]>(
        "tournaments:getOpen",
        {},
      );
      initialTournaments = data ?? [];
    } catch {
      initialTournaments = undefined;
    }
  }

  return (
    <>
      <BreadcrumbListSchema
        items={[
          { name: "Home", url: "https://turfzo.app" },
          { name: "Tournaments", url: "https://turfzo.app/tournaments" },
        ]}
      />
      <FAQPageSchema items={TOURNAMENT_FAQS} />
      {initialTournaments && initialTournaments.length > 0 && (
        <ItemListSchema
          name="Open Turf Tournaments on Turfzo"
          url="https://turfzo.app/tournaments"
          items={initialTournaments.slice(0, 12).map((t) => ({
            name: t.title,
            url: `https://turfzo.app/tournament/${t._id}`,
          }))}
        />
      )}
      <TournamentsClient initialTournaments={initialTournaments} />
    </>
  );
}
