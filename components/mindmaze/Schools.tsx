'use client';

import Image from 'next/image';
import type { TKey } from '@/lib/i18n';
import { useLang } from './LanguageProvider';
import Rise from './Rise';

const SCHOOLS: { img: string; h: number; cap: TKey; alt: string }[] = [
  { img: 'school-21', h: 801, cap: 'sc0', alt: 'Students working on wooden puzzles at 21st Secondary School of Ulaanbaatar' },
  { img: 'school-24', h: 801, cap: 'sc1', alt: 'Students working on wooden puzzles at 24th Secondary School of Ulaanbaatar' },
  { img: 'school-uvs1', h: 900, cap: 'sc2', alt: 'Students working on wooden puzzles at 1st Secondary School of Uvurkhangai' },
];
const NEXT: TKey[] = ['ns0', 'ns1', 'ns2', 'ns3'];

/** 03: the schools that use the curriculum, and the next partner schools. */
export default function Schools() {
  const { t } = useLang();
  return (
    <section id="schools" className="band alt">
      <div className="wrap">
        <Rise className="head" index={8}>
          <div>
            <p className="eyebrow">
              <i aria-hidden="true" />
              <span>{t('e4')}</span>
            </p>
            <h2>
              <span>{t('h4a')}</span> <em>{t('h4b')}</em>
            </h2>
          </div>
        </Rise>
        <div className="schools">
          {SCHOOLS.map((s, i) => (
            <Rise as="figure" className="school" index={9 + i} key={s.img}>
              <Image src={`/img/${s.img}.webp`} width={1200} height={s.h} alt={s.alt} sizes="(max-width: 860px) 100vw, 400px" />
              <figcaption>{t(s.cap)}</figcaption>
            </Rise>
          ))}
        </div>
        <h3 className="next-h">{t('ns_h')}</h3>
        <ul className="next-schools">
          {NEXT.map((k) => (
            <li key={k}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M3 4h17v16H6V8h10v8h-6v-4" fill="none" stroke="currentColor" strokeWidth="2" />
              </svg>
              <span>{t(k)}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
