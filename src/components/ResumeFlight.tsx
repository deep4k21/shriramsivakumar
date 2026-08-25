import { AnimatePresence, motion } from 'motion/react';
import { PlaneIcon } from './Icons';

interface FlightPath {
  from: { x: number; y: number };
  to: { x: number; y: number };
}

/**
 * A plane that flies from the resume button toward the browser's downloads
 * area on click.
 *
 * A page can't actually draw over real browser chrome — the toolbar, the
 * downloads tray — that's outside the DOM and sandboxed for security. This
 * approximates the idea instead: the plane launches from the button and heads
 * for the top-right corner of the viewport, which is where that UI usually
 * lives, then fades out there rather than claiming to land on it exactly.
 */
export function ResumeFlight({ path }: { path: FlightPath | null }) {
  return (
    <AnimatePresence>
      {path && (
        <motion.div
          className="pointer-events-none fixed z-[100] text-teal"
          style={{ left: 0, top: 0 }}
          initial={{ x: path.from.x, y: path.from.y, opacity: 0, scale: 0.6, rotate: -8 }}
          animate={{
            x: [path.from.x, path.from.x + (path.to.x - path.from.x) * 0.55, path.to.x],
            y: [path.from.y, path.from.y - 60, path.to.y],
            opacity: [0, 1, 1, 0],
            scale: [0.6, 1, 0.5],
            rotate: [-8, 18, 30],
          }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: [0.3, 0, 0.4, 1], times: [0, 0.6, 1] }}
        >
          <PlaneIcon size={26} className="-translate-x-1/2 -translate-y-1/2" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
