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
import { ArrowRight, ShieldCheck } from '@phosphor-icons/react/dist/ssr';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { OTO_HREF, CTA_LABEL_STICKY, GUARANTEE_LINE, START_DATE } from './offer';
import { C } from './shared';

export default function StickyCta() {
  /* TRUE, not false. This is what puts the bar in the server-rendered HTML and
     on screen at first paint rather than one effect later. */
  const [show, setShow] = useState(true);

  useEffect(() => {
    /* TWO elements, not one: the closing recap AND the footer.
       The recap alone was not enough. It hid the bar correctly while the recap
       was on screen, but `!isIntersecting` turns back to `true` the moment the
       recap scrolls off the TOP — so the bar reappeared for the whole footer
       and sat permanently over the operator address, the contact details and
       the policy links at the very bottom of the page.
       Watching both means the bar is hidden continuously from the recap to the
       end of the document, which is the behaviour the recap gate was always
       meant to describe. */
    const targets = Array.from(
      document.querySelectorAll('[data-final], [data-site-footer]'),
    );
    if (!targets.length) return;

    /* A Set rather than a boolean per target: with two observed elements the
       bar must stay hidden while EITHER is visible, and entries arrive one at
       a time. Tracking which ones are currently on screen is the only way to
       answer that without the second callback undoing the first. */
    const visible = new Set<Element>();

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) visible.add(e.target);
          else visible.delete(e.target);
        }
        setShow(visible.size === 0);
      },
      { threshold: 0 },
    );

    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, []);

  return (
    <>
      {/* No spacer, and none needed: the bar is hidden from the recap all the
          way to the end of the document (see the observer above), so it is
          never on screen at the foot of the page and there is nothing to
          reserve room for. A spacer here rendered as dead space below the
          footer, which is exactly where it was most visible. */}
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

        {/* ══ Two things only: the reassurance line, and the button ════════
            Stripped back to the reference layout. It previously carried the
            product name, the struck anchor, the live price, a discount chip,
            the saving, the start date, the session times AND the refund line —
            eight pieces of information fighting one button for a 60px strip.

            Phone   line 1  refund · start date   (centred)
                    line 2  the CTA, full width
            Desktop refund · start date   LEFT        the CTA   RIGHT

            Everything that is gone is still on the page: the anchor and the
            saving sit at all seven CTAs, the times run in the hero facts row
            and the session band. The docked bar does not need to repeat them,
            and repeating them is what made it unreadable. */}
        <div className="mx-auto flex max-w-[1180px] flex-col items-center gap-2.5 px-4 py-3 sm:flex-row sm:justify-between sm:gap-6 sm:px-8">
          {/* "100% Money-Back Guarantee · Starts 25th September", on ONE line.
              It fits at 390px where the refund sentence did not — that is the
              practical reason this bar can carry the whole line on a phone now
              and the previous wording had to be shortened to "Full refund".

              See GUARANTEE_LINE in offer.ts: this is the one place on the site
              that does not use REFUND_LINE, deliberately. */}
          <p
            className="flex items-center justify-center gap-x-1.5 whitespace-nowrap text-center text-[12.5px] font-medium sm:text-[13.5px]"
            style={{ color: C.inkSoft }}
          >
            <ShieldCheck
              weight="fill"
              className="h-3.5 w-3.5 shrink-0"
              style={{ color: C.coralInk }}
            />
            {GUARANTEE_LINE}
            <span aria-hidden style={{ color: C.lineStrong }}>
              ·
            </span>
            <span className="font-semibold" style={{ color: C.ink }}>
              Starts {START_DATE}
            </span>
          </p>

          <Link
            href={OTO_HREF}
            data-cta
            className="lego-press cta-shimmer group inline-flex min-h-[48px] w-full shrink-0 items-center justify-center gap-2 rounded-full px-5 text-[14px] font-bold sm:w-auto sm:px-7 sm:text-[15px]"
            style={{
              background: C.ink,
              color: C.canvas,
              ['--shimmer' as string]: 'rgba(242,221,182,0.30)',
            }}
          >
            <span className="inline-flex items-center gap-2">
              {CTA_LABEL_STICKY}
              <ArrowRight
                weight="bold"
                className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
              />
            </span>
          </Link>
        </div>
      </div>
    </>
  );
}
