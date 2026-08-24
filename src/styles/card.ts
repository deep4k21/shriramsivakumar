/**
 * The shared surface style for content cards — About's tiles and toolkit
 * panels, Career's tab container, and the Portfolio stage panel.
 *
 * Built on the Figma spec (#15161A fill, #89919F stroke, 10px radius) with the
 * fill slightly translucent so the card reads as a panel over the page rather
 * than a solid block.
 *
 * Deliberately no `backdrop-filter`: with five of these transforming at once,
 * the Portfolio collapse re-sampled and re-blurred the backdrop every frame,
 * pushing the worst frame from 30ms to 109ms. The page behind the cards is
 * near-black, so the blur cost far more than it showed.
 */
export const CARD =
  'rounded-[10px] border border-[#89919F]/70 bg-[#15161A]/85';

