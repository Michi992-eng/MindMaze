'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import type { TKey } from '@/lib/i18n';
import { useInView } from '@/lib/useInView';
import { useLang } from './LanguageProvider';
import Rise from './Rise';

const GLANCE: [TKey, TKey][] = [
  ['gk0', 'gv0'],
  ['gk1', 'gv1'],
  ['gk2', 'gv2'],
  ['gk3', 'gv3'],
  ['gk4', 'gv4'],
  ['gk5', 'gv5'],
];
const STATS: [number, TKey][] = [
  [78, 'st0'],
  [64, 'st1'],
  [91, 'st2'],
];

/** A percentage that counts up from 0 the first time it is on screen. */
function CountUp({ end }: { end: number }) {
  const [ref, inView] = useInView<HTMLElement>({ threshold: 0.6 });
  const [value, setValue] = useState(end);

  useEffect(() => {
    if (!inView || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t0 = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const k = Math.min(1, (t - t0) / 1400);
      setValue(Math.round(end * (1 - Math.pow(1 - k, 3))));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    tick(t0);
    return () => cancelAnimationFrame(raf);
  }, [inView, end]);

  return <b ref={ref}>{value}%</b>;
}

const FIG = { width: 696, height: 817, sizes: '(max-width: 860px) 100vw, 400px', alt: '' };

/** MindMaze EDU: how a program works, at a glance, and early results. */
export default function Edu() {
  const { t } = useLang();
  return (
    <section id="edu" className="band" aria-labelledby="edu-title">
      <div className="wrap">
        <div className="edu-head">
          <Rise index={13}>
            <p className="edu-kicker">{t('edu_k')}</p>
            <h2 id="edu-title">
              {t('edu_a')} <em>{t('edu_b')}</em>
            </h2>
            <p className="edu-intro">{t('edu_i')}</p>
          </Rise>
          <figure className="fig" aria-label="Illustration: a person whose head is a wooden burr puzzle">
            <Image src="/img/fig-body.webp" {...FIG} />
            <Image className="head-l" src="/img/fig-head.webp" {...FIG} />
            <Image className="hand-l" src="/img/fig-hand.webp" {...FIG} />
          </figure>
        </div>
        <div className="edu-body">
          <Rise index={14}>
            <h3 className="edu-h">{t('edu_g')}</h3>
            <table className="glance">
              <tbody>
                {GLANCE.map(([k, v]) => (
                  <tr key={k}>
                    <th scope="row">{t(k)}</th>
                    <td>{t(v)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Rise>
          <Rise index={15}>
            <h3 className="edu-h">{t('edu_s')}</h3>
            <p className="edu-note">{t('edu_n')}</p>
            <div className="stats">
              {STATS.map(([n, label]) => (
                <div key={n}>
                  <CountUp end={n} />
                  <span>{t(label)}</span>
                </div>
              ))}
            </div>
          </Rise>
        </div>
      </div>
    </section>
  );
}
