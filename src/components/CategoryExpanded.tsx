import { motion } from 'motion/react';
import type { Category } from '../data/content';

interface CategoryExpandedProps {
  category: Category;
  categoryIndex: number;
  onClose: () => void;
  onOpenProject: (projectIndex: number) => void;
  /** The tile's hover colour, carried through so the panel it grew from keeps it. */
  accent: { fill: string; ink: string };
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
  accent,
}: CategoryExpandedProps) {
  // The panel inherits the tile's hover colour, so opening one reads as that
  // card blowing up to fill the stage rather than turning into a dark sheet.
  // Inner boxes sit on a translucent wash of the accent's own ink instead of a
  // fixed dark fill, which would read as holes punched in the colour.
  const inset = `${accent.ink}26`;
  const insetBorder = `${accent.ink}1f`;

  return (
    <motion.div
      layoutId={`category-${categoryIndex}`}
      // Breaks out of the stage's own padding so the panel reaches the top,
      // right and bottom edges of the viewport. The left inset is kept — that
      // is the sidebar's clearance — and the corners on that side stay rounded
      // while the three that now meet an edge are squared off.
      className="absolute inset-y-[calc(var(--stage-inset-y)*-1)] right-[calc(var(--spacing-gutter)*-1)] left-0 z-30 flex flex-col overflow-hidden rounded-l-[10px]"
      style={
        {
          backgroundColor: accent.fill,
          '--stage-inset-y': 'clamp(16px, 2.2vh, 32px)',
        } as React.CSSProperties
      }
    >
      {/*
        A fully opaque backing layer. This panel shares a `layoutId` with the
        tile it grew from — when the project overlay above it mounts or
        unmounts, Framer Motion's layout bookkeeping for that shared id can
        momentarily desync the tile's own opacity animation and leave it
        visible again underneath. An opaque layer means that can never bleed
        through, regardless of what the tile underneath is doing.
      */}
      <div className="absolute inset-0 -z-10" style={{ backgroundColor: accent.fill }} />

      {/*
        The stage is a fixed height, so the content is sized to fit inside the
        expanded box rather than growing it past the section. `overflow-y-auto`
        is the safety net for short viewports, not the primary layout.
      */}
      {/*
        The content block is centred in the panel rather than sitting at the
        top with a hand-tuned inset: the panel is a fixed height and the content
        is shorter, so centring makes the space above and below equal by
        construction at every viewport. `justify-center` with `my-auto` on the
        inner column keeps that true while `overflow-y-auto` still rescues a
        viewport too short to hold it.
      */}
      <div className="flex min-h-0 flex-1 flex-col justify-center overflow-y-auto">
        <div className="my-auto">
        <div className="flex items-start justify-between gap-6 px-[clamp(24px,2.6vw,40px)] pt-[clamp(20px,2.6vh,32px)] pb-[clamp(16px,2vh,24px)]">
          <motion.div
            className="flex flex-col gap-2"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: CONTENT_DELAY, duration: 0.28 }}
          >
            <div
              className="font-body text-[11px] tracking-[0.16em] opacity-70"
              style={{ color: accent.ink }}
            >
              {String(categoryIndex + 1).padStart(2, '0')} / 04 · CATEGORY
            </div>
            <div
              className="font-heading text-[clamp(22px,2.2vw,32px)] font-semibold tracking-[-0.02em]"
              style={{ color: accent.ink }}
            >
              {category.title}
            </div>
            <p
              className="m-0 max-w-[62ch] font-body text-[clamp(13px,0.95vw,15px)]/[1.65] opacity-80"
              style={{ color: accent.ink }}
            >
              {category.body}
            </p>
          </motion.div>

          {/*
            Pinned to the panel's own corner rather than sitting in the header
            row: the content block is vertically centred, so in flow the button
            would drift down with it instead of staying at the top right.
          */}
          <motion.button
            type="button"
            onClick={onClose}
            aria-label="Close category"
            className="absolute top-[clamp(20px,3vh,36px)] right-[clamp(24px,2.6vw,40px)] z-10 size-9 flex-none cursor-pointer rounded-[9px] border-0 font-body text-base"
            style={{ backgroundColor: inset, color: accent.ink }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: CONTENT_DELAY, duration: 0.28 }}
            whileHover={{ backgroundColor: `${accent.ink}3d` }}
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
                className="flex flex-col gap-1.5 rounded-[10px] border px-[clamp(18px,1.8vw,28px)] py-[clamp(14px,1.8vh,22px)]"
                style={{ backgroundColor: inset, borderColor: insetBorder }}
              >
                <div
                  className="font-heading text-[clamp(26px,2.6vw,40px)] leading-none font-bold tracking-[-0.03em]"
                  style={{ color: accent.ink }}
                >
                  {s.value}
                </div>
                <div
                  className="font-body text-[10.5px] tracking-[0.14em] opacity-70"
                  style={{ color: accent.ink }}
                >
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-[clamp(10px,1.4vh,18px)]">
            <div
              className="font-body text-[11px] tracking-[0.16em] opacity-70"
              style={{ color: accent.ink }}
            >
              {category.projects.length} PROJECTS
            </div>
            {/*
              A fixed 3 × 2 grid rather than one column per project: five tiles
              on a single row left each one narrow enough that titles wrapped to
              two lines and misaligned the links beneath them. Three per row
              gives each tile room, and the sixth cell simply stays empty.
            */}
            <div
              className="grid gap-[clamp(12px,1.2vw,20px)]"
              style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}
            >
              {category.projects.map((p, pi) => (
                <motion.button
                  key={p.name}
                  type="button"
                  onClick={() => onOpenProject(pi)}
                  className="flex cursor-pointer flex-col overflow-hidden rounded-[10px] border p-0 text-left"
                  style={{ backgroundColor: inset, borderColor: insetBorder }}
                  whileHover={{ y: -4, borderColor: `${accent.ink}66` }}
                  transition={{ duration: 0.2 }}
                >
                  <div
                    className="grid h-[clamp(80px,10vh,120px)] place-items-center"
                    style={{ backgroundColor: `${accent.ink}1a` }}
                  >
                    <span
                      className="font-body text-[10px] tracking-[0.14em] opacity-55"
                      style={{ color: accent.ink }}
                    >
                      PROJECT SHOT
                    </span>
                  </div>
                  <div className="flex flex-col gap-1.5 px-[clamp(12px,1.1vw,18px)] py-[clamp(12px,1.6vh,20px)]">
                    <div
                      className="font-heading text-[clamp(13px,1vw,15.5px)]/[1.35] font-semibold tracking-[-0.01em] text-balance"
                      style={{ color: accent.ink }}
                    >
                      {p.name}
                    </div>
                    <div className="font-body text-[12px] opacity-75" style={{ color: accent.ink }}>
                      Open case study →
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
