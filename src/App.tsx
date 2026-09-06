/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AcademicProvider, useAcademic } from './context/AcademicContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { ToastContainer } from './components/common/Toast';
import { DashboardView } from './components/dashboard/DashboardView';
import { ScheduleMatrixView } from './components/matrix/ScheduleMatrixView';
import { ScheduleListView } from './components/schedules/ScheduleListView';
import { RoomVacancyView } from './components/rooms/RoomVacancyView';
import { ExcelImportView } from './components/import/ExcelImportView';
import { ConflictListView } from './components/conflicts/ConflictListView';
import { MasterDataView } from './components/master/MasterDataView';
import { ReportsView } from './components/reports/ReportsView';
import { SettingsView } from './components/settings/SettingsView';
import { UserManagementView } from './components/users/UserManagementView';
import { LoginView } from './components/auth/LoginView';
import { ScheduleFormModal } from './components/schedules/ScheduleFormModal';
import { ScheduleDetailModal } from './components/schedules/ScheduleDetailModal';
import { MoveScheduleModal } from './components/schedules/MoveScheduleModal';
import { ConfirmDialog } from './components/common/ConfirmDialog';
import { LoginModal } from './components/auth/LoginModal';
import { Schedule, DayOfWeek, TimeSlot } from './types';
import { LogIn } from 'lucide-react';

