'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';

type Options = { rootMargin?: string; threshold?: number };

/**
 * True once the element has entered the viewport (it stays true afterwards).
 * Used for the gentle entrances and the count-up stats.
 */
export function useInView<T extends Element>({ rootMargin = '0px', threshold = 0 }: Options = {}): [
  RefObject<T | null>,
  boolean,
] {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || inView) return;
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin, threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin, threshold, inView]);

  return [ref, inView];
}

/** Reads `prefers-reduced-motion` once on the client (false during server rendering). */
export function useReducedMotion(): boolean {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduce(mq.matches);
    const on = () => setReduce(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return reduce;
}
