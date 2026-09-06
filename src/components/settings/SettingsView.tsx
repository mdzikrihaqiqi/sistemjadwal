import React, { useState, useRef } from 'react';
import { useAcademic } from '../../context/AcademicContext';
import { useAuth } from '../../context/AuthContext';
import { DEFAULT_TIME_SLOTS } from '../../utils/matrixUtils';
import { ReportSettings, UserRole } from '../../types';
import {
  Settings,
  Clock,
  Plus,
  Trash2,
  RotateCcw,
  ShieldAlert,
  Save,
  CheckCircle,
  FileText,
  Users,
  Award,
  BookOpen,
  GraduationCap,
  ShieldCheck,
  Building,
  Image as ImageIcon,
  Eye,
  Sparkles,
  Cloud,
  CloudUpload,
  CloudDownload,
  Download,
  Upload,
  Loader2,
  Check,
  RefreshCw,
  Smartphone,
  Laptop,
} from 'lucide-react';
import { ConfirmDialog } from '../common/ConfirmDialog';

export const SettingsView: React.FC = () => {
  const {
    timeSlots,
    updateTimeSlots,
    resetToDemoData,
    addToast,
    reportSettings,
    updateReportSettings,
    schedules,
    isCloudConnected,
    isCloudSyncing,
    syncLocalToCloud,
    fetchFromCloud,
    exportBackupJson,
    importBackupJson,
  } = useAcademic();

  const { currentUser, users, canEditSettings, updateAdminPassword } = useAuth();

  const [activeTab, setActiveTab] = useState<'kop' | 'rbac' | 'slots' | 'maintenance'>('kop');

  // Local state for Kop Surat form
  const [formData, setFormData] = useState<ReportSettings>(reportSettings);
  const [isSavedRecently, setIsSavedRecently] = useState(false);

  // Slot states
  const [localSlots, setLocalSlots] = useState(timeSlots);
  const [newSlotLabel, setNewSlotLabel] = useState('');
  const [newSlotStart, setNewSlotStart] = useState('17:00');
  const [newSlotEnd, setNewSlotEnd] = useState('18:20');
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isRestoringJson, setIsRestoringJson] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsRestoringJson(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        await importBackupJson(text);
      } catch {
        addToast({
          type: 'error',
          title: 'Gagal Membaca File',
          message: 'File cadangan tidak dapat diproses.',
        });
      } finally {
        setIsRestoringJson(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  const handleSaveReportSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateReportSettings(formData);
    setIsSavedRecently(true);
    setTimeout(() => setIsSavedRecently(false), 3000);
    addToast({
      type: 'success',
      title: 'Pengaturan Disimpan',
      message: 'Kop Surat dan Pejabat Penandatangan berhasil diperbarui untuk semua laporan.',
    });
  };

  const handleResetKopDefault = () => {
    const defaultKop: Partial<ReportSettings> = {
      kementerian: 'KEMENTERIAN PENDIDIKAN TINGGI, SAINS, DAN TEKNOLOGI',
      universitas: 'UNIVERSITAS ISLAM NEGERI SUNAN GUNUNG DJATI',
      fakultas: 'FAKULTAS EKONOMI DAN BISNIS ISLAM',
      bagian: 'BAGIAN ADMINISTRASI AKADEMIK & KEMAHASISWAAN',
      alamat: 'Jl. A.H. Nasution No. 105, Cipadung, Cibiru, Kota Bandung, Jawa Barat 40614',
      kontak: 'Telp: (022) 7800525 • Fax: (022) 7803936',
      email: 'akademik.febi@uinsgd.ac.id',
      website: 'https://febi.uinsgd.ac.id',
      dekanNama: 'Prof. Dr. H. M. Zainuddin, M.A.',
      dekanNip: '197405121998031002',
      dekanJabatan: 'Dekan Fakultas Ekonomi dan Bisnis Islam',
      wakilDekan1Nama: 'Dr. H. Dading Z Ibrahim, M.M.Pd',
      wakilDekan1Nip: '197808152003121001',
      wakilDekan1Jabatan: 'Wakil Dekan I Bidang Akademik & Kelembagaan',
      bagianAkademikNama: 'Drs. Ahmad Fauzi, M.Kom.',
      bagianAkademikNip: '198008142005011003',
      bagianAkademikJabatan: 'Kepala Bagian Administrasi Akademik & Kemahasiswaan',
      kotaSurat: 'Bandung',
      tampilkanKopSurat: true,
      formatTandaTangan: 'TIGA_KOLOM',
    };
    setFormData((prev) => ({ ...prev, ...defaultKop }));
    updateReportSettings(defaultKop);
    addToast({
      type: 'info',
      title: 'Kop Surat Direset',
      message: 'Format kop surat dikembalikan ke identitas default UIN SGD.',
    });
  };

  const handleAddSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlotLabel.trim()) return;

    const newSlot = {
      id: `ts-${Date.now()}`,
      label: newSlotLabel.trim(),
      jamMulai: newSlotStart,
      jamSelesai: newSlotEnd,
    };

    const updated = [...localSlots, newSlot];
    setLocalSlots(updated);
    updateTimeSlots(updated);
    setNewSlotLabel('');
    addToast({
      type: 'success',
      title: 'Slot Waktu Ditambahkan',
      message: `Slot ${newSlot.label} (${newSlot.jamMulai}-${newSlot.jamSelesai}) berhasil disimpan.`,
    });
  };

  const handleDeleteSlot = (id: string) => {
    const updated = localSlots.filter((s) => s.id !== id);
    setLocalSlots(updated);
    updateTimeSlots(updated);
    addToast({
      type: 'info',
      title: 'Slot Waktu Dihapus',
      message: 'Slot perkuliahan telah diperbarui.',
    });
  };

  const handleRestoreDefaultSlots = () => {
    setLocalSlots(DEFAULT_TIME_SLOTS);
    updateTimeSlots(DEFAULT_TIME_SLOTS);
    addToast({
      type: 'success',
      title: 'Slot Waktu Direset',
      message: 'Slot perkuliahan kembali ke pengaturan default kampus.',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-600" />
          Pengaturan Sistem &amp; Laporan Akademik
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Konfigurasi Kop Surat Laporan, Pejabat Penandatangan (Dekan, Wakil Dekan 1, Bagian Akademik), Hak Akses (RBAC), dan Slot Waktu Perkuliahan.
        </p>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-100">
          <button
            id="tab-settings-kop"
            onClick={() => setActiveTab('kop')}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl transition ${
              activeTab === 'kop'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Kop Surat &amp; Pejabat Penandatangan</span>
          </button>

          <button
            id="tab-settings-rbac"
            onClick={() => setActiveTab('rbac')}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl transition ${
              activeTab === 'rbac'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Hak Akses &amp; Akun Pengguna (RBAC)</span>
          </button>

          <button
            id="tab-settings-slots"
            onClick={() => setActiveTab('slots')}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl transition ${
              activeTab === 'slots'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Slot Waktu Perkuliahan</span>
          </button>

          <button
            id="tab-settings-maintenance"
            onClick={() => setActiveTab('maintenance')}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl transition ${
              activeTab === 'maintenance'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Pemeliharaan Data</span>
          </button>
        </div>
      </div>

      {/* TAB 1: KOP SURAT & PEJABAT */}
      {activeTab === 'kop' && (
        <form onSubmit={handleSaveReportSettings} className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Building className="w-4 h-4 text-blue-600" />
                  Identitas Lembaga &amp; Kop Surat Resmi
                </h3>
                <p className="text-xs text-slate-500">
                  Data ini dicetak pada bagian atas setiap lembar jadwal dan laporan resmi.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetKopDefault}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
                >
                  Reset Standar UIN
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
                >
                  <Save className="w-3.5 h-3.5" />
                  Simpan Perubahan
                </button>
              </div>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Kementerian / Instansi Induk
                </label>
                <input
                  type="text"
                  value={formData.kementerian}
                  onChange={(e) => setFormData({ ...formData, kementerian: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Nama Universitas / Institut
                </label>
                <input
                  type="text"
                  value={formData.universitas}
                  onChange={(e) => setFormData({ ...formData, universitas: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Fakultas
                </label>
                <input
                  type="text"
                  value={formData.fakultas}
                  onChange={(e) => setFormData({ ...formData, fakultas: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Bagian / Biro Akademik
                </label>
                <input
                  type="text"
                  value={formData.bagian || ''}
                  onChange={(e) => setFormData({ ...formData, bagian: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Alamat Kampus
                </label>
                <input
                  type="text"
                  value={formData.alamat}
                  onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Kontak (Telp / Fax)
                </label>
                <input
                  type="text"
                  value={formData.kontak}
                  onChange={(e) => setFormData({ ...formData, kontak: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Email Resmi &amp; Website
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="Email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-1/2 px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
                  />
                  <input
                    type="text"
                    placeholder="https://..."
                    value={formData.website || ''}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="w-1/2 px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Logo Kampus (URL Gambar)
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    placeholder="https://... atau biarkan kosong untuk segel resmi"
                    value={formData.logoUrl || ''}
                    onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
                  />
                  {formData.logoUrl && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, logoUrl: '' })}
                      className="px-2.5 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-lg border border-rose-200"
                    >
                      Hapus URL
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Jika URL kosong, sistem secara otomatis menampilkan lencana segel institusi resmi.
                </p>
              </div>
            </div>
          </div>

          {/* Pejabat Penandatangan */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="pb-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Award className="w-4 h-4 text-purple-600" />
                  Pejabat Penandatangan Lembar Pengesahan
                </h3>
                <p className="text-xs text-slate-500">
                  Data Dekan, Wakil Dekan 1 Bidang Akademik, dan Kepala Bagian Akademik.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <label className="font-semibold text-slate-700">Susunan Pejabat:</label>
                <select
                  value={formData.formatTandaTangan}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      formatTandaTangan: e.target.value as 'TIGA_KOLOM' | 'DUA_KOLOM' | 'SATU_KOLOM',
                    })
                  }
                  className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-bold text-xs"
                >
                  <option value="TIGA_KOLOM">3 Pejabat (Dekan, Wadek 1, Bag. Akademik)</option>
                  <option value="DUA_KOLOM">2 Pejabat (Dekan &amp; Bag. Akademik)</option>
                  <option value="SATU_KOLOM">1 Pejabat (Dekan / Bag. Akademik)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {/* 1. Dekan */}
              <div className="bg-blue-50/40 p-4 rounded-xl border border-blue-200/60 space-y-3">
                <div className="flex items-center gap-2 font-bold text-blue-900 border-b border-blue-200/60 pb-2">
                  <Award className="w-4 h-4 text-blue-600" />
                  <span>Dekan Fakultas</span>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                    Nama Lengkap &amp; Gelar
                  </label>
                  <input
                    type="text"
                    value={formData.dekanNama}
                    onChange={(e) => setFormData({ ...formData, dekanNama: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                    NIP / NIDN
                  </label>
                  <input
                    type="text"
                    value={formData.dekanNip}
                    onChange={(e) => setFormData({ ...formData, dekanNip: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                    Jabatan Struktural
                  </label>
                  <input
                    type="text"
                    value={formData.dekanJabatan || ''}
                    onChange={(e) => setFormData({ ...formData, dekanJabatan: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              {/* 2. Wakil Dekan 1 */}
              <div className="bg-purple-50/40 p-4 rounded-xl border border-purple-200/60 space-y-3">
                <div className="flex items-center gap-2 font-bold text-purple-900 border-b border-purple-200/60 pb-2">
                  <Award className="w-4 h-4 text-purple-600" />
                  <span>Wakil Dekan 1 (Akademik)</span>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                    Nama Lengkap &amp; Gelar
                  </label>
                  <input
                    type="text"
                    value={formData.wakilDekan1Nama}
                    onChange={(e) => setFormData({ ...formData, wakilDekan1Nama: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                    NIP / NIDN
                  </label>
                  <input
                    type="text"
                    value={formData.wakilDekan1Nip}
                    onChange={(e) => setFormData({ ...formData, wakilDekan1Nip: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                    Jabatan Struktural
                  </label>
                  <input
                    type="text"
                    value={formData.wakilDekan1Jabatan || ''}
                    onChange={(e) => setFormData({ ...formData, wakilDekan1Jabatan: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              {/* 3. Bagian Akademik */}
              <div className="bg-emerald-50/40 p-4 rounded-xl border border-emerald-200/60 space-y-3">
                <div className="flex items-center gap-2 font-bold text-emerald-900 border-b border-emerald-200/60 pb-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Bagian Akademik (Admin)</span>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                    Nama Lengkap &amp; Gelar
                  </label>
                  <input
                    type="text"
                    value={formData.bagianAkademikNama}
                    onChange={(e) => setFormData({ ...formData, bagianAkademikNama: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                    NIP / NIDN
                  </label>
                  <input
                    type="text"
                    value={formData.bagianAkademikNip}
                    onChange={(e) => setFormData({ ...formData, bagianAkademikNip: e.target.value })}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">
                    Jabatan Struktural
                  </label>
                  <input
                    type="text"
                    value={formData.bagianAkademikJabatan || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, bagianAkademikJabatan: e.target.value })
                    }
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-700">Kota Surat:</span>
                <input
                  type="text"
                  value={formData.kotaSurat}
                  onChange={(e) => setFormData({ ...formData, kotaSurat: e.target.value })}
                  className="w-36 px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold"
                />
              </div>

              <button
                type="submit"
                id="btn-save-report-settings"
                className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Semua Pengaturan Kop &amp; Pejabat</span>
              </button>
            </div>
          </div>

          {/* Live Preview Box */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
              <Eye className="w-4 h-4 text-blue-600" />
              <span>Pratinjau Langsung (Live Preview) Kop Surat &amp; Tanda Tangan</span>
            </div>

            <div className="p-6 bg-slate-50 border border-slate-300 rounded-xl space-y-4">
              {/* Kop */}
              <div className="border-b-4 border-double border-slate-900 pb-3 text-center space-y-0.5">
                <p className="text-[11px] font-bold text-slate-900 uppercase">{formData.kementerian}</p>
                <p className="text-sm font-extrabold text-slate-900 uppercase">{formData.universitas}</p>
                <p className="text-xs font-bold text-slate-800 uppercase">{formData.fakultas}</p>
                {formData.bagian && <p className="text-[10px] font-semibold text-slate-700 uppercase">{formData.bagian}</p>}
                <p className="text-[9px] text-slate-600">{formData.alamat}</p>
                <p className="text-[9px] text-slate-600">{formData.kontak}</p>
              </div>

              {/* Sample Table */}
              <div className="border border-slate-300 rounded bg-white p-2 text-center text-xs text-slate-400">
                [ Isi Tabel Jadwal Perkuliahan Mahasiswa ]
              </div>

              {/* Signatures */}
              <div className="pt-2 text-xs text-slate-900">
                <p className="text-right mb-4">
                  {formData.kotaSurat},{' '}
                  {new Date().toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>

                {formData.formatTandaTangan === 'TIGA_KOLOM' ? (
                  <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                    <div>
                      <p className="text-slate-600">Mengetahui,</p>
                      <p className="font-bold">{formData.dekanJabatan || 'Dekan'}</p>
                      <div className="h-12" />
                      <p className="font-bold underline">{formData.dekanNama}</p>
                      <p className="text-[9px] text-slate-600">NIP. {formData.dekanNip}</p>
                    </div>
                    <div>
                      <p className="text-slate-600">Menyetujui,</p>
                      <p className="font-bold">{formData.wakilDekan1Jabatan || 'Wakil Dekan I'}</p>
                      <div className="h-12" />
                      <p className="font-bold underline">{formData.wakilDekan1Nama}</p>
                      <p className="text-[9px] text-slate-600">NIP. {formData.wakilDekan1Nip}</p>
                    </div>
                    <div>
                      <p className="text-slate-600">Pelaksana,</p>
                      <p className="font-bold">{formData.bagianAkademikJabatan || 'Bagian Akademik'}</p>
                      <div className="h-12" />
                      <p className="font-bold underline">{formData.bagianAkademikNama}</p>
                      <p className="text-[9px] text-slate-600">NIP. {formData.bagianAkademikNip}</p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4 text-center text-[11px]">
                    <div>
                      <p className="text-slate-600">Mengetahui,</p>
                      <p className="font-bold">{formData.dekanJabatan || 'Dekan'}</p>
                      <div className="h-12" />
                      <p className="font-bold underline">{formData.dekanNama}</p>
                      <p className="text-[9px] text-slate-600">NIP. {formData.dekanNip}</p>
                    </div>
                    <div>
                      <p className="text-slate-600">Penanggung Jawab,</p>
                      <p className="font-bold">{formData.bagianAkademikJabatan || 'Bagian Akademik'}</p>
                      <div className="h-12" />
                      <p className="font-bold underline">{formData.bagianAkademikNama}</p>
                      <p className="text-[9px] text-slate-600">NIP. {formData.bagianAkademikNip}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </form>
      )}

      {/* TAB 2: AKUN & KEAMANAN ADMINISTRATOR */}
      {activeTab === 'rbac' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  Konfigurasi Akun Administrator Tunggal
                </h3>
                <p className="text-xs text-slate-500">
                  Sistem beroperasi dengan model akun tunggal. Akses publik otomatis sebagai Tamu, dan pengelolaan sistem memerlukan validasi kredensial Admin.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500">Status Sesi:</span>
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold rounded-lg border border-emerald-200 flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Administrator Aktif (@{currentUser?.username})
                </span>
              </div>
            </div>

            {/* Admin Profile & Credentials Card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-xs">
                    AD
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Administrator Akademik FEBI</h4>
                    <p className="text-xs text-blue-700 font-mono">@{currentUser?.username || 'admin'}</p>
                    <p className="text-[11px] text-slate-500">Hak Akses: Pengelola Sistem Utama</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200/80 space-y-2 text-xs text-slate-600">
                  <div className="flex justify-between py-1 border-b border-slate-200/50">
                    <span className="text-slate-500">Username Validasi:</span>
                    <span className="font-mono font-bold text-slate-800">admin</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/50">
                    <span className="text-slate-500">Keamanan Sandi:</span>
                    <span className="font-mono font-bold text-slate-800">Tersandi (••••••••)</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/50">
                    <span className="text-slate-500">Email Kontak:</span>
                    <span className="text-slate-700">{currentUser?.email || 'admin.akademik@uinsgd.ac.id'}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Unit Kerja:</span>
                    <span className="text-slate-700">Fakultas Ekonomi dan Bisnis Islam</span>
                  </div>
                </div>
              </div>

              {/* Otoritas & Batasan Akses */}
              <div className="p-5 rounded-xl bg-blue-50/50 border border-blue-200/60 space-y-3">
                <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider">
                  Matriks Hak Akses Administrator
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Kelola, geser &amp; pindah jadwal kuliah (Drag and Drop)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Import dan ekspor data jadwal perkuliahan Excel/CSV</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Kelola Master Data (Mata Kuliah, Dosen, Ruangan, Kelas)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Konfigurasi Kop Surat, Pejabat Penandatangan, dan Slot Waktu</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Akses Halaman Tamu publik untuk tinjauan perkuliahan</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Informasi Kebijakan Akun Tunggal */}
            <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/70 text-xs text-amber-900 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Kebijakan Akun Tunggal (Single Admin Model)</p>
                <p className="text-amber-800 text-[11px] mt-0.5">
                  Sesuai ketentuan, aplikasi tidak menyediakan pembuatan multi-akun umum. Akses pengelolaan sistem hanya dibuka untuk 1 akun Administrator utama guna menjamin konsistensi dan integritas data penjadwalan akademik. Pengunjung umum dapat langsung melihat matriks jadwal pada Mode Tamu.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SLOTS PERKULIAHAN */}
      {activeTab === 'slots' && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-600" />
                Daftar Slot Waktu Perkuliahan
              </h3>
              <p className="text-xs text-slate-500">
                Slot waktu ini digunakan sebagai baris acuan pada Matriks Jadwal dan Cek Ruangan Kosong.
              </p>
            </div>

            <button
              id="btn-restore-default-slots"
              onClick={handleRestoreDefaultSlots}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset ke Slot Standar Kampus
            </button>
          </div>

          {/* Existing Slots Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-4 w-12 text-center">No</th>
                  <th className="py-2.5 px-4">Label Slot</th>
                  <th className="py-2.5 px-4">Jam Mulai</th>
                  <th className="py-2.5 px-4">Jam Selesai</th>
                  <th className="py-2.5 px-4 text-center w-24">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {localSlots.map((slot, index) => (
                  <tr key={slot.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 text-center font-mono text-slate-400">{index + 1}</td>
                    <td className="py-2.5 px-4 font-semibold text-slate-900">{slot.label}</td>
                    <td className="py-2.5 px-4 font-mono font-medium text-slate-700">{slot.jamMulai}</td>
                    <td className="py-2.5 px-4 font-mono font-medium text-slate-700">{slot.jamSelesai}</td>
                    <td className="py-2.5 px-4 text-center">
                      <button
                        onClick={() => handleDeleteSlot(slot.id)}
                        className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
                        title="Hapus slot"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Add New Slot Form */}
          <form
            onSubmit={handleAddSlot}
            className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-4 gap-3 items-end"
          >
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Nama Slot Baru</label>
              <input
                type="text"
                required
                placeholder="Contoh: Jam Ke-6"
                value={newSlotLabel}
                onChange={(e) => setNewSlotLabel(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 outline-hidden"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Jam Mulai</label>
              <input
                type="time"
                required
                value={newSlotStart}
                onChange={(e) => setNewSlotStart(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-emerald-500 outline-hidden"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Jam Selesai</label>
              <input
                type="time"
                required
                value={newSlotEnd}
                onChange={(e) => setNewSlotEnd(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-emerald-500 outline-hidden"
              />
            </div>
            <div>
              <button
                id="btn-add-timeslot"
                type="submit"
                className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition flex items-center justify-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Tambah Slot
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 4: PEMELIHARAAN DATA & SINKRONISASI CLOUD */}
      {activeTab === 'maintenance' && (
        <div className="space-y-6">
          {/* Card 1: Cloud Database Synchronization (Firebase) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
                  <Cloud className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">
                      Sinkronisasi Cloud Database (Firebase Firestore)
                    </h3>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                      Realtime Aktif
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Data jadwal yang diunggah dari Excel di PC otomatis tersinkronisasi ke server online sehingga dapat langsung dibuka melalui HP.
                  </p>
                </div>
              </div>

              {/* Status info */}
              <div className="flex items-center gap-3 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 text-xs">
                <div className="text-right">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Total Jadwal</p>
                  <p className="font-bold text-slate-800">{schedules.length} Jadwal</p>
                </div>
              </div>
            </div>

            {/* Sync explanations and buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-800">
                  <Laptop className="w-4 h-4 text-blue-600" />
                  <span>Sinkronisasi Lintas Perangkat (PC &amp; HP)</span>
                  <Smartphone className="w-4 h-4 text-emerald-600" />
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Jika Anda baru saja mengunggah file Excel di PC dan ingin memastikan seluruh data langsung tersedia di HP Anda, tekan tombol <strong>"Sinkronkan ke Cloud"</strong> di samping.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 justify-end">
                <button
                  id="btn-sync-to-cloud"
                  type="button"
                  onClick={syncLocalToCloud}
                  disabled={isCloudSyncing}
                  className="w-full sm:w-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition inline-flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isCloudSyncing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CloudUpload className="w-4 h-4" />
                  )}
                  <span>Sinkronkan Seluruh Data ke Cloud</span>
                </button>

                <button
                  id="btn-fetch-from-cloud"
                  type="button"
                  onClick={fetchFromCloud}
                  disabled={isCloudSyncing}
                  className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition inline-flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  <CloudDownload className="w-4 h-4 text-slate-500" />
                  <span>Muat Ulang dari Cloud</span>
                </button>
              </div>
            </div>
          </div>

          {/* Card 2: Backup and Restore JSON */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Download className="w-4 h-4 text-blue-600" />
                  Cadangkan &amp; Pulihkan Data Mandiri (JSON)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Unduh seluruh jadwal dan konfigurasi ke komputer Anda sebagai cadangan arsip mandiri tanpa ketergantungan server.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  id="btn-export-backup-json"
                  type="button"
                  onClick={exportBackupJson}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Unduh Cadangan (.json)</span>
                </button>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleRestoreFile}
                  accept=".json,application/json"
                  className="hidden"
                  id="input-restore-backup-file"
                />

                <button
                  id="btn-trigger-restore-json"
                  type="button"
                  disabled={isRestoringJson}
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition inline-flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {isRestoringJson ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4 text-slate-600" />
                  )}
                  <span>Pulihkan dari File (.json)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Card 3: Reset Demo Data */}
          <div className="bg-rose-50/70 p-5 rounded-2xl border border-rose-200 space-y-3">
            <div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
              <ShieldAlert className="w-5 h-5 text-rose-600" />
              <span>Zona Pemeliharaan &amp; Reset Data Demo</span>
            </div>
            <p className="text-xs text-rose-700">
              Jika Anda ingin mengembalikan seluruh jadwal, data ruangan, dosen, mata kuliah, dan bentrok ke kondisi awal contoh sistem akademik, Anda dapat menekan tombol di bawah ini.
            </p>

            <button
              id="btn-trigger-reset-demo"
              type="button"
              onClick={() => setIsResetConfirmOpen(true)}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition inline-flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Reset ke Data Contoh Asli
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={() => {
          resetToDemoData();
          setLocalSlots(DEFAULT_TIME_SLOTS);
        }}
        title="Reset Semua Data ke Contoh Asli"
        message="Tindakan ini akan mengembalikan semua jadwal, mata kuliah, dosen, dan ruangan ke data awal. Semua perubahan yang Anda buat di browser akan ditimpa."
        confirmText="Ya, Reset Data"
        variant="danger"
        id="confirm-reset-all"
      />
    </div>
  );
};
