import React, { useState, useEffect } from 'react';
import { Schedule, DayOfWeek, DAYS_OF_WEEK, ConflictDetail } from '../../types';
import { useAcademic } from '../../context/AcademicContext';
import { Modal } from '../common/Modal';
import { ConflictModal } from '../common/ConflictModal';
import { Clock, Calendar, BookOpen, User, Building, Users } from 'lucide-react';

interface ScheduleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editSchedule?: Schedule | null;
  prefillData?: Partial<Schedule> | null;
  onSaved?: (schedule: Schedule) => void;
}

export const ScheduleFormModal: React.FC<ScheduleFormModalProps> = ({
  isOpen,
  onClose,
  editSchedule,
  prefillData,
  onSaved,
}) => {
  const {
    activeAcademicYearId,
    academicYears,
    subjects,
    lecturers,
    rooms,
    classes,
    timeSlots,
    addSchedule,
    updateSchedule,
  } = useAcademic();

  const [hari, setHari] = useState<DayOfWeek>('Senin');
  const [jamMulai, setJamMulai] = useState('08:00');
  const [jamSelesai, setJamSelesai] = useState('09:20');
  const [mataKuliahNama, setMataKuliahNama] = useState('');
  const [sks, setSks] = useState(2);
  const [dosenNama, setDosenNama] = useState('');
  const [ruangNama, setRuangNama] = useState('');
  const [kelasNama, setKelasNama] = useState('');
  const [catatan, setCatatan] = useState('');

  // Conflict state
  const [pendingSchedule, setPendingSchedule] = useState<Schedule | null>(null);
  const [conflictList, setConflictList] = useState<ConflictDetail[]>([]);
  const [isConflictModalOpen, setIsConflictModalOpen] = useState(false);

  useEffect(() => {
    if (editSchedule) {
      setHari(editSchedule.hari);
      setJamMulai(editSchedule.jamMulai);
      setJamSelesai(editSchedule.jamSelesai);
      setMataKuliahNama(editSchedule.mataKuliahNama);
      setSks(editSchedule.sks || 2);
      setDosenNama(editSchedule.dosenNama);
      setRuangNama(editSchedule.ruangNama);
      setKelasNama(editSchedule.kelasNama);
      setCatatan(editSchedule.catatan || '');
    } else if (prefillData) {
      if (prefillData.hari) setHari(prefillData.hari);
      if (prefillData.jamMulai) setJamMulai(prefillData.jamMulai);
      if (prefillData.jamSelesai) setJamSelesai(prefillData.jamSelesai);
      if (prefillData.ruangNama) setRuangNama(prefillData.ruangNama);
      if (prefillData.kelasNama) setKelasNama(prefillData.kelasNama);
      if (prefillData.dosenNama) setDosenNama(prefillData.dosenNama);
      if (prefillData.mataKuliahNama) setMataKuliahNama(prefillData.mataKuliahNama);
      if (prefillData.sks) setSks(prefillData.sks);
      setCatatan('');
    } else {
      setHari('Senin');
      setJamMulai('08:00');
      setJamSelesai('09:20');
      setMataKuliahNama(subjects[0]?.nama || '');
      setSks(subjects[0]?.sks || 2);
      setDosenNama(lecturers[0]?.nama || '');
      setRuangNama(rooms[0]?.nama || '');
      setKelasNama(classes[0]?.nama || '');
      setCatatan('');
    }
  }, [editSchedule, prefillData, isOpen, subjects, lecturers, rooms, classes]);

  const handleSubjectChange = (name: string) => {
    setMataKuliahNama(name);
    const found = subjects.find((s) => s.nama.toLowerCase() === name.toLowerCase());
    if (found) {
      setSks(found.sks);
    }
  };

  const handleTimeSlotSelect = (slotId: string) => {
    const slot = timeSlots.find((t) => t.id === slotId);
    if (slot) {
      setJamMulai(slot.jamMulai);
      setJamSelesai(slot.jamSelesai);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!mataKuliahNama.trim() || !dosenNama.trim() || !ruangNama.trim() || !kelasNama.trim()) {
      return;
    }

    const payload: Schedule = {
      id: editSchedule ? editSchedule.id : '',
      academicYearId: activeAcademicYearId,
      hari,
      jamMulai,
      jamSelesai,
      mataKuliahNama: mataKuliahNama.trim(),
      sks: Number(sks) || 2,
      dosenNama: dosenNama.trim(),
      ruangNama: ruangNama.trim(),
      kelasNama: kelasNama.trim(),
      catatan: catatan.trim(),
    };

    setPendingSchedule(payload);

    if (editSchedule) {
      const res = updateSchedule(payload, false);
      if (!res.success) {
        setConflictList(res.conflicts);
        setIsConflictModalOpen(true);
        return;
      }
    } else {
      const res = addSchedule(payload, false);
      if (!res.success) {
        setConflictList(res.conflicts);
        setIsConflictModalOpen(true);
        return;
      }
    }

    if (onSaved) onSaved(payload);
    onClose();
  };

  const handleForceSave = () => {
    if (!pendingSchedule) return;

    if (editSchedule) {
      updateSchedule(pendingSchedule, true);
    } else {
      addSchedule(pendingSchedule, true);
    }

    if (onSaved) onSaved(pendingSchedule);
    setIsConflictModalOpen(false);
    onClose();
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={editSchedule ? 'Edit Jadwal Perkuliahan' : 'Tambah Jadwal Perkuliahan'}
        subtitle={`Tahun Akademik: ${academicYears.find((y) => y.id === activeAcademicYearId)?.tahun || ''} (${
          academicYears.find((y) => y.id === activeAcademicYearId)?.semester || ''
        })`}
        maxWidth="2xl"
        id="schedule-form-modal"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Hari & Slot Jam */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                <Calendar className="w-3.5 h-3.5 inline mr-1 text-slate-500" /> Hari Perkuliahan
              </label>
              <select
                id="select-schedule-day"
                value={hari}
                onChange={(e) => setHari(e.target.value as DayOfWeek)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden"
              >
                {DAYS_OF_WEEK.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                <Clock className="w-3.5 h-3.5 inline mr-1 text-slate-500" /> Preset Jam Kuliah
              </label>
              <select
                id="select-schedule-timeslot"
                onChange={(e) => handleTimeSlotSelect(e.target.value)}
                defaultValue=""
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden"
              >
                <option value="" disabled>
                  Pilih Preset Waktu...
                </option>
                {timeSlots.map((ts) => (
                  <option key={ts.id} value={ts.id}>
                    {ts.label} ({ts.jamMulai} - {ts.jamSelesai})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Jam Mulai & Jam Selesai manual */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50/80 p-3 rounded-xl border border-slate-200">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Jam Mulai (HH:MM)</label>
              <input
                id="input-schedule-start-time"
                type="time"
                required
                value={jamMulai}
                onChange={(e) => setJamMulai(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-emerald-500 outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Jam Selesai (HH:MM)</label>
              <input
                id="input-schedule-end-time"
                type="time"
                required
                value={jamSelesai}
                onChange={(e) => setJamSelesai(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-emerald-500 outline-hidden"
              />
            </div>
          </div>

          {/* Mata Kuliah & SKS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                <BookOpen className="w-3.5 h-3.5 inline mr-1 text-slate-500" /> Mata Kuliah
              </label>
              <div className="relative">
                <input
                  id="input-schedule-subject"
                  type="text"
                  required
                  placeholder="Contoh: Akhlak dan Tasawuf"
                  value={mataKuliahNama}
                  onChange={(e) => handleSubjectChange(e.target.value)}
                  list="subjects-datalist"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden"
                />
                <datalist id="subjects-datalist">
                  {subjects.map((s) => (
                    <option key={s.id} value={s.nama}>
                      {s.kode} - {s.sks} SKS
                    </option>
                  ))}
                </datalist>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Bobot SKS
              </label>
              <input
                id="input-schedule-sks"
                type="number"
                min="1"
                max="8"
                required
                value={sks}
                onChange={(e) => setSks(parseInt(e.target.value, 10) || 2)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-hidden"
              />
            </div>
          </div>

          {/* Dosen */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              <User className="w-3.5 h-3.5 inline mr-1 text-slate-500" /> Dosen Pengampu
            </label>
            <input
              id="input-schedule-lecturer"
              type="text"
              required
              placeholder="Contoh: Deviana, M.Ag"
              value={dosenNama}
              onChange={(e) => setDosenNama(e.target.value)}
              list="lecturers-datalist"
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden"
            />
            <datalist id="lecturers-datalist">
              {lecturers.map((l) => (
                <option key={l.id} value={l.nama}>
                  {l.nidn} ({l.prodi})
                </option>
              ))}
            </datalist>
          </div>

          {/* Ruang & Kelas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                <Building className="w-3.5 h-3.5 inline mr-1 text-slate-500" /> Ruangan
              </label>
              <input
                id="input-schedule-room"
                type="text"
                required
                placeholder="Contoh: B1 / Aula II"
                value={ruangNama}
                onChange={(e) => setRuangNama(e.target.value)}
                list="rooms-datalist"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden"
              />
              <datalist id="rooms-datalist">
                {rooms.map((r) => (
                  <option key={r.id} value={r.nama}>
                    {r.gedung} - Kapasitas {r.kapasitas} mhs
                  </option>
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                <Users className="w-3.5 h-3.5 inline mr-1 text-slate-500" /> Kelas / Rombel
              </label>
              <input
                id="input-schedule-class"
                type="text"
                required
                placeholder="Contoh: I MBS"
                value={kelasNama}
                onChange={(e) => setKelasNama(e.target.value)}
                list="classes-datalist"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-hidden"
              />
              <datalist id="classes-datalist">
                {classes.map((c) => (
                  <option key={c.id} value={c.nama}>
                    {c.prodi} (Semester {c.semester})
                  </option>
                ))}
              </datalist>
            </div>
          </div>

          {/* Catatan Tambahan */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Catatan (Opsional)
            </label>
            <input
              id="input-schedule-notes"
              type="text"
              placeholder="Catatan kelas gabungan, praktikum, dll."
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-hidden"
            />
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              id="btn-cancel-schedule-form"
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition"
            >
              Batal
            </button>
            <button
              id="btn-submit-schedule-form"
              type="submit"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-xs transition"
            >
              {editSchedule ? 'Simpan Perubahan' : 'Simpan Jadwal'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Conflict Dialog if collision happens */}
      <ConflictModal
        isOpen={isConflictModalOpen}
        conflicts={conflictList}
        onClose={() => setIsConflictModalOpen(false)}
        onForceSave={handleForceSave}
      />
    </>
  );
};
