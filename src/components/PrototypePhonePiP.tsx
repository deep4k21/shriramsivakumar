import type { ProcessRowPhonePiP } from '../data/content';

/** The device width the embed is designed for — a modern phone screen. */
const DEVICE_WIDTH = 390;

/** Default height when the row hasn't set its own — "the largest slot in the modal". */
const DEFAULT_HEIGHT = 'min(72vh, 780px)';

/**
 * A live prototype held inside a phone-shaped frame, for a process row whose
 * artefact is a mobile screen rather than a desktop one.
 *
 * Named to match `prototype`'s picture-in-picture framing on the rest of the
 * site, but there is no static mockup here to swap with — this row's brief
 * carries no image of its own, only the live embed — so it is simply the
 * prototype shown at device scale, in a frame shaped like the thing it's
 * running on, rather than the bare landscape iframe `PrototypePiP` gives a
 * desktop artefact.
 *
 * Never opens in a new tab on its own — the frame stays on the page like
 * every other embed on the site. The text link beneath it is the one
 * deliberate exception: it goes to the prototype's own deployed URL, which
 * is a real destination outside the site (the same treatment the Connect
 * links give LinkedIn or Dribbble), because a phone-frame embed is
 * necessarily smaller than the thing it's showing and "open it full size"
 * only means something if it leaves the frame's fixed size behind.
 *
 * Fixed to the device's own width rather than stretched to fill whatever the
 * row's height budget computes to — the embedded app is a real responsive
 * page, and a narrower-than-phone viewport makes its own layout reflow
 * (text wrapping to five lines, controls colliding) exactly as it would on
 * an actual undersized phone. Height instead comes from the row's own
 * budget, and the iframe scrolls internally past whatever doesn't fit —
 * that's the one piece of real device behaviour worth keeping: a phone
 * screen scrolls, it doesn't shrink to show everything at once.
 */
export function PrototypePhonePiP({ pip, height }: { pip: ProcessRowPhonePiP; height?: string }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="mx-auto shrink-0 rounded-[2.6rem] border-[6px] border-[#2a2b30] bg-[#111216] p-2 shadow-[0_24px_60px_rgba(0,0,0,.5),inset_0_1px_0_rgba(255,255,255,.08)]"
        style={{ height: height ?? DEFAULT_HEIGHT, width: DEVICE_WIDTH }}
      >
        {/*
          The notch: a fixed strip along the top rather than a shape cut out
          of the frame — the iframe beneath still runs the phone's full
          screen height, and the bar sits over it the way a real notch sits
          over content rather than displacing it.
        */}
        <div className="relative size-full overflow-hidden rounded-[2rem] bg-black">
          <div className="absolute top-2 left-1/2 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-[#111216]" />
          <iframe title="Live prototype" src={pip.embedUrl} className="size-full border-0" />
        </div>
      </div>
      {pip.fullSizeUrl && (
        <a
          href={pip.fullSizeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-body text-[12px] tracking-[0.1em] text-teal uppercase transition-colors duration-180 hover:text-teal-hover"
        >
          Open full size ↗
        </a>
      )}
    </div>
  );
}
