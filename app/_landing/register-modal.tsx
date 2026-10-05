'use client';

/**
 * The free-registration modal. Replaces the old /checkout page.
 *
 * Every landing-page CTA is a plain link to REGISTER_HREF (#register) carrying
 * `data-cta`. Rather than threading an onClick through seven server-rendered
 * buttons, ONE delegated listener on the document, in the CAPTURE phase,
 * catches any click on such a link, cancels the navigation and opens this
 * modal. Capture matters: it runs before next/link's own handler, which then
 * sees `defaultPrevented` and leaves the URL alone.
 *
 * Opening fires atc_event (pixel + CAPI, shared event_id). Submitting posts to
 * /api/register, which sends the lead to Pabbly and the server copy of
 * registration_complete; the pixel copy fires here with the same event_id,
 * then the registrant moves on to /thank-you.
 *
 * Same fields as the old checkout, in the same order, so the Pabbly mapping
 * and the Meta match keys are unchanged: first name, last name, email, city,
 * country + WhatsApp number, occupation.
 */

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { CheckCircle, Lock, ShieldCheck, X } from '@phosphor-icons/react/dist/ssr';

import { collectSignals } from '@/lib/client-signals';
import { newEventId, trackAtc, trackRegistrationComplete } from '@/lib/track';

import { REASSURANCE_LINE, SESSION_TIMES_TZ, START_DATE, THANK_YOU_HREF } from './offer';
import { C } from './shared';

/* Dial codes carry the ISO-2 alongside them because Meta's CAPI wants the
   COUNTRY as a hashed ISO 3166-1 alpha-2 code, not a dial code. UAE first:
   this is the Dubai funnel. Then the Gulf, then the rest of the audience. */
const COUNTRIES: { iso: string; dial: string; label: string; example: string }[] = [
  { iso: 'ae', dial: '+971', label: 'UAE (+971)', example: '50 123 4567' },
  { iso: 'sa', dial: '+966', label: 'Saudi Arabia (+966)', example: '50 123 4567' },
  { iso: 'qa', dial: '+974', label: 'Qatar (+974)', example: '3312 3456' },
  { iso: 'om', dial: '+968', label: 'Oman (+968)', example: '9212 3456' },
  { iso: 'kw', dial: '+965', label: 'Kuwait (+965)', example: '500 12345' },
  { iso: 'bh', dial: '+973', label: 'Bahrain (+973)', example: '3600 1234' },
  { iso: 'in', dial: '+91', label: 'India (+91)', example: '98XXX XXXXX' },
  { iso: 'gb', dial: '+44', label: 'UK (+44)', example: '7400 123456' },
  { iso: 'us', dial: '+1', label: 'USA (+1)', example: '201 555 0123' },
  { iso: 'ca', dial: '+1', label: 'Canada (+1)', example: '506 234 5678' },
  { iso: 'au', dial: '+61', label: 'Australia (+61)', example: '412 345 678' },
  { iso: 'sg', dial: '+65', label: 'Singapore (+65)', example: '8123 4567' },
  { iso: 'nz', dial: '+64', label: 'New Zealand (+64)', example: '21 123 4567' },
  { iso: 'za', dial: '+27', label: 'South Africa (+27)', example: '71 123 4567' },
  { iso: 'my', dial: '+60', label: 'Malaysia (+60)', example: '12 345 6789' },
  { iso: 'de', dial: '+49', label: 'Germany (+49)', example: '1512 3456789' },
];

/* The VALUE is what travels to Pabbly and Meta, so keep it stable even if the
   label is reworded. Validated server-side against the same two values. */
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

const EMPTY: Fields = {
  firstName: '',
  lastName: '',
  email: '',
  city: '',
  country: 'ae',
  phone: '',
  occupation: '',
};

