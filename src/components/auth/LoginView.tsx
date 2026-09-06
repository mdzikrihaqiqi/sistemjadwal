import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAcademic } from '../../context/AcademicContext';
import {
  ShieldCheck,
  Lock,
  User,
  ArrowRight,
  LogOut,
  Calendar,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Eye,
  EyeOff,
  RefreshCw,
  SlidersHorizontal,
} from 'lucide-react';

interface LoginViewProps {
  onNavigateTab: (tab: any) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onNavigateTab }) => {
  const { currentUser, login, logout, updateAdminPassword } = useAuth();
  const { addToast } = useAcademic();

  // Form states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Password change state for logged in admin
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState('');

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    // Validasi input awal
    const trimmedUser = username.trim().toLowerCase();
    if (!trimmedUser) {
      setErrorMsg('Username wajib diisi.');
      return;
    }
    if (!password) {
      setErrorMsg('Password wajib diisi.');
      return;
    }

    setIsValidating(true);

    // Simulasi feedback proses validasi akun
    setTimeout(() => {
      const res = login(trimmedUser, password);
      setIsValidating(false);

      if (res.success) {
        setSuccessMsg('Kredensial valid! Membuka akses Administrator Sistem...');
        addToast({
          type: 'success',
          title: 'Validasi Berhasil',
          message: 'Selamat datang kembali, Administrator!',
        });
        setTimeout(() => {
          onNavigateTab('matriks');
        }, 400);
      } else {
        setErrorMsg(res.message || 'Username atau password salah. Silakan periksa kembali.');
      }
    }, 350);
  };

  const handleLogout = () => {
    logout();
    addToast({
      type: 'info',
      title: 'Telah Keluar',
      message: 'Anda kembali ke Mode Tamu (Akses Publik).',
    });
  };

  const handleChangePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError('');
    setPwdSuccess('');

    if (newPassword !== confirmPassword) {
      setPwdError('Konfirmasi password baru tidak cocok.');
      return;
    }

    const res = updateAdminPassword(oldPassword, newPassword);
    if (res.success) {
      setPwdSuccess(res.message);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowChangePassword(false);
      addToast({
        type: 'success',
        title: 'Password Diperbarui',
        message: 'Password Administrator berhasil diganti.',
      });
    } else {
      setPwdError(res.message);
    }
  };

  // -------------------------------------------------------------
  // View 1: When Admin is Already Logged In
  // -------------------------------------------------------------
  if (currentUser) {
    return (
      <div className="max-w-3xl mx-auto py-8 space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Admin Profile Header */}
          <div className="bg-linear-to-r from-slate-900 via-blue-950 to-slate-900 p-6 sm:p-8 text-white">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
              <div className="w-20 h-20 rounded-2xl bg-blue-600/20 border border-blue-400/30 flex items-center justify-center font-bold text-2xl text-blue-300 shadow-inner">
                <ShieldCheck className="w-10 h-10 text-blue-400" />
              </div>

              <div className="text-center sm:text-left space-y-1.5 flex-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Sesi Administrator Aktif (Akses Penuh)
                </div>
                <h1 className="text-2xl font-bold">{currentUser.nama}</h1>
                <p className="text-slate-300 text-sm">
                  Username: <span className="font-mono text-white font-semibold">@{currentUser.username}</span>
                  <span className="mx-2 text-slate-500">•</span>
                  Role: <span className="text-blue-300 font-semibold">{currentUser.roleLabel}</span>
                </p>
                <p className="text-xs text-slate-400">
                  Sistem Akun Tunggal: Hanya akun ini yang memiliki otoritas pengelolaan jadwal & data master.
                </p>
              </div>

              <button
                id="btn-logout-admin-view"
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-rose-200 hover:text-white bg-rose-900/40 hover:bg-rose-700 border border-rose-500/30 rounded-xl transition-all"
              >
                <LogOut className="w-4 h-4" />
                Keluar (Mode Tamu)
              </button>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* Otoritas Admin */}
            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                Otoritas Akses Administrator
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-700">
                <div className="flex items-center gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Pengelolaan Jadwal Matriks (Drag & Move)</span>
                </div>
                <div className="flex items-center gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Import Jadwal Perkuliahan Excel / CSV</span>
                </div>
                <div className="flex items-center gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Edit Data Master (Matkul, Dosen, Ruang, Kelas)</span>
                </div>
                <div className="flex items-center gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Cetak & Konfigurasi Kop Surat Laporan FEBI</span>
                </div>
              </div>
            </div>

            {/* Keamanan & Password Admin */}
            <div className="pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Keamanan Akun Administrator</h4>
                  <p className="text-xs text-slate-500">
                    Username: <span className="font-mono font-bold">admin</span>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowChangePassword(!showChangePassword)}
                  className="px-3 py-1.5 text-xs font-semibold text-blue-700 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
                >
                  {showChangePassword ? 'Tutup Form Sandi' : 'Ubah Password Admin'}
                </button>
              </div>

              {showChangePassword && (
                <form onSubmit={handleChangePasswordSubmit} className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <h5 className="text-xs font-bold text-slate-800">Ubah Password Akun Admin</h5>
                  {pwdError && (
                    <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{pwdError}</span>
                    </div>
                  )}
                  {pwdSuccess && (
                    <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>{pwdSuccess}</span>
                    </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Password Lama</label>
                      <input
                        type="password"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        placeholder="Password saat ini"
                        className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Password Baru</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Min. 4 karakter"
                        className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">Konfirmasi Baru</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Ulangi password"
                        className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
                    >
                      Simpan Password Baru
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Navigasi Cepat */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-slate-500">
                Sesi Anda aktif dan memiliki izin penuh.
              </span>
              <div className="flex items-center gap-2">
                <button
                  id="btn-goto-matrix-from-login"
                  onClick={() => onNavigateTab('matriks')}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-all"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  Buka Matriks Jadwal
                </button>
                <button
                  id="btn-goto-dashboard-from-login"
                  onClick={() => onNavigateTab('dashboard')}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  Buka Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // View 2: Guest Mode (Form Validasi Login Akun Admin)
  // -------------------------------------------------------------
  return (
    <div className="max-w-md mx-auto py-6 sm:py-10 space-y-6">
      {/* Header Intro */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
          <KeyRound className="w-3.5 h-3.5" />
          Akses Khusus Administrator
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Login Administrator
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
          Silakan masukkan username dan password administrator untuk mengelola jadwal dan pengaturan sistem.
        </p>
      </div>

      {/* Main Login Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <form onSubmit={handleManualLogin} className="p-6 sm:p-7 space-y-5">
          {/* Error Message */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2.5 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{errorMsg}</div>
            </div>
          )}

          {/* Success Message */}
          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 flex items-start gap-2.5 animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{successMsg}</div>
            </div>
          )}

          {/* Input Username */}
          <div className="space-y-1.5">
            <label htmlFor="input-username" className="text-xs font-bold text-slate-700">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                id="input-username"
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="Masukkan username"
                autoCapitalize="none"
                autoComplete="username"
                className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl bg-slate-50/50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-hidden transition-all"
                required
              />
            </div>
          </div>

          {/* Input Password */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="input-password" className="text-xs font-bold text-slate-700">
                Kata Sandi (Password)
              </label>
              <span className="text-[10px] text-slate-400">Peka huruf besar/kecil</span>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="input-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="Masukkan kata sandi"
                autoComplete="current-password"
                className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl bg-slate-50/50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-hidden transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                title={showPassword ? 'Sembunyikan password' : 'Lihat password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Tombol Validasi & Masuk */}
          <div className="pt-2">
            <button
              id="btn-submit-login"
              type="submit"
              disabled={isValidating}
              className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 shadow-xs hover:shadow transition-all flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
            >
              {isValidating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Memvalidasi Akun...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Validasi & Masuk Sistem</span>
                  <ArrowRight className="w-4 h-4 ml-0.5" />
                </>
              )}
            </button>
          </div>

          {/* Opsi Kembali ke Mode Tamu Publik */}
          <div className="pt-2 border-t border-slate-100 text-center">
            <button
              type="button"
              id="btn-back-to-guest"
              onClick={() => onNavigateTab('matriks')}
              className="text-xs text-slate-500 hover:text-blue-600 transition-colors inline-flex items-center gap-1 font-medium"
            >
              <span>← Tetap di Halaman Tamu (Lihat Matriks Jadwal)</span>
            </button>
          </div>
        </form>
      </div>

      {/* Security note footer */}
      <div className="text-center">
        <p className="text-[11px] text-slate-400">
          Sistem Penjadwalan Kuliah FEBI • UIN Sunan Gunung Djati Bandung
        </p>
      </div>
    </div>
  );
};
