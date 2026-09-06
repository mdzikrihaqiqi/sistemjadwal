import React, { useState, useMemo } from 'react';
import { DayOfWeek, DAYS_OF_WEEK, TimeSlot, Schedule, Room } from '../../types';
import { useAcademic } from '../../context/AcademicContext';
import { useAuth } from '../../context/AuthContext';
import { getAvailableRooms, DEFAULT_TIME_SLOTS } from '../../utils/matrixUtils';
import { formatTimeRange } from '../../utils/timeUtils';
import {
  DoorOpen,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  PlusCircle,
  Users,
  Building,
  Filter,
} from 'lucide-react';

interface RoomVacancyViewProps {
  onUseRoom: (prefill: { hari: DayOfWeek; jamMulai: string; jamSelesai: string; ruangNama: string }) => void;
  onSelectSchedule: (schedule: Schedule) => void;
}

export const RoomVacancyView: React.FC<RoomVacancyViewProps> = ({
  onUseRoom,
  onSelectSchedule,
}) => {
  const { rooms, yearSchedules, timeSlots, activeAcademicYear } = useAcademic();
  const { canEditSchedule } = useAuth();

  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('Senin');
  const [selectedSlotId, setSelectedSlotId] = useState<string>(timeSlots[0]?.id || 'ts-1');
  const [customStartTime, setCustomStartTime] = useState<string>('08:00');
  const [customEndTime, setCustomEndTime] = useState<string>('09:20');
  const [filterBuilding, setFilterBuilding] = useState<string>('ALL');

  // Handle slot change
  const handleSlotChange = (slotId: string) => {
    setSelectedSlotId(slotId);
    const slot = timeSlots.find((s) => s.id === slotId);
    if (slot) {
      setCustomStartTime(slot.jamMulai);
      setCustomEndTime(slot.jamSelesai);
    }
  };

  // Compute vacancy strictly against active academic year schedules
  const vacancyResults = useMemo(() => {
    return getAvailableRooms(rooms, yearSchedules, selectedDay, customStartTime, customEndTime);
  }, [rooms, yearSchedules, selectedDay, customStartTime, customEndTime]);

  // Filter by building
  const filteredResults = useMemo(() => {
    if (filterBuilding === 'ALL') return vacancyResults;
    return vacancyResults.filter((item) => item.room.gedung === filterBuilding);
  }, [vacancyResults, filterBuilding]);

  const uniqueBuildings = useMemo(() => {
    const set = new Set<string>();
    for (const r of rooms) {
      if (r.gedung) set.add(r.gedung);
    }
    return Array.from(set);
  }, [rooms]);

  const availableCount = filteredResults.filter((r) => r.isAvailable).length;
  const occupiedCount = filteredResults.filter((r) => !r.isAvailable).length;

  return (
    <div className="space-y-5">
      {/* Search Filter Header (Section 9) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <DoorOpen className="w-5 h-5 text-emerald-600" />
            Cek Ketersediaan Ruangan Kosong
          </h2>
          <p className="text-xs text-slate-500">
            Pilih hari dan jam perkuliahan untuk mengetahui seluruh ruangan yang masih kosong dan siap digunakan.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-slate-100">
          {/* Day Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              <Calendar className="w-3.5 h-3.5 inline mr-1 text-slate-500" /> Pilih Hari
            </label>
            <select
              id="select-vacancy-day"
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value as DayOfWeek)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-hidden"
            >
              {DAYS_OF_WEEK.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Time Slot Preset Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              <Clock className="w-3.5 h-3.5 inline mr-1 text-slate-500" /> Preset Jam
            </label>
            <select
              id="select-vacancy-slot"
              value={selectedSlotId}
              onChange={(e) => handleSlotChange(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-hidden"
            >
              {timeSlots.map((ts) => (
                <option key={ts.id} value={ts.id}>
                  {ts.label} ({ts.jamMulai} - {ts.jamSelesai})
                </option>
              ))}
            </select>
          </div>

          {/* Start & End Manual Time */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Jam Mulai s/d Selesai
            </label>
            <div className="flex items-center gap-1.5">
              <input
                id="input-vacancy-start"
                type="time"
                value={customStartTime}
                onChange={(e) => setCustomStartTime(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-hidden"
              />
              <span className="text-slate-400 text-xs">-</span>
              <input
                id="input-vacancy-end"
                type="time"
                value={customEndTime}
                onChange={(e) => setCustomEndTime(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-hidden"
              />
            </div>
          </div>

          {/* Building Filter */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              <Building className="w-3.5 h-3.5 inline mr-1 text-slate-500" /> Gedung
            </label>
            <select
              id="select-vacancy-building"
              value={filterBuilding}
              onChange={(e) => setFilterBuilding(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-hidden"
            >
              <option value="ALL">Semua Gedung</option>
              {uniqueBuildings.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick summary bar */}
        <div className="flex items-center justify-between text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
          <div className="flex items-center gap-4">
            <span className="font-semibold text-slate-700">
              Waktu Pemeriksaan: <span className="font-mono text-emerald-800">{selectedDay}, {formatTimeRange(customStartTime, customEndTime)}</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 font-bold text-emerald-700">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              {availableCount} Kosong
            </span>
            <span className="inline-flex items-center gap-1.5 font-bold text-rose-700">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              {occupiedCount} Terisi
            </span>
          </div>
        </div>
      </div>

      {/* Grid of Rooms (Section 9) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredResults.map(({ room, isAvailable, occupyingSchedules }) => {
          return (
            <div
              key={room.id}
              className={`rounded-2xl border p-4 shadow-2xs transition-all flex flex-col justify-between ${
                isAvailable
                  ? 'bg-white border-slate-200 hover:border-emerald-400 hover:shadow-xs'
                  : 'bg-rose-50/40 border-rose-200 hover:border-rose-300'
              }`}
            >
              <div>
                {/* Header: Room Name & Status Tag */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                      Ruang {room.nama}
                    </h3>
                    <p className="text-xs text-slate-500">{room.gedung}</p>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
                      isAvailable
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                        : 'bg-rose-100 text-rose-800 border-rose-200'
                    }`}
                  >
                    {isAvailable ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        🟢 Kosong
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3.5 h-3.5 text-rose-600" />
                        🔴 Terisi
                      </>
                    )}
                  </span>
                </div>

                {/* Capacity */}
                <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-3">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span>Kapasitas: {room.kapasitas} Mahasiswa</span>
                </div>

                {/* Occupancy details if occupied */}
                {!isAvailable && occupyingSchedules.length > 0 && (
                  <div className="p-3 rounded-xl bg-white border border-rose-100 space-y-1.5 mb-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-rose-700">
                      Sedang Digunakan Oleh:
                    </p>
                    {occupyingSchedules.map((sch) => (
                      <div
                        key={sch.id}
                        onClick={() => onSelectSchedule(sch)}
                        className="text-xs text-slate-800 hover:text-emerald-700 cursor-pointer transition"
                      >
                        <p className="font-semibold">{sch.mataKuliahNama}</p>
                        <p className="text-[11px] text-slate-500">
                          {sch.kelasNama} • {sch.dosenNama}
                        </p>
                        <p className="text-[10px] font-mono text-rose-600">
                          Jam: {formatTimeRange(sch.jamMulai, sch.jamSelesai)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action: "Gunakan Ruangan Ini" (Section 9) */}
              <div className="pt-2">
                {isAvailable ? (
                  canEditSchedule ? (
                    <button
                      id={`btn-use-room-${room.kode}`}
                      onClick={() =>
                        onUseRoom({
                          hari: selectedDay,
                          jamMulai: customStartTime,
                          jamSelesai: customEndTime,
                          ruangNama: room.nama,
                        })
                      }
                      className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
                    >
                      <PlusCircle className="w-4 h-4" />
                      Gunakan Ruangan Ini
                    </button>
                  ) : (
                    <div className="w-full py-2 px-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium text-center">
                      Ruangan Kosong &amp; Siap Digunakan
                    </div>
                  )
                ) : (
                  <button
                    disabled
                    className="w-full py-2 px-3 bg-slate-100 text-slate-400 rounded-xl text-xs font-medium cursor-not-allowed text-center"
                  >
                    Ruangan Sedang Digunakan
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
