import type { Pendaftar, TanggalPenilaianMode } from '../types/index.ts';

export const BULAN_INDONESIA = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export const HARI_INDONESIA = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export const MAP_PILIHAN_PENDAFTAR: Record<string, string> = {
  '1': 'Kompeten Sepenuhnya',
  '2': 'Memerlukan Supervisi',
  '3': 'Tidak Dimintakan (Luar Kompetensi)',
  '4': 'Tidak Dimintakan (Fasilitas Tidak Ada)'
};

/**
 * Validates that an array of evaluator names has exactly 3 non-empty, distinct items.
 */
export function validatePengujiDistinct(evaluators: string[]): { valid: boolean; message: string } {
  if (!evaluators || evaluators.length < 3) {
    return { valid: false, message: 'Silakan pilih ketiga penguji.' };
  }
  const clean = evaluators.map(e => (e || '').trim()).filter(Boolean);
  if (clean.length < 3) {
    return { valid: false, message: 'Ketiga posisi penguji wajib dipilih.' };
  }
  const unique = new Set(clean);
  if (unique.size !== 3) {
    return { valid: false, message: 'Nama penguji tidak boleh sama! Pilih penguji yang berbeda untuk tiap posisi.' };
  }
  return { valid: true, message: 'Penguji valid.' };
}

/**
 * Validates evaluation date based on setting mode: 'realtime' | 'no_backdate' | 'bebas'.
 */
export function validateEvaluationDate(
  dateInput: string | Date,
  mode: TanggalPenilaianMode,
  referenceNow: Date = new Date()
): { valid: boolean; message: string; dateObj: Date | null } {
  if (!dateInput) {
    return { valid: false, message: 'Tanggal penilaian wajib diisi.', dateObj: null };
  }

  let dateObj: Date;
  if (typeof dateInput === 'string') {
    // Check if DD-MM-YYYY
    const ddmmyyyy = dateInput.match(/^(\d{2})-(\d{2})-(\d{4})$/);
    if (ddmmyyyy) {
      dateObj = new Date(parseInt(ddmmyyyy[3], 10), parseInt(ddmmyyyy[2], 10) - 1, parseInt(ddmmyyyy[1], 10));
    } else {
      dateObj = new Date(dateInput);
    }
  } else {
    dateObj = dateInput;
  }

  if (isNaN(dateObj.getTime())) {
    return { valid: false, message: 'Format tanggal tidak valid.', dateObj: null };
  }

  if (mode === 'no_backdate') {
    const today = new Date(referenceNow);
    today.setHours(0, 0, 0, 0);
    const target = new Date(dateObj);
    target.setHours(0, 0, 0, 0);
    if (target.getTime() < today.getTime()) {
      return { valid: false, message: 'Tanggal penilaian tidak boleh mundur dari hari ini (mode no back date).', dateObj };
    }
  }

  return { valid: true, message: 'Tanggal valid.', dateObj };
}

/**
 * Calculate countdown metrics given target date and time.
 */
export function calculateCountdown(
  deadlineDateStr?: string,
  deadlineTimeStr?: string,
  nowMillis: number = Date.now()
): {
  hasDeadline: boolean;
  isClosed: boolean;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  remainingMillis: number;
  formattedText: string;
} {
  if (!deadlineDateStr || !deadlineTimeStr) {
    return {
      hasDeadline: false,
      isClosed: false,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      remainingMillis: 0,
      formattedText: 'Pendaftaran dibuka tanpa batas waktu'
    };
  }

  const targetDate = new Date(`${deadlineDateStr}T${deadlineTimeStr}:00`);
  const targetMillis = targetDate.getTime();
  if (isNaN(targetMillis)) {
    return {
      hasDeadline: false,
      isClosed: false,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      remainingMillis: 0,
      formattedText: 'Format batas waktu tidak valid'
    };
  }

  const diff = targetMillis - nowMillis;
  if (diff <= 0) {
    return {
      hasDeadline: true,
      isClosed: true,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      remainingMillis: 0,
      formattedText: 'Waktu pendaftaran telah berakhir (Ditutup)'
    };
  }

  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);

  const pad = (n: number) => String(n).padStart(2, '0');
  const text = `${pad(days)} hari ${pad(hours)} jam ${pad(minutes)} menit ${pad(seconds)} detik`;

  return {
    hasDeadline: true,
    isClosed: false,
    days,
    hours,
    minutes,
    seconds,
    remainingMillis: diff,
    formattedText: text
  };
}

