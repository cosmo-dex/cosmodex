import type { Metadata } from "next";
import EventSchema from "@/components/seo/EventSchema";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";

interface Props {
  children: React.ReactNode;
  params: Promise<{
    eventId: string;
  }>;
}

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.cosmodex.in";
const EVENT_BACKEND_URL =
  process.env.EVENT_BACKEND_URL ||
  process.env.NEXT_PUBLIC_EVENT_BACKEND_URL ||
  "https://event-backend-golang.onrender.com";

async function getEventData(eventId: string) {
  try {
    const res = await fetch(
      `${EVENT_BACKEND_URL}/api/events/${encodeURIComponent(eventId)}`,
      {
        next: { revalidate: 60 },
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data?.event || null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ eventId: string }>;
}): Promise<Metadata> {
  const { eventId } = await params;
  const event = await getEventData(eventId);

  if (!event) {
    return {
      title: "Coding Contest & Hackathon | CosmoDex Events",
      description:
        "Join interactive coding events, hackathons, and programming competitions on CosmoDex.",
      alternates: {
        canonical: `${appUrl}/events/${eventId}`,
      },
    };
  }

  const title = `${event.title} | CosmoDex Events`;
  const description =
    event.tagline ||
    (event.description ? event.description.slice(0, 155) : "") ||
    "Join interactive coding events, hackathons, and programming competitions on CosmoDex.";

  return {
    title,
    description,
    alternates: {
      canonical: `${appUrl}/events/${eventId}`,
    },
    openGraph: {
      title,
      description,
      url: `${appUrl}/events/${eventId}`,
      type: "website",
      images: event.banner_url ? [{ url: event.banner_url }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: event.banner_url ? [event.banner_url] : undefined,
    },
  };
}

export default async function EventDetailLayout({ children, params }: Props) {
  const { eventId } = await params;
  const event = await getEventData(eventId);

  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: "Home", url: appUrl },
          { name: "Events", url: `${appUrl}/events` },
          {
            name: event?.title || "Event",
            url: `${appUrl}/events/${eventId}`,
          },
        ]}
      />
      {event && (
        <EventSchema
          name={event.title}
          description={event.description || event.tagline || event.title}
          startDate={event.starts_at}
          endDate={event.ends_at}
          url={`${appUrl}/events/${eventId}`}
          imageUrl={event.banner_url}
        />
      )}
      {children}
    </>
  );
}
