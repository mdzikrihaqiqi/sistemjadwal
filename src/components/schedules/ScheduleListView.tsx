import React, { useState } from 'react';
import { useAcademic } from '../../context/AcademicContext';
import { useAuth } from '../../context/AuthContext';
import { Schedule, DAYS_OF_WEEK } from '../../types';
import { formatTimeRange } from '../../utils/timeUtils';
import {
  CalendarDays,
  Plus,
  Search,
  Filter,
  RotateCcw,
  Edit2,
  Trash2,
  Copy,
  MoveHorizontal,
  Eye,
  AlertTriangle,
  Building,
  GraduationCap,
  UserCheck,
  BookOpen,
} from 'lucide-react';
import { ConfirmDialog } from '../common/ConfirmDialog';

interface ScheduleListViewProps {
  onOpenAddModal: () => void;
  onEditSchedule: (schedule: Schedule) => void;
  onSelectDetail: (schedule: Schedule) => void;
  onMoveSchedule: (schedule: Schedule) => void;
}

export const ScheduleListView: React.FC<ScheduleListViewProps> = ({
  onOpenAddModal,
  onEditSchedule,
  onSelectDetail,
  onMoveSchedule,
}) => {
  const {
    filteredSchedules,
    schedules,
    rooms,
    classes,
    lecturers,
    subjects,
    conflicts,
    deleteSchedule,
    duplicateSchedule,

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
  } = useAcademic();

  const { canEditSchedule } = useAuth();

  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);

  // Conflicted schedule IDs lookup
  const conflictScheduleIds = new Set<string>();
  for (const c of conflicts) {
    if (c.scheduleA?.id) conflictScheduleIds.add(c.scheduleA.id);
    if (c.scheduleB?.id) conflictScheduleIds.add(c.scheduleB.id);
  }

  const handleDeletePrompt = (id: string) => {
    setDeleteTargetId(id);
    setIsConfirmDeleteOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deleteTargetId) {
      deleteSchedule(deleteTargetId);
      setDeleteTargetId(null);
    }
  };

  const hasActiveFilters =
    Boolean(selectedHari) ||
    Boolean(selectedRuang) ||
    Boolean(selectedKelas) ||
    Boolean(selectedDosen) ||
    Boolean(selectedMataKuliah) ||
    filterOnlyConflicts;

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-emerald-600" />
            Manajemen Data Jadwal Perkuliahan
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar lengkap jadwal akademik. Gunakan filter untuk menyortir berdasarkan ruangan, dosen, kelas, dan status bentrok.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              id="btn-reset-filters"
              onClick={resetFilters}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Filter
            </button>
          )}

          {canEditSchedule && (
            <button
              id="btn-add-schedule-list"
              onClick={onOpenAddModal}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
            >
              <Plus className="w-4 h-4" />
              Tambah Jadwal Baru
            </button>
          )}
        </div>
      </div>

      {/* Filter Toolbar (Section 11) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
          <Filter className="w-3.5 h-3.5 text-emerald-600" />
          <span>Filter Data Jadwal</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Filter Hari */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Hari
            </label>
            <select
              id="filter-select-day"
              value={selectedHari}
              onChange={(e) => setSelectedHari(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-hidden"
            >
              <option value="">Semua Hari</option>
              {DAYS_OF_WEEK.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Ruangan */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Ruangan
            </label>
            <select
              id="filter-select-room"
              value={selectedRuang}
              onChange={(e) => setSelectedRuang(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-hidden"
            >
              <option value="">Semua Ruang</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.nama}>
                  {r.nama}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Kelas */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Kelas
            </label>
            <select
              id="filter-select-class"
              value={selectedKelas}
              onChange={(e) => setSelectedKelas(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-hidden"
            >
              <option value="">Semua Kelas</option>
              {classes.map((c) => (
                <option key={c.id} value={c.nama}>
                  {c.nama}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Dosen */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Dosen
            </label>
            <select
              id="filter-select-lecturer"
              value={selectedDosen}
              onChange={(e) => setSelectedDosen(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-hidden"
            >
              <option value="">Semua Dosen</option>
              {lecturers.map((l) => (
                <option key={l.id} value={l.nama}>
                  {l.nama}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Mata Kuliah */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Mata Kuliah
            </label>
            <select
              id="filter-select-subject"
              value={selectedMataKuliah}
              onChange={(e) => setSelectedMataKuliah(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-hidden"
            >
              <option value="">Semua MK</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.nama}>
                  {s.nama}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Status Bentrok */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Status Bentrok
            </label>
            <button
              id="filter-toggle-conflict"
              type="button"
              onClick={() => setFilterOnlyConflicts(!filterOnlyConflicts)}
              className={`w-full px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition text-center ${
                filterOnlyConflicts
                  ? 'bg-rose-100 border-rose-300 text-rose-800 font-bold'
                  : 'bg-slate-50 border-slate-300 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {filterOnlyConflicts ? '🔴 Hanya Bentrok' : 'Semua Status'}
            </button>
          </div>
        </div>
      </div>

      {/* Schedule Table (Section 10) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>
            Menampilkan <strong>{filteredSchedules.length}</strong> jadwal perkuliahan
          </span>
        </div>

        {filteredSchedules.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <CalendarDays className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="font-semibold text-slate-700">Tidak ada jadwal yang cocok</p>
            <p className="text-xs text-slate-400 mt-1">Coba sesuaikan pencarian atau reset filter Anda.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-3 text-center w-12">No</th>
                  <th className="py-3 px-3">Hari &amp; Jam</th>
                  <th className="py-3 px-3">Mata Kuliah</th>
                  <th className="py-3 px-3 text-center">SKS</th>
                  <th className="py-3 px-3">Dosen Pengampu</th>
                  <th className="py-3 px-3">Ruang</th>
                  <th className="py-3 px-3">Kelas</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-3 text-center w-36">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredSchedules.map((item, index) => {
                  const isConflicting = conflictScheduleIds.has(item.id);

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-50/80 transition ${
                        isConflicting ? 'bg-rose-50/30' : ''
                      }`}
                    >
                      <td className="py-3 px-3 text-center font-mono text-slate-500">{index + 1}</td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="font-semibold text-slate-900">{item.hari}</div>
                        <div className="font-mono text-[11px] text-slate-500">
                          {formatTimeRange(item.jamMulai, item.jamSelesai)}
                        </div>
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-900">
                        <button
                          onClick={() => onSelectDetail(item)}
                          className="hover:text-emerald-700 text-left transition font-semibold"
                        >
                          {item.mataKuliahNama}
                        </button>
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-slate-700">{item.sks}</td>
                      <td className="py-3 px-3 text-slate-700">{item.dosenNama}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 font-bold text-[11px] border border-slate-200">
                          {item.ruangNama}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-800">{item.kelasNama}</td>
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        {isConflicting ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                            <AlertTriangle className="w-3 h-3 text-rose-600" /> 🔴 Bentrok
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            🟢 Valid
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onSelectDetail(item)}
                            title="Lihat Detail"
                            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          {canEditSchedule && (
                            <>
                              <button
                                onClick={() => onEditSchedule(item)}
                                title="Edit Jadwal"
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => onMoveSchedule(item)}
                                title="Pindahkan Jadwal"
                                className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition"
                              >
                                <MoveHorizontal className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => duplicateSchedule(item.id)}
                                title="Duplikasi Jadwal"
                                className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeletePrompt(item.id)}
                                title="Hapus Jadwal"
                                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation Dialog for Deleting (Section 21) */}
      <ConfirmDialog
        isOpen={isConfirmDeleteOpen}
        onClose={() => setIsConfirmDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Hapus Jadwal Perkuliahan"
        message="Apakah Anda yakin ingin menghapus jadwal perkuliahan ini? Tindakan ini tidak dapat dibatalkan."
        confirmText="Hapus Jadwal"
        variant="danger"
        id="confirm-delete-schedule"
      />
    </div>
  );
};