/**
 * Format date to standard Indonesian date string e.g. "15 Oktober 2026"
 */
export function formatDateIndo(dateInput?: string | Date): string {
  if (!dateInput) return '-';
  let d: Date;
  if (typeof dateInput === 'string') {
    const s = dateInput.trim();
    const ddmmyyyy = s.match(/^(\d{2})-(\d{2})-(\d{4})$/);
    if (ddmmyyyy) {
      d = new Date(parseInt(ddmmyyyy[3], 10), parseInt(ddmmyyyy[2], 10) - 1, parseInt(ddmmyyyy[1], 10));
    } else {
      d = new Date(s);
    }
  } else {
    d = dateInput;
  }

  if (isNaN(d.getTime())) return String(dateInput);
  return `${d.getDate()} ${BULAN_INDONESIA[d.getMonth()]} ${d.getFullYear()}`;
}

/**
 * Format date to standard DD-MM-YYYY string.
 */
export function formatDateShort(dateInput?: string | Date): string {
  if (!dateInput) return '-';
  let d: Date;
  if (typeof dateInput === 'string') {
    const s = dateInput.trim();
    if (/^\d{2}-\d{2}-\d{4}$/.test(s)) return s;
    d = new Date(s);
  } else {
    d = dateInput;
  }
  if (isNaN(d.getTime())) return String(dateInput);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${day}-${month}-${d.getFullYear()}`;
}

/**
 * Calculate dashboard summary statistics.
 */
export function calculateKPIs(list: Pendaftar[]) {
  const total = list.length;
  const pending = list.filter(item => !item.statusVerifikasi || item.statusVerifikasi === 'Pending').length;
  const diterima = list.filter(item => item.statusVerifikasi === 'Diterima').length;
  const ditolak = list.filter(item => item.statusVerifikasi === 'Ditolak').length;
  const selesaiPenilaian = list.filter(item => item.statusPenilaian === 'Selesai').length;
  const progressPercent = total > 0 ? Math.round((selesaiPenilaian / total) * 100) : 0;

  return {
    total,
    pending,
    diterima,
    ditolak,
    selesaiPenilaian,
    progressPercent
  };
}

/**
 * Filters pendaftar list by search keyword, profession, and status.
 */
export function filterPendaftar(
  list: Pendaftar[],
  query: string,
  profesiFilter: string,
  statusFilter: string
): Pendaftar[] {
  const q = (query || '').toLowerCase().trim();
  const prof = (profesiFilter || '').trim();
  const stat = (statusFilter || '').trim();

  return list.filter(item => {
    if (prof && item.profesi !== prof && item.jenisProfesi !== prof) return false;
    if (stat) {
      if (stat === 'Pending') {
        if (item.statusVerifikasi && item.statusVerifikasi !== 'Pending') return false;
      } else if (item.statusVerifikasi !== stat) {
        return false;
      }
    }
    if (q) {
      const matchNama = (item.nama || '').toLowerCase().includes(q);
      const matchNip = (item.nip || '').toLowerCase().includes(q);
      const matchPuskesmas = (item.puskesmas || '').toLowerCase().includes(q);
      const matchNoSurat = (item.noSurat || '').toLowerCase().includes(q);
      const matchJenis = (item.jenisProfesi || '').toLowerCase().includes(q);
      if (!matchNama && !matchNip && !matchPuskesmas && !matchNoSurat && !matchJenis) return false;
    }
    return true;
  });
}
