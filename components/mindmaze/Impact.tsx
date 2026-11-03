'use client';

import type { TKey } from '@/lib/i18n';
import { useLang } from './LanguageProvider';
import Rise from './Rise';

const SKILLS: TKey[] = ['s1', 's2', 's3', 's4', 's5', 's6'];

/** What a puzzle leaves behind: the skills parents and teachers notice. */
export default function Impact() {
  const { t } = useLang();
  return (
    <section id="impact" className="band alt">
      <div className="wrap split">
        <Rise index={16}>
          <h2>
            <span>{t('h5a')}</span> <em>{t('h5b')}</em>
          </h2>
        </Rise>
        <Rise index={17}>
          <div className="skills">
            {SKILLS.map((k) => (
              <span key={k}>{t(k)}</span>
            ))}
          </div>
        </Rise>
      </div>
    </section>
  );
}
