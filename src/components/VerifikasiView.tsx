import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Search,
  Lock,
  RefreshCw,
  FileText,
  Building,
  UserCheck
} from 'lucide-react';
import type { Pendaftar, StatusVerifikasi } from '../types/index.ts';
import { formatDateShort, filterPendaftar } from '../utils/rules.ts';
import { updatePendaftarStatusVerifikasi } from '../services/storageService.ts';

interface VerifikasiViewProps {
  pendaftarList: Pendaftar[];
  onNavigatePenguji: () => void;
  onRefresh: () => void;
  onOpenPreview: (item: Pendaftar) => void;
}

export const VerifikasiView: React.FC<VerifikasiViewProps> = ({
  pendaftarList,
  onNavigatePenguji,
  onRefresh,
  onOpenPreview
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [profesiFilter, setProfesiFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('Pending'); // default to pending queue

  const filteredData = filterPendaftar(pendaftarList, searchQuery, profesiFilter, statusFilter);

  // Status counts
  const totalCount = pendaftarList.length;
  const pendingCount = pendaftarList.filter(d => !d.statusVerifikasi || d.statusVerifikasi === 'Pending').length;
  const diterimaCount = pendaftarList.filter(d => d.statusVerifikasi === 'Diterima').length;
  const ditolakCount = pendaftarList.filter(d => d.statusVerifikasi === 'Ditolak').length;

  const handleSetStatus = (id: string, status: StatusVerifikasi) => {
    updatePendaftarStatusVerifikasi(id, status);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200/60 mb-2">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Antrean Verifikasi Administrasi & Berkas</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900">Verifikasi Berkas Pendaftaran</h1>
          <p className="text-xs text-slate-500 mt-1">
            Periksa keabsahan Surat Ajuan, STR, dan SIP. Ajuan berstatus <strong>Diterima</strong> otomatis dialirkan ke Menu Penguji.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onNavigatePenguji}
            className="px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <UserCheck className="w-4 h-4" />
            <span>Buka Menu Penguji</span>
          </button>
          <button
            type="button"
            onClick={onRefresh}
            className="p-2 text-slate-600 hover:text-slate-900 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
            title="Refresh antrean"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter and Chips */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama, NIP, no surat, puskesmas..."
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:border-teal-600 focus:bg-white transition-all font-medium"
            />
          </div>

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

        {/* Chips */}
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
            <Clock className="w-3.5 h-3.5" />
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
            <CheckCircle2 className="w-3.5 h-3.5" />
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
            <XCircle className="w-3.5 h-3.5" />
            <span>Ditolak</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-rose-200/50">{ditolakCount}</span>
          </button>
        </div>
      </div>

      {/* Verification List / Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 w-12 text-center">No</th>
                <th className="py-3 px-4">Nama Lengkap & NIP</th>
                <th className="py-3 px-4">Profesi</th>
                <th className="py-3 px-4">No. Surat & Puskesmas</th>
                <th className="py-3 px-4">Masa Berlaku SIP</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center min-w-[240px]">Keputusan Verifikasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Tidak ada ajuan yang memerlukan verifikasi pada filter ini.
                  </td>
                </tr>
              ) : (
                filteredData.map((item, idx) => {
                  const isGraded = item.statusPenilaian === 'Selesai';
                  return (
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
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800">{item.puskesmas}</div>
                        <div className="text-[11px] font-mono text-slate-500 mt-0.5">{item.noSurat}</div>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                        {formatDateShort(item.tglMasaSIP)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {item.statusVerifikasi === 'Diterima' ? (
                          <div>
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              <CheckCircle2 className="w-3 h-3" />
                              Diterima
                            </span>
                            <div className="text-[10px] text-indigo-600 font-semibold mt-1">
                              {isGraded ? 'Sudah Dinilai' : 'Siap Diuji'}
                            </div>
                          </div>
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
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => onOpenPreview(item)}
                            className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-teal-50 border border-slate-200 rounded-xl transition-colors cursor-pointer"
                            title="Lihat Berkas Ajuan, STR, SIP"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {isGraded ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-500 font-bold text-[11px] border border-slate-200">
                              <Lock className="w-3.5 h-3.5 text-slate-400" />
                              <span>Terkunci (Sudah Dinilai)</span>
                            </span>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleSetStatus(item.id, 'Diterima')}
                                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 transition-all shadow-xs cursor-pointer"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Terima</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSetStatus(item.id, 'Ditolak')}
                                className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1 transition-all shadow-xs cursor-pointer"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Tolak</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
