import React from 'react';
import { QrCode } from './QrCode';

interface Props {
  room: string;
  url: string;
  transport: 'firebase' | 'local';
  connected: boolean;
}

export const JoinPanel: React.FC<Props> = ({ room, url, transport, connected }) => (
  <section aria-label="Join" className="flex items-center gap-[1.6em]">
    <QrCode url={url} size="clamp(150px, 25vh, 290px)" label="QR code to join the room" />
    <div className="min-w-0 flex-1">
      <div className="text-[.78em] font-semibold uppercase tracking-[.2em] text-[#CBEA70]">Room</div>
      <div className="font-display font-extrabold leading-none tracking-[.04em] text-[#F4F7EF]" style={{ fontSize: 'clamp(44px, 8vh, 96px)' }}>{room}</div>
      <h1 className="mt-[.7em] font-display font-semibold leading-[1.1] text-[#F4F7EF]" style={{ fontSize: 'clamp(22px, 3.3vh, 38px)' }}>
        Scan to join as a household in Dhaka
      </h1>
      <div className="mt-[.5em] break-all text-[.85em] text-[#F4F7EF]/60">{url.replace(/^https?:\/\//, '')}</div>
      <div className="mt-[.9em]">
        {transport === 'local' ? (
          <span className="inline-flex items-center gap-[.6em] rounded-full border border-[#F5BF55]/50 bg-[#F5BF55]/10 px-[1em] py-[.35em] text-[.78em] font-semibold text-[#F5BF55]">
            <span className="h-2 w-2 rounded-full bg-[#F5BF55]" />
            Offline backup {'—'} phones can{'’'}t join; simulated audience
          </span>
        ) : (
          <span className={`inline-flex items-center gap-[.6em] rounded-full border px-[1em] py-[.35em] text-[.78em] font-semibold ${connected ? 'border-[#CBEA70]/50 bg-[#CBEA70]/10 text-[#CBEA70]' : 'border-[#F5BF55]/50 bg-[#F5BF55]/10 text-[#F5BF55]'}`}>
            <span className={`h-2 w-2 rounded-full ${connected ? 'bg-[#CBEA70] animate-pulse' : 'bg-[#F5BF55]'}`} />
            {connected ? 'Live' : 'Reconnecting…'}
          </span>
        )}
      </div>
    </div>
  </section>
);
