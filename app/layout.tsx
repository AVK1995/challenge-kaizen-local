import type { Metadata, Viewport } from 'next';
import { Fraunces, Manrope } from 'next/font/google';

import Analytics from '@/components/Analytics';
import MetaPixel from '@/components/MetaPixel';
import LegoObserver from './_landing/lego';
import { PRICE, SESSION_TIMES_PROSE, START_DATE } from './_landing/offer';
import './globals.css';

/**
 * Two faces, three voices.
 *
 * Fraunces (display) is a warm, high-contrast serif with a soft-square
 * skeleton: it sits beside the Kaizen script wordmark without competing with
 * it, and it carries authorship, which is what a founder-led wellness offer
 * needs. It never appears below headline size.
 *
 * Manrope (body) does the reading, at a 17px base — the audience is women 40 to
 * 55 and nothing on this page relies on a hairline weight.
 *
 * The third voice, the "spec" one that labels and credentials use, is tracked
 * uppercase Manrope rather than a monospace. That is a deliberate exception to
 * the house three-voice rule: a mono reads clinical against a hand-script logo
 * and a menopause-support offer, and tracked caps do the same job in the right
 * register. Noted in design-system.project.md.
 */
/* Both faces are VARIABLE-only on Google Fonts, so neither declaration passes a
   `weight` array: next/font rejects one for a variable family ("available
   weights: variable"). Omitting it loads the whole wght axis, which is what
   every font-semibold / font-bold on the page is already asking for, and it is
   one file per family rather than five. */
const fraunces = Fraunces({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
});

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

/* Named the four modalities the page used to run — "Pilates, yoga, mindfulness
   and breathwork" — one of which (mindfulness, as a standalone day) is not on
   the schedule, and omitted sleep, which is now Day 1 and the founder-led one.
   A search result that promises a day the challenge does not run is a refund
   request with a delay on it.

   Built from the offer tokens rather than typed, so the date, the timings and
   the price cannot drift from the page they describe. SESSION_TIMES_PROSE, not
   SESSION_TIMES: an ampersand in a meta description renders as markup in some
   SERP previews. (Spec PRIORITY 1.) */
const DESCRIPTION = `A live, expert-led 5-day challenge for women navigating perimenopause and menopause. Sleep, Pilates, yoga and breathwork with Kaizen founder Prerna. Starts ${START_DATE}, ${SESSION_TIMES_PROSE}, live on Zoom, for ${PRICE}.`;

/* The live origin. Without a metadataBase Next resolves every share URL and
   every relative OG asset against localhost, so a link pasted into WhatsApp
   previews as a dead local address.

   This is deliberately defensive, because metadataBase is evaluated at BUILD
   time on every route including the generated /_not-found. A bad value here
   does not degrade the page, it fails the deploy:

     `??` does NOT catch an empty string. A host that defines the variable with
     a blank value (Vercel does exactly this when the key is added without one)
     gives new URL('') and ERR_INVALID_URL, which is what broke the build.

   So: fall back on any falsy value rather than only on null, add the protocol
   if someone pastes a bare domain, and if it still will not parse, use the
   literal rather than throwing. */
const FALLBACK_ORIGIN = 'https://challenge.kaizenwellness.app';

function resolveSiteUrl(): string {
  const raw = (process.env.NEXT_PUBLIC_SITE_URL || '').trim();
  if (!raw) return FALLBACK_ORIGIN;
  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    return new URL(withProtocol).origin;
  } catch {
    return FALLBACK_ORIGIN;
  }
}

const SITE_URL = resolveSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: '5-Day (Peri)Menopause Reset Challenge | Kaizen',
  description: DESCRIPTION,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: SITE_URL,
    title: '5-Day (Peri)Menopause Reset Challenge | Kaizen',
    description: DESCRIPTION,
    siteName: 'Kaizen',
  },
  twitter: {
    card: 'summary_large_image',
    title: '5-Day (Peri)Menopause Reset Challenge | Kaizen',
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#16264A',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={`${fraunces.variable} ${manrope.variable}`}>
      <body>
        {/* Marks the document as JS-capable BEFORE first paint, so the CSS
            scroll reveals only hide content when JS is there to reveal it.
            No-JS users and crawlers see everything, and there is no flash. */}
        <script
          dangerouslySetInnerHTML={{
            __html: "document.documentElement.classList.add('bw-js')",
          }}
        />
        {/* One set of observers for the whole document, mounted here rather
            than per-section. Renders nothing. */}
        <LegoObserver />
        <MetaPixel />
        {/* GA4 + Clarity, from env. Renders nothing until the ids are set.
            Without this every browser-side GA4 call is a silent no-op and the
            webhook reports purchases with no funnel above them. */}
        <Analytics />
        {children}
      </body>
    </html>
  );
}
