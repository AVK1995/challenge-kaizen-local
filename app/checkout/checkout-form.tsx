'use client';

/**
 * /checkout — 5-Day (Peri)Menopause Reset Challenge.
 *
 * Built to the same pattern as the ankita-postpartum checkout, which is the
 * house standard for challenge funnels: header with a way back, a centred
 * masthead, then a two-column body with the form on the left and a STICKY order
 * summary on the right that collapses into a tap-to-open accordion on a phone.
 *
 * Skinned in this project's own palette rather than ankita's pink, and it
 * imports the landing page's tokens instead of redeclaring them, so the two
 * pages cannot drift apart.
 *
 * ⚠️ NOT YET TRANSACTING. Razorpay is not wired on this project: there is no
 * `razorpay` dependency, no /api routes and no keys. The pay button therefore
 * checks for a configured destination and says so plainly rather than failing
 * silently. See the note above `startPayment`.
 */

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';

import {
  ArrowLeft,
  CaretDown,
  Check,
  CheckCircle,
  CreditCard,
  Lock,
  ShieldCheck,
} from '@phosphor-icons/react/dist/ssr';

import {
  CTA_NOTE,
  SESSION_TIMES_TZ,
  START_DATE,
  THANK_YOU_HREF,
  TIER_BASE,
  TIER_VIP,
  VIP_UPGRADE,
  type Tier,
} from '../_landing/offer';
import PaymentLogos from '@/components/PaymentLogos';
import SiteFooter from '@/components/SiteFooter';
import { collectSignals } from '@/lib/client-signals';
import {
  trackAddToCart,
  trackBeginCheckout,
  trackInitiateCheckout,
} from '@/lib/track';

import BrandMark from '../_landing/brand-mark';
import { C } from '../_landing/shared';
import { VIP_ADDON_BULLETS, inr, tierItems, valueTotalFor } from './included';

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

const RZP_SDK = 'https://checkout.razorpay.com/v1/checkout.js';

/* Loaded on demand rather than in the layout: it is ~100KB that only matters
   once someone actually presses pay. */
function loadRazorpay(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') return resolve(false);
    if (window.Razorpay) return resolve(true);
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${RZP_SDK}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve(true));
      existing.addEventListener('error', () => resolve(false));
      return;
    }
    const el = document.createElement('script');
    el.src = RZP_SDK;
    el.async = true;
    el.onload = () => resolve(true);
    el.onerror = () => resolve(false);
    document.body.appendChild(el);
  });
}

/* Dial codes carry the ISO-2 alongside them because Meta's CAPI wants the
   COUNTRY as a hashed ISO 3166-1 alpha-2 code, not a dial code. India first,
   then the places this audience actually lives. */
const COUNTRIES: { iso: string; dial: string; label: string }[] = [
  { iso: 'in', dial: '+91', label: 'India (+91)' },
  { iso: 'ae', dial: '+971', label: 'UAE (+971)' },
  { iso: 'gb', dial: '+44', label: 'UK (+44)' },
  { iso: 'us', dial: '+1', label: 'USA (+1)' },
  { iso: 'ca', dial: '+1', label: 'Canada (+1)' },
  { iso: 'au', dial: '+61', label: 'Australia (+61)' },
  { iso: 'sg', dial: '+65', label: 'Singapore (+65)' },
  { iso: 'qa', dial: '+974', label: 'Qatar (+974)' },
  { iso: 'om', dial: '+968', label: 'Oman (+968)' },
  { iso: 'kw', dial: '+965', label: 'Kuwait (+965)' },
  { iso: 'sa', dial: '+966', label: 'Saudi Arabia (+966)' },
  { iso: 'nz', dial: '+64', label: 'New Zealand (+64)' },
  { iso: 'za', dial: '+27', label: 'South Africa (+27)' },
  { iso: 'my', dial: '+60', label: 'Malaysia (+60)' },
  { iso: 'de', dial: '+49', label: 'Germany (+49)' },
];

/* Exactly the two the client asked for, and no "other": a two-way split is the
   point of the question. The VALUE is what travels to the webhook, so keep it
   stable even if the label is reworded. */
const OCCUPATIONS = [
  { value: 'working_professional', label: 'Working professional' },
  { value: 'homemaker', label: 'Homemaker' },
];

type Fields = {
  firstName: string;
  lastName: string;
  email: string;
  city: string;
  country: string; // ISO-2
  phone: string;
  occupation: string;
};

/**
 * The checkout form, and the VIP upsell.
 *
 * There was briefly an /oto page where the buyer chose a pass before arriving
 * here. It is gone: VIP is an ADDON on this page now, so the funnel lost a
 * screen and the upgrade is decided at the moment of payment rather than
 * before it.
 *
 * `initialTier` comes from ?tier= — read by the server component in ./page.tsx
 * and NOT with useSearchParams here. useSearchParams forces a Suspense
 * boundary, and a Suspense boundary at the top of a client page means the
 * server sends `null` and the whole checkout paints only once JS has run: a
 * blank screen, on a slow connection, on the page where money changes hands.
 *
 * After that first render the buyer owns the choice via the addon toggle. The
 * URL is only the starting position, so an ad can still point straight at a
 * VIP-selected checkout.
 *
 * All of this is DISPLAY ONLY. create-order resolves the tier again from its
 * own table and charges from that, so nothing on this page decides a price.
 */
