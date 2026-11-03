'use client';

import Image from 'next/image';
import type { TKey } from '@/lib/i18n';
import { useLang } from './LanguageProvider';
import Rise from './Rise';

const GAMES: { t: TKey; s: TKey; tag: 'int' | 'dis'; img: string; w: number; h: number }[] = [
  { t: 'g0t', s: 'g0s', tag: 'int', img: 'star', w: 720, h: 586 },
  { t: 'g1t', s: 'g1s', tag: 'int', img: 'cross', w: 692, h: 667 },
  { t: 'g2t', s: 'g2s', tag: 'int', img: 'crosslock', w: 726, h: 760 },
  { t: 'g3t', s: 'g3s', tag: 'dis', img: 'oyun-tulkhuur', w: 760, h: 340 },
  { t: 'g4t', s: 'g4s', tag: 'dis', img: 'bugj', w: 645, h: 700 },
  { t: 'g5t', s: 'g5s', tag: 'int', img: 'snowflake', w: 720, h: 656 },
];

/** 02: six traditional Mongolian puzzles on warm wood cards. */
export default function Games() {
  const { t } = useLang();
  return (
    <section id="games" className="band">
      <div className="wrap">
        <Rise className="head" index={1}>
          <div>
            <p className="eyebrow">
              <i aria-hidden="true" />
              <span>{t('e3')}</span>
            </p>
            <h2>
              <span>{t('g_a')}</span> <em>{t('g_b')}</em>
            </h2>
          </div>
          <p className="lede">{t('g_l')}</p>
        </Rise>
        <div className="games">
          {GAMES.map((g, i) => (
            <Rise as="article" className="game" index={2 + i} key={g.img}>
              <div className="game-top">
                <div>
                  <h3>{t(g.t)}</h3>
                  <span>{t(g.s)}</span>
                </div>
                <span className={`tag ${g.tag}`}>{t(g.tag === 'int' ? 'tag_int' : 'tag_dis')}</span>
              </div>
              <figure>
                <Image src={`/img/${g.img}.webp`} width={g.w} height={g.h} alt={`${t(g.t)}, ${t(g.s)}`} sizes="(max-width: 560px) 84vw, (max-width: 960px) 40vw, 340px" />
              </figure>
            </Rise>
          ))}
        </div>
      </div>
    </section>
  );
}
