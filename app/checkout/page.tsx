import type { Metadata } from 'next';

import { resolveTier } from '../_landing/offer';
import CheckoutForm from './checkout-form';

/**
 * /checkout — the payment page, and now the only step after the landing page.
 *
 * A SERVER component, whose only job is to read ?tier= and hand the resolved
 * pass to the form as its STARTING position. That split is load-bearing:
 * reading the query string with useSearchParams inside the client form would
 * force a Suspense boundary, and the server would then send `null` for the
 * whole page — a blank screen until JS runs, on the one page where money
 * changes hands.
 *
 * ?tier=vip pre-selects the VIP addon. Nothing links to it today — the /oto
 * page that used to is gone — but it lets an ad or an email point straight at
 * a VIP-selected checkout. Anything unrecognised falls back to standard, so a
 * missing or hand-edited value still renders a real pass.
 *
 * It does NOT decide the amount: /api/razorpay/create-order resolves the tier
 * again from its own table and charges from that, which is why no price is
 * ever sent up from the browser. See the note there.
 *
 * noindex: a checkout has nothing to offer a searcher, and indexing it sends
 * traffic to a payment form with none of the argument in front of it.
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
  return <CheckoutForm initialTier={resolveTier(searchParams.tier)} />;
}
