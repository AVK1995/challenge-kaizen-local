/**
 * Shared landing primitives: the palette, and the framer-free leaf components
 * used by BOTH the static hero and the lazily-hydrated below-the-fold chunk.
 *
 * Kept animation-runtime-free on purpose so it can be imported from a Server
 * Component without dragging anything into the initial bundle.
 *
 * The colour derivation and the contrast maths behind every value here live in
 * ../../design-system.project.md. The short version:
 *
 *   cream is the environment, navy is the structure, GOLD is the one accent,
 *   and CORAL (the dot in the Kaizen logo) is the spark, used more scarcely
 *   than the accent. Three icon beds, not seven.
 */
import { ImageSquare } from '@phosphor-icons/react/dist/ssr';
import { ArrowRight } from '@phosphor-icons/react/dist/ssr';
import Image from 'next/image';
import Link from 'next/link';

import { CHECKOUT_HREF } from './offer';

export const C = {
  /* ── environment. Never pure white: #FFFDF8 is warm and does not glare ── */
  canvas: '#FFFDF8',
  /* Warm GREY, not warm gold. This is the ground under five whole sections, and
     while it was #FAF4EA the page was standing on its own accent — which is why
     gold read as the wallpaper rather than as a highlight. Kept slightly warm so
     the page does not go cold and clinical. */
  canvasAlt: '#F6F4F1',
  navyDeep: '#16264A',

  /* ── ink ── */
  ink: '#1F325C', // brand navy. 12.3:1 on the canvas
  inkSoft: '#5A6786', // secondary body. 5.6:1 on the canvas
  onDark: '#FDF9F1',
  onDarkMute: 'rgba(253,249,241,0.74)',

  /* ── gold: the accent ──────────────────────────────────────────────────
     TWO gold text tokens, and they are not interchangeable.
     goldDeep is 3.7:1 on cream — it clears the 3:1 LARGE-text bar and nothing
     else, so it is the headline highlight only. Anything at label or body size
     uses goldInk (5.3:1). Getting this backwards is how a page ends up with
     illegible eyebrows. */
  gold: '#F2DDB6', // the brand beige. The highlight word ON NAVY (9.4:1)
  /* Icon beds and washes. Neutral, for the same reason as canvasAlt: a gold bed
     behind a gold glyph makes every icon on the page a gold object. The glyph
     keeps the colour, the bed does not. */
  goldPale: '#F2F1EE',
  /* The ONE gold surface left, and it is spent on the two money moments: the
     lead item in the toolkit and the price box in the recap. Gold as a ground
     anywhere else is what made the page read as a template. */
  goldWash: '#F9F0DE',
  goldMid: '#D9B571', // hairline flourishes and rules
  goldDeep: '#A87C33', // headline highlight on light — LARGE TEXT ONLY
  goldInk: '#8A6424', // small text and eyebrows on light
  ctaGold: '#EBC98D', // CTA fill on the dark stage; navy label sits at 7.9:1

  /* ── coral: the logo dot, spent even more scarcely than the accent ── */
  coral: '#EE7778',
  coralBed: '#FDECEA',
  coralInk: '#B84447', // coral as readable text on light. 5.2:1 on canvas,
  //                        4.6:1 on coral-bed — the pills that use it are 10px,
  //                        so it has to clear 4.5 on the BED, not just the canvas.

  /* ── beds. Three, deliberately, so the page reads as one palette ── */
  navyBed: '#EDF1F8',

  /* ── rules ── */
  line: '#E7E4DF',
  lineStrong: '#D6D2CB',
} as const;

/* ══════════════════════════════════════════════════════════════════════════
 *  Eyebrow. ALWAYS uppercase, every section that has one.
 *
 *  Sections whose source copy supplies no eyebrow run without one rather than
 *  with an invented label: the copy is the client's, and a two-word kicker is
 *  still copy.
 * ═══════════════════════════════════════════════════════════════════════ */
