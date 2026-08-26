'use client';

/**
 * Everything below the hero, in the order COPY-SOURCE.md sets out:
 *
 *   3  What you'll experience .... this file
 *   4  Your 5-Day Schedule ....... this file  ← the signature beat
 *   5  Live sessions band ........ this file
 *   6  Does this sound like you? . this file
 *   7  Testimonials + text wall .. ./proof
 *   8  The toolkit ............... ./toolkit
 *   9  Meet your guide ........... ./close
 *  10  Why this works ............ ./close
 *  11  The results ............... ./close
 *  12  Two options ............... ./close
 *  13  Recap + final CTA ......... ./close  ← the premium peak
 *  14  Disclaimer + colophon ..... ./close
 *
 * COPY IS VERBATIM. Where the source wraps a sentence across several lines it
 * is joined back into one string; no wording, ordering or punctuation is
 * changed, and nothing is added.
 */
import { ArrowRight, CalendarBlank, Clock, Compass, FlowerLotus, House, Moon, PersonSimpleWalk, UsersThree, VideoCamera, XSquare } from '@phosphor-icons/react/dist/ssr';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

import Close from './close';
import { legoBrick, legoDelay } from './lego-style';
import { domAnimation, LazyMotion } from './motion-lite';
import {
  CHECKOUT_HREF,
  CTA_LABEL,
  CTA_NOTE,
  SESSION_TIMES,
  SESSION_TIMES_TZ,
} from './offer';
import Proof from './proof';
import { C, SectionHeading } from './shared';
import Toolkit from './toolkit';

/* Three beds, rotated. Not seven: the brand has three colours, and a card grid
   that cycles a rainbow reads as decoration rather than as a set. */
const BEDS = [
  { bed: C.goldPale, fg: C.goldInk },
  { bed: C.coralBed, fg: C.coralInk },
  { bed: C.navyBed, fg: C.ink },
];

/* ══ 3 · Here's What You'll Experience In 5 Days ═══════════════════════════
   Seven parallel capabilities, each with a title and a body. A set, not a
   sequence — so it is a grid of equal pieces, and the ordering carries no
   meaning the reader has to follow. */
const EXPERIENCE = [
  {
    icon: VideoCamera,
    title: 'Live, Expert-Led Sessions',
    body: 'Join certified Kaizen coaches live on Zoom every day for guided sessions, real-time support and an experience you can actively participate in from home.',
  },
  {
    icon: PersonSimpleWalk,
    title: 'Movement That Meets You Where You Are',
    body: 'Practise supportive movement without forcing, punishing or pushing your changing body beyond what feels comfortable.',
  },
  {
    icon: FlowerLotus,
    title: 'Tools for Anxious, Restless Moments',
    body: 'Learn simple practices you can return to when anxiety rises, your thoughts feel unsettled or you cannot seem to switch off.',
  },
  {
    icon: Moon,
    title: 'Support for More Restful Sleep',
    body: 'Experience calming techniques that help your mind slow down and your body feel more prepared to rest.',
  },
  {
    icon: Compass,
    title: 'A Deeper Connection With Your Body',
    body: 'Begin recognising the signals your body is sending, instead of feeling confused by symptoms that seem sudden or unrelated.',
  },
  {
    icon: House,
    title: 'Practices You Can Continue at Home',
    body: 'Take away simple movement, mindfulness and breathwork practices that can become part of your routine beyond the five days.',
  },
  {
    icon: UsersThree,
    title: 'A Community That Understands',
    body: 'Connect with women experiencing similar changes, in a space where you can speak openly and feel seen, heard and supported.',
  },
];

