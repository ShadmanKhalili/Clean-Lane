import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DhakaMap } from './DhakaMap';
import { useLiveRoom, useAudienceSimulator, type TransportChoice, type LiveRoom } from '../useLiveRoom';
import { STAGES, newRoomCode, roomTotals, stageIndex, type LiveAction } from '../model';
import { driveUrl, joinUrl, verifyLiveUrl } from '../routes';
import { JoinPanel } from './stage/JoinPanel';
import { LiveNumbers } from './stage/LiveNumbers';
import { LiveFeed } from './stage/LiveFeed';
import { ControlBar } from './stage/ControlBar';
import { Overlays, type OverlayKind } from './stage/Overlays';
import { buildFeed, buildImpact } from './stage/feed';

const ROOM_KEY = 'cleanlane:pitch-room';
const TRANSPORT_KEY = 'cleanlane:pitch-transport';
const ROOM_RE = /^[A-HJ-NP-Z2-9]{4}$/;

/**
 * Dev/test only: `?stageTest=1` makes the audience simulator create NON-simulated
 * bookings (and auto-walks them to "collected"), so the F fast-forward can be
 * exercised end-to-end without a phone.
 */
const STAGE_TEST = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('stageTest');

const readRoom = (): string => {
  try {
    const saved = window.localStorage.getItem(ROOM_KEY);
    if (saved && ROOM_RE.test(saved)) return saved;
  } catch { /* storage blocked */ }
  const fresh = newRoomCode();
  try { window.localStorage.setItem(ROOM_KEY, fresh); } catch { /* ignore */ }
  return fresh;
};
const readChoice = (): TransportChoice => {
  try {
    const v = window.sessionStorage.getItem(TRANSPORT_KEY);
    if (v === 'local' || v === 'firebase') return v;
  } catch { /* ignore */ }
  return 'auto';
};

const STAGE_CSS = `
@keyframes stage-feed-in { from { opacity: 0; transform: translateY(-14px) } to { opacity: 1; transform: none } }
.stage-feed-in { animation: stage-feed-in .5s cubic-bezier(.16,1,.3,1) both; }
@keyframes stage-toast { 0% { opacity: 0; transform: translate(-50%, 8px) } 10%,85% { opacity: 1; transform: translate(-50%, 0) } 100% { opacity: 0 } }
`;

const STAGE_SHORT = { booked: 'Booked', accepted: 'On the way', collected: 'Weighed', verified: 'Verified', dispatched: 'Dispatched', recycled: 'Recycled' } as const;

const FAST_FORWARD: LiveAction[] = [{ type: 'verify' }, { type: 'dispatch' }, { type: 'recycle' }];

