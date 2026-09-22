/**
 * Above-the-fold: the announcement strip, the header, the dark hero stage and
 * the trust ledger that straddles the seam beneath it.
 *
 * A pure Server Component (no 'use client', no hooks) so it paints from static
 * HTML with zero JavaScript on the critical path.
 *
 * COPY IS VERBATIM from COPY-SOURCE.md. Where a run-on line has been split
 * across elements the words and their order are untouched; nothing is
 * re-voiced, shortened or added. Two things the copy carries that need a human
 * decision are flagged at their call sites: the "Price Increases To ₹1599
 * Tomorrow" line, which cannot run evergreen.
 *
 * The dark stage is the page's ONE dark section band, per the brief: light
 * theme only, hero in dark.
 */
import {
  ArrowRight,
  CalendarBlank,
  Clock,
  Heart,
  Lock,
  SealCheck,
  ShieldCheck,
  Star,
  VideoCamera,
} from '@phosphor-icons/react/dist/ssr';
import Image from 'next/image';
import Link from 'next/link';

import BrandMark from './brand-mark';
import { legoBrick, legoDelay } from './lego-style';
import {
  CHECKOUT_HREF,
  CTA_LABEL,
  HAS_ANCHOR,
  PRICE,
  PRICE_ANCHOR,
  REFUND_LINE,
  SEATS_CAP,
  SEATS_LEFT,
  SESSION_TIMES,
  SESSION_TIMES_PROSE,
  START_DATE,
  WOMEN_SUPPORTED,
} from './offer';
import { asset } from './asset-version';
import { C, CtaNote, DiscountBadge, PriceAnchor } from './shared';

/* ══ 0 · Announcement strip (R10) ══════════════════════════════════════════
   A slim navy strip with one live coral dot and a slow shine, so it reads as
   alive rather than as a static red sale bar. It names a specific price, a
   specific anchor and a specific number — never "limited time".

   The old second segment read "Price Increases To ₹1599 Tomorrow" and had done
   so, unchanged, for several weeks while the price stayed at ₹497. A deadline
   that never arrives does not just stop working; it teaches the reader to
   discount every other claim on the page, including the ones that are true.

   It is now the seat cap — spec BLOCKER 2, option B, taken because no dated
   instruction arrived by Sunday 21 Sept. ⚠️ SEATS_LEFT is a real number that
   someone has to keep current (see offer.ts). A stale seat count is the same
   broken promise wearing different clothes. */
export function AnnouncementBar() {
  const segments = [
    <>
      <span className="font-bold">Special Offer:</span> 5-Day (Peri)Menopause
      Reset Challenge for{' '}
      {/* Guarded like every other price point: with no valid anchor there is
          nothing to strike, and a struck figure BELOW the one being charged is
          worse than none at all. See HAS_ANCHOR in offer.ts. */}
      {HAS_ANCHOR && (
        <>
          <s
            className="decoration-[1.5px]"
            style={{ color: 'rgba(253,249,241,0.6)', textDecorationColor: C.coral }}
          >
            {PRICE_ANCHOR}
          </s>{' '}
        </>
      )}
      <span className="font-bold" style={{ color: C.gold }}>
        {PRICE}
      </span>
    </>,
    <>
      Live batches capped at {SEATS_CAP} women ·{' '}
      <span className="font-bold" style={{ color: C.gold }}>
        {SEATS_LEFT} seats left
      </span>
    </>,
    <>{REFUND_LINE}</>,
    <>
      Live · Starts {START_DATE} · {SESSION_TIMES}
    </>,
  ];

  /* One copy of the strip. Rendered twice inside the track, which is what makes
     a -50% translate loop seamlessly: at the reset the second copy sits exactly
     where the first began. The duplicate is decorative, so it is hidden from
     assistive tech rather than read out twice. */
  const strip = (copy: '1' | '2') => (
    <ul
      key={copy}
      data-marquee-copy={copy}
      aria-hidden={copy === '2' ? true : undefined}
      className="flex shrink-0 items-center gap-x-3 whitespace-nowrap pr-3 text-[12.5px] leading-snug sm:text-[13.5px]"
    >
      {segments.map((seg, i) => (
        <li key={i} className="inline-flex items-center gap-3 pr-3">
          {i === 0 ? (
            <span
              className="lego-pulse-dot inline-block h-[7px] w-[7px] shrink-0 rounded-full"
              style={{
                background: C.coral,
                ['--dot-pulse' as string]: 'rgba(238,119,120,0.6)',
              }}
            />
          ) : (
            <span aria-hidden style={{ color: 'rgba(217,181,113,0.55)' }}>
              |
            </span>
          )}
          <span>{seg}</span>
        </li>
      ))}
    </ul>
  );

  return (
    <div
      className="cta-shimmer w-full py-2.5"
      style={{
        background: C.navyDeep,
        color: C.onDark,
        ['--shimmer' as string]: 'rgba(242,221,182,0.14)',
      }}
    >
      {/* The mask lives on this inner element, NOT on the bar. A mask applies to
          the element's own background as well as its content, so masking the bar
          faded the navy itself and let the page behind show through as white. */}
      <div className="kz-marquee">
        <div className="kz-marquee-track">
          {strip('1')}
          {strip('2')}
        </div>
      </div>
    </div>
  );
}

