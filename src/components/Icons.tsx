interface IconProps {
  size?: number;
  className?: string;
}

const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

export function SparkleIcon({ size = 13, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} className={className}>
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6.3 6.3l2.8 2.8M14.9 14.9l2.8 2.8M17.7 6.3l-2.8 2.8M9.1 14.9l-2.8 2.8" />
    </svg>
  );
}

export function CompassIcon({ size = 13, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M15.5 8.5l-2.2 5.3-5.3 2.2 2.2-5.3z" />
    </svg>
  );
}

export function LaptopIcon({ size = 14, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} className={className}>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2M3 12h18" />
    </svg>
  );
}

export function CompassBearingIcon({ size = 14, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} className={className}>
      <path d="M4 15l10-4M8 16.5l1.5 4M14.5 5.5l5 2-2 5-8-3z" />
      <circle cx="6" cy="16" r="2" />
    </svg>
  );
}

export function BriefcaseIcon({ size = 14, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} className={className}>
      <path d="M4 21h16M8 21V5a2 2 0 012-2h6a2 2 0 012 2v16" />
      <circle cx="15" cy="12" r="1" />
    </svg>
  );
}

export function WrenchIcon({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} className={className}>
      <path d="M14.5 3.5a4.5 4.5 0 00-5.9 5.9L3 15v6h6l5.6-5.6a4.5 4.5 0 005.9-5.9l-3 3-3-3z" />
    </svg>
  );
}

export function ChipIcon({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} className={className}>
      <rect x="7" y="7" width="10" height="10" rx="2" />
      <path d="M4 10V4h6M20 14v6h-6M4 14v6h6M20 10V4h-6" />
    </svg>
  );
}

export function RibbonIcon({ size = 14, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} className={className}>
      <circle cx="6" cy="19" r="2.5" />
      <circle cx="18" cy="5" r="2.5" />
      <path d="M8.5 19h5a3.5 3.5 0 000-7h-3a3.5 3.5 0 010-7h7" />
    </svg>
  );
}

export function GridIcon({ size = 14, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base} className={className}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

export function DownloadCircleIcon({ size = 33, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 33 33" fill="none" className={className}>
      <path
        d="M15.2292 18.8264L12.066 15.6632C11.8985 15.4957 11.6987 15.4119 11.4667 15.4119C11.2346 15.4119 11.0349 15.4957 10.8674 15.6632C10.6995 15.831 10.6156 16.0386 10.6156 16.2858C10.6156 16.5331 10.6995 16.7367 10.8674 16.8968L15.1463 21.1762C15.436 21.4655 15.7737 21.6102 16.1595 21.6102C16.5453 21.6102 16.8829 21.4655 17.1722 21.1762L21.4516 16.8968C21.6194 16.7367 21.7034 16.5331 21.7034 16.2858C21.7034 16.0386 21.6194 15.831 21.4516 15.6632C21.2841 15.4957 21.0767 15.4119 20.8295 15.4119C20.5819 15.4119 20.3781 15.4957 20.2181 15.6632L17.0553 18.8264V10.9224C17.0553 10.6686 16.9693 10.4559 16.7973 10.2842C16.6253 10.1125 16.4123 10.0266 16.1581 10.0266C15.904 10.0266 15.6857 10.1125 15.5033 10.2842C15.3205 10.4559 15.2292 10.6686 15.2292 10.9224V18.8264ZM16.1308 32.25C13.9011 32.25 11.8047 31.8269 9.84163 30.9806C7.87885 30.1343 6.1714 28.9859 4.71925 27.5352C3.2671 26.0846 2.1176 24.3786 1.27074 22.4173C0.42358 20.4564 0 18.3609 0 16.1308C0 13.9011 0.423132 11.8047 1.2694 9.84162C2.11566 7.87885 3.26412 6.17139 4.71477 4.71925C6.16542 3.2671 7.87139 2.1176 9.83267 1.27074C11.7936 0.42358 13.8891 0 16.1192 0C18.3489 0 20.4453 0.423133 22.4084 1.2694C24.3711 2.11566 26.0786 3.26412 27.5308 4.71477C28.9829 6.16542 30.1324 7.87139 30.9793 9.83267C31.8264 11.7936 32.25 13.8891 32.25 16.1192C32.25 18.3489 31.8269 20.4453 30.9806 22.4084C30.1343 24.3711 28.9859 26.0786 27.5352 27.5308C26.0846 28.9829 24.3786 30.1324 22.4173 30.9793C20.4564 31.8264 18.3609 32.25 16.1308 32.25ZM16.125 30.4583C20.1264 30.4583 23.5156 29.0698 26.2927 26.2927C29.0698 23.5156 30.4583 20.1264 30.4583 16.125C30.4583 12.1236 29.0698 8.73438 26.2927 5.95729C23.5156 3.18021 20.1264 1.79167 16.125 1.79167C12.1236 1.79167 8.73438 3.18021 5.95729 5.95729C3.18021 8.73438 1.79167 12.1236 1.79167 16.125C1.79167 20.1264 3.18021 23.5156 5.95729 26.2927C8.73438 29.0698 12.1236 30.4583 16.125 30.4583Z"
        fill="currentColor"
      />
    </svg>
  );
}
