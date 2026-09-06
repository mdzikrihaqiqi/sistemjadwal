import * as XLSX from 'xlsx';
import { Schedule, ImportPreviewRow, DayOfWeek, DAYS_OF_WEEK } from '../types';
import { parseTimeString, formatTimeRange } from './timeUtils';
import { checkScheduleConflict } from './conflictDetector';

/**
 * Strips HTML tags, trims extra whitespace, cleans line breaks.
 */
export function cleanCellText(value: any): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  return str
    .replace(/<br\s*[\/]?>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Normalizes day name to standard Indonesian DayOfWeek
 */
export function normalizeDay(dayRaw: string): DayOfWeek | null {
  const cleaned = cleanCellText(dayRaw).toLowerCase();
  if (cleaned.includes('senin') || cleaned === 'sen') return 'Senin';
  if (cleaned.includes('selasa') || cleaned === 'sel') return 'Selasa';
  if (cleaned.includes('rabu') || cleaned === 'rab') return 'Rabu';
  if (cleaned.includes('kamis') || cleaned === 'kam') return 'Kamis';
  if (cleaned.includes('jumat') || cleaned.includes("jum'at") || cleaned === 'jum') return 'Jumat';
  if (cleaned.includes('sabtu') || cleaned === 'sab') return 'Sabtu';
  return null;
}

/**
 * Normalizes lecturer names (removes duplicate spaces, standardizes titles if needed)
 */
export function normalizeLecturerName(name: string): string {
  return cleanCellText(name);
}

/**
 * Normalizes room name
 */
export function normalizeRoomName(room: string): string {
  return cleanCellText(room);
}

/**
 * Normalizes class name
 */
export function normalizeClassName(className: string): string {
  return cleanCellText(className);
}

/**
 * Normalizes SKS to integer
 */
export function normalizeSks(sksRaw: any): number {
  if (typeof sksRaw === 'number') return Math.max(1, Math.min(8, Math.round(sksRaw)));
  const cleaned = cleanCellText(sksRaw);
  const parsed = parseInt(cleaned, 10);
  return isNaN(parsed) || parsed <= 0 ? 2 : Math.min(8, parsed);
}

/**
 * Cleans and structures raw schedule data from Excel
 */
export function normalizeScheduleData(rawRow: Record<string, any>, rowIndex: number): Partial<ImportPreviewRow> {
  // Find fields by loose key matching
  const findValue = (keys: string[]): any => {
    for (const key of Object.keys(rawRow)) {
      const lower = key.toLowerCase().trim();
      if (keys.some((k) => lower === k || lower.includes(k))) {
        return rawRow[key];
      }
    }
    return '';
  };

  const rawHari = cleanCellText(findValue(['hari', 'day']));
  const rawJam = cleanCellText(findValue(['jam', 'waktu', 'time', 'pukul']));
  const rawMataKuliah = cleanCellText(findValue(['mata kuliah', 'matakuliah', 'nama mata kuliah', 'mk']));
  const rawSks = findValue(['sks', 'bobot']);
  const rawDosen = cleanCellText(findValue(['dosen', 'pengajar', 'nama dosen']));
  const rawRuang = cleanCellText(findValue(['ruang', 'ruangan', 'room']));
  const rawKelas = cleanCellText(findValue(['kelas', 'prodi', 'class', 'rombel']));

  const hari = normalizeDay(rawHari) || ('Senin' as DayOfWeek);
  const timeParsed = parseTimeString(rawJam);

  return {
    rowNumber: rowIndex + 1,
    rawHari,
    rawJam,
    rawMataKuliah,
    rawSks,
    rawDosen,
    rawRuang,
    rawKelas,
    hari,
    jamMulai: timeParsed.start,
    jamSelesai: timeParsed.end,
    mataKuliahNama: rawMataKuliah,
    sks: normalizeSks(rawSks),
    dosenNama: normalizeLecturerName(rawDosen),
    ruangNama: normalizeRoomName(rawRuang),
    kelasNama: normalizeClassName(rawKelas),
  };
}

/**
 * Validates each parsed row against data rules & detects conflicts
 */
export function validateSchedule(
  row: Partial<ImportPreviewRow>,
  existingSchedules: Schedule[],
  allRowsSoFar: Schedule[]
): ImportPreviewRow {
  const errors: string[] = [];
  const conflicts: string[] = [];

  // 1. Day validation
  const validDay = normalizeDay(row.rawHari || '');
  if (!validDay) {
    errors.push(`Hari "${row.rawHari}" tidak dikenali (gunakan Senin s/d Sabtu).`);
  }

  // 2. Time format validation
  if (!row.jamMulai || !row.jamSelesai) {
    errors.push(`Format jam "${row.rawJam}" tidak valid (contoh format: 08.00-09.20).`);
  }

  // 3. Incomplete required fields
  if (!row.mataKuliahNama) errors.push('Mata kuliah tidak boleh kosong.');
  if (!row.dosenNama) errors.push('Dosen tidak boleh kosong.');
  if (!row.ruangNama) errors.push('Ruangan tidak boleh kosong.');
  if (!row.kelasNama) errors.push('Kelas tidak boleh kosong.');

  // Form temporary schedule object to test conflicts
  const candidate: Schedule = {
    id: `temp-import-${row.rowNumber}`,
    academicYearId: 'current',
    hari: (validDay || 'Senin') as DayOfWeek,
    jamMulai: row.jamMulai || '08:00',
    jamSelesai: row.jamSelesai || '09:20',
    mataKuliahNama: row.mataKuliahNama || '',
    sks: row.sks || 2,
    dosenNama: row.dosenNama || '',
    ruangNama: row.ruangNama || '',
    kelasNama: row.kelasNama || '',
  };

  // 4. Conflict check against existing saved schedules and earlier valid rows in this import
  if (errors.length === 0) {
    const combinedSchedules = [...existingSchedules, ...allRowsSoFar];
    const detected = checkScheduleConflict(candidate, combinedSchedules);
    if (detected.length > 0) {
      for (const d of detected) {
        conflicts.push(`${d.typeLabel}: ${d.keterangan}`);
      }
    }
  }

  // Determine status
  let status: ImportPreviewRow['status'] = 'VALID';
  if (!row.jamMulai || !row.jamSelesai) {
    status = 'INVALID_TIME';
  } else if (errors.length > 0) {
    status = 'INCOMPLETE';
  } else if (conflicts.length > 0) {
    status = 'BENTROK';
  }

  return {
    rowNumber: row.rowNumber || 1,
    rawHari: row.rawHari || '',
    rawJam: row.rawJam || '',
    rawMataKuliah: row.rawMataKuliah || '',
    rawSks: row.rawSks || 2,
    rawDosen: row.rawDosen || '',
    rawRuang: row.rawRuang || '',
    rawKelas: row.rawKelas || '',
    hari: (validDay || 'Senin') as DayOfWeek,
    jamMulai: row.jamMulai || '',
    jamSelesai: row.jamSelesai || '',
    mataKuliahNama: row.mataKuliahNama || '',
    sks: row.sks || 2,
    dosenNama: row.dosenNama || '',
    ruangNama: row.ruangNama || '',
    kelasNama: row.kelasNama || '',
    status,
    errors,
    conflicts,
  };
}

/**
 * Parses an Excel or CSV file into validated ImportPreviewRow array
 */
export async function parseExcelSchedule(
  file: File,
  existingSchedules: Schedule[]
): Promise<ImportPreviewRow[]> {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, { type: 'array' });

  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];

  // Convert to JSON array of objects
  const rawRows: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, {
    defval: '',
    raw: false,
  });

  const previewRows: ImportPreviewRow[] = [];
  const validBatchSchedules: Schedule[] = [];

  rawRows.forEach((row, idx) => {
    // Skip completely empty rows
    const hasData = Object.values(row).some((val) => cleanCellText(val).length > 0);
    if (!hasData) return;

    const normalized = normalizeScheduleData(row, idx);
    const validated = validateSchedule(normalized, existingSchedules, validBatchSchedules);
    previewRows.push(validated);

    if (validated.status === 'VALID') {
      validBatchSchedules.push({
        id: `import-row-${validated.rowNumber}`,
        academicYearId: 'current',
        hari: validated.hari,
        jamMulai: validated.jamMulai,
        jamSelesai: validated.jamSelesai,
        mataKuliahNama: validated.mataKuliahNama,
        sks: validated.sks,
        dosenNama: validated.dosenNama,
        ruangNama: validated.ruangNama,
        kelasNama: validated.kelasNama,
      });
    }
  });

  return previewRows;
}

