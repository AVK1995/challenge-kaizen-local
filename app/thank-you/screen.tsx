'use client';

/**
 * /thank-you — where a completed payment lands.
 *
 * Copy and section order follow the ankita-postpartum thank-you page, which is
 * the house standard: confirmation → the WhatsApp join as the ONE next step →
 * what arrives inside → be early → the policy → prep. Skinned to this
 * project's tokens.
 *
 * The page is built around the community join, not around the receipt. That is
 * the point of the design: the Zoom links live in the group, so a buyer who
 * never joins is a refund waiting to happen. Everything else on the page is
 * subordinate to that one button.
 *
 * Wording is adapted only where ankita's is factually about a different
 * product — physiotherapist becomes expert-led, postpartum recovery becomes
 * the reset. The structure and the promises are unchanged.
 */

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

import {
  ArrowRight,
  CalendarBlank,
  ChatCircleDots,
  Check,
  CheckCircle,
  Clock,
  Confetti,
  Heart,
  Megaphone,
  Notebook,
  Person,
  ShieldCheck,
  Star,
  Warning,
  WhatsappLogo,
  X,
} from '@phosphor-icons/react/dist/ssr';

import {
  SESSION_TIMES_TZ,
  START_DATE,
  TIER_BASE,
  WHATSAPP_INVITE,
  type Tier,
} from '../_landing/offer';
import { VIP_UNLOCKED } from './vip-unlocked';
import SiteFooter from '@/components/SiteFooter';
import { C } from '../_landing/shared';
import { trackPurchase } from '@/lib/track';

/* WhatsApp's own brand colours. These deliberately do NOT come from the page
   palette: the community button is the same green on every funnel we ship, so
   a buyer recognises what it opens before reading the label. */
const WA = { green: '#25D366', deep: '#128C7E' } as const;

/* Semantic, not brand: green means good and amber means caution on every page
   we ship, so they stay these values rather than following the palette. */
const GOOD_GREEN = '#059669';
const WARN_AMBER = '#D97706';

const COMMUNITY_BENEFITS: { icon: typeof CheckCircle; text: string }[] = [
  { icon: ChatCircleDots, text: 'Daily Zoom session links' },
  { icon: Megaphone, text: 'Session reminders before class' },
  { icon: Notebook, text: 'Instructions for each day' },
  { icon: Heart, text: 'Support during the 5-day reset' },
  { icon: Person, text: 'Important updates from Prerna' },
];

const POLICY_ITEMS = [
  'No rescheduling to future batches',
  'No refunds for missed live sessions',
  'Recordings are not guaranteed',
];

const PREP_ITEMS = [
  'Wear comfortable clothes for movement',
  'Keep a yoga mat or soft surface ready',
  'Be in a distraction-free space',
  'Join the community immediately',
];

/**
 * The confirmation screen, shared by both tiers.
 *
 * /thank-you and /thank-you-vip are separate routes — a buyer should be able
 * to bookmark or be re-sent the right one — but they are the same page apart
 * from one block in the hero, so the implementation lives HERE, in a plain
 * component file, and both routes render it with their own tier. Duplicating
 * five hundred lines to change a heading is how two confirmation pages drift
 * until one of them is telling a buyer the wrong policy.
 *
 * Not in either page.tsx: Next allows a route file to export only `default`
 * and a fixed set of config names, so a second named export there fails the
 * build. Hence a sibling module rather than an import between pages.
 */
