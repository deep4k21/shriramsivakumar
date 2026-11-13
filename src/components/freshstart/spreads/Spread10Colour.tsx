import { Spread } from '../Spread';

interface Swatch {
  name: string;
  role: string;
  hex: string;
  rgb: string;
  cmyk: string;
  /** Light swatches need a hairline to read against the white ground. */
  border?: boolean;
}

const SWATCHES: Swatch[] = [
  { name: 'Launch Cyan', role: 'Accent · gradient start', hex: '#6AE2F2', rgb: '106 226 242', cmyk: 'C56 M7 Y0 K5' },
  { name: 'Founder Blue', role: 'Primary · gradient end', hex: '#4F56E8', rgb: '79 86 232', cmyk: 'C66 M63 Y0 K9' },
  { name: 'Midnight', role: 'Text · dark ground', hex: '#302A7C', rgb: '48 42 124', cmyk: 'C61 M66 Y0 K51' },
  { name: 'Mist', role: 'Light ground', hex: '#EEF2FB', rgb: '238 242 251', cmyk: 'C5 M4 Y0 K2', border: true },
  { name: 'White', role: 'Surfaces · cards', hex: '#FFFFFF', rgb: '255 255 255', cmyk: 'C0 M0 Y0 K0', border: true },
];

/** How much of each colour a layout should carry. */
const PROPORTION = [
  { label: 'Mist 50%', width: '50%', background: 'var(--fs-mist)', border: true },
  { label: 'White 20%', width: '20%', background: 'var(--fs-white)', border: true },
  { label: 'Midnight 15%', width: '15%', background: 'var(--fs-midnight)' },
  { label: 'Blue 10%', width: '10%', background: 'var(--fs-founder-blue)' },
  { label: 'Cyan 5%', width: '5%', background: 'var(--fs-launch-cyan)' },
];

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span
        className="uppercase"
        style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', color: 'var(--fs-ink-muted)' }}
      >
        {label}
      </span>
      <span style={{ fontSize: 12, fontWeight: 500 }}>{value}</span>
    </div>
  );
}

/**
 * The palette, with print values.
 *
 * Pantone is left as a bracketed placeholder rather than guessed at: a
 * nearest-match picked from a screen is the kind of value that reaches a
 * printer unchecked, and the handoff asks the owner to supply the real
 * references.
 */
export function Spread10Colour() {
  return (
    <Spread number="10" title="Colour" note="CMYK is a straight conversion. Proof before print.">
      <div className="flex h-full flex-col justify-between gap-6">
        <div className="grid grid-cols-5 gap-4">
          {SWATCHES.map((s) => (
            <div key={s.name} className="flex flex-col gap-3">
              <div
                aria-hidden="true"
                style={{
                  height: 104,
                  borderRadius: 'var(--fs-tile-radius)',
                  background: s.hex,
                  border: s.border ? '1px solid var(--fs-line)' : undefined,
                }}
              />
              <div className="flex flex-col gap-0.5">
                <span style={{ fontSize: 14, fontWeight: 600 }}>{s.name}</span>
                <span style={{ fontSize: 11, color: 'var(--fs-ink-muted)' }}>{s.role}</span>
              </div>
              <div
                className="flex flex-col gap-1.5 pt-2.5"
                style={{ borderTop: '1px solid var(--fs-line-soft)' }}
              >
                <Field label="HEX" value={s.hex} />
                <Field label="RGB" value={s.rgb} />
                <Field label="CMYK" value={s.cmyk} />
                <Field label="Pantone" value="[ nearest Pantone ]" />
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2.5">
          <span
            className="uppercase"
            style={{
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: '0.14em',
              color: 'var(--fs-founder-blue)',
            }}
          >
            Proportion
          </span>
          <div
            className="flex overflow-hidden"
            style={{ height: 40, borderRadius: 'var(--fs-tile-radius)' }}
          >
            {PROPORTION.map((p) => (
              <div
                key={p.label}
                className="flex items-center justify-center"
                style={{
                  width: p.width,
                  background: p.background,
                  borderTop: p.border ? '1px solid var(--fs-line)' : undefined,
                  borderBottom: p.border ? '1px solid var(--fs-line)' : undefined,
                }}
              >
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    color: p.border ? 'var(--fs-ink-muted)' : 'var(--fs-white)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {p.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Spread>
  );
}
