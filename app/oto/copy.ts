import type { TierId } from '../_landing/offer';

/**
 * The OTO page's copy, kept out of the component for the same reason
 * app/checkout/included.ts is: it is the client's words, it changes on its own
 * schedule, and it should be editable without reading JSX.
 *
 * VERBATIM from Kaizen OTO COPY.md, with three deliberate departures, each
 * flagged at the value below it:
 *
 *   1. The start date comes from START_DATE (env-driven), not the copy's
 *      hard-coded "9th oct".
 *   2. The price-rise line is off unless NEXT_PUBLIC_OTO_DEADLINE is set —
 *      the copy shipped it with "[deadline day and date]" unfilled.
 *   3. Prices are never typed here. They come from the tier model, so the
 *      cards, the total and the CTA cannot disagree with what Razorpay
 *      charges.
 */

export const OTO_HEADING = 'Choose your pass';

export const OTO_DECK =
  'Both include all five live sessions with Prerna and the Kaizen coaches. Nothing is charged until the next page.';

/** What each tier gives. The VIP list is what it ADDS to the base list, which
 *  is why its card says "Everything above, plus:" rather than repeating it. */
export const TIER_BULLETS: Record<TierId, string[]> = {
  standard: [
    '5 days of live, expert-led sessions with Prerna and certified Kaizen coaches',
    'Both daily slots: 6:30 AM or 7 PM IST, attend either',
    'Kaizen Menopause Nutrition Playbook, with instant access',
    'Kaizen Morning Mobility Reset for stiff joints and shoulders',
    'A community of women going through the same changes',
  ],
  vip: [
    'Your (Peri)Menopause Symptom Score: score yourself on Day 1 and Day 5',
    'Your Movement Readiness Check: know what is safe for your joints',
    'Nervous System Reset with Prerna: 10-minute guided breathwork',
    "Pranayam for Better Sleep: for nights your mind won't settle",
  ],
};

/** The small print under each card's list. */
export const TIER_FOOTNOTE: Record<TierId, string> = {
  standard: 'Live sessions and core guides only.',
  vip: 'total, not on top. Everything above, plus:',
};

/** The eyebrow on each card. The base tier's says what it is; the VIP tier's
 *  is the recommendation, which is why only one of them is coloured. */
export const TIER_EYEBROW: Record<TierId, string> = {
  standard: 'Included',
  vip: 'Progress tracking included',
};

export const RECOMMENDED_TIER: TierId = 'vip';

export const NEXT_STEPS = [
  'Pay on the secure checkout page.',
  'Access your guides from your confirmation page.',
  'Your Zoom link arrives before the first session.',
];

export const PAYMENT_NOTE =
  'Payments are collected by Kaizen Wellness. That name appears on the payment page and on your statement.';

export const SECURE_LINE = '100% Secure · UPI · Cards · NetBanking';

export const PROMISE_HEADING = 'Our promise to you';
export const PROMISE_BODY =
  'Come to Day One. If it is not for you, tell us that night and we refund you in full. You keep the guides either way.';
