'use client';

import { useEffect, useState } from 'react';

/**
 * Section 7 · proof.
 *
 * TWO proof surfaces back to back, deliberately rendered as two DIFFERENT
 * things: three exhibit-framed video cards, then a column-masonry wall of text
 * screenshots. Repeating one treatment twice reads as one long section the eye
 * gives up on; the change of form is what makes the second one land as more
 * proof rather than more of the same.
 *
 * ⚠️ NO PROOF ASSETS EXIST YET. The source copy carries "Testimonial 1/2/3" and
 * six "Text Screenshot" placeholders, so that is exactly what renders: labelled
 * empty frames. Nothing here invents a name, a quote, a city, a star rating or
 * a result — a fabricated testimonial is the one thing a wellness page can
 * never come back from.
 *
 * TO GO LIVE: fill TESTIMONIALS with real clips (add `src`, and `name`/`meta`
 * only if the client has consent to show them) and SCREENSHOTS with real image
 * paths. Both grids render the real thing the moment the data is there; no
 * markup below has to change. If assets are still missing at launch, CUT this
 * section rather than shipping the frames.
 */
import { Images, Play, X } from '@phosphor-icons/react/dist/ssr';

import { C, SectionHeading } from './shared';

type Testimonial = { label: string; vimeoId?: string; meta?: string };
type Screenshot = { label: string; src?: string; alt?: string };

/* Fifteen clips, all shot vertical (9:16) and 31 to 81 seconds.
   `meta` is the speaker's name and is only set where the source video is
   actually titled with one. Three of the fifteen are titled generically in the
   library ("Mixed Testimonials", "Express Wellness"), and those run without a
   name rather than with an invented one.

   Named speakers lead and the unnamed three sit last: a face with a name
   attached to it is the stronger proof, and the rail is read from its start. */
const TESTIMONIALS: Testimonial[] = [
  { label: 'Julie', vimeoId: '1221356514', meta: 'Julie' },
  { label: 'Nicole Bhatia', vimeoId: '1221356653', meta: 'Nicole Bhatia' },
  { label: 'Kiran Chokar', vimeoId: '1221356530', meta: 'Kiran Chokar' },
  { label: 'Ayesha Adlakha', vimeoId: '1221356515', meta: 'Ayesha Adlakha' },
  { label: 'Smriti', vimeoId: '1221356670', meta: 'Smriti' },
  { label: 'Neetu', vimeoId: '1221356642', meta: 'Neetu' },
  { label: 'Richa Wahi', vimeoId: '1221356657', meta: 'Richa Wahi' },
  { label: 'Dielle', vimeoId: '1221356513', meta: 'Dielle' },
  { label: 'Anita', vimeoId: '1222299328', meta: 'Anita' },
  { label: 'Shilpa Kerekar', vimeoId: '1222299331', meta: 'Shilpa Kerekar' },
  { label: 'Praryna', vimeoId: '1222299329', meta: 'Praryna' },
  { label: 'Khushi Dawda', vimeoId: '1222299330', meta: 'Khushi Dawda' },
  { label: 'Kaizen member', vimeoId: '1221356641' },
  { label: 'Kaizen member', vimeoId: '1221356609' },
  { label: 'Kaizen member', vimeoId: '1221356516' },
];

/* Twenty-one WhatsApp captures, resized to 640px wide and recompressed: the
   originals were 16MB together, which is more than the rest of the page put
   together and would have been the single heaviest thing on the site. */
const SCREENSHOTS: Screenshot[] = Array.from({ length: 21 }, (_, i) => ({
  label: 'Message from a Kaizen member',
  src: `/images/screenshots/ss-${String(i + 1).padStart(2, '0')}.jpg`,
  alt: 'A WhatsApp message from a Kaizen member describing their experience',
}));

/* The empty state. Flat, ruled and honestly labelled: no gradient standing in
   for a photograph, and no invented poster art. It should look like a frame
   waiting for its exhibit, because that is what it is. */
