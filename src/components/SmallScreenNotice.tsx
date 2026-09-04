import { motion } from 'motion/react';
import { CONNECT_LINKS } from '../data/content';
import { DownloadCircleIcon } from './Icons';

const EASE_OUT = [0.2, 0.7, 0.2, 1] as const;

/**
 * Read off `CONNECT_LINKS` rather than written here, so wiring up the real
 * file is a one-line change in `content.ts` that this picks up with the
 * Connect modal. Still the `'#'` placeholder today — no resume PDF exists in
 * the project yet, on this screen or the desktop one.
 */
const RESUME_HREF = CONNECT_LINKS.find((l) => l.label === 'Resume')?.href ?? '#';

/**
 * What a phone or narrow window gets instead of the desktop site.
 *
 * The layout this replaces is built entirely out of pinned sections, a scroll
 * that jumps between fixed stops, and outlines that fly between measured
 * boxes across viewport-sized distances. None of that degrades into a small
 * screen — it breaks — so rather than shipping a broken version, this stands
 * in until a real mobile layout exists.
 *
 * It still carries the site's own surface: the chalkboard ground, the drawn
 * plane, the teal/orange pairing and the same contact links the Connect modal
 * offers, so a reader who lands here on a phone has both the explanation and
 * a way to reach him.
 */
export function SmallScreenNotice() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-7 px-7 py-16 text-center">
      <motion.img
        src="/images/doodles/plane-arrow.svg"
        alt=""
        aria-hidden="true"
        className="h-auto w-[132px] select-none"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE_OUT }}
      />

      <motion.div
        className="flex flex-col gap-3.5"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.08, ease: EASE_OUT }}
      >
        <div className="font-body text-[11px] tracking-[0.18em] text-teal">SHRIRAM SIVAKUMAR</div>
        <h1 className="m-0 font-heading text-[clamp(26px,7.5vw,34px)]/[1.25] font-semibold tracking-[-0.02em] text-white text-balance">
          Best viewed on <span className="text-orange">desktop</span>
        </h1>
        <p className="m-0 max-w-[34ch] font-body text-[15px]/[1.7] text-grey text-pretty">
          This portfolio leans on a full-width canvas — pinned sections, a
          scroll that moves in steps, and artwork that travels between them. The
          mobile version is still being drawn.
        </p>
      </motion.div>

      {/*
        The resume gets its own button rather than a chip in the row below:
        it is the one thing a reader on a phone is most likely to have come
        for, and the desktop site gives it the same prominence in Intro.

        Same teal outline as that button, minus its paper-plane flight — that
        animation measures its own launch point against a wide layout, and
        there is no room here for it to travel through.
      */}
      <motion.a
        href={RESUME_HREF}
        {...(RESUME_HREF === '#'
          ? // No file wired up yet, on this screen or the desktop one. Left
            // inert rather than navigating to the top of the page, which is
            // what a bare `#` would otherwise do.
            { onClick: (e: React.MouseEvent) => e.preventDefault(), 'aria-disabled': true }
          : { download: true })}
        className="inline-flex items-center gap-3 rounded-xl border border-teal bg-[#005961]/10 py-3 pr-4 pl-5 font-heading text-[15px] font-bold text-teal"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.16, ease: EASE_OUT }}
      >
        Download my Resume
        <DownloadCircleIcon size={24} className="flex-none text-teal" />
      </motion.a>

      <motion.div
        className="flex flex-wrap items-center justify-center gap-2"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.24, ease: EASE_OUT }}
      >
        {CONNECT_LINKS.filter((l) => l.label !== 'Resume' && l.href !== '#').map((l) => (
          <a
            key={l.label}
            href={l.href}
            // External profiles open away from the page; `mailto:` has nowhere
            // else to go, so it stays in place. Same rule as the Connect modal.
            {...(l.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            className="rounded-[9px] border border-white/12 bg-white/6 px-4 py-2.5 font-body text-[13px] text-grey transition-colors duration-180 hover:text-teal"
          >
            {l.label}
          </a>
        ))}
      </motion.div>
    </main>
  );
}
