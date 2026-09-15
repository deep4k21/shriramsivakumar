import { AnimatePresence, motion } from 'motion/react';
import { useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import type { ProcessRowPhonePiP } from '../data/content';
import { useEscapeKey } from '../hooks/useEscapeKey';
import { Overlay } from './Overlay';
import { PrototypeLoader } from './PrototypeLoader';

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
 * carries no image of its own for the *device* embed, only the live URL.
 * Rather than an inline live preview frame sitting in the row (a phone
 * shown at case-study scale reads as a small mockup, not a working app, no
 * matter how it's cropped or scaled), the row is a clickable banner — the
 * same image-fills-a-bordered-box treatment the project's own hero uses —
 * and the actual device only appears once, full screen, once the reader
 * clicks it.
 */
export function PrototypePhonePiP({ pip }: { pip: ProcessRowPhonePiP }) {
  const [open, setOpen] = useState(false);
  // Lives on the parent rather than the iframe unmounting/remounting it:
  // `{open && ...}` looks like it would reset this for free, but the iframe
  // itself commonly keeps its already-loaded document cached across a
  // close/reopen (no fresh network request, no fresh `onLoad`) — so it has
  // to be re-armed by hand on each open, otherwise a reopen after the first
  // successful load would skip the spinner and jump straight to a frame
  // that then never fires `onLoad` again.
  const [loaded, setLoaded] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  useEscapeKey(close);

  return (
    <div className="w-full">
      <motion.button
        type="button"
        onClick={() => {
          setLoaded(false);
          setOpen(true);
        }}
        className="relative grid aspect-5/1 w-full cursor-pointer items-center justify-start overflow-hidden rounded-[14px] border-0 p-0 pl-[clamp(20px,4vw,48px)]"
        whileHover="hover"
      >
        <img src={pip.image} alt="" aria-hidden="true" className="absolute inset-0 size-full object-cover object-center" />
        {/*
          A scrim over the artwork rather than beside it — the banner is the
          whole slot, so the call to action has to sit legibly on top of the
          image, not squeezed into a caption strip under it. Darkens further
          on hover, the same cue a filled button's own hover state gives.
        */}
        <motion.div
          className="absolute inset-0 bg-black/35"
          variants={{ hover: { backgroundColor: 'rgba(0,0,0,.5)' } }}
          transition={{ duration: 0.2 }}
        />
        <motion.span
          className="relative inline-flex items-center gap-2.5 rounded-xl border border-teal bg-[#0b1416]/80 px-5 py-3 font-heading text-[15px] font-bold text-teal backdrop-blur-sm"
          variants={{ hover: { y: -2, backgroundColor: 'rgba(0,89,97,.7)' } }}
          transition={{ duration: 0.2 }}
        >
          Open prototype in full screen ↗
        </motion.span>
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
                  {!loaded && <PrototypeLoader />}
                  <iframe
                    title="Live prototype (full size)"
                    src={pip.embedUrl}
                    className="size-full border-0"
                    onLoad={() => setLoaded(true)}
                  />
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
