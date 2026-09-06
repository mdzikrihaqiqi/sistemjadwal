export type DayOfWeek = 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu';

export const DAYS_OF_WEEK: DayOfWeek[] = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export interface AcademicYear {
  id: string;
  tahun: string; // e.g., '2026/2027'
  semester: 'Ganjil' | 'Genap';
  statusAktif: boolean;
}

export interface Subject {
  id: string;
  kode: string;
  nama: string;
  sks: number;
  prodi: string;
  semester: number;
}

export interface Lecturer {
  id: string;
  nidn: string;
  nama: string;
  prodi: string;
  kontak?: string;
  email?: string;
  noHp?: string;
}

export interface Room {
  id: string;
  kode: string;
  nama: string;
  kapasitas: number;
  gedung: string;
  statusAktif: boolean;
  fasilitas?: string[];
}

export interface ClassGroup {
  id: string;
  kode: string;
  nama: string;
  prodi: string;
  semester: number;
  tahunAngkatan: string;
  angkatan?: number;
}

export type AcademicClass = ClassGroup;

export interface TimeSlot {
  id: string;
  label: string; // e.g. "08.00-09.20"
  jamMulai: string; // "08:00"
  jamSelesai: string; // "09:20"
}

export interface Schedule {
  id: string;
  academicYearId: string;
  hari: DayOfWeek;
  jamMulai: string; // "HH:MM"
  jamSelesai: string; // "HH:MM"
  mataKuliahId?: string;
  mataKuliahNama: string;
  sks: number;
  dosenId?: string;
  dosenNama: string;
  ruangId?: string;
  ruangNama: string;
  kelasId?: string;
  kelasNama: string;
  catatan?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ConflictType = 'RUANG' | 'DOSEN' | 'KELAS';

export interface ConflictDetail {
  id: string;
  type: ConflictType;
  typeLabel: 'Bentrok Ruang' | 'Bentrok Dosen' | 'Bentrok Kelas';
  hari: DayOfWeek;
  jam: string;
  entityName: string;
  keterangan: string;
  scheduleA: Schedule;
  scheduleB: Schedule;
}

export type ImportRowStatus = 'VALID' | 'BENTROK' | 'INCOMPLETE' | 'INVALID_TIME';

export interface ImportPreviewRow {
  rowNumber: number;
  rawHari: string;
  rawJam: string;
  rawMataKuliah: string;
  rawSks: string | number;
  rawDosen: string;
  rawRuang: string;
  rawKelas: string;
  hari: DayOfWeek;
  jamMulai: string;
  jamSelesai: string;
  mataKuliahNama: string;
  sks: number;
  dosenNama: string;
  ruangNama: string;
  kelasNama: string;
  status: ImportRowStatus;
  errors: string[];
  conflicts: string[];
}

export type MatrixMode = 'ALL' | 'ROOM' | 'CLASS' | 'LECTURER' | 'SUBJECT';

export interface ScheduleFilterState {
  academicYearId: string;
  hari?: string;
  ruangNama?: string;
  kelasNama?: string;
  dosenNama?: string;
  mataKuliahNama?: string;
  onlyConflicts?: boolean;
  searchQuery?: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

// User & Role-Based Access Control (RBAC)
export type UserRole = 'ADMIN_AKADEMIK' | 'DOSEN' | 'DEKAN' | 'MAHASISWA';

export interface UserAccount {
  id: string;
  username: string;
  password?: string;
  nama: string;
  role: UserRole;
  roleLabel: string;
  email?: string;
  nidnOrNim?: string;
  prodi?: string;
  avatarUrl?: string;
}

// Pengaturan Kop Surat, Logo, dan Pejabat Penandatangan Dokumen Laporan
export interface ReportSettings {
  // Kop Surat
  kementerian: string;
  universitas: string;
  fakultas: string;
  bagian: string;
  alamat: string;
  kontak: string;
  email: string;
  website: string;
  logoUrl: string;

  // Pejabat Penandatangan Laporan
  dekanNama: string;
  dekanNip: string;
  dekanJabatan: string;

  wakilDekan1Nama: string;
  wakilDekan1Nip: string;
  wakilDekan1Jabatan: string;

  bagianAkademikNama: string;
  bagianAkademikNip: string;
  bagianAkademikJabatan: string;

  kotaSurat: string;
  tanggalSuratOtomatis: boolean;
  tanggalSuratKustom?: string;
  tampilkanKopSurat: boolean;
  formatTandaTangan: 'TIGA_KOLOM' | 'DUA_KOLOM' | 'SATU_KOLOM';
}
