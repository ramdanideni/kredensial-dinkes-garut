import React, { useState } from 'react';
import {
  UserCheck,
  CheckCircle2,
  Clock,
  ArrowLeft,
  AlertTriangle,
  Send,
  RotateCcw,
  Search,
  Calendar,
  Users,
  Info
} from 'lucide-react';
import type {
  Pendaftar,
  User,
  TanggalPenilaianMode,
  KeputusanPenguji,
  RekomendasiPenguji
} from '../types/index.ts';
import { MASTER_PENGUJI_BY_PROFESI, MASTER_INSTRUMENTS } from '../data/initialData.ts';
import { formatDateShort, validatePengujiDistinct, validateEvaluationDate, MAP_PILIHAN_PENDAFTAR } from '../utils/rules.ts';
import { savePenilaian, resetPenilaian } from '../services/storageService.ts';

interface PengujiViewProps {
  pendaftarList: Pendaftar[];
  currentUser: User;
  tanggalPenilaianMode: TanggalPenilaianMode;
  onRefresh: () => void;
}

export const PengujiView: React.FC<PengujiViewProps> = ({
  pendaftarList,
  currentUser,
  tanggalPenilaianMode,
  onRefresh
}) => {
  // Only candidates that have been verified (Diterima)
  let eligibleList = pendaftarList.filter(d => d.statusVerifikasi === 'Diterima');

  // If evaluator has specific profession, filter by that profession
  if (currentUser.hak === 'Penguji' && currentUser.profesi) {
    eligibleList = eligibleList.filter(d => d.profesi === currentUser.profesi);
  }

  const [searchQuery, setSearchQuery] = useState('');
  const [filterPenilaian, setFilterPenilaian] = useState(''); // '' | 'Belum' | 'Selesai'

  // Active evaluation candidate
  const [activeEvaluasiItem, setActiveEvaluasiItem] = useState<Pendaftar | null>(null);

  // Form states
  const [penguji1, setPenguji1] = useState('');
  const [penguji2, setPenguji2] = useState('');
  const [penguji3, setPenguji3] = useState('');
  const [inputTglPenilaian, setInputTglPenilaian] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [rekomendasi, setRekomendasi] = useState<RekomendasiPenguji>('Direkomendasikan');
  const [catatan, setCatatan] = useState('');
  const [tindakanDecisions, setTindakanDecisions] = useState<Record<string, KeputusanPenguji>>({});
  const [validationError, setValidationError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Filtering
  const filteredEligible = eligibleList.filter(item => {
    if (filterPenilaian && item.statusPenilaian !== filterPenilaian) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchNama = item.nama.toLowerCase().includes(q);
      const matchPusk = item.puskesmas.toLowerCase().includes(q);
      const matchProf = item.jenisProfesi.toLowerCase().includes(q);
      if (!matchNama && !matchPusk && !matchProf) return false;
    }
    return true;
  });

  const belumDinilaiCount = eligibleList.filter(d => d.statusPenilaian !== 'Selesai').length;
  const selesaiCount = eligibleList.filter(d => d.statusPenilaian === 'Selesai').length;

  const handleOpenEvaluasi = (item: Pendaftar) => {
    setActiveEvaluasiItem(item);
    setValidationError('');

    // Pre-fill evaluators if already present
    const pengujiList = item.namaPengujiList || [];
    setPenguji1(pengujiList[0] || '');
    setPenguji2(pengujiList[1] || '');
    setPenguji3(pengujiList[2] || '');

    setRekomendasi(item.rekomendasi || 'Direkomendasikan');
    setCatatan(item.catatan || '');

    // Set evaluation date
    const todayStr = new Date().toISOString().slice(0, 10);
    if (item.tglPenilaian) {
      setInputTglPenilaian(item.tglPenilaian.includes('-') && item.tglPenilaian.length === 10 ? item.tglPenilaian : todayStr);
    } else {
      setInputTglPenilaian(todayStr);
    }

    // Set decision map
    const map: Record<string, KeputusanPenguji> = {};
    const masterItems = MASTER_INSTRUMENTS[item.jenisProfesi] || [];

    masterItems.forEach(inst => {
      const existing = item.rincian?.find(r => r.tindakan === inst.nama);
      if (existing && existing.keputusanPenguji) {
        map[inst.nama] = existing.keputusanPenguji;
      } else {
        // Default based on applicant's choice
        if (existing?.pilihan === '2') {
          map[inst.nama] = 'Disetujui dibawah supervise';
        } else {
          map[inst.nama] = 'Disetujui berwenang penuh';
        }
      }
    });

    setTindakanDecisions(map);
  };

  const handleSaveEvaluasi = () => {
    if (!activeEvaluasiItem) return;

    // Validate 3 distinct evaluators
    const pengujiCheck = validatePengujiDistinct([penguji1, penguji2, penguji3]);
    if (!pengujiCheck.valid) {
      setValidationError(pengujiCheck.message);
      return;
    }

    // Validate date per setting mode
    const dateCheck = validateEvaluationDate(inputTglPenilaian, tanggalPenilaianMode);
    if (!dateCheck.valid) {
      setValidationError(dateCheck.message);
      return;
    }

    // Format decisions
    const masterItems = MASTER_INSTRUMENTS[activeEvaluasiItem.jenisProfesi] || [];
    const dataPenilaian = masterItems.map(item => ({
      tindakan: item.nama,
      hasil: tindakanDecisions[item.nama] || 'Disetujui berwenang penuh'
    }));

    setValidationError('');
    setIsSaving(true);

    setTimeout(() => {
      savePenilaian(
        activeEvaluasiItem.id,
        dataPenilaian,
        [penguji1, penguji2, penguji3],
        rekomendasi,
        catatan,
        inputTglPenilaian
      );
      setIsSaving(false);
      setActiveEvaluasiItem(null);
      onRefresh();
    }, 300);
  };

  const handleReset = (item: Pendaftar) => {
    if (confirm(`Yakin ingin mereset hasil penilaian ${item.nama}? Status akan kembali menjadi Belum Dinilai.`)) {
      resetPenilaian(item.id);
      onRefresh();
    }
  };

  const masterPengujiList = activeEvaluasiItem
    ? MASTER_PENGUJI_BY_PROFESI[activeEvaluasiItem.profesi] || []
    : [];

  const getDecisionColor = (val: KeputusanPenguji) => {
    switch (val) {
      case 'Disetujui berwenang penuh':
        return 'bg-emerald-50 text-emerald-800 border-emerald-300';
      case 'Disetujui dibawah supervise':
        return 'bg-amber-50 text-amber-800 border-amber-300';
      case 'Tidak disetujui (belum memenuhi)':
        return 'bg-rose-50 text-rose-800 border-rose-300';
      case 'Tidak disetujui (fasilitas tdk ada)':
        return 'bg-purple-50 text-purple-800 border-purple-300';
      default:
        return 'bg-white text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* If in evaluation mode, show evaluation scoring panel */}
      {activeEvaluasiItem ? (
        <div className="space-y-6 animate-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <button
                type="button"
                onClick={() => setActiveEvaluasiItem(null)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 hover:text-teal-900 mb-2 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Kembali ke Daftar Peserta</span>
              </button>
              <h1 className="text-xl font-bold text-slate-900">
                Lembar Penilaian Kewenangan Klinis
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Peserta: <strong>{activeEvaluasiItem.nama}</strong> • Puskesmas: <strong>{activeEvaluasiItem.puskesmas}</strong> ({activeEvaluasiItem.jenisProfesi})
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200">
                Mode Tgl: {tanggalPenilaianMode}
              </span>
            </div>
          </div>

          {validationError && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-center gap-3 font-semibold">
              <AlertTriangle className="w-5 h-5 text-rose-600 flex-none" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Tim Penguji & Tanggal Penilaian */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
              <Users className="w-4 h-4 text-teal-600" />
              <span>Tim 3 Penguji & Tanggal Penilaian</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
              {/* Tanggal Penilaian */}
              <div>
                <label className="block font-bold text-slate-700 mb-1" htmlFor="inputTanggalPenilaian">
                  Tanggal Penilaian <span className="text-rose-500">*</span>
                </label>
                <input
                  id="inputTanggalPenilaian"
                  type="date"
                  disabled={tanggalPenilaianMode === 'realtime'}
                  value={inputTglPenilaian}
                  min={tanggalPenilaianMode === 'no_backdate' ? new Date().toISOString().slice(0, 10) : undefined}
                  onChange={(e) => setInputTglPenilaian(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border border-slate-200 font-medium outline-none focus:border-teal-600 ${
                    tanggalPenilaianMode === 'realtime' ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'bg-white'
                  }`}
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  {tanggalPenilaianMode === 'realtime'
                    ? 'Otomatis hari ini (realtime mode).'
                    : tanggalPenilaianMode === 'no_backdate'
                    ? 'Tidak boleh mundur dari hari ini.'
                    : 'Bebas memilih tanggal.'}
                </span>
              </div>

              {/* Penguji 1 */}
              <div>
                <label className="block font-bold text-slate-700 mb-1" htmlFor="selectPenguji1">
                  Penguji 1 (Ketua) <span className="text-rose-500">*</span>
                </label>
                <select
                  id="selectPenguji1"
                  value={penguji1}
                  onChange={(e) => setPenguji1(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium outline-none focus:border-teal-600"
                >
                  <option value="">-- Pilih Penguji 1 --</option>
                  {masterPengujiList.map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </div>

              {/* Penguji 2 */}
              <div>
                <label className="block font-bold text-slate-700 mb-1" htmlFor="selectPenguji2">
                  Penguji 2 (Anggota) <span className="text-rose-500">*</span>
                </label>
                <select
                  id="selectPenguji2"
                  value={penguji2}
                  onChange={(e) => setPenguji2(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium outline-none focus:border-teal-600"
                >
                  <option value="">-- Pilih Penguji 2 --</option>
                  {masterPengujiList.map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </div>

              {/* Penguji 3 */}
              <div>
                <label className="block font-bold text-slate-700 mb-1" htmlFor="selectPenguji3">
                  Penguji 3 (Anggota) <span className="text-rose-500">*</span>
                </label>
                <select
                  id="selectPenguji3"
                  value={penguji3}
                  onChange={(e) => setPenguji3(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium outline-none focus:border-teal-600"
                >
                  <option value="">-- Pilih Penguji 3 --</option>
                  {masterPengujiList.map(name => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Instruments Table */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900">
                Instrumen Rincian Kewenangan Klinis ({activeEvaluasiItem.jenisProfesi})
              </h2>
              <span className="text-xs text-slate-500">
                Tentukan persetujuan tim penguji per tindakan
              </span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4 w-12 text-center">No</th>
                    <th className="py-3 px-4 min-w-[260px]">Jenis Pelayanan / Tindakan</th>
                    <th className="py-3 px-4 w-44 text-center">Pengajuan Nakes</th>
                    <th className="py-3 px-4 min-w-[240px]">Keputusan Tim Penguji</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(MASTER_INSTRUMENTS[activeEvaluasiItem.jenisProfesi] || []).map((inst, idx) => {
                    const applicantReq = activeEvaluasiItem.rincian?.find(r => r.tindakan === inst.nama)?.pilihan || '1';
                    const decision = tindakanDecisions[inst.nama] || 'Disetujui berwenang penuh';

                    return (
                      <tr key={inst.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 text-center text-slate-400 font-mono">{idx + 1}</td>
                        <td className="py-3 px-4 font-semibold text-slate-800">{inst.nama}</td>
                        <td className="py-3 px-4 text-center">
                          <span className="inline-block px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-mono text-[11px] font-bold">
                            {MAP_PILIHAN_PENDAFTAR[applicantReq] || 'Kompeten Sepenuhnya'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <select
                            value={decision}
                            onChange={(e) => setTindakanDecisions({
                              ...tindakanDecisions,
                              [inst.nama]: e.target.value as KeputusanPenguji
                            })}
                            className={`w-full py-1.5 px-3 rounded-xl border font-bold text-xs outline-none cursor-pointer ${getDecisionColor(decision)}`}
                          >
                            <option value="Disetujui berwenang penuh">Disetujui berwenang penuh</option>
                            <option value="Disetujui dibawah supervise">Disetujui dibawah supervise</option>
                            <option value="Tidak disetujui (belum memenuhi)">Tidak disetujui (belum memenuhi)</option>
                            <option value="Tidak disetujui (fasilitas tdk ada)">Tidak disetujui (fasilitas tdk ada)</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Rekomendasi & Catatan Tambahan */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">
              Keputusan Rekomendasi & Catatan Tim Penguji
            </h2>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-2">
                  Pilihan Rekomendasi Kredensial: <span className="text-rose-500">*</span>
                </label>
                <div className="flex flex-wrap gap-4">
                  <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-emerald-50 cursor-pointer font-bold text-emerald-800">
                    <input
                      type="radio"
                      name="rekRadio"
                      value="Direkomendasikan"
                      checked={rekomendasi === 'Direkomendasikan'}
                      onChange={() => setRekomendasi('Direkomendasikan')}
                      className="w-4 h-4 accent-emerald-600"
                    />
                    <span>Direkomendasikan</span>
                  </label>

                  <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-amber-50 cursor-pointer font-bold text-amber-800">
                    <input
                      type="radio"
                      name="rekRadio"
                      value="Direkomendasikan dengan Catatan"
                      checked={rekomendasi === 'Direkomendasikan dengan Catatan'}
                      onChange={() => setRekomendasi('Direkomendasikan dengan Catatan')}
                      className="w-4 h-4 accent-amber-600"
                    />
                    <span>Direkomendasikan dengan Catatan</span>
                  </label>

                  <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-rose-50 cursor-pointer font-bold text-rose-800">
                    <input
                      type="radio"
                      name="rekRadio"
                      value="Tidak direkomendasikan"
                      checked={rekomendasi === 'Tidak direkomendasikan'}
                      onChange={() => setRekomendasi('Tidak direkomendasikan')}
                      className="w-4 h-4 accent-rose-600"
                    />
                    <span>Tidak direkomendasikan</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1" htmlFor="catatanTambahanInput">
                  Catatan Tambahan Penguji:
                </label>
                <textarea
                  id="catatanTambahanInput"
                  rows={3}
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  placeholder="Isi saran perbaikan, rekomendasi supervisi, atau catatan khusus dari tim kredensialing..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-medium outline-none focus:border-teal-600"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveEvaluasiItem(null)}
                className="px-4 py-2.5 font-bold text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={handleSaveEvaluasi}
                className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-md shadow-emerald-600/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSaving ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Simpan & Terbitkan Hasil Penilaian</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Candidates List */
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
            <div>
              <h1 className="text-xl font-bold text-slate-900">Portal Tim Penguji Kredensialing</h1>
              <p className="text-xs text-slate-500 mt-1">
                Daftar tenaga kesehatan yang telah diverifikasi dan siap dinilai kewenangan klinisnya.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">
                {currentUser.hak === 'Penguji' && currentUser.profesi ? `Khusus Profesi: ${currentUser.profesi}` : 'Semua Profesi'}
              </span>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="relative w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari peserta, NIP, puskesmas..."
                className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:border-teal-600 focus:bg-white transition-all font-medium"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto text-xs">
              <button
                type="button"
                onClick={() => setFilterPenilaian('')}
                className={`px-3 py-1.5 rounded-full font-bold transition-all cursor-pointer flex-none ${
                  filterPenilaian === ''
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>Semua ({eligibleList.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setFilterPenilaian('Belum')}
                className={`px-3 py-1.5 rounded-full font-bold transition-all cursor-pointer flex-none flex items-center gap-1.5 ${
                  filterPenilaian === 'Belum'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Belum Dinilai ({belumDinilaiCount})</span>
              </button>

              <button
                type="button"
                onClick={() => setFilterPenilaian('Selesai')}
                className={`px-3 py-1.5 rounded-full font-bold transition-all cursor-pointer flex-none flex items-center gap-1.5 ${
                  filterPenilaian === 'Selesai'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Selesai Dinilai ({selesaiCount})</span>
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4 w-12 text-center">No</th>
                    <th className="py-3 px-4">Nama Lengkap & NIP</th>
                    <th className="py-3 px-4">Profesi / Jenis</th>
                    <th className="py-3 px-4">Puskesmas</th>
                    <th className="py-3 px-4 text-center">Status Penilaian</th>
                    <th className="py-3 px-4 text-center w-40">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredEligible.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        Belum ada peserta berstatus &quot;Diterima&quot; yang sesuai pada filter ini.
                      </td>
                    </tr>
                  ) : (
                    filteredEligible.map((item, idx) => {
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
                          <td className="py-3 px-4 font-medium text-slate-700">{item.puskesmas}</td>
                          <td className="py-3 px-4 text-center">
                            {isGraded ? (
                              <div>
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">
                                  <CheckCircle2 className="w-3 h-3" />
                                  Selesai
                                </span>
                                <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                                  {formatDateShort(item.tglPenilaian)}
                                </div>
                              </div>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                                <Clock className="w-3 h-3" />
                                Belum Dinilai
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleOpenEvaluasi(item)}
                                className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1 transition-colors shadow-xs cursor-pointer"
                              >
                                <span>{isGraded ? 'Edit Nilai' : 'Mulai Nilai'}</span>
                              </button>

                              {isGraded && (
                                <button
                                  type="button"
                                  onClick={() => handleReset(item)}
                                  className="p-1.5 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition-colors cursor-pointer"
                                  title="Reset Hasil Penilaian"
                                >
                                  <RotateCcw className="w-4 h-4" />
                                </button>
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
      )}
    </div>
  );
};