export const PitchStage: React.FC = () => {
  const [room, setRoom] = useState(readRoom);
  const [choice, setChoice] = useState<TransportChoice>(readChoice);
  const [simOn, setSimOn] = useState<boolean | null>(null);
  const [overlay, setOverlay] = useState<OverlayKind>(null);
  const [toast, setToast] = useState<{ id: number; text: string } | null>(null);
  const [fullscreen, setFullscreen] = useState(false);

  const live = useLiveRoom(room, choice);
  const simulating = simOn ?? live.transport === 'local';

  // Test mode: simulator-created bookings are real (non-simulated) and walk to "collected" by themselves.
  const simLive = useMemo<LiveRoom>(
    () => (STAGE_TEST ? { ...live, book: (i) => (live.bookings.length >= 14 ? Promise.resolve(live.bookings[0]) : live.book({ ...i, simulated: false })) } : live),
    [live]
  );
  useAudienceSimulator(simLive, simulating, 2200);
  const liveRef = useRef(live);
  liveRef.current = live;
  useEffect(() => {
    if (!STAGE_TEST) return;
    const id = window.setInterval(() => {
      for (const b of liveRef.current.bookings) {
        if (b.simulated) continue;
        if (b.stage === 'booked') void liveRef.current.act(b.id, { type: 'accept', collector: 'Test' });
        else if (b.stage === 'accepted') void liveRef.current.act(b.id, { type: 'collect', weightKg: 3 + (b.id.charCodeAt(4) % 7) });
      }
    }, 1500);
    return () => window.clearInterval(id);
  }, []);

  const say = useCallback((text: string) => setToast({ id: Date.now(), text }), []);
  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(t);
  }, [toast]);

  const { bookings } = live;
  const totals = useMemo(() => roomTotals(bookings), [bookings]);
  const impact = useMemo(() => buildImpact(bookings), [bookings]);
  const feed = useMemo(() => buildFeed(bookings, 7), [bookings]);
  const counts = useMemo(() => {
    const simulated = bookings.filter((b) => b.simulated).length;
    return { real: bookings.length - simulated, simulated };
  }, [bookings]);
  const stageCounts = useMemo(() => STAGES.map((s) => bookings.filter((b) => b.stage === s).length), [bookings]);

  // ---- presenter actions
  const toggleSim = () => { setSimOn(!simulating); say(`Audience simulator ${simulating ? 'off' : 'on'}`); };
  const toggleBackup = () => {
    const next: TransportChoice = live.transport === 'local' ? 'firebase' : 'local';
    setChoice(next);
    try { window.sessionStorage.setItem(TRANSPORT_KEY, next); } catch { /* ignore */ }
    say(next === 'local' ? 'Offline backup on' : 'Switching to live transport (falls back to backup if Firebase is not configured)');
  };
  const fastForward = () => {
    const targets = liveRef.current.bookings.filter((b) => !b.simulated && stageIndex(b.stage) >= stageIndex('collected') && b.stage !== 'recycled');
    if (!targets.length) return say('No real bookings at "collected" or later to fast-forward');
    targets.forEach((b, i) => {
      FAST_FORWARD.slice(Math.max(0, stageIndex(b.stage) - stageIndex('collected'))).forEach((action, j) =>
        window.setTimeout(() => void liveRef.current.act(b.id, action), i * 250 + j * 700)
      );
    });
    say(`Fast-forwarding ${targets.length} journey${targets.length > 1 ? 's' : ''}`);
  };
  const openVerify = () => {
    const latest = [...bookings].filter((b) => stageIndex(b.stage) >= stageIndex('verified')).sort((a, b) => b.updatedAt - a.updatedAt)[0];
    if (!latest) return say('No verified journey yet');
    window.open(verifyLiveUrl(room, latest.id), '_blank', 'noopener');
  };
  const toggleFullscreen = () => {
    try {
      if (document.fullscreenElement) void document.exitFullscreen();
      else void document.documentElement.requestFullscreen();
    } catch { say('Fullscreen unavailable'); }
  };
  const newRoom = () => {
    const code = newRoomCode();
    try { window.localStorage.setItem(ROOM_KEY, code); } catch { /* ignore */ }
    setRoom(code);
    setOverlay(null);
    say(`New room ${code}`);
  };
  const resetRoom = () => { void live.reset(); setOverlay(null); say('Room cleared'); };

  const actions = { sim: toggleSim, backup: toggleBackup, ff: fastForward, drive: () => setOverlay('drive'), verify: openVerify, newRoom: () => setOverlay('confirm-new'), reset: () => setOverlay('confirm-reset'), help: () => setOverlay('help'), fullscreen: toggleFullscreen };
  const actionsRef = useRef(actions);
  actionsRef.current = actions;
  const overlayRef = useRef(overlay);
  overlayRef.current = overlay;

  useEffect(() => {
    const onFs = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFs);
    return () => document.removeEventListener('fullscreenchange', onFs);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const a = actionsRef.current;
      const onButton = (e.target as HTMLElement | null)?.closest?.('button, input, textarea, select');
      if (e.key === 'Escape') return setOverlay(null);
      if (e.key === 'Enter') {
        if (onButton) return; // let the focused control handle it
        e.preventDefault();
        return a.fullscreen();
      }
      if (overlayRef.current && overlayRef.current !== 'help' && e.key === '?') return;
      switch (e.key.toLowerCase()) {
        case 's': return a.sim();
        case 'b': return a.backup();
        case 'f': return a.ff();
        case 'd': return a.drive();
        case 'v': return a.verify();
        case 'n': return a.newRoom();
        case 'r': return a.reset();
        case '?': case '/': return a.help();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const empty = bookings.length === 0;
  const url = joinUrl(room);

  return (
    <main
      className="relative h-screen w-screen overflow-hidden text-[#F4F7EF]"
      style={{ fontSize: 'clamp(14px, 1.75vh, 20px)', background: 'radial-gradient(1200px 900px at 28% 45%, #123126 0%, #0F241D 45%, #0B1A15 100%)' }}
    >
      <style>{STAGE_CSS}</style>
      <div className="grid h-full grid-cols-[3fr_2fr]">
        {/* ---- map */}
        <section className="relative min-w-0" aria-label="Live map of Dhaka">
          <div className="absolute left-[3%] top-[3.5%] z-10">
            <div className="flex items-center gap-[.7em] text-[.8em] font-semibold uppercase tracking-[.22em] text-[#CBEA70]">
              <span className="relative flex h-2.5 w-2.5"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#CBEA70] opacity-70" /><span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#CBEA70]" /></span>
              Clean Lane {'·'} Dhaka, live
            </div>
            <div className="mt-[.5em] font-display text-[1.9em] font-semibold leading-tight">
              {empty ? 'Waiting for the first household…' : `${totals.households} ${totals.households === 1 ? 'household' : 'households'}, one traceable journey each`}
            </div>
          </div>
          <div className="absolute inset-x-[3%] bottom-[11%] top-[13%] flex items-center justify-center">
            <DhakaMap bookings={bookings} idle={empty} className="h-full w-full" />
          </div>
          <ol className="absolute inset-x-[3%] bottom-[3%] z-10 flex items-end justify-between gap-2" aria-label="Journey stages">
            {STAGES.map((s, i) => (
              <li key={s} className="flex min-w-0 flex-1 flex-col border-t border-[#F4F7EF]/20 pt-[.5em]">
                <span className="font-display text-[1.6em] font-semibold leading-none tabular-nums" style={{ color: i >= 2 ? '#CBEA70' : '#F4F7EF' }}>{stageCounts[i]}</span>
                <span className="mt-1 truncate text-[.72em] font-semibold uppercase tracking-[.1em] text-[#F4F7EF]/55">{STAGE_SHORT[s]}</span>
              </li>
            ))}
          </ol>
        </section>

        {/* ---- right column */}
        <aside className="flex min-h-0 min-w-0 flex-col gap-[1.8vh] border-l border-[#F4F7EF]/8 px-[3%] py-[3.5vh]" style={{ background: 'linear-gradient(180deg, rgba(5,13,10,.35), rgba(5,13,10,.1))' }}>
          <JoinPanel room={room} url={url} transport={live.transport} connected={live.connected} />
          <div className="h-px bg-[#F4F7EF]/10" />
          <LiveNumbers totals={totals} impact={impact} />
          <div className="h-px bg-[#F4F7EF]/10" />
          <LiveFeed items={feed} />
        </aside>
      </div>

      {live.error && <div role="alert" className="absolute left-1/2 top-3 z-30 -translate-x-1/2 rounded-full bg-[#F5BF55] px-4 py-1.5 text-[.85em] font-semibold text-[#0B1A15]">{live.error}</div>}
      {toast && (
        <div key={toast.id} role="status" className="pointer-events-none absolute bottom-[9vh] left-1/2 z-40 rounded-full bg-[#F4F7EF] px-5 py-2 text-[.95em] font-semibold text-[#0B1A15]" style={{ animation: 'stage-toast 3.2s both' }}>
          {toast.text}
        </div>
      )}
      <ControlBar simulating={simulating} backup={live.transport === 'local'} counts={counts} actions={actions} />
      <span className="sr-only" aria-live="polite">{fullscreen ? 'Fullscreen' : ''}</span>
      <Overlays kind={overlay} room={room} driveLink={driveUrl(room)} counts={counts} onClose={() => setOverlay(null)} onConfirmNew={newRoom} onConfirmReset={resetRoom} />
    </main>
  );
};

export default PitchStage;
