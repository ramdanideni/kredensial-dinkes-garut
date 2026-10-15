import type {
  User,
  Pendaftar,
  DeadlineSettings,
  TanggalPenilaianMode,
  PenandaTanganSettings,
  SuratSettings,
  GoogleIntegrationSettings,
  StatusVerifikasi,
  KeputusanPenguji,
  RekomendasiPenguji
} from '../types/index.ts';
import {
  MASTER_USERS,
  INITIAL_PENDAFTAR,
  INITIAL_DEADLINE,
  INITIAL_PENANDA_TANGAN,
  INITIAL_SURAT_SETTINGS,
  INITIAL_INTEGRATION_SETTINGS
} from '../data/initialData.ts';

const STORAGE_KEYS = {
  USER: 'sdmk_user_v2',
  PENDAFTAR: 'sdmk_pendaftar_v2',
  DEADLINE: 'sdmk_deadline_v2',
  MODE_TANGGAL: 'sdmk_mode_tanggal_v2',
  PENANDA_TANGAN: 'sdmk_penanda_tangan_v2',
  SURAT_SETTINGS: 'sdmk_surat_settings_v2',
  INTEGRATION: 'sdmk_integration_v2',
  LAST_PING: 'sdmk_last_ping_v2'
};

const SYNC_CHANNEL_NAME = 'sdmk_realtime_sync_v2';
let broadcastChannel: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    broadcastChannel = new BroadcastChannel(SYNC_CHANNEL_NAME);
  } catch (e) {
    broadcastChannel = null;
  }
}

export function notifyStateChange(eventType: string, payload?: any) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('sdmk:state_change', { detail: { eventType, payload } }));
  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage({ eventType, payload, timestamp: Date.now() });
    } catch (e) {}
  }
}

export function onStateChange(callback: (event: { eventType: string; payload?: any }) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const handleCustomEvent = (e: Event) => {
    const ce = e as CustomEvent;
    callback(ce.detail || { eventType: 'general' });
  };

  const handleBroadcast = (msgEvent: MessageEvent) => {
    callback(msgEvent.data);
  };

  const handleStorage = (storageEvent: StorageEvent) => {
    if (storageEvent.key && storageEvent.key.startsWith('sdmk_')) {
      callback({ eventType: 'storage_change', payload: storageEvent.key });
    }
  };

  window.addEventListener('sdmk:state_change', handleCustomEvent);
  window.addEventListener('storage', handleStorage);
  if (broadcastChannel) {
    broadcastChannel.addEventListener('message', handleBroadcast);
  }

  return () => {
    window.removeEventListener('sdmk:state_change', handleCustomEvent);
    window.removeEventListener('storage', handleStorage);
    if (broadcastChannel) {
      broadcastChannel.removeEventListener('message', handleBroadcast);
    }
  };
}

// ================= USER & AUTH =================
export function getSavedUser(): User | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER) || sessionStorage.getItem(STORAGE_KEYS.USER);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return null;
}

export function saveUser(user: User, remember: boolean = true) {
  if (typeof window === 'undefined') return;
  const str = JSON.stringify(user);
  if (remember) {
    localStorage.setItem(STORAGE_KEYS.USER, str);
    sessionStorage.removeItem(STORAGE_KEYS.USER);
  } else {
    sessionStorage.setItem(STORAGE_KEYS.USER, str);
    localStorage.removeItem(STORAGE_KEYS.USER);
  }
  notifyStateChange('user_login', user);
}

export function clearUser() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEYS.USER);
  sessionStorage.removeItem(STORAGE_KEYS.USER);
  notifyStateChange('user_logout');
}

