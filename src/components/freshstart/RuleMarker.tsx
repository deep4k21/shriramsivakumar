interface RuleMarkerProps {
  kind: 'do' | 'dont';
  size?: number;
}

/**
 * The ✓ / ✕ markers used across the misuse, gradient, launch-line and
 * photography spreads.
 *
 * Deliberately red-free. The usual green/red pairing fails for the readers
 * most likely to need the distinction, so the two are told apart by fill and
 * symbol instead: a solid Midnight disc for "do", an outlined white one for
 * "don't". Both carry a label in the surrounding copy, so neither depends on
 * the marker alone.
 */
export function RuleMarker({ kind, size = 24 }: RuleMarkerProps) {
  const isDo = kind === 'do';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      role="img"
      aria-label={isDo ? 'Do' : "Don't"}
    >
      <circle
        cx={12}
        cy={12}
        r={11}
        fill={isDo ? 'var(--fs-midnight)' : 'var(--fs-white)'}
        stroke={isDo ? 'none' : 'var(--fs-midnight)'}
        strokeWidth={isDo ? 0 : 1.5}
      />
      {isDo ? (
        <path
          d="M7.5 12.4l3 3 6-6.4"
          stroke="var(--fs-white)"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <path
          d="M8.5 8.5l7 7 M15.5 8.5l-7 7"
          stroke="var(--fs-midnight)"
          strokeWidth={2}
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}
