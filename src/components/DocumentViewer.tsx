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

/**
 * Paging in twos for the spread view: `page` is always the left sheet's
 * index, stepping by 2 so the reader advances a full spread at a time rather
 * than shifting one page and leaving the pairing to drift.
 */
function usePairPager(total: number) {
  const [page, setPage] = useState(0);
  const lastLeft = total % 2 === 0 ? total - 2 : total - 1;
  const clamp = useCallback((n: number) => Math.max(0, Math.min(lastLeft, n)), [lastLeft]);
  const prev = useCallback(() => setPage((p) => clamp(p - 2)), [clamp]);
  const next = useCallback(() => setPage((p) => clamp(p + 2)), [clamp]);
  return { page, prev, next, lastLeft };
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

/**
 * Two pages side by side with a gap, for a `wideSlot` row whose column has
 * room for a spread rather than one portrait page surrounded by empty space.
 * A single trailing page (odd page count) sits alone rather than stretching
 * to fill both slots, which would misrepresent it as a spread it isn't.
 */
function SpreadPages({ doc, left, className }: { doc: RowDocument; left: number; className: string }) {
  const right = left + 1;
  return (
    <div className="flex h-full min-h-0 w-full max-w-full items-center justify-center gap-4 self-stretch justify-self-stretch">
      <img
        src={doc.pages[left]}
        alt={`${doc.title}, page ${left + 1} of ${doc.pages.length}`}
        className={className}
        decoding="async"
      />
      {right < doc.pages.length && (
        <img
          src={doc.pages[right]}
          alt={`${doc.title}, page ${right + 1} of ${doc.pages.length}`}
          className={className}
          decoding="async"
        />
      )}
    </div>
  );
}

function Controls({
  page,
  total,
  atStart,
  atEnd,
  onPrev,
  onNext,
  label,
}: {
  page: number;
  total: number;
  /** Overrides the disabled state the plain page/total numbers would imply — needed for the spread pager, which steps by 2 and doesn't always land exactly on `total - 1`. */
  atStart?: boolean;
  atEnd?: boolean;
  onPrev: () => void;
  onNext: () => void;
  /** Overrides the default "NN / NN" label — the spread pager shows a page range instead of a single index. */
  label?: string;
}) {
  const start = atStart ?? page === 0;
  const end = atEnd ?? page === total - 1;
  return (
    <div className="flex flex-none items-center justify-center gap-3 pt-2">
      <button type="button" onClick={onPrev} disabled={start} aria-label="Previous page" className={CONTROL}>
        &lsaquo;
      </button>
      <span className="font-body text-[10px] tracking-[0.14em] text-grey uppercase tabular-nums">
        {label ?? `${pad(page + 1)} / ${pad(total)}`}
      </span>
      <button type="button" onClick={onNext} disabled={end} aria-label="Next page" className={CONTROL}>
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
export function DocumentViewer({
  doc,
  height,
  spread,
  fitHeight,
}: {
  doc: RowDocument;
  height?: string;
  /** Shows two pages side by side instead of one — for a `wideSlot` row whose column is wide enough to hold a spread. */
  spread?: boolean;
  /**
   * The page image's own aspect ratio (width ÷ height). When set, the image
   * area sizes itself to this ratio at the column's full width instead of
   * stretching to `height`/`DEFAULT_HEIGHT` regardless of the image's own
   * proportions — for a wide landscape asset that height otherwise leaves the
   * frame taller than the image needs, with empty glass above or below it.
   */
  fitHeight?: number;
}) {
  const total = doc.pages.length;
  const inline = usePager(total);
  const pair = usePairPager(total);
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
      spread ? pair.prev() : inline.prev();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      spread ? pair.next() : inline.next();
    }
  };

  const openLightbox = () => setLightbox(spread ? pair.page : inline.page);
  const rightOfPair = Math.min(pair.page + 1, total - 1);

  return (
    <>
      <div
        ref={frameRef}
        tabIndex={0}
        role="group"
        aria-label={`${doc.title} — ${total} pages`}
        onKeyDown={onKeyDown}
        className={`flex w-full flex-col overflow-hidden rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal ${GLASS}`}
        style={fitHeight ? undefined : { height: height ?? `${DEFAULT_HEIGHT}px` }}
      >
        <button
          type="button"
          onClick={openLightbox}
          aria-label={`View ${doc.title} full size`}
          className={
            fitHeight
              ? 'grid w-full cursor-pointer place-items-center border-0 bg-transparent p-3'
              : 'grid min-h-0 flex-1 cursor-pointer place-items-center border-0 bg-transparent p-3 pb-5'
          }
          style={fitHeight ? { aspectRatio: String(fitHeight) } : undefined}
        >
          {spread ? (
            <SpreadPages doc={doc} left={pair.page} className="max-h-full max-w-full flex-1 object-contain" />
          ) : (
            <Pages doc={doc} page={inline.page} visible={visible} className="max-h-full max-w-full object-contain" />
          )}
        </button>
        <div className="px-3 pb-3">
          {spread ? (
            <Controls
              page={pair.page}
              total={total}
              atStart={pair.page === 0}
              atEnd={pair.page === pair.lastLeft}
              onPrev={pair.prev}
              onNext={pair.next}
              label={
                rightOfPair > pair.page
                  ? `${pad(pair.page + 1)}–${pad(rightOfPair + 1)} / ${pad(total)}`
                  : `${pad(pair.page + 1)} / ${pad(total)}`
              }
            />
          ) : (
            <Controls page={inline.page} total={total} onPrev={inline.prev} onNext={inline.next} />
          )}
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
