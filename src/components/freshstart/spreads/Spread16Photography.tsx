import { PhotoSlot } from '../PhotoSlot';
import { RuleMarker } from '../RuleMarker';
import { Spread } from '../Spread';

const SHOTS = [
  { file: 'photo-01.jpg', title: 'Real founders at work', note: 'Their space, their tools, mid-task.' },
  { file: 'photo-02.jpg', title: 'Small teams', note: 'Two to five people. Never a crowd.' },
  { file: 'photo-03.jpg', title: 'Whiteboards', note: 'Thinking in progress, not finished slides.' },
  { file: 'photo-04.jpg', title: 'Candid collaboration', note: 'Caught between moments, not posed.' },
  { file: 'photo-05.jpg', title: 'Natural light', note: 'Daylight first. No studio flash.' },
  { file: 'photo-06.jpg', title: 'Cool tone', note: 'Grade toward Mist and Midnight. Skip warm filters.' },
];

const RULES = [
  { kind: 'do' as const, title: 'Candid small teams', note: 'People building something together.' },
  { kind: 'dont' as const, title: 'Staged handshakes', note: 'Partnership is shown, not posed.' },
  { kind: 'dont' as const, title: 'Generic stock skylines', note: 'No city as a stand-in for ambition.' },
];

/**
 * Photography direction.
 *
 * Every tile is a placeholder by design: the handoff ships no photography,
 * and the direction is what the spread is for. Commissioned or licensed
 * images replace them.
 */
export function Spread16Photography() {
  return (
    <Spread
      number="16"
      title="Photography direction"
      note="Placeholders · replace with commissioned or licensed photos"
    >
      <div className="flex h-full flex-col justify-between gap-5">
        <div className="grid grid-cols-6 gap-3">
          {SHOTS.map((s) => (
            <figure key={s.file} className="m-0 flex flex-col gap-2">
              <PhotoSlot filename={s.file} description={s.title} ratio="4 / 5" />
              <figcaption className="flex flex-col gap-0.5">
                <span style={{ fontSize: 12, fontWeight: 600 }}>{s.title}</span>
                <span style={{ fontSize: 11, lineHeight: 1.35, color: 'var(--fs-ink-muted)' }}>
                  {s.note}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-4">
          {RULES.map((r) => (
            <div
              key={r.title}
              className="flex items-start gap-3 p-4"
              style={{ background: 'var(--fs-mist)', borderRadius: 'var(--fs-tile-radius)' }}
            >
              <RuleMarker kind={r.kind} size={20} />
              <div className="flex flex-col gap-0.5">
                <span style={{ fontSize: 13, fontWeight: 600 }}>{r.title}</span>
                <span style={{ fontSize: 11, lineHeight: 1.4, color: 'var(--fs-ink-muted)' }}>
                  {r.note}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Spread>
  );
}