export default function RegisterModal() {
  const [open, setOpen] = useState(false);
  const [f, setF] = useState<Fields>(EMPTY);
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState('');
  const firstRef = useRef<HTMLInputElement>(null);

  const openModal = useCallback(() => {
    setOpen(true);
    setFailed('');
    trackAtc();
  }, []);

  /* ── The delegated CTA listener ─────────────────────────────────────── */
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0) return;
      const target = e.target as Element | null;
      const cta = target?.closest?.('a[data-cta], a[href="#register"]');
      if (!cta) return;
      e.preventDefault();
      openModal();
    };
    document.addEventListener('click', onClick, true);

    /* A link straight to /#register (an email, an ad, a bio link) opens the
       form on arrival. That is the same intent as a CTA click. */
    if (window.location.hash === '#register') openModal();

    return () => document.removeEventListener('click', onClick, true);
  }, [openModal]);

  /* ── While open: lock the page behind, Esc closes, focus the first field ── */
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !busy) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    const t = window.setTimeout(() => firstRef.current?.focus(), 50);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
      window.clearTimeout(t);
    };
  }, [open, busy]);

  /* Leading zeros are stripped from the national number: a UAE visitor
     typing their number the local way ("050…") must still produce a valid
     E.164 ("97150…"), not "971050…", or the phone match key is lost. */
  const national = f.phone.replace(/\D/g, '').replace(/^0+/, '');

  const v = useMemo(
    () => ({
      firstName: f.firstName.trim().length > 1,
      lastName: f.lastName.trim().length > 0,
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim()),
      city: f.city.trim().length > 1,
      /* Subscriber number only; the dial code comes from the picker. India is
         the strict case at exactly 10, the UAE at exactly 9. */
      phone:
        f.country === 'in'
          ? national.length === 10
          : f.country === 'ae'
            ? national.length === 9
            : national.length >= 7 && national.length <= 12,
      occupation: f.occupation !== '',
    }),
    [f, national],
  );
  const valid = v.firstName && v.lastName && v.email && v.city && v.phone && v.occupation;

  const country = COUNTRIES.find((c) => c.iso === f.country) ?? COUNTRIES[0];
  /* E.164 without the plus, which is what Meta expects. */
  const e164 = `${country.dial}${national}`.replace(/\D/g, '');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    setFailed('');
    if (!valid || busy) return;
    setBusy(true);

    const person = {
      firstName: f.firstName.trim(),
      lastName: f.lastName.trim(),
      email: f.email.trim().toLowerCase(),
      phone: e164,
      city: f.city.trim(),
      country: f.country,
      occupation: f.occupation,
    };
    const eventId = newEventId();

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...person, eventId, ...collectSignals() }),
      });
      const out = await res.json().catch(() => null);
      if (!res.ok || !out?.ok) {
        setBusy(false);
        setFailed('We could not complete your registration. Please check your details and try again.');
        return;
      }

      trackRegistrationComplete(person, out.eventId || eventId);

      /* A beat for the pixel request to leave before the page unloads. The
         server copy has already been sent, so this is belt and braces. */
      window.setTimeout(() => {
        window.location.href = THANK_YOU_HREF;
      }, 350);
    } catch {
      setBusy(false);
      setFailed('We could not complete your registration. Please try again.');
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="kz-register-title"
    >
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 cursor-default"
        style={{ background: 'rgba(22,38,74,0.62)', backdropFilter: 'blur(3px)' }}
        onClick={() => !busy && setOpen(false)}
      />

      <div
        className="relative max-h-[92dvh] w-full overflow-y-auto rounded-t-3xl px-5 pb-6 pt-6 shadow-2xl sm:max-w-[520px] sm:rounded-3xl sm:px-8 sm:pb-8 sm:pt-8"
        style={{ background: C.canvas, paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
      >
        <button
          type="button"
          onClick={() => setOpen(false)}
          disabled={busy}
          aria-label="Close registration form"
          className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full"
          style={{ background: C.canvasAlt, color: C.inkSoft }}
        >
          <X weight="bold" className="h-4 w-4" />
        </button>

        <span
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10.5px] font-bold uppercase tracking-[0.16em]"
          style={{ background: C.goldWash, color: C.goldInk }}
        >
          <CheckCircle weight="fill" className="h-3 w-3 shrink-0" />
          Free registration
        </span>

        <h2
          id="kz-register-title"
          className="mt-3 pr-10 font-display text-[22px] font-semibold leading-snug sm:text-[26px]"
          style={{ color: C.ink }}
        >
          Reserve your free seat.
        </h2>
        <p className="mt-1.5 text-[12.5px] sm:text-[13px]" style={{ color: C.inkSoft }}>
          Starts {START_DATE} · Live on Zoom · {SESSION_TIMES_TZ}
        </p>

        <form onSubmit={submit} noValidate className="mt-5 flex flex-col gap-4">
          {/* First and last are separate fields: Meta hashes fn and ln
              independently, so splitting one "full name" on a space guesses,
              and a bad guess is a permanently worse match. */}
          <div className="grid grid-cols-2 gap-3">
            <Field
              inputRef={firstRef}
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
            placeholder="e.g. Dubai"
            value={f.city}
            onChange={(x) => setF((s) => ({ ...s, city: x }))}
            bad={touched && !v.city}
          />

          <label className="block">
            <span
              className="mb-1.5 block text-[10.5px] font-bold uppercase tracking-[0.16em]"
              style={{ color: C.inkSoft }}
            >
              WhatsApp number
            </span>
            <div className="flex gap-2">
              <select
                className="w-[132px] shrink-0 rounded-xl px-3 py-3 text-[15px] outline-none"
                autoComplete="tel-country-code"
                aria-label="Country dialling code"
                value={f.country}
                onChange={(e) => setF((s) => ({ ...s, country: e.target.value }))}
                style={{ background: C.canvasAlt, color: C.ink, border: `1px solid ${C.line}` }}
              >
                {COUNTRIES.map((c) => (
                  <option key={c.iso} value={c.iso}>
                    {c.label}
                  </option>
                ))}
              </select>
              <input
                className="w-full min-w-0 rounded-xl px-4 py-3 text-[15px] outline-none"
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                placeholder={country.example}
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
              Your Zoom link and session reminders go here.
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

          {touched && !valid && (
            <p className="text-[12.5px]" style={{ color: C.coralInk }}>
              Please add your name, a working email, your city and a valid WhatsApp number.
            </p>
          )}
          {failed && (
            <p className="text-[12.5px]" style={{ color: C.coralInk }}>
              {failed}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="lego-press cta-shimmer mt-2 inline-flex min-h-[56px] w-full items-center justify-center rounded-2xl px-6 text-[15.5px] font-bold disabled:opacity-60"
            style={{
              background: C.ink,
              color: C.canvas,
              ['--shimmer' as string]: 'rgba(242,221,182,0.30)',
            }}
          >
            {busy ? 'Reserving your seat…' : 'Complete Free Registration'}
          </button>

          <div
            className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 text-[11px]"
            style={{ color: C.inkSoft }}
          >
            <span className="inline-flex items-center gap-1 whitespace-nowrap">
              <Lock weight="fill" className="h-3 w-3 shrink-0" style={{ color: C.goldInk }} />
              Your details are safe
            </span>
            <span aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1 whitespace-nowrap">
              <ShieldCheck weight="fill" className="h-3 w-3 shrink-0" style={{ color: C.coralInk }} />
              {REASSURANCE_LINE}
            </span>
          </div>

          <p className="text-center text-[11.5px] leading-relaxed" style={{ color: C.inkSoft }}>
            Your details are used to send your joining link and reminders, as
            described in our{' '}
            <Link href="/privacy-policy" className="font-semibold underline" style={{ color: C.goldInk }}>
              privacy policy
            </Link>
            .
          </p>
        </form>
      </div>
    </div>
  );
}

/* One field: same label treatment, error state and focus ring everywhere. */
function Field({
  label,
  type,
  autoComplete,
  placeholder,
  value,
  onChange,
  bad,
  inputRef,
}: {
  label: string;
  type: string;
  autoComplete: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  bad: boolean;
  inputRef?: React.Ref<HTMLInputElement>;
}) {
  return (
    <label className="block min-w-0">
      <span
        className="mb-1.5 block text-[10.5px] font-bold uppercase tracking-[0.16em]"
        style={{ color: C.inkSoft }}
      >
        {label}
      </span>
      <input
        ref={inputRef}
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
    </label>
  );
}
