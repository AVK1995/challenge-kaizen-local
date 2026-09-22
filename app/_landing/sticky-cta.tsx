'use client';

/**
 * The docked CTA (page chrome, not a section).
 *
 * ══ VISIBLE FROM THE FIRST SCREEN ═════════════════════════════════════════
 *
 * It used to stay hidden until the hero had scrolled off, then dock in with a
 * 0.78s brick animation on a further 0.35s delay. That is over a second of a
 * reader looking at a page whose primary action has not arrived yet, and on a
 * phone the hero is tall enough that plenty of people were scrolling through
 * the fold before the bar existed at all.
 *
 * So the pastHero gate is gone and the initial state is `true`: the bar is in
 * the first paint of the server HTML and needs no JavaScript to appear. There
 * is no entry animation and no transition on the way in.
 *
 * The one gate that REMAINS is `atFinal`. The closing recap carries a
 * full-width CTA of its own, and a docked bar duplicating a button the reader
 * can already see is two primaries, which is none. That is a hide, not a
 * reveal, so it costs nothing at load.
 */
import { ArrowRight, CalendarBlank, Clock } from '@phosphor-icons/react/dist/ssr';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import {
  CHECKOUT_HREF,
  CTA_LABEL,
  DISCOUNT_SHORT,
  HAS_ANCHOR,
  PRICE,
  PRICE_ANCHOR,
  SAVING,
  SESSION_TIMES,
  START_DATE,
} from './offer';
import { C, CtaNote } from './shared';

