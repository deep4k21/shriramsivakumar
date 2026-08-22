import { motion } from 'motion/react';
import type { ReactNode } from 'react';

const EASE_OUT = [0.2, 0.7, 0.2, 1] as const;

interface OverlayProps {
  /** Stacking order — project sheets sit above category sheets, connect above both. */
  z: string;
  onClose: () => void;
  className?: string;
  /** Scrim + padding utilities. Defaults to the dark blurred sheet backdrop. */
  scrimClassName?: string;
  children: ReactNode;
}

const DEFAULT_SCRIM = 'bg-black/72 px-6 py-10 backdrop-blur-md';

/**
 * Shared full-screen overlay: the scrim fades, the panel rises and scales in,
 * and both reverse on exit (driven by AnimatePresence in App).
 */
export function Overlay({ z, onClose, className, scrimClassName = DEFAULT_SCRIM, children }: OverlayProps) {
  return (
    <motion.div
      onClick={onClose}
      className={`fixed inset-0 ${z} grid place-items-start justify-items-center overflow-y-auto ${scrimClassName}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease: EASE_OUT }}
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        className={className}
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.985 }}
        transition={{ duration: 0.32, ease: EASE_OUT }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
