/**
 * The demo seed data in `data/mockData.ts` and `services/notificationService.ts`
 * was authored as if "today" were SEED_ANCHOR_DATE. Without adjustment, the
 * "upcoming" pickup shows a date weeks in the past and "(Today)" labels lie.
 *
 * `rebaseSeed` walks any seed structure and shifts every calendar date it finds
 * (both whole-value ISO strings and dates embedded in prose such as
 * "Reminder: Collection tomorrow (2026-10-06)") by the number of days between the
 * anchor and the real current date. Identifiers like `CL-BK-2026-101` or
 * `LOT-2026-095-PET` do not match the YYYY-MM-DD pattern and are left untouched.
 */
export const SEED_ANCHOR_DATE = '2026-10-06';

const DAY_MS = 86_400_000;
const DATE_PATTERN = /\b(\d{4})-(\d{2})-(\d{2})(T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?Z?)?\b/g;

const startOfUtcDay = (d: Date) => Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());

export const seedDayOffset = (now: Date = new Date()): number =>
  Math.round((startOfUtcDay(now) - Date.parse(`${SEED_ANCHOR_DATE}T00:00:00Z`)) / DAY_MS);

const shiftDatesInString = (value: string, offsetDays: number): string =>
  value.replace(DATE_PATTERN, (match, y, m, d, time?: string) => {
    const base = Date.parse(time ? `${y}-${m}-${d}${time.endsWith('Z') ? time : `${time}Z`}` : `${y}-${m}-${d}T00:00:00Z`);
    if (Number.isNaN(base)) return match;
    const shifted = new Date(base + offsetDays * DAY_MS).toISOString();
    if (!time) return shifted.slice(0, 10);
    // Preserve the original precision/format of the time component.
    return shifted.slice(0, 10) + time;
  });

export function rebaseSeed<T>(data: T, offsetDays: number = seedDayOffset()): T {
  if (offsetDays === 0) return data;
  const walk = (value: unknown): unknown => {
    if (typeof value === 'string') return shiftDatesInString(value, offsetDays);
    if (Array.isArray(value)) return value.map(walk);
    if (value && typeof value === 'object') {
      const out: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(value)) out[k] = walk(v);
      return out;
    }
    return value;
  };
  return walk(data) as T;
}
