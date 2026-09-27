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
import Link from 'next/link';

import BrandMark from './brand-mark';
import { legoBrick, legoDelay } from './lego-style';
import {
  OTO_HREF,
  CTA_LABEL,
  CTA_LABEL_CARD,
  HAS_ANCHOR,
  PRICE,
  PRICE_ANCHOR,
  REFUND_LINE,
  SEATS_CAP,
  SEATS_LEFT,
  SESSION_TIMES,
  START_DATE,
  WOMEN_SUPPORTED,
} from './offer';
import { asset } from './asset-version';
import { Art, C, CtaNote, DiscountBadge, PriceAnchor } from './shared';

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
      {/* The navy-ink wordmark, not the gold-on-dark one: the stage is cream
          now and the light lockup would disappear into it. */}
      <BrandMark height={44} priority />
    </div>
  );
}

/* ══ 1 · Hero ══════════════════════════════════════════════════════════════ */

const HERO_FACTS = [
  { icon: CalendarBlank, text: `Starts ${START_DATE}` },
  { icon: Clock, text: SESSION_TIMES },
  { icon: VideoCamera, text: 'Live, Coach-Led Sessions' },
];

/* ══ 1a · The offer-card art ═══════════════════════════════════════════════
 *
 * The system-stack graphic, restored at Atul's request. It replaced a
 * credential card (spec PRIORITY 3) that was built in HTML and CSS from the
 * supplied portrait; that version is in git history if it is ever wanted back.
 *
 * The first version of this asset named five days that were not the five days
 * being run — it still carried "Face Yoga & De-Puffing" and "Nutrition &
 * Integration", which spec PRIORITY 2 existed to remove. The file here now is
 * the re-cut, and its cards match DAYS in below-fold.tsx exactly: Sleep Reset
 * with Prerna, Mat Pilates for Pain & Stiffness, Mat Pilates for Strength &
 * Mobility, Hatha Yoga for Stress & Anxiety, Breathwork for Hormonal Balance.
 * If the running order ever changes again, this image changes with it — it is
 * the one asset on the page that spells the schedule out in pixels, and no
 * amount of copy nearby can correct it.
 *
 * ⚠️ ONE THING IS STILL BAKED IN: the seal reads a hard "₹497". Every other
 * figure on the site comes from NEXT_PUBLIC_PRICE_RUPEES, so changing the price
 * moves all of them except this one, and the hero would then show two prices at
 * once — the struck/live pair in the card, and ₹497 in the art above it. Re-cut
 * the graphic in the same pass as any price change.
 *
 * ratio matches the asset's own 2752x1536. It was 3 / 2 for the previous cut,
 * and leaving it there would have cropped about 8% off each side with
 * object-cover — enough to clip the wordmark on the left and the price seal on
 * the right. See the note on Art in shared.tsx.
 */
