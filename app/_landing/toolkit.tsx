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
  BowlFood,
  Broadcast,
  ChartLineUp,
  CheckCircle,
  ClipboardText,
  Headphones,
  Lightning,
  PersonSimpleTaiChi,
  VideoCamera,
  Wind,
} from '@phosphor-icons/react/dist/ssr';

import { legoBrick, legoDelay } from './lego-style';
import { asset } from './asset-version';
import { Art, C, MediaPlaceholder, SectionEyebrow } from './shared';

/* ⚠️ THIS COVER MUST AGREE WITH below-fold.tsx DAYS. It is the one asset on the
   page that spells out the schedule in pixels, which means the copy has no way
   to correct it if it drifts — and it has drifted twice already.

   The original, /images/challenge-days.png, read "Mat Pilates and Mobility ·
   Gentle Yoga and Breathwork · Mindfulness and Sound Healing · Face Yoga and
   De-Puffing · Nutrition and Integration". Face yoga and the nutrition day are
   not part of this challenge and never were, so it was pulled (spec PRIORITY 2)
   and the slot ran empty.

   The first replacement supplied as included_01.png was the PRE-CORRECTION
   running order: it opened on Mat Pilates, put Hatha Yoga second and still
   carried a "Yoga Nidra +" day that PRIORITY 1 had removed. Only two of its
   five cards matched the page. It was rejected and re-cut.

   The file here now is the corrected one and matches DAYS exactly, day number
   for day number. If the cohort's running order ever changes again, this image
   changes WITH it or comes down — a picture that contradicts the schedule three
   screens below it is worse than no picture, because the reader cannot tell
   which one they are buying.

   ⚠️ FILENAME CASING: lowercase "included_01.png", unlike the capital-G
   "Guide_06.png"/"Guide_07.png" beside it. Windows resolves paths
   case-insensitively and Vercel does not, so a mis-cased reference works on a
   dev machine and 404s only in production. Copy names off disk. */
const LEAD = {
  n: '01',
  icon: Broadcast,
  cover: asset('/images/included_01.png'),
  title: '5-Day Live (Peri)Menopause Reset Challenge',
  rupees: 2500,
  body: 'Experience five expert-led live sessions combining movement and mindfulness to help ease common symptoms and feel more in control of your body.',
  tag: 'LIVE ACCESS · INCLUDED',
};

/* Four guides, and the covers now carry these exact titles. The revised copy
   renamed every one of them, which also resolved a real problem: the artwork
   said "Kaizen Menopause Nutrition Playbook" while the page said "Seed Cycling
   Made Simple", and every cover's "GUIDE n OF 4" badge contradicted a list of
   five bonuses. Names, count and badges now agree. */
const BONUSES = [
  {
    n: '02',
    cover: asset('/images/guide-nutrition.png'),
    coverLabel: 'Guide cover',
    title: 'Kaizen Menopause Nutrition Playbook',
    icon: BowlFood,
    rupees: 997,
    body: 'A practical guide to supporting your body through dietary changes, including techniques like seed cycling and easy recipes to make at home.',
  },
  {
    n: '03',
    cover: asset('/images/guide-mobility.png'),
    coverLabel: 'Guide cover',
    title: 'Kaizen Morning Mobility Reset',
    icon: PersonSimpleTaiChi,
    rupees: 497,
    body: 'A simple, guided routine you can practise at home whenever your shoulders, joints or body feel stiff and reluctant to move.',
  },
  {
    n: '04',
    cover: asset('/images/guide-sleep.png'),
    coverLabel: 'Guide cover',
    title: 'Pranayam for Better Sleep',
    icon: Wind,
    rupees: 497,
    body: 'Learn a simple breathing practice you can use when your mind feels restless or you struggle to sleep.',
  },
  {
    n: '05',
    cover: asset('/images/guide-nervous-system.png'),
    coverLabel: 'Guide cover',
    title: 'Nervous System Reset with Prerna',
    icon: Headphones,
    rupees: 497,
    body: 'A 10-minute guided breathwork to gently reset the nervous system by reconnecting with the five elements of nature: Earth, Water, Fire, Air, and Space.',
  },
  /* ── The two added by spec PRIORITY 4 ─────────────────────────────────────
     Both ran with a reserved placeholder slot until Kaizen supplied the covers.
     They now carry real art like the other four.

     ⚠️ THE FILENAMES ARE CAPITAL-G UNDERSCORE — "Guide_06.png", not
     "guide-06.png". They do not follow the lowercase-hyphen convention the
     other four covers use, and that matters more than it looks: Windows treats
     paths case-insensitively, so a mis-cased reference works perfectly on a dev
     machine and then 404s on Vercel, whose filesystem is case-sensitive. Copy
     the name off disk exactly rather than typing it to match the neighbours.

     Both mockups are 2400x1792 (4:3) with the book centred and wide background
     margins on either side, while the other four covers are square. They are
     rendered in the same 1:1 slot anyway: a centre crop of a 4:3 frame keeps
     the middle ~75% of the width, which is comfortably wider than the book, so
     only empty background is lost. Six cards of equal shape beats two odd ones
     out. If art ever arrives where the book fills the frame, give those two
     ratio="4 / 3" instead — see the note on Art in shared.tsx.

     Note on the stack as a whole: the spec's wording ("replace bonus item 02
     and add a fifth item") and its stated total of ₹6,788 could not both be
     satisfied — dropping the ₹997 playbook lands the stack at ₹5,294. Atul
     confirmed the TOTAL is the binding figure, so nothing was removed and both
     new items were added. 2500 + 997 + 497 + 497 + 497 + 900 + 900 = 6,788. */
  {
    n: '06',
    cover: asset('/images/Guide_06.png'),
    coverLabel: 'Symptom score card',
    title: 'Your (Peri)Menopause Symptom Score',
    icon: ChartLineUp,
    rupees: 900,
    body: 'Score yourself across pain, stress, sleep, weight and energy on Day 1, and again on Day 5. See exactly what moved in five days, in your own numbers.',
  },
  {
    n: '07',
    cover: asset('/images/Guide_07.png'),
    coverLabel: 'Readiness check card',
    title: 'Your Movement Readiness Check',
    icon: ClipboardText,
    rupees: 900,
    body: 'A short guided check on Day 1 so you know what is safe for your joints right now, and what to leave alone.',
  },
];

