// SECURITY: JSON-LD blocks are injected via dangerouslySetInnerHTML, so
// owner-controlled strings (turf names, addresses, descriptions) could
// close the <script> tag and execute. JSON.stringify then escaping <, >, &
// (and JS line separators) keeps the markup inert while remaining valid,
// parseable JSON for crawlers.
export function safeJsonLd(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

export interface OrganizationSchemaProps {
  name: string;
  url: string;
  logo: string;
  description: string;
  sameAs?: string[];
  address?: {
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  contactPoint?: {
    telephone?: string;
    email?: string;
    url?: string;
    contactType: string;
    availableLanguage?: string[];
    areaServed?: string;
  };
}

export function OrganizationSchema({
  name,
  url,
  logo,
  description,
  sameAs = [],
  address,
  contactPoint,
}: OrganizationSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name,
    url,
    logo,
    description,
    ...(sameAs.length > 0 && { sameAs }),
    ...(address && { address: { "@type": "PostalAddress", ...address } }),
    ...(contactPoint && {
      contactPoint: { "@type": "ContactPoint", ...contactPoint },
    }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJsonLd(schema) }}
    />
  );
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface FAQPageSchemaProps {
  items: FAQItem[];
  id?: string;
}

export function FAQPageSchema({ items, id }: FAQPageSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJsonLd(schema) }}
    />
  );
}

export interface HowToStep {
  name: string;
  text: string;
  image?: string;
}

export interface HowToSchemaProps {
  name: string;
  description: string;
  totalTime: string;
  steps: HowToStep[];
}

export function HowToSchema({
  name,
  description,
  totalTime,
  steps,
}: HowToSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name,
    description,
    totalTime,
    step: steps.map((step) => ({
      "@type": "HowToStep",
      name: step.name,
      text: step.text,
      ...(step.image && { image: step.image }),
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJsonLd(schema) }}
    />
  );
}

export interface SportsActivityLocationSchemaProps {
  name: string;
  description: string;
  address: {
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
  };
  geo?: { latitude: number; longitude: number };
  sportType: string;
  pricePerHour: number;
  rating?: number;
  reviewCount?: number;
  image?: string;
  openingHours?: string;
}

export function SportsActivityLocationSchema({
  name,
  description,
  address,
  geo,
  sportType,
  pricePerHour,
  rating,
  reviewCount,
  image,
  openingHours,
}: SportsActivityLocationSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "SportsActivityLocation",
    name,
    description,
    address: { "@type": "PostalAddress", ...address },
    ...(geo && { geo: { "@type": "GeoCoordinates", ...geo } }),
    sportsActivityLocation: sportType,
    offers: {
      "@type": "Offer",
      price: pricePerHour,
      priceCurrency: "INR",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: pricePerHour,
        priceCurrency: "INR",
        billingDuration: "1 hour",
      },
    },
    ...(rating &&
      reviewCount && {
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: rating,
          reviewCount,
        },
      }),
    ...(image && { image }),
    ...(openingHours && { openingHours }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJsonLd(schema) }}
    />
  );
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface BreadcrumbListSchemaProps {
  items: BreadcrumbItem[];
}

export function BreadcrumbListSchema({ items }: BreadcrumbListSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJsonLd(schema) }}
    />
  );
}

export interface WebSiteSchemaProps {
  name: string;
  url: string;
  description?: string;
  potentialAction?: {
    target: string;
    "query-input": string;
  };
}

export function WebSiteSchema({ name, url, description, potentialAction }: WebSiteSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name,
    url,
    ...(description && { description }),
    ...(potentialAction && {
      potentialAction: {
        "@type": "SearchAction",
        target: potentialAction.target,
        "query-input": potentialAction["query-input"],
      },
    }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJsonLd(schema) }}
    />
  );
}

export interface ArticleSchemaProps {
  name: string;
  description: string;
  datePublished: string;
  dateModified: string;
  author: { "@type": string; name: string };
  publisher: {
    "@type": string;
    name: string;
    logo: { "@type": string; url: string };
  };
  image?: string;
}

export function ArticleSchema({
  name,
  description,
  datePublished,
  dateModified,
  author,
  publisher,
  image,
}: ArticleSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: name,
    description,
    datePublished,
    dateModified,
    author,
    publisher,
    ...(image && { image }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJsonLd(schema) }}
    />
  );
}

export interface SiteNavigationItem {
  name: string;
  url: string;
}

export interface SiteNavigationSchemaProps {
  items: SiteNavigationItem[];
}

export function SiteNavigationSchema({ items }: SiteNavigationSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@graph": items.map((item) => ({
      "@type": "SiteNavigationElement",
      "@id": `${item.url}#nav`,
      "name": item.name,
      "url": item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJsonLd(schema) }}
    />
  );
}

export interface SportsEventSchemaProps {
  name: string;
  description: string;
  startDate: string;
  endDate?: string;
  url: string;
  sport: string;
  entryFee: number;
  image?: string;
  eventStatus?: string;
  locationName?: string;
  city?: string | null;
}

export function SportsEventSchema({
  name,
  description,
  startDate,
  endDate,
  url,
  sport,
  entryFee,
  image,
  eventStatus,
  locationName,
  city,
}: SportsEventSchemaProps) {
  const mappedStatus =
    eventStatus === "cancelled"
      ? "https://schema.org/EventCancelled"
      : "https://schema.org/EventScheduled";

  const schema = {
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    name,
    description,
    sport,
    startDate,
    ...(endDate && { endDate }),
    url,
    eventStatus: mappedStatus,
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: locationName || "Turfzo Partner Venue",
      ...(city && {
        address: {
          "@type": "PostalAddress",
          addressLocality: city,
          addressCountry: "IN",
        },
      }),
    },
    offers: {
      "@type": "Offer",
      price: entryFee,
      priceCurrency: "INR",
      url,
      availability:
        eventStatus === "cancelled" || eventStatus === "completed"
          ? "https://schema.org/SoldOut"
          : "https://schema.org/InStock",
    },
    organizer: {
      "@type": "Organization",
      name: "Turfzo",
      url: "https://turfzo.app",
    },
    ...(image && { image }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJsonLd(schema) }}
    />
  );
}

export interface ContactPageSchemaProps {
  name: string;
  description: string;
  url: string;
  email?: string;
}

export function ContactPageSchema({
  name,
  description,
  url,
  email,
}: ContactPageSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name,
    description,
    url,
    mainEntity: {
      "@type": "Organization",
      name: "Turfzo",
      url: "https://turfzo.app",
      ...(email && { email }),
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJsonLd(schema) }}
    />
  );
}

export interface ItemListEntry {
  name: string;
  url: string;
  description?: string;
}

export interface ItemListSchemaProps {
  name: string;
  url: string;
  items: ItemListEntry[];
}

export function ItemListSchema({ name, url, items }: ItemListSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    url,
    numberOfItems: items.length,
    itemListElement: items.map((item, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: item.name,
      url: item.url,
      ...(item.description && { description: item.description }),
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJsonLd(schema) }}
    />
  );
}
