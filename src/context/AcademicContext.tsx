import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  Schedule,
  AcademicYear,
  Subject,
  Lecturer,
  Room,
  ClassGroup,
  TimeSlot,
  ConflictDetail,
  ToastMessage,
  DayOfWeek,
  ReportSettings,
} from '../types';
import {
  INITIAL_ACADEMIC_YEARS,
  INITIAL_ROOMS,
  INITIAL_LECTURERS,
  INITIAL_SUBJECTS,
  INITIAL_CLASSES,
  INITIAL_TIME_SLOTS,
  INITIAL_SCHEDULES,
  SAMPLE_DEMO_SCHEDULES,
  INITIAL_REPORT_SETTINGS,
} from '../data/initialData';
import { findAllConflicts, checkScheduleConflict } from '../utils/conflictDetector';
import {
  saveScheduleToFirestore,
  deleteScheduleFromFirestore,
  batchSaveSchedulesToFirestore,
  clearAllSchedulesFromFirestore,
  subscribeToSchedules,
  saveMasterCollection,
  fetchMasterCollection,
  saveSettingsToFirestore,
  fetchSettingsFromFirestore,
} from '../services/firestoreSync';

interface AcademicContextType {
  // Cloud Database Sync
  isCloudConnected: boolean;
  isCloudSyncing: boolean;
  syncLocalToCloud: () => Promise<void>;
  fetchFromCloud: () => Promise<void>;
  exportBackupJson: () => void;
  importBackupJson: (jsonString: string) => Promise<boolean>;

  // Data lists
  schedules: Schedule[];
  yearSchedules: Schedule[];
  filteredSchedules: Schedule[];
  academicYears: AcademicYear[];
  activeAcademicYear: AcademicYear | undefined;
  activeAcademicYearId: string;
  subjects: Subject[];
  lecturers: Lecturer[];
  rooms: Room[];
  classes: ClassGroup[];
  timeSlots: TimeSlot[];
  conflicts: ConflictDetail[];
  toasts: ToastMessage[];

  // Pengaturan Kop Surat & Laporan
  reportSettings: ReportSettings;
  updateReportSettings: (partial: Partial<ReportSettings>) => void;

  // Global search & filters
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedHari: string;
  setSelectedHari: (hari: string) => void;
  selectedRuang: string;
  setSelectedRuang: (ruang: string) => void;
  selectedKelas: string;
  setSelectedKelas: (kelas: string) => void;
  selectedDosen: string;
  setSelectedDosen: (dosen: string) => void;
  selectedMataKuliah: string;
  setSelectedMataKuliah: (mk: string) => void;
  filterOnlyConflicts: boolean;
  setFilterOnlyConflicts: (val: boolean) => void;
  resetFilters: () => void;

  // Actions
  setActiveAcademicYearId: (id: string) => void;
  addSchedule: (newSch: Omit<Schedule, 'id'>, force?: boolean) => { success: boolean; conflicts: ConflictDetail[]; scheduleId?: string };
  updateSchedule: (updated: Schedule, force?: boolean) => { success: boolean; conflicts: ConflictDetail[] };
  deleteSchedule: (id: string) => void;
  duplicateSchedule: (id: string) => Schedule | null;
  moveSchedule: (id: string, newHari: DayOfWeek, newJamMulai: string, newJamSelesai: string, force?: boolean) => { success: boolean; conflicts: ConflictDetail[] };
  importBatchSchedules: (items: Omit<Schedule, 'id'>[]) => number;
  resetToDefaultData: () => void;
  resetToDemoData: () => void;
  loadDemoData: () => void;
  clearAllSchedules: () => void;

  // Master CRUD
  addSubject: (item: Omit<Subject, 'id'>) => void;
  updateSubject: (item: Subject) => void;
  deleteSubject: (id: string) => void;

  addLecturer: (item: Omit<Lecturer, 'id'>) => void;
  updateLecturer: (item: Lecturer) => void;
  deleteLecturer: (id: string) => void;

  addRoom: (item: Omit<Room, 'id'>) => void;
  updateRoom: (item: Room) => void;
  deleteRoom: (id: string) => void;

  addClassGroup: (item: Omit<ClassGroup, 'id'>) => void;
  updateClassGroup: (item: ClassGroup) => void;
  deleteClassGroup: (id: string) => void;
  addClass: (item: Omit<ClassGroup, 'id'>) => void;
  updateClass: (item: ClassGroup) => void;
  deleteClass: (id: string) => void;

