import { AnimatePresence, motion } from 'motion/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { ProcessRow } from '../../data/content';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';
import { useEscapeKey } from '../../hooks/useEscapeKey';
import { AssetSet } from '../AssetSet';
import { DocumentViewer } from '../DocumentViewer';
import { withEmphasis } from '../ProjectPage';
import { PrototypePhonePiP } from '../PrototypePhonePiP';
import { PrototypePiP } from '../PrototypePiP';
import type { FeaturedProject } from './featuredProjects';

const EASE_OUT = [0.2, 0.7, 0.2, 1] as const;

/**
 * One process row's slot, for a phone.
 *
 * The desktop renderer picks between the same five kinds, but sizes each
 * against a measured "rest of the modal below its header" height so a slot
 * never outgrows the viewport. A phone scrolls instead of fitting, so the
 * slots here are sized by width and allowed to be as tall as their content
 * needs — capped only where an embed would otherwise claim the whole screen.
 */
function MobileSlot({ row }: { row: ProcessRow }) {
  if (row.document) {
    return <DocumentViewer doc={row.document} fitHeight={row.slotAspect} />;
  }
  if (row.prototype) {
    return (
      <div className="h-[62vh] overflow-hidden rounded-xl">
        <PrototypePiP prototype={row.prototype} />
      </div>
    );
  }
  if (row.phonePiP) {
    return <PrototypePhonePiP pip={row.phonePiP} />;
  }
  if (row.assetSet) {
    /*
      Stacked, always. The desktop set lays pieces side by side and sizes
      each by its own aspect ratio, which needs a row wide enough to hold
      them — at a phone's width two pieces abreast are each too small to
      read. `maxHeight` keeps a tall piece from filling the screen on its
      own while still letting the column scroll past it.
    */
    return <AssetSet assets={row.assetSet} stack fit maxHeight="72vh" />;
  }
  return null;
}

/**
 * One case study, as a full-screen sheet.
 *
 * Carries everything the desktop overlay shows for these projects — header
 * eyebrow and deck, the tools list, the hero banner, problem and solution
 * under their own labels, the brand chips and typeface, every process row
 * with its slot, the FAQ, and the end note — in one scrolling column rather
 * than the desktop's two-column rows and fitted slots.
 *
 * Content comes from the same `Project` the desktop page reads, so nothing
 * is restated here; only the arrangement differs.
 */
