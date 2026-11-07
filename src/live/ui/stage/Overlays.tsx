import React, { useEffect, useRef } from 'react';
import { QrCode } from './QrCode';

export type OverlayKind = null | 'help' | 'drive' | 'confirm-new' | 'confirm-reset';

export const SHORTCUTS: [string, string][] = [
  ['S', 'Toggle audience simulator'],
  ['B', 'Toggle offline backup transport'],
  ['F', 'Fast-forward real bookings to recycled'],
  ['D', 'Show collector-phone QR'],
  ['V', 'Open latest verified journey'],
  ['N', 'New room'],
  ['R', 'Reset this room’s bookings'],
  ['Enter', 'Toggle fullscreen'],
  ['Esc', 'Close overlays'],
  ['?', 'This help']
];

const Shell: React.FC<{ title: string; onClose: () => void; children: React.ReactNode; wide?: boolean }> = ({ title, onClose, children, wide }) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.querySelector<HTMLElement>('button[data-autofocus], button')?.focus();
  }, []);
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#050D0A]/80 backdrop-blur-sm" onClick={onClose}>
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className={`max-h-[92vh] overflow-auto rounded-3xl border border-[#F4F7EF]/10 bg-[#0F241D] p-[2.2em] text-[#F4F7EF] shadow-2xl ${wide ? 'w-[min(900px,92vw)]' : 'w-[min(620px,92vw)]'}`}
      >
        <h2 className="font-display text-[1.9em] font-semibold">{title}</h2>
        {children}
      </div>
    </div>
  );
};

const Btn: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { primary?: boolean }> = ({ primary, className = '', ...p }) => (
  <button
    {...p}
    className={`rounded-full px-[1.4em] py-[.6em] font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#CBEA70] ${primary ? 'bg-[#CBEA70] text-[#0B1A15]' : 'bg-[#F4F7EF]/10 text-[#F4F7EF]'} ${className}`}
  />
);

interface Props {
  kind: OverlayKind;
  room: string;
  driveLink: string;
  counts: { real: number; simulated: number };
  onClose: () => void;
  onConfirmNew: () => void;
  onConfirmReset: () => void;
}

export const Overlays: React.FC<Props> = ({ kind, room, driveLink, counts, onClose, onConfirmNew, onConfirmReset }) => {
  if (!kind) return null;
  if (kind === 'help')
    return (
      <Shell title="Presenter shortcuts" onClose={onClose}>
        <dl className="mt-[1em] grid grid-cols-[auto_1fr] gap-x-[1.2em] gap-y-[.55em] text-[1em]">
          {SHORTCUTS.map(([k, d]) => (
            <React.Fragment key={k}>
              <dt><kbd className="inline-block min-w-[2.2em] rounded-lg border border-[#F4F7EF]/25 bg-[#F4F7EF]/10 px-2 py-0.5 text-center font-semibold">{k}</kbd></dt>
              <dd className="text-[#F4F7EF]/85">{d}</dd>
            </React.Fragment>
          ))}
        </dl>
        <p className="mt-[1.2em] rounded-xl bg-[#F4F7EF]/5 p-[.9em] text-[.9em] text-[#F4F7EF]/70">
          Presenter only {'·'} room <b className="text-[#F4F7EF]">{room}</b> {'·'} real households <b className="text-[#CBEA70]">{counts.real}</b> {'·'} simulated <b className="text-[#CBEA70]">{counts.simulated}</b>
        </p>
        <div className="mt-[1.2em] text-right"><Btn primary onClick={onClose}>Close</Btn></div>
      </Shell>
    );
  if (kind === 'drive')
    return (
      <Shell title="Collector phone" onClose={onClose} wide>
        <div className="mt-[1em] flex items-center gap-[2em]">
          <QrCode url={driveLink} size="min(46vh, 340px)" label="QR code for the collector phone" />
          <div className="min-w-0">
            <p className="text-[1.1em] text-[#F4F7EF]/85">Scan with the presenter{'’'}s phone to accept, weigh and verify real bookings.</p>
            <p className="mt-[.8em] break-all text-[.9em] text-[#CBEA70]">{driveLink}</p>
            <div className="mt-[1.4em]"><Btn primary onClick={onClose}>Done</Btn></div>
          </div>
        </div>
      </Shell>
    );
  const isNew = kind === 'confirm-new';
  return (
    <Shell title={isNew ? 'Start a new room?' : 'Reset this room?'} onClose={onClose}>
      <p className="mt-[.8em] text-[1.05em] text-[#F4F7EF]/80">
        {isNew ? 'A new code and QR are generated. Phones in the old room stop appearing on this screen.' : `All bookings in room ${room} are cleared for everyone. This can’t be undone.`}
      </p>
      <div className="mt-[1.4em] flex justify-end gap-[.8em]">
        <Btn onClick={onClose}>Cancel</Btn>
        <Btn primary data-autofocus onClick={isNew ? onConfirmNew : onConfirmReset}>{isNew ? 'New room' : 'Reset bookings'}</Btn>
      </div>
    </Shell>
  );
};
