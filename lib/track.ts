'use client';

import { PRICE_RUPEES } from '@/app/_landing/offer';
import { collectSignals, readCookie } from '@/lib/client-signals';
import {
  ga4AddPaymentInfo,
  ga4AddToCart,
  ga4BeginCheckout,
  ga4Purchase,
  ga4ViewItem,
  once,
  type Ga4Item,
} from '@/lib/ga4';

/**
 * The one place a page calls to record something. Each function fires the
 * matching STANDARD event on both platforms: Meta by name via the CAPI route,
 * GA4 by its own recommended name.
 *
 * The two vocabularies differ and that is expected — Meta's InitiateCheckout
 * is GA4's begin_checkout. Mapping them here keeps that translation in one
 * file instead of every call site.
 */

const VALUE = PRICE_RUPEES;
const ITEM: Ga4Item = {
  item_id: 'kaizen-5day-reset',
  item_name: '5-Day (Peri)Menopause Reset Challenge',
  price: VALUE,
  quantity: 1,
};
const money = { value: VALUE, currency: 'INR', items: [ITEM] };

type Person = {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  /** ISO 3166-1 alpha-2, from the checkout's country picker. */
  country?: string;
  /** `working_professional` | `homemaker`, from the checkout's select. */
  occupation?: string;
};

/* ══ The _fbp race ════════════════════════════════════════════════════════
 *
 * `_fbp` is written by Meta's own fbevents.js, which loads through next/script
 * with strategy="afterInteractive" — i.e. AFTER hydration. Both of the events
 * below fire from a useEffect on mount, which runs during the hydration commit,
 * so they were reading `_fbp` from a cookie that did not exist yet.
 *
 * The visible symptom was ViewContent at 14.3% fbp coverage. That figure is not
 * random: it is roughly the share of RETURNING visitors, who already carry a
 * _fbp from a previous session because the cookie lasts 90 days. Every genuinely
 * new visitor — the ones the ads are actually buying — was sent with no fbp at
 * all, which is the single strongest browser-side matching signal Meta has short
 * of an email address.
 *
 * The fix is to correct the ORDER rather than to invent a value. We wait for the
 * pixel to write its own cookie, then send. Synthesising an fbp ourselves (the
 * way captureFbclid legitimately synthesises _fbc from a URL parameter) was
 * considered and rejected: _fbc is derived from an fbclid Meta gave us, so it is
 * reconstruction, whereas a hand-rolled _fbp is a made-up identifier that can
 * collide with the one fbevents.js writes moments later and leave the browser
 * pixel and the server API disagreeing about who this person is.
 *
 * Bounded and non-blocking. If the pixel is blocked, unconfigured, or simply
 * slow, the event still goes after the timeout with whatever we have — exactly
 * the old behaviour, which means this can only add coverage, never lose an
 * event. Nothing on the page waits on this; it is fire-and-forget throughout.
 */
const FBP_POLL_MS = 100;
const FBP_TIMEOUT_MS = 2500;
/* Inlined at build time. With no pixel configured fbevents.js never loads and
   _fbp never appears, so there is nothing to wait FOR — skip straight through
   rather than sitting out the full timeout on every page view. */
const PIXEL_CONFIGURED = Boolean(process.env.NEXT_PUBLIC_META_PIXEL_ID);

function whenFbpReady(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (!PIXEL_CONFIGURED || readCookie('_fbp')) return Promise.resolve();

  return new Promise((resolve) => {
    /* A fixed tick budget rather than a wall-clock check: a backgrounded tab
       throttles timers, and we would rather the event wait for the tab to come
       back and send WITH an fbp than have the deadline expire unseen while
       nothing was running. */
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

/** Fire-and-forget: analytics must never block or fail a click. */
function capi(eventName: string, person: Person = {}) {
  const s = collectSignals();
  try {
    void fetch('/api/meta/event', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ eventName, ...s, ...person }),
      keepalive: true, // survives the navigation a CTA click causes
    });
  } catch {
    /* ignore */
  }
}

/**
 * Landing page: the offer has been seen. Once per browser.
 *
 * GA4 goes immediately — it has its own dataLayer queue for the same race and
 * does not need this one. Meta waits for _fbp; see the note above whenFbpReady.
 */
export function trackViewItem() {
  once('view_item', () => {
    ga4ViewItem(money);
    void whenFbpReady().then(() => capi('ViewContent'));
  });
}

/**
 * Checkout ARRIVAL. Named for the Meta event it sends, not for where it once
 * fired: this used to run off a delegated [data-cta] click listener on the
 * landing page and was moved to the checkout's mount. Do not move it back. A
 * page with five to seven CTAs double-counts anyone who taps two of them, and a
 * click is not an arrival. See FunnelTracker for the full note.
 */
export function trackAddToCart() {
  ga4AddToCart(money);
  /* Same mount-timing race as ViewContent, and it bites hardest on exactly the
     visitor this event exists for: someone who opens /checkout straight from an
     email or a retargeting ad has never loaded the landing page, so there is no
     _fbp from a previous pageview to fall back on. A buyer who came via the
     landing page already has one and resolves on the first check. */
  void whenFbpReady().then(() => capi('AddToCart'));
}

/** The checkout page has loaded. */
export function trackBeginCheckout() {
  ga4BeginCheckout(money);
}

/**
 * Details valid and the payment sheet is opening. This is the real intent.
 *
 * DELIBERATELY NOT deferred behind whenFbpReady. This one fires microseconds
 * before the Razorpay sheet takes over the screen, so holding it back to wait
 * for a cookie risks losing the event outright for the sake of a signal it does
 * not need: the buyer has just spent a minute filling in seven fields, so _fbp
 * has been on the browser the whole time, and this payload already carries the
 * email, phone, name and city that match far more strongly than a cookie id.
 */
export function trackInitiateCheckout(person: Person) {
  capi('InitiateCheckout', person);

  /* QualifiedLead, for working professionals only, at the same instant.
     Not a new funnel stage — InitiateCheckout already marks this moment — but
     a separate event so the segment the client actually sells to can be
     optimised toward and seeded into a lookalike. Homemakers deliberately get
     no second event: a QualifiedLead audience that contains both answers
     cannot be targeted as one.

     Fired as its own call rather than folded into the one above because Meta
     dedupes on event_name + event_id, and the route derives a different id per
     name. Two calls, two events, no collision. */
  if (person.occupation === 'working_professional') {
    capi('QualifiedLead', person);
  }

  ga4AddPaymentInfo({ value: VALUE, currency: 'INR' });
}

/**
 * GA4 only. Meta's Purchase comes from the Razorpay webhook, where the payment
 * is proven — firing it here as well would double-count every sale.
 */
export function trackPurchase(transactionId: string) {
  /* Keyed on the payment id, not a fixed string: a refresh, a back-forward, or
     the buyer reopening the confirmation link must not count the sale twice,
     but a genuine second purchase later must still count. Without this GA4
     revenue inflates every time someone reloads the page. */
  once(`purchase_${transactionId}`, () => {
    ga4Purchase({ transactionId, ...money });
  });
}
