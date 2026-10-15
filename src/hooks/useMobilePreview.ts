/**
 * Whether the in-progress mobile layout has been requested explicitly.
 *
 * The mobile site is being built section by section, so it is not the default
 * for narrow viewports yet — `SmallScreenNotice` still is. `?mobile=1` opts
 * into it, which lets the work be reviewed on a real phone and on the deployed
 * URL without showing an unfinished layout to anyone who just visits.
 *
 * Read once at module load rather than through state: the flag comes from the
 * URL and cannot change without a navigation, so there is nothing to subscribe
 * to. Guarded for `window` so a server or test render cannot throw on it.
 *
 * Remove this, and the branch in `App`, once the mobile layout is complete
 * enough to become the default below `SMALL_SCREEN_MAX`.
 */
const MOBILE_PARAM =
  typeof window === 'undefined' ? null : new URLSearchParams(window.location.search).get('mobile');

/** The full in-progress mobile site — hero, intro, about, work and the nav bar. */
export const MOBILE_PREVIEW = MOBILE_PARAM === '1';

/**
 * The featured-work section on its own, at `?mobile=2`.
 *
 * Kept separate from `?mobile=1` rather than replacing it: the four project
 * cards and their case studies are finished enough to look at in isolation,
 * while the sections around them are still being worked through. Two flags
 * means the work can be reviewed on its own without the rest of the
 * half-built page around it, and without having to take those sections out.
 */
export const MOBILE_WORK_ONLY = MOBILE_PARAM === '2';
