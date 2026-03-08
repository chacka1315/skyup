'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const STORAGE_PREFIX = 'protected-scroll:';
const VIEWPORT_SELECTOR = '#protected-scroll-area [data-slot="scroll-area-viewport"]';

export default function FeedScrollRestoration() {
  const pathname = usePathname();

  useEffect(() => {
    const viewport = document.querySelector(VIEWPORT_SELECTOR) as HTMLElement | null;
    if (!viewport) return;

    const storageKey = `${STORAGE_PREFIX}${pathname}`;
    const saved = sessionStorage.getItem(storageKey);
    if (saved) {
      viewport.scrollTop = Number(saved);
    }

    const onScroll = () => {
      sessionStorage.setItem(storageKey, String(viewport.scrollTop));
    };

    viewport.addEventListener('scroll', onScroll, { passive: true });
    return () => viewport.removeEventListener('scroll', onScroll);
  }, [pathname]);

  return null;
}