  addTimeSlot: (item: Omit<TimeSlot, 'id'>) => void;
  updateTimeSlot: (item: TimeSlot) => void;
  deleteTimeSlot: (id: string) => void;
  updateTimeSlots: (slots: TimeSlot[]) => void;

  addAcademicYear: (item: Omit<AcademicYear, 'id'>) => void;

  // Toast
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
}

const AcademicContext = createContext<AcademicContextType | undefined>(undefined);

const STORAGE_KEYS = {
  SCHEDULES: 'simatrik_schedules_v2',
  YEARS: 'simatrik_academic_years_v1',
  ACTIVE_YEAR: 'simatrik_active_year_v1',
  SUBJECTS: 'simatrik_subjects_v1',
  LECTURERS: 'simatrik_lecturers_v1',
  ROOMS: 'simatrik_rooms_v1',
  CLASSES: 'simatrik_classes_v1',
  TIMESLOTS: 'simatrik_timeslots_v1',
  REPORT_SETTINGS: 'simatrik_report_settings_v1',
};

function loadStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

export const AcademicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [schedules, setSchedules] = useState<Schedule[]>(() =>
    loadStorage(STORAGE_KEYS.SCHEDULES, INITIAL_SCHEDULES)
  );
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>(() =>
    loadStorage(STORAGE_KEYS.YEARS, INITIAL_ACADEMIC_YEARS)
  );
  const [activeAcademicYearId, setActiveAcademicYearIdState] = useState<string>(() =>
    loadStorage(STORAGE_KEYS.ACTIVE_YEAR, INITIAL_ACADEMIC_YEARS[0]?.id || 'ay-2026-ganjil')
  );
  const [subjects, setSubjects] = useState<Subject[]>(() =>
    loadStorage(STORAGE_KEYS.SUBJECTS, INITIAL_SUBJECTS)
  );
  const [lecturers, setLecturers] = useState<Lecturer[]>(() =>
    loadStorage(STORAGE_KEYS.LECTURERS, INITIAL_LECTURERS)
  );
  const [rooms, setRooms] = useState<Room[]>(() =>
    loadStorage(STORAGE_KEYS.ROOMS, INITIAL_ROOMS)
  );
  const [classes, setClasses] = useState<ClassGroup[]>(() =>
    loadStorage(STORAGE_KEYS.CLASSES, INITIAL_CLASSES)
  );
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>(() =>
    loadStorage(STORAGE_KEYS.TIMESLOTS, INITIAL_TIME_SLOTS)
  );
  const [reportSettings, setReportSettings] = useState<ReportSettings>(() =>
    loadStorage(STORAGE_KEYS.REPORT_SETTINGS, INITIAL_REPORT_SETTINGS)
  );

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isCloudConnected, setIsCloudConnected] = useState<boolean>(true);
  const [isCloudSyncing, setIsCloudSyncing] = useState<boolean>(false);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHari, setSelectedHari] = useState('');
  const [selectedRuang, setSelectedRuang] = useState('');
  const [selectedKelas, setSelectedKelas] = useState('');
  const [selectedDosen, setSelectedDosen] = useState('');
  const [selectedMataKuliah, setSelectedMataKuliah] = useState('');
  const [filterOnlyConflicts, setFilterOnlyConflicts] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(schedules));
  }, [schedules]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.YEARS, JSON.stringify(academicYears));
  }, [academicYears]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_YEAR, JSON.stringify(activeAcademicYearId));
  }, [activeAcademicYearId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subjects));
  }, [subjects]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LECTURERS, JSON.stringify(lecturers));
  }, [lecturers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(rooms));
  }, [rooms]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(classes));
  }, [classes]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TIMESLOTS, JSON.stringify(timeSlots));
  }, [timeSlots]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REPORT_SETTINGS, JSON.stringify(reportSettings));
  }, [reportSettings]);

  const updateReportSettings = useCallback((partial: Partial<ReportSettings>) => {
    setReportSettings((prev) => {
      const updated = { ...prev, ...partial };
      saveSettingsToFirestore(updated).catch(() => {});
      return updated;
    });
  }, []);

  // Toast Helpers
  const addToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const newToast: ToastMessage = { ...toast, id, duration: toast.duration || 4000 };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((current) => current.filter((t) => t.id !== id));
    }, newToast.duration);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Cloud Database Sync Methods
  const syncLocalToCloud = useCallback(async () => {
    setIsCloudSyncing(true);
    try {
      if (schedules.length > 0) {
        await batchSaveSchedulesToFirestore(schedules);
      }
      await saveMasterCollection('subjects', subjects);
      await saveMasterCollection('lecturers', lecturers);
      await saveMasterCollection('rooms', rooms);
      await saveMasterCollection('classes', classes);
      await saveMasterCollection('time_slots', timeSlots);
      await saveMasterCollection('academic_years', academicYears);
      await saveSettingsToFirestore(reportSettings);
      setIsCloudConnected(true);
      addToast({
        type: 'success',
        title: 'Sinkronisasi Cloud Berhasil',
        message: `${schedules.length} jadwal dan data master berhasil disimpan di server online. Sekarang dapat dibuka di HP.`,
      });
    } catch (err) {
      console.error(err);
      addToast({
        type: 'error',
        title: 'Gagal Sinkronisasi Cloud',
        message: 'Tidak dapat mengunggah ke database online. Periksa koneksi internet.',
      });
    } finally {
      setIsCloudSyncing(false);
    }
  }, [schedules, subjects, lecturers, rooms, classes, timeSlots, academicYears, reportSettings, addToast]);

  const fetchFromCloud = useCallback(async () => {
    setIsCloudSyncing(true);
    try {
      const [cloudSubjects, cloudLecturers, cloudRooms, cloudClasses, cloudSlots, cloudYears, cloudSettings] =
        await Promise.all([
          fetchMasterCollection<Subject>('subjects'),
          fetchMasterCollection<Lecturer>('lecturers'),
          fetchMasterCollection<Room>('rooms'),
          fetchMasterCollection<ClassGroup>('classes'),
          fetchMasterCollection<TimeSlot>('time_slots'),
          fetchMasterCollection<AcademicYear>('academic_years'),
          fetchSettingsFromFirestore(),
        ]);

      if (cloudSubjects.length > 0) setSubjects(cloudSubjects);
      if (cloudLecturers.length > 0) setLecturers(cloudLecturers);
      if (cloudRooms.length > 0) setRooms(cloudRooms);
      if (cloudClasses.length > 0) setClasses(cloudClasses);
      if (cloudSlots.length > 0) setTimeSlots(cloudSlots);
      if (cloudYears.length > 0) setAcademicYears(cloudYears);
      if (cloudSettings) setReportSettings(cloudSettings);

      setIsCloudConnected(true);
      addToast({
        type: 'success',
        title: 'Data Cloud Dimuat',
        message: 'Data master dan pengaturan berhasil dimuat dari database online.',
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsCloudSyncing(false);
    }
  }, [addToast]);

  const exportBackupJson = useCallback(() => {
    const backupData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      activeAcademicYearId,
      schedules,
      academicYears,
      subjects,
      lecturers,
      rooms,
      classes,
      timeSlots,
      reportSettings,
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup_simatrik_febi_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    addToast({
      type: 'success',
      title: 'Cadangan Diunduh',
      message: 'File cadangan JSON berhasil diunduh. Anda dapat memulihkannya kapan saja di HP maupun PC.',
    });
  }, [activeAcademicYearId, schedules, academicYears, subjects, lecturers, rooms, classes, timeSlots, reportSettings, addToast]);

  const importBackupJson = useCallback(
    async (jsonString: string): Promise<boolean> => {
      try {
        const parsed = JSON.parse(jsonString);
        if (!parsed || !Array.isArray(parsed.schedules)) {
          throw new Error('Format file cadangan tidak valid.');
        }

        setSchedules(parsed.schedules);
        if (Array.isArray(parsed.academicYears)) setAcademicYears(parsed.academicYears);
        if (parsed.activeAcademicYearId) setActiveAcademicYearIdState(parsed.activeAcademicYearId);
        if (Array.isArray(parsed.subjects)) setSubjects(parsed.subjects);
        if (Array.isArray(parsed.lecturers)) setLecturers(parsed.lecturers);
        if (Array.isArray(parsed.rooms)) setRooms(parsed.rooms);
        if (Array.isArray(parsed.classes)) setClasses(parsed.classes);
        if (Array.isArray(parsed.timeSlots)) setTimeSlots(parsed.timeSlots);
        if (parsed.reportSettings) setReportSettings(parsed.reportSettings);

        // Auto sync to cloud
        try {
          await batchSaveSchedulesToFirestore(parsed.schedules);
        } catch {
          // ignore
        }

        addToast({
          type: 'success',
          title: 'Pemulihan Berhasil',
          message: `${parsed.schedules.length} jadwal dan seluruh data master berhasil dipulihkan.`,
        });
        return true;
      } catch (err) {
        addToast({
          type: 'error',
          title: 'Gagal Memulihkan Cadangan',
          message: err instanceof Error ? err.message : 'File tidak valid.',
        });
        return false;
      }
    },
    [addToast]
  );

  // Firestore Realtime Listener for Schedules
  useEffect(() => {
    let isInitial = true;
    const unsub = subscribeToSchedules(
      (cloudSchedules) => {
        setIsCloudConnected(true);
        if (cloudSchedules.length > 0) {
          setSchedules(cloudSchedules);
        } else if (isInitial) {
          // If cloud is empty but local has custom schedules, auto-sync to cloud!
          const localSchedules = loadStorage<Schedule[]>(STORAGE_KEYS.SCHEDULES, []);
          if (localSchedules.length > 0) {
            batchSaveSchedulesToFirestore(localSchedules).catch(() => {});
          }
        }
        isInitial = false;
      },
      () => {
        setIsCloudConnected(false);
      }
    );

    // Also fetch initial master data from cloud
    Promise.all([
      fetchMasterCollection<Subject>('subjects'),
      fetchMasterCollection<Lecturer>('lecturers'),
      fetchMasterCollection<Room>('rooms'),
      fetchMasterCollection<ClassGroup>('classes'),
      fetchMasterCollection<TimeSlot>('time_slots'),
      fetchMasterCollection<AcademicYear>('academic_years'),
      fetchSettingsFromFirestore(),
    ])
      .then(([mSubjects, mLecturers, mRooms, mClasses, mSlots, mYears, mSettings]) => {
        if (mSubjects.length > 0) setSubjects(mSubjects);
        if (mLecturers.length > 0) setLecturers(mLecturers);
        if (mRooms.length > 0) setRooms(mRooms);
        if (mClasses.length > 0) setClasses(mClasses);
        if (mSlots.length > 0) setTimeSlots(mSlots);
        if (mYears.length > 0) setAcademicYears(mYears);
        if (mSettings) setReportSettings(mSettings);
      })
      .catch(() => {});

    return () => {
      unsub();
    };
  }, []);

  const activeAcademicYear = useMemo(
    () => academicYears.find((y) => y.id === activeAcademicYearId) || academicYears[0],
    [academicYears, activeAcademicYearId]
  );

  const setActiveAcademicYearId = (id: string) => {
    setActiveAcademicYearIdState(id);
    setAcademicYears((prev) =>
      prev.map((y) => ({
        ...y,
        statusAktif: y.id === id,
      }))
    );
  };

  // Schedules strictly scoped to active academic year
  const yearSchedules = useMemo(() => {
    return schedules.filter(
      (s) => s.academicYearId === activeAcademicYearId || (!s.academicYearId && activeAcademicYearId === 'ay-2026-ganjil')
    );
  }, [schedules, activeAcademicYearId]);

  // Compute all conflicts within current active academic year
  const conflicts = useMemo(() => {
    return findAllConflicts(yearSchedules);
  }, [yearSchedules]);

  // Conflicted schedule IDs set
  const conflictScheduleIds = useMemo(() => {
    const ids = new Set<string>();
    for (const c of conflicts) {
      if (c.scheduleA?.id) ids.add(c.scheduleA.id);
      if (c.scheduleB?.id) ids.add(c.scheduleB.id);
    }
    return ids;
  }, [conflicts]);

  // Filtered schedules for views
  const filteredSchedules = useMemo(() => {
    return yearSchedules.filter((sch) => {
      // 1. Global search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesQuery =
          sch.mataKuliahNama.toLowerCase().includes(query) ||
          sch.dosenNama.toLowerCase().includes(query) ||
          sch.ruangNama.toLowerCase().includes(query) ||
          sch.kelasNama.toLowerCase().includes(query) ||
          sch.hari.toLowerCase().includes(query);
        if (!matchesQuery) return false;
      }

      // 2. Faceted filters
      if (selectedHari && sch.hari !== selectedHari) return false;
      if (selectedRuang && sch.ruangNama.toLowerCase() !== selectedRuang.toLowerCase()) return false;
      if (selectedKelas && sch.kelasNama.toLowerCase() !== selectedKelas.toLowerCase()) return false;
      if (selectedDosen && sch.dosenNama.toLowerCase() !== selectedDosen.toLowerCase()) return false;
      if (selectedMataKuliah && sch.mataKuliahNama.toLowerCase() !== selectedMataKuliah.toLowerCase()) return false;

      // 3. Conflict only filter
      if (filterOnlyConflicts && !conflictScheduleIds.has(sch.id)) return false;

      return true;
    });
  }, [
    yearSchedules,
    searchQuery,
    selectedHari,
    selectedRuang,
    selectedKelas,
    selectedDosen,
    selectedMataKuliah,
    filterOnlyConflicts,
    conflictScheduleIds,
  ]);

  const resetFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedHari('');
    setSelectedRuang('');
    setSelectedKelas('');
    setSelectedDosen('');
    setSelectedMataKuliah('');
    setFilterOnlyConflicts(false);
  }, []);

  // CRUD Schedules
  const addSchedule = useCallback(
    (newSch: Omit<Schedule, 'id'>, force = false) => {
      const scheduleId = `sch-${Date.now()}`;
      const scheduleWithId: Schedule = {
        ...newSch,
        id: scheduleId,
        academicYearId: newSch.academicYearId || activeAcademicYearId,
        createdAt: new Date().toISOString(),
      };

      const existingForYear = schedules.filter(
        (s) => !s.academicYearId || s.academicYearId === scheduleWithId.academicYearId
      );

      const detectedConflicts = checkScheduleConflict(scheduleWithId, existingForYear);

      if (detectedConflicts.length > 0 && !force) {
        return { success: false, conflicts: detectedConflicts, scheduleId };
      }

      setSchedules((prev) => [scheduleWithId, ...prev]);
      saveScheduleToFirestore(scheduleWithId).catch(() => {});

      // Auto-register Master items if they don't exist yet
      if (scheduleWithId.ruangNama && !rooms.some((r) => r.nama.toLowerCase() === scheduleWithId.ruangNama.toLowerCase())) {
        setRooms((prev) => [
          ...prev,
          {
            id: `rm-${Date.now()}`,
            kode: scheduleWithId.ruangNama.toUpperCase(),
            nama: scheduleWithId.ruangNama,
            kapasitas: 40,
            gedung: 'Gedung Akademik',
            statusAktif: true,
          },
        ]);
      }

      if (scheduleWithId.dosenNama && !lecturers.some((l) => l.nama.toLowerCase() === scheduleWithId.dosenNama.toLowerCase())) {
        setLecturers((prev) => [
          ...prev,
          {
            id: `lec-${Date.now()}`,
            nidn: `04${Math.floor(10000000 + Math.random() * 90000000)}`,
            nama: scheduleWithId.dosenNama,
            prodi: 'Akademik',
          },
        ]);
      }

      if (scheduleWithId.kelasNama && !classes.some((c) => c.nama.toLowerCase() === scheduleWithId.kelasNama.toLowerCase())) {
        setClasses((prev) => [
          ...prev,
          {
            id: `cls-${Date.now()}`,
            kode: scheduleWithId.kelasNama.replace(/\s+/g, '-').toUpperCase(),
            nama: scheduleWithId.kelasNama,
            prodi: 'Akademik',
            semester: 1,
            tahunAngkatan: new Date().getFullYear().toString(),
          },
        ]);
      }

      if (scheduleWithId.mataKuliahNama && !subjects.some((s) => s.nama.toLowerCase() === scheduleWithId.mataKuliahNama.toLowerCase())) {
        setSubjects((prev) => [
          ...prev,
          {
            id: `sb-${Date.now()}`,
            kode: `MK${Math.floor(100 + Math.random() * 900)}`,
            nama: scheduleWithId.mataKuliahNama,
            sks: scheduleWithId.sks || 2,
            prodi: 'Akademik',
            semester: 1,
          },
        ]);
      }

      addToast({
        type: 'success',
        title: 'Jadwal Ditambahkan',
        message: `${scheduleWithId.mataKuliahNama} (${scheduleWithId.kelasNama}) berhasil disimpan.`,
      });

      return { success: true, conflicts: detectedConflicts, scheduleId };
    },
    [schedules, activeAcademicYearId, rooms, lecturers, classes, subjects, addToast]
  );

  const updateSchedule = useCallback(
    (updated: Schedule, force = false) => {
      const existingForYear = schedules.filter(
        (s) => s.id !== updated.id && (!s.academicYearId || s.academicYearId === updated.academicYearId)
      );

      const detectedConflicts = checkScheduleConflict(updated, existingForYear);

      if (detectedConflicts.length > 0 && !force) {
        return { success: false, conflicts: detectedConflicts };
      }

      const updatedWithTimestamp = { ...updated, updatedAt: new Date().toISOString() };
      setSchedules((prev) =>
        prev.map((item) => (item.id === updated.id ? updatedWithTimestamp : item))
      );
      saveScheduleToFirestore(updatedWithTimestamp).catch(() => {});

      addToast({
        type: 'success',
        title: 'Jadwal Diperbarui',
        message: `${updated.mataKuliahNama} berhasil disimpan.`,
      });

      return { success: true, conflicts: detectedConflicts };
    },
    [schedules, addToast]
  );

  const deleteSchedule = useCallback(
    (id: string) => {
      const sch = schedules.find((s) => s.id === id);
      setSchedules((prev) => prev.filter((s) => s.id !== id));
      deleteScheduleFromFirestore(id).catch(() => {});
      addToast({
        type: 'info',
        title: 'Jadwal Dihapus',
        message: sch ? `${sch.mataKuliahNama} (${sch.kelasNama}) telah dihapus.` : 'Jadwal telah dihapus.',
      });
    },
    [schedules, addToast]
  );

  const duplicateSchedule = useCallback(
    (id: string): Schedule | null => {
      const original = schedules.find((s) => s.id === id);
      if (!original) return null;

      const duplicated: Schedule = {
        ...original,
        id: `sch-${Date.now()}`,
        catatan: original.catatan ? `${original.catatan} (Salinan)` : 'Salinan Jadwal',
        createdAt: new Date().toISOString(),
      };

      setSchedules((prev) => [duplicated, ...prev]);
      saveScheduleToFirestore(duplicated).catch(() => {});
      addToast({
        type: 'success',
        title: 'Jadwal Diduplikasi',
        message: `Salinan dari ${original.mataKuliahNama} dibuat.`,
      });

      return duplicated;
    },
    [schedules, addToast]
  );

  const moveSchedule = useCallback(
    (id: string, newHari: DayOfWeek, newJamMulai: string, newJamSelesai: string, force = false) => {
      const existing = schedules.find((s) => s.id === id);
      if (!existing) {
        return { success: false, conflicts: [] };
      }

      const updated: Schedule = {
        ...existing,
        hari: newHari,
        jamMulai: newJamMulai,
        jamSelesai: newJamSelesai,
        updatedAt: new Date().toISOString(),
      };

      const others = schedules.filter(
        (s) => s.id !== id && (!s.academicYearId || s.academicYearId === updated.academicYearId)
      );

      const conflictsDetected = checkScheduleConflict(updated, others);

      if (conflictsDetected.length > 0 && !force) {
        addToast({
          type: 'error',
          title: 'Tidak Dapat Dipindahkan',
          message: `Terjadi bentrok (${conflictsDetected[0].typeLabel}) saat dipindahkan ke ${newHari} ${newJamMulai}-${newJamSelesai}.`,
        });
        return { success: false, conflicts: conflictsDetected };
      }

      setSchedules((prev) => prev.map((s) => (s.id === id ? updated : s)));
      saveScheduleToFirestore(updated).catch(() => {});
      addToast({
        type: 'success',
        title: 'Jadwal Berhasil Dipindahkan',
        message: `${updated.mataKuliahNama} dipindahkan ke ${newHari} ${newJamMulai}-${newJamSelesai}.`,
      });

      return { success: true, conflicts: conflictsDetected };
    },
    [schedules, addToast]
  );

  const importBatchSchedules = useCallback(
    (items: Omit<Schedule, 'id'>[]): number => {
      const newItems: Schedule[] = items.map((item, idx) => ({
        ...item,
        id: `sch-imp-${Date.now()}-${idx}`,
        academicYearId: item.academicYearId || activeAcademicYearId,
        createdAt: new Date().toISOString(),
      }));

      setSchedules((prev) => {
        const combined = [...newItems, ...prev];
        batchSaveSchedulesToFirestore(combined).catch((err) => {
          console.error('Failed to sync batch to Firestore:', err);
        });
        return combined;
      });

      // Auto add new Master rooms, lecturers, classes, subjects
      const newRooms = [...rooms];
      const newLecturers = [...lecturers];
      const newClasses = [...classes];
      const newSubjects = [...subjects];

      for (const it of newItems) {
        if (it.ruangNama && !newRooms.some((r) => r.nama.toLowerCase() === it.ruangNama.toLowerCase())) {
          newRooms.push({
            id: `rm-${Date.now()}-${Math.random()}`,
            kode: it.ruangNama.toUpperCase(),
            nama: it.ruangNama,
            kapasitas: 40,
            gedung: 'Gedung Kuliah',
            statusAktif: true,
          });
        }
        if (it.dosenNama && !newLecturers.some((l) => l.nama.toLowerCase() === it.dosenNama.toLowerCase())) {
          newLecturers.push({
            id: `lec-${Date.now()}-${Math.random()}`,
            nidn: `04${Math.floor(10000000 + Math.random() * 90000000)}`,
            nama: it.dosenNama,
            prodi: 'Akademik',
          });
        }
        if (it.kelasNama && !newClasses.some((c) => c.nama.toLowerCase() === it.kelasNama.toLowerCase())) {
          newClasses.push({
            id: `cls-${Date.now()}-${Math.random()}`,
            kode: it.kelasNama.replace(/\s+/g, '-').toUpperCase(),
            nama: it.kelasNama,
            prodi: 'Akademik',
            semester: 1,
            tahunAngkatan: new Date().getFullYear().toString(),
          });
        }
        if (it.mataKuliahNama && !newSubjects.some((s) => s.nama.toLowerCase() === it.mataKuliahNama.toLowerCase())) {
          newSubjects.push({
            id: `sb-${Date.now()}-${Math.random()}`,
            kode: `MK${Math.floor(100 + Math.random() * 900)}`,
            nama: it.mataKuliahNama,
            sks: it.sks || 2,
            prodi: 'Akademik',
            semester: 1,
          });
        }
      }

      setRooms(newRooms);
      setLecturers(newLecturers);
      setClasses(newClasses);
      setSubjects(newSubjects);

      saveMasterCollection('rooms', newRooms).catch(() => {});
      saveMasterCollection('lecturers', newLecturers).catch(() => {});
      saveMasterCollection('classes', newClasses).catch(() => {});
      saveMasterCollection('subjects', newSubjects).catch(() => {});

      addToast({
        type: 'success',
        title: 'Import Berhasil',
        message: `${newItems.length} jadwal berhasil diimport dan disimpan.`,
      });

      return newItems.length;
    },
    [activeAcademicYearId, rooms, lecturers, classes, subjects, addToast]
  );

  const resetToDefaultData = useCallback(() => {
    setSchedules([]); // Default jadwal dalam keadaan kosong saat reset ke data asli
    setAcademicYears(INITIAL_ACADEMIC_YEARS);
    setActiveAcademicYearIdState(INITIAL_ACADEMIC_YEARS[0]?.id || 'ay-2026-ganjil');
    setRooms(INITIAL_ROOMS);
    setLecturers(INITIAL_LECTURERS);
    setSubjects(INITIAL_SUBJECTS);
    setClasses(INITIAL_CLASSES);
    setTimeSlots(INITIAL_TIME_SLOTS);
    setReportSettings(INITIAL_REPORT_SETTINGS);
    resetFilters();
    addToast({
      type: 'info',
      title: 'Reset ke Data Asli',
      message: 'Jadwal telah dikosongkan dan seluruh data master dikembalikan ke konfigurasi asli.',
    });
  }, [addToast, resetFilters]);

  const loadDemoData = useCallback(() => {
    setSchedules(SAMPLE_DEMO_SCHEDULES);
    addToast({
      type: 'success',
      title: 'Data Demo Dimuat',
      message: `${SAMPLE_DEMO_SCHEDULES.length} contoh jadwal kuliah berhasil dimuat ke sistem.`,
    });
  }, [addToast]);

  const clearAllSchedules = useCallback(() => {
    setSchedules([]);
    clearAllSchedulesFromFirestore().catch(() => {});
    addToast({
      type: 'info',
      title: 'Jadwal Dikosongkan',
      message: 'Seluruh jadwal perkuliahan telah dibersihkan.',
    });
  }, [addToast]);

  // Master Data Methods
  const addSubject = (item: Omit<Subject, 'id'>) => {
    setSubjects((prev) => [{ ...item, id: `sb-${Date.now()}` }, ...prev]);
    addToast({ type: 'success', title: 'Mata Kuliah Ditambahkan' });
  };
  const updateSubject = (item: Subject) => {
    setSubjects((prev) => prev.map((s) => (s.id === item.id ? item : s)));
    addToast({ type: 'success', title: 'Mata Kuliah Diperbarui' });
  };
  const deleteSubject = (id: string) => {
    setSubjects((prev) => prev.filter((s) => s.id !== id));
    addToast({ type: 'info', title: 'Mata Kuliah Dihapus' });
  };

  const addLecturer = (item: Omit<Lecturer, 'id'>) => {
    setLecturers((prev) => [{ ...item, id: `lec-${Date.now()}` }, ...prev]);
    addToast({ type: 'success', title: 'Dosen Ditambahkan' });
  };
  const updateLecturer = (item: Lecturer) => {
    setLecturers((prev) => prev.map((l) => (l.id === item.id ? item : l)));
    addToast({ type: 'success', title: 'Dosen Diperbarui' });
  };
  const deleteLecturer = (id: string) => {
    setLecturers((prev) => prev.filter((l) => l.id !== id));
    addToast({ type: 'info', title: 'Dosen Dihapus' });
  };

  const addRoom = (item: Omit<Room, 'id'>) => {
    setRooms((prev) => [{ ...item, id: `rm-${Date.now()}` }, ...prev]);
    addToast({ type: 'success', title: 'Ruangan Ditambahkan' });
  };
  const updateRoom = (item: Room) => {
    setRooms((prev) => prev.map((r) => (r.id === item.id ? item : r)));
    addToast({ type: 'success', title: 'Ruangan Diperbarui' });
  };
  const deleteRoom = (id: string) => {
    setRooms((prev) => prev.filter((r) => r.id !== id));
    addToast({ type: 'info', title: 'Ruangan Dihapus' });
  };

  const addClassGroup = (item: Omit<ClassGroup, 'id'>) => {
    setClasses((prev) => [{ ...item, id: `cls-${Date.now()}` }, ...prev]);
    addToast({ type: 'success', title: 'Kelas Ditambahkan' });
  };
  const updateClassGroup = (item: ClassGroup) => {
    setClasses((prev) => prev.map((c) => (c.id === item.id ? item : c)));
    addToast({ type: 'success', title: 'Kelas Diperbarui' });
  };
  const deleteClassGroup = (id: string) => {
    setClasses((prev) => prev.filter((c) => c.id !== id));
    addToast({ type: 'info', title: 'Kelas Dihapus' });
  };

  const addTimeSlot = (item: Omit<TimeSlot, 'id'>) => {
    setTimeSlots((prev) => [...prev, { ...item, id: `ts-${Date.now()}` }]);
    addToast({ type: 'success', title: 'Master Jam Ditambahkan' });
  };
  const updateTimeSlot = (item: TimeSlot) => {
    setTimeSlots((prev) => prev.map((t) => (t.id === item.id ? item : t)));
    addToast({ type: 'success', title: 'Master Jam Diperbarui' });
  };
  const deleteTimeSlot = (id: string) => {
    setTimeSlots((prev) => prev.filter((t) => t.id !== id));
    addToast({ type: 'info', title: 'Master Jam Dihapus' });
  };
  const updateTimeSlots = (slots: TimeSlot[]) => {
    setTimeSlots(slots);
  };

  const addAcademicYear = (item: Omit<AcademicYear, 'id'>) => {
    const newYear = { ...item, id: `ay-${Date.now()}` };
    setAcademicYears((prev) => [newYear, ...prev]);
    if (newYear.statusAktif) {
      setActiveAcademicYearId(newYear.id);
    }
    addToast({ type: 'success', title: 'Tahun Akademik Ditambahkan' });
  };

  return (
    <AcademicContext.Provider
      value={{
        isCloudConnected,
        isCloudSyncing,
        syncLocalToCloud,
        fetchFromCloud,
        exportBackupJson,
        importBackupJson,

        schedules,
        yearSchedules,
        filteredSchedules,
        academicYears,
        activeAcademicYear,
        activeAcademicYearId,
        subjects,
        lecturers,
        rooms,
        classes,
        timeSlots,
        conflicts,
        toasts,

        reportSettings,
        updateReportSettings,

        searchQuery,
        setSearchQuery,
        selectedHari,
        setSelectedHari,
        selectedRuang,
        setSelectedRuang,
        selectedKelas,
        setSelectedKelas,
        selectedDosen,
        setSelectedDosen,
        selectedMataKuliah,
        setSelectedMataKuliah,
        filterOnlyConflicts,
        setFilterOnlyConflicts,
        resetFilters,

        setActiveAcademicYearId,
        addSchedule,
        updateSchedule,
        deleteSchedule,
        duplicateSchedule,
        moveSchedule,
        importBatchSchedules,
        resetToDefaultData,
        resetToDemoData: loadDemoData,
        loadDemoData,
        clearAllSchedules,

        addSubject,
        updateSubject,
        deleteSubject,
        addLecturer,
        updateLecturer,
        deleteLecturer,
        addRoom,
        updateRoom,
        deleteRoom,
        addClassGroup,
        updateClassGroup,
        deleteClassGroup,
        addClass: addClassGroup,
        updateClass: updateClassGroup,
        deleteClass: deleteClassGroup,
        addTimeSlot,
        updateTimeSlot,
        deleteTimeSlot,
        updateTimeSlots,
        addAcademicYear,

        addToast,
        removeToast,
      }}
    >
      {children}
    </AcademicContext.Provider>
  );
};

export const useAcademic = (): AcademicContextType => {
  const context = useContext(AcademicContext);
  if (!context) {
    throw new Error('useAcademic must be used within an AcademicProvider');
  }
  return context;
};