export function authenticate(username: string, password: string): { success: boolean; user?: User; message: string } {
  const u = (username || '').trim().toLowerCase();
  const p = (password || '').trim();

  if (!u || !p) {
    return { success: false, message: 'Username dan password wajib diisi.' };
  }

  // Check demo credentials
  const found = MASTER_USERS.find(user => {
    if (user.username.toLowerCase() !== u) return false;
    // Expected default password logic
    if (u === 'admin' && p === 'admin123') return true;
    if (u.startsWith('penguji') && (p === 'penguji123' || p === '123456')) return true;
    if (u === 'verifikator' && (p === 'verif123' || p === '123456')) return true;
    if ((u === 'garut' || u === 'tarogong' || u === 'cikajang') && (p === 'puskesmas123' || p === '123456')) return true;
    if (p === 'password' || p === '123456') return true;
    return false;
  });

  if (found) {
    return { success: true, user: found, message: 'Login berhasil!' };
  }

  return { success: false, message: 'Username atau password salah. Cek demo akun di panel login.' };
}

// ================= PENDAFTAR DATA =================
export function getPendaftarList(): Pendaftar[] {
  if (typeof window === 'undefined') return INITIAL_PENDAFTAR;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PENDAFTAR);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PENDAFTAR, JSON.stringify(INITIAL_PENDAFTAR));
      return INITIAL_PENDAFTAR;
    }
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_PENDAFTAR;
  }
}

export function savePendaftarList(list: Pendaftar[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.PENDAFTAR, JSON.stringify(list));
  notifyStateChange('pendaftar_updated', list);
}

export function addPendaftar(pendaftar: Omit<Pendaftar, 'id' | 'rowIndex' | 'timestamp' | 'statusVerifikasi' | 'statusPenilaian'>): Pendaftar {
  const current = getPendaftarList();
  const newId = 'pkm-' + Date.now();
  const now = new Date();
  const timestamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

  const newItem: Pendaftar = {
    ...pendaftar,
    id: newId,
    rowIndex: current.length + 2,
    timestamp,
    statusVerifikasi: 'Pending',
    statusPenilaian: 'Belum'
  };

  const updated = [newItem, ...current];
  savePendaftarList(updated);
  return newItem;
}

export function updatePendaftarStatusVerifikasi(id: string, status: StatusVerifikasi): boolean {
  const current = getPendaftarList();
  const idx = current.findIndex(p => p.id === id);
  if (idx === -1) return false;

  current[idx] = {
    ...current[idx],
    statusVerifikasi: status
  };

  savePendaftarList(current);
  return true;
}

export function updatePendaftarData(id: string, partial: Partial<Pendaftar>): boolean {
  const current = getPendaftarList();
  const idx = current.findIndex(p => p.id === id);
  if (idx === -1) return false;

  current[idx] = {
    ...current[idx],
    ...partial
  };

  savePendaftarList(current);
  return true;
}

export function deletePendaftarItem(id: string): boolean {
  const current = getPendaftarList();
  const filtered = current.filter(p => p.id !== id);
  if (filtered.length === current.length) return false;

  savePendaftarList(filtered);
  return true;
}

export function savePenilaian(
  id: string,
  dataPenilaian: { tindakan: string; hasil: KeputusanPenguji }[],
  namaPengujiList: string[],
  rekomendasi: RekomendasiPenguji,
  catatan: string,
  tanggalPenilaian: string
): boolean {
  const current = getPendaftarList();
  const idx = current.findIndex(p => p.id === id);
  if (idx === -1) return false;

  const item = current[idx];
  const updatedRincian = item.rincian.map(r => {
    const match = dataPenilaian.find(d => d.tindakan === r.tindakan);
    return {
      ...r,
      keputusanPenguji: match ? match.hasil : r.keputusanPenguji
    };
  });

  current[idx] = {
    ...item,
    rincian: updatedRincian,
    namaPenguji: namaPengujiList.join(' | '),
    namaPengujiList: namaPengujiList,
    rekomendasi,
    catatan,
    tglPenilaian: tanggalPenilaian,
    statusPenilaian: 'Selesai'
  };

  savePendaftarList(current);
  return true;
}

export function resetPenilaian(id: string): boolean {
  const current = getPendaftarList();
  const idx = current.findIndex(p => p.id === id);
  if (idx === -1) return false;

  const item = current[idx];
  const resetRincian = item.rincian.map(r => ({
    ...r,
    keputusanPenguji: '' as KeputusanPenguji
  }));

  current[idx] = {
    ...item,
    rincian: resetRincian,
    namaPenguji: '',
    namaPengujiList: [],
    rekomendasi: '' as RekomendasiPenguji,
    catatan: '',
    tglPenilaian: '',
    statusPenilaian: 'Belum'
  };

  savePendaftarList(current);
  return true;
}

