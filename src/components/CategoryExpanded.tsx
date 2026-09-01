import { animate, motion, useMotionValue, useTransform } from 'motion/react';
import { useEffect } from 'react';
import type { Category } from '../data/content';
import { CARD_GLASS } from '../styles/card';

interface CategoryExpandedProps {
  category: Category;
  categoryIndex: number;
  onClose: () => void;
  onOpenProject: (projectIndex: number) => void;
}

/**
 * The panel's surface: the site's own backdrop, so the expanded category sits
 * on the same ground as every other section rather than on a flat fill of its
 * own. Painted here rather than left transparent because the panel has to be
 * opaque — the mosaic it grew from is still behind it.
 */
const PANEL_BACKDROP = "url('/images/bg 2.svg')";

/**
 * How long a stat takes to run up to its value.
 *
 * Slower than the project metrics row's 1.1s: these four sit together at the
 * top of the panel and are the first thing that moves as it opens, so a quick
 * count reads as a flicker rather than as numbers arriving.
 */
const COUNT_DURATION_S = 2.2;

/**
 * One stat, counting up to its value as the panel opens.
 *
 * The value is split into its numeric lead and any trailing suffix ("20" and
 * "+"), so the number runs and the suffix arrives with it — matching how the
 * project metrics row behaves. A value with no number at all ("∞") skips the
 * count and simply appears.
 */
