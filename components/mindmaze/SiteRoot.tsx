'use client';

import { useEffect, useState, type ReactNode } from 'react';

/** Scope wrapper for the puzzle site; adds `js` once hydrated, which turns on the entrances. */
export default function SiteRoot({ className, children }: { className: string; children: ReactNode }) {
  const [js, setJs] = useState(false);
  useEffect(() => setJs(true), []);
  return <div className={`mm ${className}${js ? ' js' : ''}`}>{children}</div>;
}
