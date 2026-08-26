'use client';

/**
 * The closing half of the page: the guide, the mechanism, the results, the
 * decision, the recap and the colophon.
 *
 * COPY IS VERBATIM. Two things in the source are rendered as written and
 * flagged rather than quietly corrected — see the notes on Mechanism (a
 * repeated ordinal) and TwoOptions (a bracketed button label).
 */
import type { Icon } from '@phosphor-icons/react';
import {
  ArrowRight,
  ArrowsOutCardinal,
  BatteryHigh,
  Bed,
  Brain,
  Check,
  HandHeart,
  Heart,
  Heartbeat,
  Lightbulb,
  Minus,
  MoonStars,
  PersonSimpleWalk,
  Plus,
  Quotes,
  Steps,
  Sun,
  Waves,
} from '@phosphor-icons/react/dist/ssr';
import Link from 'next/link';

import SiteFooter from '@/components/SiteFooter';

import BrandMark from './brand-mark';
import { legoBrick, legoDelay } from './lego-style';
import { CHECKOUT_HREF, CTA_LABEL, CTA_NOTE, PRICE, SESSION_TIMES, START_DATE } from './offer';
import {
  C,
  CtaNote,
  MediaPlaceholder,
  PrimaryCTA,
  SectionHeading,
} from './shared';

/* ══ 9 · Meet your guide ═══════════════════════════════════════════════════
 *
 * NO COMPONENT. This one is prose and stays prose.
 *
 * A founder's story has no inherent structure — no sequence, no contrast, no
 * set — and forcing one onto it (a fake timeline, three "pillar" cards cut out
 * of her paragraphs) is the design equivalent of inventing a claim. So this is
 * clean, well-set type on a capped measure, with ONE object in it: the
 * pull-quote, which is editorial scaffolding rather than a manufactured
 * structure.
 *
 * Photography of Prerna has not arrived yet, so the left column runs as three
 * reserved slots at the exact ratios the real shots will take: one portrait
 * lead with two squares beneath it. Nothing reflows when the images land.
 *
 * To go live, fill PHOTOS with paths. Any entry left null keeps its reserved
 * slot, so the section can also run with only the lead shot supplied.
 */
const PHOTOS: { lead: string | null; small: [string | null, string | null] } = {
  lead: null,
  small: [null, null],
};

/* One slot. Renders the real image when a path exists and a reserved box at the
   same ratio when it does not, so the two states are never different sizes. */
