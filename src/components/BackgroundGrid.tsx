interface BackgroundGridProps {
  visible: boolean;
}

export function BackgroundGrid({ visible }: BackgroundGridProps) {
  return (
    <div
      className="bg-grid-mask pointer-events-none fixed inset-0 -z-10 bg-[length:88px_88px] bg-[image:linear-gradient(rgba(255,255,255,.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.1)_1px,transparent_1px)]"
      style={{ opacity: visible ? 1 : 0 }}
      aria-hidden="true"
    />
  );
}
