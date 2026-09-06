import React from 'react';
import {
  Menu,
  Search,
  Plus,
  AlertTriangle,
  Calendar,
  X,
  RotateCcw,
  Printer,
  User,
  ShieldCheck,
  ChevronDown,
  Award,
  BookOpen,
  GraduationCap,
  LogIn,
} from 'lucide-react';
import { useAcademic } from '../../context/AcademicContext';
import { useAuth } from '../../context/AuthContext';
import { NavTab } from './Sidebar';

interface HeaderProps {
  onOpenMobileMenu: () => void;
  onOpenAddModal: () => void;
  onNavigateTab: (tab: NavTab) => void;
  onPrintClick: () => void;
  onResetDataClick: () => void;
  onOpenLoginModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMobileMenu,
  onOpenAddModal,
  onNavigateTab,
  onPrintClick,
  onResetDataClick,
  onOpenLoginModal,
}) => {
  const {
    academicYears,
    activeAcademicYearId,
    setActiveAcademicYearId,
    searchQuery,
    setSearchQuery,
    conflicts,
  } = useAcademic();

  const { currentUser, canEditSchedule, canPrintReports, isAdmin } = useAuth();

  const conflictCount = conflicts.length;

  const getRoleBadge = () => {
    if (!currentUser) return null;
    switch (currentUser.role) {
      case 'ADMIN_AKADEMIK':
        return {
          label: 'Admin',
          icon: <ShieldCheck className="w-3 h-3" />,
          cls: 'bg-blue-100 text-blue-700 border-blue-200',
        };
      case 'DEKAN':
        return {
          label: 'Dekan',
          icon: <Award className="w-3 h-3" />,
          cls: 'bg-purple-100 text-purple-700 border-purple-200',
        };
      case 'DOSEN':
        return {
          label: 'Dosen',
          icon: <BookOpen className="w-3 h-3" />,
          cls: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        };
      case 'MAHASISWA':
      default:
        return {
          label: 'Mahasiswa',
          icon: <GraduationCap className="w-3 h-3" />,
          cls: 'bg-amber-100 text-amber-700 border-amber-200',
        };
    }
  };

  const roleBadge = getRoleBadge();

  return (
    <header
      id="app-header"
      className="h-16 bg-white border-b border-slate-200 px-4 md:px-8 flex items-center justify-between gap-4 shrink-0 no-print"
    >
      {/* Left: Mobile Toggle & Global Search */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <button
          id="btn-mobile-menu"
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-md hover:bg-slate-100 transition-colors"
          aria-label="Buka Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Box (Section 12) */}
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="global-search-input"
            type="text"
            placeholder="Cari mata kuliah, dosen, ruang, kelas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-1.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 focus:border-blue-500 rounded-md text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 outline-hidden transition-colors"
          />
          {searchQuery && (
            <button
              id="btn-clear-search"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 rounded-full"
              aria-label="Bersihkan pencarian"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Academic Year Selector */}
        <div className="hidden sm:flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-md border border-slate-200">
          <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <select
            id="header-academic-year-select"
            value={activeAcademicYearId}
            onChange={(e) => setActiveAcademicYearId(e.target.value)}
            className="bg-transparent text-xs font-semibold text-slate-700 outline-hidden cursor-pointer"
          >
            {academicYears.map((ay) => (
              <option key={ay.id} value={ay.id}>
                TA {ay.tahun} ({ay.semester}) {ay.statusAktif ? '• Aktif' : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Conflict Alert indicator */}
        {conflictCount > 0 && (
          <button
            id="btn-header-conflict-alert"
            onClick={() => onNavigateTab('bentrok')}
            title={`${conflictCount} Jadwal Bentrok Terdeteksi! Klik untuk melihat.`}
            className="flex items-center gap-1.5 rounded-full bg-red-100 hover:bg-red-200 px-3 py-1 text-xs font-bold text-red-600 uppercase tracking-tighter transition-colors"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0" />
            <span>{conflictCount} Bentrok</span>
          </button>
        )}

        {/* Quick Print Button */}
        {canPrintReports && (
          <button
            id="btn-header-print"
            onClick={onPrintClick}
            title="Cetak Laporan Perkuliahan"
            className="rounded-md border border-slate-300 bg-white px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium hover:bg-slate-50 text-slate-700 transition-colors flex items-center gap-1.5"
            aria-label="Cetak Laporan"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">Cetak</span>
          </button>
        )}

        {/* Reset Demo Data Button (Admin Only) */}
        {isAdmin && (
          <button
            id="btn-header-reset-demo"
            onClick={onResetDataClick}
            title="Reset ke Data Contoh Asli"
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors hidden md:flex"
            aria-label="Reset Data Demo"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        )}

        {/* Add Schedule Button */}
        {canEditSchedule && (
          <button
            id="btn-header-add-schedule"
            onClick={onOpenAddModal}
            className="rounded-md bg-blue-600 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white shadow-xs hover:bg-blue-700 transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Tambah Jadwal</span>
          </button>
        )}

        {/* User Account / Role Switcher Button or Guest Mode Login */}
        {currentUser ? (
          <button
            id="btn-header-user-account"
            onClick={onOpenLoginModal}
            title="Klik untuk ganti hak akses / profil pengguna"
            className="flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-slate-50 transition-colors"
          >
            <div className="w-7 h-7 rounded-md bg-gradient-to-tr from-slate-700 to-slate-900 text-white flex items-center justify-center text-xs font-bold">
              {currentUser?.nama?.charAt(0) || 'U'}
            </div>
            <div className="text-left hidden xl:block">
              <p className="text-xs font-bold text-slate-900 leading-none truncate max-w-[120px]">
                {currentUser?.nama?.split(' ')[0]}
              </p>
              <p className="text-[10px] text-slate-500 leading-tight">
                {currentUser?.roleLabel}
              </p>
            </div>
            {roleBadge && (
              <span
                className={`hidden sm:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${roleBadge.cls}`}
              >
                {roleBadge.icon}
                {roleBadge.label}
              </span>
            )}
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Mode Tamu
            </span>
            <button
              id="btn-header-login"
              onClick={() => onNavigateTab('login')}
              className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-all"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Masuk / Login</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
