/**
 * Every date, time, price and destination on the site comes through this file.
 * Nothing below it may ever hard-code one again: when the cohort moves, one
 * edit here moves the announcement bar, the hero, the pills, the schedule
 * heading, the docked bar, the footer, the checkout, the legal pages, the
 * thank-you page and the metadata together.
 *
 * ══ EVERY VALUE HERE IS SETTABLE FROM THE ENVIRONMENT ══════════════════════
 *
 * Each one reads a NEXT_PUBLIC_* variable and falls back to the literal below
 * it. That means the date, the times, the price, the anchor and the seat count
 * can all be changed in the Vercel dashboard and redeployed, with no code
 * change and no risk of one screen being updated and another missed.
 *
 * Two rules that keep that from becoming a foot-gun:
 *
 *  1. Read with the helpers below, never with `??`. `??` does NOT catch an
 *     empty string, and .env.example ships every key blank — so a copied but
 *     unfilled .env.local would give Number('') === 0 and a page advertising ₹0
 *     against a Razorpay order for zero paise, with nothing throwing.
 *  2. process.env.NEXT_PUBLIC_X must be written out LITERALLY at each site.
 *     Next inlines these at build time by static text substitution; a computed
 *     lookup like process.env[key] is not replaced and arrives as undefined in
 *     the browser.
 */

/** A string from the environment, falling back on blank or whitespace-only. */
const str = (raw: string | undefined, fallback: string): string => {
  const v = (raw ?? '').trim();
  return v || fallback;
};

/** A POSITIVE integer from the environment. Zero, negative, blank and NaN all
 *  fall back, because every number in this file is a count or an amount and
 *  none of them is meaningfully zero. */
const num = (raw: string | undefined, fallback: number): number => {
  const v = Number(raw);
  return Number.isFinite(v) && v > 0 ? Math.floor(v) : fallback;
};

