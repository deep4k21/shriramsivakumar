import { AnimatePresence } from 'motion/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { RowDocument } from '../data/content';
import { useEscapeKey } from '../hooks/useEscapeKey';
import { Overlay } from './Overlay';

/** Default cap on the inline slot; a row can pass its own. */
const DEFAULT_HEIGHT = 480;

/** Glass frame, matching the connect modal's panel treatment. */
const GLASS =
  'bg-[linear-gradient(155deg,rgba(40,42,48,.72),rgba(20,21,25,.66)_40%,rgba(28,30,35,.70))] shadow-[0_20px_60px_rgba(0,0,0,.45),inset_0_1px_0_rgba(255,255,255,.12),inset_0_0_0_1px_rgba(255,255,255,.055)] backdrop-blur-2xl backdrop-saturate-150';

const CONTROL =
  'grid size-9 flex-none cursor-pointer place-items-center rounded-[9px] border-0 bg-white/6 font-body text-base text-white transition-colors duration-180 hover:bg-white/14 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal disabled:cursor-default disabled:opacity-30';

/** Two-digit page numbers, so the indicator does not jitter as it advances. */
const pad = (n: number) => String(n).padStart(2, '0');

/**
 * Paging state shared by the inline viewer and its lightbox, so opening one
 * full-size continues from the page already on screen.
 */
function usePager(total: number, initial = 0) {
  const [page, setPage] = useState(initial);
  const clamp = useCallback((n: number) => Math.max(0, Math.min(total - 1, n)), [total]);
  const prev = useCallback(() => setPage((p) => clamp(p - 1)), [clamp]);
  const next = useCallback(() => setPage((p) => clamp(p + 1)), [clamp]);
  return { page, prev, next };
}

/**
 * Only the current page and its immediate neighbours are rendered, so a
 * forty-seven page document does not fetch forty-seven images when the modal
 * opens. The neighbours are what make paging feel instant.
 */
function useWindowed(page: number, total: number) {
  return useCallback(
    (i: number) => i >= Math.max(0, page - 1) && i <= Math.min(total - 1, page + 1),
    [page, total],
  );
}

function Pages({
  doc,
  page,
  visible,
  className,
}: {
  doc: RowDocument;
  page: number;
  visible: (i: number) => boolean;
  className: string;
}) {
  return (
    <>
      {doc.pages.map((src, i) =>
        visible(i) ? (
          <img
            key={src}
            src={src}
            alt={i === page ? `${doc.title}, page ${i + 1} of ${doc.pages.length}` : ''}
            aria-hidden={i !== page}
            // Neighbours stay mounted but hidden: they are what makes the next
            // page appear immediately rather than fetching on click.
            className={`${className} ${i === page ? '' : 'hidden'}`}
            loading={i === page ? 'eager' : 'lazy'}
            decoding="async"
          />
        ) : null,
      )}
    </>
  );
}

function Controls({
  page,
  total,
  onPrev,
  onNext,
}: {
  page: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex flex-none items-center justify-center gap-3 pt-2">
      <button type="button" onClick={onPrev} disabled={page === 0} aria-label="Previous page" className={CONTROL}>
        &lsaquo;
      </button>
      <span className="font-body text-[10px] tracking-[0.14em] text-grey uppercase tabular-nums">
        {pad(page + 1)} / {pad(total)}
      </span>
      <button
        type="button"
        onClick={onNext}
        disabled={page === total - 1}
        aria-label="Next page"
        className={CONTROL}
      >
        &rsaquo;
      </button>
    </div>
  );
}

/**
 * A multi-page document as a paginated viewer, filling the process row's slot.
 *
 * The slot height is fixed and pages fit inside it, so a portrait cover and a
 * landscape spread both sit in the same frame without resizing the row —
 * letterboxed rather than cropped.
 *
 * Page changes are a swap rather than a transition, which is what the reduced
 * motion preference asks for and costs nothing here: paging a document is not
 * an animation anyone needs.
 *
 * Clicking a page opens it full-size in a lightbox that keeps paging — never a
 * new tab and never a download, matching the rest of the site.
 */
export function DocumentViewer({ doc, height }: { doc: RowDocument; height?: string }) {
  const total = doc.pages.length;
  const inline = usePager(total);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const frameRef = useRef<HTMLDivElement>(null);

  const visible = useWindowed(inline.page, total);
  const closeLightbox = useCallback(() => setLightbox(null), []);
  useEscapeKey(closeLightbox);

  // Arrow keys page through once the viewer has focus. Scoped to the frame
  // rather than the window so they cannot fight the page's own scrolling.
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      inline.prev();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      inline.next();
    }
  };

  return (
    <>
      <div
        ref={frameRef}
        tabIndex={0}
        role="group"
        aria-label={`${doc.title} — ${total} pages`}
        onKeyDown={onKeyDown}
        className={`flex w-full flex-col overflow-hidden rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal ${GLASS}`}
        style={{ height: height ?? `${DEFAULT_HEIGHT}px` }}
      >
        <button
          type="button"
          onClick={() => setLightbox(inline.page)}
          aria-label={`View ${doc.title} full size`}
          className="grid min-h-0 flex-1 cursor-pointer place-items-center border-0 bg-transparent p-3"
        >
          <Pages doc={doc} page={inline.page} visible={visible} className="max-h-full max-w-full object-contain" />
        </button>
        <div className="px-3 pb-3">
          <Controls page={inline.page} total={total} onPrev={inline.prev} onNext={inline.next} />
        </div>
      </div>

      <AnimatePresence>
        {lightbox !== null && <LightboxViewer doc={doc} start={lightbox} onClose={closeLightbox} />}
      </AnimatePresence>
    </>
  );
}

/** The full-size viewer, continuing from the page the inline one was showing. */
function LightboxViewer({ doc, start, onClose }: { doc: RowDocument; start: number; onClose: () => void }) {
  const total = doc.pages.length;
  const { page, prev, next } = usePager(total, start);
  const visible = useWindowed(page, total);

  // Arrows work without focusing anything first — the lightbox owns the screen
  // while it is open, so there is nothing else for them to drive.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev();
      else if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [prev, next]);

  return (
    <Overlay z="z-70" onClose={onClose} className="relative flex max-h-full flex-col items-center gap-3">
      <Pages
        doc={doc}
        page={page}
        visible={visible}
        className="block max-h-[78vh] w-auto max-w-full rounded-[14px] border border-white/9 object-contain"
      />
      <Controls page={page} total={total} onPrev={prev} onNext={next} />
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute top-3 right-3 size-9 cursor-pointer rounded-[9px] border-0 bg-black/70 font-body text-base text-white transition-colors duration-180 hover:bg-black/90"
      >
        ✕
      </button>
    </Overlay>
  );
}
