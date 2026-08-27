import { NextResponse } from 'next/server';

import { CHECKOUT_CONFIG, capiReady } from '@/lib/checkout-config';
import { sendCapiEvent, sha256Hex, type StandardEvent } from '@/lib/meta-capi';

/**
 * One route for the three intent events: ViewContent, AddToCart and
 * InitiateCheckout.
 *
 * Ankita uses a route per event. One route is fewer moving parts and the
 * payloads are identical apart from the name and the dedup key, but the
 * allow-list below is what keeps that from becoming a hole: only Meta standard
 * names are accepted, and Purchase is explicitly NOT among them. Purchase is
 * only ever sent by the Razorpay webhook, where the payment is proven.
 */
const ALLOWED: StandardEvent[] = ['ViewContent', 'AddToCart', 'InitiateCheckout'];

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

  const eventName = String(body.eventName ?? '') as StandardEvent;
  if (!ALLOWED.includes(eventName)) {
    return NextResponse.json(
      { ok: false, reason: 'event-not-allowed' },
      { status: 400 },
    );
  }

  const email = typeof body.email === 'string' ? body.email : '';
  const fbp = typeof body.fbp === 'string' ? body.fbp : undefined;

  /* Dedup keys, deterministic so Meta's 48h window collapses double-fires:
     by email where we have one, otherwise by the browser's _fbp. */
  const seed = email || fbp || `${Date.now()}_${Math.random()}`;
  const eventId = sha256Hex(`${seed}|${eventName}`);

  const result = await sendCapiEvent({
    pixelId: CHECKOUT_CONFIG.meta.pixelId,
    accessToken: CHECKOUT_CONFIG.meta.accessToken,
    eventName,
    eventId,
    eventSourceUrl:
      (typeof body.eventSourceUrl === 'string' && body.eventSourceUrl) ||
      CHECKOUT_CONFIG.fallbackEventSourceUrl,
    user: {
      email: email || undefined,
      phone: typeof body.phone === 'string' ? body.phone : undefined,
      firstName: typeof body.firstName === 'string' ? body.firstName : undefined,
      lastName: typeof body.lastName === 'string' ? body.lastName : undefined,
      /* Was hard-coded 'in'. The checkout now asks, so an overseas buyer is no
         longer reported as Indian, which is a wrong hashed value rather than a
         missing one: worse than sending nothing. Falls back to India for the
         landing-page events, which carry no form. */
      country:
        typeof body.country === 'string' && body.country.length === 2
          ? body.country.toLowerCase()
          : 'in',
      city: typeof body.city === 'string' ? body.city : undefined,
      externalId:
        typeof body.externalId === 'string' ? body.externalId : undefined,
      fbc: typeof body.fbc === 'string' ? body.fbc : undefined,
      fbp,
      clientIp:
        req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || undefined,
      clientUserAgent: req.headers.get('user-agent') ?? undefined,
    },
    valueRupees: CHECKOUT_CONFIG.amountRupees,
    currency: CHECKOUT_CONFIG.currency,
    contentName: CHECKOUT_CONFIG.contentName,
    utm: (body.utm as Record<string, string>) ?? undefined,
    testEventCode: CHECKOUT_CONFIG.meta.testEventCode || undefined,
  });

  return NextResponse.json({ ok: result.ok, eventName, eventId });
}
