import { AnimatePresence, motion } from 'motion/react';
import { useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import type { ProcessRowPhonePiP } from '../data/content';
import { useEscapeKey } from '../hooks/useEscapeKey';
import { Overlay } from './Overlay';

/**
 * Slightly wider than a real phone's 390:844 — the point of opening this at
 * all is to see the app at a substantial size, and the true device ratio
 * still reads as narrow even at full viewport height. Wide enough to feel
 * substantial without losing the phone silhouette entirely.
 */
const LIGHTBOX_RATIO = '480 / 844';

/**
 * Caps the lightbox phone to real device height, but never taller than the
 * scrim actually has room for. `Overlay`'s default scrim reserves
 * `clamp(24px,5vh,64px)` of padding top and bottom, so the frame has to
 * subtract both before capping — a flat `90vh` guess left the frame plus
 * that padding taller than the viewport on shorter screens, which is what
 * put a scrollbar on the scrim instead of just showing the whole phone.
 */
const LIGHTBOX_MAX_HEIGHT = 'min(844px, calc(100dvh - 2 * clamp(24px, 5vh, 64px)))';

/** The notch: a fixed strip along the top rather than a shape cut out of the frame. */
function Notch() {
  return <div className="absolute top-2 left-1/2 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-[#111216]" />;
}

/**
 * A live prototype opened in a full-screen, phone-shaped lightbox, for a
 * process row whose artefact is a mobile screen rather than a desktop one.
 *
 * Named to match `prototype`'s picture-in-picture framing on the rest of the
 * site, but there is no static mockup here to swap with — this row's brief
 * carries no image of its own, only the live embed. Rather than an inline
 * preview frame sitting in the row (a phone shown at case-study scale reads
 * as a small mockup, not a working app, no matter how it's cropped or
 * scaled), the row is just a trigger, and the actual device only appears
 * once, full screen, once the reader asks for it.
 *
 * Styled like the site's one other real call-to-action button (the resume
 * download) rather than a bare text link — this button is the entire
 * content of its slot, not a caption under an image, and needed the visual
 * weight to read as the row's actual artefact. Centred both ways in the
 * slot, filling the column the way an image would.
 */
export function PrototypePhonePiP({ pip }: { pip: ProcessRowPhonePiP }) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  useEscapeKey(close);

  return (
    <div className="flex h-full min-h-[160px] w-full items-center justify-center">
      <motion.button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex cursor-pointer items-center gap-2.5 rounded-xl border border-teal bg-[#005961]/10 px-5 py-3 font-heading text-[15px] font-bold text-teal"
        whileHover={{ y: -2, backgroundColor: 'rgba(0,184,201,0.1)' }}
        transition={{ duration: 0.2 }}
      >
        Open prototype in full screen ↗
      </motion.button>

      {/*
        Portalled to `document.body` rather than left in place: the project
        modal panel around this row has its own `backdrop-blur`, which (like
        `transform`) creates a containing block for `position: fixed`
        descendants — the scrim otherwise clips to the panel's own bounds
        instead of covering the real viewport, and reads as a lightbox stuck
        inside the case study rather than a full-screen view of the phone.
      */}
      {createPortal(
        <AnimatePresence>
          {open && (
            <Overlay z="z-70" onClose={close}>
              <div
                className="mx-auto shrink-0 rounded-[2.6rem] border-[6px] border-[#2a2b30] bg-[#111216] p-2 shadow-[0_24px_60px_rgba(0,0,0,.5),inset_0_1px_0_rgba(255,255,255,.08)]"
                style={{ height: LIGHTBOX_MAX_HEIGHT, aspectRatio: LIGHTBOX_RATIO }}
              >
                {/*
                  No scale transform on the iframe — a transformed iframe's
                  own scroll no longer lines up with where the pointer or
                  touch gesture lands, which left content past the first
                  screenful unreachable. The frame's real rendered height
                  sets the iframe's own size directly instead, so the
                  embedded page is a genuinely scrollable document, the same
                  as opening it in a real browser tab would be.
                */}
                <div className="relative size-full overflow-hidden rounded-[2rem] bg-black">
                  <Notch />
                  <iframe title="Live prototype (full size)" src={pip.embedUrl} className="size-full border-0" />
                </div>
              </div>
            </Overlay>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </div>
  );
}
