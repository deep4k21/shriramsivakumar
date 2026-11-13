interface PhotoSlotProps {
  /** The file the owner still has to supply, e.g. `photo-01.jpg`. */
  filename: string;
  /** What the image should show. Doubles as the alt text when `src` is set. */
  description: string;
  /** A real image, where one already exists. */
  src?: string;
  ratio?: string;
  /** Fills the slot's box rather than fitting inside it. */
  cover?: boolean;
}

/**
 * An image slot that degrades to a labelled placeholder.
 *
 * The handoff ships most of this book without artwork, and a stand-in that
 * looks finished is how an unapproved asset reaches production — so an
 * empty slot names the file it is waiting for and describes what belongs
 * there. Where the real image already exists in the repo it is passed in
 * and rendered normally.
 */
export function PhotoSlot({ filename, description, src, ratio = '16 / 10', cover }: PhotoSlotProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={description}
        className="w-full"
        style={{
          aspectRatio: ratio,
          objectFit: cover ? 'cover' : 'contain',
          borderRadius: 'var(--fs-tile-radius)',
          // White, because these are artwork scans on a light ground and a
          // transparent PNG would otherwise sit on the card's own fill.
          background: 'var(--fs-white)',
        }}
      />
    );
  }

  return (
    <div
      role="img"
      aria-label={`Placeholder for ${filename}: ${description}`}
      className="flex flex-col items-center justify-center gap-1 p-3 text-center"
      style={{
        aspectRatio: ratio,
        border: '1.5px dashed #C3CBE3',
        borderRadius: 'var(--fs-tile-radius)',
        background: '#F6F8FD',
      }}
    >
      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--fs-midnight)' }}>{filename}</span>
      <span style={{ fontSize: 11, color: 'var(--fs-ink-muted)' }}>{description}</span>
    </div>
  );
}
