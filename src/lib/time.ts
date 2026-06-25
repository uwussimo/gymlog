/**
 * Time helpers for the 15-minute sprint grid.
 *
 * The day grid runs across a configurable window. To match the spreadsheet
 * (which starts at 9:30 and wraps past midnight), each "day" is anchored to a
 * local calendar date and we generate slots from a start hour for a number of
 * slots. We work in the browser/server local timezone throughout.
 */

export const SLOT_MINUTES = 15;
export const SLOTS_PER_HOUR = 60 / SLOT_MINUTES;

/** Format a Date as a YYYY-MM-DD key in local time. */
export function dateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Parse a YYYY-MM-DD key into a local midnight Date. */
export function parseDateKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d, 0, 0, 0, 0);
}

/** Local midnight for a given date. */
export function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
}

/** "HH:MM" 24h label for a Date in local time. */
export function timeLabel(d: Date): string {
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

/**
 * Generate the slot start Dates for a given day.
 * @param dayKey   YYYY-MM-DD
 * @param startHour first slot hour (default 6:00)
 * @param slots     number of 15-min slots (default 72 = 18 hours)
 */
export function buildSlots(
  dayKey: string,
  startHour = 6,
  slots = 72,
): Date[] {
  const base = parseDateKey(dayKey);
  base.setHours(startHour, 0, 0, 0);
  const out: Date[] = [];
  for (let i = 0; i < slots; i++) {
    out.push(new Date(base.getTime() + i * SLOT_MINUTES * 60_000));
  }
  return out;
}

/** Human total like "1 hour 15 mins" / "45 mins" from a slot count. */
export function humanDuration(slotCount: number): string {
  const totalMin = slotCount * SLOT_MINUTES;
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  const parts: string[] = [];
  if (h > 0) parts.push(`${h} hour${h > 1 ? "s" : ""}`);
  if (m > 0) parts.push(`${m} min${m > 1 ? "s" : ""}`);
  return parts.join(" ") || "0 mins";
}

export function minutesToHuman(totalMin: number): string {
  const h = Math.floor(totalMin / 60);
  const m = Math.round(totalMin % 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}
