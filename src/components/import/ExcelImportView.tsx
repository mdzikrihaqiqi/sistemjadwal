import React, { useState, useRef } from 'react';
import {
  FileSpreadsheet,
  Upload,
  Download,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Trash2,
  Info,
  Check,
} from 'lucide-react';
import { ImportPreviewRow, Schedule } from '../../types';
import { useAcademic } from '../../context/AcademicContext';
import { parseExcelSchedule, downloadSampleExcelTemplate } from '../../utils/excelParser';
import { formatTimeRange } from '../../utils/timeUtils';

interface ExcelImportViewProps {
  onImportCompleted: () => void;
}

export const ExcelImportView: React.FC<ExcelImportViewProps> = ({ onImportCompleted }) => {
  const { schedules, activeAcademicYearId, importBatchSchedules, addToast } = useAcademic();

  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewRows, setPreviewRows] = useState<ImportPreviewRow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileProcess = async (file: File) => {
    try {
      setIsProcessing(true);
      setSelectedFile(file);
      const parsed = await parseExcelSchedule(file, schedules);
      setPreviewRows(parsed);
      addToast({
        type: 'info',
        title: 'File Excel Dibaca',
        message: `${parsed.length} baris data jadwal berhasil diproses dan divalidasi.`,
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Gagal Membaca File Excel',
        message: err.message || 'Pastikan file berekstensi .xlsx atau .xls dengan format kolom yang sesuai.',
      });
      setSelectedFile(null);
      setPreviewRows([]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileProcess(e.target.files[0]);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewRows([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Counts
  const validRows = previewRows.filter((r) => r.status === 'VALID');
  const conflictRows = previewRows.filter((r) => r.status === 'BENTROK');
  const incompleteRows = previewRows.filter((r) => r.status === 'INCOMPLETE');
  const invalidTimeRows = previewRows.filter((r) => r.status === 'INVALID_TIME');

  // Filtered rows for table view
  const displayedRows = previewRows.filter((r) => {
    if (filterStatus === 'ALL') return true;
    return r.status === filterStatus;
  });

  // Action: "Import & Simpan Jadwal" (Section 4)
  const handleSaveImport = (onlyValid = false) => {
    const targets = onlyValid ? validRows : previewRows.filter((r) => r.status === 'VALID' || r.status === 'BENTROK');

    if (targets.length === 0) {
      addToast({
        type: 'warning',
        title: 'Tidak Ada Data Valid',
        message: 'Tidak ada baris jadwal yang dapat disimpan.',
      });
      return;
    }

    const payload: Omit<Schedule, 'id'>[] = targets.map((r) => ({
      academicYearId: activeAcademicYearId,
      hari: r.hari,
      jamMulai: r.jamMulai,
      jamSelesai: r.jamSelesai,
      mataKuliahNama: r.mataKuliahNama,
      sks: r.sks,
      dosenNama: r.dosenNama,
      ruangNama: r.ruangNama,
      kelasNama: r.kelasNama,
      catatan: 'Diimport dari Excel',
    }));

    importBatchSchedules(payload);
    handleReset();
    onImportCompleted();
  };

  return (
    <div className="space-y-6">
      {/* Header & Template Download */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            Import Jadwal Perkuliahan dari Excel
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Membaca, membersihkan spasi/HTML, menormalisasi jam, mendeteksi bentrok, dan menyimpan ke sistem.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-download-sample-template"
            onClick={downloadSampleExcelTemplate}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-300 transition"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            Download Template Excel
          </button>
        </div>
      </div>

      {/* Format Column Guide (Section 3) */}
      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs text-slate-600">
        <div className="flex items-center gap-2 font-semibold text-slate-800 mb-2">
          <Info className="w-4 h-4 text-blue-600" />
          <span>Format Kolom Excel yang Didukung:</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 font-mono text-[11px]">
          <div className="bg-white p-2 rounded-lg border border-slate-200">
            <strong className="text-slate-900">Hari</strong>
            <p className="text-[10px] text-slate-400">Senin s/d Sabtu</p>
          </div>
          <div className="bg-white p-2 rounded-lg border border-slate-200">
            <strong className="text-slate-900">Jam</strong>
            <p className="text-[10px] text-slate-400">08.00-09.20</p>
          </div>
          <div className="bg-white p-2 rounded-lg border border-slate-200">
            <strong className="text-slate-900">Nama Mata Kuliah</strong>
            <p className="text-[10px] text-slate-400">Teks Mata Kuliah</p>
          </div>
          <div className="bg-white p-2 rounded-lg border border-slate-200">
            <strong className="text-slate-900">SKS</strong>
            <p className="text-[10px] text-slate-400">Angka (2, 3)</p>
          </div>
          <div className="bg-white p-2 rounded-lg border border-slate-200">
            <strong className="text-slate-900">Dosen</strong>
            <p className="text-[10px] text-slate-400">Nama Pengampu</p>
          </div>
          <div className="bg-white p-2 rounded-lg border border-slate-200">
            <strong className="text-slate-900">Ruang</strong>
            <p className="text-[10px] text-slate-400">B1, Aula II</p>
          </div>
          <div className="bg-white p-2 rounded-lg border border-slate-200">
            <strong className="text-slate-900">Kelas</strong>
            <p className="text-[10px] text-slate-400">I MBS, II PBS</p>
          </div>
        </div>
      </div>

      {/* Drag & Drop Box (Section 4) */}
      {!selectedFile ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 md:p-12 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-emerald-500 bg-emerald-50/60'
              : 'border-slate-300 hover:border-emerald-400 bg-white hover:bg-slate-50/50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx, .xls, .csv"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 mx-auto mb-3 shadow-xs">
            <Upload className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800">
            Tarik &amp; Lepaskan File Excel di Sini
          </h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            Mendukung format .xlsx, .xls, atau .csv dari sistem akademik
          </p>
          <button
            id="btn-choose-file"
            type="button"
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-xs transition"
          >
            Pilih File Excel
          </button>
        </div>
      ) : (
        /* File Summary & Action Controls */
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">{selectedFile.name}</h4>
                <p className="text-xs text-slate-500">
                  {(selectedFile.size / 1024).toFixed(1)} KB • {previewRows.length} baris data ditemukan
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="btn-reset-import"
                onClick={handleReset}
                className="flex items-center gap-1.5 px-3 py-2 text-rose-600 hover:bg-rose-50 text-xs font-semibold rounded-xl transition"
              >
                <Trash2 className="w-4 h-4" /> Ganti File
              </button>
              <button
                id="btn-save-import-schedules"
                onClick={() => handleSaveImport(false)}
                disabled={previewRows.length === 0}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                Import &amp; Simpan Jadwal ({validRows.length + conflictRows.length})
              </button>
            </div>
          </div>

          {/* Validation Status Badges Summary (Section 4 & 19) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              id="filter-preview-valid"
              onClick={() => setFilterStatus(filterStatus === 'VALID' ? 'ALL' : 'VALID')}
              className={`p-3 rounded-xl border text-left transition ${
                filterStatus === 'VALID'
                  ? 'bg-emerald-100/70 border-emerald-400 ring-2 ring-emerald-500'
                  : 'bg-emerald-50/50 border-emerald-200 hover:bg-emerald-100/40'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-bold text-emerald-800">
                <span>🟢 Valid</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-black text-emerald-900 mt-1">{validRows.length}</div>
              <p className="text-[10px] text-emerald-700">Siap disimpan</p>
            </button>

            <button
              id="filter-preview-bentrok"
              onClick={() => setFilterStatus(filterStatus === 'BENTROK' ? 'ALL' : 'BENTROK')}
              className={`p-3 rounded-xl border text-left transition ${
                filterStatus === 'BENTROK'
                  ? 'bg-rose-100/70 border-rose-400 ring-2 ring-rose-500'
                  : 'bg-rose-50/50 border-rose-200 hover:bg-rose-100/40'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-bold text-rose-800">
                <span>🔴 Bentrok</span>
                <AlertCircle className="w-4 h-4 text-rose-600" />
              </div>
              <div className="text-xl font-black text-rose-900 mt-1">{conflictRows.length}</div>
              <p className="text-[10px] text-rose-700">Konflik ruang/dosen/kelas</p>
            </button>

            <button
              id="filter-preview-incomplete"
              onClick={() => setFilterStatus(filterStatus === 'INCOMPLETE' ? 'ALL' : 'INCOMPLETE')}
              className={`p-3 rounded-xl border text-left transition ${
                filterStatus === 'INCOMPLETE'
                  ? 'bg-amber-100/70 border-amber-400 ring-2 ring-amber-500'
                  : 'bg-amber-50/50 border-amber-200 hover:bg-amber-100/40'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-bold text-amber-800">
                <span>🟡 Data Tidak Lengkap</span>
                <AlertTriangle className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-xl font-black text-amber-900 mt-1">{incompleteRows.length}</div>
              <p className="text-[10px] text-amber-700">Field kosong</p>
            </button>

            <button
              id="filter-preview-invalid-time"
              onClick={() => setFilterStatus(filterStatus === 'INVALID_TIME' ? 'ALL' : 'INVALID_TIME')}
              className={`p-3 rounded-xl border text-left transition ${
                filterStatus === 'INVALID_TIME'
                  ? 'bg-purple-100/70 border-purple-400 ring-2 ring-purple-500'
                  : 'bg-purple-50/50 border-purple-200 hover:bg-purple-100/40'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-bold text-purple-800">
                <span>🔴 Format Jam Salah</span>
                <Clock className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-xl font-black text-purple-900 mt-1">{invalidTimeRows.length}</div>
              <p className="text-[10px] text-purple-700">Bukan format jam baku</p>
            </button>
          </div>
        </div>
      )}

      {/* Preview Table (Section 4 & 19) */}
      {previewRows.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              Preview Data ({displayedRows.length} dari {previewRows.length} baris)
            </h3>
            {filterStatus !== 'ALL' && (
              <button
                id="btn-show-all-preview"
                onClick={() => setFilterStatus('ALL')}
                className="text-xs text-emerald-600 hover:underline font-semibold"
              >
                Tampilkan Semua Baris
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-3 text-center w-12">No</th>
                  <th className="py-3 px-3">Hari</th>
                  <th className="py-3 px-3">Jam</th>
                  <th className="py-3 px-3">Mata Kuliah</th>
                  <th className="py-3 px-3 text-center">SKS</th>
                  <th className="py-3 px-3">Dosen</th>
                  <th className="py-3 px-3">Ruang</th>
                  <th className="py-3 px-3">Kelas</th>
                  <th className="py-3 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {displayedRows.map((row) => {
                  let statusBadge = (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      🟢 Valid
                    </span>
                  );

                  if (row.status === 'BENTROK') {
                    statusBadge = (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                        🔴 Bentrok
                      </span>
                    );
                  } else if (row.status === 'INCOMPLETE') {
                    statusBadge = (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                        🟡 Data tidak lengkap
                      </span>
                    );
                  } else if (row.status === 'INVALID_TIME') {
                    statusBadge = (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                        🔴 Format jam salah
                      </span>
                    );
                  }

                  return (
                    <tr
                      key={row.rowNumber}
                      className={`hover:bg-slate-50 transition ${
                        row.status === 'BENTROK'
                          ? 'bg-rose-50/30'
                          : row.status === 'INCOMPLETE'
                          ? 'bg-amber-50/30'
                          : row.status === 'INVALID_TIME'
                          ? 'bg-purple-50/30'
                          : ''
                      }`}
                    >
                      <td className="py-2.5 px-3 text-center font-mono text-slate-500">{row.rowNumber}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-800">{row.hari}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-700">
                        {row.jamMulai && row.jamSelesai ? formatTimeRange(row.jamMulai, row.jamSelesai) : row.rawJam}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-900">
                        {row.mataKuliahNama || <span className="text-rose-500 italic">Kosong</span>}
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-slate-700">{row.sks}</td>
                      <td className="py-2.5 px-3 text-slate-700">
                        {row.dosenNama || <span className="text-rose-500 italic">Kosong</span>}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-800">
                        {row.ruangNama || <span className="text-rose-500 italic">Kosong</span>}
                      </td>
                      <td className="py-2.5 px-3 text-slate-700">
                        {row.kelasNama || <span className="text-rose-500 italic">Kosong</span>}
                      </td>
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <div className="flex flex-col items-center gap-1">
                          {statusBadge}
                          {/* Row issue remarks (Section 19) */}
                          {row.errors.map((err, i) => (
                            <span key={i} className="text-[10px] text-rose-600 font-medium">
                              {err}
                            </span>
                          ))}
                          {row.conflicts.map((cnf, i) => (
                            <span key={i} className="text-[10px] text-rose-700 font-semibold">
                              {cnf}
                            </span>
                          ))}
                        </div>
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