/* ══ 0b · Header ═══════════════════════════════════════════════════════════
   The mark alone, on the stage. No nav: this is a single-offer page and every
   link out of it is a way to not buy. */
export function SiteHeader() {
  return (
    <div className="mx-auto flex max-w-[1180px] items-center justify-center px-5 pb-2 pt-6 sm:justify-start md:px-8">
      <BrandMark height={44} onDark priority />
    </div>
  );
}

/* ══ 1 · Hero ══════════════════════════════════════════════════════════════ */

const HERO_FACTS = [
  { icon: CalendarBlank, text: `Starts ${START_DATE}` },
  { icon: Clock, text: SESSION_TIMES },
  { icon: VideoCamera, text: 'Live, Coach-Led Sessions' },
];

/* ══ 1a · The credential card ══════════════════════════════════════════════
 *
 * This slot held the "system stack" graphic: a flat image of everything
 * included, carrying its whole message as text baked into pixels. Three things
 * were wrong with that at the top of the page. The text resampled soft on a
 * phone, none of it was selectable or searchable, and — the real cost — the
 * first object under the H1 was a picture of a bundle rather than the person
 * running it. The reader's first question on a page like this is who is
 * teaching, and it was being answered four screens down.
 *
 * So: the same slot, built in HTML and CSS, saying who she is. (Spec
 * PRIORITY 3.)
 *
 * The photograph is the SUPPLIED portrait and nothing else. No generated or
 * illustrated likeness, per the spec — it is a real person's face and the only
 * acceptable source for it is the one Kaizen sent.
 */
function CredentialCard() {
  return (
    <div
      className="mb-6 flex items-center gap-4 rounded-2xl p-4 text-left sm:gap-5 sm:p-5"
      style={{
        background: `linear-gradient(150deg, ${C.goldWash} 0%, ${C.canvas} 70%)`,
        border: `1px solid ${C.line}`,
      }}
    >
      {/* Fixed pixel box, not a fill-parent: the photo is a known size here and
          a circle that resizes with the column crops the face differently at
          every breakpoint. object-top keeps her eyes in frame on the square
          crop rather than centring on the collarbone. */}
      <span
        className="relative block h-[78px] w-[78px] shrink-0 overflow-hidden rounded-full sm:h-[88px] sm:w-[88px]"
        style={{ boxShadow: `0 0 0 3px ${C.canvas}, 0 0 0 4px ${C.goldMid}` }}
      >
        <Image
          src={asset('/images/prerna-portrait.jpg')}
          alt="Prerna Khetrapal, founder of Kaizen Goa"
          fill
          sizes="88px"
          priority
          className="object-cover object-top"
        />
      </span>

      <div className="min-w-0">
        <p
          className="text-[10px] font-bold uppercase tracking-[0.16em]"
          style={{ color: C.goldInk }}
        >
          Led by
        </p>
        <p
          className="mt-1 font-display text-[19px] font-semibold leading-tight sm:text-[21px]"
          style={{ color: C.ink }}
        >
          Prerna Khetrapal
        </p>
        <p className="mt-1 text-[12.5px] leading-snug" style={{ color: C.inkSoft }}>
          Founder, Kaizen Goa · MBA, ISB Hyderabad
        </p>
        <p className="mt-1.5 text-[12.5px] leading-snug" style={{ color: C.inkSoft }}>
          <span className="font-bold" style={{ color: C.coralInk }}>
            {WOMEN_SUPPORTED}
          </span>{' '}
          women supported through perimenopause and menopause
        </p>
        <p
          className="mt-2.5 border-t pt-2.5 text-[12px] font-semibold leading-snug"
          style={{ borderColor: C.line, color: C.ink }}
        >
          Live on Zoom · {SESSION_TIMES_PROSE} · {PRICE}
        </p>
      </div>
    </div>
  );
}

