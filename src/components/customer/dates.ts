/**
 * Local-calendar date helpers for the customer app.
 *
 * Bookings store `scheduledDate` as ISO `YYYY-MM-DD` (local date). Older records
 * could contain the literals 'Today' / 'Tomorrow' / 'Day After Tomorrow', so the
 * parser still understands those.
 */
export const pad2 = (n: number) => String(n).padStart(2, '0');

/** Local-date ISO string (no timezone shift, unlike toISOString()). */
export const toIsoDate = (d: Date): string => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

export const addDays = (d: Date, days: number): Date => {
  const copy = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  copy.setDate(copy.getDate() + days);
  return copy;
};

export const todayIso = (): string => toIsoDate(new Date());

const LEGACY_OFFSETS: Record<string, number> = { today: 0, tomorrow: 1, 'day after tomorrow': 2 };

/** Parses a stored scheduledDate to a local Date at midnight, or null if unreadable. */
export const parseScheduledDate = (value: string | undefined | null, now: Date = new Date()): Date | null => {
  if (!value) return null;
  const trimmed = value.trim();
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(trimmed);
  if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  const legacy = LEGACY_OFFSETS[trimmed.toLowerCase()];
  if (legacy !== undefined) return addDays(now, legacy);
  return null;
};

/** Whole days from today to the scheduled date (negative = in the past); null if unreadable. */
export const daysFromToday = (value: string | undefined | null, now: Date = new Date()): number | null => {
  const d = parseScheduledDate(value, now);
  if (!d) return null;
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((d.getTime() - today.getTime()) / 86_400_000);
};

/** "Sat, 8 Nov" (or the Bangla equivalent). Unreadable values are returned unchanged. */
export const formatBookingDate = (value: string | undefined | null, lang: 'en' | 'bn'): string => {
  const d = parseScheduledDate(value);
  if (!d) return value ?? '';
  try {
    return d.toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
  } catch {
    return toIsoDate(d);
  }
};

/** "Today" / "Tomorrow" / otherwise the formatted date. */
export const relativeDayLabel = (value: string | undefined | null, lang: 'en' | 'bn'): string => {
  const diff = daysFromToday(value);
  if (diff === 0) return lang === 'en' ? 'Today' : 'আজ';
  if (diff === 1) return lang === 'en' ? 'Tomorrow' : 'আগামীকাল';
  return formatBookingDate(value, lang);
};

/** "2 Nov 2026, 3:15 pm" for timestamps (ISO datetime). */
export const formatDateTime = (iso: string | undefined | null, lang: 'en' | 'bn'): string => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  try {
    return d.toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' });
  } catch {
    return iso;
  }
};

export const formatDateOnly = (iso: string | undefined | null, lang: 'en' | 'bn'): string => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  try {
    return d.toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return iso;
  }
};
