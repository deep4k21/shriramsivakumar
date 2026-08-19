import { useState } from 'react';
import { NAV_ITEMS } from '../data/content';

interface SidebarProps {
  active: string;
  visible: boolean;
  statusLabel: string;
  onOpenConnect: () => void;
}

export function Sidebar({ active, visible, statusLabel, onOpenConnect }: SidebarProps) {
  const [hover, setHover] = useState(false);

  const isNavItemActive = (id: string) =>
    active === id || (id === 'home' && (active === 'about' || active === 'intro'));

  return (
    <aside
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="fixed top-1/2 left-[22px] z-30 box-border flex -translate-y-1/2 flex-col gap-1.5 overflow-hidden rounded-2xl border border-white/7 bg-surface/96 p-3 shadow-[0_18px_44px_rgba(0,0,0,.5)] transition-[width,opacity] duration-300 ease-[cubic-bezier(.2,.7,.2,1)]"
      style={{
        width: hover ? '212px' : '62px',
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? 'auto' : 'none',
      }}
    >
      <div className="flex items-center gap-3 border-b border-white/6 px-1 pt-1 pb-2.5">
        <span className="size-7 flex-none overflow-hidden rounded-full border border-white/12">
          <img src="/images/menuicons/avatar.png" alt="" className="size-full object-cover" />
        </span>
        <span
          className="whitespace-nowrap font-heading text-[12.5px] font-semibold text-white transition-opacity duration-250"
          style={{ opacity: hover ? 1 : 0 }}
        >
          Shriram Sivakumar
        </span>
      </div>

      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const on = isNavItemActive(item.id);
          return (
            <a
              key={item.id}
              href={item.href}
              title={item.label}
              className="flex items-center gap-3 rounded-[9px] px-1 py-2 font-body transition-colors duration-180 hover:bg-white/6 hover:text-white"
              style={{ background: on ? 'rgba(255,255,255,.06)' : 'transparent', color: on ? '#fff' : '#808080' }}
            >
              <span className="grid w-7 flex-none place-items-center">
                <img src={item.icon} alt="" className="size-4.5" style={{ opacity: on ? 1 : 0.55 }} />
              </span>
              <span
                className="whitespace-nowrap font-body text-[12.5px] transition-opacity duration-250"
                style={{ opacity: hover ? 1 : 0 }}
              >
                {item.label}
              </span>
            </a>
          );
        })}
        <button
          type="button"
          onClick={onOpenConnect}
          title="Let's connect"
          className="flex cursor-pointer items-center gap-3 rounded-[9px] bg-transparent px-1 py-2 text-left font-body text-grey transition-colors duration-180 hover:bg-white/6 hover:text-white"
        >
          <span className="grid w-7 flex-none place-items-center">
            <img src="/images/menuicons/mobile_vibrate.svg" alt="" className="size-4.5 opacity-55" />
          </span>
          <span
            className="whitespace-nowrap font-body text-[12.5px] transition-opacity duration-250"
            style={{ opacity: hover ? 1 : 0 }}
          >
            Let&rsquo;s connect
          </span>
        </button>
      </nav>

      <div className="flex items-center gap-3 border-t border-white/6 px-1 pt-2 pb-0.5">
        <span className="grid w-7 flex-none place-items-center">
          <span className="size-[7px] rounded-full bg-green shadow-[0_0_0_3px_rgba(71,200,154,.15)]" />
        </span>
        <span
          className="whitespace-nowrap font-heading text-[11px] font-medium text-green transition-opacity duration-250"
          style={{ opacity: hover ? 1 : 0 }}
        >
          {statusLabel}
        </span>
      </div>
    </aside>
  );
}