// ================= SETTINGS =================
export function getDeadlineSettings(): DeadlineSettings | null {
  if (typeof window === 'undefined') return INITIAL_DEADLINE;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DEADLINE);
    if (!raw) return INITIAL_DEADLINE;
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_DEADLINE;
  }
}

export function saveDeadlineSettings(settings: DeadlineSettings | null) {
  if (typeof window === 'undefined') return;
  if (!settings) {
    localStorage.removeItem(STORAGE_KEYS.DEADLINE);
  } else {
    localStorage.setItem(STORAGE_KEYS.DEADLINE, JSON.stringify(settings));
  }
  notifyStateChange('deadline_updated', settings);
}

export function getTanggalPenilaianMode(): TanggalPenilaianMode {
  if (typeof window === 'undefined') return 'realtime';
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MODE_TANGGAL);
    if (raw === 'realtime' || raw === 'no_backdate' || raw === 'bebas') return raw;
  } catch (e) {}
  return 'realtime';
}

export function saveTanggalPenilaianMode(mode: TanggalPenilaianMode) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.MODE_TANGGAL, mode);
  notifyStateChange('mode_tanggal_updated', mode);
}

export function getPenandaTanganSettings(): PenandaTanganSettings {
  if (typeof window === 'undefined') return INITIAL_PENANDA_TANGAN;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PENANDA_TANGAN);
    if (!raw) return INITIAL_PENANDA_TANGAN;
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_PENANDA_TANGAN;
  }
}

export function savePenandaTanganSettings(settings: PenandaTanganSettings) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.PENANDA_TANGAN, JSON.stringify(settings));
  notifyStateChange('penanda_tangan_updated', settings);
}

export function getSuratSettings(): SuratSettings {
  if (typeof window === 'undefined') return INITIAL_SURAT_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SURAT_SETTINGS);
    if (!raw) return INITIAL_SURAT_SETTINGS;
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_SURAT_SETTINGS;
  }
}

export function saveSuratSettings(settings: SuratSettings) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.SURAT_SETTINGS, JSON.stringify(settings));
  notifyStateChange('surat_settings_updated', settings);
}

export function saveNomorSuratPuskesmas(puskesmas: string, nomor: string) {
  const current = getSuratSettings();
  const updated: SuratSettings = {
    ...current,
    nomorSuratMap: {
      ...current.nomorSuratMap,
      [puskesmas]: nomor
    }
  };
  saveSuratSettings(updated);
}

export function getIntegrationSettings(): GoogleIntegrationSettings {
  if (typeof window === 'undefined') return INITIAL_INTEGRATION_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.INTEGRATION);
    if (!raw) return INITIAL_INTEGRATION_SETTINGS;
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_INTEGRATION_SETTINGS;
  }
}

export function saveIntegrationSettings(settings: GoogleIntegrationSettings) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.INTEGRATION, JSON.stringify(settings));
  notifyStateChange('integration_updated', settings);
}

// Reset all to demo initial state
export function resetAllDataToDemo() {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.PENDAFTAR, JSON.stringify(INITIAL_PENDAFTAR));
  localStorage.setItem(STORAGE_KEYS.DEADLINE, JSON.stringify(INITIAL_DEADLINE));
  localStorage.setItem(STORAGE_KEYS.MODE_TANGGAL, 'realtime');
  localStorage.setItem(STORAGE_KEYS.PENANDA_TANGAN, JSON.stringify(INITIAL_PENANDA_TANGAN));
  localStorage.setItem(STORAGE_KEYS.SURAT_SETTINGS, JSON.stringify(INITIAL_SURAT_SETTINGS));
  localStorage.setItem(STORAGE_KEYS.INTEGRATION, JSON.stringify(INITIAL_INTEGRATION_SETTINGS));
  notifyStateChange('data_reset');
}
