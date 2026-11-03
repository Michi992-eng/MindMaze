'use client';

import Image from 'next/image';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { TKey } from '@/lib/i18n';
import { useLang } from './LanguageProvider';
import Rise from './Rise';

/** How long each photo rests in the middle before the next step. */
const HOLD_MS = 3000;
/** One step: every card slides, resizes and re-zigzags into its next slot. */
const SLIDE_MS = 850;
/** Reduced motion: each half of the crossfade that replaces the slide. */
const FADE_MS = 160;

/* Geometry, in units of the centre card's side S (measured from the reference at 1280×720,
   where S = 596px = 83% of the stage height). The stage sizes S in CSS (--S); these place cards. */
const SIDE = 0.5; // side cards are exactly half the centre card
const GAP = 68 / 596; // gap between the centre card and a side card
const NEAR = 0.5 + GAP + SIDE / 2; // centre-to-centre distance of the first side card
const STEP = SIDE + GAP; // and each card beyond it
const ZIG = (1 - SIDE) / 2; // vertical offset that lines a side card up with the centre's top/bottom edge

type Shot = { n: number; alt: TKey };

// same 20 photos, same order as the old reel
const SHOTS: Shot[] = [16, 9, 1, 10, 13, 3, 18, 11, 5, 14, 7, 12, 15, 2, 20, 6, 17, 4, 19, 8].map((n) => ({
  n,
  alt: `mp${n}` as TKey,
}));
const N = SHOTS.length;
const mod = (k: number) => ((k % N) + N) % N;
const pad = (i: number) => String(i).padStart(2, '0');

/** cubic-bezier(0.65, 0, 0.35, 1), solved for y at time x. */
function ease(x: number): number {
  const [x1, y1, x2, y2] = [0.65, 0, 0.35, 1];
  const bx = (t: number) => 3 * x1 * t * (1 - t) ** 2 + 3 * x2 * t * t * (1 - t) + t ** 3;
  const by = (t: number) => 3 * y1 * t * (1 - t) ** 2 + 3 * y2 * t * t * (1 - t) + t ** 3;
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2;
    if (bx(mid) < x) lo = mid;
    else hi = mid;
  }
  return by((lo + hi) / 2);
}

/** Horizontal centre of slot d (any real d), in S. */
function slotX(d: number): number {
  const a = Math.abs(d);
  const x = a <= 1 ? a * NEAR : NEAR + (a - 1) * STEP;
  return Math.sign(d) * x;
}

/** Scale at slot d: 1 in the middle, SIDE from the first side slot outwards. */
function slotScale(d: number): number {
  const a = Math.min(1, Math.abs(d));
  return 1 + (SIDE - 1) * a;
}

/**
 * Resting vertical offset (in S) of slot d when photo `pos` is centred. The zigzag flips every step:
 * at even positions the left card is level with the top edge (−) and the right with the bottom (+).
 */
function restY(d: number, pos: number): number {
  if (d === 0) return 0;
  const flip = pos % 2 === 0 ? 1 : -1;
  return Math.sign(d) * flip * (Math.abs(d) % 2 === 1 ? 1 : -1) * ZIG;
}

type Motion = { from: number; to: number; start: number };

/** "Moments from the classroom": a focus slider. The centre photo is a large square; its half-size
 *  neighbours peek in from the stage edges, one level with its top edge and one with its bottom. */