const TAG = 'INSTANT ACCESS · INCLUDED';

/* Values are NUMBERS on the items and formatted here, so the per-item labels
   and the total below can never disagree. They were strings — "(₹997 Value)" —
   which meant the only way to show a total was to type one. */
const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`;
const valueLabel = (n: number) => `(${inr(n)} Value)`;
const TOTAL_VALUE = inr(
  [LEAD, ...BONUSES].reduce((sum, item) => sum + item.rupees, 0),
);

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
    /* Bottom padding is deliberately SHORTER than the top. The inline CTA that
       follows is the payoff to this section's TOTAL VALUE box, not a new
       subject, so the usual full section gap was reading as a hole between
       them. See InlineCta in below-fold.tsx, which carries no top padding at
       all for the same reason. */
    <section
      className="px-4 pb-8 pt-12 sm:pb-10 sm:pt-20 lg:pb-12 lg:pt-24"
      style={{ background: C.canvas }}
    >
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
          {/* ── Lead card layout ─────────────────────────────────────────
              ONE flex row from lg up, stacked below it. The art sat full-width
              underneath the copy and left a large empty rectangle at the top
              right of the card on desktop, with the image stranded at the
              bottom; on a phone the same gap opened beside the "01".

              The art is written SECOND in the DOM so it falls naturally into
              the right-hand column at lg. `order-first lg:order-none` lifts it
              to the top of the stack below lg, which also makes the lead card
              read the same way as the six bonus cards beneath it — art first,
              then the ordinal, then the copy. */}
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:gap-10">
            <div className="flex min-w-0 flex-1 flex-col gap-6 sm:flex-row sm:items-start sm:gap-8">
              {/* Side by side on a phone, stacked from sm up. Stacked at every
                  width was what opened the dead column beside the ordinal. */}
              <div className="flex shrink-0 flex-row items-center gap-4 sm:flex-col sm:items-start">
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
                  {valueLabel(LEAD.rupees)}
                </p>
                <p className="mt-3.5 max-w-[620px] text-[15px] leading-relaxed" style={{ color: C.inkSoft }}>
                  {LEAD.body}
                </p>
                <div className="mt-6">
                  <AccessTag text={LEAD.tag} icon="live" />
                </div>
              </div>
            </div>

            {/* The five day cards.

                ratio="4 / 3" is the asset's OWN ratio, and that is deliberate:
                the fan runs edge to edge, so a square crop would slice Day 1
                off the left and Day 5 off the right. See the note on Art in
                shared.tsx — match the ratio and nothing is ever cut.

                It only joins the row at lg. Between sm and lg the card is
                already spending its width on the ordinal-plus-copy row, and a
                third column there left the text about 120px wide. Below lg it
                runs full width instead, which is where this image reads best
                anyway — every pixel of it is type. */}
            {LEAD.cover && (
              <Art
                src={LEAD.cover}
                alt="The five day cards: Day 1 Sleep Reset with Prerna, Day 2 Mat Pilates for Pain and Stiffness, Day 3 Mat Pilates for Strength and Mobility, Day 4 Hatha Yoga for Stress and Anxiety, Day 5 Breathwork for Hormonal Balance"
                ratio="4 / 3"
                sizes="(min-width: 1280px) 400px, (min-width: 1024px) 340px, 100vw"
                className="order-first w-full lg:order-none lg:w-[340px] lg:shrink-0 xl:w-[400px]"
              />
            )}
          </div>
        </article>

        {/* ── the six bonuses ──────────────────────────────────────────
            Six tiles now, so the column count drops from four to three: six
            into four leaves two stranded on the second row, six into three is
            two clean rows, and six into two is three. No orphan maths needed at
            any breakpoint. */}
        <ul className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {BONUSES.map((b, i) => {
            return (
              <li
                key={b.n}
                data-lego=""
                className="lego-hover flex flex-col rounded-3xl p-7"
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
                  <MediaPlaceholder ratio="1 / 1" label={b.coverLabel} className="mb-6" />
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
                    {valueLabel(b.rupees)}
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

        {/* The total, carried here as well as in the closing recap — the spec
            asks for ₹6,788 in both places, and a stack of seven per-item values
            with no sum makes the reader do the arithmetic themselves.

            SUMMED FROM THE ITEMS ABOVE, never typed. A hard-coded total is
            wrong the moment an item moves, and this page has already shipped
            that bug once: rows adding to ₹4,988 under a struck ₹5,485. */}
        <div
          data-lego=""
          className="mx-auto mt-8 flex max-w-[520px] flex-wrap items-center justify-center gap-x-3 gap-y-1 rounded-2xl px-6 py-5 text-center"
          style={{ background: C.goldWash, border: `1px solid ${C.lineStrong}` }}
        >
          <span
            className="text-[11px] font-bold uppercase tracking-[0.2em]"
            style={{ color: C.goldInk }}
          >
            Total value
          </span>
          <span
            className="font-display text-[26px] font-semibold leading-none tabular-nums"
            style={{ color: C.ink }}
          >
            {TOTAL_VALUE}
          </span>
        </div>
      </div>
    </section>
  );
}
