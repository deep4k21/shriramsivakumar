import { motion } from 'motion/react';

/**
 * The loading state every embedded prototype iframe shows until its own
 * `onLoad` fires — a live embed can take a real, visible moment to boot
 * (a cold serverless instance, a client-side app's own bundle and data
 * fetch), and an empty dark box in that window reads as broken rather than
 * as loading. One shared component rather than each iframe wiring its own,
 * so every prototype across every project shows the same spinner.
 *
 * A ring with one bright arc rather than the browser's own default spinner
 * or a bare dot pulse — teal against the tile's own dark backing, matching
 * the accent colour every other loading or active state on the site uses
 * (the FAQ heading, the "open" links, the resume button's icon). Linear,
 * constant-speed rotation rather than the site's usual ease-out curve —
 * that curve is for one-shot enter/exit motion, and a looping spinner that
 * eased in and out on every revolution would read as stuttering.
 */
export function PrototypeLoader() {
  return (
    <div
      // z-20: above a phone frame's notch (z-10) — while loading, the
      // spinner is the only thing in the frame that should read as "live".
      className="absolute inset-0 z-20 flex items-center justify-center bg-[repeating-linear-gradient(120deg,#111316,#111316_9px,#171A1E_9px,#171A1E_18px)]"
      role="status"
      aria-label="Loading prototype"
    >
      <motion.span
        aria-hidden="true"
        className="size-9 rounded-full border-[3px] border-white/10 border-t-teal"
        animate={{ rotate: 360 }}
        transition={{ duration: 0.9, ease: 'linear', repeat: Infinity }}
      />
    </div>
  );
}
