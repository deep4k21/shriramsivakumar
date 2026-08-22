import { motion } from 'motion/react';
import { useState } from 'react';
import { NAV_ITEMS } from '../data/content';

interface SidebarProps {
  active: string;
  visible: boolean;
  statusLabel: string;
  onOpenConnect: () => void;
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

export function Sidebar({ active, visible, statusLabel, onOpenConnect }: SidebarProps) {
  const [hover, setHover] = useState(false);

  const isNavItemActive = (id: string) =>
    active === id || (id === 'home' && (active === 'about' || active === 'intro'));

  return (
    <motion.aside
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="fixed top-1/2 left-[22px] z-30 box-border flex -translate-y-1/2 flex-col gap-1.5 overflow-hidden rounded-2xl border border-white/7 bg-surface/96 p-3 shadow-[0_18px_44px_rgba(0,0,0,.5)]"
      animate={{ width: hover ? 212 : 62, opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.3, ease: EASE_OUT }}
      style={{ pointerEvents: visible ? 'auto' : 'none' }}
    >
      <div className="flex items-center gap-3 border-b border-white/6 px-1 pt-1 pb-2.5">
        <span className="size-7 flex-none overflow-hidden rounded-full border border-white/12">
          <img src="/images/menuicons/avatar.png" alt="" className="size-full object-cover" />
        </span>
        <RailLabel show={hover} className="font-heading text-[12.5px] font-semibold text-white">
          Shriram Sivakumar
        </RailLabel>
      </div>

      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const on = isNavItemActive(item.id);
          return (
            <motion.a
              key={item.id}
              href={item.href}
              title={item.label}
              className="flex items-center gap-3 rounded-[9px] px-1 py-2 font-body"
              animate={{
                backgroundColor: on ? 'rgba(255,255,255,.06)' : 'rgba(255,255,255,0)',
                color: on ? '#ffffff' : '#808080',
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
