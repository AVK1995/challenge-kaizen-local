import Link from 'next/link';

import { LEGAL } from '@/app/_landing/legal';
import { C } from '@/app/_landing/shared';

/**
 * One footer for every page: landing, checkout and thank-you.
 *
 * Ankita runs two different footers — a dark one on the landing page and a
 * light ruled strip on the checkout — which means the disclaimer only appears
 * on some pages. Here it is a single dark component so the legal text and the
 * policy links are present wherever someone lands, including on a checkout
 * they reached from an ad.
 *
 * `children` is an optional slot above the disclaimer for page-specific detail
 * (the landing page puts its brand mark and cohort dates there). Everything
 * below that slot is identical on all three pages, by design.
 *
 * The disclaimer text is the CLIENT'S OWN WORDING, moved here from the framed
 * box that used to sit above the footer on the landing page. It is legal copy:
 * do not reword it, and do not let it drift between pages, which is the whole
 * reason it lives in one component.
 */
export default function SiteFooter({ children }: { children?: React.ReactNode }) {
  return (
    <footer className="px-4 py-10 sm:px-6 sm:py-12" style={{ background: C.navyDeep }}>
      <div className="mx-auto max-w-[1180px] text-center">
        {children}

        <p
          className="text-[11px] font-bold uppercase tracking-[0.22em]"
          style={{ color: C.gold }}
        >
          {LEGAL.brand} · {LEGAL.product}
        </p>

        <p
          className="mx-auto mt-5 max-w-4xl text-[12.5px] leading-relaxed sm:text-[13.5px]"
          style={{ color: 'rgba(253,249,241,0.65)' }}
        >
          All content, live sessions and resources provided by Kaizen are for
          educational and general wellness purposes only. This is not medical
          advice and does not guarantee specific results. The challenge
          complements, but does not replace, care from your doctor or
          gynaecologist. Consult a qualified healthcare professional before
          changing your movement, nutrition or lifestyle, especially if you have
          a medical condition, take medication or HRT, or have experienced
          surgical menopause. Individual results vary based on age, medical
          history, lifestyle, attendance and consistency. This website is not
          affiliated with or endorsed by Meta. FACEBOOK and INSTAGRAM are
          trademarks of Meta Platforms, Inc.
        </p>

        <p
          className="mt-6 text-[12px] sm:text-[13px]"
          style={{ color: 'rgba(253,249,241,0.55)' }}
        >
          © {new Date().getFullYear()} {LEGAL.brand}. All rights reserved.
        </p>

        <nav
          aria-label="Legal"
          className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-[12px]"
          style={{ color: 'rgba(253,249,241,0.7)' }}
        >
          <Link href="/privacy-policy" className="hover:underline">
            Privacy Policy
          </Link>
          <span aria-hidden style={{ color: 'rgba(253,249,241,0.35)' }}>
            ·
          </span>
          <Link href="/terms-and-conditions" className="hover:underline">
            Terms and Conditions
          </Link>
          <span aria-hidden style={{ color: 'rgba(253,249,241,0.35)' }}>
            ·
          </span>
          <Link href="/refund-policy" className="hover:underline">
            Refund Policy
          </Link>
        </nav>
      </div>
    </footer>
  );
}
