import type { Metadata } from 'next';

import { TIER_VIP } from '../_landing/offer';
import ThankYouScreen from '../thank-you/screen';

/**
 * /thank-you-vip — where a VIP payment lands.
 *
 * A separate route rather than /thank-you?tier=vip, so the URL itself records
 * which pass was bought: a buyer can bookmark it, support can re-send it, and
 * a query param that goes missing on a redirect cannot quietly downgrade
 * someone's confirmation page to the base one.
 *
 * The screen is the base page's, rendered with the other tier. Everything is
 * identical except one block in the hero — see ThankYouScreen. Copying the
 * page to change a heading is how two confirmation pages drift until one of
 * them is telling a buyer the wrong policy.
 */
export const metadata: Metadata = {
  title: 'You are in · VIP Access | Kaizen 5-Day (Peri)Menopause Reset',
  robots: { index: false, follow: false },
};

export default function ThankYouVipPage({
  searchParams,
}: {
  searchParams: { p?: string };
}) {
  return <ThankYouScreen tier={TIER_VIP} paymentId={searchParams.p ?? ''} />;
}
