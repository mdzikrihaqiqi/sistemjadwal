import { Schedule, ConflictDetail, ConflictType, DayOfWeek } from '../types';
import { detectTimeOverlap, formatTimeRange } from './timeUtils';

/**
 * Normalizes a string for loose comparison (lowercase, trimmed, collapsed whitespace)
 */
function normalizeString(val: string): string {
  if (!val) return '';
  return val.trim().toLowerCase().replace(/\s+/g, ' ');
}

/**
 * A. Bentrok Ruangan:
 * Hari sama + Jam bertabrakan + Ruang sama
 */
export function detectRoomConflict(scheduleA: Schedule, scheduleB: Schedule): boolean {
  if (scheduleA.id === scheduleB.id) return false;
  if (scheduleA.hari !== scheduleB.hari) return false;
  if (!scheduleA.ruangNama || !scheduleB.ruangNama) return false;

  const sameRoom = normalizeString(scheduleA.ruangNama) === normalizeString(scheduleB.ruangNama);
  if (!sameRoom) return false;

  return detectTimeOverlap(
    scheduleA.jamMulai,
    scheduleA.jamSelesai,
    scheduleB.jamMulai,
    scheduleB.jamSelesai
  );
}

/**
 * B. Bentrok Dosen:
 * Hari sama + Jam bertabrakan + Dosen sama
 */
export function detectLecturerConflict(scheduleA: Schedule, scheduleB: Schedule): boolean {
  if (scheduleA.id === scheduleB.id) return false;
  if (scheduleA.hari !== scheduleB.hari) return false;
  if (!scheduleA.dosenNama || !scheduleB.dosenNama) return false;

  const sameLecturer = normalizeString(scheduleA.dosenNama) === normalizeString(scheduleB.dosenNama);
  if (!sameLecturer) return false;

  return detectTimeOverlap(
    scheduleA.jamMulai,
    scheduleA.jamSelesai,
    scheduleB.jamMulai,
    scheduleB.jamSelesai
  );
}

/**
 * C. Bentrok Kelas:
 * Hari sama + Jam bertabrakan + Kelas sama
 */
export function detectClassConflict(scheduleA: Schedule, scheduleB: Schedule): boolean {
  if (scheduleA.id === scheduleB.id) return false;
  if (scheduleA.hari !== scheduleB.hari) return false;
  if (!scheduleA.kelasNama || !scheduleB.kelasNama) return false;

  const sameClass = normalizeString(scheduleA.kelasNama) === normalizeString(scheduleB.kelasNama);
  if (!sameClass) return false;

  return detectTimeOverlap(
    scheduleA.jamMulai,
    scheduleA.jamSelesai,
    scheduleB.jamMulai,
    scheduleB.jamSelesai
  );
}

/**
 * Checks all conflicts between a candidate schedule and a list of existing schedules.
 */
export function checkScheduleConflict(
  candidate: Schedule,
  existingSchedules: Schedule[]
): ConflictDetail[] {
  const conflicts: ConflictDetail[] = [];

  for (const existing of existingSchedules) {
    if (candidate.id && existing.id === candidate.id) continue;
    if (candidate.hari !== existing.hari) continue;

    const timeOverlaps = detectTimeOverlap(
      candidate.jamMulai,
      candidate.jamSelesai,
      existing.jamMulai,
      existing.jamSelesai
    );

    if (!timeOverlaps) continue;

    const timeDisplay = `${formatTimeRange(candidate.jamMulai, candidate.jamSelesai)} & ${formatTimeRange(
      existing.jamMulai,
      existing.jamSelesai
    )}`;

    // 1. Room conflict
    if (
      candidate.ruangNama &&
      existing.ruangNama &&
      normalizeString(candidate.ruangNama) === normalizeString(existing.ruangNama)
    ) {
      conflicts.push({
        id: `conflict-room-${candidate.id || 'new'}-${existing.id}`,
        type: 'RUANG',
        typeLabel: 'Bentrok Ruang',
        hari: candidate.hari,
        jam: timeDisplay,
        entityName: candidate.ruangNama,
        keterangan: `Ruang ${candidate.ruangNama} digunakan bersamaan oleh kelas ${candidate.kelasNama} (${candidate.mataKuliahNama}) dan ${existing.kelasNama} (${existing.mataKuliahNama})`,
        scheduleA: candidate,
        scheduleB: existing,
      });
    }

    // 2. Lecturer conflict
    if (
      candidate.dosenNama &&
      existing.dosenNama &&
      normalizeString(candidate.dosenNama) === normalizeString(existing.dosenNama)
    ) {
      conflicts.push({
        id: `conflict-dosen-${candidate.id || 'new'}-${existing.id}`,
        type: 'DOSEN',
        typeLabel: 'Bentrok Dosen',
        hari: candidate.hari,
        jam: timeDisplay,
        entityName: candidate.dosenNama,
        keterangan: `Dosen ${candidate.dosenNama} mengajar bersamaan di ruang ${candidate.ruangNama} (${candidate.kelasNama}) dan ruang ${existing.ruangNama} (${existing.kelasNama})`,
        scheduleA: candidate,
        scheduleB: existing,
      });
    }

    // 3. Class conflict
    if (
      candidate.kelasNama &&
      existing.kelasNama &&
      normalizeString(candidate.kelasNama) === normalizeString(existing.kelasNama)
    ) {
      conflicts.push({
        id: `conflict-kelas-${candidate.id || 'new'}-${existing.id}`,
        type: 'KELAS',
        typeLabel: 'Bentrok Kelas',
        hari: candidate.hari,
        jam: timeDisplay,
        entityName: candidate.kelasNama,
        keterangan: `Kelas ${candidate.kelasNama} memiliki dua mata kuliah bersamaan: ${candidate.mataKuliahNama} di ${candidate.ruangNama} dan ${existing.mataKuliahNama} di ${existing.ruangNama}`,
        scheduleA: candidate,
        scheduleB: existing,
      });
    }
  }

  return conflicts;
}

/**
 * Finds all conflict pairs in the entire list of schedules.
 */
export function findAllConflicts(schedules: Schedule[]): ConflictDetail[] {
  const conflicts: ConflictDetail[] = [];
  const checkedPairs = new Set<string>();

  for (let i = 0; i < schedules.length; i++) {
    for (let j = i + 1; j < schedules.length; j++) {
      const a = schedules[i];
      const b = schedules[j];

      const pairKey = [a.id, b.id].sort().join('::');
      if (checkedPairs.has(pairKey)) continue;
      checkedPairs.add(pairKey);

      const pairConflicts = checkScheduleConflict(a, [b]);
      conflicts.push(...pairConflicts);
    }
  }

  return conflicts;
}
