import type { CSSProperties, ReactNode } from 'react';
import { FsLockup } from '../FsLockup';
import { FsMark } from '../FsMark';
import { RuleMarker } from '../RuleMarker';
import { Spread } from '../Spread';

/**
 * One "don't", drawn as the mistake it names.
 *
 * Each tile shows the violation rather than describing it: a rule about
 * stretching only lands if the reader sees a stretched mark.
 */
function DontTile({ caption, children }: { caption: string; children: ReactNode }) {
  return (
    <figure className="m-0 flex flex-col gap-2.5">
      <div
        className="relative flex items-center justify-center overflow-hidden"
        style={{
          aspectRatio: '4 / 3',
          borderRadius: 'var(--fs-tile-radius)',
          background: 'var(--fs-mist)',
          border: '1px solid var(--fs-line)',
        }}
      >
        {children}
        <div className="absolute" style={{ top: 8, right: 8 }}>
          <RuleMarker kind="dont" size={20} />
        </div>
      </div>
      <figcaption style={{ fontSize: 12, lineHeight: 1.4, color: 'var(--fs-ink-muted)' }}>
        {caption}
      </figcaption>
    </figure>
  );
}

/** The violations, each as the transform that produces it. */
const SQUASHED: CSSProperties = { transform: 'scaleX(1.5) scaleY(0.72)' };
const ROTATED: CSSProperties = { transform: 'rotate(-18deg)' };

export function Spread09Misuse() {
  return (
    <Spread number="09" title="Misuse" note="Use the supplied files as they are">
      <div className="grid h-full grid-cols-4 gap-x-5 gap-y-4">
        <DontTile caption="Don't stretch or squash">
          <div style={SQUASHED}>
            <FsMark size={52} />
          </div>
        </DontTile>

        <DontTile caption="Don't rotate">
          <div style={ROTATED}>
            <FsLockup layout="horizontal" markSize={24} />
          </div>
        </DontTile>

        <DontTile caption="Don't recolour the gradient">
          <div
            aria-hidden="true"
            style={{
              width: 52,
              height: 52,
              borderRadius: '50% 18% 50% 50%',
              background: 'linear-gradient(135deg, #F2C46A 0%, #E8564F 100%)',
            }}
          />
        </DontTile>

        <DontTile caption="Don't add shadows, glows or effects">
          <div style={{ filter: 'drop-shadow(0 8px 10px rgba(48,42,124,0.55))' }}>
            <FsMark size={52} />
          </div>
        </DontTile>

        <DontTile caption="Don't outline the mark">
          <div
            aria-hidden="true"
            style={{
              width: 52,
              height: 52,
              borderRadius: '50% 18% 50% 50%',
              background: 'transparent',
              border: '2.5px solid var(--fs-midnight)',
            }}
          />
        </DontTile>

        <DontTile caption="Don't place on a busy photo without a scrim">
          <div
            className="absolute inset-0"
            role="img"
            aria-label="Placeholder for a busy photograph"
            style={{
              background:
                'repeating-conic-gradient(from 0deg, #8E96C8 0deg 18deg, #C8D0EA 18deg 36deg)',
            }}
          />
          <div className="relative">
            <FsLockup layout="horizontal" markSize={24} />
          </div>
        </DontTile>

        <DontTile caption="Don't rearrange the lockup">
          {/* The wordmark set before the mark, which no approved layout does. */}
          <div className="flex flex-row-reverse items-center gap-1.5">
            <FsMark size={24} />
            <span
              className="fs-wordmark-placeholder"
              style={{ fontSize: 22, lineHeight: 1, color: 'var(--fs-midnight)' }}
            >
              freshstart
            </span>
          </div>
        </DontTile>

        <DontTile caption="Don't change the wordmark font">
          <div className="flex items-center gap-1.5">
            <FsMark size={24} />
            <span
              style={{
                fontFamily: "'Times New Roman', Times, serif",
                fontSize: 22,
                lineHeight: 1,
                color: 'var(--fs-midnight)',
              }}
            >
              freshstart
            </span>
          </div>
        </DontTile>
      </div>
    </Spread>
  );
}
