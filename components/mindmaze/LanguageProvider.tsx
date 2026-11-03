'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { DICTS, LANG_STORAGE_KEY, type Lang, type TKey } from '@/lib/i18n';
import { getLang as getSiteLang, setLang as setSiteLang } from '@/lib/lang';

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: (key: TKey) => string };

const LanguageContext = createContext<Ctx | null>(null);

function readStored(): Lang | null {
  try {
    const v = window.localStorage.getItem(LANG_STORAGE_KEY);
    return v === 'mn' || v === 'en' ? v : null;
  } catch {
    return null;
  }
}

/**
 * EN / MN for the puzzle site. The server and the first client render are always English,
 * so hydration matches; the saved choice (localStorage, or the language picked on another
 * page of the site) is applied right after mounting.
 */
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en');

  const apply = useCallback((l: Lang, save: boolean) => {
    setLangState(l);
    setSiteLang(l); // keeps <html lang> and the rest of the site in step
    if (save) {
      try {
        window.localStorage.setItem(LANG_STORAGE_KEY, l);
      } catch {
        /* storage blocked: the choice just lasts for this visit */
      }
    }
  }, []);

  useEffect(() => {
    apply(readStored() ?? getSiteLang(), false);
  }, [apply]);

  const setLang = useCallback((l: Lang) => apply(l, true), [apply]);
  const value = useMemo<Ctx>(() => ({ lang, setLang, t: (key) => DICTS[lang][key] }), [lang, setLang]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLang(): Ctx {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLang must be used inside <LanguageProvider>');
  return ctx;
}

/** A translated string, for use inside server-rendered markup. */
export function T({ k }: { k: TKey }) {
  return <>{useLang().t(k)}</>;
}
