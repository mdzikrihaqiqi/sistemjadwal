import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserAccount, UserRole } from '../types';
import { INITIAL_USERS } from '../data/initialData';

interface AuthContextType {
  currentUser: UserAccount | null;
  users: UserAccount[];
  isAuthenticated: boolean;
  isGuest: boolean;
  login: (username: string, password?: string) => { success: boolean; message?: string };
  logout: () => void;
  updateAdminPassword: (oldPassword: string, newPassword: string) => { success: boolean; message: string };

  // Permissions
  isAdmin: boolean;
  canEditSchedule: boolean;
  canImportExcel: boolean;
  canManageMaster: boolean;
  canEditSettings: boolean;
  canPrintReports: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_USER_KEY = 'simatrik_auth_user_v3';
const ADMIN_PASSWORD_KEY = 'simatrik_admin_pwd_v3';
const DEFAULT_ADMIN_PASSWORD = 'febijuara';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Password admin yang tersimpan (default: febijuara)
  const [adminPassword, setAdminPassword] = useState<string>(() => {
    try {
      return localStorage.getItem(ADMIN_PASSWORD_KEY) || DEFAULT_ADMIN_PASSWORD;
    } catch {
      return DEFAULT_ADMIN_PASSWORD;
    }
  });

  // Base admin account (hanya 1 akun tunggal)
  const adminAccount: UserAccount = {
    id: 'usr-admin',
    username: 'admin',
    password: adminPassword,
    nama: 'Administrator Akademik',
    role: 'ADMIN_AKADEMIK',
    roleLabel: 'Administrator Sistem (Akses Penuh)',
    email: 'admin.akademik@uinsgd.ac.id',
    nidnOrNim: '198008142005011003',
    prodi: 'Bagian Administrasi Akademik FEBI',
  };

  const users: UserAccount[] = [adminAccount];

  // Default login is null (Halaman Tamu / Akses Publik)
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    try {
      const saved = localStorage.getItem(AUTH_USER_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.username === 'admin') {
          return { ...adminAccount, password: adminPassword };
        }
      }
      return null; // Mode Tamu secara default
    } catch {
      return null;
    }
  });

  // Save current logged in user
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(AUTH_USER_KEY);
    }
  }, [currentUser]);

  // Save admin password
  useEffect(() => {
    try {
      localStorage.setItem(ADMIN_PASSWORD_KEY, adminPassword);
    } catch {
      // ignore
    }
  }, [adminPassword]);

  // Validasi login akun yang ketat
  const login = useCallback(
    (username: string, password?: string): { success: boolean; message?: string } => {
      const trimmedUser = (username || '').trim().toLowerCase();
      const enteredPass = password || '';

      // 1. Validasi keberadaan input username
      if (!trimmedUser) {
        return {
          success: false,
          message: 'Username wajib diisi.',
        };
      }

      // 2. Validasi keberadaan input password
      if (!enteredPass) {
        return {
          success: false,
          message: 'Password wajib diisi.',
        };
      }

      // 3. Validasi username terdaftar (Hanya 1 akun: admin)
      if (trimmedUser !== 'admin') {
        return {
          success: false,
          message: 'Username atau password salah. Silakan periksa kembali kredensial Anda.',
        };
      }

      // 4. Validasi kecocokan password (case-sensitive)
      if (enteredPass !== adminPassword) {
        return {
          success: false,
          message: 'Username atau password salah. Silakan periksa kembali kredensial Anda.',
        };
      }

      // 5. Validasi sukses
      const verifiedAdmin: UserAccount = {
        ...adminAccount,
        password: adminPassword,
      };
      setCurrentUser(verifiedAdmin);
      return {
        success: true,
        message: 'Validasi akun berhasil. Selamat datang, Administrator Sistem!',
      };
    },
    [adminPassword, adminAccount]
  );

  const logout = useCallback(() => {
    setCurrentUser(null);
  }, []);

  const updateAdminPassword = useCallback(
    (oldPassword: string, newPassword: string): { success: boolean; message: string } => {
      if (oldPassword !== adminPassword) {
        return { success: false, message: 'Password saat ini tidak cocok.' };
      }
      if (!newPassword || newPassword.length < 4) {
        return { success: false, message: 'Password baru minimal harus 4 karakter.' };
      }
      setAdminPassword(newPassword);
      if (currentUser) {
        setCurrentUser((prev) => (prev ? { ...prev, password: newPassword } : null));
      }
      return { success: true, message: 'Password Administrator berhasil diperbarui.' };
    },
    [adminPassword, currentUser]
  );

  const isGuest = !currentUser;
  const isAdmin = currentUser?.role === 'ADMIN_AKADEMIK';

  const canEditSchedule = isAdmin;
  const canImportExcel = isAdmin;
  const canManageMaster = isAdmin;
  const canEditSettings = isAdmin;
  const canPrintReports = true; // Tamu & Admin dapat melihat dan mencetak jadwal

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        users,
        isAuthenticated: !isGuest,
        isGuest,
        login,
        logout,
        updateAdminPassword,
        isAdmin,
        canEditSchedule,
        canImportExcel,
        canManageMaster,
        canEditSettings,
        canPrintReports,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

