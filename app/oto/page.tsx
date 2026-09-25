'use client';

/**
 * /oto — choose your pass.
 *
 * The step the funnel gained: Ads → Landing → OTO → Checkout → Thank you. The
 * landing page sells one price and sends everyone here; this page is where the
 * buyer picks a tier, and every screen after it reads that choice from the URL.
 *
 * ══ SELECTION, NOT TWO BUTTONS ════════════════════════════════════════════
 *
 * Both cards are one radiogroup with a single CTA beneath them, rather than a
 * button per card. Two buttons on a two-card page makes the reader compare
 * *actions* when the thing they are actually choosing is a *pass*; and it
 * doubles the number of ways to leave, so the page's own recommendation stops
 * meaning anything. One CTA, and the price in it moves with the selection.
 *
 * Base is selected on arrival, because the copy's "Total due today ₹497" says
 * so — the VIP card is marked Recommended and has to earn the upgrade rather
 * than being pre-ticked into the cart.
 *
 * ══ NOTHING IS CHARGED HERE ═══════════════════════════════════════════════
 *
 * The deck says so and the code keeps the promise: this page collects no
 * details and touches no payment API. It hands ?tier= to /checkout, which is
 * still the only place money moves.
 *
 * ══ MOBILE ════════════════════════════════════════════════════════════════
 *
 * Cards stack below lg and sit side by side from lg, where there is room for
 * two 8-item lists without either column going narrow enough to wrap every
 * bullet. The CTA and the running total are in a docked bar on phones so the
 * price is never scrolled past, and inline from lg where the whole page fits.
 */

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';

import {
  ArrowRight,
  CaretRight,
  Check,
  CheckCircle,
  Clock,
  Lock,
  ShieldCheck,
  Star,
  VideoCamera,
} from '@phosphor-icons/react/dist/ssr';

import BrandMark from '../_landing/brand-mark';
import {
  CHECKOUT_HREF,
  CTA_LABEL,
  OTO_DEADLINE,
  PRICE,
  SESSION_TIMES_TZ,
  START_DATE,
  TIERS,
  TIER_VIP,
  type Tier,
  type TierId,
} from '../_landing/offer';
import { C } from '../_landing/shared';
import PaymentLogos from '@/components/PaymentLogos';
import SiteFooter from '@/components/SiteFooter';
import {
  NEXT_STEPS,
  OTO_DECK,
  OTO_HEADING,
  PAYMENT_NOTE,
  PROMISE_BODY,
  PROMISE_HEADING,
  RECOMMENDED_TIER,
  SECURE_LINE,
  TIER_BULLETS,
  TIER_EYEBROW,
  TIER_FOOTNOTE,
} from './copy';

const FACTS = [
  { icon: Clock, text: SESSION_TIMES_TZ },
  { icon: VideoCamera, text: 'Live on Zoom' },
];

