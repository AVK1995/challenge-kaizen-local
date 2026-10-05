'use client';

import { PRODUCT_NAME } from '@/app/_landing/offer';
import { collectSignals, readCookie } from '@/lib/client-signals';
import {
  ga4AddToCart,
  ga4GenerateLead,
  ga4ViewItem,
  once,
  type Ga4Item,
} from '@/lib/ga4';

/**
 * The one place a page calls to record something.
 *
 *   ViewContent             landing page seen          CAPI only
 *   atc_event               CTA clicked, modal opened  pixel + CAPI, shared id
 *   registration_complete   modal form submitted       pixel + CAPI, shared id
 *
 * ══ Why pixel AND server for the two custom events ═══════════════════════
 * EMQ is scored on the match keys an event carries, and the two sources hold
 * different ones. The browser pixel carries the real `_fbp`/`_fbc` cookies and
 * Meta's own device context; the server carries the hashed email, phone, name,
 * city, country, region, postcode, external_id, IP and user agent. Sending the
 * same event from both with ONE event_id lets Meta deduplicate the pair into a
 * single event that holds the union of both sets — which is the highest EMQ an
 * event can reach.
 *
 * The pixel is also told who the person is via advanced matching (see
 * pixelIdentify), so even its half of the pair carries hashed PII.
 */

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? '';

/* GA4 needs a currency whenever a value is present. The offer is free, so the
   value is 0 and the currency is the audience's own. */
const FREE_ITEM: Ga4Item = {
  item_id: 'kaizen-5day-reset-free',
  item_name: PRODUCT_NAME,
  price: 0,
  quantity: 1,
};
const FREE = { value: 0, currency: 'AED', items: [FREE_ITEM] };

export type Person = {
  email?: string;
  /** E.164 digits, no plus. */
  phone?: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  /** ISO 3166-1 alpha-2, from the form's country picker. */
  country?: string;
  /** `working_professional` | `homemaker`, from the form's select. */
  occupation?: string;
};

/* ══ The returning registrant ═════════════════════════════════════════════
 * Someone who registered once and comes back (a second device session, a
 * retargeting ad) clicks a CTA again. Their first atc_event carried no PII
 * because they had not typed any yet; this one can, because we remember what
 * they gave us. Stored in THEIR browser only, and only after they submitted it
 * to us themselves.
 */
const LEAD_KEY = 'kz_lead';

export function rememberLead(p: Person) {
  try {
    window.localStorage.setItem(LEAD_KEY, JSON.stringify(p));
  } catch {
    /* private mode */
  }
}

function recallLead(): Person {
  try {
    const raw = window.localStorage.getItem(LEAD_KEY);
    return raw ? (JSON.parse(raw) as Person) : {};
  } catch {
    return {};
  }
}

export function newEventId(): string {
  try {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  } catch {
    /* fall through */
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

/* ══ The _fbp race ════════════════════════════════════════════════════════
 * `_fbp` is written by fbevents.js, which loads afterInteractive — i.e. AFTER
 * hydration. ViewContent fires from a mount effect and would read a cookie
 * that does not exist yet, so it waits (bounded, non-blocking) for the pixel
 * to write it. Click and submit events happen long after load and do not need
 * to wait.
 */
const FBP_POLL_MS = 100;
const FBP_TIMEOUT_MS = 2500;
const PIXEL_CONFIGURED = Boolean(PIXEL_ID);

function whenFbpReady(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (!PIXEL_CONFIGURED || readCookie('_fbp')) return Promise.resolve();

  return new Promise((resolve) => {
    let ticksLeft = Math.ceil(FBP_TIMEOUT_MS / FBP_POLL_MS);
    const tick = () => {
      if (readCookie('_fbp') || ticksLeft-- <= 0) {
        resolve();
        return;
      }
      window.setTimeout(tick, FBP_POLL_MS);
    };
    window.setTimeout(tick, FBP_POLL_MS);
  });
}

/** Server copy, fire-and-forget: analytics must never block or fail a click. */
function capi(eventName: string, eventId: string, person: Person = {}) {
  try {
    void fetch('/api/meta/event', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ eventName, eventId, ...collectSignals(), ...person }),
      keepalive: true,
    });
  } catch {
    /* ignore */
  }
}

/**
 * Pixel advanced matching. Re-calling `init` with user data is Meta's
 * documented way to attach it after load; fbevents.js normalises and hashes
 * every value in the browser before anything leaves it.
 */
function pixelIdentify(p: Person) {
  if (!PIXEL_ID || typeof window.fbq !== 'function') return;
  const am: Record<string, string> = {};
  const externalId = collectSignals().externalId;
  if (externalId) am.external_id = externalId;
  if (p.email) am.em = p.email.trim().toLowerCase();
  if (p.phone) am.ph = p.phone.replace(/\D/g, '');
  if (p.firstName) am.fn = p.firstName.trim().toLowerCase();
  if (p.lastName) am.ln = p.lastName.trim().toLowerCase();
  if (p.city) am.ct = p.city.trim().toLowerCase().replace(/[^a-z]/g, '');
  if (p.country) am.country = p.country.trim().toLowerCase();
  try {
    window.fbq('init', PIXEL_ID, am);
  } catch {
    /* ignore */
  }
}

function pixelCustom(eventName: string, eventId: string) {
  if (!PIXEL_ID || typeof window.fbq !== 'function') return;
  try {
    window.fbq('trackCustom', eventName, {}, { eventID: eventId });
  } catch {
    /* ignore */
  }
}

/** Landing page: the offer has been seen. Once per session. */
export function trackViewItem() {
  once('view_item', () => {
    ga4ViewItem(FREE);
    void whenFbpReady().then(() => capi('ViewContent', newEventId(), recallLead()));
  });
}

/**
 * A CTA was clicked and the registration modal opened. Fires on EVERY open,
 * as asked: each click is a fresh expression of intent, and each gets its own
 * event_id so the pixel/server pair dedupes with itself and not with the
 * previous click.
 */
export function trackAtc() {
  const eventId = newEventId();
  const known = recallLead();
  pixelIdentify(known);
  pixelCustom('atc_event', eventId);
  capi('atc_event', eventId, known);
  ga4AddToCart(FREE);
}

/**
 * The form was submitted and /api/register has ALREADY sent the server copy
 * of registration_complete with this eventId. This fires the pixel copy with
 * the same id so Meta collapses the two into one.
 */
export function trackRegistrationComplete(person: Person, eventId: string) {
  rememberLead(person);
  pixelIdentify(person);
  pixelCustom('registration_complete', eventId);
  ga4GenerateLead(FREE);
}
