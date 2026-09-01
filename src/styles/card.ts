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

/**
 * The glass variant used by About's cards — the project modal's panel look: a
 * thin gradient with inset lines picking out the top edge and rim, over a much
 * lighter fill than `CARD` so the page reads through it.
 *
 * No `backdrop-filter`, for the same reason as above and measured again here:
 * About is pinned and its cards move with the scroll, and blurring five of
 * them per frame took the section's median frame from 17.5ms to 44.7ms — 57fps
 * down to 22. The modal can afford it because it sits still; these cannot.
 *
 * The look survives the omission because what reads as glass is the gradient
 * and the rim, not the blur: the page behind these cards is a near-black
 * backdrop with little detail for a blur to soften.
 */
export const CARD_GLASS =
  'rounded-[10px] border border-white/12 bg-[linear-gradient(158deg,rgba(46,49,58,.49),rgba(18,19,24,.41)_42%,rgba(32,34,41,.45))] shadow-[0_18px_44px_rgba(0,0,0,.35),inset_0_1px_0_rgba(255,255,255,.14),inset_0_0_0_1px_rgba(255,255,255,.06)]';

