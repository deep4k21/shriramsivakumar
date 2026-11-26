import { useState } from 'react';
import type { RowScreens } from '../data/content';

/**
 * A row of live screens at three widths, with an optional toggle back to the
 * wireframes they were built from.
 *
 * The screens are bottom-aligned and sized by their own ratios, so a phone
 * next to a desktop reads as the same interface at different widths rather
 * than as three images scaled to match. That relationship is the point of
 * showing all three.
 *
 * Where a `wireframes` image is given, the row can swap to it and back. The
 * before-and-after is worth showing, but only on request: the built screens
 * are what the section argues about, and a permanent second row of grey boxes
 * would compete with them.
 */
export function ScreenTrio({ screens }: { screens: RowScreens }) {
  const [showWireframes, setShowWireframes] = useState(false);
  const hasWireframes = Boolean(screens.wireframes);

  return (
    <div className="flex flex-col gap-3">
      {showWireframes && screens.wireframes ? (
        <div className="flex flex-col gap-3">
          <img
            src={screens.wireframes.src}
            alt={screens.wireframes.alt}
            className="w-full rounded-xl border border-white/10"
          />
          {/*
            The remaining boards as a strip that scrolls on its own, rather
            than a grid that would push the rest of the case study down. Each
            opens full size, because a 240px thumbnail shows a screen's shape
            and nothing else.
          */}
          {screens.wireframes.boards && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {screens.wireframes.boards.map((b) => (
                <a
                  key={b.src}
                  href={b.src}
                  target="_blank"
                  rel="noopener"
                  className="flex w-[240px] flex-none flex-col gap-1.5 no-underline"
                >
                  <img
                    src={b.src}
                    alt={b.alt}
                    className="w-full rounded-lg border border-white/10 transition-colors duration-180 hover:border-white/25"
                  />
                  <span className="font-body text-[11.5px] text-[#8A919C]">{b.alt}</span>
                </a>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-end gap-3">
          {screens.shots.map((s) => (
            <img
              key={s.src}
              src={s.src}
              alt={s.alt}
              /*
                `flex-grow` by ratio, so each screen takes the width its own
                shape asks for and they finish at a common baseline — the
                phone narrow and tall, the desktop wide and short.
              */
              style={{ flex: `${s.ratio} 1 0%` }}
              className="min-w-0 rounded-xl border border-white/10"
            />
          ))}
        </div>
      )}

      {hasWireframes && (
        <button
          type="button"
          aria-pressed={showWireframes}
          onClick={() => setShowWireframes((v) => !v)}
          className="cursor-pointer self-start border-0 bg-transparent p-0 font-body text-[13px] text-teal underline underline-offset-4 transition-colors duration-180 hover:text-teal-hover"
        >
          {showWireframes ? 'Show the build' : screens.wireframes?.toggleLabel}
        </button>
      )}

      {showWireframes && screens.wireframes?.caption && (
        <p className="m-0 font-body text-[12px] text-[#8A919C]">{screens.wireframes.caption}</p>
      )}
    </div>
  );
}
