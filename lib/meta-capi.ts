import crypto from 'crypto';

/**
 * Meta Conversions API primitives, shared by every server-side event route.
 *
 * Ported from ankita-postpartum with ONE deliberate change: this sends only
 * Meta's STANDARD event names. Ankita fires a custom `sales` event alongside
 * Purchase; that is dropped here. A custom event duplicating a standard one
 * adds no information and competes with it for Aggregated Event Measurement
 * priority on iOS, where standard names rank first.
 *
 * ── Health & wellness classification hygiene ──────────────────────────────
 * Meta classifies a dataset into its restricted "Health and wellness
 * condition" category by reading six surfaces, and a restriction, once
 * applied, binds at the root domain and is not cleanly reversible. This offer
 * is menopause coaching, so the intrinsic nature of the product is a signal we
 * cannot remove. Every signal we CAN remove is removed here, and that means
 * the two surfaces this file owns:
 *
 *   `custom_data` — the occupation enum ONLY. No `content_name`, no
 *   product string, no category, no UTM, no fbclid. custom_data is NOT hashed
 *   and IS read: "5-Day (Peri)Menopause Reset Challenge" arriving on every
 *   event is a plain-text declaration of the condition, and `utm_campaign`
 *   values are written by media buyers and drift toward symptom language with
 *   nobody reviewing them.
 *
 *   `event_source_url` — reduced to the ORIGIN. A path like
 *   /perimenopause-reset carries the same declaration in the same crawl.
 *
 * The standard event NAMES are deliberately kept. Coded custom events
 * (`evt_a`) are the belt-and-braces variant of this posture, but they forfeit
 * Aggregated Event Measurement priority, the built-in Purchase optimisation
 * and every standard-event prior in the ad account. The payload and the URL
 * are where the classification risk actually lives; the names are where the
 * performance lives. This keeps the performance and removes the risk.
 *
 * `user_data` is untouched and stays maximal: it is all SHA-256 hashed, it is
 * what EMQ is scored on, and it declares nothing about the offer.
 */

export type Utm = {
  source?: string;
  medium?: string;
  campaign?: string;
  content?: string;
  term?: string;
};

/**
 * Strip an event_source_url to its origin.
 *
 * Applied server-side rather than trusted from the caller, because the caller
 * is a browser posting `window.location.href` and that is precisely the value
 * with the health-y path and the fbclid on it. Falls back to the raw string
 * only if it will not parse — a malformed url is not a leak.
 */
export function originOnly(url: string): string {
  try {
    return new URL(url).origin;
  } catch {
    return url;
  }
}

/** Meta's standard events. Nothing outside this union is sendable. */
export type StandardEvent = 'ViewContent';

/**
 * Custom events, kept to a closed union for the same reason the standard ones
 * are: a free-form string is how a health term eventually reaches Meta as an
 * event name, which is the surface that gets a dataset classified.
 *
 *   atc_event              a landing-page CTA was clicked and the free
 *                          registration modal opened.
 *   registration_complete  the modal form was submitted and the lead stored.
 *
 * Both are fired from the browser pixel AND from the Conversions API with the
 * same event_id, so Meta deduplicates the pair into one event while keeping
 * the strongest match keys from each side.
 */
export type CustomEvent = 'atc_event' | 'registration_complete';

export type SendableEvent = StandardEvent | CustomEvent;

/**
 * The occupation answer, as a closed union rather than a string.
 *
 * This is the ONE descriptive value allowed into custom_data, and the type is
 * what keeps that true: neither member is a health or condition term, and a
 * free-form string here would be an open door for the next field someone
 * decides to "just add". If a third option is ever added to the checkout, it
 * gets reviewed here before it can reach Meta.
 */
export type Occupation = 'working_professional' | 'homemaker';

export function sha256Hex(value: string): string {
  return crypto.createHash('sha256').update(value).digest('hex');
}

/* Normalisation rules are Meta's, not ours. Each helper returns undefined for
   an empty field rather than hashing the empty string, which would otherwise
   ship a hash that matches every other empty field. */
