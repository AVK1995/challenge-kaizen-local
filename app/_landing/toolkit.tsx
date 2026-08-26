'use client';

/**
 * Section 8 · the toolkit.
 *
 * Six things that sum to a price, so the shape is accumulation. Two rules
 * decide the treatment:
 *
 *  1. The value is shown PER ITEM, never as one lump "worth ₹5,485" — a lump
 *     is a claim, a line-item is a contract.
 *  2. The challenge itself is the item that dominates (₹2,500 of the ₹5,485
 *     and the only LIVE one), so it is lifted out of the grid and given the
 *     lead card. The layout says which one matters before the copy does.
 *
 * This is the FIRST of the page's two accumulation beats. The second is the
 * closing recap, which is a ruled ledger — the two are deliberately different
 * forms so the recap reads as a summing-up rather than as a repeat.
 *
 * No cover art exists for the guides, so these are typographic cards carrying
 * an ordinal and a value rather than mock-up shots. When covers land they slot
 * in above each title.
 */
import type { Icon } from '@phosphor-icons/react';
import {
  Broadcast,
  CheckCircle,
  Headphones,
  Lightning,
  Plant,
  PersonSimpleTaiChi,
  Sparkle,
  VideoCamera,
  Wind,
} from '@phosphor-icons/react/dist/ssr';

import { legoBrick, legoDelay } from './lego-style';
import { Art, C, MediaPlaceholder, SectionEyebrow } from './shared';

const LEAD = {
  n: '01',
  icon: Broadcast,
  title: '5-Day Live (Peri)Menopause Reset Challenge',
  value: '(₹2,500 Value)',
  body: 'Experience five expert-led live sessions combining movement, mindfulness and practical nutrition guidance to help ease common symptoms and feel more in control of your body.',
  tag: 'LIVE ACCESS · INCLUDED',
};

const BONUSES = [
  {
    n: '02',
    cover: '/images/guide-nutrition.png',
    title: 'Seed Cycling Made Simple',
    icon: Plant,
    value: '(₹497 Value)',
    body: 'A practical guide to the key seeds, how to use them and simple ways to include them in your meals to better support your body through hormonal changes.',
  },
  {
    n: '03',
    cover: '/images/guide-mobility.png',
    title: 'The One-Stretch Morning Mobility Reset',
    icon: PersonSimpleTaiChi,
    value: '(₹497 Value)',
    body: 'One simple, guided stretch you can practise at home whenever your shoulders, joints or body feel stiff and reluctant to move.',
  },
  {
    n: '04',
    cover: '/images/guide-sleep.png',
    title: 'The 4-7-8 Calm & Sleep Breathwork Guide',
    icon: Wind,
    value: '(₹497 Value)',
    body: 'Learn a simple breathing practice you can use when anxiety rises, your mind feels restless or you struggle to settle down for sleep.',
  },
  {
    n: '05',
    /* ⚠️ NO COVER SUPPLIED. The other four guides have one, so this card falls
       back to a labelled placeholder rather than shipping a gap nobody sees.
       Ask for a matching square mockup. */
    cover: '',
    title: 'The 5-Minute Facial De-Puffing Routine',
    icon: Sparkle,
    value: '(₹497 Value)',
    body: 'A simple face-yoga routine to support lymphatic drainage, ease facial puffiness and help your face look fresher and more relaxed.',
  },
  {
    n: '06',
    cover: '/images/guide-nervous-system.png',
    title: 'Prerna’s Guided Breathwork & Meditation Collection',
    icon: Headphones,
    value: '(₹997 Value)',
    body: 'Get exclusive access to Prerna’s guided breathwork and meditation recordings, so you can return to a calmer, more grounded state whenever you need it.',
  },
];

const TAG = 'INSTANT ACCESS · INCLUDED';

/* A bed, not a bare glyph: at this size an unbedded icon reads as debris next
   to a 26px ordinal. Gold-pale is the page's established icon bed. */
