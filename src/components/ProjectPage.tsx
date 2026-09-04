import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import type { ProcessRow, Category } from '../data/content';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
import { Overlay } from './Overlay';
import { ProjectMetricsRow } from './ProjectMetricsRow';
import { PrototypePiP } from './PrototypePiP';
import { AssetSet } from './AssetSet';
import { DocumentViewer } from './DocumentViewer';
import { MotionClip } from './MotionClip';

/**
 * The slot's content for one process row — the document viewer, prototype
 * frame, asset set or placeholder box a row's `slot`-family field selects.
 * Pulled out of the row renderer so a `pairWithNext` pair can build both
 * sides' slots the same way a standalone row does.
 */
function renderSlot(row: ProcessRow) {
  return row.document ? (
    <DocumentViewer doc={row.document} height={row.slotHeight} spread={row.wideSlot} fitHeight={row.slotAspect} />
  ) : row.motion ? (
    <MotionClip clip={row.motion} height={row.slotHeight} fitHeight={row.slotAspect} />
  ) : row.assetSet ? (
    <AssetSet assets={row.assetSet} height={row.slotHeight} />
  ) : row.prototype ? (
    <div
      className={row.slotAspect || row.slotAspectVideo ? 'mx-auto' : 'w-full'}
      style={
        row.slotAspect || row.slotAspectVideo
          ? // Height-led: the frame takes the available height and derives
            // its width from the artboard's ratio, so the prototype fills it
            // with no letterboxing either side.
            //
            // Capping the height is what keeps the row inside the modal.
            // Width-led sizing — an aspect ratio alone — makes the frame as
            // tall as the column is wide, so on a wide screen the label and
            // copy above it get pushed out of view and the reader has to
            // scroll to see the artefact.
            {
              height: row.slotMaxHeight ?? 'min(56vh, 620px)',
              aspectRatio: String(row.slotAspect ?? 16 / 9),
              maxWidth: '100%',
            }
          : row.stacked
              ? // Fits within the modal's viewport alongside its sticky
                // header, rather than the prototype forcing a tall box that
                // pushes most of the row off-screen.
                { height: row.slotMaxHeight ?? 'min(56vh, 620px)' }
              : { height: row.slotMaxHeight ?? '160px', minHeight: row.slotMaxHeight ?? '160px' }
      }
    >
      {/* Keyed on the embed URL — see the note on the project-level prototype below. */}
      <PrototypePiP key={row.prototype.embedUrl} prototype={row.prototype} />
    </div>
  ) : (
    <div
      className="grid min-h-[160px] place-items-center rounded-xl border border-white/7 bg-[repeating-linear-gradient(120deg,#111316,#111316_9px,#171A1E_9px,#171A1E_18px)]"
      style={
        row.slotAspectVideo
          ? { aspectRatio: '16 / 9', minHeight: 0 }
          : row.slotHeight
            ? { height: row.slotHeight, minHeight: row.slotHeight }
            : row.slotMaxHeight
              ? { maxHeight: row.slotMaxHeight }
              : undefined
      }
    >
      <span className="font-body text-[10px] tracking-[0.14em] text-grey">{row.slot}</span>
    </div>
  );
}

/** A `pairWithNext` column's own label, text and slot, stacked vertically. */
function PairColumn({ row }: { row: ProcessRow }) {
  return (
    <div className="flex flex-col gap-20">
      <div className="flex flex-col gap-2">
        <div className="font-heading text-xs font-semibold tracking-[0.14em] text-orange">{row.label}</div>
        <p className="m-0 font-body text-[15px]/[1.7] text-grey">{row.text}</p>
      </div>
      <div className="w-full">{renderSlot(row)}</div>
    </div>
  );
}

interface ProjectPageProps {
  category: Category;
  initialProjectIdx?: number;
  onBackToCategory: () => void;
  onClose: () => void;
}

