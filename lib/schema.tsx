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
    telephone: string;
    contactType: string;
    availableLanguage?: string[];
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
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
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
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
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
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
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
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
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
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export interface WebSiteSchemaProps {
  name: string;
  url: string;
  potentialAction?: {
    target: string;
    "query-input": string;
  };
}

export function WebSiteSchema({ name, url, potentialAction }: WebSiteSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name,
    url,
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
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
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
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
