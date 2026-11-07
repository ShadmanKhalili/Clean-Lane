/**
 * Stand-alone pitch routes (rendered without the app chrome):
 *   ?pitch            presenter big screen (map, QR, live totals)
 *   ?join=ROOM        audience phone: book a pickup, watch it live
 *   ?drive=ROOM       presenter's collector phone: accept, weigh, verify
 *   ?verify=LOT-ID    public "scan the bottle" journey for a lot in the demo data
 *   ?verify=live:ROOM:LV-XXXXXX   journey for a live pitch booking
 */
export type PitchRoute =
  | { kind: 'stage' }
  | { kind: 'join'; room: string }
  | { kind: 'drive'; room: string }
  | { kind: 'verify-lot'; lotId: string }
  | { kind: 'verify-live'; room: string; bookingId: string };

const ROOM_RE = /^[A-HJ-NP-Z2-9]{4}$/;

export const readPitchRoute = (search: string = window.location.search): PitchRoute | null => {
  const p = new URLSearchParams(search);
  if (p.has('pitch')) return { kind: 'stage' };
  const join = p.get('join')?.toUpperCase();
  if (join && ROOM_RE.test(join)) return { kind: 'join', room: join };
  const drive = p.get('drive')?.toUpperCase();
  if (drive && ROOM_RE.test(drive)) return { kind: 'drive', room: drive };
  const verify = p.get('verify');
  if (verify) {
    const m = /^live:([A-HJ-NP-Z2-9]{4}):(LV-[A-HJ-NP-Z2-9]{6})$/i.exec(verify);
    if (m) return { kind: 'verify-live', room: m[1].toUpperCase(), bookingId: m[2].toUpperCase() };
    return { kind: 'verify-lot', lotId: verify };
  }
  return null;
};

const base = () => `${window.location.origin}${window.location.pathname}`;
export const joinUrl = (room: string) => `${base()}?join=${room}`;
export const driveUrl = (room: string) => `${base()}?drive=${room}`;
export const verifyLotUrl = (lotId: string) => `${base()}?verify=${encodeURIComponent(lotId)}`;
export const verifyLiveUrl = (room: string, bookingId: string) => `${base()}?verify=live:${room}:${bookingId}`;