export default function CheckoutForm({ initialTier }: { initialTier: Tier }) {
  const [wantsVip, setWantsVip] = useState(initialTier.id === 'vip');
  const tier = wantsVip ? TIER_VIP : TIER_BASE;

  const [f, setF] = useState<Fields>({
    firstName: '',
    lastName: '',
    email: '',
    city: '',
    country: 'in',
    phone: '',
    occupation: '',
  });
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState('');

  /* Arrival at the checkout. GA4 gets begin_checkout, Meta gets AddToCart.
     Meta's InitiateCheckout deliberately does NOT fire here: it waits until the
     details are valid and the payment sheet actually opens, which is a far
     stronger buying signal than a page load and is what the ads optimise on.

     This is also the only Meta event a DIRECT arrival ever gets. Someone who
     opens /checkout from an email, a retargeting ad or a bookmark never touches
     the landing page, so without this they were invisible to Meta until the pay
     tap. Ref-guarded so StrictMode's double effect and a remount cannot inflate
     the count. */
  /* The docked bar's height, measured rather than guessed, so the spacer after
     the footer matches it exactly. Reads 0 from lg where the bar is
     display:none, so the spacer disappears on desktop without its own
     breakpoint, and it re-measures when the addon row wraps at a narrow width
     or the button label changes length with the price. */
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

  const arrived = useRef(false);
  useEffect(() => {
    if (arrived.current) return;
    arrived.current = true;
    trackBeginCheckout();
    trackAddToCart();
  }, []);

  /* ── Warm the Razorpay SDK while the form is being filled ──────────────
     The pay tap used to do three things in series before anything appeared:
     download and parse ~100KB of checkout.js, POST to /api/razorpay/create-order
     and wait for Razorpay to mint an order, then open the sheet. On a mid-range
     Android on 4G that is comfortably several seconds of a button that has
     visibly been pressed and produced nothing, which is the window in which
     people tap again or leave.

     Fetching it on idle removes the first leg entirely: by the time anyone has
     typed a name, an email, a city and a phone number, the SDK is already
     parsed and `loadRazorpay()` in startPayment resolves on its first line.

     On IDLE, not on mount — the script must not compete with the form's own
     first paint. requestIdleCallback where it exists (not Safari before 16.4),
     a 1.5s timer where it does not. Failure is silent and costs nothing: the
     tap path still loads the SDK itself. */
  useEffect(() => {
    let cancelled = false;
    const warm = () => {
      if (!cancelled) void loadRazorpay();
    };

    type IdleWindow = Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (handle: number) => void;
    };
    const w = window as IdleWindow;

    if (typeof w.requestIdleCallback === 'function') {
      const id = w.requestIdleCallback(warm, { timeout: 2500 });
      return () => {
        cancelled = true;
        w.cancelIdleCallback?.(id);
      };
    }

    const t = window.setTimeout(warm, 1500);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, []);

  const v = useMemo(() => {
    const digits = f.phone.replace(/\D/g, '');
    return {
      firstName: f.firstName.trim().length > 1,
      lastName: f.lastName.trim().length > 0,
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim()),
      city: f.city.trim().length > 1,
      /* The dial code is chosen from the picker, so this validates the SUBSCRIBER
         number only: 7 to 12 digits covers every country in the list without
         pulling in libphonenumber-js. India is the strict case at exactly 10. */
      phone: f.country === 'in' ? digits.length === 10 : digits.length >= 7 && digits.length <= 12,
      occupation: f.occupation !== '',
    };
  }, [f]);
  const valid =
    v.firstName && v.lastName && v.email && v.city && v.phone && v.occupation;

  const dial = COUNTRIES.find((c) => c.iso === f.country)?.dial ?? '+91';
  /* E.164 without the plus, which is what both Meta and Razorpay expect. */
  const e164 = `${dial}${f.phone}`.replace(/\D/g, '');

  const startPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    setFailed('');
    if (!valid || busy) return;
    setBusy(true);

    /* Meta InitiateCheckout + GA4 add_payment_info. Fired before the sheet
       opens rather than after payment, because this is the moment intent is
       real: details are valid and the buyer is committing. */
    trackInitiateCheckout(
      {
        email: f.email.trim(),
        phone: e164,
        firstName: f.firstName.trim(),
        lastName: f.lastName.trim(),
        city: f.city.trim(),
        country: f.country,
        occupation: f.occupation,
      },
      tier,
    );

    try {
      const sdk = await loadRazorpay();
      if (!sdk) throw new Error('sdk');

      const res = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          firstName: f.firstName.trim(),
          lastName: f.lastName.trim(),
          email: f.email.trim(),
          phone: e164,
          city: f.city.trim(),
          country: f.country,
          occupation: f.occupation,
          /* The tier ID, not an amount. create-order resolves it against its
             own copy of the tier table and charges from that, so a hand-edited
             request can only ever select the other real pass. */
          tier: tier.id,
          ...collectSignals(),
        }),
      });
      const order = await res.json();

      if (!res.ok || !order?.ok) {
        setBusy(false);
        setFailed(
          order?.reason === 'not-configured'
            ? 'Payments are not switched on yet. Nothing has been charged.'
            : 'We could not start the payment. Please try again.',
        );
        return;
      }

      const rzp = new window.Razorpay!({
        key: order.keyId,
        order_id: order.orderId,
        amount: order.amount,
        currency: order.currency,
        name: 'Kaizen',
        /* The client's own square lockup in the payment sheet, so the brand
           does not disappear at the one moment the card details are typed.
           ABSOLUTE, not a relative path: Razorpay renders this inside an iframe
           served from its own domain, where `/brand/...` would resolve against
           checkout.razorpay.com and silently 404 into a blank tile. */
        image: `${window.location.origin}/brand/kaizen-square.jpg`,
        /* Names the tier, so the buyer sees which pass they are paying for on
           the sheet itself and on their statement line. */
        description: tier.name,
        prefill: {
          name: `${f.firstName.trim()} ${f.lastName.trim()}`.trim(),
          email: f.email.trim(),
          contact: e164,
        },
        theme: { color: C.navyDeep },
        modal: { ondismiss: () => setBusy(false) },
        /* Purchase is NOT fired here. The webhook owns it, so a UPI payer who
           finishes in their bank app and never returns is still counted. This
           handler only moves the buyer on. */
        handler: (r: { razorpay_payment_id: string }) => {
          /* Per-tier confirmation page. VIP buyers land somewhere that leads
             with what they upgraded for; see THANK_YOU_HREF. */
          window.location.href = `${THANK_YOU_HREF[tier.id]}?p=${encodeURIComponent(
            r.razorpay_payment_id,
          )}`;
        },
      });
      rzp.open();
    } catch {
      setBusy(false);
      setFailed('We could not start the payment. Please try again.');
    }
  };

  return (
    <main className="min-h-screen" style={{ background: C.canvasAlt }}>
      <Header />

      <section className="py-8 md:py-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-5 md:px-8">
          <div className="mb-8 text-center sm:mb-10 md:mb-12">
            <span
              className="inline-flex max-w-full items-center gap-1.5 rounded-full px-3 py-1.5 text-[10.5px] font-bold uppercase tracking-[0.16em]"
              style={{ background: C.goldWash, color: C.goldInk }}
            >
              <CheckCircle weight="fill" className="h-3 w-3 shrink-0" />
              5-Day (Peri)Menopause Reset
            </span>

            <h1
              className="mt-4 font-display text-[22px] font-semibold leading-tight sm:text-[28px] md:text-[34px]"
              style={{ color: C.ink, textWrap: 'balance' } as React.CSSProperties}
            >
              Add your details to confirm your seat.
            </h1>
            <p className="mt-3 text-[13px] sm:text-[13.5px]" style={{ color: C.inkSoft }}>
              Starts {START_DATE} · Live on Zoom · {SESSION_TIMES_TZ}
            </p>
          </div>

          {/* Form left, summary right. The summary is sticky on desktop so the
              price stays in view while the form is filled, and collapses to an
              accordion on a phone so it never pushes the fields below the fold. */}
          <div className="grid gap-8 lg:grid-cols-[1fr_minmax(320px,380px)] lg:items-start lg:gap-10">
            {/* id, because the docked bar's Pay button lives OUTSIDE this form
                — it has to, to be position:fixed — and submits it by
                `form="kz-checkout"`. That is what makes the docked button run
                exactly the same startPayment path as the inline one, rather
                than a second copy of the logic that can drift from it. */}
            <form
              id="kz-checkout"
              onSubmit={startPayment}
              noValidate
              className="rounded-2xl p-6 sm:p-8"
              style={{ background: C.canvas, border: `1px solid ${C.line}` }}
            >
              <p
                className="text-[10.5px] font-bold uppercase tracking-[0.2em]"
                style={{ color: C.goldInk }}
              >
                Your details
              </p>
              <h2
                className="mt-2 font-display text-[20px] font-semibold leading-snug sm:text-[22px]"
                style={{ color: C.ink }}
              >
                Where should we send your seat?
              </h2>
              <p className="mt-2 text-[12.5px] sm:text-[13px]" style={{ color: C.inkSoft }}>
                {/* Was "all six guides" — a count that was already wrong and
                    would drift again the next time the stack changed. */}
                Your Zoom link, reminders and all your guides go to these.
              </p>

              <div className="mt-6 flex flex-col gap-4">
                {/* First and last are separate fields, not one "Full name"
                    split on a space. Splitting guesses: it gives a two-word
                    surname to the first name, and a single-word entry no last
                    name at all. Meta hashes fn and ln independently, so a bad
                    guess is a permanently worse match. */}
                <div className="grid grid-cols-2 gap-4">
                  <Field
                    label="First name"
                    type="text"
                    autoComplete="given-name"
                    placeholder="First name"
                    value={f.firstName}
                    onChange={(x) => setF((s) => ({ ...s, firstName: x }))}
                    bad={touched && !v.firstName}
                  />
                  <Field
                    label="Last name"
                    type="text"
                    autoComplete="family-name"
                    placeholder="Last name"
                    value={f.lastName}
                    onChange={(x) => setF((s) => ({ ...s, lastName: x }))}
                    bad={touched && !v.lastName}
                  />
                </div>

                <Field
                  label="Email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={f.email}
                  onChange={(x) => setF((s) => ({ ...s, email: x }))}
                  bad={touched && !v.email}
                />

                <Field
                  label="Town / City"
                  type="text"
                  autoComplete="address-level2"
                  placeholder="Your town or city"
                  value={f.city}
                  onChange={(x) => setF((s) => ({ ...s, city: x }))}
                  bad={touched && !v.city}
                />

                {/* The dial code is its own control rather than something the
                    buyer types, so the number that reaches Meta and Razorpay is
                    always a clean E.164 and the country arrives as an ISO-2 we
                    can hash. */}
                <label className="block">
                  <span
                    className="mb-1.5 block text-[10.5px] font-bold uppercase tracking-[0.16em]"
                    style={{ color: C.inkSoft }}
                  >
                    WhatsApp number
                  </span>
                  <div className="flex gap-2">
                    <select
                      className="w-[124px] shrink-0 rounded-xl px-3 py-3 text-[15px] outline-none"
                      autoComplete="tel-country-code"
                      aria-label="Country dialling code"
                      value={f.country}
                      onChange={(e) => setF((s) => ({ ...s, country: e.target.value }))}
                      style={{
                        background: C.canvasAlt,
                        color: C.ink,
                        border: `1px solid ${C.line}`,
                      }}
                    >
                      {COUNTRIES.map((c) => (
                        <option key={c.iso} value={c.iso}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                    <input
                      className="w-full rounded-xl px-4 py-3 text-[15px] outline-none"
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel-national"
                      placeholder="98XXX XXXXX"
                      value={f.phone}
                      onChange={(e) => setF((s) => ({ ...s, phone: e.target.value }))}
                      aria-invalid={(touched && !v.phone) || undefined}
                      style={{
                        background: C.canvasAlt,
                        color: C.ink,
                        border: `1px solid ${touched && !v.phone ? C.coralInk : C.line}`,
                      }}
                    />
                  </div>
                  <span className="mt-1.5 block text-[11.5px]" style={{ color: C.inkSoft }}>
                    Your session reminders go here.
                  </span>
                </label>

                <label className="block">
                  <span
                    className="mb-1.5 block text-[10.5px] font-bold uppercase tracking-[0.16em]"
                    style={{ color: C.inkSoft }}
                  >
                    Are you a working professional or a homemaker?
                  </span>
                  <select
                    className="w-full rounded-xl px-4 py-3 text-[15px] outline-none"
                    value={f.occupation}
                    onChange={(e) => setF((s) => ({ ...s, occupation: e.target.value }))}
                    aria-invalid={(touched && !v.occupation) || undefined}
                    style={{
                      background: C.canvasAlt,
                      color: f.occupation ? C.ink : C.inkSoft,
                      border: `1px solid ${touched && !v.occupation ? C.coralInk : C.line}`,
                    }}
                  >
                    <option value="" disabled>
                      Select one
                    </option>
                    {OCCUPATIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              {/* The upsell, immediately above the button. It replaced a
                  whole page: there was an /oto step where the buyer chose a
                  pass first, and an order bump at the point of payment asks
                  for the same decision without costing a screen. */}
              <VipAddon on={wantsVip} onToggle={() => setWantsVip((v) => !v)} />

              {touched && !valid && (
                <p className="mt-4 text-[12.5px]" style={{ color: C.coralInk }}>
                  Please add your name, a working email and a valid number.
                </p>
              )}
              {failed && (
                <p className="mt-4 text-[12.5px]" style={{ color: C.coralInk }}>
                  {failed}
                </p>
              )}

              <button
                type="submit"
                disabled={busy}
                className="lego-press cta-shimmer mt-7 inline-flex min-h-[58px] w-full items-center justify-center rounded-2xl px-6 text-[15.5px] font-bold disabled:opacity-60"
                style={{
                  background: C.ctaGold,
                  color: C.navyDeep,
                  ['--shimmer' as string]: 'rgba(255,255,255,0.35)',
                }}
              >
                {busy ? 'Taking you to payment…' : `Pay ${tier.price} & Join the Reset`}
              </button>

              {/* The three pointers that sit under every checkout CTA we ship.
                  Dot-separated on one line, each nowrap so a narrow phone wraps
                  BETWEEN them rather than mid-phrase. */}
              <div
                className="mt-4 flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 text-[10.5px] sm:text-[11px]"
                style={{ color: C.inkSoft }}
              >
                <span className="inline-flex items-center gap-1 whitespace-nowrap sm:gap-1.5">
                  <Lock weight="fill" className="h-3 w-3 shrink-0" style={{ color: C.goldInk }} />
                  Razorpay Secured
                </span>
                <span aria-hidden="true">·</span>
                <span className="whitespace-nowrap">SSL Encrypted</span>
                <span aria-hidden="true">·</span>
                {/* Same shield as every other instance of this line on the
                    site. The two pointers beside it already carry a glyph
                    each, so this one was the odd one out here as well. */}
                <span className="inline-flex items-center gap-1 whitespace-nowrap sm:gap-1.5">
                  <ShieldCheck
                    weight="fill"
                    className="h-3 w-3 shrink-0"
                    style={{ color: C.coralInk }}
                  />
                  {CTA_NOTE}
                </span>
              </div>

              <p
                className="mt-5 text-center text-[12px] leading-relaxed"
                style={{ color: C.inkSoft }}
              >
                Your personal data will be used to process your order, support
                your experience, and for other purposes described in our{' '}
                <Link
                  href="/privacy-policy"
                  className="font-semibold underline"
                  style={{ color: C.goldInk }}
                >
                  privacy policy
                </Link>
                .
              </p>

              <PaymentMethods />
            </form>

            <div className="lg:sticky lg:top-8">
              <OrderSummary tier={tier} />
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />

      {/* Exactly the docked bar's height, so the footer's operator address,
          contact details and policy links are not permanently underneath it on
          the last screen. Measured, not a guessed padding: the bar is three
          rows on a phone and grows with the iOS safe-area inset. */}
      <div aria-hidden style={{ height: barH }} />

      {/* ══ The docked bar ══════════════════════════════════════════════
          Below lg only. From lg the pay button and the order summary are both
          on screen at once, so a fixed bar there would be chrome repeating
          what is already visible.
          It carries the SAME three things as the form, in the order they
          matter on a small screen: the upgrade, the reassurance, the button. */}
      <div
        ref={barRef}
        className="fixed inset-x-0 bottom-0 z-50 lg:hidden"
        style={{
          background: 'rgba(255,253,248,0.97)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          borderTop: `1px solid ${C.lineStrong}`,
          boxShadow: '0 -12px 36px -24px rgba(31,50,92,0.45)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        <div className="mx-auto flex max-w-[1180px] flex-col gap-2 px-4 py-3">
          <VipAddonCompact on={wantsVip} onToggle={() => setWantsVip((v) => !v)} />

          <button
            type="submit"
            form="kz-checkout"
            disabled={busy}
            className="lego-press cta-shimmer inline-flex min-h-[52px] w-full items-center justify-center rounded-2xl px-6 text-[15px] font-bold disabled:opacity-60"
            style={{
              background: C.ctaGold,
              color: C.navyDeep,
              ['--shimmer' as string]: 'rgba(255,255,255,0.35)',
            }}
          >
            {busy ? 'Taking you to payment…' : `Pay ${tier.price} & Join the Reset`}
          </button>

          <p
            className="flex items-center justify-center gap-1.5 text-center text-[11.5px] font-medium"
            style={{ color: C.inkSoft }}
          >
            <ShieldCheck
              weight="fill"
              className="h-3 w-3 shrink-0"
              style={{ color: C.coralInk }}
            />
            {CTA_NOTE}
          </p>
        </div>
      </div>
    </main>
  );
}

/* ── Header. The client's own wordmark and a way back, and nothing else:
      every other link is a way to not pay. The mark is the same BrandMark the
      landing page uses, on the same navy, so the buyer can see they are still
      on Kaizen at the moment they are asked to pay. ─────────────────────── */
function Header() {
  return (
    <header
      className="px-4 py-4 sm:px-6"
      style={{ background: C.navyDeep, color: C.onDark }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
        <BrandMark height={34} onDark priority />
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-[13px] font-semibold"
          style={{ color: C.onDarkMute }}
        >
          <ArrowLeft weight="bold" className="h-3.5 w-3.5" />
          Back
        </Link>
      </div>
    </header>
  );
}

/* ── Order summary. Ported from the ankita-postpartum checkout, which is the
      house standard, and re-skinned to this project's tokens. Same blocks in
      the same order: lead item, included list, subtotal / bonus value, the
      ruled Total, the method tile, then the guarantee line.
      Accordion below lg, always open from lg up. ───────────────────────── */
/* ── The VIP addon ─────────────────────────────────────────────────────────
 *
 * A LABEL wrapping a real checkbox, not a styled div with an onClick. Three
 * things come free with that and would all have to be hand-built otherwise:
 * the whole card is a tap target, the spacebar toggles it, and a screen reader
 * announces it as a checkbox with a checked state rather than as a paragraph.
 *
 * It sells the DIFFERENCE (+₹500), not the ₹997 total. The buyer has already
 * decided to pay the base price; the only number they are weighing here is
 * what the upgrade costs on top, and showing the total instead makes a ₹500
 * decision look like a ₹997 one.
 *
 * It is NOT pre-ticked. A pre-selected paid addon is a dark pattern, it is the
 * kind of thing Razorpay's merchant review takes a dim view of, and the refund
 * it eventually causes costs more than the upgrade earned. ?tier=vip can
 * pre-select it, because that is a link the buyer followed deliberately.
 */
/**
 * The docked bar's version of the same control.
 *
 * One row, no bullets — the full card is a few centimetres up the page and
 * repeating five bullets in a fixed bar would eat half a phone screen. It
 * keeps the three things that make it a decision: the Recommended badge, the
 * name, and what it costs on top.
 *
 * It is the SAME state as the card above, so ticking either moves both.
 */
function VipAddonCompact({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    /* Wrapper carries the animation, same reason as the full card. mx-1 insets
       it from the bar's own px-4, so the rotated corners have room and never
       reach the screen edges — see .kz-nudge-bar for why the angle is smaller
       down here than on the card. */
    <div className={`mx-1 ${on ? '' : 'kz-nudge-bar'}`}>
      <label
        className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 transition-colors duration-300"
        style={{
          background: on
            ? `linear-gradient(150deg, ${C.navyDeep} 0%, #1b2c53 100%)`
            : C.goldWash,
          border: `1.5px solid ${C.goldMid}`,
        }}
      >
        <input type="checkbox" checked={on} onChange={onToggle} className="sr-only" />

        <span
          aria-hidden
          className="grid h-[18px] w-[18px] shrink-0 place-items-center rounded transition-colors duration-300"
          style={{
            background: on ? C.gold : C.canvas,
            border: `2px solid ${on ? C.gold : C.goldMid}`,
          }}
        >
          {on && <Check weight="bold" className="h-3 w-3" style={{ color: C.navyDeep }} />}
        </span>

        <span className="flex min-w-0 flex-1 items-center gap-2">
          {!on && (
            <span
              className="hidden shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-[0.1em] min-[380px]:inline"
              style={{ background: C.coralInk, color: '#FFF7F5' }}
            >
              Recommended
            </span>
          )}
          <span
            className="truncate text-[12.5px] font-bold"
            style={{ color: on ? C.onDark : C.ink }}
          >
            {on ? 'VIP upgrade added' : 'Add VIP upgrade'}
          </span>
        </span>

        <span
          className="shrink-0 font-display text-[13.5px] font-semibold tabular-nums"
          style={{ color: on ? C.gold : C.goldDeep }}
        >
          + {VIP_UPGRADE}
        </span>
      </label>
    </div>
  );
}

/**
 * ══ THE TWO STATES ═══════════════════════════════════════════════════════
 *
 * UNSELECTED is the loud one, which is the opposite of how a form control
 * usually behaves and is the whole point. The reader is in "fill this in" mode
 * by the time they reach it; a quiet bordered box reads as another field and
 * gets scrolled past. So unselected gets the gold wash, the heavier gold
 * border, the breathing ring (see .kz-nudge) and a "tap to add" hint.
 *
 * SELECTED goes CALM: solid navy border, no animation, a plain "Added" tick.
 * Once someone has said yes, continuing to shout at them makes a settled
 * decision feel unsettled, and it is the state they will sit in while they
 * finish typing their details.
 */
function VipAddon({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  /* Selected is NAVY, not a tidier version of the cream card. It is the same
     treatment /thank-you-vip gives the upgrade, so the thing they just bought
     looks the same on the way in as it does on the way out — and a paid
     upgrade that turns into a plain white box the moment you take it feels
     like nothing happened. This is the one dark object on the checkout, which
     is exactly what makes it read as the premium one. */
  return (
    /* The wrapper exists only to carry the animation. See .kz-nudge. */
    <div className={`mt-7 rounded-2xl ${on ? '' : 'kz-nudge'}`}>
      <label
        className="lego-press flex cursor-pointer gap-3.5 rounded-2xl p-5 transition-colors duration-300"
        style={{
          background: on
            ? `linear-gradient(150deg, ${C.navyDeep} 0%, #1b2c53 100%)`
            : C.goldWash,
          border: `2px solid ${on ? C.goldMid : C.goldMid}`,
          boxShadow: on ? '0 22px 48px -28px rgba(31,50,92,0.55)' : undefined,
        }}
      >
        <input type="checkbox" checked={on} onChange={onToggle} className="sr-only" />

        {/* The box. aria-hidden because the real input above carries the state;
            this is only what it looks like. Gold fill when selected, so the
            tick reads as the reward colour rather than as a form control. */}
        <span
          aria-hidden
          className="mt-0.5 grid h-[22px] w-[22px] shrink-0 place-items-center rounded-md transition-colors duration-300"
          style={{
            background: on ? C.gold : C.canvas,
            border: `2px solid ${on ? C.gold : C.goldMid}`,
          }}
        >
          {on && <Check weight="bold" className="h-3.5 w-3.5" style={{ color: C.navyDeep }} />}
        </span>

        <span className="min-w-0 flex-1">
          {/* The badge row. Coral with a live dot while it is an offer; once
              taken, the coral badge gives way to a gold "VIP ACCESS ADDED" —
              the same words the confirmation page uses. */}
          <span className="flex flex-wrap items-center gap-2">
            {on ? (
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em]"
                style={{ background: 'rgba(242,221,182,0.18)', color: C.gold }}
              >
                <Check weight="bold" className="h-3 w-3" />
                VIP Access added
              </span>
            ) : (
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em]"
                style={{ background: C.coralInk, color: '#FFF7F5' }}
              >
                <span
                  className="lego-pulse-dot inline-block h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{
                    background: '#FFF7F5',
                    ['--dot-pulse' as string]: 'rgba(255,247,245,0.55)',
                  }}
                />
                Recommended
              </span>
            )}
          </span>

          <span className="mt-2.5 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            <span
              className="font-display text-[17px] font-semibold leading-snug sm:text-[18px]"
              style={{ color: on ? C.onDark : C.ink }}
            >
              One-time VIP upgrade
            </span>
            <span
              className="font-display text-[17px] font-semibold tabular-nums sm:text-[18px]"
              style={{ color: on ? C.gold : C.goldDeep }}
            >
              + {VIP_UPGRADE}
            </span>
          </span>

          {/* The reason, in one line, above the list. The recordings are what
              answer the objection a live-only challenge creates, and most people
              will not read five bullets before deciding. */}
          <span
            className="mt-1.5 block text-[13px] leading-snug"
            style={{ color: on ? C.onDarkMute : C.ink }}
          >
            Life happens. Keep every session to rewatch, plus four extras.
          </span>

          <span className="mt-3 flex flex-col gap-1.5">
            {VIP_ADDON_BULLETS.map((line) => (
              <span key={line} className="flex items-start gap-2">
                <Check
                  weight="bold"
                  className="mt-[3px] h-3 w-3 shrink-0"
                  style={{ color: on ? C.gold : C.goldInk }}
                />
                <span
                  className="text-[13px] leading-snug"
                  style={{ color: on ? C.onDarkMute : C.inkSoft }}
                >
                  {line}
                </span>
              </span>
            ))}
          </span>

          {/* Unselected: says what to do, because a checkbox nobody has ticked
              is ambiguous about whether it is an offer or a summary.
              Selected: says what now happens, so the card still has a last line
              and the state change reads as progress rather than as loss. */}
          <span
            className="mt-3 inline-flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-[0.1em]"
            style={{ color: on ? C.gold : C.coralInk }}
          >
            {on ? 'Added to your order' : `Tap to add for ${VIP_UPGRADE} more`}
          </span>
        </span>
      </label>
    </div>
  );
}

function OrderSummary({ tier }: { tier: Tier }) {
  const [open, setOpen] = useState(false);
  const [lead, ...bonuses] = tierItems(tier);
  const valueTotal = valueTotalFor(tier.id);
  /* `?? 0` because a LineItem's value is optional now — the session recordings
     carry no figure. The lead item always has one, but the type cannot know
     that and a silent NaN here would print "₹NaN" beside the bonuses. */
  const bonusValue = valueTotal - (lead.value ?? 0);

  return (
    <div
      className="rounded-2xl p-5 sm:p-6"
      style={{ background: C.canvas, border: `1px solid ${C.line}` }}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="order-summary-details"
        className="flex w-full items-center justify-between gap-3 text-left lg:pointer-events-none"
      >
        <span className="min-w-0">
          <span
            className="block text-[10.5px] font-bold uppercase tracking-[0.2em]"
            style={{ color: C.goldInk }}
          >
            Order summary
          </span>
          {/* Names the pass, so a VIP buyer can see on the receipt that the
              upgrade they clicked actually came through. */}
          <span
            className="mt-2 block font-display text-[20px] font-semibold leading-snug sm:text-[22px]"
            style={{ color: C.ink }}
          >
            {tier.name}
          </span>
          <span className="mt-1 block text-[12px] lg:hidden" style={{ color: C.inkSoft }}>
            {open ? 'Tap to hide details' : 'Tap to view what is included'}
          </span>
        </span>
        <CaretDown
          weight="bold"
          className={`h-4 w-4 shrink-0 transition-transform lg:hidden ${open ? 'rotate-180' : ''}`}
          style={{ color: C.inkSoft }}
        />
      </button>

      {/* Lead item, always visible: it is the thing being bought. */}
      <div
        className="mt-5 flex items-start gap-3 rounded-2xl p-3"
        style={{ background: C.canvasAlt, border: `1px solid ${C.line}` }}
      >
        <span
          className="grid h-12 w-12 shrink-0 place-items-center rounded-xl sm:h-14 sm:w-14"
          style={{ background: C.navyDeep }}
        >
          <span
            className="font-display text-[10px] font-bold uppercase tracking-[0.16em]"
            style={{ color: C.gold }}
          >
            Live
          </span>
        </span>
        <div className="min-w-0 flex-1">
          <p
            className="text-[13.5px] font-semibold leading-snug sm:text-[14px]"
            style={{ color: C.ink }}
          >
            {lead.title}
          </p>
          <p className="mt-0.5 text-[11px] sm:text-[11.5px]" style={{ color: C.inkSoft }}>
            {START_DATE} · {SESSION_TIMES_TZ}
          </p>
        </div>
        <div
          className="shrink-0 text-right font-display text-[14px] font-semibold tabular-nums sm:text-[15px]"
          style={{ color: C.ink }}
        >
          {lead.value != null && inr(lead.value)}
        </div>
      </div>

      <div id="order-summary-details" className={`${open ? 'block' : 'hidden'} lg:block`}>
        <div className="mt-4 space-y-1.5">
          <p
            className="text-[10.5px] font-bold uppercase tracking-[0.16em]"
            style={{ color: C.inkSoft }}
          >
            Free bonuses included
          </p>
          <ul className="space-y-1.5 text-[12px] sm:text-[12.5px]" style={{ color: C.inkSoft }}>
            {bonuses.map((r) => (
              <li key={r.title} className="flex items-start gap-2">
                <CheckCircle
                  weight="fill"
                  className="mt-[3px] h-3.5 w-3.5 shrink-0"
                  style={{ color: C.coralInk }}
                />
                <span className="flex-1 leading-snug">{r.title}</span>
                {/* Unpriced rows — the session recordings — render without a
                    figure rather than as "₹0". See LineItem in ./included. */}
                {r.value != null && (
                  <span className="shrink-0 font-medium tabular-nums">{inr(r.value)}</span>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className="my-5 h-px" style={{ background: C.line }} />

        <div className="space-y-2 text-[13.5px]">
          <div className="flex justify-between" style={{ color: C.inkSoft }}>
            <span>Subtotal</span>
            <span className="tabular-nums">{tier.price}</span>
          </div>
          <div className="flex justify-between" style={{ color: C.inkSoft }}>
            <span>Total bonus value</span>
            <s
              className="decoration-[2.5px] underline-offset-2 tabular-nums"
              style={{ color: C.inkSoft, textDecorationColor: C.coralInk }}
            >
              {inr(bonusValue)}
            </s>
          </div>
        </div>
      </div>

      <div className="my-4 h-px" style={{ background: C.line }} />

      {/* The ruled Total. Gold appears here and nowhere else on the page. */}
      <div
        className="flex items-baseline justify-between gap-3 rounded-2xl px-4 py-3.5"
        style={{ background: C.goldWash, border: `1px solid ${C.lineStrong}` }}
      >
        <span
          className="font-display text-[13px] font-bold uppercase tracking-[0.12em] sm:text-[14px] sm:tracking-[0.14em]"
          style={{ color: C.ink }}
        >
          Total
        </span>
        <div className="text-right">
          <div
            className="font-display text-[26px] font-semibold leading-none tabular-nums sm:text-[32px]"
            style={{ color: C.goldDeep }}
          >
            {tier.price}
          </div>
          <s className="text-[12px] tabular-nums sm:text-[12.5px]" style={{ color: C.inkSoft }}>
            {inr(valueTotal)}
          </s>
        </div>
      </div>

      {/* Method */}
      <div
        className="mt-5 flex items-start gap-3 rounded-2xl p-3"
        style={{ background: C.canvasAlt, border: `1px solid ${C.line}` }}
      >
        <CreditCard weight="duotone" className="h-5 w-5 shrink-0" style={{ color: C.goldInk }} />
        <div className="text-[12.5px]">
          <p className="font-semibold" style={{ color: C.ink }}>
            UPI · Cards · NetBanking
          </p>
          <p className="mt-0.5" style={{ color: C.inkSoft }}>
            Pay securely via Razorpay.
          </p>
        </div>
      </div>

      <p
        className="mt-4 flex items-center justify-center gap-1.5 text-center text-[12px]"
        style={{ color: C.inkSoft }}
      >
        {/* Coral, matching every other instance of this line. It was gold here,
            which is the same glyph in the accent the page uses for PRICE — so
            the guarantee read as part of the money rather than as reassurance
            against it. */}
        <ShieldCheck weight="fill" className="h-3.5 w-3.5" style={{ color: C.coralInk }} />
        {CTA_NOTE}
      </p>
    </div>
  );
}

/* ── One field. Kept as a component so every input carries the same label
      treatment, the same error state and the same focus ring. ──────────── */
function Field({
  label,
  type,
  autoComplete,
  placeholder,
  value,
  onChange,
  bad,
  note,
}: {
  label: string;
  type: string;
  autoComplete: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  bad: boolean;
  note?: string;
}) {
  return (
    <label className="block">
      <span
        className="mb-1.5 block text-[10.5px] font-bold uppercase tracking-[0.16em]"
        style={{ color: C.inkSoft }}
      >
        {label}
      </span>
      <input
        className="w-full rounded-xl px-4 py-3 text-[15px] outline-none"
        type={type}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={bad || undefined}
        style={{
          background: C.canvasAlt,
          color: C.ink,
          border: `1px solid ${bad ? C.coralInk : C.line}`,
        }}
      />
      {note && (
        <span className="mt-1.5 block text-[11.5px]" style={{ color: C.inkSoft }}>
          {note}
        </span>
      )}
    </label>
  );
}

function PaymentMethods() {
  return (
    <div
      className="mt-6 rounded-2xl p-4"
      style={{ background: C.canvasAlt, border: `1px solid ${C.line}` }}
    >
      <p
        className="mb-3 text-center text-[11px] font-bold uppercase tracking-[0.16em]"
        style={{ color: C.inkSoft }}
      >
        100% Secure &amp; Safe Payments
      </p>
      <PaymentLogos size="full" />
    </div>
  );
}

