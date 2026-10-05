import { NextResponse } from 'next/server';

import { SITE_CONFIG, capiReady } from '@/lib/site-config';
import {
  sendCapiEvent,
  sha256Hex,
  type Occupation,
  type SendableEvent,
} from '@/lib/meta-capi';
import { readClientIp, readClientUserAgent, readEdgeGeo } from '@/lib/request-signals';

/**
 * One route for the browser-initiated events: ViewContent and atc_event.
 *
 * registration_complete is deliberately NOT accepted here. It is sent by
 * /api/register, in the same request that stores the lead, so it can only
 * ever describe a registration that actually happened.
 *
 * The client IP, user agent and location are read from THIS request's
 * headers, which is the correct source: this is a fetch from the visitor's
 * own browser.
 */
const ALLOWED: SendableEvent[] = ['ViewContent', 'atc_event'];

const OCCUPATIONS: Occupation[] = ['working_professional', 'homemaker'];

/* The browser generates the event_id so the pixel and this route can share it
   and Meta can deduplicate the pair. Accepted only if it looks like an id we
   would have made; anything else falls back to a server-derived one. */
const EVENT_ID = /^[A-Za-z0-9_-]{8,64}$/;

const str = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : undefined);

export async function POST(req: Request) {
  if (!capiReady()) {
    return NextResponse.json({ ok: false, reason: 'capi-not-configured' });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, reason: 'bad-json' }, { status: 400 });
  }

  const eventName = String(body.eventName ?? '') as SendableEvent;
  if (!ALLOWED.includes(eventName)) {
    return NextResponse.json(
      { ok: false, reason: 'event-not-allowed' },
      { status: 400 },
    );
  }

  const email = str(body.email);
  const fbp = str(body.fbp);

  const rawOccupation = String(body.occupation ?? '') as Occupation;
  const occupation = OCCUPATIONS.includes(rawOccupation) ? rawOccupation : undefined;

  const clientEventId = typeof body.eventId === 'string' ? body.eventId : '';
  const eventId = EVENT_ID.test(clientEventId)
    ? clientEventId
    : sha256Hex(`${email || fbp || `${Date.now()}_${Math.random()}`}|${eventName}`);

  const geo = readEdgeGeo(req);
  const formCountry = str(body.country);

  const result = await sendCapiEvent({
    pixelId: SITE_CONFIG.meta.pixelId,
    accessToken: SITE_CONFIG.meta.accessToken,
    eventName,
    eventId,
    eventSourceUrl: str(body.eventSourceUrl) || SITE_CONFIG.fallbackEventSourceUrl,
    user: {
      /* Present only for a returning visitor who has already registered in this
         browser — see rememberLead in lib/track.ts. A first-time click carries
         none of these, and the device + geo keys below do the matching. */
      email,
      phone: str(body.phone),
      firstName: str(body.firstName),
      lastName: str(body.lastName),
      /* The form's answer when we have one, otherwise the edge's. Never a
         hard-coded guess: a wrong hashed country is worse than none. */
      country:
        formCountry && formCountry.length === 2
          ? formCountry.toLowerCase()
          : geo.country || undefined,
      city: str(body.city) || geo.city || undefined,
      state: geo.region || undefined,
      zip: geo.zip || undefined,
      externalId: str(body.externalId),
      fbc: str(body.fbc),
      fbp,
      clientIp: readClientIp(req) || undefined,
      clientUserAgent: readClientUserAgent(req) || undefined,
    },
    occupation,
    testEventCode: SITE_CONFIG.meta.testEventCode || undefined,
  });

  return NextResponse.json({ ok: result.ok, eventName, eventId });
}
