import type { Metadata } from 'next';

import { resolveTier } from '../_landing/offer';
import CheckoutForm from './checkout-form';

/**
 * /checkout — the payment page.
 *
 * A SERVER component, whose only job is to read ?tier= and hand the resolved
 * pass to the form. That split is load-bearing: reading the query string with
 * useSearchParams inside the client form would force a Suspense boundary, and
 * the server would then send `null` for the whole page — a blank screen until
 * JS runs, on the one page where money changes hands.
 *
 * resolveTier accepts anything and falls back to base, so a missing, misspelt
 * or hand-edited value still renders a real pass. It does NOT decide the
 * amount: /api/razorpay/create-order resolves the tier again from its own
 * table and charges from that, which is why no price is ever sent up from the
 * browser. See the note there.
 *
 * noindex: this page is mid-funnel and prices a pass that only makes sense
 * after the OTO. Letting it into an index sends paid traffic to a form with
 * none of the argument in front of it.
 */
export const metadata: Metadata = {
  title: 'Checkout | Kaizen 5-Day (Peri)Menopause Reset',
  robots: { index: false, follow: false },
};

export default function CheckoutPage({
  searchParams,
}: {
  searchParams: { tier?: string };
}) {
  return <CheckoutForm tier={resolveTier(searchParams.tier)} />;
}
