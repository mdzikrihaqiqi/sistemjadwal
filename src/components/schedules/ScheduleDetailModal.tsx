import React from 'react';
import { Schedule, ConflictDetail } from '../../types';
import { useAcademic } from '../../context/AcademicContext';
import { Modal } from '../common/Modal';
import {
  Calendar,
  Clock,
  BookOpen,
  User,
  Building,
  Users,
  AlertTriangle,
  Copy,
  Edit2,
  Trash2,
  MoveHorizontal,
} from 'lucide-react';
import { formatTimeRange } from '../../utils/timeUtils';

interface ScheduleDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedule: Schedule | null;
  onEdit: (schedule: Schedule) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onMove: (schedule: Schedule) => void;
}

export const ScheduleDetailModal: React.FC<ScheduleDetailModalProps> = ({
  isOpen,
  onClose,
  schedule,
  onEdit,
  onDelete,
  onDuplicate,
  onMove,
}) => {
  const { conflicts, rooms, lecturers, subjects, classes } = useAcademic();

  if (!schedule) return null;

  // Find any conflicts involving this schedule
  const relatedConflicts = conflicts.filter(
    (c) => c.scheduleA?.id === schedule.id || c.scheduleB?.id === schedule.id
  );
  const isConflicting = relatedConflicts.length > 0;

  // Lookup Master details if available
  const roomInfo = rooms.find((r) => r.nama.toLowerCase() === schedule.ruangNama.toLowerCase());
  const lecturerInfo = lecturers.find((l) => l.nama.toLowerCase() === schedule.dosenNama.toLowerCase());
  const classInfo = classes.find((c) => c.nama.toLowerCase() === schedule.kelasNama.toLowerCase());
  const subjectInfo = subjects.find((s) => s.nama.toLowerCase() === schedule.mataKuliahNama.toLowerCase());

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Detail Jadwal Perkuliahan"
      subtitle={`${schedule.hari}, ${formatTimeRange(schedule.jamMulai, schedule.jamSelesai)}`}
      maxWidth="lg"
      id="schedule-detail-modal"
    >
      <div className="space-y-5">
        {/* Conflict Alert Banner if any */}
        {isConflicting && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 space-y-1">
            <div className="flex items-center gap-2 text-rose-800 font-semibold text-xs uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Jadwal Ini Mengalami Bentrok</span>
            </div>
            {relatedConflicts.map((c, i) => (
              <p key={i} className="text-xs text-rose-700 pl-6 leading-relaxed">
                • <strong>{c.typeLabel}:</strong> {c.keterangan}
              </p>
            ))}
          </div>
        )}

        {/* Primary Header Card */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                {schedule.sks} SKS
              </span>
              <h4 className="text-lg font-bold text-slate-900 mt-2">{schedule.mataKuliahNama}</h4>
              {subjectInfo?.kode && (
                <span className="text-xs font-mono text-slate-500">Kode MK: {subjectInfo.kode}</span>
              )}
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                isConflicting
                  ? 'bg-rose-100 text-rose-800 border-rose-200'
                  : 'bg-emerald-100 text-emerald-800 border-emerald-200'
              }`}
            >
              {isConflicting ? '🔴 Bentrok' : '🟢 Jadwal Valid'}
            </span>
          </div>
        </div>

        {/* Grid Info */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 uppercase">
              <User className="w-3.5 h-3.5 text-slate-500" /> Dosen Pengampu
            </span>
            <p className="font-semibold text-slate-900">{schedule.dosenNama}</p>
            {lecturerInfo?.nidn && <p className="text-xs text-slate-500">NIDN: {lecturerInfo.nidn}</p>}
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 uppercase">
              <Building className="w-3.5 h-3.5 text-slate-500" /> Ruangan Kuliah
            </span>
            <p className="font-semibold text-slate-900">{schedule.ruangNama}</p>
            {roomInfo && (
              <p className="text-xs text-slate-500">
                {roomInfo.gedung} (Kapasitas {roomInfo.kapasitas} mhs)
              </p>
            )}
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 uppercase">
              <Users className="w-3.5 h-3.5 text-slate-500" /> Rombongan Kelas
            </span>
            <p className="font-semibold text-slate-900">{schedule.kelasNama}</p>
            {classInfo && (
              <p className="text-xs text-slate-500">
                {classInfo.prodi} • Angkatan {classInfo.tahunAngkatan}
              </p>
            )}
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 uppercase">
              <Clock className="w-3.5 h-3.5 text-slate-500" /> Waktu &amp; Hari
            </span>
            <p className="font-semibold text-slate-900">
              {schedule.hari}, {formatTimeRange(schedule.jamMulai, schedule.jamSelesai)}
            </p>
            <p className="text-xs text-slate-500">
              Durasi: {schedule.jamMulai} s.d. {schedule.jamSelesai} WIB
            </p>
          </div>
        </div>

        {schedule.catatan && (
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
            <strong>Catatan:</strong> {schedule.catatan}
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <button
            id="btn-delete-from-detail"
            type="button"
            onClick={() => {
              onDelete(schedule.id);
              onClose();
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-semibold transition"
          >
            <Trash2 className="w-4 h-4" /> Hapus
          </button>

          <div className="flex items-center gap-2">
            <button
              id="btn-move-from-detail"
              type="button"
              onClick={() => {
                onMove(schedule);
                onClose();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 border border-slate-300 hover:bg-slate-50 rounded-xl text-xs font-medium text-slate-700 transition"
            >
              <MoveHorizontal className="w-4 h-4" /> Pindahkan
            </button>
            <button
              id="btn-duplicate-from-detail"
              type="button"
              onClick={() => {
                onDuplicate(schedule.id);
                onClose();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 border border-slate-300 hover:bg-slate-50 rounded-xl text-xs font-medium text-slate-700 transition"
            >
              <Copy className="w-4 h-4" /> Duplikasi
            </button>
            <button
              id="btn-edit-from-detail"
              type="button"
              onClick={() => {
                onEdit(schedule);
                onClose();
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
            >
              <Edit2 className="w-4 h-4" /> Edit Jadwal
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
