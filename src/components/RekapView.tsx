import React, { useState } from 'react';
import {
  Search,
  Download,
  Plus,
  RefreshCw,
  Eye,
  Edit2,
  Trash2,
  FileText,
  Calendar,
  Building,
  ExternalLink,
  X,
  Save,
  CheckCircle2,
  Clock,
  XCircle,
  FileBadge
} from 'lucide-react';
import type { Pendaftar, User } from '../types/index.ts';
import { formatDateShort, filterPendaftar } from '../utils/rules.ts';
import { updatePendaftarData, deletePendaftarItem } from '../services/storageService.ts';

interface RekapViewProps {
  pendaftarList: Pendaftar[];
  currentUser: User;
  onNavigatePendaftaran: () => void;
  onRefresh: () => void;
}

export const RekapView: React.FC<RekapViewProps> = ({
  pendaftarList,
  currentUser,
  onNavigatePendaftaran,
  onRefresh
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [profesiFilter, setProfesiFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals state
  const [previewItem, setPreviewItem] = useState<Pendaftar | null>(null);
  const [previewTab, setPreviewTab] = useState<'ajuan' | 'str' | 'sip'>('ajuan');
  const [editItem, setEditItem] = useState<Pendaftar | null>(null);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<Pendaftar | null>(null);

  // Edit form state
  const [editNama, setEditNama] = useState('');
  const [editNip, setEditNip] = useState('');
  const [editPuskesmas, setEditPuskesmas] = useState('');
  const [editNoSurat, setEditNoSurat] = useState('');
  const [editMasaSIP, setEditMasaSIP] = useState('');
  const [editKategori, setEditKategori] = useState<any>('Kredensial');

  // Filter list
  const filteredData = filterPendaftar(pendaftarList, searchQuery, profesiFilter, statusFilter);

  // Status counts
  const totalCount = pendaftarList.length;
  const pendingCount = pendaftarList.filter(d => !d.statusVerifikasi || d.statusVerifikasi === 'Pending').length;
  const diterimaCount = pendaftarList.filter(d => d.statusVerifikasi === 'Diterima').length;
  const ditolakCount = pendaftarList.filter(d => d.statusVerifikasi === 'Ditolak').length;

  const handleOpenEdit = (item: Pendaftar) => {
    setEditItem(item);
    setEditNama(item.nama);
    setEditNip(item.nip);
    setEditPuskesmas(item.puskesmas);
    setEditNoSurat(item.noSurat);
    setEditMasaSIP(item.tglMasaSIP);
    setEditKategori(item.kategori);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editItem) return;

    updatePendaftarData(editItem.id, {
      nama: editNama,
      nip: editNip,
      puskesmas: editPuskesmas,
      noSurat: editNoSurat,
      tglMasaSIP: editMasaSIP,
      kategori: editKategori
    });

    setEditItem(null);
  };

  const handleDelete = () => {
    if (!deleteConfirmItem) return;
    deletePendaftarItem(deleteConfirmItem.id);
    setDeleteConfirmItem(null);
  };

  const exportToCSV = () => {
    if (filteredData.length === 0) {
      alert('Tidak ada data yang sesuai untuk diekspor.');
      return;
    }

    const headers = ['No', 'Nama Lengkap', 'NIP', 'Puskesmas', 'Profesi', 'Jenis Profesi', 'No Surat', 'Masa SIP', 'Status Verifikasi', 'Status Penilaian'];
    const rows = filteredData.map((d, i) => [
      i + 1,
      `"${d.nama.replace(/"/g, '""')}"`,
      `"${d.nip}"`,
      `"${d.puskesmas}"`,
      `"${d.profesi}"`,
      `"${d.jenisProfesi}"`,
      `"${d.noSurat}"`,
      `"${d.tglMasaSIP}"`,
      `"${d.statusVerifikasi}"`,
      `"${d.statusPenilaian}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Rekap_SDMK_Garut_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const canEdit = currentUser.hak === 'Admin' || currentUser.hak === 'User';

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Rekapitulasi Pendaftaran Kredensialing</h1>
          <p className="text-xs text-slate-500 mt-1">
            Daftar lengkap pendaftar nakes terintegrasi dengan Google Spreadsheet & Google Drive.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={onNavigatePendaftaran}
            className="px-3.5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Pendaftar</span>
          </button>
          <button
            type="button"
            onClick={onRefresh}
            className="p-2 text-slate-600 hover:text-slate-900 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
            title="Refresh data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={exportToCSV}
            className="px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama nakes, NIP, puskesmas, no surat..."
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:border-teal-600 focus:bg-white transition-all font-medium"
            />
          </div>

          {/* Profession Dropdown */}
          <select
            value={profesiFilter}
            onChange={(e) => setProfesiFilter(e.target.value)}
            className="w-full md:w-48 py-2 px-3 text-xs rounded-xl border border-slate-200 bg-slate-50/50 font-semibold text-slate-700 outline-none focus:border-teal-600"
          >
            <option value="">Semua Profesi</option>
            <option value="Dokter">Dokter</option>
            <option value="Dokter Gigi">Dokter Gigi</option>
            <option value="Bidan">Bidan</option>
            <option value="Perawat">Perawat</option>
          </select>
        </div>

        {/* Status Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <button
            type="button"
            onClick={() => setStatusFilter('')}
            className={`px-3 py-1.5 rounded-full font-bold transition-all cursor-pointer flex-none flex items-center gap-1.5 ${
              statusFilter === ''
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>Semua</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">{totalCount}</span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('Pending')}
            className={`px-3 py-1.5 rounded-full font-bold transition-all cursor-pointer flex-none flex items-center gap-1.5 ${
              statusFilter === 'Pending'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            <span>Menunggu (Pending)</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-200/50">{pendingCount}</span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('Diterima')}
            className={`px-3 py-1.5 rounded-full font-bold transition-all cursor-pointer flex-none flex items-center gap-1.5 ${
              statusFilter === 'Diterima'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            <span>Diterima (Valid)</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-200/50">{diterimaCount}</span>
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('Ditolak')}
            className={`px-3 py-1.5 rounded-full font-bold transition-all cursor-pointer flex-none flex items-center gap-1.5 ${
              statusFilter === 'Ditolak'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
            }`}
          >
            <span>Ditolak</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-200/50">{ditolakCount}</span>
          </button>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 w-12 text-center">No</th>
                <th className="py-3 px-4">Nama Lengkap & NIP</th>
                <th className="py-3 px-4">Profesi & Jenis</th>
                <th className="py-3 px-4">Puskesmas</th>
                <th className="py-3 px-4">No. Surat Ajuan</th>
                <th className="py-3 px-4">Masa SIP</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Berkas</th>
                <th className="py-3 px-4 text-center w-28">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    Tidak ada pendaftar yang cocok dengan filter pencarian.
                  </td>
                </tr>
              ) : (
                filteredData.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 text-center text-slate-400 font-mono">{idx + 1}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{item.nama}</div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">NIP: {item.nip || 'Non ASN (0)'}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-teal-800">{item.profesi}</div>
                      <div className="text-[11px] text-slate-500">{item.jenisProfesi}</div>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700">{item.puskesmas}</td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-600">{item.noSurat}</td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-600">{formatDateShort(item.tglMasaSIP)}</td>
                    <td className="py-3 px-4 text-center">
                      {item.statusVerifikasi === 'Diterima' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3 h-3" />
                          Diterima
                        </span>
                      ) : item.statusVerifikasi === 'Ditolak' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                          <XCircle className="w-3 h-3" />
                          Ditolak
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                          <Clock className="w-3 h-3" />
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          setPreviewItem(item);
                          setPreviewTab('ajuan');
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-[11px] transition-colors cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>3 Berkas</span>
                      </button>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setPreviewItem(item);
                            setPreviewTab('ajuan');
                          }}
                          className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors cursor-pointer"
                          title="Lihat Berkas"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {canEdit && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(item)}
                              className="p-1.5 text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                              title="Edit Data"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmItem(item)}
                              className="p-1.5 text-slate-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Hapus Data"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Responsive Cards View */}
      <div className="lg:hidden space-y-3">
        {filteredData.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 bg-white rounded-3xl border border-slate-200">
            Tidak ada pendaftar yang cocok dengan filter pencarian.
          </div>
        ) : (
          filteredData.map((item, idx) => (
            <div key={item.id} className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold text-teal-800 uppercase bg-teal-50 px-2 py-0.5 rounded-md">
                    {item.jenisProfesi}
                  </span>
                  <h3 className="font-bold text-sm text-slate-900 mt-1">{item.nama}</h3>
                  <p className="text-xs text-slate-500 font-mono">NIP: {item.nip || 'Non ASN (0)'}</p>
                </div>
                <div>
                  {item.statusVerifikasi === 'Diterima' ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      Diterima
                    </span>
                  ) : item.statusVerifikasi === 'Ditolak' ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                      Ditolak
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                      Pending
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100 text-slate-600">
                <div>
                  <span className="text-[10px] text-slate-400 block">Puskesmas:</span>
                  <span className="font-semibold text-slate-800">{item.puskesmas}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Masa Berlaku SIP:</span>
                  <span className="font-semibold text-slate-800 font-mono">{formatDateShort(item.tglMasaSIP)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setPreviewItem(item);
                    setPreviewTab('ajuan');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Lihat Berkas</span>
                </button>

                {canEdit && (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(item)}
                      className="p-2 text-slate-600 hover:text-amber-700 hover:bg-amber-50 rounded-xl transition-colors cursor-pointer"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmItem(item)}
                      className="p-2 text-slate-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                      title="Hapus"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Multi-Tab File Preview Modal */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-teal-600" />
                  <span>Preview Berkas Persyaratan</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {previewItem.nama} • {previewItem.puskesmas} ({previewItem.jenisProfesi})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Document Tabs */}
            <div className="flex border-b border-slate-200 bg-slate-100/60 px-5 text-xs font-bold">
              <button
                type="button"
                onClick={() => setPreviewTab('ajuan')}
                className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
                  previewTab === 'ajuan'
                    ? 'border-teal-600 text-teal-800 bg-white'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileBadge className="w-4 h-4" />
                <span>Surat Ajuan Puskesmas</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewTab('str')}
                className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
                  previewTab === 'str'
                    ? 'border-teal-600 text-teal-800 bg-white'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>STR KKI</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewTab('sip')}
                className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
                  previewTab === 'sip'
                    ? 'border-teal-600 text-teal-800 bg-white'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>SIP Aktif</span>
              </button>
            </div>

            {/* Document Content Simulation */}
            <div className="p-6 overflow-y-auto flex-1 bg-slate-50">
              <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm max-w-2xl mx-auto text-xs space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="font-bold text-slate-800">
                    {previewTab === 'ajuan' && 'SURAT PERMOHONAN KREDENSIALING'}
                    {previewTab === 'str' && 'SURAT TANDA REGISTRASI (STR)'}
                    {previewTab === 'sip' && 'SURAT IZIN PRAKTIK (SIP)'}
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-teal-50 text-teal-800 font-mono text-[10px] font-bold">
                    TERVERIFIKASI GOOGLE DRIVE
                  </span>
                </div>

                <div className="space-y-2 text-slate-700">
                  <div className="grid grid-cols-3">
                    <span className="text-slate-400">Nama Tenaga Kesehatan:</span>
                    <span className="col-span-2 font-bold text-slate-900">{previewItem.nama}</span>
                  </div>
                  <div className="grid grid-cols-3">
                    <span className="text-slate-400">NIP / NIK:</span>
                    <span className="col-span-2 font-mono">{previewItem.nip}</span>
                  </div>
                  <div className="grid grid-cols-3">
                    <span className="text-slate-400">Unit Pelayanan:</span>
                    <span className="col-span-2">{previewItem.puskesmas}</span>
                  </div>
                  <div className="grid grid-cols-3">
                    <span className="text-slate-400">Profesi / Kualifikasi:</span>
                    <span className="col-span-2 font-semibold text-teal-800">{previewItem.profesi} / {previewItem.jenisProfesi}</span>
                  </div>
                  <div className="grid grid-cols-3">
                    <span className="text-slate-400">Masa Berlaku SIP:</span>
                    <span className="col-span-2 font-mono font-semibold">{formatDateShort(previewItem.tglMasaSIP)}</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-teal-50/60 border border-teal-100 text-teal-900 text-[11px] leading-relaxed">
                  Berkas PDF terenkripsi dan disimpan di folder resmi Google Drive SDMK Dinas Kesehatan Kabupaten Garut (Folder ID: 1LqMGBg4zRNfIiXXtZ_OVQ9iLUAYzlENr).
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-white flex items-center justify-between">
              <a
                href={
                  previewTab === 'ajuan'
                    ? previewItem.urlAjuan
                    : previewTab === 'str'
                    ? previewItem.urlSTR
                    : previewItem.urlSIP
                }
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1.5"
              >
                <span>Buka Dokumen Asli di Google Drive</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-teal-600" />
                <span>Edit Data Pendaftar</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditItem(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1" htmlFor="editNamaInput">Nama Lengkap & Gelar</label>
                <input
                  id="editNamaInput"
                  type="text"
                  value={editNama}
                  onChange={(e) => setEditNama(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-medium outline-none focus:border-teal-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1" htmlFor="editNipInput">NIP / NIK</label>
                  <input
                    id="editNipInput"
                    type="text"
                    value={editNip}
                    onChange={(e) => setEditNip(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-medium outline-none focus:border-teal-600 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1" htmlFor="editPuskesmasInput">Puskesmas</label>
                  <input
                    id="editPuskesmasInput"
                    type="text"
                    value={editPuskesmas}
                    onChange={(e) => setEditPuskesmas(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-medium outline-none focus:border-teal-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1" htmlFor="editNoSuratInput">No. Surat Ajuan</label>
                  <input
                    id="editNoSuratInput"
                    type="text"
                    value={editNoSurat}
                    onChange={(e) => setEditNoSurat(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-medium outline-none focus:border-teal-600 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1" htmlFor="editMasaSIPInput">Masa SIP</label>
                  <input
                    id="editMasaSIPInput"
                    type="date"
                    value={editMasaSIP}
                    onChange={(e) => setEditMasaSIP(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-medium outline-none focus:border-teal-600"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditItem(null)}
                  className="px-4 py-2 font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl font-bold text-white bg-teal-600 hover:bg-teal-700 flex items-center gap-1.5 shadow-xs"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 mx-auto flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900">Konfirmasi Hapus Data</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Yakin ingin menghapus ajuan kredensial atas nama <strong>{deleteConfirmItem.nama}</strong>? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmItem(null)}
                className="px-4 py-2 font-bold text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-5 py-2 font-bold text-xs text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs"
              >
                Ya, Hapus Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
