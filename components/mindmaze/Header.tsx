'use client';

import { useEffect, useRef, useState } from 'react';
import type { TKey } from '@/lib/i18n';
import { useLang } from './LanguageProvider';

const LINKS: { id: string; key: TKey }[] = [
  { id: 'puzzles', key: 'nav_puzzles' },
  { id: 'games', key: 'nav_why' },
  { id: 'edu', key: 'nav_edu' },
  { id: 'impact', key: 'nav_impact' },
];

/** Sticky header: logo, section nav that follows the page, EN/MN toggle, Contact, scroll progress. */
export default function Header() {
  const { lang, setLang, t } = useLang();
  const [active, setActive] = useState('puzzles');
  const progress = useRef<HTMLDivElement>(null);

  // highlight the link of the section crossing the middle of the screen
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-45% 0px -50% 0px' },
    );
    document.querySelectorAll('.mm main section[id]').forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  // thin amber bar: how far down the page you are (written straight to the DOM, no re-renders)
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const de = document.documentElement;
      const max = Math.max(1, de.scrollHeight - window.innerHeight);
      if (progress.current) progress.current.style.width = `${(window.scrollY / max) * 100}%`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <header className="mm-header">
      <div className="progress" ref={progress} />
      <nav className="wrap nav" aria-label="Main">
        <a className="logo" href="/" aria-label="MindMaze home" />
        <ul className="links">
          {LINKS.map((l) => (
            <li key={l.id}>
              <a
                href={`#${l.id}`}
                className={active === l.id ? 'active' : undefined}
                aria-current={active === l.id ? 'true' : undefined}
              >
                {t(l.key)}
              </a>
            </li>
          ))}
        </ul>
        <div className="lang" role="group" aria-label="Language">
          <button type="button" aria-pressed={lang === 'en'} onClick={() => setLang('en')}>
            EN
          </button>
          <button type="button" aria-pressed={lang === 'mn'} onClick={() => setLang('mn')}>
            MN
          </button>
        </div>
        <a className="btn sm" href="#contact">
          {t('contact')}
        </a>
      </nav>
    </header>
  );
}
