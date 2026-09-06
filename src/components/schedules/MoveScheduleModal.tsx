import React, { useState } from 'react';
import { Schedule, DayOfWeek, DAYS_OF_WEEK } from '../../types';
import { useAcademic } from '../../context/AcademicContext';
import { Modal } from '../common/Modal';
import { formatTimeRange } from '../../utils/timeUtils';
import { ArrowRight, MoveHorizontal, AlertTriangle } from 'lucide-react';

interface MoveScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedule: Schedule | null;
}

export const MoveScheduleModal: React.FC<MoveScheduleModalProps> = ({
  isOpen,
  onClose,
  schedule,
}) => {
  const { moveSchedule, timeSlots } = useAcademic();

  const [targetHari, setTargetHari] = useState<DayOfWeek>('Rabu');
  const [targetJamMulai, setTargetJamMulai] = useState('08:00');
  const [targetJamSelesai, setTargetJamSelesai] = useState('09:20');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!schedule) return null;

  const handleTimePresetChange = (slotId: string) => {
    const slot = timeSlots.find((s) => s.id === slotId);
    if (slot) {
      setTargetJamMulai(slot.jamMulai);
      setTargetJamSelesai(slot.jamSelesai);
    }
  };

  const handleMoveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const result = moveSchedule(schedule.id, targetHari, targetJamMulai, targetJamSelesai, false);

    if (result.success) {
      onClose();
    } else {
      const first = result.conflicts[0];
      setErrorMessage(
        `Tidak dapat dipindahkan karena terjadi bentrok (${first?.typeLabel || 'Konflik'}): ${
          first?.keterangan || 'Waktu atau ruangan telah terpakai.'
        }`
      );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Pindahkan Jadwal Perkuliahan"
      subtitle="Pilih hari dan jam baru untuk jadwal perkuliahan"
      maxWidth="md"
      id="move-schedule-modal"
    >
      <form onSubmit={handleMoveSubmit} className="space-y-4">
        {/* Source info */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
          <p className="font-semibold text-sm text-slate-900 mb-1">{schedule.mataKuliahNama}</p>
          <p>
            {schedule.kelasNama} • {schedule.dosenNama} • Ruang {schedule.ruangNama}
          </p>
          <p className="mt-1 font-mono text-emerald-700 font-medium">
            Jadwal Saat Ini: {schedule.hari}, {formatTimeRange(schedule.jamMulai, schedule.jamSelesai)}
          </p>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="flex items-center justify-center text-slate-400 py-1">
          <ArrowRight className="w-5 h-5 animate-pulse" />
        </div>

        {/* Target Day */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Pindahkan ke Hari
          </label>
          <select
            id="select-move-day"
            value={targetHari}
            onChange={(e) => setTargetHari(e.target.value as DayOfWeek)}
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-hidden"
          >
            {DAYS_OF_WEEK.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        {/* Time Preset */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
            Pilih Slot Waktu Baru
          </label>
          <select
            id="select-move-timeslot"
            onChange={(e) => handleTimePresetChange(e.target.value)}
            defaultValue=""
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-hidden"
          >
            <option value="" disabled>
              Pilih Waktu...
            </option>
            {timeSlots.map((ts) => (
              <option key={ts.id} value={ts.id}>
                {ts.label} ({ts.jamMulai} - {ts.jamSelesai})
              </option>
            ))}
          </select>
        </div>

        {/* Manual Time inputs */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-slate-500 mb-1">Jam Mulai</label>
            <input
              id="input-move-start-time"
              type="time"
              required
              value={targetJamMulai}
              onChange={(e) => setTargetJamMulai(e.target.value)}
              className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-emerald-500 outline-hidden"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">Jam Selesai</label>
            <input
              id="input-move-end-time"
              type="time"
              required
              value={targetJamSelesai}
              onChange={(e) => setTargetJamSelesai(e.target.value)}
              className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-emerald-500 outline-hidden"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
          <button
            id="btn-cancel-move"
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-xl transition"
          >
            Batal
          </button>
          <button
            id="btn-confirm-move"
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-xs transition"
          >
            <MoveHorizontal className="w-4 h-4" />
            Pindahkan Jadwal
          </button>
        </div>
      </form>
    </Modal>
  );
};
