import { useInView, useMotionValue, useTransform, animate, motion } from 'motion/react';
import { useEffect, useRef } from 'react';

export interface ProjectMetric {
  /** e.g. "47+", "2" — the leading number is counted up; any suffix (+, %, etc.) is preserved and appended once counting finishes. */
  value: string;
  label: string;
}

const COUNT_DURATION_S = 1.1;

/**
 * A single metric cell. Splits `value` into its numeric lead and any trailing
 * suffix ("47" + "+"), animates the number from 0, then appends the suffix —
 * so "47+" counts up to 47 and the "+" appears with it rather than being
 * parsed away.
 */
function MetricCell({ metric, active }: { metric: ProjectMetric; active: boolean }) {
  const match = metric.value.match(/^(\d+(?:\.\d+)?)(.*)$/);
  const numeric = match ? Number.parseFloat(match[1]) : null;
  const suffix = match ? match[2] : '';
  const decimals = match && match[1].includes('.') ? match[1].split('.')[1].length : 0;

  const count = useMotionValue(0);
  const display = useTransform(count, (v) => `${v.toFixed(decimals)}${suffix}`);
  const reduceMotion =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (numeric === null || !active) return;
    if (reduceMotion) {
      count.set(numeric);
      return;
    }
    const controls = animate(count, numeric, { duration: COUNT_DURATION_S, ease: [0.2, 0.7, 0.2, 1] });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, numeric, reduceMotion]);

  return (
    <div className="flex flex-col items-center gap-1.5 text-center">
      <div className="font-heading text-[clamp(28px,3.4vw,40px)] leading-none font-bold text-white">
        {/* Non-numeric values (e.g. "N/A") skip the counter and just fade in with the row. */}
        {numeric === null ? metric.value : <motion.span>{display}</motion.span>}
      </div>
      <div className="font-body text-[11px] font-medium tracking-[0.12em] text-grey uppercase">{metric.label}</div>
    </div>
  );
}

/**
 * The optional metrics row: three stat cells under an "OUTCOME"-style label,
 * sitting between the last process row and the end note. Counts numeric
 * values up from zero once scrolled into view; non-numeric values just fade
 * in. Omit `metrics` entirely on a project to skip the row — nothing is
 * rendered and no spacing is reserved for it.
 */
export function ProjectMetricsRow({ label, metrics }: { label: string; metrics: ProjectMetric[] }) {
  const ref = useRef<HTMLDivElement>(null);
  // `once: true` matches the rest of the page's reveal-on-scroll treatment —
  // the count plays the first time the row is visible and doesn't replay.
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <div
      ref={ref}
      className="grid gap-6 border-t border-white/7 py-5"
      style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}
    >
      <div className="font-heading text-xs font-semibold tracking-[0.14em] text-orange">{label}</div>
      <motion.div
        className="grid grid-cols-3 gap-4"
        initial={{ opacity: 0, y: 8 }}
        animate={inView ? { opacity: 1, y: 0 } : undefined}
        transition={{ duration: 0.4 }}
      >
        {metrics.map((m) => (
          <MetricCell key={m.label} metric={m} active={inView} />
        ))}
      </motion.div>
    </div>
  );
}
