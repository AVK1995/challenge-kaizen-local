import { TIER_BASE, TIER_VIP, type Tier, type TierId } from '../_landing/offer';

/**
 * The line items, per tier, and the one place they are defined.
 *
 * Values are numeric so the summary can sum them and show a real total rather
 * than a hard-coded "worth ₹5,485" string.
 *
 * ⚠️ THESE MUST MIRROR app/oto/copy.ts. The OTO page is where the buyer chose
 * a pass; this is the receipt for that choice, shown while they type their card
 * details. If the two lists disagree, the checkout is promising something the
 * page they just clicked through did not — and it disagrees at the worst
 * possible moment.
 *
 * ⚠️ AND THEY DISAGREE WITH THE LANDING PAGE'S BONUS STACK. The landing page
 * sells seven items for the base price, four of which are VIP-only here:
 * Pranayam for Better Sleep, Nervous System Reset, the Symptom Score and the
 * Movement Readiness Check. That is a real contradiction, flagged rather than
 * silently reconciled — resolving it means either trimming the landing page's
 * stack or moving those four back into the base tier, and that is a pricing
 * decision, not a code one. See the note in app/oto/copy.ts.
 */
export type LineItem = { title: string; value: number };

const BASE_ITEMS: LineItem[] = [
  { title: '5-Day Live (Peri)Menopause Reset Challenge', value: 2500 },
  { title: 'Kaizen Menopause Nutrition Playbook', value: 997 },
  { title: 'Kaizen Morning Mobility Reset', value: 497 },
];

/** What VIP ADDS. The checkout renders base + these for a VIP order. */
const VIP_EXTRA_ITEMS: LineItem[] = [
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
 *  rows beneath it. */
export const valueTotalFor = (tierId: TierId) =>
  ITEMS_BY_TIER[tierId].reduce((n, r) => n + r.value, 0);

export const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`;

/** The tier a checkout is for, resolved from the URL by the page itself. */
export const tierItems = (tier: Tier): LineItem[] => ITEMS_BY_TIER[tier.id];

/* Kept so the two tier objects are reachable from anything that imports this
   module without a second import line. */
export { TIER_BASE, TIER_VIP };
