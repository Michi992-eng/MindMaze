'use client';

import { useEffect, useRef, useState } from 'react';
import type { TKey } from '@/lib/i18n';
import { useLang } from './LanguageProvider';
import Rise from './Rise';

const EMAIL = 'hello@mindmaze.mn';

/** Contact: the email as selectable text with a Copy button. */
export default function Footer() {
  const { t } = useLang();
  const mail = useRef<HTMLElement>(null);
  const [label, setLabel] = useState<TKey>('copy');
  const timer = useRef(0);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const select = () => {
    const el = mail.current;
    const sel = window.getSelection();
    if (!el || !sel) return;
    const r = document.createRange();
    r.selectNodeContents(el);
    sel.removeAllRanges();
    sel.addRange(r);
    setLabel('copy_sel');
  };

  const copy = () => {
    const done = () => {
      setLabel('copied');
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setLabel('copy'), 1600);
    };
    try {
      navigator.clipboard.writeText(EMAIL).then(done, select);
    } catch {
      select(); // no Clipboard API (e.g. plain http): select the text so it can be copied by hand
    }
  };

  return (
    <footer id="contact" className="mm-footer">
      <div className="wrap">
        <div className="cta-grid">
          <Rise index={18}>
            <h2>
              <span>{t('fa')}</span> <em>{t('fb')}</em>
            </h2>
            <div className="mail-row">
              <p>{t('fc')}</p>
              <div className="mail">
                <strong ref={mail}>{EMAIL}</strong>
                <button type="button" className="btn ghost sm" onClick={copy} aria-live="polite">
                  {t(label)}
                </button>
              </div>
            </div>
          </Rise>
        </div>
        <div className="legal">
          <span>© 2026 MINDMAZE</span>
          <span>{EMAIL}</span>
        </div>
      </div>
    </footer>
  );
}