export default function StickyCta() {
  /* TRUE, not false. This is what puts the bar in the server-rendered HTML and
     on screen at first paint rather than one effect later. */
  const [show, setShow] = useState(true);

  useEffect(() => {
    const final = document.querySelector('[data-final]');
    if (!final) return;

    /* Only the closing recap is observed now. The hero is not, because the bar
       no longer waits for it. */
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.target === final) setShow(!e.isIntersecting);
        }
      },
      { threshold: 0 },
    );

    io.observe(final);
    return () => io.disconnect();
  }, []);

  return (
    <>
      {/* No spacer. The bar hides once the final CTA is in view (see atFinal
          above), so it is never on screen at the foot of the page and there is
          nothing to reserve room for. A spacer here rendered as dead space
          below the footer, which is exactly where it was most visible. */}
      {/* No kz-dock, and no transition on the way IN — the bar is simply there.
          The fade is kept only for the way out, when the closing recap arrives,
          because that one is a genuine change of state mid-scroll rather than
          an entrance. */}
      <div
        className={`fixed inset-x-0 bottom-0 z-50 ${
          show ? 'opacity-100' : 'pointer-events-none opacity-0 transition-opacity duration-300'
        }`}
        style={{
          background: 'rgba(255,253,248,0.94)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          borderTop: `1px solid ${C.lineStrong}`,
          boxShadow: '0 -12px 36px -24px rgba(31,50,92,0.45)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        {/* The lit hairline that makes the bar read as a lifted surface rather
            than as a panel taped to the bottom of the window. */}
        <span
          aria-hidden
          className="absolute inset-x-0 top-0 h-px"
          style={{
            background: `linear-gradient(90deg, transparent, ${C.goldMid}, transparent)`,
          }}
        />

        <div className="mx-auto flex max-w-[1180px] items-center justify-between gap-3 px-4 py-3 sm:px-8">
          <div className="min-w-0">
            {/* The anchor rides in the bar too. It is the one price point a
                reader sees for most of the page, so leaving it as a bare ₹497
                was the largest single gap BLOCKER 2 named.

                The price is on its OWN line, not appended to the title. It was
                tried inline and the title's `truncate` ate it at 390px: the bar
                showed "5-Day (Peri)Menopa…" and no price at all, which is the
                one width where it matters most. The title may truncate — it is
                the least load-bearing thing in the bar — but the price never
                can, because nothing shares its line. */}
            <p
              className="truncate font-display text-[15px] font-semibold leading-tight sm:text-[16.5px]"
              style={{ color: C.ink }}
            >
              5-Day (Peri)Menopause Reset
            </p>

            {/* flex-wrap, so a narrow phone drops the saving to its own line
                rather than clipping it. */}
            <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 leading-tight">
              {HAS_ANCHOR && (
                <s
                  className="text-[12.5px] tabular-nums decoration-[1.5px]"
                  style={{ color: C.inkSoft, textDecorationColor: C.coralInk }}
                >
                  <span className="sr-only">Was </span>
                  {PRICE_ANCHOR}
                </s>
              )}
              <span
                className="font-display text-[17px] font-semibold tabular-nums sm:text-[18px]"
                style={{ color: C.goldDeep }}
              >
                {HAS_ANCHOR && <span className="sr-only">Now </span>}
                {PRICE}
              </span>

              {HAS_ANCHOR && (
                <>
                  {/* The discount, as a SOLID coral chip rather than the tail of
                      a sentence. In the docked bar this is the only piece of
                      copy competing with a navy button for attention, and as
                      11px coral text on cream it lost every time — it read as a
                      footnote to the price rather than as the reason to act.
                      A filled chip at the same size holds its own beside the
                      button without needing to grow. */}
                  <span
                    className="inline-flex shrink-0 items-center rounded-md px-1.5 py-[3px] text-[11px] font-extrabold uppercase tracking-[0.04em] sm:text-[11.5px]"
                    style={{ background: C.coralInk, color: '#FFF7F5' }}
                  >
                    {DISCOUNT_SHORT}
                  </span>
                  {/* The rupee figure stays, but quieter: the chip carries the
                      headline and this backs it up. Hidden on the narrowest
                      phones, where the chip alone does the job. */}
                  <span
                    className="hidden text-[11px] font-semibold min-[400px]:inline sm:text-[11.5px]"
                    style={{ color: C.coralInk }}
                  >
                    Save {SAVING}
                  </span>
                </>
              )}
            </p>

            <p
              className="mt-0.5 hidden items-center gap-3 truncate text-[11.5px] sm:flex sm:text-[12px]"
              style={{ color: C.inkSoft }}
            >
              <span className="inline-flex shrink-0 items-center gap-1.5">
                <CalendarBlank weight="bold" className="h-3 w-3" style={{ color: C.goldInk }} />
                Starts {START_DATE}
              </span>
              <span className="inline-flex shrink-0 items-center gap-1.5">
                <Clock weight="bold" className="h-3 w-3" style={{ color: C.coralInk }} />
                {SESSION_TIMES}
              </span>
            </p>
          </div>

          {/* The button and its reassurance, stacked — the refund promise sits
              under EVERY other CTA on the site and this was the one that had
              none, which made the docked bar the only place a reader could act
              without being told they could change their mind. It is welded to
              the button in the same column so the two can never be separated by
              a wrap. */}
          <div className="flex shrink-0 flex-col items-center gap-1">
            <Link
              href={CHECKOUT_HREF}
              data-cta
              className="lego-press cta-shimmer group inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full px-5 text-[14px] font-bold sm:px-7 sm:text-[15px]"
              style={{
                background: C.ink,
                color: C.canvas,
                ['--shimmer' as string]: 'rgba(242,221,182,0.30)',
              }}
            >
              <span className="inline-flex items-center gap-2">
                <span className="sm:hidden">Reserve My Spot</span>
                <span className="hidden sm:inline">{CTA_LABEL}</span>
                <ArrowRight
                  weight="bold"
                  className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
                />
              </span>
            </Link>

            {/* size="sm" and the short form on phones: the full sentence under a
                170px-wide button wraps to three lines and turns the bar into a
                block. The shield is the same glyph as everywhere else, so the
                promise is recognisable even where the words are shortened. */}
            <CtaNote size="sm" className="sm:hidden" text="Full refund" />
            <CtaNote size="sm" className="hidden sm:flex" />
          </div>
        </div>
      </div>
    </>
  );
}
