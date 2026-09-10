import { OPENING_HOURS } from "./clinic";

export const SLOT_MINUTES = 30;

/** Parse "YYYY-MM-DD" without timezone drift. */
export function parseISODate(date: string) {
  const parts = date.split("-").map(Number);
  return { y: parts[0] ?? 1970, m: parts[1] ?? 1, d: parts[2] ?? 1 };
}

/** Day of week (0=Sun) for a calendar date, independent of the runtime timezone. */
export function dayOfWeek(date: string) {
  const { y, m, d } = parseISODate(date);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

export function toMinutes(time: string) {
  const parts = time.split(":").map(Number);
  return (parts[0] ?? 0) * 60 + (parts[1] ?? 0);
}

export function fromMinutes(total: number) {
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** Today's calendar date in the clinic's timezone (Asia/Kolkata). */
export function clinicToday(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

/** Current wall-clock time in the clinic's timezone, as minutes past midnight. */
export function clinicNowMinutes(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(now);
  return toMinutes(parts);
}

export function isClinicOpenOn(date: string) {
  return OPENING_HOURS[dayOfWeek(date)] != null;
}

/**
 * All slot start times the clinic could theoretically offer on a date,
 * before conflicts and blocked slots are applied. Server-authoritative.
 */
export function candidateSlots(date: string, durationMinutes = SLOT_MINUTES) {
  const hours = OPENING_HOURS[dayOfWeek(date)];
  if (!hours) return [];
  const open = toMinutes(hours.open);
  const close = toMinutes(hours.close);
  const slots: string[] = [];
  for (let t = open; t + durationMinutes <= close; t += SLOT_MINUTES) {
    slots.push(fromMinutes(t));
  }
  return slots;
}

export function overlaps(aStart: number, aEnd: number, bStart: number, bEnd: number) {
  return aStart < bEnd && bStart < aEnd;
}

/** Furthest date ahead a visitor may request. */
export const MAX_ADVANCE_DAYS = 90;

export function addDays(date: string, days: number) {
  const { y, m, d } = parseISODate(date);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().slice(0, 10);
}

export function formatLongDate(date: string) {
  const { y, m, d } = parseISODate(date);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-IN", {
    timeZone: "UTC",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
