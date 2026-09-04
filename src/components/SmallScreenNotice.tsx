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
    /*
      One centred column with a single spacing rhythm, rather than a stack of
      equal gaps: the name and role belong together, the notice and its
      explanation belong together, and the actions are their own group. The
      gaps below are set per-group so those relationships read, instead of
      four blocks floating at equal distance from each other.
    */
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 py-14 text-center">
      {/*
        The status of this screen, stated first and on its own.

        A pill rather than a sentence inside the paragraph below: it is the
        one line here that is about the site's own progress rather than about
        the work, and burying it mid-paragraph left the reader to find it. In
        the site's green, which is the register it already uses for a state
        rather than a statement.
      */}
      <motion.div
        className="mb-7 inline-flex items-center gap-2 rounded-full border border-green/30 bg-green/10 px-3.5 py-1.5"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE_OUT }}
      >
        <span className="size-1.5 flex-none rounded-full bg-green" aria-hidden="true" />
        <span className="font-body text-[clamp(11px,3.2vw,12.5px)] font-semibold tracking-[0.04em] text-green">
          The mobile version is still being drawn
        </span>
      </motion.div>

      {/*
        The plane sits directly above the name as a signature mark, close
        enough to belong to it. Scaled against the viewport rather than fixed,
        so it holds the same presence on a small phone as on a tablet.
      */}
      <motion.img
        src="/images/doodles/plane-arrow.svg"
        alt=""
        aria-hidden="true"
        className="mb-6 h-auto w-[clamp(140px,42vw,190px)] select-none"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.06, ease: EASE_OUT }}
      />

      {/* Name and role: the largest type here, as on the desktop card. */}
      <motion.div
        className="flex flex-col items-center gap-1.5"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.06, ease: EASE_OUT }}
      >
        <h1 className="m-0 font-heading text-[clamp(28px,8.5vw,40px)]/[1.1] font-bold tracking-[-0.02em] text-white">
          Shriram Sivakumar
        </h1>
        <div className="font-body text-[clamp(13px,3.6vw,15px)] font-semibold text-teal">
          Visual &amp; UI/UX Designer
        </div>
      </motion.div>

      {/*
        The notice itself, set apart from the name above it. Smaller than the
        name deliberately — the reader's own name for the site is the person,
        and this is the caveat about how to view it.
      */}
      <motion.div
        className="mt-9 flex flex-col items-center gap-3"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.12, ease: EASE_OUT }}
      >
        <div className="font-heading text-[clamp(19px,5.4vw,23px)]/[1.3] font-semibold tracking-[-0.01em] text-white">
          Best viewed on <span className="text-orange">desktop</span>
        </div>
        {/*
          `max-w` in characters rather than pixels, so the measure stays
          readable at any of the widths this screen covers instead of running
          to the full width of a tablet.
        */}
        <p className="m-0 max-w-[32ch] font-body text-[clamp(14px,3.9vw,15px)]/[1.65] text-grey text-pretty">
          This portfolio leans on a full-width canvas — pinned sections, a
          scroll that moves in steps, and artwork that travels between them.
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
        className="mt-9 inline-flex items-center gap-3 rounded-xl border border-teal bg-[#005961]/10 py-3.5 pr-4.5 pl-5.5 font-heading text-[15px] font-bold text-teal"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.18, ease: EASE_OUT }}
      >
        Download my Resume
        <DownloadCircleIcon size={24} className="flex-none text-teal" />
      </motion.a>

      {/*
        Contact chips, closer to the resume button than the button is to the
        copy above it: both are actions, so they read as one group.
      */}
      <motion.div
        className="mt-4 flex flex-wrap items-center justify-center gap-2"
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
