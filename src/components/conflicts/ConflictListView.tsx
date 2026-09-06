import React from 'react';
import { useAcademic } from '../../context/AcademicContext';
import { ConflictDetail, Schedule } from '../../types';
import { AlertOctagon, CheckCircle2, Wrench, ShieldAlert, Calendar, Clock } from 'lucide-react';

interface ConflictListViewProps {
  onFixSchedule: (schedule: Schedule) => void;
  onSelectSchedule: (schedule: Schedule) => void;
}

export const ConflictListView: React.FC<ConflictListViewProps> = ({
  onFixSchedule,
  onSelectSchedule,
}) => {
  const { conflicts } = useAcademic();

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <AlertOctagon className="w-5 h-5 text-rose-600" />
            Daftar Jadwal Bentrok Terdeteksi
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Mendeteksi bentrokan ruangan, dosen pengampu ganda, dan jadwal kelas tumpang tindih.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 ${
              conflicts.length > 0
                ? 'bg-rose-50 text-rose-800 border-rose-200'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
            }`}
          >
            {conflicts.length > 0 ? (
              <>
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                {conflicts.length} Bentrok Perlu Tindakan
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Semua Jadwal Bebas Bentrok
              </>
            )}
          </span>
        </div>
      </div>

      {/* Empty State */}
      {conflicts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-2xs space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Tidak Ada Bentrok Jadwal</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Semua jadwal perkuliahan pada semester aktif ini memiliki alokasi ruangan, dosen, dan waktu yang valid tanpa tumpang tindih.
          </p>
        </div>
      ) : (
        /* Conflict Table (Section 15) */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-900 text-white font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-3 text-center w-12">No</th>
                  <th className="py-3 px-3">Jenis Bentrok</th>
                  <th className="py-3 px-3">Hari</th>
                  <th className="py-3 px-3">Jam</th>
                  <th className="py-3 px-3">Data Terkait</th>
                  <th className="py-3 px-3">Keterangan Bentrok</th>
                  <th className="py-3 px-3 text-center w-28">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {conflicts.map((conflict, index) => {
                  let typeColor = 'bg-rose-100 text-rose-800 border-rose-200';
                  if (conflict.type === 'DOSEN') typeColor = 'bg-purple-100 text-purple-800 border-purple-200';
                  if (conflict.type === 'KELAS') typeColor = 'bg-amber-100 text-amber-800 border-amber-200';

                  return (
                    <tr key={conflict.id || index} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-3 text-center font-mono font-bold text-slate-500">
                        {index + 1}
                      </td>

                      <td className="py-3.5 px-3">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${typeColor}`}>
                          {conflict.typeLabel}
                        </span>
                      </td>

                      <td className="py-3.5 px-3 font-semibold text-slate-800">
                        {conflict.hari}
                      </td>

                      <td className="py-3.5 px-3 font-mono text-slate-700 whitespace-nowrap">
                        {conflict.jam}
                      </td>

                      <td className="py-3.5 px-3 font-bold text-slate-900">
                        {conflict.entityName}
                      </td>

                      <td className="py-3.5 px-3 text-slate-600 leading-relaxed max-w-md">
                        <p>{conflict.keterangan}</p>
                        <div className="mt-1 flex flex-wrap gap-2 text-[10px] text-slate-500 font-mono">
                          <button
                            type="button"
                            onClick={() => conflict.scheduleA && onSelectSchedule(conflict.scheduleA)}
                            className="underline hover:text-emerald-700"
                          >
                            [1] {conflict.scheduleA?.mataKuliahNama} ({conflict.scheduleA?.kelasNama})
                          </button>
                          <span>vs</span>
                          <button
                            type="button"
                            onClick={() => conflict.scheduleB && onSelectSchedule(conflict.scheduleB)}
                            className="underline hover:text-emerald-700"
                          >
                            [2] {conflict.scheduleB?.mataKuliahNama} ({conflict.scheduleB?.kelasNama})
                          </button>
                        </div>
                      </td>

                      <td className="py-3.5 px-3 text-center">
                        <button
                          id={`btn-fix-conflict-${index}`}
                          type="button"
                          onClick={() => {
                            // Open editor for schedule A or B
                            if (conflict.scheduleA) onFixSchedule(conflict.scheduleA);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition"
                        >
                          <Wrench className="w-3.5 h-3.5" />
                          Perbaiki
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