export default function OtoPage() {
  const [selected, setSelected] = useState<TierId>('standard');
  const tier = useMemo(() => TIERS.find((t) => t.id === selected) ?? TIERS[0], [selected]);

  /* ══ The footer spacer ════════════════════════════════════════════════
     The docked bar is fixed, so it took the bottom ~110px of every screen
     INCLUDING the last one — which meant the footer's operator address, the
     contact details and the policy links were permanently underneath it with
     no way to scroll them clear.
     Unlike the landing page's bar, this one cannot simply hide at the footer:
     the inline total and CTA only exist from lg up, so hiding it on a phone
     would leave the bottom of the page with no way to buy at all. So the
     document gets taller instead, by exactly the height of the bar.
     MEASURED, not a guessed padding value: the bar is two lines on a phone and
     one from sm, it grows if the price string gets longer, and it grows again
     with the iOS safe-area inset. A hardcoded number is wrong on some device
     the day the copy changes. It reads 0 from lg, where the bar is
     display:none and offsetHeight is 0, so the spacer disappears on desktop
     without needing its own breakpoint. */
  const barRef = useRef<HTMLDivElement>(null);
  const [barH, setBarH] = useState(0);

  useEffect(() => {
    const el = barRef.current;
    if (!el) return;
    const measure = () => setBarH(el.offsetHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);

  return (
    <main className="min-h-screen" style={{ background: C.canvasAlt }}>
      {/* The mark and nothing else. There is no way back to the landing page
          from here on purpose: the reader has already read it, and the only
          links that matter now are the two passes. */}
      <header className="px-4 py-4 sm:px-6" style={{ background: C.navyDeep }}>
        <div className="mx-auto flex max-w-[1080px] items-center justify-center sm:justify-start">
          <BrandMark height={34} onDark priority />
        </div>
      </header>

      {/* Ordinary bottom padding. Clearing the docked bar is the spacer's job
          now (see barH above), and doing it here as well left a visible gap
          between the last section and the footer. */}
      <section className="px-4 pb-14 pt-10 sm:px-5 md:px-8 lg:pb-20 lg:pt-14">
        <div className="mx-auto max-w-[1080px]">
          <Masthead />

          {/* role=radiogroup, not a list: the cards are one choice between two
              options, and that is what a screen reader should be told. */}
          <div
            role="radiogroup"
            aria-label="Choose your pass"
            className="mt-9 grid items-start gap-4 sm:gap-5 lg:grid-cols-2"
          >
            {TIERS.map((t) => (
              <TierCard
                key={t.id}
                tier={t}
                selected={selected === t.id}
                recommended={t.id === RECOMMENDED_TIER}
                onSelect={() => setSelected(t.id)}
              />
            ))}
          </div>

          {/* Inline from lg, where the page is short enough that a docked bar
              would be chrome for its own sake. */}
          <div className="mt-9 hidden lg:block">
            <Checkout tier={tier} />
          </div>

          <NextSteps />
          <Promise />
        </div>
      </section>

      <SiteFooter />

      {/* Exactly the bar's height, so the last screen of the document is empty
          space rather than the footer with its bottom third covered. */}
      <div aria-hidden style={{ height: barH }} />

      {/* Docked below lg. Same component as the inline one, so the total and
          the label cannot drift between the two. */}
      <div
        ref={barRef}
        className="fixed inset-x-0 bottom-0 z-50 lg:hidden"
        style={{
          background: 'rgba(255,253,248,0.96)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          borderTop: `1px solid ${C.lineStrong}`,
          boxShadow: '0 -12px 36px -24px rgba(31,50,92,0.45)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        <div className="mx-auto max-w-[1080px] px-4 py-3">
          <Checkout tier={tier} compact />
        </div>
      </div>
    </main>
  );
}

/* ── The masthead ──────────────────────────────────────────────────────── */
function Masthead() {
  return (
    <div className="text-center">
      <span
        className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[10.5px] font-bold uppercase tracking-[0.18em]"
        style={{ background: C.goldWash, color: C.goldInk }}
      >
        <CheckCircle weight="fill" className="h-3 w-3 shrink-0" />
        Step 1 of 2
      </span>

      <h1
        className="mt-4 font-display text-[28px] font-semibold leading-[1.12] sm:text-[38px] lg:text-[44px]"
        style={{ color: C.ink, textWrap: 'balance' } as React.CSSProperties}
      >
        {OTO_HEADING}
      </h1>

      <p
        className="mx-auto mt-4 max-w-[620px] text-[15px] leading-relaxed sm:text-[16.5px]"
        style={{ color: C.inkSoft }}
      >
        {OTO_DECK}
      </p>

      {/* Start date, timings, Zoom. START_DATE comes from the env, so this line
          cannot fall out of step with the landing page or the checkout — see
          the note in copy.ts about the source copy's hard-coded date. */}
      <ul
        className="mx-auto mt-6 flex max-w-[680px] flex-col items-stretch gap-px overflow-hidden rounded-2xl sm:flex-row"
        style={{ background: C.line, border: `1px solid ${C.line}` }}
      >
        <li
          className="flex flex-1 items-center justify-center gap-2 px-4 py-3 text-[13px] font-semibold"
          style={{ background: C.canvas, color: C.ink }}
        >
          <Star weight="fill" className="h-3.5 w-3.5 shrink-0" style={{ color: C.goldInk }} />
          Starts {START_DATE}
        </li>
        {FACTS.map(({ icon: Icon, text }) => (
          <li
            key={text}
            className="flex flex-1 items-center justify-center gap-2 px-4 py-3 text-[13px] font-semibold"
            style={{ background: C.canvas, color: C.ink }}
          >
            <Icon weight="bold" className="h-3.5 w-3.5 shrink-0" style={{ color: C.goldInk }} />
            {text}
          </li>
        ))}
      </ul>

      {/* Only rendered when a real date is configured. See OTO_DEADLINE. */}
      {OTO_DEADLINE && (
        <p className="mt-4 text-[13.5px] font-semibold" style={{ color: C.coralInk }}>
          {PRICE} until {OTO_DEADLINE} · then {TIER_VIP.price}
        </p>
      )}
    </div>
  );
}

/* ── One pass ──────────────────────────────────────────────────────────────
 *
 * The whole card is the control. A radio the size of a card is far easier to
 * hit on a phone than a 20px dot, and it means the tap target matches the
 * thing being chosen rather than a decoration beside it.
 *
 * It is a <button>, not a label-wrapped input: the selected state drives
 * layout (border weight, ring, tick) and aria-checked on a real button gives a
 * screen reader the same information without fighting an invisible input's own
 * focus ring.
 */
function TierCard({
  tier,
  selected,
  recommended,
  onSelect,
}: {
  tier: Tier;
  selected: boolean;
  recommended: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className="lego-press relative flex h-full w-full flex-col rounded-3xl p-6 text-left transition-shadow sm:p-7"
      style={{
        background: C.canvas,
        /* The border stays 1px at every state and the selected ring is an
           INSET shadow on top of it. A border that thickens on selection
           changes the content box, which reflows the card's own text and
           nudges the card beside it — on a two-card row that reads as the
           layout flinching every time you change your mind. */
        border: `1px solid ${selected ? C.ink : C.line}`,
        boxShadow: selected
          ? `inset 0 0 0 1px ${C.ink}, 0 24px 54px -32px rgba(31,50,92,0.38)`
          : '0 14px 34px -28px rgba(31,50,92,0.18)',
      }}
    >
      <span className="flex h-full flex-col">
        <span className="flex items-start justify-between gap-3">
          <span className="min-w-0">
            <span
              className="block text-[10.5px] font-bold uppercase tracking-[0.16em]"
              style={{ color: recommended ? C.coralInk : C.inkSoft }}
            >
              {recommended ? 'Recommended' : TIER_EYEBROW[tier.id]}
            </span>
            <span
              className="mt-2 block font-display text-[20px] font-semibold leading-snug sm:text-[23px]"
              style={{ color: C.ink }}
            >
              {tier.name}
            </span>
            {recommended && (
              <span
                className="mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em]"
                style={{ background: C.coralBed, color: C.coralInk }}
              >
                {TIER_EYEBROW[tier.id]}
              </span>
            )}
          </span>

          {/* The radio dot. Decorative — aria-checked on the button is what
              carries the state — so it is hidden from assistive tech. */}
          <span
            aria-hidden
            className="grid h-6 w-6 shrink-0 place-items-center rounded-full"
            style={{
              background: selected ? C.ink : C.canvas,
              border: selected ? `1px solid ${C.ink}` : `1.5px solid ${C.lineStrong}`,
            }}
          >
            {selected && <Check weight="bold" className="h-3.5 w-3.5" style={{ color: C.canvas }} />}
          </span>
        </span>

        {/* Price. Struck anchor, then the figure, on a hairline rule so the
            money reads as a fact about the pass rather than a headline. */}
        <span
          className="mt-5 flex flex-wrap items-baseline gap-x-2.5 gap-y-1 border-t pt-5"
          style={{ borderColor: C.line }}
        >
          <span
            className="font-display text-[34px] font-semibold leading-none tabular-nums sm:text-[38px]"
            style={{ color: C.goldDeep }}
          >
            {tier.hasAnchor && <span className="sr-only">Now </span>}
            {tier.price}
          </span>
          {tier.hasAnchor && (
            <s
              className="font-display text-[17px] font-semibold tabular-nums decoration-[2px]"
              style={{ color: C.inkSoft, textDecorationColor: C.coralInk }}
            >
              <span className="sr-only">Was </span>
              {tier.anchor}
            </s>
          )}
        </span>

        {/* The VIP card's "total, not on top" line. It is the single most
            important sentence on this page: without it the reader reads ₹997
            as an addition to ₹497 and the upgrade looks like ₹1,494. */}
        {tier.id === 'vip' && (
          <span className="mt-2.5 text-[13px] font-semibold" style={{ color: C.ink }}>
            {tier.price} {TIER_FOOTNOTE.vip}
          </span>
        )}

        <ul className="mt-5 flex flex-1 flex-col gap-2.5">
          {TIER_BULLETS[tier.id].map((line) => (
            <li key={line} className="flex items-start gap-2.5">
              <span
                className="mt-[3px] grid h-4 w-4 shrink-0 place-items-center rounded-full"
                style={{ background: recommended ? C.coralBed : C.goldPale }}
              >
                <Check
                  weight="bold"
                  className="h-2.5 w-2.5"
                  style={{ color: recommended ? C.coralInk : C.goldInk }}
                />
              </span>
              <span className="text-[14px] leading-relaxed" style={{ color: C.inkSoft }}>
                {line}
              </span>
            </li>
          ))}
        </ul>

        {tier.id === 'standard' && (
          <span
            className="mt-5 border-t pt-4 text-[12.5px]"
            style={{ borderColor: C.line, color: C.inkSoft }}
          >
            {TIER_FOOTNOTE.standard}
          </span>
        )}
      </span>
    </button>
  );
}

/* ── The running total and the one CTA ─────────────────────────────────── */
function Checkout({ tier, compact = false }: { tier: Tier; compact?: boolean }) {
  /* The tier rides in the query string as an ID. create-order resolves it
     server side and charges what IT finds, so a hand-edited URL can only ever
     select the other real pass. */
  const href = `${CHECKOUT_HREF}?tier=${tier.id}`;
  const label = tier.id === 'standard' ? CTA_LABEL : `Start Your 5-Day Reset · ${tier.price}`;

  return (
    <div
      className={compact ? '' : 'rounded-3xl p-6 sm:p-7'}
      style={
        compact
          ? undefined
          : { background: C.canvas, border: `1px solid ${C.line}` }
      }
    >
      <div
        className={
          compact
            ? 'flex flex-col gap-2.5'
            : 'flex flex-col items-center gap-4 sm:flex-row sm:justify-between'
        }
      >
        <p
          className="flex flex-wrap items-baseline justify-center gap-x-2 gap-y-1 sm:justify-start"
          style={{ color: C.inkSoft }}
        >
          <span className="text-[11px] font-bold uppercase tracking-[0.16em]">
            Total due today
          </span>
          {tier.hasAnchor && (
            <s
              className="text-[13px] tabular-nums decoration-[1.5px]"
              style={{ textDecorationColor: C.coralInk }}
            >
              <span className="sr-only">Was </span>
              {tier.anchor}
            </s>
          )}
          <span
            className="font-display text-[22px] font-semibold tabular-nums"
            style={{ color: C.goldDeep }}
          >
            {tier.hasAnchor && <span className="sr-only">Now </span>}
            {tier.price}
          </span>
        </p>

        <Link
          href={href}
          data-cta
          className={`lego-press cta-shimmer group inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full px-6 font-body text-[15px] font-bold ${
            compact ? 'w-full' : 'w-full sm:w-auto sm:px-8'
          }`}
          style={{
            background: C.ink,
            color: C.canvas,
            ['--shimmer' as string]: 'rgba(242,221,182,0.30)',
          }}
        >
          <span className="inline-flex items-center gap-2">
            {label}
            <ArrowRight
              weight="bold"
              className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
            />
          </span>
        </Link>
      </div>

      {/* The compact bar carries the guarantee only. The secure line and the
          payment-collector note are on the page itself, where there is room to
          read them — repeating either in a docked bar is noise. */}
      <p
        className={`flex items-center justify-center gap-1.5 text-center font-medium ${
          compact ? 'mt-0 text-[11.5px]' : 'mt-4 text-[12.5px]'
        }`}
        style={{ color: C.inkSoft }}
      >
        <ShieldCheck weight="fill" className="h-3.5 w-3.5 shrink-0" style={{ color: C.coralInk }} />
        Nothing is charged until the next page
      </p>

      {!compact && (
        <>
          <p
            className="mt-3 flex items-center justify-center gap-1.5 text-center text-[11.5px] font-semibold uppercase tracking-[0.08em]"
            style={{ color: C.inkSoft }}
          >
            <Lock weight="fill" className="h-3.5 w-3.5 shrink-0" style={{ color: C.goldInk }} />
            {SECURE_LINE}
          </p>
          <p
            className="mx-auto mt-4 max-w-[560px] text-center text-[12px] leading-relaxed"
            style={{ color: C.inkSoft }}
          >
            {PAYMENT_NOTE}
          </p>
          <div className="mt-5">
            <PaymentLogos size="full" />
          </div>
        </>
      )}
    </div>
  );
}

/* ── What happens next ─────────────────────────────────────────────────── */
function NextSteps() {
  return (
    <div className="mt-12">
      <h2
        className="text-center font-display text-[22px] font-semibold sm:text-[26px]"
        style={{ color: C.ink }}
      >
        What happens next
      </h2>
      <ol className="mx-auto mt-6 grid max-w-[880px] gap-3 sm:grid-cols-3">
        {NEXT_STEPS.map((step, i) => (
          <li
            key={step}
            className="flex items-start gap-3 rounded-2xl px-5 py-4"
            style={{ background: C.canvas, border: `1px solid ${C.line}` }}
          >
            <span
              className="grid h-7 w-7 shrink-0 place-items-center rounded-full font-display text-[13px] font-semibold"
              style={{ background: C.goldPale, color: C.goldInk }}
            >
              {i + 1}
            </span>
            <span className="text-[14px] leading-relaxed" style={{ color: C.inkSoft }}>
              {step}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

/* ── The promise ───────────────────────────────────────────────────────────
   Same beat as the landing page's, deliberately: this is the screen where the
   reader is deciding how much to spend, which is exactly where the cost of
   being wrong needs removing. */
function Promise() {
  return (
    <div
      className="mx-auto mt-10 max-w-[760px] rounded-3xl px-6 py-9 text-center sm:px-10"
      style={{ background: C.canvas, border: `1px solid ${C.line}` }}
    >
      <span
        className="inline-grid h-11 w-11 place-items-center rounded-full"
        style={{ background: C.goldPale, border: `1px solid ${C.lineStrong}` }}
      >
        <ShieldCheck weight="duotone" className="h-5 w-5" style={{ color: C.goldInk }} />
      </span>
      <h2
        className="mt-4 font-display text-[22px] font-semibold sm:text-[26px]"
        style={{ color: C.ink }}
      >
        {PROMISE_HEADING}
      </h2>
      <p
        className="mx-auto mt-3 max-w-[520px] text-[15px] leading-relaxed sm:text-[16px]"
        style={{ color: C.inkSoft }}
      >
        {PROMISE_BODY}
      </p>
      <p
        className="mt-5 inline-flex items-center gap-2 text-[13px] font-semibold"
        style={{ color: C.ink }}
      >
        <CaretRight weight="bold" className="h-3.5 w-3.5" style={{ color: C.coralInk }} />
        Full refund if you don&apos;t love Day One.
      </p>
    </div>
  );
}