export function hashEmail(v: string) {
  const s = v.trim().toLowerCase();
  return s ? sha256Hex(s) : undefined;
}
export function hashPhone(v: string) {
  const s = v.replace(/\D/g, ''); // E.164 without the plus
  return s ? sha256Hex(s) : undefined;
}
export function hashName(v: string) {
  const s = v.trim().toLowerCase();
  return s ? sha256Hex(s) : undefined;
}
export function hashCountry(v: string) {
  const s = v.trim().toLowerCase(); // ISO 3166-1 alpha-2
  return s ? sha256Hex(s) : undefined;
}

/* City: lowercase, and strip spaces and punctuation entirely. Meta's own
   normalisation removes them, so "New Delhi" and "newdelhi" must hash to the
   same value or the match is silently lost. */
export function hashCity(v: string) {
  const s = v.trim().toLowerCase().replace(/[^a-z]/g, '');
  return s ? sha256Hex(s) : undefined;
}

/* Postal code: lowercase, no spaces or dashes. */
export function hashZip(v: string) {
  const s = v.trim().toLowerCase().replace(/[\s-]/g, '');
  return s ? sha256Hex(s) : undefined;
}

export type UserSignals = {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  country?: string;
  city?: string;
  /** Region / emirate / state, Meta's `st`. From the edge geo headers. */
  state?: string;
  /** Postal code, Meta's `zp`. From the edge geo headers where present. */
  zip?: string;
  externalId?: string;
  fbc?: string;
  fbp?: string;
  clientIp?: string;
  clientUserAgent?: string;
};

function buildUserData(u: UserSignals) {
  return {
    ...(u.email && { em: [hashEmail(u.email)!] }),
    ...(u.phone && { ph: [hashPhone(u.phone)!] }),
    ...(u.firstName && { fn: [hashName(u.firstName)!] }),
    ...(u.lastName && { ln: [hashName(u.lastName)!] }),
    ...(u.country && { country: [hashCountry(u.country)!] }),
    ...(u.city && hashCity(u.city) && { ct: [hashCity(u.city)!] }),
    ...(u.state && hashCity(u.state) && { st: [hashCity(u.state)!] }),
    ...(u.zip && hashZip(u.zip) && { zp: [hashZip(u.zip)!] }),
    ...(u.externalId && { external_id: [sha256Hex(u.externalId)] }),
    ...(u.fbc && { fbc: u.fbc }),
    ...(u.fbp && { fbp: u.fbp }),
    ...(u.clientIp && { client_ip_address: u.clientIp }),
    ...(u.clientUserAgent && { client_user_agent: u.clientUserAgent }),
  };
}

/**
 * One event, one POST. Returns Meta's response so routes can log it; never
 * throws into a request, because a failed analytics call must not fail a
 * payment or a page.
 */
export async function sendCapiEvent(params: {
  pixelId: string;
  accessToken: string;
  eventName: SendableEvent;
  eventId: string;
  eventSourceUrl: string;
  user: UserSignals;
  /* The working-professional / homemaker split. Typed, not free-form — see the
     Occupation union above. This is the one descriptive value that earns its
     place in custom_data: it is what the audience segmentation is built on,
     and neither of its two possible values names a condition. */
  occupation?: Occupation;
  testEventCode?: string;
}): Promise<{ ok: boolean; status: number; body: unknown }> {
  const body = {
    data: [
      {
        event_name: params.eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: params.eventId,
        event_source_url: originOnly(params.eventSourceUrl),
        action_source: 'website',
        user_data: buildUserData(params.user),
        /* Nothing may be added here without review. See the classification
           note at the top of this file. The funnel is free, so there is no
           value or currency to report; the only key is one of two reviewed
           enum values. */
        ...(params.occupation && {
          custom_data: { occupation: params.occupation },
        }),
      },
    ],
    ...(params.testEventCode && { test_event_code: params.testEventCode }),
  };

  try {
    const res = await fetch(
      `https://graph.facebook.com/v21.0/${params.pixelId}/events?access_token=${params.accessToken}`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      },
    );
    return { ok: res.ok, status: res.status, body: await res.json() };
  } catch (e) {
    return { ok: false, status: 0, body: String(e) };
  }
}
