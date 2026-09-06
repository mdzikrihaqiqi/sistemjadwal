import React from 'react';
import {
  CalendarDays,
  Building,
  GraduationCap,
  UserCheck,
  BookOpen,
  AlertTriangle,
  DoorOpen,
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles,
  FileSpreadsheet,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import { useAcademic } from '../../context/AcademicContext';
import { NavTab } from '../layout/Sidebar';
import { DAYS_OF_WEEK } from '../../types';
import { formatTimeRange } from '../../utils/timeUtils';

interface DashboardViewProps {
  onNavigateTab: (tab: NavTab) => void;
  onSelectScheduleForDetail: (id: string) => void;
  onOpenAddModal: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigateTab,
  onSelectScheduleForDetail,
  onOpenAddModal,
}) => {
  const {
    yearSchedules,
    rooms,
    classes,
    lecturers,
    subjects,
    conflicts,
    activeAcademicYear,
    timeSlots,
  } = useAcademic();

  const totalSchedules = yearSchedules.length;
  const totalRooms = rooms.length;
  const totalClasses = classes.length;
  const totalLecturers = lecturers.length;
  const totalSubjects = subjects.length;
  const conflictCount = conflicts.length;

  // Occupied rooms estimate
  const occupiedRoomNames = new Set(
    yearSchedules.map((s) => s.ruangNama.toLowerCase())
  );
  const occupiedRoomsCount = Math.min(occupiedRoomNames.size, totalRooms);
  const estimatedEmptyRooms = Math.max(0, totalRooms - occupiedRoomsCount);

  // Chart 1: Schedules per Day
  const schedulePerDayData = DAYS_OF_WEEK.map((day) => ({
    hari: day,
    total: yearSchedules.filter((s) => s.hari === day).length,
  }));

  // Chart 2: Room Utilization
  const roomUsageData = rooms
    .map((room) => ({
      ruangan: room.nama,
      kapasitas: room.kapasitas,
      jadwalCount: yearSchedules.filter((s) => s.ruangNama.toLowerCase() === room.nama.toLowerCase()).length,
    }))
    .sort((a, b) => b.jadwalCount - a.jadwalCount)
    .slice(0, 8);

  // Chart 3: Class distribution
  const classDistData = classes
    .map((c) => ({
      kelas: c.nama,
      total: yearSchedules.filter((s) => s.kelasNama.toLowerCase() === c.nama.toLowerCase()).length,
    }))
    .filter((c) => c.total > 0);

  const COLORS = ['#2563eb', '#3b82f6', '#0ea5e9', '#6366f1', '#8b5cf6', '#f59e0b'];

  return (
    <div className="space-y-6">
      {/* Welcome Banner matching Professional Polish design */}
      <div className="bg-slate-900 rounded-xl p-6 text-white shadow-xs border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Sistem Informasi Akademik</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
            Dashboard Manajemen Jadwal &amp; Ruangan
          </h2>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Semester {activeAcademicYear?.semester || 'Ganjil'} • TA {activeAcademicYear?.tahun || '2026/2027'}. Deteksi bentrok dan monitoring utilisasi ruang kuliah.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            id="dash-btn-import"
            onClick={() => onNavigateTab('import')}
            className="rounded-md border border-slate-700 bg-slate-800 px-3.5 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-colors flex items-center gap-2"
          >
            <FileSpreadsheet className="w-4 h-4 text-blue-400" />
            Import Excel
          </button>
          <button
            id="dash-btn-matrix"
            onClick={() => onNavigateTab('matriks')}
            className="rounded-md bg-blue-600 px-4 py-2 text-xs font-medium text-white shadow-xs hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            Buka Matriks Jadwal
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Conflict Alert Banner if conflicts exist */}
      {conflictCount > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-red-100 flex items-center justify-center text-red-600 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-red-900">
                Terdeteksi {conflictCount} Jadwal Bentrok!
              </h4>
              <p className="text-xs text-red-700 mt-0.5">
                Terdapat jadwal dengan ruangan, dosen, atau rombel kelas yang bertabrakan di waktu yang sama.
              </p>
            </div>
          </div>
          <button
            id="dash-btn-resolve-conflict"
            onClick={() => onNavigateTab('bentrok')}
            className="rounded-md bg-red-600 hover:bg-red-700 text-white text-xs font-medium px-4 py-2 shadow-xs transition-colors shrink-0"
          >
            Perbaiki Bentrok
          </button>
        </div>
      )}

      {/* 4 Primary Metric Blocks matching Design HTML exactly */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {/* Total Jadwal */}
        <div
          onClick={() => onNavigateTab('jadwal')}
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs hover:border-slate-300 transition-colors cursor-pointer"
        >
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Total Jadwal</p>
          <h3 className="mt-1 text-3xl font-bold text-slate-800">{totalSchedules}</h3>
        </div>

        {/* Ruangan Terisi */}
        <div
          onClick={() => onNavigateTab('master-ruangan')}
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs hover:border-slate-300 transition-colors cursor-pointer"
        >
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Ruangan Terisi</p>
          <h3 className="mt-1 text-3xl font-bold text-slate-800">
            {occupiedRoomsCount}
            <span className="text-sm text-slate-400 font-normal ml-2">/ {totalRooms}</span>
          </h3>
        </div>

        {/* Jadwal Bentrok with border-l-4 border-l-red-500 */}
        <div
          onClick={() => onNavigateTab('bentrok')}
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs border-l-4 border-l-red-500 hover:border-slate-300 transition-colors cursor-pointer"
        >
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Jadwal Bentrok</p>
          <h3 className="mt-1 text-3xl font-bold text-red-600">{conflictCount}</h3>
        </div>

        {/* Ruang Kosong with border-l-4 border-l-emerald-500 */}
        <div
          onClick={() => onNavigateTab('ruangan')}
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs border-l-4 border-l-emerald-500 hover:border-slate-300 transition-colors cursor-pointer"
        >
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Ruang Kosong</p>
          <h3 className="mt-1 text-3xl font-bold text-emerald-600">{estimatedEmptyRooms}</h3>
        </div>
      </div>

      {/* Supporting Data Master Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => onNavigateTab('kelas')}
          className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs hover:border-slate-300 transition-colors cursor-pointer flex items-center justify-between"
        >
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Total Kelas / Rombel</p>
            <h4 className="mt-1 text-2xl font-bold text-slate-800">{totalClasses}</h4>
          </div>
          <div className="w-10 h-10 rounded-md bg-slate-100 flex items-center justify-center text-slate-600">
            <GraduationCap className="w-5 h-5" />
          </div>
        </div>

        <div
          onClick={() => onNavigateTab('dosen')}
          className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs hover:border-slate-300 transition-colors cursor-pointer flex items-center justify-between"
        >
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Dosen Pengampu</p>
            <h4 className="mt-1 text-2xl font-bold text-slate-800">{totalLecturers}</h4>
          </div>
          <div className="w-10 h-10 rounded-md bg-slate-100 flex items-center justify-center text-slate-600">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        <div
          onClick={() => onNavigateTab('matakuliah')}
          className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs hover:border-slate-300 transition-colors cursor-pointer flex items-center justify-between"
        >
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Mata Kuliah Aktif</p>
            <h4 className="mt-1 text-2xl font-bold text-slate-800">{totalSubjects}</h4>
          </div>
          <div className="w-10 h-10 rounded-md bg-slate-100 flex items-center justify-center text-slate-600">
            <BookOpen className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Schedules per Day */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Distribusi Jadwal per Hari</h3>
              <p className="text-xs text-slate-500">Jumlah perkuliahan setiap hari kerja</p>
            </div>
            <TrendingUp className="w-4 h-4 text-slate-400" />
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={schedulePerDayData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="hari" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="total" name="Jumlah Jadwal" radius={[6, 6, 0, 0]}>
                  {schedulePerDayData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Room Utilization */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Penggunaan Ruangan</h3>
              <p className="text-xs text-slate-500">Frekuensi jadwal per ruangan kelas</p>
            </div>
            <Building className="w-4 h-4 text-slate-400" />
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={roomUsageData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <YAxis dataKey="ruangan" type="category" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="jadwalCount" name="Total Penggunaan" fill="#06b6d4" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Class Distribution */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Distribusi per Kelas</h3>
              <p className="text-xs text-slate-500">Porsi mata kuliah per rombel</p>
            </div>
            <GraduationCap className="w-4 h-4 text-slate-400" />
          </div>

          <div className="h-56 w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={classDistData}
                  dataKey="total"
                  nameKey="kelas"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  innerRadius={40}
                  paddingAngle={4}
                  label={({ kelas, total }) => `${kelas} (${total})`}
                >
                  {classDistData.map((_, index) => (
                    <Cell key={`slice-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Schedules preview */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 md:p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Jadwal Perkuliahan Terkini</h3>
            <p className="text-xs text-slate-500">Daftar agenda perkuliahan aktif</p>
          </div>
          <button
            id="dash-btn-view-all-schedules"
            onClick={() => onNavigateTab('jadwal')}
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition"
          >
            Lihat Semua ({totalSchedules})
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {yearSchedules.slice(0, 5).map((sch) => (
            <div
              key={sch.id}
              onClick={() => onSelectScheduleForDetail(sch.id)}
              className="p-4 hover:bg-slate-50/80 transition flex items-center justify-between gap-4 cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex flex-col items-center justify-center font-bold text-slate-700 shrink-0 text-xs">
                  <span>{sch.hari.slice(0, 3)}</span>
                  <span className="text-[9px] font-normal text-slate-500">{sch.sks} SKS</span>
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm font-semibold text-slate-900 truncate">{sch.mataKuliahNama}</h4>
                  <p className="text-xs text-slate-500 truncate">
                    {sch.kelasNama} • {sch.dosenNama}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right hidden sm:block">
                  <span className="text-xs font-mono font-medium text-slate-700">
                    {formatTimeRange(sch.jamMulai, sch.jamSelesai)}
                  </span>
                  <p className="text-[11px] text-slate-400">Ruang {sch.ruangNama}</p>
                </div>
                <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                  {sch.ruangNama}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
