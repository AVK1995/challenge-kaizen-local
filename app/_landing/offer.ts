/**
 * Every date, time, price and destination on the site comes through this file.
 * Nothing below it may ever hard-code one again: when the cohort moves, one
 * edit here moves the announcement bar, the hero, the pills, the schedule
 * heading, the docked bar, the footer, the registration modal, the legal pages,
 * the thank-you page and the metadata together.
 *
 * ══ EVERY VALUE HERE IS SETTABLE FROM THE ENVIRONMENT ══════════════════════
 *
 * Each one reads a NEXT_PUBLIC_* variable and falls back to the literal below
 * it. That means the date, the times and the seat count can all be changed in
 * the Vercel dashboard and redeployed, with no code change and no risk of one
 * screen being updated and another missed.
 *
 * Two rules that keep that from becoming a foot-gun:
 *
 *  1. Read with the helpers below, never with `??`. `??` does NOT catch an
 *     empty string, and .env.example ships every key blank.
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
 *  fall back, because every number in this file is a count and none of them is
 *  meaningfully zero. */
const num = (raw: string | undefined, fallback: number): number => {
  const v = Number(raw);
  return Number.isFinite(v) && v > 0 ? Math.floor(v) : fallback;
};

/**
 * THE price. This funnel is FREE: there is no charge, no anchor, no saving and
 * no discount. One string, so every price point on the page (hero, offer card,
 * schedule band, recap, meta description) says the same thing.
 */
export const PRICE = 'FREE';

/** The product, as named on the thank-you page and in the Pabbly record. */
export const PRODUCT_NAME = 'Kaizen 5-Day (Peri)menopause Reset';

/** When the cohort starts. Written as it is read aloud, not as a date object:
 *  it appears mid-sentence in six places and "2026-09-25" reads as a database
 *  row in every one of them. */
export const START_DATE = str(process.env.NEXT_PUBLIC_START_DATE, '9th October');

/**
 * The daily timings, in the three forms the site needs.
 *
 * Only SESSION_TIMES normally needs setting — the other two are derived from it
 * so a single env change moves all three and they cannot fall out of step.
 *
 *   SESSION_TIMES        "6:30 AM & 7 PM"        pills, bands, footer
 *   SESSION_TIMES_PROSE  "6:30 AM and 7 PM"      prose and <meta description>
 *   SESSION_TIMES_TZ     "6:30 AM or 7 PM IST"   the registration modal, legal
 *                                                pages and thank-you page
 *
 * ⚠️ DUBAI AUDIENCE: the derived _TZ form says IST. If the sessions are being
 * advertised in Gulf time, set NEXT_PUBLIC_SESSION_TIMES_TZ explicitly
 * (e.g. "5 AM or 5:30 PM GST").
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
 * ⚠️ SEATS_LEFT IS A NUMBER SOMEONE HAS TO UPDATE. If the count ever goes stale
 * it is a broken promise, so either keep it current or take the bar down.
 */
export const SEATS_CAP = num(process.env.NEXT_PUBLIC_SEATS_CAP, 60);
export const SEATS_LEFT = num(process.env.NEXT_PUBLIC_SEATS_LEFT, 23);

/** Women supported. A string, not a number, because the "+" is part of the claim. */
export const WOMEN_SUPPORTED = str(process.env.NEXT_PUBLIC_WOMEN_SUPPORTED, '540+');

/**
 * The WhatsApp community invite. The thank-you page is built around joining it
 * as the single next step, so an empty value there shows the registrant a dead
 * button at the exact moment they have just signed up.
 *
 * ⚠️ REQUIRED BEFORE LAUNCH. Create the group, take the invite link.
 */
export const WHATSAPP_INVITE = process.env.NEXT_PUBLIC_WHATSAPP_INVITE ?? '';

/**
 * Every CTA on the landing page is an anchor to this hash. A delegated click
 * listener in ./register-modal intercepts it and opens the free-registration
 * modal instead of navigating, so the CTAs stay plain links and every one of
 * them opens the same form.
 */
export const REGISTER_HREF = '#register';

/** Where a completed registration lands. */
export const THANK_YOU_HREF = '/thank-you';

/* ══ CTA labels. THREE, and only three. ═══════════════════════════════════
 *
 * Every button on the landing page uses one of these, so no screen can invent
 * its own wording.
 *
 *   CTA_LABEL         the default. Hero, session band, inline CTA, recap.
 *   CTA_LABEL_CARD    the offer card under the system image.
 *   CTA_LABEL_STICKY  the docked bar.
 */
export const CTA_LABEL = 'Start Your 5-Day Challenge';
export const CTA_LABEL_CARD = 'Reserve My Free Spot';
export const CTA_LABEL_STICKY = 'Register Free Now';

/**
 * THE reassurance line under every CTA. It used to be the refund promise; a
 * free registration has nothing to refund, so it now removes the last
 * hesitation on a free offer instead: no card, no catch.
 *
 * CTA_NOTE, CTA_NOTE_HERO and GUARANTEE_LINE are aliases kept so every import
 * site keeps working; they are the same string and must stay that way.
 */
export const REASSURANCE_LINE = '100% free · No card required';
export const CTA_NOTE_HERO = REASSURANCE_LINE;
export const CTA_NOTE = REASSURANCE_LINE;
export const GUARANTEE_LINE = REASSURANCE_LINE;