function AppContent() {
  const { schedules, resetToDefaultData } = useAcademic();
  const { canEditSchedule, isGuest, isAdmin } = useAuth();

  // Navigation state - Halaman awal adalah Matriks Jadwal (Mode Tamu)
  const [activeTab, setActiveTab] = useState<NavTab>('matriks');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Safeguard: Ensure guest cannot access restricted pages
  useEffect(() => {
    if (isGuest && !['matriks', 'jadwal', 'ruangan', 'login'].includes(activeTab)) {
      setActiveTab('matriks');
    }
  }, [isGuest, activeTab]);

  // Modal states
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [prefillData, setPrefillData] = useState<Partial<Schedule> | undefined>(undefined);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedDetailSchedule, setSelectedDetailSchedule] = useState<Schedule | null>(null);

  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [movingSchedule, setMovingSchedule] = useState<Schedule | null>(null);

  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // Handlers
  const handleOpenAddModal = (prefill?: Partial<Schedule>) => {
    setEditingSchedule(null);
    setPrefillData(prefill);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    setPrefillData(undefined);
    setIsFormModalOpen(true);
  };

  const handleOpenDetailModal = (schedule: Schedule) => {
    setSelectedDetailSchedule(schedule);
    setIsDetailModalOpen(true);
  };

  const handleOpenDetailById = (id: string) => {
    const found = schedules.find((s) => s.id === id);
    if (found) {
      setSelectedDetailSchedule(found);
      setIsDetailModalOpen(true);
    }
  };

  const handleOpenMoveModal = (schedule: Schedule) => {
    setMovingSchedule(schedule);
    setIsMoveModalOpen(true);
  };

  const handleAddSlotFromMatrix = (
    day: DayOfWeek,
    slot: TimeSlot,
    prefillFilter?: { room?: string; class?: string; lecturer?: string; subject?: string }
  ) => {
    handleOpenAddModal({
      hari: day,
      jamMulai: slot.jamMulai,
      jamSelesai: slot.jamSelesai,
      ruangNama: prefillFilter?.room || '',
      kelasNama: prefillFilter?.class || '',
      dosenNama: prefillFilter?.lecturer || '',
      mataKuliahNama: prefillFilter?.subject || '',
    });
  };

  const handleUseRoom = (prefill: {
    hari: DayOfWeek;
    jamMulai: string;
    jamSelesai: string;
    ruangNama: string;
  }) => {
    handleOpenAddModal({
      hari: prefill.hari,
      jamMulai: prefill.jamMulai,
      jamSelesai: prefill.jamSelesai,
      ruangNama: prefill.ruangNama,
    });
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 font-sans text-slate-800 antialiased">
      {/* Toast Notifications */}
      <ToastContainer />

      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        isMobileOpen={isMobileSidebarOpen}
        setIsMobileOpen={setIsMobileSidebarOpen}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header */}
        <Header
          onOpenMobileMenu={() => setIsMobileSidebarOpen(true)}
          onOpenAddModal={() => handleOpenAddModal()}
          onNavigateTab={setActiveTab}
          onPrintClick={() => window.print()}
          onResetDataClick={() => setIsResetConfirmOpen(true)}
          onOpenLoginModal={() => setIsLoginModalOpen(true)}
        />

        {/* Page Body */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Mode Tamu Banner */}
            {isGuest && activeTab !== 'login' && (
              <div className="mb-6 bg-linear-to-r from-blue-50/90 via-indigo-50/40 to-slate-50 border border-blue-200/80 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-xs">
                <div className="flex items-start sm:items-center gap-3">
                  <div className="p-2 bg-blue-600 text-white rounded-lg shrink-0 shadow-xs">
                    <LogIn className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                      Anda sedang berada di Halaman Tamu (Akses Publik)
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Anda dapat melihat Matriks Jadwal, Daftar Jadwal, dan Cek Ruangan. Untuk mengedit atau mengelola sistem, silakan masuk.
                    </p>
                  </div>
                </div>
                <button
                  id="btn-banner-login"
                  onClick={() => setActiveTab('login')}
                  className="shrink-0 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs hover:shadow transition-all flex items-center justify-center gap-1.5"
                >
                  <span>Masuk / Login</span>
                  <span aria-hidden="true">→</span>
                </button>
              </div>
            )}

            {activeTab === 'dashboard' && (
              <DashboardView
                onNavigateTab={setActiveTab}
                onSelectScheduleForDetail={handleOpenDetailById}
                onOpenAddModal={() => handleOpenAddModal()}
              />
            )}

            {activeTab === 'matriks' && (
              <ScheduleMatrixView
                onSelectSchedule={handleOpenDetailModal}
                onAddNewSlot={handleAddSlotFromMatrix}
              />
            )}

            {activeTab === 'jadwal' && (
              <ScheduleListView
                onOpenAddModal={() => handleOpenAddModal()}
                onEditSchedule={handleOpenEditModal}
                onSelectDetail={handleOpenDetailModal}
                onMoveSchedule={handleOpenMoveModal}
              />
            )}

            {activeTab === 'ruangan' && (
              <RoomVacancyView
                onUseRoom={handleUseRoom}
                onSelectSchedule={handleOpenDetailModal}
              />
            )}

            {activeTab === 'import' && (
              <ExcelImportView onImportCompleted={() => setActiveTab('matriks')} />
            )}

            {activeTab === 'bentrok' && (
              <ConflictListView
                onFixSchedule={handleOpenEditModal}
                onSelectSchedule={handleOpenDetailModal}
              />
            )}

            {activeTab === 'matakuliah' && (
              <MasterDataView initialSection="matakuliah" key="master-mk" />
            )}

            {activeTab === 'dosen' && (
              <MasterDataView initialSection="dosen" key="master-dosen" />
            )}

            {activeTab === 'master-ruangan' && (
              <MasterDataView initialSection="ruangan" key="master-ruang" />
            )}

            {activeTab === 'kelas' && (
              <MasterDataView initialSection="kelas" key="master-kelas" />
            )}

            {activeTab === 'tahun-akademik' && (
              <MasterDataView initialSection="tahun-akademik" key="master-ta" />
            )}

            {activeTab === 'laporan' && <ReportsView />}

            {activeTab === 'pengaturan' && <SettingsView />}

            {activeTab === 'pengguna' && isAdmin && <UserManagementView />}

            {activeTab === 'login' && <LoginView onNavigateTab={setActiveTab} />}
          </div>
        </main>
      </div>

      {/* Global Modals */}
      <ScheduleFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingSchedule(null);
          setPrefillData(undefined);
        }}
        schedule={editingSchedule}
        prefillData={prefillData}
      />

      <ScheduleDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedDetailSchedule(null);
        }}
        schedule={selectedDetailSchedule}
        onEdit={(sch) => {
          handleOpenEditModal(sch);
        }}
        onMove={(sch) => {
          handleOpenMoveModal(sch);
        }}
      />

      <MoveScheduleModal
        isOpen={isMoveModalOpen}
        onClose={() => {
          setIsMoveModalOpen(false);
          setMovingSchedule(null);
        }}
        schedule={movingSchedule}
      />

      {/* Global Login & RBAC Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />

      {/* Global Reset Confirm */}
      <ConfirmDialog
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={resetToDefaultData}
        title="Reset ke Data Asli (Jadwal Kosong)"
        message="Kembalikan sistem ke keadaan awal: jadwal perkuliahan akan dikosongkan secara bersih dan data master dikembalikan ke konfigurasi asli?"
        confirmText="Reset ke Data Asli"
        variant="danger"
        id="confirm-reset-header"
      />
    </div>
  );
}

export default function App() {
  return (
    <AcademicProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </AcademicProvider>
  );
}

