type P = { className?: string };
const base = (className = "h-5 w-5") => ({
  className,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
});

export const WhatsAppIcon = ({ className = "h-5 w-5" }: P) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.21 3.08.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35ZM12.04 21.5h-.01a9.45 9.45 0 0 1-4.82-1.32l-.35-.2-3.58.94.96-3.49-.23-.36a9.43 9.43 0 0 1-1.45-5.03c0-5.22 4.25-9.46 9.48-9.46 2.53 0 4.9.99 6.69 2.78a9.4 9.4 0 0 1 2.77 6.69c0 5.22-4.25 9.46-9.46 9.46Zm8.06-17.52A11.32 11.32 0 0 0 12.04.65C5.76.65.66 5.75.65 12.02c0 2 .52 3.96 1.52 5.69L.56 23.6l6.03-1.58a11.37 11.37 0 0 0 5.44 1.39h.01c6.28 0 11.38-5.1 11.38-11.37 0-3.04-1.18-5.9-3.33-8.05Z" />
  </svg>
);
export const SearchIcon = ({ className }: P) => (
  <svg {...base(className)}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);
export const CalendarIcon = ({ className }: P) => (
  <svg {...base(className)}>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M16 3v4M8 3v4M3 10h18" />
  </svg>
);
export const CalculatorIcon = ({ className }: P) => (
  <svg {...base(className)}>
    <rect x="5" y="3" width="14" height="18" rx="2" />
    <path d="M8 7h8M8 11h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M16 15h.01M8 18h.01M12 18h.01M16 18h.01" />
  </svg>
);
export const SwapIcon = ({ className }: P) => (
  <svg {...base(className)}>
    <path d="M7 4 3 8l4 4M3 8h14M17 20l4-4-4-4M21 16H7" />
  </svg>
);
export const PinIcon = ({ className }: P) => (
  <svg {...base(className)}>
    <path d="M12 21s-7-6.1-7-11.5A7 7 0 0 1 19 9.5C19 14.9 12 21 12 21Z" />
    <circle cx="12" cy="9.5" r="2.5" />
  </svg>
);
export const ClockIcon = ({ className }: P) => (
  <svg {...base(className)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);
export const ShieldIcon = ({ className }: P) => (
  <svg {...base(className)}>
    <path d="M12 3 4 6v6c0 4.5 3.4 8.3 8 9 4.6-.7 8-4.5 8-9V6l-8-3Z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);
export const DocIcon = ({ className }: P) => (
  <svg {...base(className)}>
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" />
    <path d="M14 3v5h5M9 13h6M9 17h6" />
  </svg>
);
export const WrenchIcon = ({ className }: P) => (
  <svg {...base(className)}>
    <path d="M14.7 6.3a4 4 0 0 0 5 5L21 13l-8 8-3-3 8-8-1.3-1.3a4 4 0 0 1-5-5L9 1" />
    <path d="M3 21l6-6" />
  </svg>
);
export const StoreIcon = ({ className }: P) => (
  <svg {...base(className)}>
    <path d="M3 9 5 4h14l2 5M3 9v11h18V9M3 9h18M9 20v-6h6v6" />
  </svg>
);
export const UsersIcon = ({ className }: P) => (
  <svg {...base(className)}>
    <circle cx="9" cy="8" r="3.5" />
    <path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6.5 6.5 0 0 1 3.5 6" />
  </svg>
);
export const CheckIcon = ({ className }: P) => (
  <svg {...base(className)}>
    <path d="m5 12 5 5L20 7" />
  </svg>
);
export const CloseIcon = ({ className }: P) => (
  <svg {...base(className)}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);
export const ChevronIcon = ({ className }: P) => (
  <svg {...base(className)}>
    <path d="m9 6 6 6-6 6" />
  </svg>
);
export const FilterIcon = ({ className }: P) => (
  <svg {...base(className)}>
    <path d="M4 5h16M7 12h10M10 19h4" />
  </svg>
);
export const MenuIcon = ({ className }: P) => (
  <svg {...base(className)}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
);
export const PlayIcon = ({ className }: P) => (
  <svg className={className ?? "h-6 w-6"} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M8 5v14l11-7L8 5Z" />
  </svg>
);
