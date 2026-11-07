import React, { useEffect, useState } from 'react';
import { Expand, FastForward, HelpCircle, Radio, RefreshCw, RotateCcw, Smartphone, Sparkles, Waypoints } from 'lucide-react';

interface Props {
  simulating: boolean;
  backup: boolean;
  counts: { real: number; simulated: number };
  actions: {
    sim: () => void; backup: () => void; ff: () => void; drive: () => void; verify: () => void;
    newRoom: () => void; reset: () => void; help: () => void; fullscreen: () => void;
  };
}

const B: React.FC<{ label: string; k: string; onClick: () => void; on?: boolean; children: React.ReactNode }> = ({ label, k, onClick, on, children }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={`${label} (${k})`}
    aria-pressed={on}
    title={`${label} (${k})`}
    className={`inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-[.85em] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#CBEA70] ${on ? 'bg-[#CBEA70] text-[#0B1A15]' : 'text-[#F4F7EF] hover:bg-[#F4F7EF]/10'}`}
  >
    {children}
    <span className="hidden xl:inline">{label}</span>
    <kbd className="rounded bg-black/25 px-1.5 text-[.8em] opacity-70">{k}</kbd>
  </button>
);

/** Small presenter bar: appears on mouse move, hides after 3 s idle (stays while it has focus). */
export const ControlBar: React.FC<Props> = ({ simulating, backup, counts, actions }) => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    let t = 0;
    const show = () => {
      setVisible(true);
      document.body.style.cursor = '';
      clearTimeout(t);
      t = window.setTimeout(() => {
        setVisible(false);
        document.body.style.cursor = 'none';
      }, 3000);
    };
    window.addEventListener('mousemove', show);
    return () => {
      window.removeEventListener('mousemove', show);
      clearTimeout(t);
      document.body.style.cursor = '';
    };
  }, []);
  return (
    <div
      className={`group fixed inset-x-0 bottom-3 z-40 flex justify-center px-4 transition-opacity duration-300 focus-within:opacity-100 focus-within:pointer-events-auto ${visible ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
    >
      <div role="toolbar" aria-label="Presenter controls" className="flex flex-wrap items-center justify-center gap-0.5 rounded-full border border-[#F4F7EF]/15 bg-[#0B1A15]/90 p-1.5 shadow-2xl backdrop-blur">
        <B label="Simulator" k="S" on={simulating} onClick={actions.sim}><Sparkles size={16} /></B>
        <B label="Offline backup" k="B" on={backup} onClick={actions.backup}><Radio size={16} /></B>
        <B label="Fast-forward" k="F" onClick={actions.ff}><FastForward size={16} /></B>
        <B label="Collector phone" k="D" onClick={actions.drive}><Smartphone size={16} /></B>
        <B label="Journey" k="V" onClick={actions.verify}><Waypoints size={16} /></B>
        <B label="New room" k="N" onClick={actions.newRoom}><RefreshCw size={16} /></B>
        <B label="Reset" k="R" onClick={actions.reset}><RotateCcw size={16} /></B>
        <B label="Fullscreen" k={'↵'} onClick={actions.fullscreen}><Expand size={16} /></B>
        <B label="Help" k="?" onClick={actions.help}><HelpCircle size={16} /></B>
        <span className="mx-2 text-[.8em] text-[#F4F7EF]/60" aria-label="Real versus simulated households">Real {counts.real} {'·'} Sim {counts.simulated}</span>
      </div>
    </div>
  );
};
