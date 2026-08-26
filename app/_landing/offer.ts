/**
 * Every date, time, price and destination on the page comes through this file.
 * Nothing below it should ever hard-code one again: when the cohort moves, one
 * edit here moves the announcement bar, the hero, the pills, the schedule
 * heading, the docked bar, the footer and the metadata together.
 */

/**
 * THE price. One number, from one env var, used by the copy, the GA4 event
 * values and the amount Razorpay actually charges. Nothing anywhere else may
 * declare a price: two sources drift, and the drift is invisible until the
 * charge and the label disagree on a live page.
 */
/* `??` does NOT catch an empty string, and .env.example now ships every key
   blank. So a copied-but-unfilled .env.local would give Number('') === 0: a
   page advertising ₹0 and a Razorpay order for zero paise, with nothing
   throwing. Guard on a positive number, not on null. */
const RAW_PRICE = Number(process.env.NEXT_PUBLIC_PRICE_RUPEES);
export const PRICE_RUPEES = Number.isFinite(RAW_PRICE) && RAW_PRICE > 0 ? RAW_PRICE : 497;
export const PRICE_PAISE = PRICE_RUPEES * 100;
export const PRICE = `₹${PRICE_RUPEES.toLocaleString('en-IN')}`;
/** The anchor the announcement bar names. Rising, per the source copy. */
export const PRICE_RISES_TO = '₹1599';
export const START_DATE = '9th September';
export const SESSION_TIMES = '6 AM & 7 PM';
export const SESSION_TIMES_TZ = '6 AM or 7 PM IST';

/**
 * ⚠️ PLACEHOLDER — DO NOT PUBLISH AS-IS.
 * The source copy carries "#,###+" for women supported. A real, evidenceable
 * figure has to replace this before the page goes live; an invented number is
 * not an option. The page renders whatever is here verbatim, so a placeholder
 * left in this constant will ship visibly rather than silently.
 */
export const WOMEN_SUPPORTED = '#,###+';

/**
 * The WhatsApp community invite. The thank-you page is built around joining it
 * as the single next step, so an empty value there shows the buyer a dead
 * button at the exact moment they have just paid.
 *
 * ⚠️ REQUIRED BEFORE LAUNCH. Create the group, take the invite link.
 */
export const WHATSAPP_INVITE = process.env.NEXT_PUBLIC_WHATSAPP_INVITE ?? '';

/** The next click is a payment. Every CTA on the page, including the docked
 *  bar, points here. */
export const CHECKOUT_HREF = '/checkout';

/** The CTA label and its reassurance line, as written in the source copy. */
export const CTA_LABEL = `Start Your 5-Day Reset · ${PRICE}`;
export const CTA_NOTE_HERO = "Full Refund If You Don't Love Day One";
export const CTA_NOTE = "Refundable If You Don't Love Day One";
