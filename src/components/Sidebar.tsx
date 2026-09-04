import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { CATEGORIES, NAV_ITEMS } from '../data/content';

interface SidebarProps {
  active: string;
  visible: boolean;
  statusLabel: string;
  onOpenConnect: () => void;
  /** The portfolio category currently expanded, if any. */
  activeCategory: number | null;
  onOpenCategory: (idx: number) => void;
  /** Scrolls to a section's settled position rather than its top edge. */
  onNavigate: (id: string) => void;
  /**
   * Whether scroll currently sits at the mosaic's settled stop — the category
   * list only shows there, since the tiles aren't in their final positions
   * (or aren't visible at all) at any other point in Portfolio's window.
   */
  showPortfolioSubmenu: boolean;
}

const EASE_OUT = [0.2, 0.7, 0.2, 1] as const;

/** Rail labels are hidden until the sidebar expands on hover. */
function RailLabel({ show, className, children }: { show: boolean; className: string; children: React.ReactNode }) {
  return (
    <motion.span
      className={`whitespace-nowrap ${className}`}
      animate={{ opacity: show ? 1 : 0 }}
      transition={{ duration: 0.25 }}
    >
      {children}
    </motion.span>
  );
}

export function Sidebar({
  active,
  visible,
  statusLabel,
  onOpenConnect,
  activeCategory,
  onOpenCategory,
  onNavigate,
  showPortfolioSubmenu,
}: SidebarProps) {
  const [hover, setHover] = useState(false);

  const isNavItemActive = (id: string) =>
    active === id || (id === 'home' && (active === 'about' || active === 'intro'));

  return (
    <motion.aside
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="fixed top-1/2 left-[22px] z-30 box-border flex -translate-y-1/2 flex-col gap-1.5 overflow-hidden rounded-2xl border border-white/7 bg-surface/96 p-3 shadow-[0_18px_44px_rgba(0,0,0,.5)]"
      // Starts hidden. Without this the rail paints at its natural opacity on
      // the first frame and then animates *down* to 0, so it flashes over the
      // hero on load before disappearing.
      initial={{ width: 62, opacity: 0 }}
      animate={{ width: hover ? 212 : 62, opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.3, ease: EASE_OUT }}
      style={{ pointerEvents: visible ? 'auto' : 'none' }}
    >
      {/*
        The avatar and name go home, the way a site's own mark usually does.
        Routed through `onNavigate` rather than left as a plain anchor jump for
        the same reason the nav items are: `home` has a settled position, and
        the default jump lands on the section's top edge instead.
      */}
      <a
        href="#home"
        title="Home"
        onClick={(e) => {
          e.preventDefault();
          onNavigate('home');
        }}
        className="flex cursor-pointer items-center gap-3 border-b border-white/6 px-1 pt-1 pb-2.5"
      >
        <span className="size-7 flex-none overflow-hidden rounded-full border border-white/12">
          <img src="/images/menuicons/avatar.png" alt="" className="size-full object-cover" />
        </span>
        <RailLabel show={hover} className="font-heading text-[12.5px] font-semibold text-white">
          Shriram Sivakumar
        </RailLabel>
      </a>

      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const on = isNavItemActive(item.id);
          const isPortfolio = item.id === 'portfolio';
          return (
            <div
              key={item.id}
              // The portfolio item and its category list share one outlined
              // block while the section is active, the way the design groups
              // them — so the ring is drawn here rather than on the link.
              //
              // The negative inline margin cancels the box's own border and
              // padding, which would otherwise inset its rows by 5px and leave
              // this group's icons off-centre against every other rail item.
              className={
                isPortfolio && on
                  ? '-mx-[5px] flex flex-col rounded-[13px] border border-white/10 p-1'
                  : 'contents'
              }
            >
              <motion.a
                href={item.href}
                title={item.label}
                onClick={(e) => {
                  // The default anchor jump lands on the section's top edge,
                  // which for a pinned section is the state before any of its
                  // content has revealed — so the reader arrives on what looks
                  // like an empty screen. Scroll to where it has settled
                  // instead.
                  e.preventDefault();
                  onNavigate(item.id);
                }}
                className="flex items-center gap-3 rounded-[9px] px-1 py-2 font-body"
                animate={{
                  backgroundColor: on ? 'rgba(255,255,255,.06)' : 'rgba(255,255,255,0)',
                  color: on ? '#ffffff' : '#A5AEBB',
                }}
                whileHover={{ backgroundColor: 'rgba(255,255,255,.06)', color: '#ffffff' }}
                transition={{ duration: 0.18 }}
              >
                <span className="grid w-7 flex-none place-items-center">
                  <motion.img
                    src={item.icon}
                    alt=""
                    className="size-4.5"
                    animate={{ opacity: on ? 1 : 0.55 }}
                    transition={{ duration: 0.18 }}
                  />
                </span>
                <RailLabel show={hover} className="font-body text-[12.5px]">
                  {item.label}
                </RailLabel>
              </motion.a>

              {/*
                The categories, listed only once scroll has actually settled
                at the mosaic's rest stop — not for the whole time Portfolio is
                on screen, since the tiles aren't in their final positions (or
                aren't visible at all) anywhere else in its window. Collapsing
                the height rather than unmounting keeps the open and close
                symmetrical.

                An open category keeps the list up regardless of where scroll
                sits. Opening one from here scrolls to a slightly different
                offset than the settled stop the list is gated on, so gating
                on scroll alone made the list vanish at the very moment the
                reader used it — and took away the means to switch to another
                category without closing this one first.
              */}
              <AnimatePresence initial={false}>
                {isPortfolio && (showPortfolioSubmenu || activeCategory !== null) && (
                  <motion.div
                    /*
                      Indented so the nested list reads as belonging to
                      Portfolio rather than as four more top-level items. The
                      inset is on this wrapper rather than each button, so the
                      hover and open highlights indent with the row instead of
                      starting flush with the rail's edge.

                      34px puts the nested icons' left edge exactly on the
                      "Portfolio" label above them, so the sub-items start where
                      their parent's text does rather than somewhere between its
                      icon and its label.

                      Animated rather than a fixed class: the list stays mounted
                      when the rail collapses to 62px, and a standing indent
                      there pushed the icons off the rail's centre line — out of
                      the rail entirely at its right edge. It goes flush again
                      as the rail shrinks, so the icons re-centre with the ones
                      above them.
                    */
                    className="flex flex-col gap-1 overflow-hidden"
                    initial={{ height: 0, opacity: 0, marginLeft: 0 }}
                    animate={{ height: 'auto', opacity: 1, marginLeft: hover ? 34 : 0 }}
                    exit={{ height: 0, opacity: 0, marginLeft: 0 }}
                    transition={{ duration: 0.28, ease: EASE_OUT }}
                  >
                    {CATEGORIES.map((cat, i) => {
                      const open = activeCategory === i;
                      return (
                        <motion.button
                          key={cat.id}
                          type="button"
                          title={cat.title}
                          onClick={() => onOpenCategory(i)}
                          className="flex cursor-pointer items-center gap-3 rounded-[9px] bg-transparent px-1 py-1.5 text-left font-body"
                          animate={{
                            backgroundColor: open ? 'rgba(255,154,92,.1)' : 'rgba(255,255,255,0)',
                            color: open ? '#FF9A5C' : '#A5AEBB',
                          }}
                          // Orange on hover as well as when open, so the whole
                          // category list stays in the accent rather than
                          // flicking to white under the pointer.
                          whileHover={{ backgroundColor: 'rgba(255,154,92,.08)', color: '#FF9A5C' }}
                          transition={{ duration: 0.18 }}
                        >
                          <span className="grid w-7 flex-none place-items-center">
                            {cat.icon ? (
                              /*
                                Drawn as a mask rather than an `<img>`, so the
                                icon takes the button's own colour — orange when
                                the category is open, white otherwise.

                                White rather than the button's own grey: the
                                nav items above are white SVGs at the same 0.55
                                opacity, so inheriting the label's grey left
                                these visibly dimmer than the icons they sit
                                under. Only the label stays grey.

                                Slightly smaller than the nav items' 4.5, so the
                                nested list still reads as subordinate to them.
                              */
                              <motion.span
                                aria-hidden="true"
                                className="size-4"
                                style={{
                                  maskImage: `url(${cat.icon})`,
                                  WebkitMaskImage: `url(${cat.icon})`,
                                  maskRepeat: 'no-repeat',
                                  WebkitMaskRepeat: 'no-repeat',
                                  maskPosition: 'center',
                                  WebkitMaskPosition: 'center',
                                  maskSize: 'contain',
                                  WebkitMaskSize: 'contain',
                                }}
                                animate={{
                                  backgroundColor: open ? '#FF9A5C' : '#ffffff',
                                  opacity: open ? 1 : 0.55,
                                }}
                                transition={{ duration: 0.18 }}
                              />
                            ) : (
                              <motion.span
                                className="size-1.75 rounded-full"
                                animate={{ backgroundColor: open ? '#FF9A5C' : '#4a4a4a' }}
                                transition={{ duration: 0.18 }}
                              />
                            )}
                          </span>
                          <RailLabel show={hover} className="font-body text-[11.5px]">
                            {cat.short}
                          </RailLabel>
                        </motion.button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
        <motion.button
          type="button"
          onClick={onOpenConnect}
          title="Let's connect"
          className="flex cursor-pointer items-center gap-3 rounded-[9px] bg-transparent px-1 py-2 text-left font-body text-grey"
          whileHover={{ backgroundColor: 'rgba(255,255,255,.06)', color: '#ffffff' }}
          transition={{ duration: 0.18 }}
        >
          <span className="grid w-7 flex-none place-items-center">
            <img src="/images/menuicons/mobile_vibrate.svg" alt="" className="size-4.5 opacity-55" />
          </span>
          <RailLabel show={hover} className="font-body text-[12.5px]">
            Let&rsquo;s connect
          </RailLabel>
        </motion.button>
      </nav>

      <div className="flex items-center gap-3 border-t border-white/6 px-1 pt-2 pb-0.5">
        <span className="grid w-7 flex-none place-items-center">
          <span className="size-[7px] rounded-full bg-green shadow-[0_0_0_3px_rgba(71,200,154,.15)]" />
        </span>
        <RailLabel show={hover} className="font-heading text-[11px] font-medium text-green">
          {statusLabel}
        </RailLabel>
      </div>
    </motion.aside>
  );
}
