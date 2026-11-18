import type { Metadata } from "next";
import EventSchema from "@/components/seo/EventSchema";
import BreadcrumbSchema from "@/components/seo/BreadcrumbSchema";
import prisma from "@/lib/prisma";
import { EventBattleProvider } from "@/providers/EventBattleContext";

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

const isUuid = (val: string): boolean =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);

async function getEventData(eventId: string) {
  // 1. Direct Prisma lookup first (fastest, ~2-5ms in Server Components)
  try {
    const decoded = decodeURIComponent(eventId).trim();
    const event = await prisma.events.findFirst({
      where: {
        OR: [
          { slug: { equals: decoded, mode: 'insensitive' } },
          ...(isUuid(decoded) ? [{ id: decoded }] : []),
        ],
      },
      select: {
        id: true,
        title: true,
        slug: true,
        tagline: true,
        description: true,
        banner_url: true,
        starts_at: true,
        ends_at: true,
        status: true,
        submission_config: true,
      },
    });
    if (event) {
      return {
        ...event,
        starts_at: event.starts_at?.toISOString() ?? null,
        ends_at: event.ends_at?.toISOString() ?? null,
        status: event.status,
        submission_config: event.submission_config as Record<string, unknown> | null,
      };
    }
  } catch {
    // Continue to external fetch fallback if DB lookup fails
  }

  // 2. Fallback to external event backend with fast timeout
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200);
    const res = await fetch(
      `${EVENT_BACKEND_URL}/api/events/${encodeURIComponent(eventId)}`,
      {
        signal: controller.signal,
        next: { revalidate: 60 },
      }
    );
    clearTimeout(timeoutId);
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

  const subConfig = (event?.submission_config || {}) as Record<string, unknown>;
  const battleConfig = subConfig.battle_arena as { enabled?: boolean; allowed_modes?: ('code' | 'mcq')[] } | undefined;
  const isBattleArenaEnabled = Boolean(
    battleConfig?.enabled &&
    Array.isArray(battleConfig?.allowed_modes) &&
    battleConfig.allowed_modes.length > 0
  );
  const allowedModes = isBattleArenaEnabled
    ? battleConfig!.allowed_modes!
    : (['code', 'mcq'] as ('code' | 'mcq')[]);

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
      <EventBattleProvider
        eventId={eventId}
        canonicalEventId={event?.id}
        eventTitle={event?.title}
        eventStatus={event?.status}
        isBattleArenaEnabled={isBattleArenaEnabled}
        allowedModes={allowedModes}
      >
        {children}
      </EventBattleProvider>
    </>
  );
}