export function Hero() {
  return (
    <>
      <section data-hero className="kz-stage pb-24 pt-1">
        <SiteHeader />

        <div className="mx-auto grid max-w-[1180px] items-center gap-9 px-5 pt-6 sm:gap-12 md:px-8 lg:grid-cols-[1.04fr_0.96fr] lg:gap-16 lg:pt-10">
          {/* ══ LEFT ══════════════════════════════════════════════════════ */}
          <div className="text-center lg:text-left">
            {/* The gate line: who this is for, said before anything is sold.
                The discount badge sits beside it rather than above the H1, so
                the two eyebrow-weight objects read as one row instead of
                stacking into a pile of pills above the headline. */}
            <div className="flex flex-wrap items-center justify-center gap-2.5 lg:justify-start">
              <span
                className="inline-flex items-center gap-2.5 rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-[0.14em]"
                style={{
                  background: 'rgba(242,221,182,0.10)',
                  border: '1px solid rgba(242,221,182,0.28)',
                  color: C.gold,
                }}
              >
                <span
                  className="lego-pulse-dot inline-block h-2 w-2 shrink-0 rounded-full"
                  style={{
                    background: C.coral,
                    ['--dot-pulse' as string]: 'rgba(238,119,120,0.6)',
                  }}
                />
                For Women Navigating Perimenopause &amp; Menopause · 5-Day Reset
              </span>
              <DiscountBadge onDark />
            </div>

            {/* ONE lit token in the headline: the number that carries the
                promise. Everything else stays warm white, which is what stops
                the line reading as a highlighter pass. (C2/C3) */}
            <h1
              className="mt-7 font-display text-[34px] font-semibold leading-[1.1] sm:text-[44px] lg:text-[54px]"
              style={{ color: C.onDark }}
            >
              Reduce Pain &amp; Stiffness by{' '}
              <span style={{ color: C.gold }}>Up to 30%</span>, Sleep Better
              &amp; Feel in Control of Your Body Again in Just 5 Days
            </h1>

            {/* A mobile-only image used to sit here, to give the phone hero
                something to look at above the offer card. It is gone because
                the card's own art is now the offer-stack shot, which lands
                immediately below on exactly this breakpoint: two large images
                back to back read as a repeat, and the stack shot is the
                stronger of the two. If a distinct hero still is ever supplied,
                this is where it goes. */}

            <p
              className="mx-auto mt-6 max-w-[600px] text-[16px] leading-[1.7] lg:mx-0"
              style={{ color: C.onDarkMute }}
            >
              Experience five days of expert-led Pilates, yoga, mindfulness
              &amp; breathwork designed to ease common (peri)menopause symptoms
              and help you feel lighter in your body, calmer in your mind &amp;
              more like yourself again. Starts{' '}
              {START_DATE}, live on Zoom.
            </p>

            {/* The anchor, above the button rather than below it: the reader
                should know what the number is worth BEFORE they read the price
                welded into the CTA label. (Spec BLOCKER 2.) */}
            <div className="mt-8 flex justify-center lg:justify-start">
              <PriceAnchor size="md" onDark align="center" className="lg:items-start" />
            </div>

            <div className="mt-7 flex justify-center lg:justify-start">
              {/* Shimmer, but no breath: the offer card beside it is the page's
                  focal action and carries the one breathing CTA. Two breathing
                  buttons on one screen is two primaries, which is none. */}
              <Link
                href={CHECKOUT_HREF}
                data-cta
                className="lego-press cta-shimmer group inline-flex min-h-[58px] w-full items-center justify-center gap-2.5 rounded-full px-8 font-body text-[15.5px] font-bold sm:w-auto"
                style={{
                  background: C.ctaGold,
                  color: C.ink,
                  boxShadow: '0 16px 34px -16px rgba(0,0,0,0.55)',
                  ['--shimmer' as string]: 'rgba(255,255,255,0.55)',
                }}
              >
                <span className="inline-flex items-center gap-2.5">
                  {CTA_LABEL}
                  <ArrowRight
                    weight="bold"
                    className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
                  />
                </span>
              </Link>
            </div>

            {/* Welded to the button, never floated away from it. */}
            <CtaNote onDark className="mt-4 lg:justify-start" />

            {/* The three facts, on a hairline rule rather than in boxes. */}
            <ul
              className="mt-9 flex flex-col items-stretch gap-px overflow-hidden rounded-2xl sm:flex-row"
              style={{
                background: 'rgba(242,221,182,0.16)',
                border: '1px solid rgba(242,221,182,0.16)',
              }}
            >
              {HERO_FACTS.map(({ icon: Icon, text }, idx) => (
                <li
                  key={text}
                  data-lego=""
                  className="flex flex-1 items-center justify-center gap-2.5 px-4 py-3.5 text-[13px] font-semibold"
                  style={{
                    ...legoDelay(idx, 90),
                    background: 'rgba(21,35,66,0.86)',
                    color: C.onDark,
                  }}
                >
                  <Icon weight="bold" className="h-4 w-4 shrink-0" style={{ color: C.gold }} />
                  {text}
                </li>
              ))}
            </ul>
          </div>

          {/* ══ RIGHT — the offer card ════════════════════════════════════
              The page's single focal object. There is no video and no
              photography yet, so the offer itself is what catches the light:
              a cream card on the navy stage, with a local ink re-theme (C12).
              When a founder clip or a system image lands, it slots in above
              the eyebrow and nothing else has to change. */}
          <div>
            <div
              data-lego=""
              /* Centred on mobile, left from lg up. On a phone the card is the
                 whole screen and a centred stack reads as one deliberate
                 object; on desktop it sits beside a left-aligned headline, and
                 centring it there would break that shared edge. */
              className="rounded-[28px] p-7 text-center sm:p-8 lg:text-left"
              style={{
                ...legoDelay(2, 90),
                background: C.canvas,
                border: `1px solid ${C.lineStrong}`,
                boxShadow:
                  '0 0 0 8px rgba(242,221,182,0.07), 0 34px 70px -30px rgba(0,0,0,0.6)',
              }}
            >
              {/* Was the system-stack graphic. It is now a credential card in
                  HTML and CSS — see CredentialCard below for why. */}
              <CredentialCard />

              <span
                className="inline-flex items-center rounded-full px-3 py-1.5 text-[10.5px] font-bold uppercase tracking-[0.18em]"
                style={{ background: C.goldPale, color: C.goldInk }}
              >
                PILATES · YOGA · MINDFULNESS · BREATHWORK
              </span>

              <h2
                className="mt-4 font-display text-[26px] font-semibold leading-[1.16]"
                style={{ color: C.ink }}
              >
                5-Day (Peri)Menopause Reset Challenge
              </h2>
              <p className="mt-2 text-[14px]" style={{ color: C.inkSoft }}>
                Live expert-led sessions · Zoom · 2 session timings
              </p>

              {/* The offer card's price, and the page's primary money moment.
                  Set stacked — anchor, then price, then the saving, then the
                  term — exactly as the spec lays it out. */}
              <div
                className="mt-6 border-t pt-6"
                style={{ borderColor: C.line }}
              >
                <PriceAnchor
                  size="lg"
                  stacked
                  align="center"
                  note="one-time"
                  className="lg:items-start lg:text-left"
                />
              </div>

              {/* THE breathing CTA. The only one on the page. */}
              <Link
                href={CHECKOUT_HREF}
                data-cta
                className="lego-press cta-shimmer cta-breath group mt-6 inline-flex min-h-[56px] w-full items-center justify-center gap-2.5 rounded-2xl font-body text-[15.5px] font-bold"
                style={{
                  background: C.ink,
                  color: C.canvas,
                  ['--shimmer' as string]: 'rgba(242,221,182,0.30)',
                }}
              >
                <span className="inline-flex items-center gap-2.5">
                  Reserve My Spot
                  <ArrowRight
                    weight="bold"
                    className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
                  />
                </span>
              </Link>

              <p
                className="mt-4 flex items-center justify-center gap-2 text-[11.5px] font-semibold uppercase tracking-[0.08em]"
                style={{ color: C.inkSoft }}
              >
                <Lock weight="fill" className="h-3.5 w-3.5" style={{ color: C.goldInk }} />
                100% Secure · UPI / Card / NetBanking
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="kz-stage-seam" aria-hidden />
      <TrustLedger />
    </>
  );
}

