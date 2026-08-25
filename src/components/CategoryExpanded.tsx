import { motion } from 'motion/react';
import type { Category } from '../data/content';
import { CARD } from '../styles/card';

interface CategoryExpandedProps {
  category: Category;
  categoryIndex: number;
  onClose: () => void;
  onOpenProject: (projectIndex: number) => void;
}

/** Content fades in slightly after the box has started growing. */
const CONTENT_DELAY = 0.12;

/**
 * A category opened in place: the tile grows to fill the portfolio stage and
 * reveals its content there, rather than throwing a modal over the page.
 *
 * Pairs with the collapsed tile through a shared `layoutId`, so motion morphs
 * the box between the two positions instead of cross-fading them.
 */
export function CategoryExpanded({
  category,
  categoryIndex,
  onClose,
  onOpenProject,
}: CategoryExpandedProps) {
  return (
    <motion.div
      layoutId={`category-${categoryIndex}`}
      className={`absolute inset-0 z-30 flex flex-col overflow-hidden ${CARD}`}
    >
      {/*
        A fully opaque backing layer, independent of the shared `CARD` style's
        translucent fill. `CARD` is 85% opaque so About/Career/the mosaic tiles
        read as glass, but this panel shares a `layoutId` with the tile it grew
        from — when the project overlay above it mounts or unmounts, Framer
        Motion's layout bookkeeping for that shared id can momentarily desync
        the tile's own opacity animation and leave it visible again underneath.
        An opaque layer here means that can never bleed through, regardless of
        what the tile underneath is doing.
      */}
      <div className="absolute inset-0 -z-10 bg-[#0c0d10]" />

      {/*
        The stage is a fixed height, so the content is sized to fit inside the
        expanded box rather than growing it past the section. `overflow-y-auto`
        is the safety net for short viewports, not the primary layout.
      */}
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        <div className="flex items-start justify-between gap-6 px-[clamp(24px,2.6vw,40px)] pt-[clamp(20px,2.6vh,32px)] pb-[clamp(16px,2vh,24px)]">
          <motion.div
            className="flex flex-col gap-2"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: CONTENT_DELAY, duration: 0.28 }}
          >
            <div className="font-body text-[11px] tracking-[0.16em] text-teal">
              {String(categoryIndex + 1).padStart(2, '0')} / 04 · CATEGORY
            </div>
            <div className="font-heading text-[clamp(22px,2.2vw,32px)] font-semibold tracking-[-0.02em] text-orange">
              {category.title}
            </div>
            <p className="m-0 max-w-[62ch] font-body text-[clamp(13px,0.95vw,15px)]/[1.65] text-grey">
              {category.body}
            </p>
          </motion.div>

          <motion.button
            type="button"
            onClick={onClose}
            aria-label="Close category"
            className="size-9 flex-none cursor-pointer rounded-[9px] border-0 bg-white/6 font-body text-base text-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: CONTENT_DELAY, duration: 0.28 }}
            whileHover={{ backgroundColor: 'rgba(255,255,255,0.12)' }}
          >
            ✕
          </motion.button>
        </div>

        <motion.div
          className="flex flex-col gap-[clamp(18px,2.4vh,30px)] px-[clamp(24px,2.6vw,40px)] pb-[clamp(24px,3vh,36px)]"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: CONTENT_DELAY + 0.06, duration: 0.3 }}
        >
          <div
            className="grid gap-[clamp(12px,1.2vw,20px)]"
            style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}
          >
            {category.stats.map((s) => (
              <div
                key={s.label}
                className="flex flex-col gap-1.5 rounded-[10px] border border-white/6 bg-surface px-[clamp(18px,1.8vw,28px)] py-[clamp(14px,1.8vh,22px)]"
              >
                <div className="font-heading text-[clamp(26px,2.6vw,40px)] leading-none font-bold tracking-[-0.03em] text-green">
                  {s.value}
                </div>
                <div className="font-body text-[10.5px] tracking-[0.14em] text-grey">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-[clamp(10px,1.4vh,18px)]">
            <div className="font-body text-[11px] tracking-[0.16em] text-teal">
              {category.projects.length} PROJECTS
            </div>
            {/*
              One column per project, all on a single row. The stage is a fixed
              height, so wrapping would push later rows outside the box; sizing
              the columns to the count instead keeps every project visible and
              aligned without a scrollbar in either direction.
            */}
            <div
              className="grid gap-[clamp(12px,1.2vw,20px)]"
              style={{ gridTemplateColumns: `repeat(${category.projects.length}, minmax(0, 1fr))` }}
            >
              {category.projects.map((p, pi) => (
                <motion.button
                  key={p.name}
                  type="button"
                  onClick={() => onOpenProject(pi)}
                  className="flex cursor-pointer flex-col overflow-hidden rounded-[10px] border border-white/7 bg-surface p-0 text-left"
                  whileHover={{ y: -4, borderColor: 'rgba(255,154,92,0.5)' }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="grid h-[clamp(80px,10vh,120px)] place-items-center bg-[repeating-linear-gradient(120deg,#111316,#111316_9px,#171a1e_9px,#171a1e_18px)]">
                    <span className="font-body text-[10px] tracking-[0.14em] text-[#5a5a5a]">
                      PROJECT SHOT
                    </span>
                  </div>
                  <div className="flex flex-col gap-1.5 px-[clamp(12px,1.1vw,18px)] py-[clamp(12px,1.6vh,20px)]">
                    <div className="font-heading text-[clamp(13px,1vw,15.5px)]/[1.35] font-semibold tracking-[-0.01em] text-white text-balance">
                      {p.name}
                    </div>
                    <div className="font-body text-[12px] text-teal">Open case study →</div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