export function ProjectPage({ category, initialProjectIdx = 0, onBackToCategory, onClose }: ProjectPageProps) {
  useBodyScrollLock(true);
  const [projectIdx, setProjectIdx] = useState(initialProjectIdx);
  const pIdx = projectIdx % category.projects.length;
  const project = category.projects[pIdx];
  // The header and hero banner show the project's actual title where it
  // differs from its (shorter, tab-strip) name; otherwise the name doubles as both.
  const displayTitle = project.title ?? project.name;

  /*
    Which rendering the banner shows. Reset with the project below, so opening
    a new case study starts on its light version rather than inheriting the
    previous one's setting.
  */
  const [bannerDark, setBannerDark] = useState(false);
  // Which FAQ item is expanded, if any. Reset alongside the banner: a new
  // project starts with its first question open, not whatever the previous
  // project's reader happened to leave expanded.
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);

  const scrollRef = useRef<HTMLDivElement>(null);
  // Switching projects (tab strip or "Next project") starts the new one from
  // the top, rather than leaving the reader wherever the previous project's
  // scroll position happened to land.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
    setBannerDark(false);
    setOpenFaqIdx(0);
  }, [pIdx]);

  const handleNext = () => setProjectIdx((i) => (i + 1) % category.projects.length);

  // The sticky header's real height, so the deck/prototype viewer below it can
  // fill the rest of the viewport rather than guessing at a fixed vh number.
  // The header's content (title length, tab-strip wrapping) changes it per
  // project, so it's measured live rather than assumed.
  const headerRef = useRef<HTMLDivElement>(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const measure = () => setHeaderHeight(el.getBoundingClientRect().height);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Overlay
      z="z-60"
      onClose={onClose}
      /*
        A visible scrim behind the glass panel — without one the page reads
        through so crisply the modal has no backdrop to sit on at all, and its
        edge is hard to tell from the page behind it. Lighter than the shared
        default still, so the panel's own glass keeps doing the work rather
        than the scrim doing it for the panel. Passed here rather than changed
        in `Overlay`, which every other modal and lightbox on the site also uses.
      */
      scrimClassName="bg-black/30 p-[clamp(24px,5vh,64px)] backdrop-blur-sm"
      // Capped to well inside the viewport, so the dimmed page frames it the way a
      // dialog should. Content scrolls within the panel rather than growing it
      // past the screen and scrolling the scrim instead.
      /*
        The body is glass: barely any fill of its own, so whatever the modal
        happens to be sitting over reads through it. The header opts out below
        and paints an opaque surface, because type that scrolls underneath it
        has to be hidden rather than merely dimmed.

        A trace of gradient remains rather than nothing at all — it is what
        gives the sheet an edge and a direction, where pure transparency would
        read as a missing background.
      */
      className="flex max-h-full w-[min(1280px,100%)] flex-col overflow-hidden rounded-[18px] border border-white/12 bg-[linear-gradient(158deg,rgba(40,43,50,.90),rgba(16,17,21,.85)_42%,rgba(28,30,36,.87))] shadow-[0_40px_120px_rgba(0,0,0,.55),inset_0_1px_0_rgba(255,255,255,.16),inset_0_0_0_1px_rgba(255,255,255,.07)] backdrop-blur-lg backdrop-saturate-150"
    >
      {/* The scroll container, so the sticky header stays put while the body moves. */}
      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto">
        {/*
          Solid, not glass: the body scrolls underneath this, and anything less
          than opaque leaves the copy ghosting through the title and tab strip
          as it passes. The glass belongs to the body, where there is something
          behind the modal worth seeing.
        */}
        <div
          ref={headerRef}
          className="sticky top-0 z-20 flex flex-col gap-4.5 border-b border-white/10 bg-[#111216] px-8 py-5.5"
        >
          <div className="flex items-start justify-between gap-5">
            <div className="flex flex-col gap-1.5">
              <div className="font-body text-[11px] tracking-[0.16em] text-teal">{category.title.toUpperCase()}</div>
              <motion.div
                key={displayTitle}
                className="font-heading text-[26px] font-semibold tracking-[-0.02em] text-white"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: [0.2, 0.7, 0.2, 1] }}
              >
                {displayTitle}
              </motion.div>
            </div>
            <div className="flex items-center gap-3.5">
              <div className="flex flex-wrap justify-end gap-1.75">
                {project.software.map((s) => (
                  <span
                    key={s}
                    className="rounded-[7px] border border-white/18 bg-white/8 px-2.75 py-1.5 font-heading text-[11.5px] font-medium text-white"
                  >
                    {s}
                  </span>
                ))}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="size-9 flex-none cursor-pointer rounded-[9px] bg-white/6 font-body text-base text-white transition-colors duration-180 hover:bg-white/12"
              >
                ✕
              </button>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {category.projects.map((p, i) => {
              const on = i === pIdx;
              return (
                <motion.button
                  key={p.name}
                  type="button"
                  onClick={() => setProjectIdx(i)}
                  className="cursor-pointer rounded-[7px] border px-3.5 py-2 font-body text-xs"
                  animate={{
                    backgroundColor: on ? 'rgba(255,154,92,.12)' : 'rgba(255,255,255,0)',
                    borderColor: on ? 'rgba(255,154,92,.4)' : 'rgba(255,255,255,.1)',
                    color: on ? '#FF9A5C' : '#A5AEBB',
                  }}
                  transition={{ duration: 0.18 }}
                >
                  {p.name}
                </motion.button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-6.5 p-8">
          <div className="relative grid h-[340px] w-full place-items-center overflow-hidden rounded-[14px] border border-white/7 bg-[repeating-linear-gradient(120deg,#111316,#111316_9px,#171A1E_9px,#171A1E_18px)]">
            {project.thumbnail ? (
              <img
                src={bannerDark && project.thumbnailDark ? project.thumbnailDark : project.thumbnail}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 size-full object-cover object-center"
              />
            ) : (
              <span className="font-body text-[11px] tracking-[0.14em] text-grey">
                HERO BANNER — {displayTitle}
              </span>
            )}

            {/*
              Only where the project actually has both renderings — a banner
              with one version has nothing to toggle between, so the control
              would be dead weight on it.
            */}
            {project.thumbnailDark && (
              <div className="absolute top-3 right-3 flex items-center gap-0.5 rounded-full bg-black/55 p-0.5 backdrop-blur-md">
                {([
                  ['light', 'Light'],
                  ['dark', 'Dark'],
                ] as const).map(([mode, label]) => {
                  const on = (mode === 'dark') === bannerDark;
                  return (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setBannerDark(mode === 'dark')}
                      aria-pressed={on}
                      className={`cursor-pointer rounded-full border-0 px-2.5 py-1 font-body text-[10px] tracking-[0.1em] uppercase transition-colors duration-180 ${
                        on ? 'bg-white/90 text-black' : 'bg-transparent text-white/70 hover:text-white'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))' }}>
            {/*
              Lifted off the panel with a translucent wash rather than
              `bg-surface`, which is pure black — a solid block would sit on the
              glass as a hole rather than as a panel resting on it.
            */}
            <div className="flex flex-col gap-2.5 rounded-[14px] border border-white/10 bg-white/7 px-7 py-6.5">
              <div className="font-heading text-xs font-semibold tracking-[0.14em] text-orange">{project.problemLabel ?? 'PROBLEM'}</div>
              <p className="m-0 font-body text-[15.5px]/[1.7] text-grey">{project.problem}</p>
            </div>
            <div className="flex flex-col gap-2.5 rounded-[14px] border border-white/10 bg-white/7 px-7 py-6.5">
              <div className="font-heading text-xs font-semibold tracking-[0.14em] text-green">{project.solutionLabel ?? 'SOLUTION'}</div>
              <p className="m-0 font-body text-[15.5px]/[1.7] text-grey">{project.solution}</p>
            </div>
          </div>

          {/* Omitted entirely for a project with no single palette — see Project.chips. */}
          {project.chips && project.typeface && (
          <div className="flex flex-wrap items-center gap-6">
            <span className="font-heading text-[15.5px] font-semibold tracking-[-0.01em] text-teal">Brand system</span>
            <div
              className="flex flex-1 flex-wrap items-center gap-6 rounded-2xl px-6.5 py-4.5"
              style={{ background: '#15171C' }}
            >
              <div className="flex min-w-0 flex-1 items-center gap-3.5">
                <span className="font-body text-[13px] text-[#9AA1AC]">Color</span>
                <div className="flex min-w-0 flex-1 items-stretch gap-3">
                  {project.chips.map((c) => (
                    <span key={c.color} className="h-12 flex-1 rounded-lg" style={{ background: c.color }} />
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-3.5">
                <span className="font-body text-[13px] text-[#9AA1AC]">Typeface</span>
                <span className="font-heading text-[13.5px] font-semibold tracking-[-0.005em] text-[#F2F4F7]">
                  {project.typeface}
                </span>
              </div>
            </div>
          </div>
          )}

          {/*
            Both columns top-align and the row's height follows its own
            content, rather than the text sitting flush with the top of a
            fixed-height image and leaving empty space below it once the copy
            runs out. `items-start` does the alignment; dropping the fixed
            height on the image slot in favour of a min-height lets it (and so
            the row) size to whichever is taller instead of forcing every row
            to match the image's height.
          */}
          {project.processRows.map((row, i) => {
            // Rendered as the right half of the previous row's pair, not on
            // its own — see `pairWithNext` below.
            if (i > 0 && project.processRows[i - 1].pairWithNext) return null;

            /*
              Two rows shown as one block: a left and a right column, each
              stacking its own label, text and slot, with a vertical rule
              between them — the same `border-white/7` line the rows
              themselves are divided by, turned sideways.
            */
            if (row.pairWithNext) {
              const next = project.processRows[i + 1];
              return (
                <div
                  key={row.label}
                  className="grid items-start gap-8 divide-x divide-white/7 border-t border-white/7 py-5"
                  style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}
                >
                  <PairColumn row={row} />
                  <PairColumn row={next} />
                </div>
              );
            }

            /*
              A text-only row has no slot at all — not an empty one. It keeps
              the two-column shape so the labels stay aligned with every other
              row, and the text simply takes the width the image would have had.
            */
            if (row.textOnly) {
              return (
                <div
                  key={row.label}
                  className="grid items-start gap-6 border-t border-white/7 py-5"
                  style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}
                >
                  <div className="font-heading text-xs font-semibold tracking-[0.14em] text-orange">
                    {row.label}
                  </div>
                  <p className="m-0 font-body text-[15px]/[1.7] text-grey">{row.text}</p>
                </div>
              );
            }

            return (
              <div
                key={row.label}
                className={
                  row.stacked
                    ? 'flex flex-col gap-5 border-t border-white/7 py-5'
                    : 'grid items-start gap-6 border-t border-white/7 py-5'
                }
                style={
                  row.stacked
                    ? undefined
                    : {
                        gridTemplateColumns: row.wideSlot
                          ? 'minmax(220px, 1fr) 3fr'
                          : 'repeat(auto-fit, minmax(300px, 1fr))',
                      }
                }
              >
                <div className="flex flex-col gap-2">
                  <div className="font-heading text-xs font-semibold tracking-[0.14em] text-orange">{row.label}</div>
                  <p
                    className={
                      row.stacked
                        ? 'm-0 font-body text-[15px]/[1.7] text-grey'
                        : 'm-0 max-w-[420px] font-body text-[15px]/[1.7] text-grey'
                    }
                  >
                    {row.text}
                  </p>
                </div>
                <div className={row.stacked ? 'w-full' : 'self-start'}>{renderSlot(row)}</div>
              </div>
            );
          })}

          {/*
            The whole deck as one viewer, below the rows that argue for it.
            Locked to 16:9 because that is the shape the slides were made in —
            a taller frame would letterbox every page.
          */}
          {project.deck && (
            /*
              `min-h-0` is what actually holds the ratio. As a flex item this
              box defaults to `min-height: auto`, which floors it at its
              content's height — the viewer's own controls and padding come to
              more than 16:9 allows, so without this the frame sits taller than
              the ratio it declares.
            */
            <div className="w-full min-h-0 flex-none" style={{ aspectRatio: '16 / 9' }}>
              <DocumentViewer doc={project.deck} height="100%" />
            </div>
          )}

          {/*
            A live prototype in the same frame the deck uses, for a project
            whose artefact is interactive rather than a run of slides.

            Height-led rather than width-led: a plain 16:9-by-width box falls
            well short of the modal's available height on a wide screen, since
            width is what the row's own max-width caps. Filling the space
            actually left below the sticky header — not the raw viewport —
            is what makes it read as the modal's own scroll area rather than
            a guessed vh fraction; the scrim's own top+bottom padding and this
            row's padding both come off the same total.
          */}
          {project.prototype && (
            <div
              className="mx-auto w-full min-h-0 flex-none"
              style={{
                height: headerHeight
                  ? `min(calc(100dvh - 2 * clamp(24px, 5vh, 64px) - ${headerHeight}px - 4rem), 900px)`
                  : 'min(75vh, 900px)',
                aspectRatio: '16 / 9',
                maxWidth: '100%',
              }}
            >
              {/*
                Keyed on the embed URL so switching projects in the tab strip
                remounts a fresh iframe instead of just updating `src` on the
                same one. Some embed players (Google Slides, PowerPoint
                Online, certain Figma configs) don't reliably tear down and
                reload their own internal state on a bare `src` change, and
                the previous project's deck was staying visible underneath
                the new one loading — or not loading at all.
              */}
              <PrototypePiP key={project.prototype.embedUrl} prototype={project.prototype} />
            </div>
          )}

          {/* Optional — omitted entirely (no row, no reserved spacing) for projects without metrics. */}
          {project.metrics && <ProjectMetricsRow label={project.metrics.label} metrics={project.metrics.stats} />}

          {/*
            Optional, on the same terms as the metrics row above. An
            accordion rather than the stacked list every question used to
            render as: four full answers open at once read as a wall of text
            competing with the case study around it, where one open question
            at a time reads as something to work through.

            Full width (no `max-w` on the answer, unlike the stacked version)
            — collapsed to one open question, the row has the space to spare
            that the old side-by-side layout didn't.
          */}
          {project.faq && (
            <div className="flex flex-col">
              {project.faq.map((item, i) => {
                const open = openFaqIdx === i;
                return (
                  <div key={item.q} className="border-t border-white/7 first:border-t-0">
                    <button
                      type="button"
                      onClick={() => setOpenFaqIdx(open ? null : i)}
                      aria-expanded={open}
                      className="flex w-full cursor-pointer items-center justify-between gap-4 py-5 text-left"
                    >
                      <span className="font-heading text-xs font-semibold tracking-[0.14em] text-orange">
                        {item.q}
                      </span>
                      <motion.span
                        aria-hidden="true"
                        className="flex-none text-orange"
                        animate={{ rotate: open ? 45 : 0 }}
                        transition={{ duration: 0.22, ease: [0.2, 0.7, 0.2, 1] }}
                      >
                        +
                      </motion.span>
                    </button>
                    <AnimatePresence initial={false}>
                      {open && (
                        <motion.div
                          key="content"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.24, ease: [0.2, 0.7, 0.2, 1] }}
                          className="overflow-hidden"
                        >
                          <p className="m-0 pb-5 font-body text-[15px]/[1.7] text-grey">{item.a}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          )}

          {/* Optional on the same terms as the metrics row above. */}
          {project.endNote && (
            <div className="rounded-[14px] border border-teal/20 bg-teal/10 px-7 py-6.5">
              <div className="mb-2 font-body text-[11px] tracking-[0.16em] text-teal">END NOTE</div>
              <p className="m-0 max-w-[820px] font-body text-base/[1.7] text-white">{project.endNote}</p>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-4">
            <motion.button
              type="button"
              onClick={onBackToCategory}
              className="cursor-pointer rounded-xl border border-teal bg-[#005961]/10 px-5 py-3 font-heading text-[13.5px] font-bold text-teal"
              whileHover={{ y: -2 }}
              transition={{ duration: 0.18 }}
            >
              ← Back to {category.short}
            </motion.button>
            <motion.button
              type="button"
              onClick={handleNext}
              // Matches the resume button in Intro: a teal outline rather than a
              // solid orange fill. The old `text-bg` was being overridden to
              // grey, which on orange left the label almost unreadable.
              className="cursor-pointer rounded-xl border border-teal bg-[#005961]/10 px-5.5 py-3 font-heading text-[13.5px] font-bold text-teal"
              whileHover={{ y: -2 }}
              transition={{ duration: 0.18 }}
            >
              Next project →
            </motion.button>
          </div>
        </div>
      </div>
    </Overlay>
  );
}
