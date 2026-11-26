import type { StatusChip } from '../data/content';

/**
 * One named group of labelled swatches in the brand-system box.
 *
 * The label sits to the left and each swatch carries its own word beneath it,
 * because in a palette organised by meaning — a base set, a colour per
 * product — the naming is the system. A strip of unlabelled colour would show
 * the values and lose what they are for.
 */
export function ChipGroup({
  label,
  chips,
  labelWidth,
}: {
  label: string;
  chips: StatusChip[];
  /**
   * A fixed label column, so the swatches in every row of a set begin at the
   * same x. Without it each label sizes to its own text and the rows step in
   * and out, which reads as a mistake rather than as a table.
   */
  labelWidth?: number;
}) {
  return (
    <div className="flex min-w-0 items-center gap-4">
      <span
        className="flex-none font-body text-[13px] text-[#9AA1AC]"
        style={labelWidth ? { width: labelWidth } : undefined}
      >
        {label}
      </span>
      <div className="flex min-w-0 flex-wrap items-start gap-3">
        {chips.map((c) => (
          <div key={c.color} className="flex flex-col gap-2">
            <span
              className="grid h-[52px] w-[108px] place-items-center rounded-lg"
              style={{ background: c.color, border: '1px solid rgba(255,255,255,0.12)' }}
            >
              {/*
                A colour that must never appear without its icon is shown
                here with it, so the swatch states the rule rather than the
                caption having to.
              */}
              {c.warning && (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M12 4.5 21 20H3L12 4.5Z"
                    stroke="#0B0907"
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                  />
                  <path d="M12 10v4.2" stroke="#0B0907" strokeWidth="1.8" strokeLinecap="round" />
                  <circle cx="12" cy="17" r="1.05" fill="#0B0907" />
                </svg>
              )}
            </span>
            <span className="font-body text-[12.5px] whitespace-nowrap text-[#C9D0DA]">
              {c.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
