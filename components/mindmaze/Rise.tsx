'use client';

import { createElement, type HTMLAttributes, type ReactNode } from 'react';
import { useInView } from '@/lib/useInView';

type Props = HTMLAttributes<HTMLElement> & {
  as?: 'div' | 'article' | 'figure';
  /** position in the page's sequence of entrances; staggers neighbours by 80ms */
  index?: number;
  children: ReactNode;
};

/** Content that rises gently into place the first time it scrolls into view. */
export default function Rise({ as = 'div', index = 0, className, style, children, ...rest }: Props) {
  const [ref, inView] = useInView<HTMLElement>({ rootMargin: '0px 0px -8% 0px' });
  return createElement(
    as,
    {
      ...rest,
      ref,
      className: ['rise', className, inView && 'in'].filter(Boolean).join(' '),
      style: { transitionDelay: `${(index % 3) * 80}ms`, ...style },
    },
    children,
  );
}
