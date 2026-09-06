import React from 'react';
import { AlertOctagon, ArrowLeft, CheckCircle } from 'lucide-react';
import { ConflictDetail } from '../../types';
import { Modal } from './Modal';

interface ConflictModalProps {
  isOpen: boolean;
  conflicts: ConflictDetail[];
  onClose: () => void;
  onForceSave?: () => void;
  id?: string;
}

export const ConflictModal: React.FC<ConflictModalProps> = ({
  isOpen,
  conflicts,
  onClose,
  onForceSave,
  id = 'conflict-warning-modal',
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="⚠️ Jadwal Bentrok Terdeteksi"
      subtitle="Sistem menemukan bentrokan dengan jadwal yang sudah ada."
      maxWidth="lg"
      id={id}
    >
      <div className="space-y-4">
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3">
          <AlertOctagon className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-sm text-rose-900 leading-relaxed">
            <span className="font-semibold">Perhatian Akademik:</span> Jadwal yang Anda coba simpan
            memiliki {conflicts.length} bentrok waktu, ruangan, dosen, atau kelas. Harap periksa rincian di bawah.
          </div>
        </div>

        <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
          {conflicts.map((conflict, idx) => {
            let badgeColor = 'bg-rose-100 text-rose-800 border-rose-200';
            if (conflict.type === 'DOSEN') badgeColor = 'bg-purple-100 text-purple-800 border-purple-200';
            if (conflict.type === 'KELAS') badgeColor = 'bg-amber-100 text-amber-800 border-amber-200';

            return (
              <div
                key={conflict.id || idx}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white transition"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badgeColor}`}>
                    {conflict.typeLabel}
                  </span>
                  <span className="text-xs font-mono font-medium text-slate-500">
                    {conflict.hari}, {conflict.jam}
                  </span>
                </div>
                <h5 className="text-sm font-semibold text-slate-800 mb-1">
                  Objek: {conflict.entityName}
                </h5>
                <p className="text-xs text-slate-600 leading-relaxed">{conflict.keterangan}</p>

                {conflict.scheduleB && (
                  <div className="mt-2.5 pt-2.5 border-t border-slate-200 text-xs text-slate-500 flex flex-wrap gap-x-4 gap-y-1">
                    <span>
                      <strong>Jadwal Existing:</strong> {conflict.scheduleB.mataKuliahNama} ({conflict.scheduleB.kelasNama})
                    </span>
                    <span>
                      <strong>Ruang:</strong> {conflict.scheduleB.ruangNama}
                    </span>
                    <span>
                      <strong>Dosen:</strong> {conflict.scheduleB.dosenNama}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
          {onForceSave && (
            <button
              id="btn-force-save-conflict"
              type="button"
              onClick={() => {
                onForceSave();
                onClose();
              }}
              className="text-xs text-slate-500 hover:text-rose-700 underline font-medium"
            >
              Tetap Simpan (Abaikan Bentrok)
            </button>
          )}

          <div className="flex items-center gap-2 ml-auto">
            <button
              id="btn-back-and-fix"
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-xl shadow-xs transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali &amp; Perbaiki
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
