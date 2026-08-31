'use client';

import { PRICE_RUPEES } from '@/app/_landing/offer';
import { collectSignals } from '@/lib/client-signals';
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

/** Landing page: the offer has been seen. Once per browser. */
export function trackViewItem() {
  once('view_item', () => {
    capi('ViewContent');
    ga4ViewItem(money);
  });
}

/** Any CTA click on the landing page. */
export function trackAddToCart() {
  capi('AddToCart');
  ga4AddToCart(money);
}

/** The checkout page has loaded. */
export function trackBeginCheckout() {
  ga4BeginCheckout(money);
}

/** Details valid and the payment sheet is opening. This is the real intent. */
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