export default function ThankYouScreen({
  tier,
  paymentId,
}: {
  tier: Tier;
  paymentId: string;
}) {
  const isVip = tier.id === 'vip';

  /* GA4 purchase only. Meta's Purchase and the server-side GA4 copy both come
     from the Razorpay webhook, where the payment is proven and where buyers who
     never return to this page are still counted.

     The tier goes with it, so GA4's revenue for a VIP sale is ₹997 rather than
     the base price and the two passes are separable in the item report. */
  useEffect(() => {
    if (paymentId) trackPurchase(paymentId, tier);
  }, [paymentId, tier]);

  /* The docked WhatsApp bar's height, measured rather than guessed, so the
     spacer below the footer matches it exactly. See the spacer near the bottom
     of this file. It reads 0 from md up, where the bar is display:none, and 0
     when WHATSAPP_INVITE is unset and the bar is not rendered at all — so the
     spacer costs nothing in either case. */
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
    <main style={{ background: C.canvasAlt }}>
      {/* ── Confirmation ─────────────────────────────────────────────── */}
      <section className="px-5 pb-14 pt-12 text-center md:pb-20 md:pt-20">
        <div className="mx-auto max-w-3xl">
          <span
            className="mx-auto grid h-20 w-20 place-items-center rounded-full"
            style={{ background: C.goldWash, border: `1px solid ${C.lineStrong}` }}
          >
            <Confetti weight="duotone" className="h-10 w-10" style={{ color: C.goldInk }} />
          </span>

          <span
            className="mt-6 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em]"
            style={{ background: C.goldWash, color: C.goldInk }}
          >
            <Check weight="bold" className="h-3 w-3" />
            Congrats!
          </span>

          <h1
            className="mt-5 font-display text-[30px] font-semibold leading-[1.05] tracking-tight sm:text-[44px] lg:text-[52px]"
            style={{ color: C.ink, textWrap: 'balance' } as React.CSSProperties}
          >
            Your 5-Day (Peri)Menopause Reset is{' '}
            <span style={{ color: C.goldDeep }}>Confirmed.</span>
          </h1>

          <p
            className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed sm:text-[17px]"
            style={{ color: C.inkSoft }}
          >
            You are officially enrolled in the{' '}
            <strong style={{ color: C.ink }}>{tier.name}.</strong> Please read
            this page carefully, your access depends on the next step.
          </p>

          {/* ══ VIP ONLY ════════════════════════════════════════════════
              The one thing this page does differently for an upgrade. It sits
              ABOVE the detail cards and above the WhatsApp step, because this
              is the only moment the buyer is actively wondering whether the
              extra ₹500 was worth it — three screens later the question has
              already answered itself badly.

              Navy on a cream page, which is the treatment the page otherwise
              reserves for nothing: it is the one block that has to feel like
              a different, better thing happened here. */}
          {isVip && (
            <div
              className="mx-auto mt-8 max-w-xl overflow-hidden rounded-3xl p-6 text-left sm:p-7"
              style={{
                background: `linear-gradient(150deg, ${C.navyDeep} 0%, #1b2c53 100%)`,
                boxShadow: '0 26px 56px -30px rgba(31,50,92,0.55)',
              }}
            >
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10.5px] font-bold uppercase tracking-[0.16em]"
                style={{ background: 'rgba(238,119,120,0.22)', color: '#FBC9C4' }}
              >
                <Star weight="fill" className="h-3 w-3 shrink-0" />
                VIP Access unlocked
              </span>

              <h2
                className="mt-4 font-display text-[21px] font-semibold leading-snug sm:text-[25px]"
                style={{ color: C.onDark }}
              >
                You also have{' '}
                <span style={{ color: C.gold }}>progress tracking</span> and two
                extra guides.
              </h2>

              <ul className="mt-5 flex flex-col gap-3.5">
                {VIP_UNLOCKED.map(({ title, detail }) => (
                  <li key={title} className="flex items-start gap-3">
                    <span
                      className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full"
                      style={{ background: 'rgba(242,221,182,0.18)' }}
                    >
                      <Check weight="bold" className="h-3 w-3" style={{ color: C.gold }} />
                    </span>
                    <span className="min-w-0">
                      <span
                        className="block text-[14.5px] font-semibold leading-snug"
                        style={{ color: C.onDark }}
                      >
                        {title}
                      </span>
                      <span
                        className="mt-0.5 block text-[13px] leading-relaxed"
                        style={{ color: C.onDarkMute }}
                      >
                        {detail}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>

              <p
                className="mt-5 border-t pt-4 text-[12.5px]"
                style={{ borderColor: 'rgba(242,221,182,0.22)', color: C.onDarkMute }}
              >
                Your Symptom Score and Readiness Check are guided live on Day
                One. Both guides are in the community with your other files.
              </p>
            </div>
          )}

          <div className="mx-auto mt-8 grid max-w-lg gap-3 sm:grid-cols-2">
            <DetailCard icon={CalendarBlank} label="Challenge date" value={START_DATE} />
            <DetailCard
              icon={Clock}
              label="Live session timings"
              value={SESSION_TIMES_TZ}
              footnote="Choose the batch that fits"
            />
          </div>

          {paymentId && (
            <p
              className="mt-6 text-[11.5px] font-medium uppercase tracking-[0.14em]"
              style={{ color: C.inkSoft }}
            >
              Payment ID {paymentId} · {tier.price} paid
            </p>
          )}
        </div>
      </section>

      {/* ── The one next step ────────────────────────────────────────── */}
      <section className="px-5 pb-4 md:px-8">
        <div
          className="relative mx-auto max-w-3xl overflow-hidden rounded-3xl p-8 text-center text-white md:p-10"
          style={{ background: `linear-gradient(135deg, ${WA.deep}, ${WA.green})` }}
        >
          <span
            aria-hidden
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                'repeating-linear-gradient(45deg, rgba(255,255,255,0.4) 0 2px, transparent 2px 22px)',
            }}
          />
          <div className="relative">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-[10.5px] font-bold uppercase tracking-[0.16em]">
              <Warning weight="fill" className="h-3 w-3" />
              Important · Step 1 of 1
            </span>

            <h2 className="mt-4 font-display text-[24px] font-semibold leading-tight sm:text-[34px]">
              Join the WhatsApp Community now.
            </h2>

            <p className="mx-auto mt-3 max-w-md text-[14.5px] leading-relaxed text-white/90">
              All updates, Zoom links, reminders and daily instructions will be
              shared inside the WhatsApp Community.{' '}
              <strong className="text-white">
                Your access to the challenge depends on joining this group.
              </strong>
            </p>

            {WHATSAPP_INVITE ? (
              <a
                href={WHATSAPP_INVITE}
                target="_blank"
                rel="noopener noreferrer"
                className="group mt-7 inline-flex min-h-[56px] w-full items-center justify-center gap-2 rounded-full bg-white px-7 py-4 font-display text-[15px] font-semibold"
                style={{ color: WA.deep }}
              >
                <WhatsappLogo weight="fill" className="h-5 w-5" />
                Join the Community Here
                <ArrowRight
                  weight="bold"
                  className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
                />
              </a>
            ) : (
              /* Never a dead button to someone who has just paid. */
              <p className="mt-7 text-[13.5px] font-semibold text-white">
                Your invite link is on its way by email. Check your inbox in the
                next few minutes.
              </p>
            )}

            <p className="mt-4 text-[11.5px] text-white/80">
              Opens in WhatsApp · 1-click join
            </p>
          </div>
        </div>
      </section>

      {/* ── What arrives inside ──────────────────────────────────────── */}
      <section className="px-5 py-16 md:px-8 md:py-20">
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <SectionEyebrow text="What you'll receive inside" />
            <h2
              className="mt-3 font-display text-[24px] font-semibold leading-tight sm:text-[32px]"
              style={{ color: C.ink }}
            >
              What you&rsquo;ll receive in the{' '}
              <span style={{ color: C.goldDeep }}>community.</span>
            </h2>
          </div>

          <ul className="mt-10 space-y-3">
            {COMMUNITY_BENEFITS.map(({ icon: Icon, text }) => (
              <li
                key={text}
                className="flex items-center gap-4 rounded-2xl p-4"
                style={{ background: C.canvas, border: `1px solid ${C.line}` }}
              >
                <span
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-full"
                  style={{ background: C.goldPale }}
                >
                  <Icon weight="duotone" className="h-5 w-5" style={{ color: C.goldInk }} />
                </span>
                <span className="text-[14.5px] font-medium" style={{ color: C.inkSoft }}>
                  {text}
                </span>
                <CheckCircle
                  weight="fill"
                  className="ml-auto h-5 w-5 shrink-0"
                  style={{ color: GOOD_GREEN }}
                />
              </li>
            ))}
          </ul>

          <p
            className="mt-6 rounded-xl p-4 text-center text-[13.5px] font-medium"
            style={{ background: '#FEF3C7', color: WARN_AMBER, border: '1px solid #FDE68A' }}
          >
            <Warning weight="fill" className="mr-1.5 inline-block h-4 w-4 align-text-bottom" />
            Please do <strong>not mute</strong> or{' '}
            <strong>exit the community</strong> during these <strong>5 days</strong>.
          </p>
        </div>
      </section>

      {/* ── Be available 5 min before ────────────────────────────────── */}
      <section className="px-5 pb-4 md:px-8">
        <div
          className="mx-auto max-w-3xl rounded-3xl p-7 md:p-9"
          style={{ background: C.canvas, border: `1px solid ${C.line}` }}
        >
          <div className="flex items-start gap-4">
            <span
              className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl"
              style={{ background: C.canvasAlt, border: `1px solid ${C.line}` }}
            >
              <Clock weight="duotone" className="h-6 w-6" style={{ color: C.goldInk }} />
            </span>
            <div className="min-w-0">
              <h3
                className="font-display text-[18px] font-semibold leading-snug sm:text-[20px]"
                style={{ color: C.ink }}
              >
                Please be available{' '}
                <span style={{ color: C.goldDeep }}>5 minutes before</span> each
                live session.
              </h3>
              <p className="mt-2 text-[14px] leading-relaxed" style={{ color: C.inkSoft }}>
                These are <strong>live, expert-led sessions</strong>. Arriving
                late may result in missing important instructions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Important policy ─────────────────────────────────────────── */}
      <section className="px-5 py-16 md:px-8 md:py-20">
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <SectionEyebrow text="Please note" />
            <h2
              className="mt-3 font-display text-[24px] font-semibold leading-tight sm:text-[32px]"
              style={{ color: C.ink }}
            >
              Important <span style={{ color: C.goldDeep }}>policy.</span>
            </h2>
            <p className="mt-3 text-[14.5px]" style={{ color: C.inkSoft }}>
              Because this is a live, structured experience:
            </p>
          </div>

          <ul className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {POLICY_ITEMS.map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 rounded-2xl p-5 text-center"
                style={{ background: C.canvas, border: `1px solid ${C.line}` }}
              >
                <X weight="bold" className="mt-0.5 h-4 w-4 shrink-0" style={{ color: C.coralInk }} />
                <span
                  className="text-[13.5px] font-semibold leading-snug"
                  style={{ color: C.inkSoft }}
                >
                  {item}
                </span>
              </li>
            ))}
          </ul>

          <div
            className="mt-8 rounded-2xl p-5 text-center"
            style={{ background: C.canvasAlt, border: `1px solid ${C.line}` }}
          >
            <p className="font-display text-[15px] font-semibold" style={{ color: C.ink }}>
              Your spot has been reserved exclusively for you.
            </p>
            <p className="mt-1.5 text-[12.5px]" style={{ color: C.inkSoft }}>
              (Our{' '}
              <Link href="/refund-policy" className="underline" style={{ color: C.goldInk }}>
                refund policy
              </Link>{' '}
              covers the Day One guarantee in full.)
            </p>
          </div>
        </div>
      </section>

      {/* ── Prep checklist ───────────────────────────────────────────── */}
      <section className="px-5 pb-16 md:px-8 md:pb-20">
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <SectionEyebrow text="Quick prep" />
            <h2
              className="mt-3 font-display text-[24px] font-semibold leading-tight sm:text-[32px]"
              style={{ color: C.ink }}
            >
              What to do <span style={{ color: C.goldDeep }}>before the call.</span>
            </h2>
            <p className="mt-3 text-[14.5px]" style={{ color: C.inkSoft }}>
              To get maximum results, please:
            </p>
          </div>

          <ul className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {PREP_ITEMS.map((item, i) => (
              <li
                key={item}
                className="flex items-start gap-3 rounded-2xl p-4"
                style={{ background: C.canvas, border: `1px solid ${C.line}` }}
              >
                <span
                  className="grid h-7 w-7 shrink-0 place-items-center rounded-full font-display text-[11.5px] font-bold"
                  style={{
                    background: `linear-gradient(135deg, ${C.goldMid}, ${C.goldDeep})`,
                    color: C.canvas,
                  }}
                >
                  {i + 1}
                </span>
                <span
                  className="text-[14px] font-medium leading-snug"
                  style={{ color: C.inkSoft }}
                >
                  {item}
                </span>
              </li>
            ))}
          </ul>

          <p className="mt-6 text-center text-[13.5px]" style={{ color: C.inkSoft }}>
            <ShieldCheck
              weight="fill"
              className="mr-1.5 inline-block h-4 w-4 align-text-bottom"
              style={{ color: C.goldInk }}
            />
            <strong style={{ color: C.ink }}>No equipment required.</strong> No
            prior fitness level required.
          </p>
        </div>
      </section>

      {/* ── Final nudge ──────────────────────────────────────────────── */}
      {/* Ankita's version is near-black with a pink bloom. The equivalent dark
          stage in THIS project is the brand navy, which is what every dark
          section on the landing page uses, so a black band here would read as
          a different site. The bloom follows: brand gold, not gold on black. */}
      <section
        className="relative isolate overflow-hidden px-5 py-16 md:px-8 md:py-20"
        style={{ background: C.navyDeep }}
      >
        <div
          aria-hidden
          className="absolute inset-0 -z-10 opacity-40"
          style={{
            background: `radial-gradient(ellipse at top, rgba(242,221,182,0.22) 0%, transparent 62%)`,
          }}
        />
        <div className="mx-auto max-w-3xl text-center">
          <h2
            className="font-display text-[26px] font-semibold leading-tight sm:text-[36px]"
            style={{ color: C.onDark }}
          >
            This is your <span style={{ color: C.gold }}>first step</span>
            <br className="hidden sm:block" /> toward feeling like yourself
            again.
          </h2>
          <p className="mt-4 text-[14.5px]" style={{ color: C.onDarkMute }}>
            Now, join the community and we&rsquo;ll see you inside.
          </p>

          {WHATSAPP_INVITE && (
            <div className="mt-8">
              <a
                href={WHATSAPP_INVITE}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex min-h-[56px] w-full items-center justify-center gap-2 rounded-full bg-white px-7 py-4 font-display text-[15px] font-semibold shadow-2xl transition-transform duration-200 hover:-translate-y-0.5 sm:w-auto sm:text-[16px]"
                style={{ color: WA.deep }}
              >
                <WhatsappLogo weight="fill" className="h-5 w-5" />
                Join the Community
                <ArrowRight
                  weight="bold"
                  className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
                />
              </a>
            </div>
          )}
        </div>
      </section>

      <SiteFooter />

      {/* Exactly the docked bar's height, so the footer's operator address,
          contact details and policy links are not permanently underneath it on
          the last screen. Renders as nothing when there is no bar — which is
          the current state, since the bar is gated on WHATSAPP_INVITE and that
          is still unset. This was a latent bug rather than a visible one: it
          would have appeared the day the invite link was configured. */}
      <div aria-hidden style={{ height: barH }} />

      {/* ── Mobile sticky CTA: the page anchored on one action ────────── */}
      {WHATSAPP_INVITE && (
        <div
          ref={barRef}
          className="fixed inset-x-0 bottom-0 z-40 md:hidden"
          style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        >
          <div
            className="border-t px-4 pb-3 pt-3 shadow-[0_-8px_24px_-12px_rgba(31,50,92,0.25)] backdrop-blur"
            style={{ background: 'rgba(255,253,248,0.95)', borderColor: C.line }}
          >
            <a
              href={WHATSAPP_INVITE}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl py-3.5 font-display text-[14.5px] font-semibold text-white shadow-md"
              style={{ background: `linear-gradient(135deg, ${WA.deep}, ${WA.green})` }}
            >
              <WhatsappLogo weight="fill" className="h-5 w-5" />
              Join the WhatsApp Community
              <ArrowRight weight="bold" className="h-4 w-4" />
            </a>
          </div>
        </div>
      )}
    </main>
  );
}