const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`;

/**
 * THE price. One number, used by the copy, the GA4 event values and the amount
 * Razorpay actually charges. Nothing anywhere else may declare a price: two
 * sources drift, and the drift is invisible until the charge and the label
 * disagree on a live page.
 */
export const PRICE_RUPEES = num(process.env.NEXT_PUBLIC_PRICE_RUPEES, 497);
export const PRICE_PAISE = PRICE_RUPEES * 100;
export const PRICE = inr(PRICE_RUPEES);

/**
 * THE anchor — the "was" price every CTA is measured against.
 *
 * The saving and the percentage are DERIVED, never typed. A hard-coded "You
 * save ₹1,102" is wrong the first time either number moves, and it is wrong in
 * the one place on the page a reader is actively doing the arithmetic.
 *
 * HAS_ANCHOR is the guard that makes this safe to hand to a dashboard. If
 * someone sets the anchor at or below the price — by raising the price without
 * touching the anchor, or by typing 499 for 1499 — there is no discount to
 * claim, and the page must not render "You save ₹-2 (-0% off)" next to a
 * struck-through number that is lower than the one being charged. In that case
 * the anchor simply does not appear and the price stands on its own.
 */
export const PRICE_ANCHOR_RUPEES = num(process.env.NEXT_PUBLIC_PRICE_ANCHOR_RUPEES, 1599);
export const HAS_ANCHOR = PRICE_ANCHOR_RUPEES > PRICE_RUPEES;
export const PRICE_ANCHOR = inr(PRICE_ANCHOR_RUPEES);
export const SAVING_RUPEES = Math.max(0, PRICE_ANCHOR_RUPEES - PRICE_RUPEES);
export const SAVING = inr(SAVING_RUPEES);
export const DISCOUNT_PCT = HAS_ANCHOR
  ? Math.round((SAVING_RUPEES / PRICE_ANCHOR_RUPEES) * 100)
  : 0;
/** "You save ₹1,102 (69% off)" — the line that sits under every price. */
export const SAVING_LINE = `You save ${SAVING} (${DISCOUNT_PCT}% off)`;
/** The same line as the offer card and the recap set it: dot-separated rather
 *  than parenthesised, because those two are the page's typographic peaks and a
 *  bracket there reads as an aside. Same words, same figures. */
export const SAVING_LINE_DOT = `You save ${SAVING} · ${DISCOUNT_PCT}% off`;
/** Just the percentage, for the docked bar's badge. "69% OFF". */
export const DISCOUNT_SHORT = `${DISCOUNT_PCT}% OFF`;
/** The hero badge. "69% OFF TODAY". */
export const DISCOUNT_BADGE = `${DISCOUNT_PCT}% OFF TODAY`;

/** When the cohort starts. Written as it is read aloud, not as a date object:
 *  it appears mid-sentence in six places and "2026-09-25" reads as a database
 *  row in every one of them. */
export const START_DATE = str(process.env.NEXT_PUBLIC_START_DATE, '25th September');

/**
 * The daily timings, in the three forms the site needs.
 *
 * Only SESSION_TIMES normally needs setting — the other two are derived from it
 * so a single env change moves all three and they cannot fall out of step. The
 * overrides exist for the case the derivation cannot cover, such as adding a
 * third afternoon slot with its own punctuation.
 *
 *   SESSION_TIMES        "6:30 AM & 7 PM"        pills, bands, footer
 *   SESSION_TIMES_PROSE  "6:30 AM and 7 PM"      prose and <meta description>,
 *                                                where "&" reads as markup
 *   SESSION_TIMES_TZ     "6:30 AM or 7 PM IST"   the checkout and legal pages,
 *                                                where the buyer picks ONE
 */
export const SESSION_TIMES = str(process.env.NEXT_PUBLIC_SESSION_TIMES, '6:30 AM & 7 PM');
export const SESSION_TIMES_PROSE = str(
  process.env.NEXT_PUBLIC_SESSION_TIMES_PROSE,
  SESSION_TIMES.replace(/\s*&\s*/g, ' and '),
);
export const SESSION_TIMES_TZ = str(
  process.env.NEXT_PUBLIC_SESSION_TIMES_TZ,
  `${SESSION_TIMES.replace(/\s*&\s*/g, ' or ')} IST`,
);

/**
 * The announcement bar's scarcity line.
 *
 * ⚠️ SEATS_LEFT IS A NUMBER SOMEONE HAS TO UPDATE. It replaces "Price Increases
 * To ₹1599 Tomorrow", which had run unchanged for several weeks without the
 * price ever changing — a deadline that never arrives teaches the reader to
 * ignore every other claim on the page. (Spec BLOCKER 2, option B: no dated
 * instruction arrived by Sunday 21 Sept.)
 *
 * Both are env-readable so they can be changed in the Vercel dashboard without
 * a code deploy. If the count ever goes stale it is the same broken promise as
 * the old banner, so either keep it current or take the bar down.
 */
export const SEATS_CAP = num(process.env.NEXT_PUBLIC_SEATS_CAP, 60);
export const SEATS_LEFT = num(process.env.NEXT_PUBLIC_SEATS_LEFT, 23);

/**
 * Women supported. The source copy shipped "#,###+" as a placeholder; Atul
 * confirmed the real figure as 540+. A string, not a number, because the "+"
 * is part of the claim.
 */
export const WOMEN_SUPPORTED = str(process.env.NEXT_PUBLIC_WOMEN_SUPPORTED, '540+');

/**
 * The WhatsApp community invite. The thank-you page is built around joining it
 * as the single next step, so an empty value there shows the buyer a dead
 * button at the exact moment they have just paid.
 *
 * ⚠️ REQUIRED BEFORE LAUNCH. Create the group, take the invite link.
 */
export const WHATSAPP_INVITE = process.env.NEXT_PUBLIC_WHATSAPP_INVITE ?? '';

/* ══ THE TWO TIERS ════════════════════════════════════════════════════════
 *
 * The funnel is Ads → Landing → OTO → Checkout → Thank you. The landing page
 * sells one price; the OTO page is where the buyer chooses between two, and
 * every screen after it has to agree about which one they picked.
 *
 * That agreement is what this block exists for. The tier is carried as an ID
 * in the URL (?tier=vip), never as an amount: a price in a query string is a
 * price the buyer can edit. create-order looks the ID up here, server side, and
 * charges what IT finds — so the worst a tampered URL can do is select the
 * other real tier, not invent a third.
 *
 * BASE keeps the existing PRICE_* exports untouched, because the whole landing
 * page is built on them and the landing page still sells the base tier.
 */
export type TierId = 'standard' | 'vip';

export const VIP_PRICE_RUPEES = num(process.env.NEXT_PUBLIC_VIP_PRICE_RUPEES, 997);
export const VIP_ANCHOR_RUPEES = num(process.env.NEXT_PUBLIC_VIP_ANCHOR_RUPEES, 2999);

export type Tier = {
  id: TierId;
  /** The card heading on the OTO page. */
  name: string;
  /** For order summaries, the Razorpay sheet and the fulfilment record, where
   *  the full name is too long to read. */
  shortName: string;
  rupees: number;
  paise: number;
  price: string;
  anchorRupees: number;
  anchor: string;
  /** False when the anchor is at or below the price — see HAS_ANCHOR. */
  hasAnchor: boolean;
  savingRupees: number;
  saving: string;
  discountPct: number;
};

function makeTier(
  id: TierId,
  name: string,
  shortName: string,
  rupees: number,
  anchorRupees: number,
): Tier {
  const hasAnchor = anchorRupees > rupees;
  const savingRupees = Math.max(0, anchorRupees - rupees);
  return {
    id,
    name,
    shortName,
    rupees,
    paise: rupees * 100,
    price: inr(rupees),
    anchorRupees,
    anchor: inr(anchorRupees),
    hasAnchor,
    savingRupees,
    saving: inr(savingRupees),
    discountPct: hasAnchor ? Math.round((savingRupees / anchorRupees) * 100) : 0,
  };
}

export const TIER_BASE = makeTier(
  'standard',
  'Kaizen 5-Day (Peri)menopause Reset',
  '5-Day Reset',
  PRICE_RUPEES,
  PRICE_ANCHOR_RUPEES,
);

export const TIER_VIP = makeTier(
  'vip',
  'Kaizen 5-Day (Peri)menopause Reset + VIP Access',
  '5-Day Reset + VIP',
  VIP_PRICE_RUPEES,
  VIP_ANCHOR_RUPEES,
);

/** Cheapest first — the OTO renders them in this order and the base tier is
 *  the one selected on arrival. */
export const TIERS: Tier[] = [TIER_BASE, TIER_VIP];

export const DEFAULT_TIER_ID: TierId = 'standard';

/**
 * Resolve an untrusted string to a real tier.
 *
 * Anything unrecognised — absent, misspelt, injected — falls back to base
 * rather than throwing or charging nothing. Used by the checkout to read the
 * query string and by create-order to decide the amount, so the two can never
 * disagree about what a given URL means.
 */
export function resolveTier(raw: string | null | undefined): Tier {
  return TIERS.find((t) => t.id === raw) ?? TIER_BASE;
}

/**
 * The OTO's price-rise notice, e.g. "₹497 until Friday 3rd October".
 *
 * ⚠️ OPTIONAL, AND OFF BY DEFAULT. The source copy carries "₹497 until
 * [deadline day and date] · then ₹997" with the bracket left unfilled. Two
 * reasons it does not ship as written:
 *
 *   1. A placeholder in square brackets on a live sales page is worse than no
 *      line at all.
 *   2. This page has been here before. The announcement bar ran "Price
 *      Increases To ₹1599 Tomorrow" unchanged for weeks while the price never
 *      moved, which is what spec BLOCKER 2 was written to stop. An undated
 *      deadline teaches the reader to discount every other claim on the page.
 *
 * Set NEXT_PUBLIC_OTO_DEADLINE to a real date ("Friday 3rd October") and the
 * line appears. Leave it blank and the OTO simply does not make the claim.
 * If it is set, the price must actually rise on that date.
 */
export const OTO_DEADLINE = (process.env.NEXT_PUBLIC_OTO_DEADLINE ?? '').trim();

/** The next click after the landing page: choose a pass. Nothing is charged
 *  there — the OTO's own CTA is what reaches the checkout. */
export const OTO_HREF = '/oto';

/** The payment page. Takes ?tier= so it knows which pass to charge for. */
export const CHECKOUT_HREF = '/checkout';

/** Where a completed payment lands, per tier. */
export const THANK_YOU_HREF: Record<TierId, string> = {
  standard: '/thank-you',
  vip: '/thank-you-vip',
};

/* ══ CTA labels. THREE, and only three. ═══════════════════════════════════
 *
 * Every button on the landing page uses one of these, so a price change moves
 * all of them and no screen can invent its own wording. They were drifting —
 * the decision card said "Take Action · ₹497" and the docked bar repeated the
 * hero's label, which made the page look like it was selling three things.
 *
 *   CTA_LABEL         the default. Hero, session band, inline CTA, recap.
 *   CTA_LABEL_CARD    the offer card under the system image. No price: the
 *                     card states it in full two lines above the button, and
 *                     repeating it there reads as two prices.
 *   CTA_LABEL_STICKY  the docked bar.
 *
 * The separator is "·" (U+00B7), which is what every other dot on this site
 * uses — the facts row, the footer, the order summary, the announcement bar.
 * Say the word if you want the heavier "•" (U+2022) and it changes here once.
 */
export const CTA_LABEL = `Start Your 5-Day Reset · ${PRICE}`;
export const CTA_LABEL_CARD = 'Reserve My Spot';
export const CTA_LABEL_STICKY = `Get Instant Access · ${PRICE}`;

/**
 * The docked bar's reassurance line.
 *
 * ⚠️ This is NOT the refund line. It is the "100% Money-Back Guarantee"
 * wording, restored in the docked bar only, at Atul's request. Spec BLOCKER 4
 * had collapsed three competing phrasings — this one, "Full Refund If You
 * Don't Love Day One" and "Refundable If You Don't Love Day One" — into the
 * single REFUND_LINE below, so the page made one promise rather than three.
 *
 * The page body still uses REFUND_LINE at all seven CTAs; only the docked bar
 * carries this. That is a deliberate exception, not drift, but it does mean a
 * reader who scrolls sees two wordings of the same promise. Flagged rather
 * than silently reconciled.
 */
export const GUARANTEE_LINE = '100% Money-Back Guarantee';

/**
 * THE refund line. One string, one casing, everywhere it appears.
 *
 * It previously ran in three wordings on one page — "Full Refund If You Don't
 * Love Day One", "Refundable If You Don't Love Day One" and "100% Money-Back
 * Guarantee" — which reads as three different promises rather than one, and
 * invites the reader to work out which of them is the real policy. (Spec
 * BLOCKER 4.)
 *
 * CTA_NOTE and CTA_NOTE_HERO are kept as aliases so every existing import site
 * keeps working; they are the same string and must stay that way.
 */
export const REFUND_LINE = "Full refund if you don't love Day One.";
export const CTA_NOTE_HERO = REFUND_LINE;
export const CTA_NOTE = REFUND_LINE;
