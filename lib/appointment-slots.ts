// Working-day slot generation shared by both the staff and patient
// portal booking forms, so availability is shown up front instead of
// discovering a conflict only after submitting.

export const SLOT_INTERVAL_MIN = 30;

export interface ScheduleRange {
  dayOfWeek: number; // 0 = Sunday ... 6 = Saturday
  startTime: string; // "HH:MM"
  endTime: string;   // "HH:MM"
}

function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function minutesToTime(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

// Generates slots for a given date based on the doctor's actual working
// hours that day (from DoctorSchedule). Falls back to a default 9-5
// window if the doctor hasn't set up a schedule yet, so booking still
// works before they've configured anything.
export function generateDaySlotsForSchedule(date: string, schedule: ScheduleRange[]): string[] {
  if (!date) return [];
  const dayOfWeek = new Date(`${date}T00:00:00`).getDay();
  const rangesForDay = schedule.filter((r) => r.dayOfWeek === dayOfWeek);

  if (schedule.length === 0) {
    // No schedule configured at all yet -- fall back to a sensible default
    return generateDaySlots(9, 17);
  }
  if (rangesForDay.length === 0) {
    return []; // Doctor has a schedule, but doesn't work this day
  }

  const slots: string[] = [];
  for (const range of rangesForDay) {
    const start = timeToMinutes(range.startTime);
    const end = timeToMinutes(range.endTime);
    for (let t = start; t < end; t += SLOT_INTERVAL_MIN) {
      slots.push(minutesToTime(t));
    }
  }
  return slots.sort();
}

export function generateDaySlots(startHour = 9, endHour = 17): string[] {
  const slots: string[] = [];
  for (let h = startHour; h < endHour; h++) {
    for (let m = 0; m < 60; m += SLOT_INTERVAL_MIN) {
      slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    }
  }
  return slots;
}

export function isSlotInPast(date: string, time: string): boolean {
  if (!date || !time) return false;
  return new Date(`${date}T${time}`).getTime() < Date.now();
}
