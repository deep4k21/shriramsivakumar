import { motion } from 'motion/react';
import { CATEGORIES, CONNECT_LINKS, RESUME_FILENAME, RESUME_HREF } from '../data/content';
import { CONNECT_ICONS } from './connectIcons';
import { DownloadCircleIcon } from './Icons';
import { MobileWork } from './mobile/MobileWork';

const EASE_OUT = [0.2, 0.7, 0.2, 1] as const;

/**
 * How many projects the site holds, counted from the data.
 *
 * Written out, this number goes stale the first time a project is added or
 * dropped — and a portfolio that miscounts its own work is a bad first
 * impression on the one screen that is asking the reader to switch device.
 */
// const PROJECT_COUNT = CATEGORIES.reduce((n, c) => n + c.projects.length, 0);

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
/**
 * `work` adds the featured case studies between the notice and the actions.
 *
 * Off by default, so the live screen renders exactly as it did before this
 * existed — the projects are only shown at `?mobile=2`, which is there to
 * demo the addition before it is agreed. Turning it on for everyone is a
 * one-word change at the call site in `App`.
 */
export function SmallScreenNotice({ work = false }: { work?: boolean } = {}) {
  return (
    /*
      The status pill rides at the top of the screen; the rest is one centred
      column beneath it.

      Separating them is the point: the pill is a standing note about this
      screen, not a line in the message, so it sits apart from the stack
      rather than becoming its first item. Within the stack the spacing is
      per-group — name and role together, the notice and its explanation
      together, the actions together — so the relationships read instead of
      four blocks floating at equal distance.
    */
    <main
      /*
        Centred as a single screen normally; top-aligned and scrolling when
        the work is shown, since four project cards no longer fit one
        screen and centring would compress them instead.
      */
      className={`relative flex min-h-dvh flex-col items-center px-6 text-center ${
        work
          ? 'justify-start pt-[clamp(48px,8vh,80px)] pb-14'
          : 'justify-center py-14'
      }`}
    >

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
        {/*
          An invitation rather than a disclaimer.

          "Best viewed on desktop" told the reader what was wrong with where
          they were standing, which was fair when this screen held nothing
          but an apology. With the case studies below it the page is no
          longer a dead end, so the line points somewhere instead — the work
          is here, and the full site is a device away. "desktop" keeps the
          accent because it is the actionable word.
        */}
        {/*
          Orange, and the whole line rather than one accented word.

          Everything else on this screen is teal — the role under the name,
          the resume button, the contact chips — so white-on-dark put the one
          instruction competing with its own surroundings for attention.
          Orange is the only accent the screen does not already spend, which
          makes this the first thing the eye lands on.
        */}
        {/*
          Sized to hold one line at every width this screen covers.

          The line is 34 characters, and at the old 19px floor it needed
          334px of measure inside a 312px column on a 360px phone — so it
          wrapped, and a two-line instruction reads as a paragraph rather
          than a heading. Scaling with the viewport instead of holding a
          floor keeps it on one line; `nowrap` makes that a guarantee
          rather than something that happens to hold.
        */}
        <div className="font-heading text-[min(5.1vw,23px)]/[1.3] font-semibold tracking-[-0.01em] whitespace-nowrap text-orange">
          The full version lives on desktop.
        </div>
        {/*
          `max-w` in characters rather than pixels, so the measure stays
          readable at any of the widths this screen covers instead of running
          to the full width of a tablet.
        */}
        <p className="m-0 max-w-[32ch] font-body text-[clamp(14px,3.9vw,15px)]/[1.65] text-grey text-pretty">
          {/*
            What is actually on the other side, rather than how it is built.
            The old line described the layout — pinned sections, a scroll
            that moves in steps — which is a reason for the reader to switch
            device only if they already care about the craft. The work
            itself is the better argument.

            The count is read from the data rather than written in, so it
            cannot drift as projects are added or removed.
          */}
          20+ projects across {CATEGORIES.length} fields. UI/UX, Brand
          Identity, Campaigns and Presentations, each one from a different brief, a
          different vertical, a different global market.
        </p>
      </motion.div>

      {/*
        The featured work, between the notice and the actions — shown only
        when `work` is set.

        The screen explains that the full site needs a desktop, which leaves
        a reader on a phone with nothing of the work itself to look at. These
        four case studies read fine here, so they sit between the caveat and
        the ways to get in touch.

        Left-aligned inside the centred column: the cards carry paragraphs of
        copy, and centred body text is hard to read down a narrow screen.
      */}
      {work && (
        <motion.div
          /*
            Pulled out past the screen's own `px-6` gutter and given back a
            smaller one of its own: `MobileWork` carries `px-5` too, so
            nesting the two left 44px of padding each side and squeezed the
            cards to a narrow ribbon. The negative margin cancels the outer
            gutter so only the section's own spacing applies.
          */
          /*
            `mb-4` on top of the resume button's own `mt-9`: the section
            dropped its vertical padding so the gap above it could match the
            screen's rhythm, which also removed the space under the last
            card and left it 18px from the button against 36px above.
          */
          className="-mx-6 mt-9 mb-4 w-[calc(100%+3rem)] max-w-none text-left"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: EASE_OUT }}
        >
          <MobileWork />
        </motion.div>
      )}

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
        download={RESUME_FILENAME}
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
        {CONNECT_LINKS.filter((l) => l.label !== 'Resume' && l.href !== '#').map((l) => {
          const Icon = CONNECT_ICONS[l.label];
          return (
            <a
              key={l.label}
              href={l.href}
              // External profiles open away from the page; `mailto:` has
              // nowhere else to go, so it stays in place. Same rule as the
              // Connect modal.
              {...(l.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              className="inline-flex items-center gap-1.5 rounded-[9px] border border-white/12 bg-white/6 px-4 py-2.5 font-body text-[13px] text-grey transition-colors duration-180 hover:text-teal"
            >
              {Icon && <Icon size={16} className="flex-none" />}
              {l.label}
            </a>
          );
        })}
      </motion.div>
    </main>
  );
}
