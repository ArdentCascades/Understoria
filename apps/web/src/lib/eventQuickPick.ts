// Quick-pick chips for the event form's Starts row: one tap sets the
// date or the time through the same state the native inputs write.
//
// Why chips and not a default: the start time deliberately begins
// EMPTY (see the todayDateString comment in EventNew.tsx — events are
// signed, append-only, federated records, so a plausible default the
// member never consciously confirmed is a silent-wrong-time risk;
// operator-approved trade-off). A chip threads that needle: the value
// only appears because the member tapped it, but the common cases
// cost one tap instead of a picker round-trip — and on iOS, where an
// empty time input renders as an unlabeled blank pill, the chips are
// the visible affordance the native control fails to be.

export interface QuickDay {
  id: "today" | "tomorrow" | "weekend";
  /** YYYY-MM-DD, in the device's local timezone (what
   *  `<input type="date">` speaks). */
  date: string;
}

export interface QuickTime {
  id: "morning" | "midday" | "evening";
  /** HH:MM, 24h (what `<input type="time">` speaks). */
  time: string;
}

function isoDate(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function addDays(d: Date, days: number): Date {
  const copy = new Date(d.getTime());
  copy.setDate(copy.getDate() + days);
  return copy;
}

/**
 * Today, tomorrow, and the upcoming Saturday — deduplicated: when the
 * Saturday IS today or tomorrow (i.e. it's Friday or Saturday), the
 * weekend chip would repeat an existing chip's date and is dropped.
 */
export function quickDays(now: Date = new Date()): QuickDay[] {
  const today = isoDate(now);
  const tomorrow = isoDate(addDays(now, 1));
  const days: QuickDay[] = [
    { id: "today", date: today },
    { id: "tomorrow", date: tomorrow },
  ];
  const untilSaturday = (6 - now.getDay() + 7) % 7;
  const saturday = isoDate(addDays(now, untilSaturday));
  if (saturday !== today && saturday !== tomorrow) {
    days.push({ id: "weekend", date: saturday });
  }
  return days;
}

/** The three times people actually schedule around. Constant on
 *  purpose — a "smart" list that shifts with the clock would make the
 *  chips unpredictable. */
export function quickTimes(): QuickTime[] {
  return [
    { id: "morning", time: "09:00" },
    { id: "midday", time: "12:00" },
    { id: "evening", time: "18:00" },
  ];
}

/** Locale label for a chip time ("18:00" → "6:00 PM" / "18:00"). */
export function formatQuickTime(time: string, lang: string): string {
  const [h, m] = time.split(":").map(Number);
  const d = new Date(2000, 0, 1, h, m);
  return d.toLocaleTimeString(lang, { hour: "numeric", minute: "2-digit" });
}

/** Locale weekday label for the weekend chip ("sat"/"sáb"). */
export function formatQuickWeekday(date: string, lang: string): string {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(lang, { weekday: "short" });
}
