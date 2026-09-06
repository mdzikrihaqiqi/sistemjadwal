import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAcademic } from '../../context/AcademicContext';
import {
  ShieldCheck,
  Key,
  Lock,
  User,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  Info,
  Calendar,
  Layers,
} from 'lucide-react';

export const UserManagementView: React.FC = () => {
  const { currentUser, users, updateAdminPassword } = useAuth();
  const { addToast } = useAcademic();

  const [showPassword, setShowPassword] = useState(false);
  const [showChangeModal, setShowChangeModal] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const admin = users[0] || currentUser;

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (newPassword !== confirmPassword) {
      setErrorMsg('Konfirmasi password baru tidak cocok.');
      return;
    }

    const res = updateAdminPassword(oldPassword, newPassword);
    if (res.success) {
      addToast({
        type: 'success',
        title: 'Password Diperbarui',
        message: 'Password akun admin berhasil diubah.',
      });
      setShowChangeModal(false);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setErrorMsg(res.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 mb-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            Akun Sistem Tunggal (Single Account Policy)
          </div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Pengelolaan Akun Administrator
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Sistem beroperasi dengan 1 akun administrator utama untuk mengamankan data perkuliahan.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowChangeModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-all"
          >
            <Key className="w-3.5 h-3.5" />
            <span>Ubah Password Admin</span>
          </button>
        </div>
      </div>

      {/* Account Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-6 bg-linear-to-r from-slate-900 via-slate-800 to-blue-950 text-white flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center font-bold text-2xl text-blue-300 shadow-inner">
            AD
          </div>
          <div className="text-center sm:text-left space-y-1 flex-1">
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-200 border border-blue-400/30">
              <ShieldCheck className="w-3 h-3" />
              Administrator Akademik (Akses Penuh)
            </div>
            <h2 className="text-xl font-bold">{admin?.nama || 'Administrator Akademik'}</h2>
            <p className="text-xs text-slate-300 font-mono">
              Username: <span className="text-white font-bold">@{admin?.username || 'admin'}</span>
              <span className="mx-2 text-slate-500">•</span>
              NIDN/NIP: <span className="text-white">{admin?.nidnOrNim || '198008142005011003'}</span>
            </p>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Detail Credentials Table */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Kredensial Autentikasi Sistem
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-slate-500 text-[11px] block">Username Login:</span>
                <span className="font-mono font-bold text-slate-900 text-sm">admin</span>
                <p className="text-[10px] text-slate-400 mt-1">
                  Digunakan untuk validasi masuk sistem pada halaman login.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-slate-500 text-[11px] block">Password Akun:</span>
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-blue-700 text-sm">
                    {showPassword ? (admin?.password || '••••••••') : '••••••••'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                    title={showPassword ? 'Sembunyikan' : 'Tampilkan password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Status: Terproteksi sistem (dapat diganti melalui tombol di atas).
                </p>
              </div>
            </div>
          </div>

          {/* Authorization Checklist */}
          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
              Hak Akses Eksklusif Administrator
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-700">
              <div className="flex items-center gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Pengelolaan Matriks Jadwal Perkuliahan (Drag & Drop)</span>
              </div>
              <div className="flex items-center gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Import & Ekspor File Excel / CSV Format FEBI</span>
              </div>
              <div className="flex items-center gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Pengaturan Data Master (Mata Kuliah, Dosen, Ruangan, Kelas)</span>
              </div>
              <div className="flex items-center gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Konfigurasi Kop Surat, Pejabat Penandatangan, dan Slot Jam Kuliah</span>
              </div>
            </div>
          </div>

          {/* Policy Information Box */}
          <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200/70 flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-700 space-y-1">
              <p className="font-bold text-blue-950">Kebijakan Mode Tamu &amp; Akun Tunggal</p>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                Secara default saat pertama kali situs dibuka, pengunjung langsung berada di <strong>Mode Tamu (Halaman Tamu)</strong> yang menampilkan Matriks Jadwal, Daftar Jadwal, dan Cek Ruangan dalam keadaan aman (read-only). Fitur pengeditan, import file, dan manipulasi jadwal hanya dapat diakses setelah validasi akun Administrator terdaftar.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {showChangeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95">
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-xs font-bold flex items-center gap-2">
                <Key className="w-4 h-4 text-blue-400" />
                <span>Ganti Password Administrator</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowChangeModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="p-5 space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Password Saat Ini</label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Password lama"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-slate-50 focus:bg-white"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Password Baru</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimal 4 karakter"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-slate-50 focus:bg-white"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Konfirmasi Password Baru</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi password baru"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-slate-50 focus:bg-white"
                  required
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowChangeModal(false)}
                  className="flex-1 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
