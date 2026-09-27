import type { Metadata } from 'next';

import { PRICE, SESSION_TIMES_PROSE, START_DATE } from '../_landing/offer';

/**
 * The OTO is a client component (it holds the tier selection in state), and a
 * client component cannot export `metadata`. This layout exists only to carry
 * it.
 *
 * `noindex` is the point of the robots block, not an oversight. This page sits
 * mid-funnel: it is reached from the landing page, it makes an offer that only
 * makes sense to someone who has just read that page, and it carries a price
 * that is not the headline price. Letting it into a search index means paid
 * traffic can land on the upsell without the argument in front of it, and it
 * splits the funnel's own ranking between two pages selling the same thing.
 */
export const metadata: Metadata = {
  title: 'Choose your pass | Kaizen 5-Day (Peri)Menopause Reset',
  description: `Choose your pass for the Kaizen 5-Day (Peri)Menopause Reset. Live on Zoom from ${START_DATE}, ${SESSION_TIMES_PROSE}, from ${PRICE}. Nothing is charged until the next page.`,
  robots: { index: false, follow: false },
};

export default function OtoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
