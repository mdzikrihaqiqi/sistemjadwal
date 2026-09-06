import React, { useState } from 'react';
import { useAcademic } from '../../context/AcademicContext';
import { useAuth } from '../../context/AuthContext';
import {
  FileText,
  Printer,
  FileSpreadsheet,
  Building,
  GraduationCap,
  UserCheck,
  Calendar,
  AlertTriangle,
  Download,
  Settings,
  Image as ImageIcon,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Award,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { formatTimeRange } from '../../utils/timeUtils';

export const ReportsView: React.FC = () => {
  const {
    yearSchedules,
    rooms,
    classes,
    lecturers,
    conflicts,
    activeAcademicYear,
    reportSettings,
    updateReportSettings,
  } = useAcademic();

  const { canPrintReports, canEditSettings } = useAuth();

  const [reportType, setReportType] = useState<
    'ALL' | 'ROOM' | 'LECTURER' | 'CLASS' | 'CONFLICT'
  >('ALL');
  const [selectedFilterEntity, setSelectedFilterEntity] = useState<string>('');
  const [isSettingsDrawerOpen, setIsSettingsDrawerOpen] = useState(false);

  // Determine active dataset based on reportType strictly scoped to active academic year
  const getFilteredReportData = () => {
    switch (reportType) {
      case 'ROOM':
        return selectedFilterEntity
          ? yearSchedules.filter((s) => s.ruangNama.toLowerCase() === selectedFilterEntity.toLowerCase())
          : yearSchedules;
      case 'LECTURER':
        return selectedFilterEntity
          ? yearSchedules.filter((s) => s.dosenNama.toLowerCase() === selectedFilterEntity.toLowerCase())
          : yearSchedules;
      case 'CLASS':
        return selectedFilterEntity
          ? yearSchedules.filter((s) => s.kelasNama.toLowerCase() === selectedFilterEntity.toLowerCase())
          : yearSchedules;
      case 'CONFLICT':
        return [];
      case 'ALL':
      default:
        return yearSchedules;
    }
  };

  const currentData = getFilteredReportData();

  // Export to Excel (Section 13)
  const handleExportExcel = () => {
    let sheetData: any[] = [];
    let filename = `Jadwal_Perkuliahan_${activeAcademicYear?.tahun || 'TA'}_${reportType}_${new Date().toISOString().slice(0, 10)}.xlsx`;

    if (reportType === 'CONFLICT') {
      filename = `Laporan_Jadwal_Bentrok_${activeAcademicYear?.tahun || 'TA'}_${new Date().toISOString().slice(0, 10)}.xlsx`;
      sheetData = conflicts.map((c, i) => ({
        No: i + 1,
        'Tahun Akademik': activeAcademicYear?.tahun || '',
        Semester: activeAcademicYear?.semester || '',
        'Jenis Bentrok': c.typeLabel,
        Hari: c.hari,
        Jam: c.jam,
        'Data Terkait': c.entityName,
        Keterangan: c.keterangan,
        'Jadwal 1': `${c.scheduleA?.mataKuliahNama} (${c.scheduleA?.kelasNama})`,
        'Jadwal 2': `${c.scheduleB?.mataKuliahNama} (${c.scheduleB?.kelasNama})`,
      }));
    } else {
      sheetData = currentData.map((s, i) => ({
        No: i + 1,
        'Tahun Akademik': activeAcademicYear?.tahun || '',
        Semester: activeAcademicYear?.semester || '',
        Hari: s.hari,
        'Jam Mulai': s.jamMulai,
        'Jam Selesai': s.jamSelesai,
        'Mata Kuliah': s.mataKuliahNama,
        SKS: s.sks,
        Dosen: s.dosenNama,
        Ruang: s.ruangNama,
        Kelas: s.kelasNama,
        Catatan: s.catatan || '',
      }));
    }

    const worksheet = XLSX.utils.json_to_sheet(sheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Laporan_Jadwal');
    XLSX.writeFile(workbook, filename);
  };

  // Print
  const handlePrint = () => {
    window.print();
  };

  // Calculate formatted date
  const displayDate = reportSettings.tanggalSuratOtomatis
    ? new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : reportSettings.tanggalSuratKustom || new Date().toLocaleDateString('id-ID');

  return (
    <div className="space-y-6">
      {/* Page Header & Action Controls (no-print) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs no-print">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Laporan &amp; Cetak Jadwal Perkuliahan
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Cetak dokumen resmi jadwal perkuliahan lengkap dengan Kop Surat Universitas, Logo, dan Lembar Pengesahan Pejabat (Dekan, Wakil Dekan 1, &amp; Bagian Akademik).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Toggle Pengaturan Kop Surat */}
            <button
              id="btn-toggle-report-settings"
              onClick={() => setIsSettingsDrawerOpen(!isSettingsDrawerOpen)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border transition ${
                isSettingsDrawerOpen
                  ? 'bg-blue-50 border-blue-300 text-blue-700'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Settings className="w-4 h-4 text-blue-600" />
              <span>Pengaturan Kop &amp; Pejabat</span>
              {isSettingsDrawerOpen ? (
                <ChevronUp className="w-3.5 h-3.5 ml-0.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 ml-0.5" />
              )}
            </button>

            {/* Export Excel */}
            <button
              id="btn-export-excel"
              onClick={handleExportExcel}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export Excel</span>
            </button>

            {/* Print Button */}
            {canPrintReports ? (
              <button
                id="btn-print-report"
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak / Simpan PDF</span>
              </button>
            ) : (
              <span className="text-[11px] text-slate-400 bg-slate-100 px-3 py-1.5 rounded-lg">
                Hanya Pimpinan / Admin yang dapat mencetak
              </span>
            )}
          </div>
        </div>

        {/* Quick Settings Drawer for Kop Surat & Pejabat (no-print) */}
        {isSettingsDrawerOpen && (
          <div className="mt-5 pt-5 border-t border-slate-200 bg-slate-50/70 p-4 rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Settings className="w-4 h-4 text-blue-600" />
                Konfigurasi Kop Surat &amp; Pejabat Penandatangan
              </h3>
              <div className="flex items-center gap-3 text-xs">
                <label className="flex items-center gap-1.5 cursor-pointer text-slate-700 font-medium">
                  <input
                    type="checkbox"
                    checked={reportSettings.tampilkanKopSurat}
                    onChange={(e) => updateReportSettings({ tampilkanKopSurat: e.target.checked })}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  Tampilkan Kop Surat
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Nama Kementerian / Lembaga
                </label>
                <input
                  type="text"
                  value={reportSettings.kementerian}
                  onChange={(e) => updateReportSettings({ kementerian: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Nama Universitas / Institut
                </label>
                <input
                  type="text"
                  value={reportSettings.universitas}
                  onChange={(e) => updateReportSettings({ universitas: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Nama Fakultas
                </label>
                <input
                  type="text"
                  value={reportSettings.fakultas}
                  onChange={(e) => updateReportSettings({ fakultas: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Alamat Kampus
                </label>
                <input
                  type="text"
                  value={reportSettings.alamat}
                  onChange={(e) => updateReportSettings({ alamat: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Kontak, Telepon &amp; Email
                </label>
                <input
                  type="text"
                  value={reportSettings.kontak}
                  onChange={(e) => updateReportSettings({ kontak: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  URL Logo Kampus
                </label>
                <input
                  type="text"
                  placeholder="https://... atau biarkan kosong untuk logo resmi"
                  value={reportSettings.logoUrl}
                  onChange={(e) => updateReportSettings({ logoUrl: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200">
              <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                Pejabat Penandatangan Dokumen
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                {/* Dekan */}
                <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1.5">
                  <p className="font-bold text-blue-700 flex items-center gap-1">
                    <Award className="w-3.5 h-3.5" /> Dekan
                  </p>
                  <div>
                    <span className="text-[10px] text-slate-500">Nama Lengkap &amp; Gelar:</span>
                    <input
                      type="text"
                      value={reportSettings.dekanNama}
                      onChange={(e) => updateReportSettings({ dekanNama: e.target.value })}
                      className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500">NIP:</span>
                    <input
                      type="text"
                      value={reportSettings.dekanNip}
                      onChange={(e) => updateReportSettings({ dekanNip: e.target.value })}
                      className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs"
                    />
                  </div>
                </div>

                {/* Wakil Dekan 1 */}
                <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1.5">
                  <p className="font-bold text-purple-700 flex items-center gap-1">
                    <Award className="w-3.5 h-3.5" /> Wakil Dekan I (Akademik)
                  </p>
                  <div>
                    <span className="text-[10px] text-slate-500">Nama Lengkap &amp; Gelar:</span>
                    <input
                      type="text"
                      value={reportSettings.wakilDekan1Nama}
                      onChange={(e) => updateReportSettings({ wakilDekan1Nama: e.target.value })}
                      className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500">NIP:</span>
                    <input
                      type="text"
                      value={reportSettings.wakilDekan1Nip}
                      onChange={(e) => updateReportSettings({ wakilDekan1Nip: e.target.value })}
                      className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs"
                    />
                  </div>
                </div>

                {/* Bagian Akademik */}
                <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-1.5">
                  <p className="font-bold text-emerald-700 flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5" /> Bagian Akademik
                  </p>
                  <div>
                    <span className="text-[10px] text-slate-500">Nama Lengkap &amp; Gelar:</span>
                    <input
                      type="text"
                      value={reportSettings.bagianAkademikNama}
                      onChange={(e) => updateReportSettings({ bagianAkademikNama: e.target.value })}
                      className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs font-semibold"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500">NIP:</span>
                    <input
                      type="text"
                      value={reportSettings.bagianAkademikNip}
                      onChange={(e) => updateReportSettings({ bagianAkademikNip: e.target.value })}
                      className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs text-slate-600">
              <div className="flex items-center gap-3">
                <span>Susunan Tanda Tangan:</span>
                <select
                  value={reportSettings.formatTandaTangan}
                  onChange={(e) =>
                    updateReportSettings({
                      formatTandaTangan: e.target.value as 'TIGA_KOLOM' | 'DUA_KOLOM' | 'SATU_KOLOM',
                    })
                  }
                  className="px-2 py-1 bg-white border border-slate-300 rounded font-semibold text-xs"
                >
                  <option value="TIGA_KOLOM">3 Pejabat (Dekan, Wakil Dekan 1, Bagian Akademik)</option>
                  <option value="DUA_KOLOM">2 Pejabat (Dekan &amp; Bagian Akademik)</option>
                  <option value="SATU_KOLOM">1 Pejabat (Dekan / Bagian Akademik)</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span>Kota Penetapan:</span>
                <input
                  type="text"
                  value={reportSettings.kotaSurat}
                  onChange={(e) => updateReportSettings({ kotaSurat: e.target.value })}
                  className="w-28 px-2 py-1 bg-white border border-slate-300 rounded font-semibold text-xs"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Report Type Selector & Filtering Bar (no-print) */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3 no-print">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Jenis Laporan:
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold">
              <Calendar className="w-3 h-3" />
              TA: {activeAcademicYear?.tahun} ({activeAcademicYear?.semester})
            </span>
          </div>

          <span className="text-xs text-slate-500">
            Total Data Jadwal: <strong>{currentData.length}</strong> entri
          </span>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2 text-xs font-semibold">
          <button
            id="btn-report-type-all"
            onClick={() => {
              setReportType('ALL');
              setSelectedFilterEntity('');
            }}
            className={`px-3 py-1.5 rounded-lg transition ${
              reportType === 'ALL'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Semua Jadwal ({yearSchedules.length})
          </button>

          <button
            id="btn-report-type-room"
            onClick={() => {
              setReportType('ROOM');
              if (!selectedFilterEntity && rooms.length > 0) setSelectedFilterEntity(rooms[0].nama);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
              reportType === 'ROOM'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Building className="w-3.5 h-3.5" /> Per Ruangan
          </button>

          <button
            id="btn-report-type-lecturer"
            onClick={() => {
              setReportType('LECTURER');
              if (!selectedFilterEntity && lecturers.length > 0)
                setSelectedFilterEntity(lecturers[0].nama);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
              reportType === 'LECTURER'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" /> Per Dosen
          </button>

          <button
            id="btn-report-type-class"
            onClick={() => {
              setReportType('CLASS');
              if (!selectedFilterEntity && classes.length > 0)
                setSelectedFilterEntity(classes[0].nama);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
              reportType === 'CLASS'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" /> Per Kelas
          </button>

          <button
            id="btn-report-type-conflict"
            onClick={() => {
              setReportType('CONFLICT');
              setSelectedFilterEntity('');
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
              reportType === 'CONFLICT'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" /> Jadwal Bentrok ({conflicts.length})
          </button>
        </div>

        {/* Dynamic sub selector */}
        {reportType === 'ROOM' && (
          <div className="flex items-center gap-2 pt-1">
            <span className="text-xs font-bold text-slate-500 uppercase">Pilih Ruangan:</span>
            <select
              value={selectedFilterEntity}
              onChange={(e) => setSelectedFilterEntity(e.target.value)}
              className="px-3 py-1 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold"
            >
              {rooms.map((r) => (
                <option key={r.id} value={r.nama}>
                  Ruang {r.nama} ({r.gedung})
                </option>
              ))}
            </select>
          </div>
        )}

        {reportType === 'LECTURER' && (
          <div className="flex items-center gap-2 pt-1">
            <span className="text-xs font-bold text-slate-500 uppercase">Pilih Dosen:</span>
            <select
              value={selectedFilterEntity}
              onChange={(e) => setSelectedFilterEntity(e.target.value)}
              className="px-3 py-1 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold"
            >
              {lecturers.map((l) => (
                <option key={l.id} value={l.nama}>
                  {l.nama} ({l.prodi})
                </option>
              ))}
            </select>
          </div>
        )}

        {reportType === 'CLASS' && (
          <div className="flex items-center gap-2 pt-1">
            <span className="text-xs font-bold text-slate-500 uppercase">Pilih Kelas:</span>
            <select
              value={selectedFilterEntity}
              onChange={(e) => setSelectedFilterEntity(e.target.value)}
              className="px-3 py-1 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.nama}>
                  {c.nama} ({c.prodi})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Printable Sheet View (Document Layout) */}
      <div
        id="printable-report-sheet"
        className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 md:p-10 print:p-0 print:border-none print:shadow-none"
      >
        {/* Document Header (Letterhead / Kop Surat) */}
        {reportSettings.tampilkanKopSurat && (
          <div className="border-b-4 border-double border-slate-900 pb-4 mb-6">
            <div className="flex items-center justify-between gap-4">
              {/* University Logo */}
              <div className="w-24 h-24 shrink-0 flex items-center justify-center">
                {reportSettings.logoUrl ? (
                  <img
                    src={reportSettings.logoUrl}
                    alt="Logo Kampus"
                    className="max-h-24 max-w-24 object-contain"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full border-2 border-slate-900 flex flex-col items-center justify-center p-1 bg-slate-50">
                    <Award className="w-8 h-8 text-slate-800" />
                    <span className="text-[7px] font-black text-slate-900 tracking-tighter uppercase text-center mt-0.5">
                      SEAL OF EXCELLENCE
                    </span>
                  </div>
                )}
              </div>

              {/* Text Header */}
              <div className="flex-1 text-center space-y-0.5">
                <h1 className="text-xs sm:text-sm font-bold text-slate-900 tracking-wide uppercase">
                  {reportSettings.kementerian}
                </h1>
                <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight uppercase leading-snug">
                  {reportSettings.universitas}
                </h2>
                <h3 className="text-xs sm:text-sm font-bold text-slate-800 uppercase tracking-tight">
                  {reportSettings.fakultas}
                </h3>
                {reportSettings.bagian && (
                  <p className="text-[11px] font-semibold text-slate-700 uppercase">
                    {reportSettings.bagian}
                  </p>
                )}
                <p className="text-[10px] text-slate-600 leading-tight pt-0.5">
                  {reportSettings.alamat}
                </p>
                <p className="text-[10px] text-slate-600 leading-tight">
                  {reportSettings.kontak} {reportSettings.email && `• Email: ${reportSettings.email}`}{' '}
                  {reportSettings.website && `• Web: ${reportSettings.website}`}
                </p>
              </div>

              {/* Balance spacer */}
              <div className="w-24 hidden sm:block shrink-0" />
            </div>
          </div>
        )}

        {/* Title of the Report */}
        <div className="text-center mb-6 space-y-1">
          <h4 className="text-sm sm:text-base font-extrabold text-slate-900 uppercase tracking-wide">
            {reportType === 'CONFLICT'
              ? 'LAPORAN REKAPITULASI BENTROK JADWAL PERKULIAHAN'
              : 'JADWAL PERKULIAHAN MAHASISWA'}
          </h4>
          <p className="text-xs font-bold text-slate-800 uppercase">
            TAHUN AKADEMIK {activeAcademicYear?.tahun || '2026/2027'} • SEMESTER{' '}
            {activeAcademicYear?.semester || 'GANJIL'}
          </p>
          {selectedFilterEntity && (
            <p className="text-xs font-semibold text-slate-700 inline-block px-3 py-0.5 bg-slate-100 rounded-full mt-1 border border-slate-200">
              Filter: <strong>{selectedFilterEntity}</strong>
            </p>
          )}
        </div>

        {/* Document Content Table */}
        {reportType === 'CONFLICT' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse border border-slate-300">
              <thead className="bg-slate-100 text-slate-900 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-2 px-3 border border-slate-300 text-center w-10">No</th>
                  <th className="py-2 px-3 border border-slate-300">Jenis Bentrok</th>
                  <th className="py-2 px-3 border border-slate-300">Hari &amp; Jam</th>
                  <th className="py-2 px-3 border border-slate-300">Objek Terkait</th>
                  <th className="py-2 px-3 border border-slate-300">Keterangan Bentrok</th>
                </tr>
              </thead>
              <tbody>
                {conflicts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500 font-medium">
                      Tidak ada jadwal bentrok pada Tahun Akademik {activeAcademicYear?.tahun}.
                    </td>
                  </tr>
                ) : (
                  conflicts.map((c, idx) => (
                    <tr key={idx} className="border-b border-slate-200">
                      <td className="py-2 px-3 border border-slate-300 text-center font-mono">
                        {idx + 1}
                      </td>
                      <td className="py-2 px-3 border border-slate-300 font-bold text-rose-700">
                        {c.typeLabel}
                      </td>
                      <td className="py-2 px-3 border border-slate-300 font-mono">
                        {c.hari}, {c.jam}
                      </td>
                      <td className="py-2 px-3 border border-slate-300 font-semibold">
                        {c.entityName}
                      </td>
                      <td className="py-2 px-3 border border-slate-300 text-slate-700">
                        {c.keterangan}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse border border-slate-300">
              <thead className="bg-slate-100 text-slate-900 font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-2 px-3 border border-slate-300 text-center w-10">No</th>
                  <th className="py-2 px-3 border border-slate-300 text-center">Hari</th>
                  <th className="py-2 px-3 border border-slate-300 text-center">Waktu</th>
                  <th className="py-2 px-3 border border-slate-300">Mata Kuliah</th>
                  <th className="py-2 px-3 border border-slate-300 text-center">SKS</th>
                  <th className="py-2 px-3 border border-slate-300">Dosen Pengampu</th>
                  <th className="py-2 px-3 border border-slate-300 text-center">Ruang</th>
                  <th className="py-2 px-3 border border-slate-300 text-center">Kelas</th>
                </tr>
              </thead>
              <tbody>
                {currentData.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-500 font-medium">
                      Belum ada jadwal terdaftar untuk Tahun Akademik {activeAcademicYear?.tahun} ({activeAcademicYear?.semester}).
                    </td>
                  </tr>
                ) : (
                  currentData.map((s, idx) => (
                    <tr key={s.id} className="border-b border-slate-200 hover:bg-slate-50/50">
                      <td className="py-2 px-3 border border-slate-300 text-center font-mono">
                        {idx + 1}
                      </td>
                      <td className="py-2 px-3 border border-slate-300 font-semibold text-center">
                        {s.hari}
                      </td>
                      <td className="py-2 px-3 border border-slate-300 font-mono text-center whitespace-nowrap">
                        {formatTimeRange(s.jamMulai, s.jamSelesai)}
                      </td>
                      <td className="py-2 px-3 border border-slate-300 font-bold text-slate-900">
                        {s.mataKuliahNama}
                      </td>
                      <td className="py-2 px-3 border border-slate-300 text-center">{s.sks}</td>
                      <td className="py-2 px-3 border border-slate-300">{s.dosenNama}</td>
                      <td className="py-2 px-3 border border-slate-300 text-center font-bold">
                        {s.ruangNama}
                      </td>
                      <td className="py-2 px-3 border border-slate-300 font-semibold text-center">
                        {s.kelasNama}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Lembar Tanda Tangan Pejabat (Dekan, Wakil Dekan 1, Bagian Akademik) */}
        <div className="mt-12 text-xs text-slate-900 break-inside-avoid">
          <div className="flex justify-end mb-4">
            <p className="text-right">
              {reportSettings.kotaSurat}, {displayDate}
            </p>
          </div>

          {reportSettings.formatTandaTangan === 'TIGA_KOLOM' ? (
            /* 3 Kolom: Dekan, Wakil Dekan 1, Bagian Akademik */
            <div className="grid grid-cols-3 gap-4 text-center">
              {/* Kolom 1: Mengetahui Dekan */}
              <div className="flex flex-col justify-between h-40">
                <div>
                  <p className="text-slate-600">Mengetahui,</p>
                  <p className="font-bold uppercase tracking-tight">{reportSettings.dekanJabatan || 'Dekan'}</p>
                </div>
                <div>
                  <p className="font-bold underline">{reportSettings.dekanNama}</p>
                  <p className="text-[10px] text-slate-600">NIP. {reportSettings.dekanNip}</p>
                </div>
              </div>

              {/* Kolom 2: Menyetujui Wakil Dekan 1 */}
              <div className="flex flex-col justify-between h-40">
                <div>
                  <p className="text-slate-600">Menyetujui,</p>
                  <p className="font-bold uppercase tracking-tight">
                    {reportSettings.wakilDekan1Jabatan || 'Wakil Dekan I'}
                  </p>
                </div>
                <div>
                  <p className="font-bold underline">{reportSettings.wakilDekan1Nama}</p>
                  <p className="text-[10px] text-slate-600">NIP. {reportSettings.wakilDekan1Nip}</p>
                </div>
              </div>

              {/* Kolom 3: Bagian Akademik */}
              <div className="flex flex-col justify-between h-40">
                <div>
                  <p className="text-slate-600">Pelaksana,</p>
                  <p className="font-bold uppercase tracking-tight">
                    {reportSettings.bagianAkademikJabatan || 'Bagian Akademik'}
                  </p>
                </div>
                <div>
                  <p className="font-bold underline">{reportSettings.bagianAkademikNama}</p>
                  <p className="text-[10px] text-slate-600">NIP. {reportSettings.bagianAkademikNip}</p>
                </div>
              </div>
            </div>
          ) : reportSettings.formatTandaTangan === 'DUA_KOLOM' ? (
            /* 2 Kolom: Dekan & Bagian Akademik */
            <div className="grid grid-cols-2 gap-8 text-center">
              <div className="flex flex-col justify-between h-36">
                <div>
                  <p className="text-slate-600">Mengetahui,</p>
                  <p className="font-bold uppercase tracking-tight">{reportSettings.dekanJabatan || 'Dekan'}</p>
                </div>
                <div>
                  <p className="font-bold underline">{reportSettings.dekanNama}</p>
                  <p className="text-[10px] text-slate-600">NIP. {reportSettings.dekanNip}</p>
                </div>
              </div>

              <div className="flex flex-col justify-between h-36">
                <div>
                  <p className="text-slate-600">Penanggung Jawab,</p>
                  <p className="font-bold uppercase tracking-tight">
                    {reportSettings.bagianAkademikJabatan || 'Bagian Akademik'}
                  </p>
                </div>
                <div>
                  <p className="font-bold underline">{reportSettings.bagianAkademikNama}</p>
                  <p className="text-[10px] text-slate-600">NIP. {reportSettings.bagianAkademikNip}</p>
                </div>
              </div>
            </div>
          ) : (
            /* 1 Kolom: Bagian Akademik / Dekan */
            <div className="flex justify-end">
              <div className="text-center flex flex-col justify-between h-36 w-64">
                <div>
                  <p className="text-slate-600">Mengetahui,</p>
                  <p className="font-bold uppercase tracking-tight">{reportSettings.dekanJabatan || 'Dekan'}</p>
                </div>
                <div>
                  <p className="font-bold underline">{reportSettings.dekanNama}</p>
                  <p className="text-[10px] text-slate-600">NIP. {reportSettings.dekanNip}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