function IconBed({ icon: Glyph, size = 'md' }: { icon: Icon; size?: 'md' | 'lg' }) {
  const box = size === 'lg' ? 'h-14 w-14' : 'h-11 w-11';
  const glyph = size === 'lg' ? 'h-7 w-7' : 'h-5 w-5';
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-2xl ${box}`}
      style={{ background: C.goldPale, border: `1px solid ${C.line}` }}
      aria-hidden="true"
    >
      <Glyph weight="duotone" className={glyph} style={{ color: C.goldInk }} />
    </span>
  );
}

function AccessTag({ text, icon }: { text: string; icon: 'live' | 'instant' }) {
  const Icon = icon === 'live' ? VideoCamera : Lightning;
  return (
    <span
      className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em]"
      style={{ background: C.canvas, border: `1px solid ${C.line}`, color: C.inkSoft }}
    >
      <Icon weight="fill" className="h-3 w-3" style={{ color: C.goldInk }} />
      {text}
      <CheckCircle weight="fill" className="h-3 w-3" style={{ color: C.coralInk }} />
    </span>
  );
}

export default function Toolkit() {
  return (
    <section className="px-4 py-12 sm:py-20 lg:py-24" style={{ background: C.canvas }}>
      <div className="mx-auto max-w-[820px] text-center">
        <div className="mb-5 flex justify-center">
          <SectionEyebrow text="GET INSTANT ACCESS TO" />
        </div>
        <h2
          className="font-display text-[clamp(28px,4.4vw,46px)] font-semibold leading-[1.14]"
          style={{ color: C.ink, textWrap: 'balance' } as React.CSSProperties}
        >
          Your 5-Day (Peri)menopause Reset &amp;{' '}
          <span style={{ color: C.goldDeep }}>Complete Mind-Body Support Toolkit</span>
        </h2>
      </div>

      <div className="mx-auto mt-14 max-w-[1080px]">
        {/* ── the lead item ─────────────────────────────────────────────── */}
        <article
          data-lego=""
          className="lego-hover-soft rounded-[28px] p-8 sm:p-10"
          style={{
            ...legoDelay(0, 90),
            background: `linear-gradient(160deg, ${C.goldWash} 0%, ${C.canvas} 62%)`,
            border: `1px solid ${C.lineStrong}`,
            boxShadow: '0 24px 54px -32px rgba(31,50,92,0.3)',
          }}
        >
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8">
            <div className="flex shrink-0 flex-col items-start gap-4">
              <span
                className="font-display text-[44px] font-semibold leading-none"
                style={{ color: C.goldDeep }}
              >
                {LEAD.n}
              </span>
              <IconBed icon={LEAD.icon} size="lg" />
            </div>
            <div className="min-w-0 flex-1">
              <h3
                className="font-display text-[24px] font-semibold leading-snug sm:text-[27px]"
                style={{ color: C.ink }}
              >
                {LEAD.title}
              </h3>
              <p className="mt-1.5 font-display text-[18px] font-semibold" style={{ color: C.goldDeep }}>
                {LEAD.value}
              </p>
              <p className="mt-3.5 max-w-[620px] text-[15px] leading-relaxed" style={{ color: C.inkSoft }}>
                {LEAD.body}
              </p>
              <div className="mt-6">
                <AccessTag text={LEAD.tag} icon="live" />
              </div>
            </div>

            {/* Reserved at the ratio the real still will use, so nothing
                reflows when the art lands. */}
            <Art
              src="/images/challenge-days.png"
              alt="The five day cards: Mat Pilates and Mobility, Gentle Yoga and Breathwork, Mindfulness and Sound Healing, Face Yoga and De-Puffing, Nutrition and Integration"
              ratio="1 / 1"
              sizes="(min-width: 640px) 240px, 100vw"
              className="w-full sm:w-[240px] sm:shrink-0"
            />
          </div>
        </article>

        {/* ── the five guides ──────────────────────────────────────────── */}
        <ul className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-6">
          {BONUSES.map((b, i) => {
            /* Five cards strand orphans at both breakpoints, and the fix is
               different at each.

               lg: five into three columns leaves TWO stranded hard-left with a
               column-wide hole beside them. So the desktop grid is SIX columns
               with a 2-column span per card — visually identical to three
               columns, but the half-column offset now exists, so the pair
               starts at column 2 and sits dead centre. A 3-column grid cannot
               do this: centring two items across three tracks needs fractional
               placement.

               sm: five into two columns leaves ONE. It spans the row but is
               width-capped and centred, so it reads as a normal card. */
            const startsTail = i === BONUSES.length - 2;
            const isOrphan = i === BONUSES.length - 1;
            const placement = [
              'lg:col-span-2',
              startsTail ? 'lg:col-start-2' : '',
              isOrphan ? 'sm:col-span-2 sm:mx-auto sm:w-full sm:max-w-[calc(50%-10px)]' : '',
              isOrphan ? 'lg:col-span-2 lg:mx-0 lg:max-w-none' : '',
            ]
              .filter(Boolean)
              .join(' ');
            return (
              <li
                key={b.n}
                data-lego=""
                className={`lego-hover flex flex-col rounded-3xl p-7 ${placement}`}
                style={{
                  ...legoBrick(i + 1, 80),
                  background: C.canvasAlt,
                  border: `1px solid ${C.line}`,
                }}
              >
                {/* Cover art sits above the title, which is where the guides'
                    real covers were always going to go. */}
                {b.cover ? (
                  <Art
                    src={b.cover}
                    alt={`${b.title} guide cover`}
                    ratio="1 / 1"
                    sizes="(min-width: 1024px) 300px, (min-width: 640px) 45vw, 100vw"
                    className="mb-6"
                  />
                ) : (
                  <MediaPlaceholder ratio="1 / 1" label="Guide cover" className="mb-6" />
                )}

                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <IconBed icon={b.icon} />
                    <span
                      className="font-display text-[26px] font-semibold leading-none"
                      style={{ color: C.goldDeep }}
                    >
                      {b.n}
                    </span>
                  </div>
                  <span
                    className="font-display text-[16px] font-semibold"
                    style={{ color: C.goldDeep }}
                  >
                    {b.value}
                  </span>
                </div>
                <h3
                  className="mt-4 font-display text-[19px] font-semibold leading-snug"
                  style={{ color: C.ink }}
                >
                  {b.title}
                </h3>
                <p
                  className="mt-2.5 flex-1 text-[14px] leading-relaxed"
                  style={{ color: C.inkSoft }}
                >
                  {b.body}
                </p>
                <div className="mt-6">
                  <AccessTag text={TAG} icon="instant" />
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
