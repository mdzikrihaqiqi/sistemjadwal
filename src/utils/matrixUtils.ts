import { Schedule, Room, DayOfWeek, DAYS_OF_WEEK, MatrixMode, TimeSlot } from '../types';
import { detectTimeOverlap, formatTimeRange, timeToMinutes } from './timeUtils';

export interface MatrixCell {
  day: DayOfWeek;
  timeSlot: TimeSlot;
  schedules: Schedule[];
  isEmpty: boolean;
}

export interface MatrixRow {
  timeSlot: TimeSlot;
  cells: Record<DayOfWeek, Schedule[]>;
}

export const DEFAULT_TIME_SLOTS: TimeSlot[] = [
  { id: 'ts-1', label: '08.00-09.20', jamMulai: '08:00', jamSelesai: '09:20' },
  { id: 'ts-2', label: '09.20-10.40', jamMulai: '09:20', jamSelesai: '10:40' },
  { id: 'ts-3', label: '10.40-12.00', jamMulai: '10:40', jamSelesai: '12:00' },
  { id: 'ts-4', label: '13.00-14.20', jamMulai: '13:00', jamSelesai: '14:20' },
  { id: 'ts-5', label: '14.20-15.40', jamMulai: '14:20', jamSelesai: '15:40' },
  { id: 'ts-6', label: '15.40-17.00', jamMulai: '15:40', jamSelesai: '17:00' },
];

/**
 * Extracts and unifies all unique time slots across schedules and default slots, sorted chronologically.
 */
export function getUnifiedTimeSlots(schedules: Schedule[], baseSlots: TimeSlot[] = DEFAULT_TIME_SLOTS): TimeSlot[] {
  const slotMap = new Map<string, TimeSlot>();

  // Add base slots
  for (const slot of baseSlots) {
    const key = `${slot.jamMulai}-${slot.jamSelesai}`;
    slotMap.set(key, slot);
  }

  // Add any custom times appearing in schedules
  for (const sch of schedules) {
    const key = `${sch.jamMulai}-${sch.jamSelesai}`;
    if (!slotMap.has(key)) {
      slotMap.set(key, {
        id: `ts-custom-${key}`,
        label: formatTimeRange(sch.jamMulai, sch.jamSelesai),
        jamMulai: sch.jamMulai,
        jamSelesai: sch.jamSelesai,
      });
    }
  }

  // Sort by starting time in minutes
  return Array.from(slotMap.values()).sort(
    (a, b) => timeToMinutes(a.jamMulai) - timeToMinutes(b.jamMulai)
  );
}

/**
 * Generates matrix rows for a given filtered list of schedules and time slots.
 */
export function generateScheduleMatrix(
  schedules: Schedule[],
  timeSlots: TimeSlot[],
  days: DayOfWeek[] = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
): MatrixRow[] {
  return timeSlots.map((slot) => {
    const cells: Record<DayOfWeek, Schedule[]> = {
      Senin: [],
      Selasa: [],
      Rabu: [],
      Kamis: [],
      Jumat: [],
      Sabtu: [],
    };

    for (const day of days) {
      cells[day] = schedules.filter(
        (s) =>
          s.hari === day &&
          detectTimeOverlap(slot.jamMulai, slot.jamSelesai, s.jamMulai, s.jamSelesai)
      );
    }

    return {
      timeSlot: slot,
      cells,
    };
  });
}

export interface RoomVacancyResult {
  room: Room;
  isAvailable: boolean;
  occupyingSchedules: Schedule[];
}

/**
 * Section 9 & 24: getAvailableRooms()
 * Determines vacancy for all rooms given a day and time range.
 */
export function getAvailableRooms(
  rooms: Room[],
  schedules: Schedule[],
  day: DayOfWeek,
  startTime: string,
  endTime: string
): RoomVacancyResult[] {
  return rooms.map((room) => {
    const occupying = schedules.filter(
      (sch) =>
        sch.hari === day &&
        sch.ruangNama.trim().toLowerCase() === room.nama.trim().toLowerCase() &&
        detectTimeOverlap(startTime, endTime, sch.jamMulai, sch.jamSelesai)
    );

    return {
      room,
      isAvailable: occupying.length === 0,
      occupyingSchedules: occupying,
    };
  });
}
