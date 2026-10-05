import { TIER_BASE, TIER_VIP, type Tier, type TierId } from '../_landing/offer';

/**
 * The line items and the VIP addon copy, in one place.
 *
 * This used to mirror app/oto/copy.ts. That page is gone — VIP is now an addon
 * on the checkout itself — so this file is the single definition of what each
 * pass contains, and the addon card reads from it.
 *
 * ⚠️ THE LANDING PAGE STILL DISAGREES WITH THIS. It sells seven items for the
 * standard price, four of which are VIP-only here: Pranayam for Better Sleep,
 * Nervous System Reset, the Symptom Score and the Movement Readiness Check. A
 * reader who studies the landing page and then reaches the checkout watches
 * four things move behind an upgrade, and the landing page's "Total value
 * ₹6,788" no longer describes what the standard price buys. Flagged rather
 * than silently reconciled: fixing it means either trimming the landing stack
 * or moving those four into standard, and that is a pricing decision.
 */

/**
 * `value` is OPTIONAL on purpose.
 *
 * An item without one still appears in the summary but contributes nothing to
 * the struck "total value". That is how the session recordings are carried:
 * they are a real part of the VIP pass, but nobody has priced them, and
 * inventing a figure to make a bigger struck-through number is the one thing
 * this ledger exists to prevent. Give it a value the day there is a real one.
 */
export type LineItem = { title: string; value?: number };

const BASE_ITEMS: LineItem[] = [
  { title: '5-Day Live (Peri)Menopause Reset Challenge', value: 2500 },
  { title: 'Kaizen Menopause Nutrition Playbook', value: 997 },
  { title: 'Kaizen Morning Mobility Reset', value: 497 },
];

/** What VIP ADDS. The checkout renders base + these for a VIP order. */
const VIP_EXTRA_ITEMS: LineItem[] = [
  { title: 'Recordings of all 5 days' },
  { title: 'Your (Peri)Menopause Symptom Score', value: 900 },
  { title: 'Your Movement Readiness Check', value: 900 },
  { title: 'Nervous System Reset with Prerna', value: 497 },
  { title: 'Pranayam for Better Sleep', value: 497 },
];

export const ITEMS_BY_TIER: Record<TierId, LineItem[]> = {
  standard: BASE_ITEMS,
  vip: [...BASE_ITEMS, ...VIP_EXTRA_ITEMS],
};

/** The struck "total value" for a tier, summed from its rows. Never typed:
 *  this page has already shipped a hard-coded total that disagreed with the
 *  rows beneath it. Unpriced rows are skipped rather than counted as zero. */
export const valueTotalFor = (tierId: TierId) =>
  ITEMS_BY_TIER[tierId].reduce((n, r) => n + (r.value ?? 0), 0);

export const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`;

/** The tier a checkout is for. */
export const tierItems = (tier: Tier): LineItem[] => ITEMS_BY_TIER[tier.id];

/**
 * What the addon card lists, in the order it lists them.
 *
 * The recordings lead, deliberately. Of the five, it is the one that answers
 * the objection a live-only challenge actually creates — "what if I miss a
 * day" — and it is the reason most people take an upgrade like this. The
 * assessments below it are the differentiator; the two guides are the
 * make-weight.
 *
 * Mirrors VIP_EXTRA_ITEMS above. Same five things, worded for someone deciding
 * rather than for a receipt.
 */
export const VIP_ADDON_BULLETS: string[] = [
  'Recordings of all 5 days, so a missed session is not a missed day',
  'Your (Peri)Menopause Symptom Score: score yourself on Day 1 and again on Day 5',
  'Your Movement Readiness Check: know what is safe for your joints right now',
  'Nervous System Reset with Prerna: 10-minute guided breathwork',
  "Pranayam for Better Sleep: for the nights your mind will not settle",
];

/* Kept so the two tier objects are reachable from anything that imports this
   module without a second import line. */
export { TIER_BASE, TIER_VIP };
