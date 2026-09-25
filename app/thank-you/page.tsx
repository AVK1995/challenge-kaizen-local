import type { Metadata } from 'next';

import { TIER_BASE } from '../_landing/offer';
import ThankYouScreen from './screen';

/**
 * /thank-you — where a base-tier payment lands.
 *
 * A server component that reads ?p= and hands it down, for the same reason
 * /checkout does: useSearchParams inside the client screen would force a
 * Suspense boundary and the server would send `null`, so a buyer who has just
 * paid would watch a blank page while JS loads. The confirmation is the one
 * screen that must never look like the payment went nowhere.
 *
 * The screen itself is ./screen, shared with /thank-you-vip.
 *
 * noindex: a post-payment URL has nothing to offer a searcher, and it implies
 * a purchase that anyone arriving from Google has not made.
 */
export const metadata: Metadata = {
  title: 'You are in | Kaizen 5-Day (Peri)Menopause Reset',
  robots: { index: false, follow: false },
};

export default function ThankYouPage({
  searchParams,
}: {
  searchParams: { p?: string };
}) {
  return <ThankYouScreen tier={TIER_BASE} paymentId={searchParams.p ?? ''} />;
}
