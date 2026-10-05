import type { Metadata } from 'next';

import ThankYouScreen from './screen';

/**
 * /thank-you — where a completed free registration lands.
 *
 * noindex: a post-registration URL has nothing to offer a searcher, and it
 * implies a sign-up that anyone arriving from Google has not made.
 */
export const metadata: Metadata = {
  title: 'You are in | Kaizen 5-Day (Peri)Menopause Reset',
  robots: { index: false, follow: false },
};

export default function ThankYouPage() {
  return <ThankYouScreen />;
}