/**
 * Exports a list of schedules to an Excel file with formatted headers
 */
export function exportScheduleToExcel(schedules: Schedule[], filename = 'Jadwal_Perkuliahan.xlsx'): void {
  const rows = schedules.map((item, index) => ({
    No: index + 1,
    Hari: item.hari,
    Jam: formatTimeRange(item.jamMulai, item.jamSelesai),
    'Nama Mata Kuliah': item.mataKuliahNama,
    SKS: item.sks,
    Dosen: item.dosenNama,
    Ruang: item.ruangNama,
    Kelas: item.kelasNama,
    'Jam Mulai': item.jamMulai,
    'Jam Selesai': item.jamSelesai,
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);

  // Set column widths
  worksheet['!cols'] = [
    { wch: 6 },  // No
    { wch: 10 }, // Hari
    { wch: 16 }, // Jam
    { wch: 30 }, // Mata Kuliah
    { wch: 6 },  // SKS
    { wch: 32 }, // Dosen
    { wch: 12 }, // Ruang
    { wch: 14 }, // Kelas
    { wch: 12 }, // Jam Mulai
    { wch: 12 }, // Jam Selesai
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Jadwal Perkuliahan');
  XLSX.writeFile(workbook, filename);
}

/**
 * Generates and downloads a sample Excel template with columns specified in Section 3
 */
export function downloadSampleExcelTemplate(): void {
  const sampleData = [
    {
      Hari: 'Senin',
      Jam: '08.00-09.20',
      'Nama Mata Kuliah': 'Akhlak dan Tasawuf',
      SKS: 2,
      Dosen: 'Deviana, M.Ag',
      Ruang: 'B1',
      Kelas: 'I MBS',
    },
    {
      Hari: 'Senin',
      Jam: '09.20-10.40',
      'Nama Mata Kuliah': 'Fiqh dan Ushul Fiqh',
      SKS: 2,
      Dosen: 'Dr. H. Dading Z Ibrahim, M.M.Pd',
      Ruang: 'B1',
      Kelas: 'I MBS',
    },
    {
      Hari: 'Senin',
      Jam: '10.40-12.00',
      'Nama Mata Kuliah': 'Dasar-Dasar Manajemen',
      SKS: 2,
      Dosen: 'Dadang Yudih, S.H., M.H',
      Ruang: 'B1',
      Kelas: 'I MBS',
    },
    {
      Hari: 'Senin',
      Jam: '13.00-14.20',
      'Nama Mata Kuliah': 'Bahasa Indonesia',
      SKS: 2,
      Dosen: 'Hj. Reni Hermayati, S.Pd., M.Si',
      Ruang: 'B1',
      Kelas: 'I MBS',
    },
    {
      Hari: 'Selasa',
      Jam: '08.00-09.20',
      'Nama Mata Kuliah': 'Praktek Tilawah',
      SKS: 2,
      Dosen: 'Cep Wildan, S.E., M.M',
      Ruang: 'Aula II',
      Kelas: 'I MBS',
    },
    {
      Hari: 'Selasa',
      Jam: '09.20-10.40',
      'Nama Mata Kuliah': 'Bahasa Arab I',
      SKS: 2,
      Dosen: 'Deviana, M.Ag',
      Ruang: 'Aula II',
      Kelas: 'I MBS',
    },
    {
      Hari: 'Selasa',
      Jam: '10.40-12.00',
      'Nama Mata Kuliah': "Ulumul Qur'an",
      SKS: 2,
      Dosen: 'Drs. H. Danial M Noer, M.Pd',
      Ruang: 'Aula II',
      Kelas: 'I MBS',
    },
  ];

  const ws = XLSX.utils.json_to_sheet(sampleData);
  ws['!cols'] = [
    { wch: 10 },
    { wch: 16 },
    { wch: 28 },
    { wch: 6 },
    { wch: 32 },
    { wch: 12 },
    { wch: 12 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Template Jadwal');
  XLSX.writeFile(wb, 'Template_Jadwal_Perkuliahan.xlsx');
}