function GuideShot({
  src,
  ratio,
  label,
  alt,
}: {
  src: string | null;
  ratio: string;
  label: string;
  alt: string;
}) {
  if (src) {
    return (
      <div
        className="overflow-hidden rounded-3xl"
        style={{ border: `1px solid ${C.line}`, background: C.canvas }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover"
          style={{ aspectRatio: ratio }}
          loading="lazy"
        />
      </div>
    );
  }
  return <MediaPlaceholder ratio={ratio} label={label} className="rounded-3xl" />;
}

function Guide() {
  return (
    <section className="px-4 py-12 sm:py-20 lg:py-24" style={{ background: C.canvasAlt }}>
      {/* The masthead is centred and full width, the same treatment every other
          section on the page uses. It was previously set left inside the text
          column, which made this the one section whose title did not line up
          with the rest of the page. */}
      <SectionHeading eyebrow="MEET YOUR GUIDE">
        Who Is <span style={{ color: C.goldDeep }}>Prerna</span> and Why Her
        Approach Goes Beyond Exercise
      </SectionHeading>

      <div className="mx-auto mt-12 max-w-[1060px] lg:grid lg:grid-cols-[0.8fr_1fr] lg:items-start lg:gap-12">
        {/* One lead portrait with two squares beneath it. The pair sits in its
            own 2-up grid so both stay equal width whatever the column does. */}
        <div className="mb-10 flex flex-col gap-3 lg:mb-0">
          <GuideShot
            src={PHOTOS.lead}
            ratio="3 / 4"
            label="Lead portrait"
            alt="Prerna, founder of Kaizen"
          />
          <div className="grid grid-cols-2 gap-3">
            <GuideShot src={PHOTOS.small[0]} ratio="1 / 1" label="Detail 1" alt="" />
            <GuideShot src={PHOTOS.small[1]} ratio="1 / 1" label="Detail 2" alt="" />
          </div>
        </div>

        <div>
          {/* Left-aligned at every width even though the masthead is centred:
              centred paragraphs of this length are hard work to read. */}
          <div
            className="space-y-4 text-[16px] leading-[1.75]"
            style={{ color: C.inkSoft }}
          >
            <p>
              Prerna is the founder of Kaizen, a holistic wellness space in Goa
              that brings certified experts across Pilates, yoga, breathwork,
              sound healing, nutrition and recovery together. She holds an MBA
              from ISB Hyderabad and has built Kaizen around sustainable,
              inside-out wellness.
            </p>
            <p>
              Prerna saw women eating carefully, exercising regularly and still
              waking up exhausted, stiff and unlike themselves. As she began
              navigating the same phase and saw this pattern among Kaizen’s
              clients, one thing became clear: (peri)menopause affects the body,
              mind and sense of self. Exercise alone could never be the complete
              answer.
            </p>
          </div>

          {/* The one object in the section. A quotation mark set in the display
              face, a gold hairline, and the line itself in italic serif — the
              page's editorial voice, not a coloured box. */}
          <figure
            data-lego=""
            className="relative mt-9 rounded-2xl px-7 py-8 sm:px-9"
            style={{
              background: C.canvas,
              border: `1px solid ${C.line}`,
              borderLeft: `2px solid ${C.goldMid}`,
              boxShadow: '0 18px 40px -30px rgba(31,50,92,0.28)',
            }}
          >
            <Quotes
              weight="fill"
              aria-hidden
              className="absolute -top-3 left-6 h-7 w-7"
              style={{ color: C.goldMid }}
            />
            <blockquote
              className="font-display text-[clamp(18px,2.2vw,23px)] italic leading-[1.5]"
              style={{ color: C.ink }}
            >
              “(Peri)menopause is not a problem to be fixed. It is a pause, an
              invitation to listen to your body and return to yourself.”
            </blockquote>
          </figure>

          <p className="mt-7 text-[16px] leading-[1.75]" style={{ color: C.inkSoft }}>
            That’s why she created this 5-Day Challenge, bringing Pilates, yoga,
            mindfulness and breathwork into one guided experience, so you can
            feel the difference for yourself before committing long-term.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ══ 10 · Why This Works ═══════════════════════════════════════════════════
 *
 * The mechanism, and it reads as "the N principles of the method" rather than
 * "the old way vs the new way" — so it is a numbered ledger, not a comparison.
 * Hairline-ruled rows with big lit ordinals: a ledger reads audited and
 * accountable, which is what sells competence. It is deliberately NOT another
 * icon-card grid, because the Experience section three screens up already is
 * one.
 *
 * The v1 source numbered these 01, 02, 03, 04, 02, 05, a repeated "02" with no
 * "06", and that had to be corrected by hand. The revised copy ships them
 * numbered 01 to 06 correctly, so this ledger now follows the source exactly.
 */
const PILLARS = [
  {
    n: '01',
    title: 'Your Symptoms Are Not Separate',
    icon: Brain,
    body: 'Poor sleep can affect your energy, stress can increase physical tension and discomfort can make it harder to rest. Supporting one area can positively influence another.',
  },
  {
    n: '02',
    title: 'You Work With Your Body',
    icon: HandHeart,
    body: 'The approach focuses on listening and responding to your changing body, instead of forcing it through routines that may no longer feel right.',
  },
  {
    n: '03',
    title: 'Movement Comes Without Punishment',
    icon: PersonSimpleWalk,
    body: 'Supportive movement helps you rebuild comfort, mobility and strength without treating exercise as another way to fight your body.',
  },
  {
    n: '04',
    title: 'Your Nervous System Is Part of the Picture',
    icon: Waves,
    body: 'Calming practices help your system move away from constantly feeling restless, overwhelmed or on edge.',
  },
  {
    n: '05',
    title: 'Mind and Body Learn to Communicate',
    icon: MoonStars,
    body: 'Greater awareness helps you recognise your body’s signals, understand what it may need and respond more intentionally.',
  },
  {
    n: '06',
    title: 'The Experience Builds Gradually',
    icon: Steps,
    body: 'Each day adds a different layer of support, allowing you to experience how movement, rest and breathwork can work together.',
  },
];

function Mechanism() {
  return (
    <section className="px-4 py-12 sm:py-20 lg:py-24" style={{ background: C.canvas }}>
      <SectionHeading
        eyebrow="READ THIS BEFORE YOU DECIDE"
        sub="Most (peri)menopause advice treats each symptom separately. A workout for stiffness, a diet for weight gain and very little support for anxiety or sleep. Kaizen brings movement, mindfulness and nutrition together, so you can support these changes as a whole and learn to work with your body, not against it."
      >
        Why This <span style={{ color: C.goldDeep }}>Works</span>.
      </SectionHeading>

      {/* A 1px-gap grid, so the GAPS become the rules: a ruled ledger with no
          card boxes and no shadows. The background is the rule colour. */}
      <ul
        className="mx-auto mt-14 grid max-w-[1000px] gap-px overflow-hidden rounded-2xl sm:grid-cols-2"
        style={{ background: C.line, border: `1px solid ${C.line}` }}
      >
        {PILLARS.map((p, i) => (
          <li
            key={p.title}
            data-lego=""
            className="lego-hover-sm flex items-start gap-5 px-6 py-7 sm:px-8"
            style={{ ...legoDelay(i, 70), background: C.canvas }}
          >
            {/* Icon and ordinal stack rather than sit side by side: the row is
                a ledger line, and two glyphs abreast would read as two columns
                of data instead of one marker. */}
            <span className="flex shrink-0 flex-col items-center gap-2">
              <span
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl"
                style={{ background: C.goldPale, border: `1px solid ${C.line}` }}
                aria-hidden="true"
              >
                <p.icon weight="duotone" className="h-5 w-5" style={{ color: C.goldInk }} />
              </span>
              <span
                className="font-display text-[18px] font-semibold leading-none"
                style={{ color: C.goldDeep }}
              >
                {p.n}
              </span>
            </span>
            <span className="min-w-0 flex-1">
              <span
                className="block font-display text-[19px] font-semibold leading-snug"
                style={{ color: C.ink }}
              >
                {p.title}
              </span>
              <span
                className="mt-2 block text-[14.5px] leading-relaxed"
                style={{ color: C.inkSoft }}
              >
                {p.body}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ══ 11 · The results ══════════════════════════════════════════════════════
   Eight short outcomes with no bodies. A light checked grid, because the shape
   is an accumulating list and nothing more: giving eight one-line items the
   weight of cards would be louder than their meaning. */
const NOTICE: { text: string; icon: Icon }[] = [
  { text: 'Pain and stiffness begin to ease', icon: Sun },
  { text: 'Joints and shoulders move more freely', icon: ArrowsOutCardinal },
  { text: 'Strength and everyday mobility begin to improve', icon: BatteryHigh },
  { text: 'Sleep feels deeper and more restful', icon: Bed },
  { text: 'Anxiety and restlessness begin to settle', icon: Heartbeat },
  { text: 'The mind feels calmer and clearer', icon: Lightbulb },
  { text: 'They understand their body’s signals better', icon: Brain },
  { text: 'They feel more at home in their bodies again', icon: Heart },
];

function Results() {
  return (
    <section className="px-4 py-12 sm:py-20 lg:py-24" style={{ background: C.canvasAlt }}>
      <SectionHeading eyebrow="THE RESULTS">
        That’s Why Women{' '}
        <span style={{ color: C.goldDeep }}>Begin to Notice</span>...
      </SectionHeading>

      {/* Eight into three columns leaves two stranded hard-left. Six columns
          with a 2-column span per item is visually identical to three, but the
          half-column offset lets the final pair start at column 2 and sit dead
          centre. */}
      <ul className="mx-auto mt-12 grid max-w-[980px] gap-3 sm:grid-cols-2 lg:grid-cols-6">
        {NOTICE.map((item, idx) => {
          const startsTail = NOTICE.length % 3 === 2 && idx === NOTICE.length - 2;
          return (
            <li
              key={item.text}
              data-lego=""
              className={`lego-hover-sm flex items-center gap-3.5 rounded-2xl px-5 py-4 lg:col-span-2 ${
                startsTail ? 'lg:col-start-2' : ''
              }`}
              style={{
                ...legoBrick(idx, 60),
                border: `1px solid ${C.line}`,
                background: C.canvas,
              }}
            >
              <span
                className="lego-stud inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                style={{ background: C.goldPale }}
              >
                <item.icon weight="duotone" className="h-4 w-4" style={{ color: C.goldInk }} />
              </span>
              <span className="text-[14.5px] leading-snug" style={{ color: C.inkSoft }}>
                {item.text}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/* ══ 12 · Two options ══════════════════════════════════════════════════════
   A decision with two sides, so it is argued with visual weight rather than
   with a red ✗ and a green ✓: Option 1 is set back — quiet surface, no border
   emphasis, muted type — and Option 2 is the lifted navy card that carries the
   click. The layout decides before the copy is read.

   ⚠️ FLAG FOR ATUL: the source writes the button as "[Take Action · ₹497 →]".
   The square brackets and the arrow are the copy's shorthand for "this is a
   button", so the label renders as "Take Action · ₹497" with the page's arrow
   token. If the brackets were meant literally, say so and they go back in. */
function TwoOptions() {
  return (
    <section className="px-4 py-12 sm:py-20 lg:py-24" style={{ background: C.canvas }}>
      <SectionHeading>
        Now You Have{' '}
        <span style={{ color: C.goldDeep }}>Two Options</span> From Here
      </SectionHeading>

      <div className="mx-auto mt-12 grid max-w-[940px] items-start gap-5 sm:grid-cols-2">
        {/* The one being set down. */}
        <div
          data-lego="x"
          className="rounded-3xl p-7 sm:p-8"
          style={{
            ['--lego-from' as string]: '-30px',
            background: C.canvasAlt,
            border: `1px solid ${C.line}`,
            opacity: 0.86,
          }}
        >
          <span
            className="lego-stud inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em]"
            style={{ background: C.canvas, color: C.inkSoft, border: `1px solid ${C.line}` }}
          >
            <Minus weight="bold" className="h-3 w-3" />
            OPTION 1
          </span>
          <p className="mt-5 text-[15px] leading-relaxed" style={{ color: C.inkSoft }}>
            Ignore the changes, keep treating the poor sleep, stiffness and
            anxiety separately, and continue wondering why you no longer feel
            like yourself.
          </p>
        </div>

        {/* The one being picked up. */}
        <div
          data-lego="x"
          className="rounded-3xl p-7 sm:p-8"
          style={{
            ['--lego-from' as string]: '30px',
            ['--lego-d' as string]: '110ms',
            background: C.navyDeep,
            boxShadow: '0 26px 56px -28px rgba(31,50,92,0.6)',
          }}
        >
          <span
            className="lego-stud inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em]"
            style={{ background: 'rgba(242,221,182,0.16)', color: C.gold }}
          >
            <Plus weight="bold" className="h-3 w-3" />
            OPTION 2
          </span>
          <p className="mt-5 text-[15px] leading-relaxed" style={{ color: C.onDark }}>
            Take five days to experience Pilates, yoga, mindfulness &amp;
            breathwork together, understand what your changing body needs and
            begin feeling more in control again.
          </p>

          <Link
            href={CHECKOUT_HREF}
            data-cta
            className="lego-press cta-shimmer group mt-7 inline-flex min-h-[54px] w-full items-center justify-center gap-2.5 rounded-full px-6 font-body text-[15px] font-bold"
            style={{
              background: C.ctaGold,
              color: C.ink,
              ['--shimmer' as string]: 'rgba(255,255,255,0.55)',
            }}
          >
            <span className="inline-flex items-center gap-2.5">
              Take Action · {PRICE}
              <ArrowRight
                weight="bold"
                className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
              />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ══ 13 · Recap ════════════════════════════════════════════════════════════
 *
 * The premium peak. The last thing the reader touches before paying, so it is
 * the most finished object on the page: a layered frame with a gold flourish
 * and ornament, a medallion seal, a hairline-ruled ledger with a value on
 * EVERY row (never one lump), and the value collapse dramatised — the ₹5,485
 * draws its own strike-through, then ₹497 pops in lit.
 *
 * It stays on the cream page. The brief is light-theme-only below the hero, so
 * the peak is earned with craft and depth rather than by turning the lights
 * off.
 */
const RECAP = [
  { what: '5-Day Live (Peri)Menopause Reset Challenge', value: '₹2,500' },
  { what: 'Kaizen Menopause Nutrition Playbook', value: '₹997' },
  { what: 'Kaizen Morning Mobility Reset', value: '₹497' },
  { what: 'Pranayam for Better Sleep', value: '₹497' },
  { what: 'Nervous System Reset with Prerna', value: '₹497' },
];

function Recap() {
  return (
    <section
      data-final
      className="px-4 py-20 sm:py-28"
      style={{
        background: `radial-gradient(ellipse 68% 44% at 50% 0%, rgba(242,221,182,0.34), transparent 62%), ${C.canvasAlt}`,
      }}
    >
      <div data-lego="" className="kz-recap">
        <div className="kz-seal" aria-hidden>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.1"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 3 4 6v6c0 5 3.5 8.5 8 9 4.5-.5 8-4 8-9V6l-8-3Z" />
            <path d="m9 12 2 2 4-4" />
          </svg>
        </div>

        <h2
          className="text-center font-display text-[clamp(26px,3.6vw,40px)] font-semibold leading-[1.14]"
          style={{ color: C.ink, textWrap: 'balance' } as React.CSSProperties}
        >
          Recap of Everything{' '}
          <span style={{ color: C.goldDeep }}>You’ll Get</span>
        </h2>

        {/* Column headers in the page's spec voice: tracked uppercase. */}
        <div
          className="mt-10 flex items-center justify-between border-b pb-3 text-[10.5px] font-bold uppercase tracking-[0.2em]"
          style={{ borderColor: C.lineStrong, color: C.inkSoft }}
        >
          <span>INCLUDED</span>
          <span>VALUE</span>
        </div>

        <ul className="kz-ledger">
          {RECAP.map((r) => (
            <li key={r.what} className="flex items-center justify-between gap-5 py-4">
              <span className="flex min-w-0 items-start gap-3">
                <span
                  className="mt-1 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full"
                  style={{ background: C.goldPale }}
                >
                  <Check weight="bold" className="h-2.5 w-2.5" style={{ color: C.goldInk }} />
                </span>
                <span className="text-[14.5px] leading-snug" style={{ color: C.ink }}>
                  {r.what}
                </span>
              </span>
              <span
                className="shrink-0 font-display text-[16px] font-semibold"
                style={{ color: C.inkSoft }}
              >
                {r.value}
              </span>
            </li>
          ))}
        </ul>

        {/* The value moment. Total value is struck as it arrives; the price
            you actually pay lands lit, a beat later. */}
        <div
          className="mt-3 flex items-center justify-between gap-5 border-t py-5"
          style={{ borderColor: C.lineStrong }}
        >
          <span
            className="text-[11px] font-bold uppercase tracking-[0.2em]"
            style={{ color: C.inkSoft }}
          >
            TOTAL VALUE
          </span>
          <span
            className="kz-strike font-display text-[22px] font-semibold"
            style={{ color: C.inkSoft }}
          >
            ₹5,485
          </span>
        </div>

        <div
          className="mt-2 rounded-2xl px-6 py-8 text-center"
          style={{ background: C.goldWash, border: `1px solid ${C.lineStrong}` }}
        >
          <p
            className="text-[11px] font-bold uppercase tracking-[0.2em]"
            style={{ color: C.goldInk }}
          >
            GET EVERYTHING TODAY FOR
          </p>
          <p className="kz-price kz-lit mt-3 font-display text-[56px] font-semibold leading-none">
            {PRICE}
          </p>
          <p className="mt-2 text-[13px]" style={{ color: C.inkSoft }}>
            (One-time payment)
          </p>
        </div>

        <div className="mx-auto mt-9 flex max-w-[520px] flex-col items-center">
          <PrimaryCTA label={CTA_LABEL} tone="navy" full />
          <CtaNote text={CTA_NOTE} />
        </div>
      </div>
    </section>
  );
}

/* ══ 14 · Colophon ════════════════════════════════════════════════════════
   The disclaimer that used to sit here as a framed box now lives in the shared
   SiteFooter, so it appears on the checkout and the thank-you page too rather
   than only on the landing page. Its wording moved across unchanged. */
function Colophon() {
  return (
    <SiteFooter>
      <span className="mb-6 inline-flex">
        <BrandMark height={42} onDark />
      </span>

      <p className="mx-auto mb-8 max-w-[640px] text-[13px]" style={{ color: C.onDarkMute }}>
        <span className="inline-block">
          Starts {START_DATE} · {SESSION_TIMES} · Live on Zoom
        </span>
        <span aria-hidden className="hidden sm:inline">
          {' · '}
        </span>
        <span className="block sm:inline">{PRICE}, 100% money-back guarantee</span>
      </p>
    </SiteFooter>
  );
}

export default function Close() {
  return (
    <>
      <Guide />
      <Mechanism />
      <Results />
      <TwoOptions />
      <Recap />
      <Colophon />
    </>
  );
}
