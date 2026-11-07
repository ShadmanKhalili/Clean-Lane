import React from 'react';
import { MaterialGlyph } from '../../../design/materials';
import type { FeedItem } from './feed';

export const LiveFeed: React.FC<{ items: FeedItem[] }> = ({ items }) => (
  <section aria-label="Live journey feed" className="flex min-h-0 flex-1 flex-col">
    <h2 className="mb-[.7em] text-[.78em] font-semibold uppercase tracking-[.2em] text-[#F4F7EF]/55">Live journey feed</h2>
    <ol
      className="flex min-h-0 flex-1 flex-col gap-[.15em] overflow-hidden"
      style={{ maskImage: 'linear-gradient(to bottom, #000 62%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, #000 62%, transparent 100%)' }}
    >
      {items.length === 0 && <li className="text-[1.05em] text-[#F4F7EF]/45">Waiting for the first household{'…'}</li>}
      {items.map((it) => (
        <li key={it.key} className="stage-feed-in flex items-center gap-[.8em] py-[.4em]">
          <span className="grid h-[1.9em] w-[1.9em] shrink-0 place-items-center rounded-full bg-[#F4F7EF]/10">
            <MaterialGlyph material={it.material} size={16} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[1.08em] leading-tight text-[#F4F7EF]">{it.text}</span>
            <span className={`block text-[.7em] font-semibold uppercase tracking-[.16em] ${it.stage === 'recycled' || it.stage === 'verified' ? 'text-[#CBEA70]' : 'text-[#F4F7EF]/45'}`}>{it.label}</span>
          </span>
        </li>
      ))}
    </ol>
  </section>
);
