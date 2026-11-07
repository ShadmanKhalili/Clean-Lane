import React from 'react';

/** Small cargo trike rolling along a road line. Decorative. */
export const Trike: React.FC = () => (
  <div className="relative h-[72px] w-full overflow-hidden" aria-hidden="true">
    <div className="absolute inset-x-0 bottom-1 h-1 rounded-full bg-white/25" />
    <div className="absolute bottom-1.5 left-0 w-20" style={{ animation: 'cl-trike 4.5s ease-in-out infinite' }}>
      <svg viewBox="0 0 64 44" width="80" height="55" style={{ animation: 'cl-bob .5s ease-in-out infinite' }}>
        <rect x="8" y="14" width="30" height="16" rx="3" fill="#CBEA70" />
        <path d="M38 30V20h8l6 10Z" fill="#fff" />
        <path d="M42 20l-2-8h10" stroke="#fff" strokeWidth="2.4" fill="none" strokeLinecap="round" />
        <circle cx="16" cy="35" r="6" fill="#0c3a2d" stroke="#fff" strokeWidth="2.4" />
        <circle cx="46" cy="35" r="6" fill="#0c3a2d" stroke="#fff" strokeWidth="2.4" />
        <circle cx="16" cy="35" r="1.6" fill="#fff" />
        <circle cx="46" cy="35" r="1.6" fill="#fff" />
      </svg>
    </div>
  </div>
);
