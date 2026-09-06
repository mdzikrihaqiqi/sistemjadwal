import React from 'react';
import {
  LayoutDashboard,
  CalendarDays,
  Grid,
  DoorOpen,
  FileSpreadsheet,
  AlertTriangle,
  BookOpen,
  UserCheck,
  Building2,
  GraduationCap,
  Calendar,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Sparkles,
  ShieldCheck,
  User,
  Lock,
  LogIn,
} from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';
import { useAuth } from '../../context/AuthContext';

export type NavTab =
  | 'dashboard'
  | 'jadwal'
  | 'matriks'
  | 'ruangan'
  | 'import'
  | 'bentrok'
  | 'matakuliah'
  | 'dosen'
  | 'master-ruangan'
  | 'kelas'
  | 'tahun-akademik'
  | 'laporan'
  | 'pengaturan'
  | 'login';

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  isCollapsed: boolean;
  setIsCollapsed: (val: boolean) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (val: boolean) => void;
  onOpenLoginModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isCollapsed,
  setIsCollapsed,
  isMobileOpen,
  setIsMobileOpen,
  onOpenLoginModal,
}) => {
  const { conflicts, activeAcademicYear } = useAcademic();
  const { currentUser, isGuest, isAdmin } = useAuth();
  const conflictCount = conflicts.length;

  // Build menu items strictly based on role:
  // For Guest (Mode Tamu): only Matriks Jadwal, Daftar Jadwal, Cek Ruangan, and Masuk / Login
  const menuItems: { id: NavTab; label: string; icon: React.ReactNode; badge?: number; section?: string }[] = isGuest
    ? [
        { section: 'MENU TAMU (PUBLIK)', id: 'matriks', label: 'Matriks Jadwal', icon: <Grid className="w-5 h-5" /> },
        { id: 'jadwal', label: 'Daftar Jadwal', icon: <CalendarDays className="w-5 h-5" /> },
        { id: 'ruangan', label: 'Cek Ruangan', icon: <DoorOpen className="w-5 h-5" /> },
        { section: 'AKSES SISTEM', id: 'login', label: 'Masuk / Login Admin', icon: <LogIn className="w-5 h-5" /> },
      ]
    : [
        { section: 'UTAMA', id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
        { id: 'matriks', label: 'Matriks Jadwal', icon: <Grid className="w-5 h-5" /> },
        { id: 'jadwal', label: 'Daftar Jadwal', icon: <CalendarDays className="w-5 h-5" /> },
        { id: 'ruangan', label: 'Cek Ruangan', icon: <DoorOpen className="w-5 h-5" /> },
        { id: 'import', label: 'Import Excel', icon: <FileSpreadsheet className="w-5 h-5" /> },
        {
          id: 'bentrok',
          label: 'Bentrok Jadwal',
          icon: <AlertTriangle className="w-5 h-5" />,
          badge: conflictCount > 0 ? conflictCount : undefined,
        },
        { section: 'DATA MASTER', id: 'matakuliah', label: 'Mata Kuliah', icon: <BookOpen className="w-5 h-5" /> },
        { id: 'dosen', label: 'Dosen', icon: <UserCheck className="w-5 h-5" /> },
        { id: 'master-ruangan', label: 'Ruangan', icon: <Building2 className="w-5 h-5" /> },
        { id: 'kelas', label: 'Kelas', icon: <GraduationCap className="w-5 h-5" /> },
        { id: 'tahun-akademik', label: 'Tahun Akademik', icon: <Calendar className="w-5 h-5" /> },
        { section: 'OUTPUT & SISTEM', id: 'laporan', label: 'Laporan & Print', icon: <FileText className="w-5 h-5" /> },
        { id: 'pengaturan', label: 'Pengaturan Kop', icon: <Settings className="w-5 h-5" /> },
        { id: 'login', label: 'Akun Administrator', icon: <User className="w-5 h-5" /> },
      ];

  const handleSelectTab = (tab: NavTab) => {
    setActiveTab(tab);
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        id="sidebar-navigation"
        className={`fixed lg:static top-0 bottom-0 left-0 z-40 bg-slate-900 text-slate-300 flex flex-col transition-all duration-300 border-r border-slate-800 no-print ${
          isCollapsed ? 'lg:w-20' : 'lg:w-64'
        } ${isMobileOpen ? 'w-64 translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="h-8 w-8 rounded bg-blue-600 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-xs">
              A
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <h1 className="text-base font-bold text-white truncate leading-tight tracking-tight">Akademik Manager</h1>
                <p className="text-[10px] text-blue-400 font-medium truncate">Matriks &amp; Ruangan</p>
              </div>
            )}
          </div>

          <button
            id="btn-toggle-sidebar"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Toggle Sidebar"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          <button
            id="btn-close-mobile-sidebar"
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Tutup Menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;

            return (
              <React.Fragment key={item.id}>
                {item.section && !isCollapsed && (
                  <div className="mt-4 first:mt-1 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    {item.section}
                  </div>
                )}
                {item.section && isCollapsed && <div className="my-2 border-t border-slate-800" />}

                <button
                  id={`nav-${item.id}`}
                  onClick={() => handleSelectTab(item.id)}
                  title={isCollapsed ? item.label : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded text-sm transition-colors relative ${
                    isActive
                      ? 'bg-blue-600/15 text-blue-400 font-medium'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span className={`shrink-0 ${isActive ? 'text-blue-400' : 'text-slate-400'}`}>{item.icon}</span>

                  {!isCollapsed && <span className="truncate flex-1 text-left">{item.label}</span>}

                  {item.badge !== undefined && (
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold rounded-full shrink-0 ${
                        isActive
                          ? 'bg-blue-600 text-white'
                          : 'bg-red-500 text-white'
                      } ${isCollapsed ? 'absolute top-1 right-1' : ''}`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              </React.Fragment>
            );
          })}
        </nav>

        {/* Footer info showing active academic year & user */}
        {!isCollapsed && (
          <div className="p-3 border-t border-slate-800 shrink-0 space-y-2">
            {/* Active Academic Year Card */}
            <div className="rounded-lg bg-slate-800/80 border border-slate-700/50 p-2.5">
              <p className="text-[10px] uppercase font-bold tracking-wider text-blue-400">
                Tahun Akademik Aktif
              </p>
              <p className="text-xs font-semibold text-white truncate">
                TA {activeAcademicYear?.tahun || '2026/2027'} ({activeAcademicYear?.semester || 'Ganjil'})
              </p>
            </div>

            {/* Current User Card / Switcher Button or Guest Mode Card */}
            {currentUser ? (
              <button
                type="button"
                onClick={onOpenLoginModal}
                className="w-full text-left rounded-lg bg-slate-800/50 hover:bg-slate-800 p-2 transition flex items-center gap-2 border border-slate-700/30"
                title="Klik untuk ganti pengguna atau hak akses"
              >
                <div className="w-6 h-6 rounded-md bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                  {currentUser.nama.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-slate-200 truncate">{currentUser.nama}</p>
                  <p className="text-[10px] text-blue-300 truncate">{currentUser.roleLabel}</p>
                </div>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleSelectTab('login')}
                className="w-full text-left rounded-lg bg-blue-600/15 hover:bg-blue-600/25 p-2.5 transition flex items-center gap-2.5 border border-blue-500/30 group"
                title="Klik untuk masuk ke sistem"
              >
                <div className="w-7 h-7 rounded-md bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <LogIn className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-blue-300 truncate group-hover:text-blue-200">Mode Tamu</p>
                  <p className="text-[10px] text-slate-400 truncate">Klik untuk Masuk Sistem</p>
                </div>
              </button>
            )}
          </div>
        )}
      </aside>
    </>
  );
};
