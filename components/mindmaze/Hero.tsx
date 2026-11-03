'use client';

import dynamic from 'next/dynamic';
import { useCallback, useRef, useState } from 'react';
import { useLang } from './LanguageProvider';
import Rise from './Rise';

// three.js only runs in the browser and only loads on this page
const BurrPuzzle = dynamic(() => import('./BurrPuzzle'), { ssr: false });

/** 01: the pinned first screen; the 3D burr assembles over the slot while you scroll. */
export default function Hero() {
  const { t } = useLang();
  const slot = useRef<HTMLDivElement>(null);
  const section = useRef<HTMLElement>(null);
  const [noGl, setNoGl] = useState(false);
  const onSupport = useCallback((ok: boolean) => setNoGl(!ok), []);

  return (
    <>
      <BurrPuzzle slotRef={slot} sectionRef={section} onSupport={onSupport} />
      <section id="puzzles" className="hero" aria-label="MindMaze" ref={section}>
        <div className="sticky">
          <div className="wrap">
            <Rise index={0}>
              <p className="eyebrow">
                <i aria-hidden="true" />
                <span>{t('e2')}</span>
              </p>
              <h1>
                <span>{t('h1a')}</span> <em>{t('h1b')}</em>
              </h1>
              <p className="lede">{t('l1')}</p>
            </Rise>
            <div className="stage-side">
              <div
                className="slot"
                ref={slot}
                role="img"
                aria-label="A six-piece wooden burr puzzle that builds as you scroll. Drag to turn it."
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- fallback only shown without WebGL */}
                {noGl && <img className="fallback" src="/img/cross.webp" alt="" width={692} height={667} />}
              </div>
              <div className="build-info">
                <p className="hint">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                    <path d="M12 3v18M6 15l6 6 6-6" />
                  </svg>
                  <span>{t('hint')}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
