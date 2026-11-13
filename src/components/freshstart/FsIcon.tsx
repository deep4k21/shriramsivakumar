/**
 * Freshstart's icon set, ported from `freshstart-handoff/icons/icons.json`.
 *
 * The path data lives here rather than as twelve SVG files fetched at
 * runtime: the set is small, it is referenced from two spreads at three
 * different sizes, and inlining it keeps the icons under the same colour
 * inheritance as the text beside them without a loading state.
 */

interface FsIconSpec {
  name: string;
  label: string;
  /** The stroked outline. Drawn in `currentColor`, so the parent sets it. */
  d: string;
  /** The single accent dot, always filled Launch Cyan. */
  dot: { cx: number; cy: number; r: number };
}

export const FS_ICONS: FsIconSpec[] = [
  {
    name: 'rocket',
    label: 'Rocket',
    d: 'M12 3c3 2 4.5 5.5 4.5 9.5L14.5 17h-5l-2-4.5C7.5 8.5 9 5 12 3z M7.5 12.5L5 15v3l4.5-1 M16.5 12.5L19 15v3l-4.5-1 M12 19.5V21',
    dot: { cx: 12, cy: 9.5, r: 1.75 },
  },
  {
    name: 'handshake',
    label: 'Handshake',
    d: 'M2 10l4-4h3.5l2.5 2 M22 10l-4-4h-3.5l-5 4.2a1.5 1.5 0 0 0 2 2.2L14 11l4 4 M6 6v7.5l4.8 4a1.8 1.8 0 0 0 2.4 0L18 15',
    dot: { cx: 12, cy: 3.25, r: 1.5 },
  },
  {
    name: 'mentor',
    label: 'Mentor',
    d: 'M6 7a3 3 0 1 0 6 0a3 3 0 1 0 -6 0 M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6 M16 14.3c.5-.2 1-.3 1.5-.3 2.5 0 4.5 2 4.5 4.5',
    dot: { cx: 17.5, cy: 9.5, r: 2 },
  },
  {
    name: 'credits',
    label: 'Credits',
    d: 'M4 12a8 8 0 1 0 16 0a8 8 0 1 0 -16 0 M14.5 9h-3.25a1.75 1.75 0 0 0 0 3.5h1.5a1.75 1.75 0 0 1 0 3.5H9.5',
    dot: { cx: 20, cy: 4, r: 1.5 },
  },
  {
    name: 'community',
    label: 'Community',
    d: 'M3.25 9a1.75 1.75 0 1 0 3.5 0a1.75 1.75 0 1 0 -3.5 0 M17.25 9a1.75 1.75 0 1 0 3.5 0a1.75 1.75 0 1 0 -3.5 0 M2.5 19v-1.5a3 3 0 0 1 3-3 M21.5 19v-1.5a3 3 0 0 0-3-3 M8 20v-2.5a4 4 0 0 1 8 0V20',
    dot: { cx: 12, cy: 8, r: 2.25 },
  },
  {
    name: 'demo-day',
    label: 'Demo day',
    d: 'M6 5h12a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V8a3 3 0 0 1 3-3z M3 10h18 M8 3v4 M16 3v4',
    dot: { cx: 15.5, cy: 15.5, r: 1.75 },
  },
  {
    name: 'growth',
    label: 'Growth',
    d: 'M4 4v16h16 M7.5 15l3.5-3.5 3 3L18.5 9',
    dot: { cx: 19, cy: 8.5, r: 1.75 },
  },
  {
    name: 'chat',
    label: 'Chat',
    d: 'M5 4.5h14a2 2 0 0 1 2 2V15a2 2 0 0 1-2 2h-8l-4.5 3.5V17H5a2 2 0 0 1-2-2V6.5a2 2 0 0 1 2-2z M8 10.75h.01 M16 10.75h.01',
    dot: { cx: 12, cy: 10.75, r: 1.5 },
  },
  {
    name: 'document',
    label: 'Document',
    d: 'M7 3h7l5 5v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z M14 3v5h5 M8.5 13h7 M8.5 17h4',
    dot: { cx: 15.75, cy: 17, r: 1.5 },
  },
  {
    name: 'certificate',
    label: 'Certificate',
    d: 'M6 9a6 6 0 1 0 12 0a6 6 0 1 0 -12 0 M8.5 13.8L7 21l5-2.5 5 2.5-1.5-7.2',
    dot: { cx: 12, cy: 9, r: 2 },
  },
  {
    name: 'location',
    label: 'Location',
    d: 'M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z',
    dot: { cx: 12, cy: 9.5, r: 2.25 },
  },
  {
    name: 'sparkle',
    label: 'Sparkle',
    d: 'M11 3.5c.6 4.2 2.8 6.4 7 7-4.2.6-6.4 2.8-7 7-.6-4.2-2.8-6.4-7-7 4.2-.6 6.4-2.8 7-7z',
    dot: { cx: 19, cy: 19, r: 1.75 },
  },
];

export type FsIconName = (typeof FS_ICONS)[number]['name'];

const BY_NAME = new Map(FS_ICONS.map((i) => [i.name, i]));

interface FsIconProps {
  name: FsIconName;
  /** Rendered size in px. The viewBox scales; the stroke does not. */
  size?: number;
  /**
   * Announced name. Omitted, the icon is decorative and hidden from
   * assistive tech — which is the common case here, since every icon in
   * these spreads sits beside its own caption.
   */
  label?: string;
}

export function FsIcon({ name, size = 24, label }: FsIconProps) {
  const icon = BY_NAME.get(name);
  if (!icon) return null;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {/*
        Stroke width is fixed at 2 in user units and the viewBox is what
        scales, so the weight stays visually proportional at 24, 40 and 48.
        No `vector-effect`: that pins the stroke to device pixels, which
        thins it at the 2× sizes spread 14 shows the set at.
      */}
      <path
        d={icon.d}
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/*
        A fixed fill rather than `currentColor`: the dot is the one part of
        the mark that stays Launch Cyan on every ground, including reversed
        on Midnight.
      */}
      <circle cx={icon.dot.cx} cy={icon.dot.cy} r={icon.dot.r} fill="var(--fs-launch-cyan)" />
    </svg>
  );
}
