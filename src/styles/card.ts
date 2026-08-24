/**
 * The shared surface style for content cards — About's tiles and toolkit
 * panels, Career's tab container, and the Portfolio stage panel.
 *
 * Built on the Figma spec (#15161A fill, #89919F stroke, 10px radius) but with
 * the fill taken to ~55% so the card reads as glass: the page's background grid
 * and the hero tiles behind it show through, and the `backdrop-blur` — which
 * does nothing behind an opaque fill — actually has something to soften.
 */
export const CARD =
  'rounded-[10px] border border-[#89919F]/70 bg-[#15161A]/55 backdrop-blur-xl backdrop-saturate-150';
