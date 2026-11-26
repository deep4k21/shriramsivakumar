import { motion } from 'motion/react';
import type { RowPrototypeBanner } from '../data/content';

/**
 * A banner that opens a live prototype in a new tab.
 *
 * Visually the same device as `PrototypePhonePiP` — artwork filling the slot,
 * a scrim for legibility, the call to action sitting on the image rather than
 * under it — but it links out instead of opening a lightbox. A full
 * application wants the whole window and its own URL: framing it in a panel
 * would show a desktop layout at a fraction of its width, and nothing the
 * reader did inside it could be shared or returned to.
 */
export function PrototypeBanner({ banner }: { banner: RowPrototypeBanner }) {
  return (
    <div className="flex w-full flex-col gap-2.5">
      <motion.a
        href={banner.href}
        target="_blank"
        rel="noopener"
        className="relative grid aspect-5/1 w-full cursor-pointer items-center justify-start overflow-hidden rounded-[14px] p-0 pl-[clamp(20px,4vw,48px)] no-underline"
        whileHover="hover"
      >
        <img
          src={banner.image}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 size-full object-cover object-center"
        />
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
          {banner.label}
        </motion.span>
      </motion.a>

      {banner.caption && (
        <p className="m-0 font-body text-[12px]/[1.6] text-[#8A919C]">{banner.caption}</p>
      )}
    </div>
  );
}