export default function MomentsReel() {
  const { t } = useLang();
  const stage = useRef<HTMLDivElement>(null);
  const cards = useRef(new Map<number, HTMLLIElement>());

  // `pos` is unbounded (slot k shows SHOTS[k mod N]), so cards always enter from the side they travel to
  const [pos, setPos] = useState(0);
  const posRef = useRef(0);
  const motion = useRef<Motion | null>(null); // the step in flight
  const queued = useRef(0); // presses made during a step, played right after it
  const raf = useRef(0);

  const [reduce, setReduce] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);
  const [fading, setFading] = useState(false);
  const [restTick, setRestTick] = useState(0); // bumps when a step ends, restarting the hold timer

  /** Places every card for the current moment: at rest, or part-way through a step. */
  const paint = useCallback((now: number) => {
    const m = motion.current;
    let p = posRef.current; // continuous position of the stage
    let e = 1;
    if (m) {
      e = ease(Math.min(1, (now - m.start) / SLIDE_MS));
      p = m.from + (m.to - m.from) * e;
    }
    cards.current.forEach((el, k) => {
      const d = k - p;
      let y: number;
      if (m) {
        // vertical offset fades out over the first half and back in (to the new zigzag) over the second,
        // so at the halfway point both moving cards are vertically centred
        const yFrom = restY(k - m.from, m.from);
        const yTo = restY(k - m.to, m.to);
        y = yFrom * Math.max(0, 1 - 2 * e) + yTo * Math.max(0, 2 * e - 1);
      } else {
        y = restY(k - p, p);
      }
      el.style.transform = `translate3d(calc(${slotX(d).toFixed(5)} * var(--S)), calc(${y.toFixed(5)} * var(--S)), 0) scale(${slotScale(d).toFixed(5)})`;
    });
  }, []);

  const go = useCallback(
    (dir: 1 | -1) => {
      if (motion.current || fading) {
        queued.current = Math.max(-2, Math.min(2, queued.current + dir));
        return;
      }
      const from = posRef.current;
      const to = from + dir;
      if (reduce) {
        // quick crossfade instead of the slide
        setFading(true);
        window.setTimeout(() => {
          posRef.current = to;
          setPos(to);
          setFading(false);
          setRestTick((n) => n + 1);
        }, FADE_MS);
        return;
      }
      posRef.current = to;
      setPos(to); // mounts the incoming card; the layout effect paints it at its start slot
      motion.current = { from, to, start: performance.now() };
      const tick = (now: number) => {
        paint(now);
        const m = motion.current;
        if (m && now - m.start < SLIDE_MS) {
          raf.current = requestAnimationFrame(tick);
          return;
        }
        motion.current = null;
        paint(now);
        setRestTick((n) => n + 1);
        if (queued.current !== 0) {
          const next: 1 | -1 = queued.current > 0 ? 1 : -1;
          queued.current -= next;
          goRef.current(next);
        }
      };
      cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(tick);
    },
    [fading, paint, reduce],
  );
  const goRef = useRef(go);
  useLayoutEffect(() => {
    goRef.current = go;
  });

  // every render (new cards mounted, language switched…) repaints synchronously before the browser does
  useLayoutEffect(() => {
    paint(performance.now());
  });

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const on = () => setReduce(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);

  // autoplay only while the stage is on screen
  useEffect(() => {
    const el = stage.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // hold, then step; restarts after every step and whenever a pause ends
  useEffect(() => {
    if (reduce || hovered || focused || !visible) return;
    const id = window.setTimeout(() => {
      if (document.visibilityState === 'visible') goRef.current(1);
      else setRestTick((n) => n + 1);
    }, HOLD_MS);
    return () => window.clearTimeout(id);
  }, [reduce, hovered, focused, visible, restTick]);

  // swipe
  const swipe = useRef<{ x: number; y: number } | null>(null);
  const swiped = useRef(false);

  const index = mod(pos);
  const slots: number[] = [];
  for (let k = pos - 3; k <= pos + 3; k++) slots.push(k);

  return (
    <section id="moments" className="band" aria-labelledby="moments-title">
      <div className="wrap">
        <Rise className="head" index={12}>
          <div>
            <p className="eyebrow">
              <i aria-hidden="true" />
              <span>{t('m_e')}</span>
            </p>
            <h2 id="moments-title">
              <span>{t('m_a')}</span> <em>{t('m_b')}</em>
            </h2>
          </div>
          <p className="lede">{t('m_l')}</p>
        </Rise>

        <div
          className="focus"
          role="region"
          aria-roledescription="carousel"
          aria-label={t('m_label')}
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight') {
              e.preventDefault();
              go(1);
            } else if (e.key === 'ArrowLeft') {
              e.preventDefault();
              go(-1);
            }
          }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onFocus={() => setFocused(true)}
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false);
          }}
        >
          <div
            ref={stage}
            className={fading ? 'focus-stage is-fading' : 'focus-stage'}
            tabIndex={0}
            aria-label={t('m_keys')}
            onPointerDown={(e) => {
              swipe.current = { x: e.clientX, y: e.clientY };
              swiped.current = false;
            }}
            onPointerUp={(e) => {
              const s = swipe.current;
              swipe.current = null;
              if (!s) return;
              const dx = e.clientX - s.x;
              if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(e.clientY - s.y)) {
                swiped.current = true;
                go(dx < 0 ? 1 : -1);
              }
            }}
            onPointerCancel={() => {
              swipe.current = null;
            }}
          >
            <ul className="focus-track">
              {slots.map((k) => {
                const d = k - pos;
                const i = mod(k);
                const shot = SHOTS[i];
                const side = Math.abs(d) === 1;
                return (
                  <li
                    key={k}
                    ref={(el) => {
                      if (el) cards.current.set(k, el);
                      else cards.current.delete(k);
                    }}
                    className={d === 0 ? 'focus-card is-centre' : 'focus-card'}
                    role="group"
                    aria-roledescription="slide"
                    aria-label={t('m_of').replace('{n}', String(i + 1)).replace('{total}', String(N))}
                    aria-hidden={Math.abs(d) > 1 || undefined}
                    onClick={() => {
                      if (side && !swiped.current) go(d > 0 ? 1 : -1);
                    }}
                  >
                    <Image
                      src={`/img/class-${shot.n}.webp`}
                      alt={t(shot.alt)}
                      fill
                      sizes="(max-width: 639px) 72vw, (max-width: 1240px) 45vw, 560px"
                      preload={pos === 0 && (k === 0 || k === 1)}
                      loading={Math.abs(d) <= 1 ? 'eager' : 'lazy'}
                      draggable={false}
                    />
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="focus-nav">
            <button type="button" className="focus-btn" aria-label={t('m_prev')} onClick={() => go(-1)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M19 12H5M11 6l-6 6 6 6" />
              </svg>
            </button>
            <p className="focus-count" aria-live={hovered || focused ? 'polite' : 'off'}>
              <b>{pad(index + 1)}</b> / {pad(N)}
            </p>
            <button type="button" className="focus-btn" aria-label={t('m_next')} onClick={() => go(1)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
