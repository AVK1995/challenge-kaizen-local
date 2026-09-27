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
import { ArrowRight, ImageSquare, ShieldCheck } from '@phosphor-icons/react/dist/ssr';
import Image from 'next/image';
import Link from 'next/link';

import {
  OTO_HREF,
  DISCOUNT_BADGE,
  HAS_ANCHOR,
  PRICE,
  PRICE_ANCHOR,
  REFUND_LINE,
  SAVING_LINE,
  SAVING_LINE_DOT,
} from './offer';

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
  href = OTO_HREF,
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

/* ══════════════════════════════════════════════════════════════════════════
 *  The price anchor. ONE component, used at every price point on the page:
 *  hero, offer card, schedule band, options card, inline CTA, recap and the
 *  docked bar. (Spec BLOCKER 2.)
 *
 *  The anchor previously appeared only in the scrolling banner, which is the
 *  one place on the page a reader is least likely to read and most likely to
 *  discount. A price with nothing beside it is just a price; the same number
 *  beside ₹1,599 is a decision.
 *
 *  Three rules the sizes all obey:
 *
 *   1. The struck figure is ALWAYS smaller and muted, and the real price is
 *      always the largest thing in the block. Equal weight reads as two prices
 *      and the reader has to work out which one they pay.
 *   2. The saving is spelled out in rupees AND in per cent. "69% off" alone
 *      makes the reader do the sum; "save ₹1,102" alone hides how big it is.
 *   3. <s> carries a visually-hidden "was" and the live price a "now", so a
 *      screen reader does not read two bare numbers in a row.
 * ═══════════════════════════════════════════════════════════════════════ */
type AnchorSize = 'sm' | 'md' | 'lg';

const ANCHOR_SIZES: Record<AnchorSize, { was: string; now: string; save: string }> = {
  /* The docked bar: one line, inside a truncating row. */
  sm: { was: 'text-[12px]', now: 'text-[16px]', save: 'text-[10.5px]' },
  /* The default, under a CTA. */
  md: { was: 'text-[15px]', now: 'text-[30px]', save: 'text-[12.5px]' },
  /* The offer card and the recap, the page's two money peaks. */
  lg: { was: 'text-[19px]', now: 'text-[46px]', save: 'text-[13px]' },
};

export function PriceAnchor({
  size = 'md',
  onDark = false,
  stacked = false,
  align = 'center',
  note,
  className = '',
}: {
  size?: AnchorSize;
  onDark?: boolean;
  /** Anchor on its own line above the price, per the offer-card spec. */
  stacked?: boolean;
  align?: 'center' | 'start';
  /** e.g. "one-time", set beneath the saving line. */
  note?: string;
  className?: string;
}) {
  const s = ANCHOR_SIZES[size];
  const wasColor = onDark ? C.onDarkMute : C.inkSoft;
  const nowColor = onDark ? C.gold : C.goldDeep;
  const saveColor = onDark ? C.gold : C.coralInk;
  const items = align === 'center' ? 'items-center text-center' : 'items-start text-left';

  const was = (
    <s
      className={`${s.was} font-display font-semibold tabular-nums decoration-[2px] underline-offset-[3px]`}
      style={{ color: wasColor, textDecorationColor: C.coralInk }}
    >
      <span className="sr-only">Was </span>
      {PRICE_ANCHOR}
    </s>
  );

  const now = (
    <span
      className={`${s.now} font-display font-semibold leading-none tabular-nums`}
      style={{ color: nowColor }}
    >
      <span className="sr-only">Now </span>
      {PRICE}
    </span>
  );

  /* No anchor configured (or one set at or below the price) means there is no
     discount to claim: the struck figure and the saving line both disappear and
     the price stands alone. See HAS_ANCHOR in offer.ts — this is what stops a
     mistyped env var rendering "You save ₹-2 (-0% off)" on a live page. */
  return (
    <div className={`flex flex-col ${items} ${className}`}>
      {!HAS_ANCHOR ? (
        <span className="leading-none">{now}</span>
      ) : stacked ? (
        <>
          <span className="leading-none">{was}</span>
          <span className="mt-1.5 leading-none">{now}</span>
        </>
      ) : (
        <span className="flex flex-wrap items-baseline justify-center gap-x-2.5 gap-y-1">
          {was}
          {now}
        </span>
      )}

      {HAS_ANCHOR && (
        <span
          className={`${s.save} mt-2 font-semibold`}
          style={{ color: saveColor }}
        >
          {stacked ? SAVING_LINE_DOT : SAVING_LINE}
        </span>
      )}

      {note && (
        <span
          className="mt-1 text-[12.5px]"
          style={{ color: onDark ? C.onDarkMute : C.inkSoft }}
        >
          {note}
        </span>
      )}
    </div>
  );
}

/**
 * The hero's discount badge. Coral rather than gold: it is the one moment on
 * the page where the saving itself is the message, and gold is already doing
 * the work of "premium" three inches above it.
 */
export function DiscountBadge({ onDark = false }: { onDark?: boolean }) {
  /* Nothing to badge when there is no discount. */
  if (!HAS_ANCHOR) return null;

  return (
    <span
      className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em]"
      style={
        onDark
          ? {
              background: 'rgba(238,119,120,0.18)',
              border: '1px solid rgba(238,119,120,0.42)',
              color: '#FBC9C4',
            }
          : { background: C.coralBed, color: C.coralInk }
      }
    >
      {DISCOUNT_BADGE}
    </span>
  );
}

/**
 * The reassurance line, welded tight under the button — never separated from
 * it, because the rush and the reassurance are one beat.
 *
 * The shield ALWAYS comes with it. The refund promise ran under six different
 * buttons with a shield under exactly one of them (the hero), which made the
 * hero's version look like the real guarantee and the other five like small
 * print. One string, one glyph, one treatment, everywhere — including the
 * docked bar. Nothing calls this without the icon; that is the point of the
 * component.
 *
 * `text` defaults to the refund line because that is what it is for at every
 * call site on the site.
 */
export function CtaNote({
  text = REFUND_LINE,
  onDark = false,
  className = '',
  size = 'md',
}: {
  text?: string;
  onDark?: boolean;
  className?: string;
  /** sm is the docked bar, where the row is already three lines tall. */
  size?: 'sm' | 'md';
}) {
  const sm = size === 'sm';
  return (
    <p
      className={`flex items-center justify-center gap-1.5 text-center font-medium ${
        sm ? 'text-[11.5px]' : 'text-[13.5px]'
      } ${className}`}
      style={{ color: onDark ? C.onDarkMute : C.inkSoft }}
    >
      <ShieldCheck
        weight="fill"
        className={sm ? 'h-3 w-3 shrink-0' : 'h-4 w-4 shrink-0'}
        style={{ color: onDark ? C.coral : C.coralInk }}
      />
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