function PendingFrame({ label, note }: { label: string; note: string }) {
  return (
    <span className="flex h-full w-full flex-col items-center justify-center gap-2 px-4 text-center">
      <span
        className="grid h-11 w-11 place-items-center rounded-full"
        style={{ background: C.goldPale }}
      >
        <Images weight="duotone" className="h-5 w-5" style={{ color: C.goldInk }} />
      </span>
      <span
        className="mt-1 text-[11px] font-bold uppercase tracking-[0.16em]"
        style={{ color: C.ink }}
      >
        {label}
      </span>
      <span className="text-[11.5px]" style={{ color: C.inkSoft }}>
        {note}
      </span>
    </span>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
 *  The testimonial rail: one row, scrolling on its own.
 *
 *  Posters, not players. Fifteen embeds in a duplicated marquee track would be
 *  THIRTY Vimeo player documents fighting for the main thread, on a section
 *  most readers scroll past. So the rail carries still frames, and the clicked
 *  card, and only that one, becomes a real player.
 *
 *  The track is rendered twice for a seamless loop, and the animation travels
 *  -50%, which is exactly one copy. The second copy is aria-hidden so a screen
 *  reader hears fifteen testimonials, not thirty.
 *
 *  `playingKey` carries the COPY INDEX as well as the video id. Both copies of
 *  a card are clickable (the duplicate is on screen half the time, so making it
 *  inert would feel broken), but keying on the pair means only the instance
 *  actually clicked turns into a player. Keying on the id alone would open two
 *  players of the same clip and you would hear it twice.
 * ═══════════════════════════════════════════════════════════════════════ */
function TestimonialRail() {
  const [playingKey, setPlayingKey] = useState<string | null>(null);
  const copies = [0, 1];

  return (
    <div
      className="kz-rail mt-14"
      data-playing={playingKey ? 'true' : 'false'}
      /* The rail is a labelled region rather than a list, because it scrolls
         itself: a list implies the reader controls the order. */
      role="region"
      aria-label="Video testimonials"
    >
      <div className="kz-rail-track">
        {copies.map((copy) =>
          TESTIMONIALS.map((t, idx) => {
            const key = `${copy}-${t.vimeoId ?? idx}`;
            const isPlaying = playingKey === key;
            return (
              <article
                key={key}
                aria-hidden={copy === 1 ? true : undefined}
                className="w-[230px] shrink-0 rounded-3xl p-3 sm:w-[264px]"
                style={{
                  background: C.canvas,
                  border: `1px solid ${C.line}`,
                  boxShadow: '0 18px 40px -28px rgba(31,50,92,0.3)',
                }}
              >
                <div
                  className="relative flex aspect-[9/16] items-center justify-center overflow-hidden rounded-2xl"
                  style={{
                    background: C.canvasAlt,
                    boxShadow: `inset 0 0 0 1px ${C.line}`,
                  }}
                >
                  {!t.vimeoId ? (
                    <PendingFrame label={t.label} note="Video clip pending" />
                  ) : isPlaying ? (
                    /* autoplay=1 because the reader has already asked for it by
                       clicking. Mounting it paused would need a second click. */
                    <iframe
                      src={`https://player.vimeo.com/video/${t.vimeoId}?dnt=1&autoplay=1&title=0&byline=0&portrait=0`}
                      title={`${t.label}, Kaizen testimonial`}
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                      className="absolute inset-0 h-full w-full border-0"
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => setPlayingKey(key)}
                      className="group absolute inset-0 h-full w-full cursor-pointer"
                      aria-label={`Play ${t.label}'s testimonial`}
                      tabIndex={copy === 1 ? -1 : undefined}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`/images/testimonials/${t.vimeoId}.jpg`}
                        alt=""
                        loading="lazy"
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                      {/* A scrim so the play disc holds against a bright frame,
                          and so the name below it stays readable. */}
                      <span
                        aria-hidden
                        className="absolute inset-0"
                        style={{
                          background:
                            'linear-gradient(180deg, rgba(22,38,74,0.05) 0%, rgba(22,38,74,0.06) 55%, rgba(22,38,74,0.5) 100%)',
                        }}
                      />
                      <span
                        aria-hidden
                        className="absolute left-1/2 top-1/2 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full transition-transform duration-300 group-hover:scale-105"
                        style={{
                          background: C.canvas,
                          boxShadow: '0 10px 26px -10px rgba(22,38,74,0.55)',
                        }}
                      >
                        <Play weight="fill" className="h-5 w-5 translate-x-[1px]" style={{ color: C.ink }} />
                      </span>
                    </button>
                  )}
                </div>

                {t.meta && (
                  <p
                    className="px-2 pb-1 pt-3 text-center text-[11px] font-bold uppercase tracking-[0.14em]"
                    style={{ color: C.inkSoft }}
                  >
                    {t.meta}
                  </p>
                )}
              </article>
            );
          }),
        )}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
 *  The screenshot rail, travelling the opposite way to the videos.
 *
 *  A phone capture shrunk into a 260px card is legible as an OBJECT (you can
 *  see it is a real WhatsApp thread) but not as TEXT. So each card opens full
 *  size on click. Without that the wall is decoration: proof you cannot read is
 *  not proof.
 * ═══════════════════════════════════════════════════════════════════════ */
function ScreenshotRail() {
  const [open, setOpen] = useState<string | null>(null);
  const copies = [0, 1];

  /* Esc closes, and the body stops scrolling behind the overlay. */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null);
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <>
      <div
        className="kz-rail"
        data-playing={open ? 'true' : 'false'}
        role="region"
        aria-label="Messages from Kaizen members"
      >
        <div className="kz-rail-track kz-rail-track--reverse">
          {copies.map((copy) =>
            SCREENSHOTS.map((shot, idx) => (
              <button
                key={`${copy}-${idx}`}
                type="button"
                aria-hidden={copy === 1 ? true : undefined}
                tabIndex={copy === 1 ? -1 : undefined}
                onClick={() => shot.src && setOpen(shot.src)}
                aria-label={`${shot.label}, open full size`}
                className="lego-hover-sm w-[210px] shrink-0 cursor-pointer overflow-hidden rounded-2xl sm:w-[236px]"
                style={{ background: C.canvas, border: `1px solid ${C.line}` }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={shot.src}
                  alt={shot.alt || ''}
                  loading="lazy"
                  className="block h-auto w-full"
                />
              </button>
            )),
          )}
        </div>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(22,38,74,0.82)' }}
          onClick={() => setOpen(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Message from a Kaizen member"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={open}
            alt="A WhatsApp message from a Kaizen member describing their experience"
            className="max-h-full w-auto max-w-full rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            type="button"
            onClick={() => setOpen(null)}
            aria-label="Close"
            className="absolute right-5 top-5 grid h-11 w-11 place-items-center rounded-full text-[20px] font-bold"
            style={{ background: C.canvas, color: C.ink }}
          >
            <X weight="bold" className="h-5 w-5" />
          </button>
        </div>
      )}
    </>
  );
}

export default function Proof() {
  return (
    <section className="px-4 py-12 sm:py-20 lg:py-24" style={{ background: C.canvas }}>
      <SectionHeading sub="From working professionals & busy mothers to women who no longer felt comfortable in their bodies, these are real women who used our holistic approach to move better, sleep peacefully & feel like themselves again.">
        Real Women Who Found Their Way
        <br className="hidden lg:inline" /> Back to{' '}
        <span style={{ color: C.goldDeep }}>Feeling Like Themselves</span>
      </SectionHeading>

      {/* ── 7a · the rail ────────────────────────────────────────────────
          Fifteen clips is too many to grid: five rows of portrait cards would
          push the wall below it off the page entirely. One self-scrolling row
          shows the VOLUME of proof at a glance and costs a single screen.
          Poster in a mat with an inner hairline ring, so each card reads as an
          exhibit rather than a quote box, with an on-brand play disc instead of
          a platform-red triangle. */}
      <TestimonialRail />

      {/* ── 7b · the wall ────────────────────────────────────────────────
          A second rail rather than the masonry this used to be. A masonry earns
          its keep when tiles vary in height; these are twenty-one phone
          captures at an identical 9:19.5, so it would have produced three dead
          straight columns four screens tall. The rail bounds it to one screen
          and shows the VOLUME of proof, which is this beat's whole job.

          It travels the opposite way to the video rail above, so the two read
          as a pair rather than as the same effect twice.

          Separated by a hairline flourish rather than a second headline,
          because the copy does not carry one. */}
      <div className="mt-16">
        <div className="mb-10 flex items-center justify-center gap-3" aria-hidden>
          <span
            className="h-px w-16"
            style={{ background: `linear-gradient(90deg, transparent, ${C.goldMid})` }}
          />
          <span className="text-[11px]" style={{ color: C.goldDeep }}>
            ✦
          </span>
          <span
            className="h-px w-16"
            style={{ background: `linear-gradient(90deg, ${C.goldMid}, transparent)` }}
          />
        </div>

        <ScreenshotRail />
      </div>

    </section>
  );
}
