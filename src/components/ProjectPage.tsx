import { motion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import type { Category } from '../data/content';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
import { Overlay } from './Overlay';
import { ProjectMetricsRow } from './ProjectMetricsRow';
import { PrototypePiP } from './PrototypePiP';
import { AssetSet } from './AssetSet';
import { DocumentViewer } from './DocumentViewer';
import { MotionClip } from './MotionClip';

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

  const scrollRef = useRef<HTMLDivElement>(null);
  // Switching projects (tab strip or "Next project") starts the new one from
  // the top, rather than leaving the reader wherever the previous project's
  // scroll position happened to land.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [pIdx]);

  const handleNext = () => setProjectIdx((i) => (i + 1) % category.projects.length);

  return (
    <Overlay
      z="z-60"
      onClose={onClose}
      // Capped to well inside the viewport, so the dimmed page frames it the way a
      // dialog should. Content scrolls within the panel rather than growing it
      // past the screen and scrolling the scrim instead.
      className="flex max-h-full w-[min(1000px,100%)] flex-col overflow-hidden rounded-[18px] border border-white/9 bg-black shadow-[0_40px_120px_rgba(0,0,0,.7)]"
    >
      {/* The scroll container, so the sticky header stays put while the body moves. */}
      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto">
        <div className="sticky top-0 z-20 flex flex-col gap-4.5 border-b border-white/8 bg-black/92 px-8 py-5.5 backdrop-blur-xl">
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
                    className="rounded-[7px] border border-orange/18 bg-orange/8 px-2.75 py-1.5 font-heading text-[11.5px] font-medium text-orange"
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
                    color: on ? '#FF9A5C' : '#808080',
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
          <div className="grid h-[340px] w-full place-items-center rounded-[14px] border border-white/7 bg-[repeating-linear-gradient(120deg,#111316,#111316_9px,#171A1E_9px,#171A1E_18px)]">
            <span className="font-body text-[11px] tracking-[0.14em] text-grey">HERO BANNER — {displayTitle}</span>
          </div>

          <div className="grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))' }}>
            <div className="flex flex-col gap-2.5 rounded-[14px] bg-surface px-7 py-6.5">
              <div className="font-heading text-xs font-semibold tracking-[0.14em] text-orange">{project.problemLabel ?? 'PROBLEM'}</div>
              <p className="m-0 font-body text-[15.5px]/[1.7] text-grey">{project.problem}</p>
            </div>
            <div className="flex flex-col gap-2.5 rounded-[14px] bg-surface px-7 py-6.5">
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
          {project.processRows.map((row) => {
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

            const slot = row.document ? (
              <DocumentViewer doc={row.document} height={row.slotHeight} />
            ) : row.motion ? (
              <MotionClip clip={row.motion} height={row.slotHeight} />
            ) : row.assetSet ? (
              <AssetSet assets={row.assetSet} height={row.slotHeight} />
            ) : row.prototype ? (
              <div
                className="w-full"
                style={
                  row.slotAspectVideo
                    ? { aspectRatio: '16 / 9' }
                    : row.stacked
                      ? // Fits within the modal's viewport alongside its sticky
                        // header, rather than the prototype forcing a tall box
                        // that pushes most of the row off-screen.
                        { height: row.slotMaxHeight ?? 'min(56vh, 620px)' }
                      : { height: row.slotMaxHeight ?? '160px', minHeight: row.slotMaxHeight ?? '160px' }
                }
              >
                <PrototypePiP prototype={row.prototype} />
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

            return (
              <div
                key={row.label}
                className={
                  row.stacked
                    ? 'flex flex-col gap-5 border-t border-white/7 py-5'
                    : 'grid items-start gap-6 border-t border-white/7 py-5'
                }
                style={row.stacked ? undefined : { gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}
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
                <div className={row.stacked ? 'w-full' : 'self-start'}>{slot}</div>
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

          {/* Optional — omitted entirely (no row, no reserved spacing) for projects without metrics. */}
          {project.metrics && <ProjectMetricsRow label={project.metrics.label} metrics={project.metrics.stats} />}

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
