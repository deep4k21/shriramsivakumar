import { NAV_ITEMS } from '../../data/content';

/**
 * Which sections the mobile layout actually has yet.
 *
 * The bar shows all three from the start so its shape does not change as
 * pages land, but a link to a section that does not exist is a link that
 * silently does nothing when tapped — worse than one that is visibly not
 * ready. The rest render as disabled until their page is built, and are
 * removed from this set as each arrives.
 */
const BUILT = new Set(['home', 'portfolio']);

/**
 * The section nav, as a bottom bar.
 *
 * Desktop runs this as a vertical rail down the left edge — a shape that only
 * works when there is width to spare beside the content, and which on a phone
 * would eat a third of the screen. A bottom bar is the phone convention and
 * puts the controls within thumb reach, which a left rail on a touch screen
 * is not.
 *
 * Only the three section links carry over. The desktop rail also holds the
 * avatar, a status dot and Portfolio's nested category list; the categories
 * are better as a full-screen menu on a phone and will come with the
 * portfolio page, and the rest is decoration this does not have room for.
 *
 * `#`-anchored like desktop, so the browser does the scrolling and the links
 * keep working without JavaScript — the mobile layout is one long scroll, so
 * there is nothing here that needs intercepting.
 */
export function MobileNav() {
  return (
    <nav
      aria-label="Sections"
      /*
        Fixed, and padded for the home indicator on phones whose gesture bar
        overlaps the viewport — `env(safe-area-inset-bottom)` is zero on
        everything else, so the bar keeps its own padding there.
      */
      className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-[#101114]/95 backdrop-blur-md"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="m-0 flex list-none items-stretch justify-around p-0">
        {NAV_ITEMS.map((item) => {
          const ready = BUILT.has(item.id);
          const inner = (
            <>
              {/*
                The rail's own icons. They are flat SVGs with their own fill
                rather than `currentColor` shapes, so they cannot take the
                link's colour — `opacity` carries the state instead, which is
                what the desktop rail does with them too.
              */}
              <img
                src={item.icon}
                alt=""
                aria-hidden="true"
                className={`size-5 ${ready ? 'opacity-80' : 'opacity-35'}`}
              />
              <span className="font-body text-[10px] tracking-[0.06em] whitespace-nowrap">
                {item.label}
              </span>
            </>
          );
          return (
            <li key={item.id} className="flex-1">
              {ready ? (
                <a
                  href={item.href}
                  className="flex flex-col items-center gap-1 px-2 py-2.5 text-grey no-underline transition-colors duration-180 hover:text-teal"
                >
                  {inner}
                </a>
              ) : (
                /*
                  A span, not a disabled link: an `<a>` without a usable
                  `href` is not focusable or announced as a link anyway, so
                  marking it up as one would only promise navigation that
                  cannot happen. `aria-disabled` says why it is inert.
                */
                <span
                  aria-disabled="true"
                  className="flex cursor-default flex-col items-center gap-1 px-2 py-2.5 text-grey/40"
                >
                  {inner}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