export function SectionEyebrow({ text }: { text: string }) {
  return (
    <span
      className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[10.5px] font-bold uppercase tracking-[0.2em]"
      style={{ background: C.goldPale, color: C.goldInk }}
    >
      <span
        className="lego-pulse-dot inline-block h-1.5 w-1.5 shrink-0 rounded-full"
        style={{
          background: C.coral,
          ['--dot-pulse' as string]: 'rgba(238,119,120,0.5)',
        }}
      />
      {text}
    </span>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
 *  Section masthead: eyebrow → display headline (one lit word) → deck.
 *  Capped measure on both, centred, ≤820px. (R1 / C13.)
 * ═══════════════════════════════════════════════════════════════════════ */
export function SectionHeading({
  eyebrow,
  children,
  sub,
}: {
  eyebrow?: string;
  children: React.ReactNode;
  sub?: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-[820px] px-1 text-center">
      {eyebrow && (
        <div className="mb-5 flex justify-center">
          <SectionEyebrow text={eyebrow} />
        </div>
      )}
      <h2
        className="font-display text-[clamp(28px,4.4vw,46px)] font-semibold leading-[1.14]"
        style={{ color: C.ink, textWrap: 'balance' } as React.CSSProperties}
      >
        {children}
      </h2>
      {sub && (
        <p
          className="mx-auto mt-5 max-w-[660px] text-[15.5px] leading-relaxed sm:text-[16.5px]"
          style={{ color: C.inkSoft }}
        >
          {sub}
        </p>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
 *  The primary CTA (R3).
 *
 *  One saturated pill, generous padding, a layered navy-tinted shadow, a slow
 *  gold shimmer with a long rest, and the price IN the label. `breathe` is the
 *  idle glow and belongs to exactly one instance per screen — never to two
 *  buttons the reader can see at the same time.
 *
 *  `tone` is what lets the same component sit on cream and on navy: the fill
 *  and the LABEL colour are both tokens, because a gold fill with a white
 *  label would be unreadable.
 * ═══════════════════════════════════════════════════════════════════════ */
export function PrimaryCTA({
  href = CHECKOUT_HREF,
  label,
  tone = 'navy',
  breathe = false,
  full = false,
}: {
  href?: string;
  label: string;
  /** navy = on the cream page · gold = on the navy stage · cream = on a navy card */
  tone?: 'navy' | 'gold' | 'cream';
  breathe?: boolean;
  full?: boolean;
}) {
  const skin =
    tone === 'gold'
      ? { background: C.ctaGold, color: C.ink, shimmer: 'rgba(255,255,255,0.55)' }
      : tone === 'cream'
        ? { background: C.canvas, color: C.ink, shimmer: 'rgba(242,221,182,0.7)' }
        : { background: C.ink, color: C.canvas, shimmer: 'rgba(242,221,182,0.30)' };

  return (
    <Link
      href={href}
      data-cta
      className={`lego-press cta-shimmer group inline-flex min-h-[58px] items-center justify-center gap-2.5 rounded-full px-8 py-4 font-body text-[15.5px] font-bold ${
        breathe ? 'cta-breath' : ''
      } ${full ? 'w-full' : 'w-full sm:w-auto'}`}
      style={{
        background: skin.background,
        color: skin.color,
        boxShadow: '0 14px 30px -14px rgba(31,50,92,0.5)',
        ['--shimmer' as string]: skin.shimmer,
      }}
    >
      <span className="inline-flex items-center gap-2.5">
        {label}
        <ArrowRight
          weight="bold"
          className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
        />
      </span>
    </Link>
  );
}

/**
 * The reassurance line, welded tight under the button — never separated from
 * it, because the rush and the reassurance are one beat.
 */
export function CtaNote({ text, onDark = false }: { text: string; onDark?: boolean }) {
  return (
    <p
      className="mt-3.5 text-center text-[13.5px] font-medium"
      style={{ color: onDark ? C.onDarkMute : C.inkSoft }}
    >
      {text}
    </p>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
 *  Art: a supplied image, in the slot a MediaPlaceholder was holding.
 *
 *  Same API as MediaPlaceholder on purpose (ratio + className), so swapping one
 *  for the other never disturbs the surrounding layout.
 *
 *  `ratio` must match the asset's OWN aspect ratio. Every image on this page is
 *  a product mockup carrying text (guide titles, day names, the price seal), and
 *  object-cover in a mismatched box crops that text away. Match the ratio and
 *  nothing is ever cut.
 * ═══════════════════════════════════════════════════════════════════════ */
export function Art({
  src,
  alt,
  ratio = '1 / 1',
  className = '',
  sizes = '(min-width: 1024px) 33vw, 100vw',
  priority = false,
}: {
  src: string;
  alt: string;
  ratio?: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl ${className}`}
      style={{ aspectRatio: ratio }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover"
      />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
 *  MediaPlaceholder — a reserved slot for art that has not arrived yet.
 *
 *  Deliberately a designed object rather than a grey box: it holds the exact
 *  aspect ratio the real image will take, so nothing reflows when art lands,
 *  and it reads as "reserved" rather than as a failed image. Swap it for an
 *  <img> at the same ratio and no surrounding layout changes.
 *
 *  `label` says what belongs there, so whoever supplies the art knows what is
 *  being asked for without opening the file.
 * ═══════════════════════════════════════════════════════════════════════ */
export function MediaPlaceholder({
  ratio = '16 / 10',
  label,
  className = '',
}: {
  ratio?: string;
  label: string;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl ${className}`}
      style={{
        aspectRatio: ratio,
        background: `repeating-linear-gradient(135deg, ${C.goldPale} 0px, ${C.goldPale} 10px, ${C.canvas} 10px, ${C.canvas} 20px)`,
        border: `1px dashed ${C.lineStrong}`,
      }}
      role="img"
      aria-label={`${label}, image to be supplied`}
    >
      <ImageSquare weight="duotone" className="h-6 w-6" style={{ color: C.goldInk }} />
      <span
        className="px-3 text-center text-[10px] font-bold uppercase tracking-[0.14em]"
        style={{ color: C.goldInk }}
      >
        {label}
      </span>
    </div>
  );
}
