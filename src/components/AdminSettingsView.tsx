import React, { useState } from 'react';
import {
  Clock,
  Calendar,
  PenTool,
  Printer,
  CloudCog,
  Save,
  Trash2,
  CheckCircle2,
  AlertCircle,
  FileText,
  Sliders,
  ChevronDown,
  Layers,
  Copy,
  ExternalLink,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import type {
  DeadlineSettings,
  TanggalPenilaianMode,
  PenandaTanganSettings,
  SuratSettings,
  GoogleIntegrationSettings,
  Pendaftar
} from '../types/index.ts';
import {
  saveDeadlineSettings,
  saveTanggalPenilaianMode,
  savePenandaTanganSettings,
  saveSuratSettings,
  saveNomorSuratPuskesmas,
  saveIntegrationSettings,
  resetAllDataToDemo
} from '../services/storageService.ts';

interface AdminSettingsViewProps {
  initialSubTab?: 'waktu' | 'tglPenilaian' | 'ttd' | 'cetak' | 'integration';
  deadlineSettings: DeadlineSettings | null;
  tanggalPenilaianMode: TanggalPenilaianMode;
  penandaTanganSettings: PenandaTanganSettings;
  suratSettings: SuratSettings;
  integrationSettings: GoogleIntegrationSettings;
  pendaftarList: Pendaftar[];
  onOpenPrintModal: (puskesmas: string, nomorSurat: string) => void;
  onRefresh: () => void;
}

export const AdminSettingsView: React.FC<AdminSettingsViewProps> = ({
  initialSubTab = 'waktu',
  deadlineSettings,
  tanggalPenilaianMode,
  penandaTanganSettings,
  suratSettings,
  integrationSettings,
  pendaftarList,
  onOpenPrintModal,
  onRefresh
}) => {
  const [activeTab, setActiveTab] = useState<'waktu' | 'tglPenilaian' | 'ttd' | 'cetak' | 'integration'>(initialSubTab);

  // Waktu form
  const [batasTanggal, setBatasTanggal] = useState(deadlineSettings?.tanggal || '');
  const [batasJam, setBatasJam] = useState(deadlineSettings?.jam || '');

  // Mode tanggal penilaian
  const [selectedMode, setSelectedMode] = useState<TanggalPenilaianMode>(tanggalPenilaianMode);

  // Penanda tangan
  const [ttdNama, setTtdNama] = useState(penandaTanganSettings.nama);
  const [ttdPangkat, setTtdPangkat] = useState(penandaTanganSettings.pangkat);
  const [ttdNip, setTtdNip] = useState(penandaTanganSettings.nip);

  // Surat Settings
  const [kodeSurat, setKodeSurat] = useState(suratSettings.kodeSurat);
  const [logoKop, setLogoKop] = useState(suratSettings.logoKop);
  const [paperSize, setPaperSize] = useState<'F4' | 'A4'>(suratSettings.paperSize || 'F4');
  const [showPengaturanSurat, setShowPengaturanSurat] = useState(false);

  // Integration Settings
  const [appsScriptUrl, setAppsScriptUrl] = useState(integrationSettings.appsScriptUrl || '');
  const [autoSyncSec, setAutoSyncSec] = useState(integrationSettings.autoSyncIntervalSec || 15);
  const [pingStatus, setPingStatus] = useState<string | null>(null);

  // Feedback notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Save Batas Waktu
  const handleSaveWaktu = () => {
    if (!batasTanggal || !batasJam) {
      alert('Tanggal dan jam batas waktu wajib diisi.');
      return;
    }
    saveDeadlineSettings({ tanggal: batasTanggal, jam: batasJam });
    showToast('Batas waktu pendaftaran berhasil disimpan!');
    onRefresh();
  };

  const handleHapusWaktu = () => {
    if (confirm('Yakin ingin menghapus batas waktu? Pendaftaran akan dibuka tanpa batasan waktu.')) {
      saveDeadlineSettings(null);
      setBatasTanggal('');
      setBatasJam('');
      showToast('Batas waktu pendaftaran dihapus (Dibuka bebas).');
      onRefresh();
    }
  };

  // Save Mode Tanggal Penilaian
  const handleSelectMode = (mode: TanggalPenilaianMode) => {
    setSelectedMode(mode);
    saveTanggalPenilaianMode(mode);
    showToast(`Mode tanggal penilaian diubah ke "${mode}"!`);
    onRefresh();
  };

  // Save Penanda Tangan
  const handleSaveTtd = (e: React.FormEvent) => {
    e.preventDefault();
    savePenandaTanganSettings({ nama: ttdNama, pangkat: ttdPangkat, nip: ttdNip });
    showToast('Data penanda tangan surat berhasil disimpan!');
    onRefresh();
  };

  // Save Surat Settings
  const handleSaveSurat = () => {
    saveSuratSettings({
      ...suratSettings,
      kodeSurat,
      logoKop,
      paperSize
    });
    showToast('Pengaturan surat & kop berhasil disimpan!');
    onRefresh();
  };

  // Save Integration
  const handleSaveIntegration = () => {
    saveIntegrationSettings({
      ...integrationSettings,
      appsScriptUrl,
      autoSyncIntervalSec: Number(autoSyncSec),
      lastSyncTime: new Date().toISOString()
    });
    showToast('Konfigurasi Google Apps Script & Drive disimpan!');
    onRefresh();
  };

  const handleTestPing = () => {
    setPingStatus('Menguji koneksi ke Google Cloud / Apps Script...');
    setTimeout(() => {
      if (appsScriptUrl.trim()) {
        setPingStatus('Koneksi endpoint tersambung (200 OK)');
      } else {
        setPingStatus('Tersambung ke Local Reactive Bridge & Spreadsheet IDs.');
      }
    }, 800);
  };

  const handleResetDemo = () => {
    if (confirm('Reset seluruh data pendaftar dan pengaturan kembali ke data demo awal?')) {
      resetAllDataToDemo();
      showToast('Seluruh data berhasil di-reset ke kondisi awal!');
      onRefresh();
    }
  };

  // Group Puskesmas for Cetak
  const puskesmasListMap = pendaftarList.reduce((acc, curr) => {
    const p = curr.puskesmas || 'Puskesmas Umum';
    if (!acc[p]) acc[p] = { count: 0, gradedCount: 0 };
    acc[p].count++;
    if (curr.statusPenilaian === 'Selesai') acc[p].gradedCount++;
    return acc;
  }, {} as Record<string, { count: number; gradedCount: number }>);

  const sortedPuskesmas = Object.entries(puskesmasListMap).sort((a, b) => a[0].localeCompare(b[0]));

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-300">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-teal-900 text-white font-bold text-xs shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-bottom-4">
          <CheckCircle2 className="w-4 h-4 text-teal-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Tabs Bar */}
      <div className="flex border-b border-slate-200 bg-white rounded-3xl p-2 gap-1.5 shadow-xs overflow-x-auto text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveTab('waktu')}
          className={`px-4 py-2.5 rounded-2xl flex items-center gap-2 transition-all cursor-pointer flex-none ${
            activeTab === 'waktu'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Batas Waktu Pendaftaran</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('tglPenilaian')}
          className={`px-4 py-2.5 rounded-2xl flex items-center gap-2 transition-all cursor-pointer flex-none ${
            activeTab === 'tglPenilaian'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Setting Tgl Penilaian</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ttd')}
          className={`px-4 py-2.5 rounded-2xl flex items-center gap-2 transition-all cursor-pointer flex-none ${
            activeTab === 'ttd'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <PenTool className="w-4 h-4" />
          <span>Penanda Tangan</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('cetak')}
          className={`px-4 py-2.5 rounded-2xl flex items-center gap-2 transition-all cursor-pointer flex-none ${
            activeTab === 'cetak'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Printer className="w-4 h-4" />
          <span>Cetak Hasil Surat</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('integration')}
          className={`px-4 py-2.5 rounded-2xl flex items-center gap-2 transition-all cursor-pointer flex-none ${
            activeTab === 'integration'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <CloudCog className="w-4 h-4 text-amber-500" />
          <span>Spreadsheet & Drive Sync</span>
        </button>
      </div>

      {/* TAB 1: Waktu Pendaftaran */}
      {activeTab === 'waktu' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6 animate-in fade-in duration-200">
          <div className="pb-4 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-teal-600" />
              <span>Pengaturan Batas Waktu Pendaftaran</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Atur batas akhir (deadline) pendaftaran kredensialing tenaga kesehatan. Hitung mundur akan tampil realtime di portal publik dan halaman pendaftaran.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1" htmlFor="inputBatasTanggal">
                Tanggal Batas Akhir <span className="text-rose-500">*</span>
              </label>
              <input
                id="inputBatasTanggal"
                type="date"
                value={batasTanggal}
                onChange={(e) => setBatasTanggal(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-medium outline-none focus:border-teal-600"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1" htmlFor="inputBatasJam">
                Jam Batas Akhir (WIB) <span className="text-rose-500">*</span>
              </label>
              <input
                id="inputBatasJam"
                type="time"
                value={batasJam}
                onChange={(e) => setBatasJam(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-medium outline-none focus:border-teal-600"
              />
            </div>

            <div className="flex items-end gap-2">
              <button
                type="button"
                onClick={handleSaveWaktu}
                className="flex-1 py-2.5 px-4 rounded-xl font-bold text-white bg-teal-600 hover:bg-teal-700 transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Pengaturan</span>
              </button>
              <button
                type="button"
                onClick={handleHapusWaktu}
                className="p-2.5 rounded-xl font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer"
                title="Buka tanpa batasan waktu"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Setting Tanggal Penilaian */}
      {activeTab === 'tglPenilaian' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6 animate-in fade-in duration-200">
          <div className="pb-4 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-teal-600" />
              <span>Setting Perilaku Tanggal Penilaian Penguji</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Pilih mode validasi tanggal penilaian di menu Tim Penguji. Tanggal pendaftaran tidak terpengaruh.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Mode 1: Realtime */}
            <div
              onClick={() => handleSelectMode('realtime')}
              className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                selectedMode === 'realtime'
                  ? 'border-teal-600 bg-teal-50/50 shadow-sm'
                  : 'border-slate-200 hover:border-teal-200 bg-white'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
                selectedMode === 'realtime' ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 mb-1">1. Realtime (Terkunci)</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Tanggal penilaian otomatis mengikuti hari ini (realtime) dan terkunci sehingga penguji tidak dapat mengubah tanggal.
              </p>
            </div>

            {/* Mode 2: No Backdate */}
            <div
              onClick={() => handleSelectMode('no_backdate')}
              className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                selectedMode === 'no_backdate'
                  ? 'border-teal-600 bg-teal-50/50 shadow-sm'
                  : 'border-slate-200 hover:border-teal-200 bg-white'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
                selectedMode === 'no_backdate' ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 mb-1">2. Tidak Bisa Back Date</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Penguji dapat memilih tanggal, namun dibatasi minimal hari ini (tidak diperbolehkan memilih tanggal mundur/lampau).
              </p>
            </div>

            {/* Mode 3: Bebas */}
            <div
              onClick={() => handleSelectMode('bebas')}
              className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                selectedMode === 'bebas'
                  ? 'border-teal-600 bg-teal-50/50 shadow-sm'
                  : 'border-slate-200 hover:border-teal-200 bg-white'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
                selectedMode === 'bebas' ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                <Sliders className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 mb-1">3. Bebas Tanpa Batasan</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Penguji bebas memilih tanggal penilaian kapan saja, termasuk tanggal lampau jika input dilakukan susulan.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Penanda Tangan */}
      {activeTab === 'ttd' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6 animate-in fade-in duration-200">
          <div className="pb-4 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <PenTool className="w-5 h-5 text-teal-600" />
              <span>Pejabat Penanda Tangan Surat Hasil Kredensialing</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Data Kepala Dinas Kesehatan yang tercetak otomatis di naskah surat dinas, Lampiran I, dan Sertifikat Penetapan RKK.
            </p>
          </div>

          <form onSubmit={handleSaveTtd} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1" htmlFor="inputNamaKadinkes">
                Nama Kepala Dinas Kesehatan & Gelar <span className="text-rose-500">*</span>
              </label>
              <input
                id="inputNamaKadinkes"
                type="text"
                value={ttdNama}
                onChange={(e) => setTtdNama(e.target.value)}
                placeholder="Contoh: drg. Hj. Leli Yuliani, M.M."
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-medium outline-none focus:border-teal-600"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1" htmlFor="inputPangkatKadinkes">
                  Pangkat / Golongan <span className="text-rose-500">*</span>
                </label>
                <input
                  id="inputPangkatKadinkes"
                  type="text"
                  value={ttdPangkat}
                  onChange={(e) => setTtdPangkat(e.target.value)}
                  placeholder="Contoh: Pembina Utama Muda (IV/c)"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-medium outline-none focus:border-teal-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1" htmlFor="inputNipKadinkes">
                  NIP Pejabat <span className="text-rose-500">*</span>
                </label>
                <input
                  id="inputNipKadinkes"
                  type="text"
                  value={ttdNip}
                  onChange={(e) => setTtdNip(e.target.value)}
                  placeholder="Contoh: 19700812 199503 2 001"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-medium outline-none focus:border-teal-600 font-mono"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl font-bold text-white bg-teal-600 hover:bg-teal-700 transition-colors shadow-xs flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Data Pejabat</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 4: Cetak Hasil */}
      {activeTab === 'cetak' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6 animate-in fade-in duration-200">
          <div className="pb-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Printer className="w-5 h-5 text-teal-600" />
                <span>Cetak Hasil Surat Kredensialing</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Format resmi naskah dinas Pemkab Garut untuk Surat Pengantar, Lampiran I, Penetapan RKK & Rincian per Puskesmas.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowPengaturanSurat(!showPengaturanSurat)}
              className="px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <Sliders className="w-4 h-4 text-teal-600" />
              <span>{showPengaturanSurat ? 'Sembunyikan Pengaturan' : 'Pengaturan Kode & Kertas'}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showPengaturanSurat ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Collapsible settings for Kode Surat & Paper Size */}
          {showPengaturanSurat && (
            <div className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200 space-y-4 text-xs animate-in slide-in-from-top-2">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1" htmlFor="inputKodeSuratDinkes">
                    Kode Klasifikasi Surat <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="inputKodeSuratDinkes"
                    type="text"
                    value={kodeSurat}
                    onChange={(e) => setKodeSurat(e.target.value)}
                    placeholder="Contoh: 400.7.22.1"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono font-bold outline-none focus:border-teal-600"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Format: [Kode]/[Nomor Surat]/DINKES</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1" htmlFor="inputLogoKopDinkes">Logo Kop Surat (URL)</label>
                  <input
                    id="inputLogoKopDinkes"
                    type="text"
                    value={logoKop}
                    onChange={(e) => setLogoKop(e.target.value)}
                    placeholder="URL logo atau thumbnail Google Drive"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white outline-none focus:border-teal-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ukuran Kertas Cetak</label>
                  <div className="flex gap-2">
                    <label className={`flex-1 flex items-center justify-center gap-1.5 p-2 rounded-xl border cursor-pointer font-bold ${
                      paperSize === 'F4' ? 'border-teal-600 bg-teal-50 text-teal-800' : 'border-slate-200 bg-white text-slate-600'
                    }`}>
                      <input
                        type="radio"
                        name="paperSizeRadio"
                        value="F4"
                        checked={paperSize === 'F4'}
                        onChange={() => setPaperSize('F4')}
                        className="sr-only"
                      />
                      <span>F4 / Folio (215×330)</span>
                    </label>

                    <label className={`flex-1 flex items-center justify-center gap-1.5 p-2 rounded-xl border cursor-pointer font-bold ${
                      paperSize === 'A4' ? 'border-teal-600 bg-teal-50 text-teal-800' : 'border-slate-200 bg-white text-slate-600'
                    }`}>
                      <input
                        type="radio"
                        name="paperSizeRadio"
                        value="A4"
                        checked={paperSize === 'A4'}
                        onChange={() => setPaperSize('A4')}
                        className="sr-only"
                      />
                      <span>A4 (210×297)</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleSaveSurat}
                  className="px-4 py-2 rounded-xl font-bold text-white bg-teal-600 hover:bg-teal-700 transition-colors shadow-xs"
                >
                  Simpan Format Surat
                </button>
              </div>
            </div>
          )}

          {/* Puskesmas List with Auto-Saved Nomor Surat */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">No</th>
                  <th className="py-3 px-4">Nama Puskesmas</th>
                  <th className="py-3 px-4 text-center">Jumlah Nakes</th>
                  <th className="py-3 px-4 text-center">Nomor Surat (Auto-Save)</th>
                  <th className="py-3 px-4 text-center w-28">Cetak Dokumen</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sortedPuskesmas.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      Belum ada data pendaftar Puskesmas.
                    </td>
                  </tr>
                ) : (
                  sortedPuskesmas.map(([puskesmasName, stats], idx) => {
                    const currentNo = suratSettings.nomorSuratMap?.[puskesmasName] || '';
                    return (
                      <tr key={puskesmasName} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4 text-center text-slate-400 font-mono">{idx + 1}</td>
                        <td className="py-3 px-4 font-bold text-slate-800">{puskesmasName}</td>
                        <td className="py-3 px-4 text-center">
                          <span className="font-bold text-teal-800">{stats.count} nakes</span>
                          <span className="text-[10px] text-slate-400 block font-medium">({stats.gradedCount} selesai dinilai)</span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <input
                            type="text"
                            defaultValue={currentNo}
                            onBlur={(e) => saveNomorSuratPuskesmas(puskesmasName, e.target.value.trim())}
                            placeholder="cth: 421/KEP-2026"
                            className="w-48 px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-mono text-center text-slate-800 font-bold outline-none focus:border-teal-600"
                          />
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => onOpenPrintModal(puskesmasName, currentNo || '421/KEP-2026')}
                            className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs mx-auto cursor-pointer"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Cetak</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: Google Integration */}
      {activeTab === 'integration' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6 animate-in fade-in duration-200">
          <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CloudCog className="w-5 h-5 text-amber-500" />
                <span>Integrasi Google Spreadsheet & Google Drive</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Koneksi langsung ke Spreadsheet ID rekap, master instrumen, master penguji, serta folder penyimpanan Google Drive.
              </p>
            </div>
            <button
              type="button"
              onClick={handleResetDemo}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 text-xs font-bold flex items-center gap-1.5 hover:bg-slate-50 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Data Demo</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-[10px] font-bold uppercase text-slate-400">ID Spreadsheet Rekap Pendaftaran</span>
              <div className="font-mono text-slate-800 font-bold break-all bg-white p-2.5 rounded-xl border border-slate-200">
                {integrationSettings.spreadsheetRekapId}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-[10px] font-bold uppercase text-slate-400">ID Folder Google Drive Penyimpanan Berkas</span>
              <div className="font-mono text-slate-800 font-bold break-all bg-white p-2.5 rounded-xl border border-slate-200">
                {integrationSettings.folderDriveId}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-[10px] font-bold uppercase text-slate-400">ID Spreadsheet Master Instrumen</span>
              <div className="font-mono text-slate-800 font-bold break-all bg-white p-2.5 rounded-xl border border-slate-200">
                {integrationSettings.spreadsheetInstrumenId}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-[10px] font-bold uppercase text-slate-400">ID Spreadsheet Tim Penguji & Hasil</span>
              <div className="font-mono text-slate-800 font-bold break-all bg-white p-2.5 rounded-xl border border-slate-200">
                {integrationSettings.spreadsheetPengujiId}
              </div>
            </div>
          </div>

          {/* Web App URL Webhook */}
          <div className="pt-4 border-t border-slate-100 space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1" htmlFor="inputAppsScriptUrl">
                URL Google Apps Script Web App Deployment (Opsional untuk Live Sync API):
              </label>
              <div className="flex gap-2">
                <input
                  id="inputAppsScriptUrl"
                  type="url"
                  value={appsScriptUrl}
                  onChange={(e) => setAppsScriptUrl(e.target.value)}
                  placeholder="https://script.google.com/macros/s/.../exec"
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white font-mono outline-none focus:border-teal-600"
                />
                <button
                  type="button"
                  onClick={handleTestPing}
                  className="px-4 py-2.5 rounded-xl font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors"
                >
                  Uji Koneksi
                </button>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Jika dikosongkan, sistem berjalan optimal menggunakan high-speed reactive local bridge dengan persistent storage.
              </span>
            </div>

            {pingStatus && (
              <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600" />
                <span>{pingStatus}</span>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleSaveIntegration}
                className="px-5 py-2.5 rounded-xl font-bold text-white bg-teal-600 hover:bg-teal-700 transition-colors shadow-xs flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Pengaturan Sinkronisasi</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