export function MobileProjectModal({
  featured,
  onClose,
}: {
  featured: FeaturedProject;
  onClose: () => void;
}) {
  const { project, category } = featured;
  const [bannerDark, setBannerDark] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useBodyScrollLock(true);
  useEscapeKey(useCallback(() => onClose(), [onClose]));

  // A newly opened sheet starts at the top rather than wherever a previously
  // opened one was left.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [project.name]);

  const faq = project.faq;

  return createPortal(
    <motion.div
      className="fixed inset-0 z-[60] flex flex-col bg-[#101114]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22, ease: EASE_OUT }}
      role="dialog"
      aria-modal="true"
      aria-label={project.title ?? project.name}
    >
      {/*
        The sticky header. Opaque rather than glass: the body scrolls under
        it, and anything translucent leaves the copy ghosting through the
        title as it passes — the same reasoning the desktop overlay's header
        carries.
      */}
      <div className="sticky top-0 z-10 flex items-start gap-3 border-b border-white/10 bg-[#101114] px-5 py-4">
        <div className="flex min-w-0 flex-col gap-1">
          <div className="font-body text-[10px] tracking-[0.16em] text-teal uppercase">
            {(project.eyebrow ?? category.title).toUpperCase()}
          </div>
          <div className="font-heading text-[20px]/[1.2] font-semibold tracking-[-0.02em] text-white">
            {project.title ?? project.name}
          </div>
          {project.subtitle && (
            <p className="m-0 font-body text-[13px]/[1.5] text-[#808080]">{project.subtitle}</p>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="ml-auto size-9 flex-none cursor-pointer rounded-[9px] border-0 bg-white/8 font-body text-base text-white"
        >
          ✕
        </button>
      </div>

      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div className="flex flex-col gap-7 px-5 py-6">
          {/* The tools, as the header's pill row on desktop. */}
          <div className="flex flex-wrap gap-1.5">
            {project.software.map((s) => (
              <span
                key={s}
                className="rounded-[7px] border border-white/18 bg-white/8 px-2.5 py-1 font-heading text-[11px] font-medium text-white"
              >
                {s}
              </span>
            ))}
          </div>

          {project.thumbnail && (
            <div className="relative overflow-hidden rounded-[14px] border border-white/7">
              <img
                src={bannerDark && project.thumbnailDark ? project.thumbnailDark : project.thumbnail}
                alt=""
                aria-hidden="true"
                className="block w-full object-cover"
              />
              {/*
                The light/dark toggle, only where the project actually has
                both renderings — a banner with one has nothing to switch
                between, so the control would be dead weight.
              */}
              {project.thumbnailDark && (
                <div className="absolute top-2.5 right-2.5 flex items-center gap-0.5 rounded-full bg-black/55 p-0.5 backdrop-blur-md">
                  {(['light', 'dark'] as const).map((mode) => {
                    const on = (mode === 'dark') === bannerDark;
                    return (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setBannerDark(mode === 'dark')}
                        aria-pressed={on}
                        className={`cursor-pointer rounded-full border-0 px-2.5 py-1 font-body text-[10px] tracking-[0.1em] uppercase ${
                          on ? 'bg-white/90 text-black' : 'bg-transparent text-white/70'
                        }`}
                      >
                        {mode}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/*
            Problem and solution, stacked rather than side by side. Their
            labels are per-project: a collection of separate pieces has no
            single problem/solution pair and relabels the same row.
          */}
          <div className="flex flex-col gap-5">
            {(
              [
                [project.problemLabel ?? 'The problem', project.problem],
                [project.solutionLabel ?? 'The solution', project.solution],
              ] as const
            ).map(([label, body]) => (
              <div key={label} className="flex flex-col gap-2">
                <div className="font-heading text-[11px] font-semibold tracking-[0.14em] text-orange uppercase">
                  {label}
                </div>
                <p className="m-0 font-body text-[14px]/[1.7] whitespace-pre-line text-grey">
                  {withEmphasis(body)}
                </p>
              </div>
            ))}
          </div>

          {/* The brand system — palette and typeface, where the project has them. */}
          {project.chips && (
            <div className="flex flex-col gap-3 border-t border-white/7 pt-6">
              <div className="font-heading text-[11px] font-semibold tracking-[0.14em] text-orange uppercase">
                Brand system
              </div>
              <div className="flex flex-wrap gap-2">
                {project.chips.map((c) => (
                  <span
                    key={c.color}
                    className="size-9 rounded-lg"
                    style={{
                      backgroundColor: c.color,
                      border: `1px solid ${c.border ?? 'rgba(255,255,255,0.15)'}`,
                    }}
                  />
                ))}
              </div>
              {project.typeface && (
                <div className="font-body text-[13px] text-grey">
                  Typeface — <span className="font-semibold text-white">{project.typeface}</span>
                </div>
              )}
            </div>
          )}

          {/* The process rows, each label over its copy over its slot. */}
          {project.processRows.map((row) => (
            <div key={row.label} className="flex flex-col gap-3 border-t border-white/7 pt-6">
              <div
                className={`font-heading text-[11px] font-semibold tracking-[0.14em] uppercase ${
                  row.labelColor === 'teal' ? 'text-teal' : 'text-orange'
                }`}
              >
                {row.label}
              </div>
              {row.text && (
                <p className="m-0 font-body text-[14px]/[1.7] whitespace-pre-line text-grey">
                  {withEmphasis(row.text)}
                </p>
              )}
              {/*
                A row whose slot is an accordion of questions, rather than
                an image — rendered inline here, since a phone column has no
                second column for it to sit beside.
              */}
              {row.accordion && <MobileAccordion items={row.accordion} />}
              <MobileSlot row={row} />
            </div>
          ))}

          {/* The project-level FAQ, where there is one. */}
          {faq && (
            <div className="flex flex-col gap-3 border-t border-white/7 pt-6">
              <div className="font-heading text-[11px] font-semibold tracking-[0.14em] text-teal uppercase">
                FAQ
              </div>
              <MobileAccordion items={faq} defaultOpenFirst />
            </div>
          )}

          {project.endNote && (
            <div className="flex flex-col gap-2 rounded-[14px] border border-teal/20 bg-teal/10 px-5 py-5">
              <div className="font-heading text-[11px] font-semibold tracking-[0.14em] text-teal uppercase">
                End note
              </div>
              <p className="m-0 font-body text-[14px]/[1.7] whitespace-pre-line text-grey">
                {withEmphasis(project.endNote)}
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>,
    document.body,
  );
}

/**
 * A collapsed list of questions, each opening to its answer.
 *
 * The same contract as the desktop accordion — one open at a time, `+`
 * turning to `×`, the answer revealed by animating its height — minus the
 * arrow-key roving focus, which has no equivalent on a touch screen.
 */
function MobileAccordion({
  items,
  defaultOpenFirst = false,
}: {
  items: { q: string; a: string }[];
  defaultOpenFirst?: boolean;
}) {
  const [open, setOpen] = useState<number | null>(defaultOpenFirst ? 0 : null);
  return (
    <div className="flex flex-col">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.q} className="border-t border-white/7 first:border-t-0">
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="flex w-full cursor-pointer items-center justify-between gap-3 border-0 bg-transparent py-4 text-left"
            >
              <span className="font-heading text-[13px] font-semibold text-orange">{item.q}</span>
              <motion.span
                aria-hidden="true"
                className="flex-none text-orange"
                animate={{ rotate: isOpen ? 45 : 0 }}
                transition={{ duration: 0.22, ease: EASE_OUT }}
              >
                +
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  key="a"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.24, ease: EASE_OUT }}
                  className="overflow-hidden"
                >
                  <p className="m-0 pb-4 font-body text-[14px]/[1.7] text-grey">{item.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
