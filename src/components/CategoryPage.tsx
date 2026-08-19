import type { Category } from '../data/content';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';

interface CategoryPageProps {
  category: Category;
  categoryIndex: number;
  onClose: () => void;
  onOpenProject: (projectIndex: number) => void;
}

export function CategoryPage({ category, categoryIndex, onClose, onOpenProject }: CategoryPageProps) {
  useBodyScrollLock(true);
  const stop = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <div
      onClick={onClose}
      className="animate-fadeup fixed inset-0 z-55 grid place-items-start justify-items-center overflow-y-auto bg-black/72 px-6 py-10 backdrop-blur-md"
    >
      <div
        onClick={stop}
        className="m-auto w-[min(1240px,100%)] overflow-hidden rounded-[18px] border border-white/9 bg-black shadow-[0_40px_120px_rgba(0,0,0,.7)]"
      >
        <div className="sticky top-0 z-2 flex items-start justify-between gap-6 border-b border-white/8 bg-black/92 px-10 py-6.5 backdrop-blur-xl">
          <div className="flex flex-col gap-2.5">
            <div className="font-body text-[11px] tracking-[0.16em] text-teal">
              {String(categoryIndex + 1).padStart(2, '0')} / 04 · CATEGORY
            </div>
            <div className="font-heading text-[clamp(26px,2.6vw,36px)] font-semibold tracking-[-0.02em] text-orange">
              {category.title}
            </div>
            <p className="m-0 max-w-[60ch] font-body text-[15.5px]/[1.7] text-grey">{category.body}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close category"
            className="size-9 flex-none cursor-pointer rounded-[9px] bg-white/6 font-body text-base text-white transition-colors duration-180 hover:bg-white/12"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-10 p-10">
          <div className="grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
            {category.stats.map((s) => (
              <div key={s.label} className="flex flex-col gap-2 rounded-[14px] bg-surface px-7.5 py-7 border border-white/6">
                <div className="font-heading text-[clamp(34px,3.4vw,48px)] font-bold tracking-[-0.03em] text-green leading-none">
                  {s.value}
                </div>
                <div className="font-body text-[10.5px] tracking-[0.14em] text-grey">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-5">
            <div className="font-body text-[11px] tracking-[0.16em] text-teal">
              {category.projects.length} PROJECTS
            </div>
            <div className="grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
              {category.projects.map((p, pi) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => onOpenProject(pi)}
                  className="flex cursor-pointer flex-col overflow-hidden rounded-[14px] border border-white/7 bg-surface p-0 text-left transition-[border-color,transform] duration-200 hover:-translate-y-1 hover:border-orange/50"
                >
                  <div className="grid h-[150px] place-items-center bg-[repeating-linear-gradient(120deg,#111316,#111316_9px,#171a1e_9px,#171a1e_18px)]">
                    <span className="font-body text-[10px] tracking-[0.14em] text-[#5a5a5a]">PROJECT SHOT</span>
                  </div>
                  <div className="flex flex-col gap-2 px-5.5 py-5">
                    <div className="font-heading text-[16.5px]/[1.35] font-semibold tracking-[-0.01em] text-white">
                      {p}
                    </div>
                    <div className="font-body text-[12.5px] text-teal">Open case study →</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
