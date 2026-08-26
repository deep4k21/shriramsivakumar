import { useEffect } from 'react';

/**
 * Releases the body scroll lock immediately, without waiting for the locking
 * component to unmount.
 *
 * A modal that scrolls the page as it closes needs this: the lock's own cleanup
 * doesn't run until React unmounts the modal at the end of its exit animation,
 * and until then `window.scrollTo` is a no-op against `overflow: hidden`. The
 * hook's cleanup re-runs harmlessly afterwards.
 */
export function releaseBodyScrollLock() {
  document.body.style.overflow = '';
  document.body.style.paddingRight = '';
}

/**
 * Locks page scroll while active — used by modals so the background page
 * doesn't scroll (and show its own scrollbar) underneath the modal's own
 * scroll container.
 */
export function useBodyScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;

    const { body } = document;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    const previousOverflow = body.style.overflow;
    const previousPaddingRight = body.style.paddingRight;

    body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      const currentPaddingRight = parseFloat(getComputedStyle(body).paddingRight || '0');
      body.style.paddingRight = `${currentPaddingRight + scrollbarWidth}px`;
    }

    return () => {
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPaddingRight;
    };
  }, [active]);
}
