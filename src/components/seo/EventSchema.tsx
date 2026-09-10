interface EventSchemaProps {
  name: string;
  description: string;
  startDate?: string | null;
  endDate?: string | null;
  url: string;
  imageUrl?: string | null;
}

export default function EventSchema({
  name,
  description,
  startDate,
  endDate,
  url,
  imageUrl,
}: EventSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Event",
    name,
    description,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
    location: {
      "@type": "VirtualLocation",
      url,
    },
    image: imageUrl ? [imageUrl] : undefined,
    organizer: {
      "@type": "Organization",
      name: "CosmoDex",
      url: "https://www.cosmodex.in",
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
      url,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