function OfferArt() {
  return (
    <Art
      src={asset('/images/system-stack.png')}
      alt="Everything included: Prerna, the live Zoom sessions, the Kaizen community, the guides, the five day cards and the guided audio"
      ratio="2752 / 1536"
      sizes="(min-width: 1024px) 420px, 100vw"
      priority
      className="mb-6"
    />
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
                  background: C.goldPale,
                  border: `1px solid ${C.line}`,
                  color: C.goldInk,
                }}
              >
                <span
                  className="lego-pulse-dot inline-block h-2 w-2 shrink-0 rounded-full"
                  style={{
                    background: C.coral,
                    ['--dot-pulse' as string]: 'rgba(238,119,120,0.5)',
                  }}
                />
                For Women Navigating Perimenopause &amp; Menopause · 5-Day Reset
              </span>
              <DiscountBadge />
            </div>

            {/* ONE lit token in the headline: the number that carries the
                promise. goldDeep, not gold — gold is the on-navy highlight and
                would be nearly invisible now the stage is cream. goldDeep
                clears the 3:1 large-text bar, and this line is large text
                everywhere it renders. (C2/C3) */}
            <h1
              className="mt-7 font-display text-[34px] font-semibold leading-[1.1] sm:text-[44px] lg:text-[54px]"
              style={{ color: C.ink }}
            >
              Reduce Pain &amp; Stiffness by{' '}
              <span style={{ color: C.goldDeep }}>Up to 30%</span>, Sleep Better
              &amp; Feel in Control of Your Body Again in Just 5 Days
            </h1>

            {/* ══ The coaches banner — PHONES ONLY ═══════════════════════
                Supplied art, sitting directly under the headline exactly as
                the reference sets it. It is the only place on the page the
                three coaches appear together, and on a phone the offer card
                is still a screen away at this point, so the hero had nothing
                to look at between the H1 and a wall of body copy.

                sm:hidden, so it never reaches the desktop layout: from lg the
                offer card is already sitting beside the headline doing this
                job, and a second full-width image there would be two hero
                shots competing.

                ⚠️ The banner has "₹497" and "6:30 AM and 7 PM" baked into it.
                Those are env-driven everywhere else on the site now, so if
                NEXT_PUBLIC_PRICE_RUPEES or NEXT_PUBLIC_SESSION_TIMES change,
                this artwork has to be re-cut or it will contradict the copy
                directly beneath it. */}
            {/* NO `priority`. It is tempting — the banner is above the fold on
                the phones that see it — but priority emits a <link rel=preload>
                in the document head, and the head has no idea about sm:hidden.
                Every DESKTOP visitor was being made to preload 308KB of an
                image their layout never renders. Without it the fetch starts a
                beat later on mobile and not at all on desktop, which is the
                right trade for an element only one breakpoint can see. */}
            <div className="mt-7 sm:hidden">
              <Art
                src={asset('/banner image/kaizen.png')}
                alt="The experts behind your 5-Day Reset: Prerna and the certified Kaizen coaches. 540+ women supported, Business Goa Awards Corporate Excellence 2024, certified coaches across Pilates, yoga, mindfulness and breathwork."
                ratio="1672 / 941"
                sizes="(min-width: 640px) 1px, 100vw"
                className="rounded-2xl"
              />
            </div>

            <p
              className="mx-auto mt-6 max-w-[600px] text-[16px] leading-[1.7] lg:mx-0"
              style={{ color: C.inkSoft }}
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
              <PriceAnchor size="md" align="center" className="lg:items-start" />
            </div>

            <div className="mt-7 flex justify-center lg:justify-start">
              {/* Navy now, not gold. A gold fill was the right call against the
                  navy stage; on cream it is a pale button on a pale ground and
                  the page's primary action stops looking like one. Navy is the
                  house fill for a CTA on light — see PrimaryCTA's default tone.

                  Shimmer, but no breath: the offer card beside it is the page's
                  focal action and carries the one breathing CTA. Two breathing
                  buttons on one screen is two primaries, which is none. */}
              <Link
                href={OTO_HREF}
                data-cta
                className="lego-press cta-shimmer group inline-flex min-h-[58px] w-full items-center justify-center gap-2.5 rounded-full px-8 font-body text-[15.5px] font-bold sm:w-auto"
                style={{
                  background: C.ink,
                  color: C.canvas,
                  boxShadow: '0 16px 34px -16px rgba(31,50,92,0.5)',
                  ['--shimmer' as string]: 'rgba(242,221,182,0.30)',
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
            <CtaNote className="mt-4 lg:justify-start" />

            {/* The three facts, on a hairline rule rather than in boxes. The
                1px `gap` shows the container through as the rule, so the
                container colour IS the rule colour — C.line now that the tiles
                are cream rather than translucent navy. */}
            <ul
              className="mt-9 flex flex-col items-stretch gap-px overflow-hidden rounded-2xl sm:flex-row"
              style={{
                background: C.line,
                border: `1px solid ${C.line}`,
              }}
            >
              {HERO_FACTS.map(({ icon: Icon, text }, idx) => (
                <li
                  key={text}
                  data-lego=""
                  className="flex flex-1 items-center justify-center gap-2.5 px-4 py-3.5 text-[13px] font-semibold"
                  style={{
                    ...legoDelay(idx, 90),
                    background: C.canvas,
                    color: C.ink,
                  }}
                >
                  <Icon weight="bold" className="h-4 w-4 shrink-0" style={{ color: C.goldInk }} />
                  {text}
                </li>
              ))}
            </ul>
          </div>

          {/* ══ RIGHT — the offer card ════════════════════════════════════
              The page's single focal object. The stage around it is cream now,
              so the card can no longer rely on light-against-dark to separate
              itself: it holds its edge with a pure-canvas fill against the
              stage's warmer gradient, a firmer hairline and a navy-tinted
              shadow instead of a black one. */}
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
                  '0 0 0 8px rgba(255,253,248,0.6), 0 30px 64px -30px rgba(31,50,92,0.38)',
              }}
            >
              {/* The system-stack graphic. See OfferArt above — it carries
                  the wrong five day names, the wrong start time and a
                  hard-coded price. */}
              <OfferArt />

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
                href={OTO_HREF}
                data-cta
                className="lego-press cta-shimmer cta-breath group mt-6 inline-flex min-h-[56px] w-full items-center justify-center gap-2.5 rounded-2xl font-body text-[15.5px] font-bold"
                style={{
                  background: C.ink,
                  color: C.canvas,
                  ['--shimmer' as string]: 'rgba(242,221,182,0.30)',
                }}
              >
                <span className="inline-flex items-center gap-2.5">
                  {CTA_LABEL_CARD}
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
