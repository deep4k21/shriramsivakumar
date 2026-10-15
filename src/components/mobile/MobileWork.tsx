import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useState } from 'react';
import { CARD_GLASS } from '../../styles/card';
import { FEATURED_PROJECTS } from './featuredProjects';
import { MobileProjectModal } from './MobileProjectModal';

const EASE_OUT = [0.2, 0.7, 0.2, 1] as const;

/**
 * The featured work, as a column of cards that each open a case study.
 *
 * Desktop reaches a project through a category stage, an expanded panel and a
 * tab strip — three steps built on a composition that needs width. Here the
 * four featured projects are the section, and a card opens straight into the
 * full case study.
 */
export function MobileWork() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const reduced = useReducedMotion();
  const open = openIdx === null ? null : FEATURED_PROJECTS[openIdx];

  return (
    /*
      No vertical padding of its own: on the notice screen the block above
      already sets the gap with its own margin, and `py-16` stacked on top of
      it left the section floating far from the copy it follows. The standalone
      preview supplies its own spacing instead.
    */
    <section id="portfolio" className="flex flex-col gap-5 px-7">
      <motion.div
        className="flex flex-col gap-1.5"
        initial={reduced ? false : { opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '0px 0px -12% 0px' }}
        transition={{ duration: 0.5, ease: EASE_OUT }}
      >
        {/*
          "Portfolio" alone, at heading size rather than as a small eyebrow
          over a second line. The pair read as two titles stacked on a screen
          this narrow, and the section only needs naming once.
        */}
        <h2 className="m-0 font-heading text-[clamp(17px,4.6vw,20px)] font-semibold tracking-[0.16em] text-teal uppercase">
          Portfolio
        </h2>
      </motion.div>

      <div className="flex flex-col gap-4">
        {FEATURED_PROJECTS.map(({ project, category }, i) => (
          <motion.button
            key={project.name}
            type="button"
            onClick={() => setOpenIdx(i)}
            className={`flex cursor-pointer flex-col gap-0 overflow-hidden border-0 p-0 text-left ${CARD_GLASS}`}
            initial={reduced ? false : { opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '0px 0px -10% 0px' }}
            transition={{ duration: 0.5, delay: 0.05 * i, ease: EASE_OUT }}
          >
            {project.thumbnail && (
              /*
                The thumbnail at its own proportions rather than a fixed
                crop: these are wide banner artworks, and forcing a card
                ratio cut the ends off the compositions that read left to
                right.
              */
              <img
                src={project.thumbnail}
                alt=""
                aria-hidden="true"
                loading="lazy"
                decoding="async"
                className="block w-full object-cover"
              />
            )}
            <div className="flex flex-col gap-1.5 px-4 py-4">
              <div className="font-body text-[10px] tracking-[0.16em] text-teal uppercase">
                {(project.eyebrow ?? category.title).toUpperCase()}
              </div>
              <div className="font-heading text-[17px]/[1.25] font-semibold text-white">
                {project.title ?? project.name}
              </div>
              {/*
                The deck where the project has one, the opening of its
                problem otherwise — so every card says something about the
                work rather than only naming it.
              */}
              <p className="m-0 line-clamp-2 font-body text-[13px]/[1.6] text-grey">
                {project.subtitle ?? project.problem.replace(/\*\*/g, '')}
              </p>
              <span className="mt-1 font-body text-[12px] tracking-[0.1em] text-teal uppercase">
                Open case study →
              </span>
            </div>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {open && (
          <MobileProjectModal
            key={open.project.name}
            featured={open}
            onClose={() => setOpenIdx(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