function DetailCard({
  icon: Icon,
  label,
  value,
  footnote,
}: {
  icon: typeof Clock;
  label: string;
  value: string;
  footnote?: string;
}) {
  return (
    <div
      className="rounded-2xl p-4 text-left"
      style={{ background: C.canvas, border: `1px solid ${C.line}` }}
    >
      <div className="flex items-center gap-3">
        <span
          className="grid h-10 w-10 shrink-0 place-items-center rounded-lg"
          style={{ background: C.goldPale }}
        >
          <Icon weight="duotone" className="h-5 w-5" style={{ color: C.goldInk }} />
        </span>
        <div className="min-w-0">
          <p
            className="text-[10.5px] font-bold uppercase tracking-[0.16em]"
            style={{ color: C.inkSoft }}
          >
            {label}
          </p>
          <p
            className="mt-0.5 font-display text-[14px] font-semibold leading-snug"
            style={{ color: C.ink }}
          >
            {value}
          </p>
        </div>
      </div>
      {footnote && (
        <p className="mt-2 text-[11.5px]" style={{ color: C.inkSoft }}>
          {footnote}
        </p>
      )}
    </div>
  );
}

function SectionEyebrow({ text }: { text: string }) {
  return (
    <span
      className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[10.5px] font-bold uppercase tracking-[0.2em]"
      style={{ background: C.goldWash, color: C.goldInk }}
    >
      <span
        aria-hidden
        className="inline-block h-1 w-1 rounded-full"
        style={{ background: C.goldInk }}
      />
      {text}
    </span>
  );
}