function StatValue({ value }: { value: string }) {
  const match = value.match(/^(\d+(?:\.\d+)?)(.*)$/);
  const numeric = match ? Number.parseFloat(match[1]) : null;
  const suffix = match ? match[2] : '';

  const count = useMotionValue(0);
  const display = useTransform(count, (v) => `${Math.round(v)}${suffix}`);

  useEffect(() => {
    if (numeric === null) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      count.set(numeric);
      return;
    }
    const controls = animate(count, numeric, {
      duration: COUNT_DURATION_S,
      // Starts quickly and eases into the final value, so the number settles
      // rather than stopping dead on it.
      ease: [0.2, 0.7, 0.2, 1],
      delay: CONTENT_DELAY,
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [numeric]);

  if (numeric === null) return <>{value}</>;
  return <motion.span>{display}</motion.span>;
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
  /** The close button's fill; the cards use the shared glass card instead. */
  const inset = 'rgba(255,255,255,.04)';
  /** The section's own palette, which the panel uses throughout. */
  const TITLE = '#FF9A5C';
  /** The stat numbers, in the site's own teal rather than the title's orange. */
  const STAT = '#00B8C9';
  const BODY = '#808080';
  const MUTED = '#5a5a5a';
  const LINK = '#00B8C9';

  return (
    <motion.div
      layoutId={`category-${categoryIndex}`}
      /*
        Breaks out of the stage's own padding so the panel reaches the top,
        right and bottom edges of the viewport. The left inset is kept — that
        is the sidebar's clearance.

        No border or radius: with those it read as a card laid over the
        section rather than as the section's own body, which is the whole point
        of expanding in place instead of opening a modal.
      */
      className="absolute inset-y-[calc(var(--stage-inset-y)*-1)] right-[calc(var(--spacing-gutter)*-1)] left-0 z-30 flex flex-col overflow-hidden"
      style={{ '--stage-inset-y': 'clamp(16px, 2.2vh, 32px)' } as React.CSSProperties}
      /*
        No fill of its own: the backing layer's backdrop is the surface, and a
        colour over it lightened the panel against the page beside it — which
        is what still read as a separate card once the border was gone.
      */
      initial={{ backgroundColor: 'transparent' }}
      animate={{ backgroundColor: 'transparent' }}
    >
      {/*
        A fully opaque backing layer. This panel shares a `layoutId` with the
        tile it grew from — when the project overlay above it mounts or
        unmounts, Framer Motion's layout bookkeeping for that shared id can
        momentarily desync the tile's own opacity animation and leave it
        visible again underneath. An opaque layer means that can never bleed
        through, regardless of what the tile underneath is doing.
      */}
      <motion.div
        className="absolute inset-0 -z-10"
        /*
          The page's own backdrop, sized and positioned against the viewport
          rather than this box.

          The panel starts at the sidebar's right edge, so a `cover` image
          inside it crops from a different origin and lands on a different part
          of the texture — which is what made the panel read as its own surface
          even with no border and no fill. Sizing to `100vw × 100vh` and pulling
          the image left by the panel's own offset lines it up with the page
          exactly, so the two are continuous across the boundary.
        */
        style={{
          backgroundImage: PANEL_BACKDROP,
          /*
            `cover` against the viewport, exactly as `body::before` paints it —
            the page preserves the image's aspect ratio and crops, so stretching
            to `100vw × 100vh` here sampled a differently-scaled part of the
            texture and the two drifted apart down the panel's height.

            `fixed` attachment is what makes `cover` resolve against the
            viewport rather than this box, so the offset comes for free and the
            image lands on exactly the same pixels the page's does.
          */
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          backgroundRepeat: 'no-repeat',
        }}
      />

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
        <div className="flex items-start justify-between gap-6 pr-[clamp(24px,2.6vw,40px)] pt-[clamp(20px,2.6vh,32px)] pb-[clamp(16px,2vh,24px)]">
          <motion.div
            className="flex flex-col gap-2"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: CONTENT_DELAY, duration: 0.28 }}
          >
            <div
              className="font-body text-[11px] tracking-[0.16em] opacity-70"
              style={{ color: MUTED }}
            >
              {String(categoryIndex + 1).padStart(2, '0')} / 04 · CATEGORY
            </div>
            <div
              className="font-heading text-[clamp(22px,2.2vw,32px)] font-semibold tracking-[-0.02em]"
              style={{ color: TITLE }}
            >
              {category.title}
            </div>
            <p
              className="m-0 max-w-[62ch] font-body text-[clamp(13px,0.95vw,15px)]/[1.65] opacity-80"
              style={{ color: BODY }}
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
            style={{ backgroundColor: inset, color: '#ffffff' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: CONTENT_DELAY, duration: 0.28 }}
            whileHover={{ backgroundColor: 'rgba(255,255,255,.1)' }}
          >
            ✕
          </motion.button>
        </div>

        <motion.div
          className="flex flex-col gap-[clamp(18px,2.4vh,30px)] pr-[clamp(24px,2.6vw,40px)] pb-[clamp(24px,3vh,36px)]"
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
                className={`flex flex-col gap-1.5 px-[clamp(18px,1.8vw,28px)] py-[clamp(14px,1.8vh,22px)] ${CARD_GLASS}`}
              >
                <div
                  className="font-heading text-[clamp(26px,2.6vw,40px)] leading-none font-bold tracking-[-0.03em]"
                  style={{ color: STAT }}
                >
                  <StatValue value={s.value} />
                </div>
                <div
                  className="font-body text-[10.5px] tracking-[0.14em]"
                  style={{ color: '#ffffff' }}
                >
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-[clamp(10px,1.4vh,18px)]">
            <div
              className="font-body text-[11px] tracking-[0.16em] opacity-70"
              style={{ color: MUTED }}
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
                  className={`flex cursor-pointer flex-col overflow-hidden p-0 text-left ${CARD_GLASS}`}
                  // Only the lift on hover: the accent border it used to take
                  // would override the glass card's own rim.
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2 }}
                >
                  {/*
                    Matched to the project page's hero banner (934 × 340), so a
                    thumbnail here is a scaled version of the image it opens
                    rather than a differently-cropped one. A fixed height made
                    the ratio drift with the column's width; the aspect ratio
                    holds it at every viewport.
                  */}
                  <div
                    className="grid w-full place-items-center"
                    style={{ backgroundColor: 'rgba(255,255,255,.03)', aspectRatio: '934 / 340' }}
                  >
                    {p.thumbnail ? (
                      <img
                        src={p.thumbnail}
                        alt=""
                        aria-hidden="true"
                        className="size-full object-cover"
                      />
                    ) : (
                      <span
                        className="font-body text-[10px] tracking-[0.14em] opacity-55"
                        style={{ color: MUTED }}
                      >
                        PROJECT SHOT
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col gap-1.5 px-[clamp(12px,1.1vw,18px)] py-[clamp(12px,1.6vh,20px)]">
                    <div
                      className="font-heading text-[clamp(13px,1vw,15.5px)]/[1.35] font-semibold tracking-[-0.01em] text-balance"
                      style={{ color: '#ffffff' }}
                    >
                      {p.name}
                    </div>
                    <div className="font-body text-[12px] opacity-75" style={{ color: LINK }}>
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
