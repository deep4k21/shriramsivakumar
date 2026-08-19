import { useState } from 'react';
import { ROLES } from '../data/content';

export function Career() {
  const [companyIdx, setCompanyIdx] = useState(0);
  const role = ROLES[companyIdx];

  return (
    <section id="career" className="flex flex-col gap-9 border-t border-white/6 px-gutter pt-19 pb-24 pl-gutter-nav">
      <div className="font-body text-[11px] tracking-[0.18em] text-teal">03 · CAREER JOURNEY</div>

      <div className="flex flex-col gap-1.75 rounded-2xl border border-white/6 bg-surface px-8 py-7">
        <div className="font-body text-[11px] tracking-[0.16em] text-teal">ACADEMIC</div>
        <div className="font-heading text-[22px] font-semibold tracking-[-0.01em] text-white">
          B.Sc., Visual Communication
        </div>
        <div className="font-body text-[15px] text-grey">SRM Institute of Science and Technology, Chennai</div>
      </div>

      <div className="flex flex-wrap gap-2.5">
        {ROLES.map((r, i) => {
          const on = companyIdx === i;
          return (
            <button
              key={r.name}
              type="button"
              onClick={() => setCompanyIdx(i)}
              title={r.name}
              aria-label={r.name}
              aria-pressed={on}
              className="flex h-14 cursor-pointer items-center justify-center rounded-[11px] border px-6 transition-colors duration-180 hover:border-orange/45"
              style={{
                background: on ? 'rgba(255,154,92,.09)' : 'var(--color-surface)',
                borderColor: on ? 'rgba(255,154,92,.4)' : 'rgba(255,255,255,.08)',
              }}
            >
              <img
                src={r.logo}
                alt={r.name}
                className="h-5.5 w-auto object-contain"
                style={{ opacity: on ? 1 : 0.75 }}
              />
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-5.5 rounded-2xl border border-white/6 bg-surface px-9 py-8.5">
        <div className="flex flex-wrap items-baseline gap-3.5">
          <div className="font-heading text-[25px] font-semibold tracking-[-0.015em] text-orange">{role.title}</div>
          <div className="font-body text-[13.5px] text-grey">{role.period}</div>
        </div>
        {role.progression && (
          <div className="flex flex-wrap items-center gap-2.5 font-heading text-[12.5px] font-medium text-green">
            {role.progression}
          </div>
        )}
        <div className="flex flex-col gap-3.25">
          {role.bullets.map((b) => (
            <div key={b} className="grid grid-cols-[14px_1fr] items-start gap-2">
              <span className="font-body text-[15px]/[1.7] text-teal">·</span>
              <span className="font-body text-[15.5px]/[1.7] text-grey text-pretty">{b}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