/* ══ 2 · The trust ledger ══════════════════════════════════════════════════
   Four figures on a ruled row, lifted so the card straddles the seam between
   the dark stage and the cream page — the join is a designed object rather
   than a colour change.

   The source copy sets these with emoji (❤️ ⭐ 🛡️ 💯). They are rendered as
   matched-weight line icons instead: emoji as UI is the single loudest
   template tell, and it renders differently on every device the audience owns.
   The words are untouched. */
const STATS = [
  { icon: Heart, big: WOMEN_SUPPORTED, small: 'Women Supported', bed: C.coralBed, fg: C.coralInk },
  { icon: Star, big: '4.9 / 5', small: 'Women 40–55', bed: C.goldPale, fg: C.goldInk },
  /* Was "100%" / "Money-Back Guarantee". The figure and the label together now
     read as the page's one refund string — "Full refund if you don't love Day
     One." — rather than as a third wording of the same promise. (BLOCKER 4.) */
  {
    icon: ShieldCheck,
    big: 'Full refund',
    small: "if you don't love Day One.",
    bed: C.navyBed,
    fg: C.ink,
  },
  {
    icon: SealCheck,
    big: 'Certified Coaches',
    small: 'Expert-Led guidance',
    bed: C.goldPale,
    fg: C.goldInk,
  },
];

