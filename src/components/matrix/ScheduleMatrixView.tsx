import React, { useState, useMemo } from 'react';
import {
  MatrixMode,
  DayOfWeek,
  Schedule,
  TimeSlot,
  DAYS_OF_WEEK,
} from '../../types';
import { useAcademic } from '../../context/AcademicContext';
import { useAuth } from '../../context/AuthContext';
import { getUnifiedTimeSlots, generateScheduleMatrix } from '../../utils/matrixUtils';
import { formatTimeRange } from '../../utils/timeUtils';
import {
  Grid,
  Building,
  GraduationCap,
  UserCheck,
  BookOpen,
  Plus,
  AlertTriangle,
  GripVertical,
  Filter,
  Calendar,
} from 'lucide-react';

interface ScheduleMatrixViewProps {
  onSelectSchedule: (schedule: Schedule) => void;
  onAddNewSlot: (hari: DayOfWeek, slot: TimeSlot, prefillFilter?: { room?: string; class?: string; lecturer?: string; subject?: string }) => void;
}

export const ScheduleMatrixView: React.FC<ScheduleMatrixViewProps> = ({
  onSelectSchedule,
  onAddNewSlot,
}) => {
  const {
    yearSchedules,
    rooms,
    classes,
    lecturers,
    subjects,
    conflicts,
    timeSlots,
    activeAcademicYear,
    moveSchedule,
    addToast,
  } = useAcademic();

  const { canEditSchedule } = useAuth();

  // Mode Selection (Section 8)
  const [matrixMode, setMatrixMode] = useState<MatrixMode>('ALL');
  const [selectedRoom, setSelectedRoom] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedLecturer, setSelectedLecturer] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');

  // Drag and drop state (Section 20)
  const [draggedScheduleId, setDraggedScheduleId] = useState<string | null>(null);
  const [dragOverCellKey, setDragOverCellKey] = useState<string | null>(null);

  // Conflicted schedule IDs lookup
  const conflictScheduleIds = useMemo(() => {
    const ids = new Set<string>();
    for (const c of conflicts) {
      if (c.scheduleA?.id) ids.add(c.scheduleA.id);
      if (c.scheduleB?.id) ids.add(c.scheduleB.id);
    }
    return ids;
  }, [conflicts]);

  // Filter schedules based on active Matrix Mode strictly within active academic year
  const filteredForMatrix = useMemo(() => {
    switch (matrixMode) {
      case 'ROOM':
        return selectedRoom
          ? yearSchedules.filter((s) => s.ruangNama.toLowerCase() === selectedRoom.toLowerCase())
          : yearSchedules;
      case 'CLASS':
        return selectedClass
          ? yearSchedules.filter((s) => s.kelasNama.toLowerCase() === selectedClass.toLowerCase())
          : yearSchedules;
      case 'LECTURER':
        return selectedLecturer
          ? yearSchedules.filter((s) => s.dosenNama.toLowerCase() === selectedLecturer.toLowerCase())
          : yearSchedules;
      case 'SUBJECT':
        return selectedSubject
          ? yearSchedules.filter((s) => s.mataKuliahNama.toLowerCase() === selectedSubject.toLowerCase())
          : yearSchedules;
      case 'ALL':
      default:
        return yearSchedules;
    }
  }, [matrixMode, selectedRoom, selectedClass, selectedLecturer, selectedSubject, yearSchedules]);

  // Unified slots including any custom times
  const unifiedSlots = useMemo(() => {
    return getUnifiedTimeSlots(filteredForMatrix, timeSlots);
  }, [filteredForMatrix, timeSlots]);

  // Generate Matrix
  const matrixRows = useMemo(() => {
    return generateScheduleMatrix(filteredForMatrix, unifiedSlots, DAYS_OF_WEEK);
  }, [filteredForMatrix, unifiedSlots]);

  // Drag and Drop handlers (Section 20)
  const handleDragStart = (e: React.DragEvent, scheduleId: string) => {
    if (!canEditSchedule) {
      e.preventDefault();
      addToast({
        type: 'warning',
        title: 'Akses Dibatasi',
        message: 'Hanya Bagian Akademik (Admin) yang dapat memindahkan jadwal.',
      });
      return;
    }
    e.dataTransfer.setData('text/plain', scheduleId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedScheduleId(scheduleId);
  };

  const handleDragOver = (e: React.DragEvent, cellKey: string) => {
    if (!canEditSchedule) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverCellKey !== cellKey) {
      setDragOverCellKey(cellKey);
    }
  };

  const handleDragLeave = () => {
    setDragOverCellKey(null);
  };

  const handleDrop = (e: React.DragEvent, day: DayOfWeek, slot: TimeSlot) => {
    if (!canEditSchedule) return;
    e.preventDefault();
    setDragOverCellKey(null);
    const scheduleId = e.dataTransfer.getData('text/plain') || draggedScheduleId;
    if (!scheduleId) return;

    setDraggedScheduleId(null);
    moveSchedule(scheduleId, day, slot.jamMulai, slot.jamSelesai, false);
  };

  const handleAddClick = (day: DayOfWeek, slot: TimeSlot) => {
    if (!canEditSchedule) {
      addToast({
        type: 'warning',
        title: 'Akses Dibatasi',
        message: 'Hanya Bagian Akademik (Admin) yang dapat membuat jadwal baru.',
      });
      return;
    }
    const prefill: { room?: string; class?: string; lecturer?: string; subject?: string } = {};
    if (matrixMode === 'ROOM' && selectedRoom) prefill.room = selectedRoom;
    if (matrixMode === 'CLASS' && selectedClass) prefill.class = selectedClass;
    if (matrixMode === 'LECTURER' && selectedLecturer) prefill.lecturer = selectedLecturer;
    if (matrixMode === 'SUBJECT' && selectedSubject) prefill.subject = selectedSubject;

    onAddNewSlot(day, slot, prefill);
  };

  return (
    <div className="space-y-4">
      {/* Header Controls & Matrix Modes (Section 8) */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Grid className="w-5 h-5 text-blue-600" />
              Matriks Jadwal Perkuliahan
            </h2>
            <p className="text-xs text-slate-500">
              Visualisasi grid jadwal per jam &amp; hari. Drag &amp; drop kartu untuk memindahkan jadwal perkuliahan.
            </p>
          </div>

          {/* Mode Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg overflow-x-auto text-xs font-semibold">
            <button
              id="mode-tab-all"
              onClick={() => setMatrixMode('ALL')}
              className={`px-3 py-1.5 rounded-md transition whitespace-nowrap ${
                matrixMode === 'ALL'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua Jadwal
            </button>
            <button
              id="mode-tab-room"
              onClick={() => {
                setMatrixMode('ROOM');
                if (!selectedRoom && rooms.length > 0) setSelectedRoom(rooms[0].nama);
              }}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-md transition whitespace-nowrap ${
                matrixMode === 'ROOM'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building className="w-3.5 h-3.5" /> Ruangan
            </button>
            <button
              id="mode-tab-class"
              onClick={() => {
                setMatrixMode('CLASS');
                if (!selectedClass && classes.length > 0) setSelectedClass(classes[0].nama);
              }}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-md transition whitespace-nowrap ${
                matrixMode === 'CLASS'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" /> Kelas
            </button>
            <button
              id="mode-tab-lecturer"
              onClick={() => {
                setMatrixMode('LECTURER');
                if (!selectedLecturer && lecturers.length > 0) setSelectedLecturer(lecturers[0].nama);
              }}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-md transition whitespace-nowrap ${
                matrixMode === 'LECTURER'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" /> Dosen
            </button>
            <button
              id="mode-tab-subject"
              onClick={() => {
                setMatrixMode('SUBJECT');
                if (!selectedSubject && subjects.length > 0) setSelectedSubject(subjects[0].nama);
              }}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-md transition whitespace-nowrap ${
                matrixMode === 'SUBJECT'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" /> Mata Kuliah
            </button>
          </div>
        </div>

        {/* Sub-filter dropdown for specific modes */}
        {matrixMode !== 'ALL' && (
          <div className="pt-2 border-t border-slate-100 flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-blue-600" /> Filter Matriks:
            </span>

            {matrixMode === 'ROOM' && (
              <select
                id="select-matrix-room"
                value={selectedRoom}
                onChange={(e) => setSelectedRoom(e.target.value)}
                className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-md text-xs font-medium text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden"
              >
                {rooms.map((r) => (
                  <option key={r.id} value={r.nama}>
                    Pilih Ruangan: {r.nama} ({r.gedung})
                  </option>
                ))}
              </select>
            )}

            {matrixMode === 'CLASS' && (
              <select
                id="select-matrix-class"
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-md text-xs font-medium text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.nama}>
                    Pilih Kelas: {c.nama} ({c.prodi})
                  </option>
                ))}
              </select>
            )}

            {matrixMode === 'LECTURER' && (
              <select
                id="select-matrix-lecturer"
                value={selectedLecturer}
                onChange={(e) => setSelectedLecturer(e.target.value)}
                className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-md text-xs font-medium text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden"
              >
                {lecturers.map((l) => (
                  <option key={l.id} value={l.nama}>
                    Pilih Dosen: {l.nama}
                  </option>
                ))}
              </select>
            )}

            {matrixMode === 'SUBJECT' && (
              <select
                id="select-matrix-subject"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-md text-xs font-medium text-slate-700 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.nama}>
                    Pilih MK: {s.nama} ({s.sks} SKS)
                  </option>
                ))}
              </select>
            )}

            <span className="text-xs text-slate-400 ml-auto hidden sm:inline">
              Menampilkan {filteredForMatrix.length} jadwal
            </span>
          </div>
        )}
      </div>

      {/* The Academic Matrix Table matching Professional Polish theme */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto bg-slate-50">
          <table className="w-full border-collapse text-left min-w-[960px]">
            {/* Column Headers */}
            <thead className="sticky top-0 bg-white z-20">
              <tr>
                <th className="border-b border-r border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-500 uppercase w-28 text-center bg-white sticky left-0 z-30">
                  JAM
                </th>
                {DAYS_OF_WEEK.map((day) => (
                  <th
                    key={day}
                    className="border-b border-r border-slate-200 last:border-r-0 px-4 py-2.5 text-xs font-bold text-slate-500 uppercase text-center bg-white"
                  >
                    {day}
                  </th>
                ))}
              </tr>
            </thead>

            {/* Rows: Time Slots */}
            <tbody className="divide-y divide-slate-200 text-xs">
              {matrixRows.map((row) => (
                <tr key={row.timeSlot.id} className="h-24">
                  {/* Left Column: Time Slot */}
                  <td className="border-b border-r border-slate-200 bg-white p-2 text-center align-middle font-mono text-xs text-slate-700 sticky left-0 z-10 whitespace-nowrap">
                    <div className="font-bold text-slate-800">{formatTimeRange(row.timeSlot.jamMulai, row.timeSlot.jamSelesai)}</div>
                    <div className="text-[10px] text-slate-400 font-normal">
                      {row.timeSlot.jamMulai} - {row.timeSlot.jamSelesai}
                    </div>
                  </td>

                  {/* Day Cells */}
                  {DAYS_OF_WEEK.map((day) => {
                    const cellSchedules = row.cells[day] || [];
                    const cellKey = `${day}-${row.timeSlot.id}`;
                    const isDragOver = dragOverCellKey === cellKey;

                    return (
                      <td
                        key={cellKey}
                        onDragOver={(e) => handleDragOver(e, cellKey)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, day, row.timeSlot)}
                        className={`border-b border-r border-slate-200 last:border-r-0 p-1.5 align-top transition-colors ${
                          isDragOver
                            ? 'bg-blue-100/70 ring-2 ring-blue-500 ring-inset'
                            : cellSchedules.length > 0
                            ? 'bg-slate-50/50'
                            : 'bg-slate-50/30'
                        }`}
                      >
                        {cellSchedules.length === 0 ? (
                          /* Empty Cell matching Design HTML */
                          <div
                            onClick={() => {
                              if (canEditSchedule) {
                                handleAddClick(day, row.timeSlot);
                              }
                            }}
                            className={`h-full min-h-[82px] rounded-md border border-slate-200 bg-white p-2 text-[10px] flex items-center justify-center text-slate-300 uppercase tracking-widest transition-colors ${
                              canEditSchedule
                                ? 'hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50/40 cursor-pointer group'
                                : 'cursor-default'
                            }`}
                            title={canEditSchedule ? `Tambah jadwal pada ${day} ${formatTimeRange(row.timeSlot.jamMulai, row.timeSlot.jamSelesai)}` : undefined}
                          >
                            <span className={canEditSchedule ? "group-hover:hidden" : ""}>Kosong</span>
                            {canEditSchedule && (
                              <div className="hidden group-hover:flex items-center gap-1 font-semibold text-blue-600">
                                <Plus className="w-3.5 h-3.5" />
                                <span>Isi Jadwal</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          /* Render Schedule Cards matching Design HTML */
                          <div className="space-y-1.5 h-full">
                            {cellSchedules.map((sch) => {
                              const hasConflict = conflictScheduleIds.has(sch.id);

                              return (
                                <div
                                  key={sch.id}
                                  draggable={canEditSchedule}
                                  onDragStart={(e) => {
                                    if (canEditSchedule) {
                                      handleDragStart(e, sch.id);
                                    }
                                  }}
                                  onClick={() => onSelectSchedule(sch)}
                                  className={`rounded-md p-2 text-[10px] leading-tight transition-shadow shadow-2xs hover:shadow-xs relative group ${
                                    canEditSchedule ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'
                                  } ${
                                    hasConflict
                                      ? 'border border-red-200 bg-red-50 ring-2 ring-red-500 ring-offset-1'
                                      : 'border border-blue-200 bg-blue-50 hover:bg-blue-100/60'
                                  }`}
                                >
                                  {/* Drag handle */}
                                  {canEditSchedule && (
                                    <div className="absolute top-1.5 right-1.5 text-slate-400 opacity-30 group-hover:opacity-100 transition">
                                      <GripVertical className="w-3 h-3" />
                                    </div>
                                  )}

                                  {/* Title & Conflict Badge */}
                                  {hasConflict ? (
                                    <p className="font-bold text-red-700 mb-1 pr-3 truncate">
                                      {sch.mataKuliahNama}{' '}
                                      <span className="bg-red-200 px-1 py-0.5 rounded text-[9px] font-bold text-red-800 uppercase">
                                        BENTROK
                                      </span>
                                    </p>
                                  ) : (
                                    <p className="font-bold text-blue-700 mb-1 pr-3 truncate">
                                      {sch.mataKuliahNama}
                                    </p>
                                  )}

                                  {/* Class & SKS */}
                                  <p className={`font-medium ${hasConflict ? 'text-red-600' : 'text-blue-600'}`}>
                                    {sch.kelasNama} • {sch.sks} SKS
                                  </p>

                                  {/* Lecturer */}
                                  <p className="text-slate-500 mt-1 italic truncate">
                                    {sch.dosenNama}
                                  </p>

                                  {/* Room info pill */}
                                  <div className="mt-1.5 flex items-center justify-between">
                                    <span className="px-1.5 py-0.5 rounded bg-white/90 border border-slate-200 text-slate-700 font-medium text-[9px]">
                                      Ruang: {sch.ruangNama}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
