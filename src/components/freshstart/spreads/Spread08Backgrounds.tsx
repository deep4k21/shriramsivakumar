import { FsLockup, type FsLockupTone } from '../FsLockup';
import { Spread } from '../Spread';

interface Tile {
  name: string;
  caption: string;
  tone: FsLockupTone;
  background: string;
  border?: boolean;
  /** Stands in for a licensed photograph. */
  photo?: boolean;
}

const TILES: Tile[] = [
  { name: 'Mist', caption: 'Full colour', tone: 'color', background: 'var(--fs-mist)', border: true },
  { name: 'White', caption: 'Full colour', tone: 'color', background: 'var(--fs-white)', border: true },
  {
    name: 'Midnight',
    caption: 'Reversed · gradient mark, white wordmark',
    tone: 'reverse',
    background: 'var(--fs-midnight)',
  },
  { name: 'Founder Blue', caption: 'All white', tone: 'white', background: 'var(--fs-founder-blue)' },
  {
    name: 'Signature gradient',
    caption: 'All white, on the blue end',
    tone: 'white',
    background: 'var(--fs-gradient)',
  },
  {
    name: 'Photo placeholder',
    caption: 'Photo + Midnight scrim',
    tone: 'white',
    background: 'var(--fs-midnight)',
    photo: true,
  },
];

/**
 * Which lockup goes on which ground.
 *
 * The gradient tile is the one that needs care: white sits on the blue end,
 * because the cyan end does not carry white type at AA. The photo tile
 * shows the scrim that makes any photograph safe to put a lockup on.
 */
export function Spread08Backgrounds() {
  return (
    <Spread
      number="08"
      title="Logo on backgrounds"
      note="Pick the lockup by background, never the other way round"
    >
      <div className="grid h-full grid-cols-3 gap-5">
        {TILES.map((t) => (
          <figure key={t.name} className="m-0 flex flex-col gap-2.5">
            <div
              className="relative flex items-center justify-center overflow-hidden"
              style={{
                aspectRatio: '16 / 9',
                borderRadius: 'var(--fs-tile-radius)',
                background: t.background,
                border: t.border ? '1px solid var(--fs-line)' : undefined,
              }}
            >
              {t.photo && (
                <>
                  {/* The photograph itself, as a labelled stand-in. */}
                  <div
                    role="img"
                    aria-label="Placeholder for a licensed photograph"
                    className="absolute inset-0"
                    style={{
                      background:
                        'repeating-linear-gradient(45deg, #3A3470 0 12px, #332D66 12px 24px)',
                    }}
                  />
                  {/* The scrim that makes the lockup legible over it. */}
                  <div
                    aria-hidden="true"
                    className="absolute inset-0"
                    style={{ background: 'rgba(48,42,124,0.62)' }}
                  />
                </>
              )}
              <div className="relative">
                <FsLockup layout="horizontal" tone={t.tone} markSize={28} />
              </div>
            </div>
            <figcaption className="flex flex-col gap-0.5">
              <span style={{ fontSize: 13, fontWeight: 600 }}>{t.name}</span>
              <span style={{ fontSize: 12, color: 'var(--fs-ink-muted)' }}>{t.caption}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </Spread>
  );
}
