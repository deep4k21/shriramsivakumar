import { useState } from 'react';
import { FsLockup } from '../FsLockup';

interface Spread01CoverProps {
  /**
   * Renders at the case-study banner's proportions instead of the book's
   * 16:9. The cover is a centred lockup on an empty ground, so at full
   * spread height it is mostly blank — fine as a page in the book, wrong
   * as the band at the top of the case study, where it sits in the slot a
   * 915 × 338 banner used to fill.
   */
  banner?: boolean;
}

/**
 * The cover, with a working LIGHT/DARK switch.
 *
 * The only interactive spread: the rest of the book documents the system,
 * but the cover is where both grounds are shown as a pair, so the toggle
 * demonstrates the reversal rather than describing it.
 */
export function Spread01Cover({ banner }: Spread01CoverProps = {}) {
  const [dark, setDark] = useState(false);

  return (
    <section
      aria-label="Cover"
      className="fs-brand relative box-border flex w-full flex-col items-center justify-center overflow-hidden"
      style={{
        aspectRatio: banner ? '915 / 338' : '16 / 9',
        gap: banner ? 18 : 40,
        borderRadius: 'var(--fs-spread-radius)',
        padding: banner ? '28px 56px' : 56,
        background: dark ? 'var(--fs-midnight)' : 'var(--fs-mist)',
        color: dark ? 'var(--fs-white)' : 'var(--fs-midnight)',
      }}
    >
      <div
        role="group"
        aria-label="Cover theme"
        className="absolute flex gap-[2px] rounded-full p-[3px]"
        style={{
          top: 20,
          right: 20,
          background: dark ? 'rgba(255,255,255,0.12)' : 'var(--fs-white)',
          border: `1px solid ${dark ? 'rgba(255,255,255,0.22)' : '#D5DBEC'}`,
        }}
      >
        {([false, true] as const).map((isDark) => {
          const active = dark === isDark;
          return (
            <button
              key={String(isDark)}
              type="button"
              aria-pressed={active}
              onClick={() => setDark(isDark)}
              className="cursor-pointer rounded-full border-0 font-[inherit] uppercase"
              style={{
                minWidth: 64,
                minHeight: 32,
                padding: '0 14px',
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.12em',
                background: active ? (dark ? 'var(--fs-white)' : 'var(--fs-midnight)') : 'transparent',
                color: active
                  ? dark
                    ? 'var(--fs-midnight)'
                    : 'var(--fs-white)'
                  : dark
                    ? 'rgba(255,255,255,0.80)'
                    : 'var(--fs-ink-muted)',
              }}
            >
              {isDark ? 'Dark' : 'Light'}
            </button>
          );
        })}
      </div>

      <FsLockup
        layout="horizontal"
        tone={dark ? 'reverse' : 'color'}
        markSize={banner ? 150 : 132}
        showPlaceholderNote
      />

      <p
        className="m-0 uppercase"
        style={{
          fontSize: banner ? 13 : 15,
          fontWeight: 500,
          letterSpacing: '0.16em',
          color: dark ? 'rgba(255,255,255,0.72)' : 'var(--fs-ink-muted)',
        }}
      >
        Brand Guidelines · v1.0 · 2026
      </p>
    </section>
  );
}