function Experience() {
  return (
    <section className="px-4 py-12 sm:py-20 lg:py-24" style={{ background: C.canvas }}>
      <SectionHeading sub="Don't take our word for it. Experience the approach live and see your own progress across 5 days.">
        Here&apos;s What You&apos;ll Experience{' '}
        <span style={{ color: C.goldDeep }}>In 5 Days</span>
      </SectionHeading>

      <ul className="mx-auto mt-14 grid max-w-[1120px] grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {EXPERIENCE.map(({ icon: Icon, title, body }, idx) => {
          /* Seven cards leave a single orphan in the last row at both
             breakpoints (2-col: 3 rows + 1 · 3-col: 2 rows + 1). The orphan
             spans the full row but is width-capped and centred, so it reads as
             one normal card rather than a stranded left-aligned one. The
             widths mirror the gap-5 (20px) track maths at each breakpoint. */
          const isOrphan = idx === EXPERIENCE.length - 1;
          const placement = [
            isOrphan && EXPERIENCE.length % 2 === 1
              ? 'sm:col-span-2 sm:mx-auto sm:w-full sm:max-w-[calc(50%-10px)]'
              : '',
            isOrphan && EXPERIENCE.length % 3 === 1
              ? 'lg:col-span-3 lg:mx-auto lg:max-w-[calc(33.333%-13.334px)]'
              : '',
          ]
            .filter(Boolean)
            .join(' ');
          const skin = BEDS[idx % BEDS.length];

          return (
            <li
              key={title}
              data-lego=""
              className={`lego-hover flex flex-col rounded-3xl p-7 ${placement}`}
              style={{
                ...legoBrick(idx),
                background: C.canvas,
                border: `1px solid ${C.line}`,
                /* A 3px rule along the top edge ties the card to its bed
                   without letting colour take a large area. */
                borderTop: `3px solid ${skin.bed}`,
              }}
            >
              <span
                data-lego-stud=""
                className="lego-stud grid h-12 w-12 place-items-center rounded-2xl"
                style={{ ...legoBrick(idx), background: skin.bed }}
              >
                <Icon weight="duotone" className="h-6 w-6" style={{ color: skin.fg }} />
              </span>
              <h3
                className="mt-5 font-display text-[19px] font-semibold leading-snug"
                style={{ color: C.ink }}
              >
                {title}
              </h3>
              <p className="mt-2.5 text-[14.5px] leading-relaxed" style={{ color: C.inkSoft }}>
                {body}
              </p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/* ══ 4 · Your 5-Day Schedule ═══════════════════════════════════════════════
   The signature beat, and the page's ONE heavy motion moment.

   Five days is a genuine sequence: each one is described as building on the
   last, so the structure is a spine with a filling rail rather than five cards
   in a row. The rail's progress is a single CSS variable written by a
   rAF-throttled scroll handler; nodes ignite as the fill reaches them.
 */
const DAYS = [
  {
    n: 'Day 1',
    title: 'Mat Pilates for Pain & Stiffness',
    body: 'Begin with guided mat Pilates designed to loosen stiff joints and shoulders, ease everyday discomfort and help your body move more comfortably.',
  },
  {
    n: 'Day 2',
    title: 'Hatha Yoga for Stress & Anxiety',
    body: 'Use Hatha Yoga and mindful movement to release built-up tension, settle restlessness and create greater calm in your body and mind.',
  },
  {
    n: 'Day 3',
    title: 'Mat Pilates for Strength & Mobility',
    body: 'Build strength, improve mobility and develop better support through your body with a second guided mat Pilates session.',
  },
  {
    n: 'Day 4',
    title: 'Yoga Nidra + EFT for Better Sleep',
    body: 'Experience Yoga Nidra and EFT practices designed to release built-up stress, quiet a restless mind and prepare your body for deeper sleep.',
  },
  {
    n: 'Day 5',
    title: 'Breathwork for Hormonal Balance',
    body: 'Bring the five days together with guided breathwork that deepens your mind-body connection and helps you feel calmer and more balanced through hormonal changes.',
  },
];

/**
 * Scroll-linked progress for the spine.
 *
 * Writes `--tl-p` (0 → 1) straight onto the <ol> node, so the rail fills
 * without React re-rendering once per frame. The only React state is `active`,
 * which changes five times per pass at most.
 *
 * The "read line" sits at 62% of the viewport height rather than the middle: a
 * day should light as it arrives at the comfortable reading position, not once
 * it has already gone past.
 */
function useSpineProgress(count: number) {
  const olRef = useRef<HTMLOListElement>(null);
  const [active, setActive] = useState(-1);

  useEffect(() => {
    const ol = olRef.current;
    if (!ol) return;

    // Reduced motion: show the finished state and never listen to scroll.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      ol.style.setProperty('--tl-p', '1');
      setActive(count - 1);
      return;
    }

    let raf = 0;
    const measure = () => {
      raf = 0;
      const box = ol.getBoundingClientRect();
      if (!box.height) return;

      const line = window.innerHeight * 0.62;
      const p = Math.min(1, Math.max(0, (line - box.top) / box.height));
      ol.style.setProperty('--tl-p', p.toFixed(4));

      /* offsetTop is no use here: each node's offsetParent is its own <li>,
         not the list. Both rects are current, so the difference is the node's
         position within the rail. */
      const travelled = p * box.height;
      let last = -1;
      ol.querySelectorAll<HTMLElement>('[data-tl-node]').forEach((node, i) => {
        const r = node.getBoundingClientRect();
        if (travelled >= r.top + r.height / 2 - box.top) last = i;
      });
      setActive(last);
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [count]);

  return { olRef, active };
}

function Schedule() {
  const { olRef, active } = useSpineProgress(DAYS.length);

  return (
    <section className="px-4 py-12 sm:py-20 lg:py-24" style={{ background: C.canvasAlt }}>
      <SectionHeading sub={`Each day focuses on a different part of your (peri)menopause reset, from easing pain & stiffness to calming anxiety, building mobility, sleeping better and reconnecting with your changing body. Join live at ${SESSION_TIMES_TZ}.`}>
        Your <span style={{ color: C.goldDeep }}>5-Day Schedule</span>
      </SectionHeading>

      {/* Alternating spine. The rail is centred on desktop and slides to the
          left edge on mobile, where a zig-zag has no room. */}
      <ol ref={olRef} className="relative mx-auto mt-14 max-w-[920px]">
        <span aria-hidden className="tl-rail">
          <span className="tl-fill" />
        </span>

        {DAYS.map((d, i) => {
          const left = i % 2 === 0; // card in the left column on desktop
          return (
            <li
              key={d.n}
              className={`relative mb-6 pl-14 sm:mb-9 sm:w-1/2 sm:pl-0 ${
                left ? 'sm:pr-12 sm:text-right' : 'sm:ml-auto sm:pl-12'
              }`}
            >
              {/* Positioning lives on the outer span and the snap animation on
                  the inner one: one element cannot both hold a centring
                  translate and keyframe its transform. */}
              <span
                data-tl-node
                className={`tl-node ${left ? 'tl-node-right' : 'tl-node-left'} ${
                  i <= active ? 'is-on' : ''
                }`}
              >
                <span aria-hidden className="tl-node-ring" />
                <span className="tl-node-inner">{i + 1}</span>
              </span>

              {/* data-lego-loop, not data-lego: this is the ONE run on the page
                  that replays on every scroll pass, because the spine is meant
                  to be re-read. */}
              <div
                data-lego-loop="x"
                className="lego-hover rounded-2xl p-6"
                style={{
                  ...legoDelay(0),
                  ['--lego-from' as string]: left ? '26px' : '-26px',
                  border: `1px solid ${i <= active ? C.lineStrong : C.line}`,
                  background: C.canvas,
                }}
              >
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${
                    left ? 'sm:flex-row-reverse' : ''
                  }`}
                  style={{ background: C.coralBed, color: C.coralInk }}
                >
                  <CalendarBlank weight="bold" className="lego-stud h-3 w-3" />
                  {d.n}
                </span>
                <h3
                  className="mt-3.5 font-display text-[20px] font-semibold leading-snug"
                  style={{ color: C.ink }}
                >
                  {d.title}
                </h3>
                <p className="mt-2 text-[14px] leading-relaxed" style={{ color: C.inkSoft }}>
                  {d.body}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

/* ══ 5 · Live Sessions, Twice A Day ════════════════════════════════════════
   A CTA band, not a section with a structure: two timings and a click. It is a
   dark CARD inside a light band — the page keeps exactly one dark section, the
   hero. */
function SessionsBand() {
  return (
    <section className="px-4 py-14" style={{ background: C.canvas }}>
      <div
        className="mx-auto max-w-[920px] rounded-[28px] px-6 py-12 text-center sm:px-12"
        style={{
          background: C.navyDeep,
          boxShadow: '0 30px 60px -34px rgba(31,50,92,0.55)',
        }}
      >
        <span
          data-lego=""
          className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[10.5px] font-bold uppercase tracking-[0.2em]"
          style={{ background: 'rgba(242,221,182,0.14)', color: C.gold }}
        >
          <Clock weight="bold" className="h-3 w-3" />
          Live Sessions, Twice A Day
        </span>

        <h2
          className="mx-auto mt-6 max-w-[620px] font-display text-[clamp(26px,3.8vw,38px)] font-semibold leading-[1.16]"
          style={{ color: C.onDark }}
        >
          {SESSION_TIMES}, <span style={{ color: C.gold }}>live on Zoom</span>.
        </h2>
        <p className="mt-3 text-[15.5px]" style={{ color: C.onDarkMute }}>
          Pick whichever time fits your day.
        </p>

        <div className="mx-auto mt-8 flex max-w-[430px] flex-col items-center">
          <Link
            href={CHECKOUT_HREF}
            data-cta
            className="lego-press cta-shimmer group inline-flex min-h-[56px] w-full items-center justify-center gap-2.5 rounded-full px-7 font-body text-[15px] font-bold"
            style={{
              background: C.ctaGold,
              color: C.ink,
              ['--shimmer' as string]: 'rgba(255,255,255,0.55)',
            }}
          >
            <span className="inline-flex items-center gap-2.5">
              {CTA_LABEL}
              <ArrowRight
                weight="bold"
                className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
              />
            </span>
          </Link>
          <p className="mt-3.5 text-[13.5px] font-medium" style={{ color: C.onDarkMute }}>
            {CTA_NOTE}
          </p>
        </div>
      </div>
    </section>
  );
}

/* ══ 6 · Does this sound like you? ═════════════════════════════════════════
   A one-sided self-recognition list: every line is meant to be ticked, so
   there is no second column and nothing to weigh against. The source copy sets
   each line with a ☑️; that becomes a matched-weight checkbox glyph in a coral
   bed, which is the same meaning without the emoji.

   The highlighted phrase in each line is TYPOGRAPHY, not an edit: the words and
   their order are exactly as written. */
const RECOGNITION: [string, string, string][] = [
  [
    'You wake up around ',
    '3 AM',
    ', struggle to fall back asleep and start the next day already exhausted.',
  ],
  [
    'Your joints and shoulders feel ',
    'stiff, heavy or painful',
    ', even when you haven’t done anything differently.',
  ],
  [
    'You experience ',
    'unexplained anxiety, irritability or restlessness',
    ' and don’t always know what triggered it.',
  ],
  [
    '',
    'Brain fog and low energy',
    ' make it harder to think clearly, focus and move through your day like you used to.',
  ],
  [
    'The workouts and wellness routines that once helped you ',
    'no longer feel right for your body',
    ', and you’re unsure whether to push harder, slow down or try something different.',
  ],
  [
    'You may be experiencing ',
    'hot flashes, irregular or missed periods, stubborn weight gain, bloating or digestive discomfort',
    ', without realising these changes may be connected to (peri)menopause.',
  ],
];

function Recognition() {
  return (
    <section className="px-4 py-12 sm:py-20 lg:py-24" style={{ background: C.canvasAlt }}>
      <SectionHeading>
        Does this <span style={{ color: C.goldDeep }}>sound like you</span>?
      </SectionHeading>

      <ul className="mx-auto mt-12 grid max-w-[820px] gap-3">
        {RECOGNITION.map(([pre, hl, post], idx) => (
          <li
            key={hl}
            data-lego=""
            className="lego-hover-sm flex items-start gap-4 rounded-2xl px-5 py-4"
            style={{
              ...legoDelay(idx),
              border: `1px solid ${C.line}`,
              background: C.canvas,
            }}
          >
            <span
              className="lego-stud mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-lg"
              style={{ background: C.coralBed }}
            >
              <XSquare weight="fill" className="h-3.5 w-3.5" style={{ color: C.coralInk }} />
            </span>
            <span className="text-[15px] leading-relaxed" style={{ color: C.inkSoft }}>
              {pre}
              <strong style={{ color: C.ink, fontWeight: 700 }}>{hl}</strong>
              {post}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function BelowFold() {
  /* LazyMotion mounts the single IntersectionObserver that adds `bw-in` to
     revealed elements. Without it every .bw-reveal-* stays at opacity 0 once
     .bw-js is on the document. */
  return (
    <LazyMotion features={domAnimation}>
      <Experience />
      <Schedule />
      <SessionsBand />
      <Recognition />
      <Proof />
      <Toolkit />
      <Close />
    </LazyMotion>
  );
}
