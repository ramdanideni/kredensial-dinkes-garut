import React, { useState, useEffect } from 'react';
import {
  FileText,
  UserCheck,
  Building,
  Upload,
  Calendar,
  Send,
  AlertCircle,
  FileCheck2,
  Clock,
  Sparkles,
  Info
} from 'lucide-react';
import type { User, KategoriPendaftaran, DeadlineSettings } from '../types/index.ts';
import { MASTER_INSTRUMENTS } from '../data/initialData.ts';
import { addPendaftar } from '../services/storageService.ts';
import { calculateCountdown } from '../utils/rules.ts';

interface PendaftaranViewProps {
  currentUser: User;
  deadlineSettings: DeadlineSettings | null;
  onSuccessSubmit: () => void;
}

export const PendaftaranView: React.FC<PendaftaranViewProps> = ({
  currentUser,
  deadlineSettings,
  onSuccessSubmit
}) => {
  // Countdown check
  const [countdown, setCountdown] = useState(
    calculateCountdown(deadlineSettings?.tanggal, deadlineSettings?.jam)
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(calculateCountdown(deadlineSettings?.tanggal, deadlineSettings?.jam));
    }, 1000);
    return () => clearInterval(timer);
  }, [deadlineSettings]);

  // Form states
  const [kategori, setKategori] = useState<KategoriPendaftaran>('Kredensial');
  const [nama, setNama] = useState('');
  const [nip, setNip] = useState('');
  const [puskesmas, setPuskesmas] = useState(
    currentUser.hak === 'User' && currentUser.puskesmas ? currentUser.puskesmas : 'Puskesmas Garut'
  );
  const [profesi, setProfesi] = useState<'Dokter' | 'Dokter Gigi' | 'Bidan' | 'Perawat'>('Dokter');
  const [jenisProfesi, setJenisProfesi] = useState('Dokter');
  const [noSurat, setNoSurat] = useState('');
  const [tglMasaSIP, setTglMasaSIP] = useState('');

  // Files
  const [fileAjuanName, setFileAjuanName] = useState('');
  const [fileSTRName, setFileSTRName] = useState('');
  const [fileSIPName, setFileSIPName] = useState('');

  // Clinical privileges
  const [pilihanRincian, setPilihanRincian] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Handle profession change and auto-set sub-types
  const handleProfesiChange = (newProfesi: 'Dokter' | 'Dokter Gigi' | 'Bidan' | 'Perawat') => {
    setProfesi(newProfesi);
    if (newProfesi === 'Dokter') setJenisProfesi('Dokter');
    else if (newProfesi === 'Dokter Gigi') setJenisProfesi('Dokter Gigi');
    else if (newProfesi === 'Bidan') setJenisProfesi('Bidan Vokasi');
    else if (newProfesi === 'Perawat') setJenisProfesi('Perawat Vokasi');
  };

  // Get instruments for active jenisProfesi
  const currentInstruments = MASTER_INSTRUMENTS[jenisProfesi] || [];

  // Reset or initialize clinical choices when jenisProfesi changes
  useEffect(() => {
    const initialMap: Record<string, string> = {};
    currentInstruments.forEach(item => {
      initialMap[item.nama] = '1'; // default kompeten
    });
    setPilihanRincian(initialMap);
  }, [jenisProfesi]);

  const handleBulkSelect = (val: string) => {
    const updated: Record<string, string> = {};
    currentInstruments.forEach(item => {
      updated[item.nama] = val;
    });
    setPilihanRincian(updated);
  };

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (name: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Ukuran file melebihi 5MB. Silakan pilih berkas PDF yang lebih kecil.');
        e.target.value = '';
        return;
      }
      setter(file.name);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser.hak === 'Verifikator') {
      alert('Akun Verifikator hanya memiliki hak baca dan verifikasi berkas.');
      return;
    }
    if (countdown.isClosed) {
      alert('Pendaftaran telah ditutup karena melewati batas waktu.');
      return;
    }

    if (!nama || !nip || !noSurat || !tglMasaSIP) {
      setErrorMessage('Harap lengkapi semua kolom bertanda bintang (*).');
      return;
    }

    setErrorMessage('');
    setIsSubmitting(true);

    setTimeout(() => {
      const rincianArray = currentInstruments.map(item => ({
        tindakan: item.nama,
        pilihan: pilihanRincian[item.nama] || '1'
      }));

      addPendaftar({
        kategori,
        nama,
        nip,
        puskesmas,
        profesi,
        jenisProfesi,
        noSurat,
        tglMasaSIP,
        urlAjuan: 'https://drive.google.com/file/d/demoAjuan/view',
        urlSTR: 'https://drive.google.com/file/d/demoSTR/view',
        urlSIP: 'https://drive.google.com/file/d/demoSIP/view',
        fileAjuanName: fileAjuanName || `Surat_Ajuan_${nama.replace(/\s+/g, '_')}.pdf`,
        fileSTRName: fileSTRName || `STR_${nama.replace(/\s+/g, '_')}.pdf`,
        fileSIPName: fileSIPName || `SIP_${nama.replace(/\s+/g, '_')}.pdf`,
        rincian: rincianArray
      });

      setIsSubmitting(false);
      setSubmittedSuccess(true);
      onSuccessSubmit();
    }, 400);
  };

  const handleResetForm = () => {
    setNama('');
    setNip('');
    setNoSurat('');
    setTglMasaSIP('');
    setFileAjuanName('');
    setFileSTRName('');
    setFileSIPName('');
    setSubmittedSuccess(false);
  };

  if (submittedSuccess) {
    return (
      <div className="bg-white rounded-3xl p-8 sm:p-14 border border-slate-200/80 shadow-sm text-center max-w-xl mx-auto my-8 animate-in zoom-in-95 duration-300">
        <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl mx-auto flex items-center justify-center mb-6 shadow-inner">
          <FileCheck2 className="w-10 h-10" />
        </div>
        <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
          Pendaftaran Berhasil Disimpan
        </span>
        <h2 className="text-2xl font-black text-slate-900 mt-3 mb-2">
          Ajuan Kredensialing Terkirim!
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-md mx-auto mb-8">
          Data pendaftar atas nama <strong>{nama}</strong> ({jenisProfesi}) dari <strong>{puskesmas}</strong> telah tersimpan dan siap diverifikasi oleh Tim SDK Dinas Kesehatan.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={handleResetForm}
            className="py-3 px-6 rounded-xl font-bold text-xs text-white bg-teal-600 hover:bg-teal-700 transition-colors shadow-md shadow-teal-600/20 cursor-pointer"
          >
            Daftarkan Tenaga Kesehatan Lain
          </button>
        </div>
      </div>
    );
  }

  const isFormLocked = countdown.isClosed;

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-700 to-teal-800 text-white rounded-3xl p-6 sm:p-8 shadow-lg shadow-teal-900/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-teal-200 bg-white/10 px-3 py-1 rounded-full border border-white/15">
            Formulir Resmi
          </span>
          <h1 className="text-xl sm:text-2xl font-black mt-2">
            Pengajuan Kredensialing & Rekredensialing
          </h1>
          <p className="text-xs sm:text-sm text-teal-100/90 mt-1">
            Isi identitas nakes, lampiran berkas STR & SIP, serta rincian kewenangan klinik.
          </p>
        </div>

        {/* Mini Deadline Badge */}
        {countdown.hasDeadline && (
          <div
            className={`px-4 py-2.5 rounded-2xl border text-xs font-bold flex items-center gap-2 flex-none ${
              isFormLocked
                ? 'bg-rose-500/20 border-rose-300 text-rose-100'
                : 'bg-white/15 border-white/20 text-white backdrop-blur-md'
            }`}
          >
            <Clock className="w-4 h-4 text-teal-300" />
            <div>
              <div className="text-[10px] text-teal-200 uppercase font-semibold">Sisa Waktu:</div>
              <div>{countdown.formattedText}</div>
            </div>
          </div>
        )}
      </div>

      {isFormLocked && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-center gap-3 font-semibold">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-none" />
          <span>
            Pendaftaran saat ini <strong>DITUTUP</strong> karena telah melewati batas waktu yang ditentukan oleh Administrator Dinas Kesehatan. Formulir tidak dapat disimpan.
          </span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs sm:text-sm flex items-center gap-3 font-semibold">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-none" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Bagian 1: Identitas & Berkas */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Bagian 1: Identitas & Berkas Persyaratan
              </h2>
              <p className="text-xs text-slate-500">
                Lengkapi identitas tenaga kesehatan sesuai SIP yang berlaku.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 text-xs">
            {/* Kategori */}
            <div>
              <label className="block font-bold text-slate-700 mb-1.5" htmlFor="inputKategori">
                Kategori Permohonan <span className="text-rose-500">*</span>
              </label>
              <select
                id="inputKategori"
                disabled={isFormLocked}
                value={kategori}
                onChange={(e) => setKategori(e.target.value as KategoriPendaftaran)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-800 outline-none focus:border-teal-600"
              >
                <option value="Kredensial">Kredensial (Awal / Baru)</option>
                <option value="Rekredensial">Rekredensial (Perpanjangan)</option>
              </select>
            </div>

            {/* Nama Lengkap & Gelar */}
            <div>
              <label className="block font-bold text-slate-700 mb-1.5" htmlFor="inputNama">
                Nama Lengkap & Gelar (sesuai SIP) <span className="text-rose-500">*</span>
              </label>
              <input
                id="inputNama"
                type="text"
                disabled={isFormLocked}
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="Contoh: dr. Ahmad Fulan / Sri Heryani, A.Md.Kep"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-800 outline-none focus:border-teal-600"
              />
            </div>

            {/* NIP / NIK */}
            <div>
              <label className="block font-bold text-slate-700 mb-1.5" htmlFor="inputNip">
                NIP / NIK <span className="text-rose-500">*</span>
              </label>
              <input
                id="inputNip"
                type="text"
                disabled={isFormLocked}
                value={nip}
                onChange={(e) => setNip(e.target.value.replace(/[^0-9]/g, ''))}
                maxLength={18}
                placeholder="Masukkan NIP atau NIK (Hanya angka)"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-800 outline-none focus:border-teal-600 font-mono"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">Bagi Non-ASN, isikan angka 0 atau NIK.</span>
            </div>

            {/* Puskesmas */}
            <div>
              <label className="block font-bold text-slate-700 mb-1.5" htmlFor="inputPuskesmas">
                Puskesmas Tempat Tugas <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="inputPuskesmas"
                  type="text"
                  disabled={isFormLocked || currentUser.hak === 'User'}
                  value={puskesmas}
                  onChange={(e) => setPuskesmas(e.target.value)}
                  placeholder="Contoh: Puskesmas Garut"
                  required
                  className={`w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-medium text-slate-800 outline-none focus:border-teal-600 ${
                    currentUser.hak === 'User' ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'bg-white'
                  }`}
                />
                {currentUser.hak === 'User' && (
                  <span className="text-[11px] text-teal-700 mt-1 flex items-center gap-1 font-semibold">
                    <Building className="w-3 h-3" />
                    Terkunci otomatis sesuai akun Puskesmas login.
                  </span>
                )}
              </div>
            </div>

            {/* Profesi */}
            <div>
              <label className="block font-bold text-slate-700 mb-1.5" htmlFor="selectProfesi">
                Profesi Tenaga Kesehatan <span className="text-rose-500">*</span>
              </label>
              <select
                id="selectProfesi"
                disabled={isFormLocked}
                value={profesi}
                onChange={(e) => handleProfesiChange(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-800 outline-none focus:border-teal-600"
              >
                <option value="Dokter">Dokter</option>
                <option value="Dokter Gigi">Dokter Gigi</option>
                <option value="Bidan">Bidan</option>
                <option value="Perawat">Perawat</option>
              </select>
            </div>

            {/* Jenis Profesi Sub-kategori */}
            <div>
              <label className="block font-bold text-slate-700 mb-1.5" htmlFor="selectJenisProfesi">
                Jenis Profesi (Instrumen RKK) <span className="text-rose-500">*</span>
              </label>
              <select
                id="selectJenisProfesi"
                disabled={isFormLocked}
                value={jenisProfesi}
                onChange={(e) => setJenisProfesi(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-800 outline-none focus:border-teal-600"
              >
                {profesi === 'Dokter' && <option value="Dokter">Dokter (Umum)</option>}
                {profesi === 'Dokter Gigi' && <option value="Dokter Gigi">Dokter Gigi</option>}
                {profesi === 'Bidan' && (
                  <>
                    <option value="Bidan Vokasi">Bidan Vokasi (D3 Kebidanan)</option>
                    <option value="Bidan DIV">Bidan DIV (Sarjana Terapan)</option>
                    <option value="Bidan Profesi">Bidan Profesi</option>
                  </>
                )}
                {profesi === 'Perawat' && (
                  <>
                    <option value="Perawat Vokasi">Perawat Vokasi (D3 Keperawatan)</option>
                    <option value="Perawat Profesi">Perawat Profesi (Ners)</option>
                  </>
                )}
              </select>
            </div>

            {/* No Surat Ajuan */}
            <div>
              <label className="block font-bold text-slate-700 mb-1.5" htmlFor="inputNoSurat">
                No. Surat Ajuan Puskesmas <span className="text-rose-500">*</span>
              </label>
              <input
                id="inputNoSurat"
                type="text"
                disabled={isFormLocked}
                value={noSurat}
                onChange={(e) => setNoSurat(e.target.value)}
                placeholder="Contoh: 445/102/PKM-GRT/2026"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-800 outline-none focus:border-teal-600 font-mono"
              />
            </div>

            {/* Masa Berakhir SIP */}
            <div>
              <label className="block font-bold text-slate-700 mb-1.5" htmlFor="inputMasaSIP">
                Masa Berakhir SIP <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="inputMasaSIP"
                  type="date"
                  disabled={isFormLocked}
                  value={tglMasaSIP}
                  onChange={(e) => setTglMasaSIP(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-800 outline-none focus:border-teal-600"
                />
              </div>
            </div>
          </div>

          {/* Upload File Berkas (Surat Ajuan, STR, SIP) */}
          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5 text-teal-600" />
              Upload Berkas Persyaratan (PDF, Disimpan ke Google Drive):
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {/* Surat Ajuan */}
              <div className="p-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                <div className="font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-teal-600" />
                  <span>Surat Ajuan Kredensial *</span>
                </div>
                <input
                  type="file"
                  accept=".pdf"
                  disabled={isFormLocked}
                  onChange={(e) => handleFileUpload(e, setFileAjuanName)}
                  className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 cursor-pointer"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  {fileAjuanName ? `Terpilih: ${fileAjuanName}` : 'Format PDF (Surat Kepala Puskesmas)'}
                </span>
              </div>

              {/* STR */}
              <div className="p-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                <div className="font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-teal-600" />
                  <span>STR Legalisir / KKI *</span>
                </div>
                <input
                  type="file"
                  accept=".pdf"
                  disabled={isFormLocked}
                  onChange={(e) => handleFileUpload(e, setFileSTRName)}
                  className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 cursor-pointer"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  {fileSTRName ? `Terpilih: ${fileSTRName}` : 'Format PDF (Surat Tanda Registrasi)'}
                </span>
              </div>

              {/* SIP */}
              <div className="p-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                <div className="font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-teal-600" />
                  <span>SIP yang Masih Berlaku *</span>
                </div>
                <input
                  type="file"
                  accept=".pdf"
                  disabled={isFormLocked}
                  onChange={(e) => handleFileUpload(e, setFileSIPName)}
                  className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 cursor-pointer"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  {fileSIPName ? `Terpilih: ${fileSIPName}` : 'Format PDF (Surat Izin Praktik)'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bagian 2: Rincian Kewenangan Klinis (RKK) */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Bagian 2: Rincian Kewenangan Klinik ({jenisProfesi})
                </h2>
                <p className="text-xs text-slate-500">
                  Pilih tingkat kemampuan klinis yang dimohonkan untuk setiap tindakan.
                </p>
              </div>
            </div>

            {/* Quick Select Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={isFormLocked}
                onClick={() => handleBulkSelect('1')}
                className="px-3 py-1.5 text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-xl transition-colors cursor-pointer"
              >
                Pilih Semua: Kompeten
              </button>
              <button
                type="button"
                disabled={isFormLocked}
                onClick={() => handleBulkSelect('2')}
                className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Pilih Semua: Supervisi
              </button>
            </div>
          </div>

          {/* Clinical Privileges Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">No</th>
                  <th className="py-3 px-4 min-w-[240px]">Jenis Pelayanan / Tindakan Klinis</th>
                  <th className="py-3 px-2 text-center w-28 bg-emerald-50/50 text-emerald-900">Kompeten Sepenuhnya (1)</th>
                  <th className="py-3 px-2 text-center w-28 bg-amber-50/50 text-amber-900">Perlu Supervisi (2)</th>
                  <th className="py-3 px-2 text-center w-28 text-slate-700">Luar Kompetensi (3)</th>
                  <th className="py-3 px-2 text-center w-28 text-slate-700">Fasilitas Tdk Ada (4)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentInstruments.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 text-center text-slate-400 font-mono">{idx + 1}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{item.nama}</td>
                    <td className="py-3 px-2 text-center">
                      <input
                        type="radio"
                        name={`tindakan_${item.id}`}
                        value="1"
                        checked={pilihanRincian[item.nama] === '1'}
                        disabled={isFormLocked}
                        onChange={() => setPilihanRincian({ ...pilihanRincian, [item.nama]: '1' })}
                        className="w-4 h-4 accent-teal-600 cursor-pointer"
                      />
                    </td>
                    <td className="py-3 px-2 text-center">
                      <input
                        type="radio"
                        name={`tindakan_${item.id}`}
                        value="2"
                        checked={pilihanRincian[item.nama] === '2'}
                        disabled={isFormLocked}
                        onChange={() => setPilihanRincian({ ...pilihanRincian, [item.nama]: '2' })}
                        className="w-4 h-4 accent-amber-600 cursor-pointer"
                      />
                    </td>
                    <td className="py-3 px-2 text-center">
                      <input
                        type="radio"
                        name={`tindakan_${item.id}`}
                        value="3"
                        checked={pilihanRincian[item.nama] === '3'}
                        disabled={isFormLocked}
                        onChange={() => setPilihanRincian({ ...pilihanRincian, [item.nama]: '3' })}
                        className="w-4 h-4 accent-slate-600 cursor-pointer"
                      />
                    </td>
                    <td className="py-3 px-2 text-center">
                      <input
                        type="radio"
                        name={`tindakan_${item.id}`}
                        value="4"
                        checked={pilihanRincian[item.nama] === '4'}
                        disabled={isFormLocked}
                        onChange={() => setPilihanRincian({ ...pilihanRincian, [item.nama]: '4' })}
                        className="w-4 h-4 accent-slate-600 cursor-pointer"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Form Action Submit */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-500 flex items-center gap-2">
              <Info className="w-4 h-4 text-teal-600 flex-none" />
              <span>Data tersimpan langsung dan terintegrasi dengan Google Spreadsheet & Drive.</span>
            </div>

            <button
              type="submit"
              disabled={isFormLocked || isSubmitting}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 disabled:opacity-50 transition-all shadow-lg shadow-teal-700/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Kirim Pendaftaran Kredensialing</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
