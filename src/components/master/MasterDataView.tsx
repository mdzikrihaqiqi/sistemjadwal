import React, { useState } from 'react';
import { useAcademic } from '../../context/AcademicContext';
import {
  Subject,
  Lecturer,
  Room,
  AcademicClass,
  AcademicYear,
} from '../../types';
import {
  BookOpen,
  UserCheck,
  Building,
  GraduationCap,
  Calendar,
  Plus,
  Edit2,
  Trash2,
  Search,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { ConfirmDialog } from '../common/ConfirmDialog';

export type MasterSection = 'matakuliah' | 'dosen' | 'ruangan' | 'kelas' | 'tahun-akademik';

interface MasterDataViewProps {
  initialSection: MasterSection;
}

export const MasterDataView: React.FC<MasterDataViewProps> = ({ initialSection }) => {
  const {
    subjects,
    addSubject,
    updateSubject,
    deleteSubject,

    lecturers,
    addLecturer,
    updateLecturer,
    deleteLecturer,

    rooms,
    addRoom,
    updateRoom,
    deleteRoom,

    classes,
    addClass,
    updateClass,
    deleteClass,

    academicYears,
    activeAcademicYearId,
    setActiveAcademicYearId,
    addAcademicYear,
  } = useAcademic();

  const [activeSection, setActiveSection] = useState<MasterSection>(initialSection);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal forms state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Form states
  const [subjectForm, setSubjectForm] = useState<Partial<Subject>>({
    kode: '',
    nama: '',
    sks: 2,
    semester: 1,
    prodi: 'Manajemen Bisnis Syariah',
  });

  const [lecturerForm, setLecturerForm] = useState<Partial<Lecturer>>({
    nidn: '',
    nama: '',
    email: '',
    noHp: '',
  });

  const [roomForm, setRoomForm] = useState<Partial<Room>>({
    kode: '',
    nama: '',
    kapasitas: 40,
    gedung: 'Gedung Kuliah Terpadu',
    fasilitas: ['Proyektor', 'AC'],
  });

  const [classForm, setClassForm] = useState<Partial<AcademicClass>>({
    kode: '',
    nama: '',
    prodi: 'Manajemen Bisnis Syariah',
    angkatan: 2024,
  });

  const [academicYearForm, setAcademicYearForm] = useState<Partial<AcademicYear>>({
    tahun: '2026/2027',
    semester: 'Ganjil',
    statusAktif: false,
  });

  // Open Edit handlers
  const handleOpenEdit = (item: any) => {
    setEditingItem(item);
    if (activeSection === 'matakuliah') setSubjectForm({ ...item });
    if (activeSection === 'dosen') setLecturerForm({ ...item });
    if (activeSection === 'ruangan') setRoomForm({ ...item });
    if (activeSection === 'kelas') setClassForm({ ...item });
    setIsAddModalOpen(true);
  };

  const handleOpenAdd = () => {
    setEditingItem(null);
    if (activeSection === 'matakuliah') {
      setSubjectForm({
        kode: `MK-${Math.floor(100 + Math.random() * 900)}`,
        nama: '',
        sks: 2,
        semester: 1,
        prodi: 'Manajemen Bisnis Syariah',
      });
    }
    if (activeSection === 'dosen') {
      setLecturerForm({
        nidn: `00${Math.floor(10000000 + Math.random() * 90000000)}`,
        nama: '',
        email: '',
        noHp: '',
      });
    }
    if (activeSection === 'ruangan') {
      setRoomForm({
        kode: `R-${Math.floor(100 + Math.random() * 900)}`,
        nama: '',
        kapasitas: 40,
        gedung: 'Gedung Kuliah Terpadu',
        fasilitas: ['Proyektor', 'AC'],
      });
    }
    if (activeSection === 'kelas') {
      setClassForm({
        kode: `KL-${Math.floor(100 + Math.random() * 900)}`,
        nama: '',
        prodi: 'Manajemen Bisnis Syariah',
        angkatan: 2024,
      });
    }
    if (activeSection === 'tahun-akademik') {
      setAcademicYearForm({
        tahun: '2027/2028',
        semester: 'Ganjil',
        statusAktif: false,
      });
    }
    setIsAddModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeSection === 'matakuliah') {
      if (editingItem) {
        updateSubject({ ...editingItem, ...subjectForm });
      } else {
        addSubject(subjectForm as Omit<Subject, 'id'>);
      }
    } else if (activeSection === 'dosen') {
      if (editingItem) {
        updateLecturer({ ...editingItem, ...lecturerForm });
      } else {
        addLecturer(lecturerForm as Omit<Lecturer, 'id'>);
      }
    } else if (activeSection === 'ruangan') {
      if (editingItem) {
        updateRoom({ ...editingItem, ...roomForm });
      } else {
        addRoom(roomForm as Omit<Room, 'id'>);
      }
    } else if (activeSection === 'kelas') {
      if (editingItem) {
        updateClass({ ...editingItem, ...classForm });
      } else {
        addClass(classForm as Omit<AcademicClass, 'id'>);
      }
    } else if (activeSection === 'tahun-akademik') {
      addAcademicYear(academicYearForm as Omit<AcademicYear, 'id'>);
    }
    setIsAddModalOpen(false);
  };

  const handleConfirmDelete = () => {
    if (!confirmDeleteId) return;
    if (activeSection === 'matakuliah') deleteSubject(confirmDeleteId);
    if (activeSection === 'dosen') deleteLecturer(confirmDeleteId);
    if (activeSection === 'ruangan') deleteRoom(confirmDeleteId);
    if (activeSection === 'kelas') deleteClass(confirmDeleteId);
    setConfirmDeleteId(null);
  };

  // Filtered lists
  const filteredSubjects = subjects.filter(
    (s) =>
      s.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.kode.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredLecturers = lecturers.filter(
    (l) =>
      l.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.nidn?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredRooms = rooms.filter(
    (r) =>
      r.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.gedung.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredClasses = classes.filter(
    (c) =>
      c.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.prodi.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-5">
      {/* Top Section Nav Tabs */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            id="tab-master-subject"
            onClick={() => setActiveSection('matakuliah')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeSection === 'matakuliah'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" /> Mata Kuliah ({subjects.length})
          </button>
          <button
            id="tab-master-lecturer"
            onClick={() => setActiveSection('dosen')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeSection === 'dosen'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <UserCheck className="w-4 h-4" /> Dosen ({lecturers.length})
          </button>
          <button
            id="tab-master-room"
            onClick={() => setActiveSection('ruangan')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeSection === 'ruangan'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Building className="w-4 h-4" /> Ruangan ({rooms.length})
          </button>
          <button
            id="tab-master-class"
            onClick={() => setActiveSection('kelas')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeSection === 'kelas'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <GraduationCap className="w-4 h-4" /> Kelas ({classes.length})
          </button>
          <button
            id="tab-master-ay"
            onClick={() => setActiveSection('tahun-akademik')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeSection === 'tahun-akademik'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Calendar className="w-4 h-4" /> Tahun Akademik
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="input-search-master"
              type="text"
              placeholder="Cari data..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-hidden"
            />
          </div>
          <button
            id="btn-add-master-item"
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
          >
            <Plus className="w-4 h-4" /> Tambah Data
          </button>
        </div>
      </div>

      {/* Table Container based on activeSection */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {/* Mata Kuliah Table */}
        {activeSection === 'matakuliah' && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase text-[11px]">
                <tr>
                  <th className="py-3 px-4">Kode MK</th>
                  <th className="py-3 px-4">Nama Mata Kuliah</th>
                  <th className="py-3 px-4 text-center">SKS</th>
                  <th className="py-3 px-4">Semester</th>
                  <th className="py-3 px-4">Program Studi</th>
                  <th className="py-3 px-4 text-center w-24">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredSubjects.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-bold text-emerald-800">{sub.kode}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{sub.nama}</td>
                    <td className="py-3 px-4 text-center font-bold text-slate-700">{sub.sks} SKS</td>
                    <td className="py-3 px-4 text-slate-600">Semester {sub.semester}</td>
                    <td className="py-3 px-4 text-slate-600">{sub.prodi}</td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(sub)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(sub.id)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Dosen Table */}
        {activeSection === 'dosen' && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase text-[11px]">
                <tr>
                  <th className="py-3 px-4">NIDN / NIP</th>
                  <th className="py-3 px-4">Nama Lengkap &amp; Gelar</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">No. Handphone</th>
                  <th className="py-3 px-4 text-center w-24">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredLecturers.map((lec) => (
                  <tr key={lec.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-medium text-slate-500">{lec.nidn || '-'}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{lec.nama}</td>
                    <td className="py-3 px-4 text-slate-600">{lec.email || '-'}</td>
                    <td className="py-3 px-4 font-mono text-slate-600">{lec.noHp || '-'}</td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(lec)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(lec.id)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Ruangan Table */}
        {activeSection === 'ruangan' && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase text-[11px]">
                <tr>
                  <th className="py-3 px-4">Kode Ruang</th>
                  <th className="py-3 px-4">Nama Ruangan</th>
                  <th className="py-3 px-4">Gedung</th>
                  <th className="py-3 px-4 text-center">Kapasitas</th>
                  <th className="py-3 px-4">Fasilitas</th>
                  <th className="py-3 px-4 text-center w-24">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredRooms.map((rm) => (
                  <tr key={rm.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-medium text-slate-500">{rm.kode}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">Ruang {rm.nama}</td>
                    <td className="py-3 px-4 text-slate-600">{rm.gedung}</td>
                    <td className="py-3 px-4 text-center font-bold text-emerald-800">{rm.kapasitas} Kursi</td>
                    <td className="py-3 px-4 text-slate-600">
                      <div className="flex flex-wrap gap-1">
                        {rm.fasilitas?.map((f, i) => (
                          <span key={i} className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px]">
                            {f}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(rm)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(rm.id)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Kelas Table */}
        {activeSection === 'kelas' && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase text-[11px]">
                <tr>
                  <th className="py-3 px-4">Kode Kelas</th>
                  <th className="py-3 px-4">Nama Kelas / Rombel</th>
                  <th className="py-3 px-4">Program Studi</th>
                  <th className="py-3 px-4 text-center">Angkatan</th>
                  <th className="py-3 px-4 text-center w-24">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredClasses.map((cls) => (
                  <tr key={cls.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-medium text-slate-500">{cls.kode}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{cls.nama}</td>
                    <td className="py-3 px-4 text-slate-600">{cls.prodi}</td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-slate-700">{cls.angkatan}</td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(cls)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(cls.id)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tahun Akademik Table */}
        {activeSection === 'tahun-akademik' && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase text-[11px]">
                <tr>
                  <th className="py-3 px-4">Tahun Ajaran</th>
                  <th className="py-3 px-4">Semester</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center w-36">Pilih Aktif</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {academicYears.map((ay) => {
                  const isActive = ay.id === activeAcademicYearId;

                  return (
                    <tr key={ay.id} className="hover:bg-slate-50">
                      <td className="py-3.5 px-4 font-bold text-slate-900">{ay.tahun}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-700">{ay.semester}</td>
                      <td className="py-3.5 px-4 text-center">
                        {isActive ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle className="w-3 h-3 text-emerald-600" /> Aktif
                          </span>
                        ) : (
                          <span className="text-slate-400">Tidak Aktif</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => setActiveAcademicYearId(ay.id)}
                          disabled={isActive}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                            isActive
                              ? 'bg-slate-100 text-slate-400 cursor-default'
                              : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs'
                          }`}
                        >
                          {isActive ? 'Sedang Digunakan' : 'Aktifkan'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Form */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={`${editingItem ? 'Edit' : 'Tambah'} ${
          activeSection === 'matakuliah'
            ? 'Mata Kuliah'
            : activeSection === 'dosen'
            ? 'Dosen'
            : activeSection === 'ruangan'
            ? 'Ruangan'
            : activeSection === 'kelas'
            ? 'Kelas'
            : 'Tahun Akademik'
        }`}
        id="modal-master-form"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          {activeSection === 'matakuliah' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Kode MK</label>
                <input
                  type="text"
                  required
                  value={subjectForm.kode || ''}
                  onChange={(e) => setSubjectForm({ ...subjectForm, kode: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono font-semibold focus:ring-2 focus:ring-emerald-500 outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Mata Kuliah</label>
                <input
                  type="text"
                  required
                  value={subjectForm.nama || ''}
                  onChange={(e) => setSubjectForm({ ...subjectForm, nama: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-hidden"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">SKS</label>
                  <input
                    type="number"
                    min={1}
                    max={6}
                    required
                    value={subjectForm.sks || 2}
                    onChange={(e) => setSubjectForm({ ...subjectForm, sks: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Semester</label>
                  <input
                    type="number"
                    min={1}
                    max={8}
                    required
                    value={subjectForm.semester || 1}
                    onChange={(e) => setSubjectForm({ ...subjectForm, semester: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-hidden"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Program Studi</label>
                <input
                  type="text"
                  required
                  value={subjectForm.prodi || ''}
                  onChange={(e) => setSubjectForm({ ...subjectForm, prodi: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-hidden"
                />
              </div>
            </>
          )}

          {activeSection === 'dosen' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">NIDN / NIP</label>
                <input
                  type="text"
                  value={lecturerForm.nidn || ''}
                  onChange={(e) => setLecturerForm({ ...lecturerForm, nidn: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-emerald-500 outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Lengkap &amp; Gelar</label>
                <input
                  type="text"
                  required
                  value={lecturerForm.nama || ''}
                  onChange={(e) => setLecturerForm({ ...lecturerForm, nama: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  value={lecturerForm.email || ''}
                  onChange={(e) => setLecturerForm({ ...lecturerForm, email: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">No. Handphone</label>
                <input
                  type="text"
                  value={lecturerForm.noHp || ''}
                  onChange={(e) => setLecturerForm({ ...lecturerForm, noHp: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-hidden"
                />
              </div>
            </>
          )}

          {activeSection === 'ruangan' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Kode Ruang</label>
                  <input
                    type="text"
                    required
                    value={roomForm.kode || ''}
                    onChange={(e) => setRoomForm({ ...roomForm, kode: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-emerald-500 outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Ruang</label>
                  <input
                    type="text"
                    required
                    placeholder="B1, Aula II"
                    value={roomForm.nama || ''}
                    onChange={(e) => setRoomForm({ ...roomForm, nama: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-500 outline-hidden"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Kapasitas</label>
                  <input
                    type="number"
                    required
                    min={10}
                    value={roomForm.kapasitas || 40}
                    onChange={(e) => setRoomForm({ ...roomForm, kapasitas: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Gedung</label>
                  <input
                    type="text"
                    required
                    value={roomForm.gedung || ''}
                    onChange={(e) => setRoomForm({ ...roomForm, gedung: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-hidden"
                  />
                </div>
              </div>
            </>
          )}

          {activeSection === 'kelas' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Kode Kelas</label>
                  <input
                    type="text"
                    required
                    value={classForm.kode || ''}
                    onChange={(e) => setClassForm({ ...classForm, kode: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-emerald-500 outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nama Rombel / Kelas</label>
                  <input
                    type="text"
                    required
                    placeholder="I MBS, II PBS"
                    value={classForm.nama || ''}
                    onChange={(e) => setClassForm({ ...classForm, nama: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-500 outline-hidden"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Program Studi</label>
                  <input
                    type="text"
                    required
                    value={classForm.prodi || ''}
                    onChange={(e) => setClassForm({ ...classForm, prodi: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Angkatan</label>
                  <input
                    type="number"
                    required
                    value={classForm.angkatan || 2024}
                    onChange={(e) => setClassForm({ ...classForm, angkatan: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-hidden"
                  />
                </div>
              </div>
            </>
          )}

          {activeSection === 'tahun-akademik' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tahun Ajaran</label>
                <input
                  type="text"
                  required
                  placeholder="2026/2027"
                  value={academicYearForm.tahun || ''}
                  onChange={(e) => setAcademicYearForm({ ...academicYearForm, tahun: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-500 outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Semester</label>
                <select
                  value={academicYearForm.semester || 'Ganjil'}
                  onChange={(e) => setAcademicYearForm({ ...academicYearForm, semester: e.target.value as any })}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 outline-hidden"
                >
                  <option value="Ganjil">Ganjil</option>
                  <option value="Genap">Genap</option>
                </select>
              </div>
            </>
          )}

          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs"
            >
              Simpan Data
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(confirmDeleteId)}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={handleConfirmDelete}
        title="Hapus Data Master"
        message="Apakah Anda yakin ingin menghapus data master ini? Data terkait mungkin terpengaruh."
        confirmText="Hapus Data"
        variant="danger"
        id="confirm-delete-master"
      />
    </div>
  );
};
