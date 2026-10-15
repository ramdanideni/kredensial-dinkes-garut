export type UserRole = 'Admin' | 'User' | 'Penguji' | 'Verifikator';

export interface User {
  username: string;
  nama: string;
  puskesmas?: string;
  hak: UserRole;
  profesi?: string;
}

export type KategoriPendaftaran = 'Kredensial' | 'Rekredensial';
export type StatusVerifikasi = 'Pending' | 'Diterima' | 'Ditolak';
export type StatusPenilaian = 'Belum' | 'Selesai';
export type KeputusanPenguji = 
  | 'Disetujui berwenang penuh'
  | 'Disetujui dibawah supervise'
  | 'Tidak disetujui (belum memenuhi)'
  | 'Tidak disetujui (fasilitas tdk ada)'
  | '';

export type RekomendasiPenguji = 
  | 'Direkomendasikan'
  | 'Direkomendasikan dengan Catatan'
  | 'Tidak direkomendasikan'
  | '';

export interface RincianTindakanItem {
  tindakan: string;
  pilihan: string; // '1' | '2' | '3' | '4'
  keputusanPenguji?: KeputusanPenguji;
}

export interface Pendaftar {
  id: string;
  rowIndex: number;
  timestamp: string;
  kategori: KategoriPendaftaran;
  nama: string;
  nip: string;
  puskesmas: string;
  profesi: 'Dokter' | 'Dokter Gigi' | 'Bidan' | 'Perawat';
  jenisProfesi: string;
  noSurat: string;
  tglMasaSIP: string;
  urlAjuan: string;
  urlSTR: string;
  urlSIP: string;
  fileAjuanName?: string;
  fileSTRName?: string;
  fileSIPName?: string;
  statusVerifikasi: StatusVerifikasi;
  statusPenilaian: StatusPenilaian;
  tglPenilaian?: string;
  namaPenguji?: string;
  namaPengujiList?: string[];
  rekomendasi?: RekomendasiPenguji;
  catatan?: string;
  rincian: RincianTindakanItem[];
}

export interface InstrumentItem {
  id: number;
  nama: string;
}

export interface DeadlineSettings {
  tanggal: string; // YYYY-MM-DD
  jam: string;     // HH:mm
}

export type TanggalPenilaianMode = 'realtime' | 'no_backdate' | 'bebas';

export interface PenandaTanganSettings {
  nama: string;
  pangkat: string;
  nip: string;
}

export interface SuratSettings {
  kodeSurat: string;
  logoKop: string;
  paperSize: 'F4' | 'A4';
  nomorSuratMap: Record<string, string>;
}

export interface GoogleIntegrationSettings {
  appsScriptUrl: string;
  spreadsheetRekapId: string;
  spreadsheetInstrumenId: string;
  spreadsheetPengujiId: string;
  spreadsheetHasilPengujiId: string;
  sdmkSpreadsheetId: string;
  folderDriveId: string;
  autoSyncIntervalSec: number;
  lastSyncTime?: string;
}