function TrustLedger() {
  return (
    <div className="relative z-10 mx-auto -mt-14 max-w-[1120px] px-5 md:px-8">
      <ul
        className="grid grid-cols-2 gap-x-5 gap-y-7 rounded-3xl px-6 py-8 sm:px-9 lg:grid-cols-4"
        style={{
          background: C.canvas,
          border: `1px solid ${C.line}`,
          boxShadow: '0 26px 54px -30px rgba(31,50,92,0.35)',
        }}
      >
        {STATS.map(({ icon: Icon, big, small, bed, fg }, idx) => (
          /* lego-hover-icon: the whole row is the hover target so the hit area
             stays generous, but only the glyph moves. Lifting a figure drags
             the eye off the number, which is the one thing worth reading. */
          <li
            key={small}
            data-lego=""
            className="lego-hover-icon flex items-center gap-3.5"
            style={legoBrick(idx, 85)}
          >
            <span
              data-lego-stud=""
              className="lego-stud grid h-11 w-11 shrink-0 place-items-center rounded-full"
              style={{ ...legoBrick(idx, 85), background: bed }}
            >
              <Icon weight="fill" className="h-5 w-5" style={{ color: fg }} />
            </span>
            <span className="leading-tight">
              <span
                className="block font-display text-[20px] font-semibold"
                style={{ color: C.ink }}
              >
                {big}
              </span>
              <span className="mt-0.5 block text-[12.5px]" style={{ color: C.inkSoft }}>
                {small}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
