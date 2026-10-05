'use client';

/**
 * GA4 events, recommended names only.
 *
 * Ankita's version fires `initiate_checkout`, which is Meta's vocabulary sent
 * to Google: GA4 does not recognise it, so its built-in checkout funnel stays
 * empty. These are GA4's recommended names, so the funnel and revenue reports
 * populate with no custom configuration.
 *
 * Money IS sent. Ankita deliberately omits value and currency ("pure event
 * counts"), which keeps GA4 unable to answer what anything cost or earned.
 *
 * All failures are swallowed: analytics must never throw into a click.
 */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export type Ga4Item = {
  item_id: string;
  item_name: string;
  price: number;
  quantity: number;
};

type Money = { value: number; currency?: string; items?: Ga4Item[] };

function send(name: string, params: Record<string, unknown>) {
  if (typeof window === 'undefined') return;
  try {
    if (typeof window.gtag === 'function') {
      window.gtag('event', name, params);
      return;
    }
    /* gtag.js has not finished loading. Queue onto dataLayer exactly as gtag
       itself would, by pushing the `arguments` object, so the tag replays the
       event when it initialises. Dropping it here instead would lose every
       event fired by an effect that beat the afterInteractive script, which is
       a race we would only notice as quietly missing top-of-funnel data. */
    window.dataLayer = window.dataLayer || [];
    function gtagShim() {
      // eslint-disable-next-line prefer-rest-params
      (window.dataLayer as unknown[]).push(arguments);
    }
    (gtagShim as (...args: unknown[]) => void)('event', name, params);
  } catch {
    /* never throw into a click */
  }
}

const money = (m: Money) => ({
  value: m.value,
  currency: m.currency ?? 'AED',
  ...(m.items && { items: m.items }),
});

export const ga4ViewItem = (m: Money) => send('view_item', money(m));
/** CTA clicked, registration modal opened. GA4's twin of Meta's atc_event. */
export const ga4AddToCart = (m: Money) => send('add_to_cart', money(m));
/** Registration submitted. GA4's recommended lead event. */
export const ga4GenerateLead = (m: Money) => send('generate_lead', money(m));

/* Some events should fire once per SESSION rather than on every render. The
   flag is stamped BEFORE the call so a rapid double-fire still dedupes, and it
   is per-session so a returning visitor still feeds the retargeting audience. */
export function once(key: string, fire: () => void) {
  if (typeof window === 'undefined') return;

  /* This gate deliberately does NOT check for window.gtag.
     trackViewItem fires Meta's ViewContent from inside this callback, and while
     the check was here a page with no GA4 tag returned early and killed the
     META event too. Meta must never go dark because GA4 is misconfigured.
     GA4's own send() queues safely on its own. */

  const k = `kz_ga4_${key}`;
  try {
    const store = window.sessionStorage;
    if (store.getItem(k)) return;
    store.setItem(k, '1');
  } catch {
    /* private mode: fire anyway rather than lose the event */
  }
  fire();
}
