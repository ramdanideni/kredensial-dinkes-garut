import React, { useState, useEffect } from 'react';
import type { User, Pendaftar, DeadlineSettings, TanggalPenilaianMode, PenandaTanganSettings, SuratSettings, GoogleIntegrationSettings } from './types/index.ts';
import {
  getSavedUser,
  clearUser,
  getPendaftarList,
  getDeadlineSettings,
  getTanggalPenilaianMode,
  getPenandaTanganSettings,
  getSuratSettings,
  getIntegrationSettings,
  onStateChange
} from './services/storageService.ts';
import { LoginScreen } from './components/LoginScreen.tsx';
import { Navbar } from './components/Navbar.tsx';
import { Sidebar, type ActiveTab } from './components/Sidebar.tsx';
import { DashboardView } from './components/DashboardView.tsx';
import { PendaftaranView } from './components/PendaftaranView.tsx';
import { RekapView } from './components/RekapView.tsx';
import { VerifikasiView } from './components/VerifikasiView.tsx';
import { PengujiView } from './components/PengujiView.tsx';
import { AdminSettingsView } from './components/AdminSettingsView.tsx';
import { PrintModal } from './components/PrintModal.tsx';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(getSavedUser());
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Core application data synced in realtime
  const [pendaftarList, setPendaftarList] = useState<Pendaftar[]>(getPendaftarList());
  const [deadlineSettings, setDeadlineSettings] = useState<DeadlineSettings | null>(getDeadlineSettings());
  const [tanggalPenilaianMode, setTanggalPenilaianMode] = useState<TanggalPenilaianMode>(getTanggalPenilaianMode());
  const [penandaTanganSettings, setPenandaTanganSettings] = useState<PenandaTanganSettings>(getPenandaTanganSettings());
  const [suratSettings, setSuratSettings] = useState<SuratSettings>(getSuratSettings());
  const [integrationSettings, setIntegrationSettings] = useState<GoogleIntegrationSettings>(getIntegrationSettings());

  // Print Modal
  const [printModalInfo, setPrintModalInfo] = useState<{ puskesmas: string; nomorSurat: string } | null>(null);

  // Reload all states from storage
  const reloadData = () => {
    setPendaftarList(getPendaftarList());
    setDeadlineSettings(getDeadlineSettings());
    setTanggalPenilaianMode(getTanggalPenilaianMode());
    setPenandaTanganSettings(getPenandaTanganSettings());
    setSuratSettings(getSuratSettings());
    setIntegrationSettings(getIntegrationSettings());
  };

  // Realtime subscription
  useEffect(() => {
    const unsubscribe = onStateChange((evt) => {
      reloadData();
      if (evt.eventType === 'user_logout') {
        setCurrentUser(null);
      } else if (evt.eventType === 'user_login' && evt.payload) {
        setCurrentUser(evt.payload);
      }
    });

    return () => unsubscribe();
  }, []);

  // When user logs in or role changes, set default landing tab
  useEffect(() => {
    if (!currentUser) return;
    if (currentUser.hak === 'User') {
      setActiveTab('pendaftaran');
    } else if (currentUser.hak === 'Penguji') {
      setActiveTab('penguji');
    } else if (currentUser.hak === 'Verifikator') {
      setActiveTab('verifikasi');
    } else {
      setActiveTab('dashboard');
    }
  }, [currentUser?.username, currentUser?.hak]);

  const handleLogout = () => {
    if (confirm('Yakin ingin keluar dari sistem?')) {
      clearUser();
      setCurrentUser(null);
    }
  };

  const handleSwitchUserRole = (newUser: User) => {
    setCurrentUser(newUser);
  };

  if (!currentUser) {
    return <LoginScreen onLoginSuccess={(u) => setCurrentUser(u)} />;
  }

  // Calculate live badge counts
  const pendingCount = pendaftarList.filter(d => !d.statusVerifikasi || d.statusVerifikasi === 'Pending').length;
  const readyGradingCount = pendaftarList.filter(d => d.statusVerifikasi === 'Diterima' && d.statusPenilaian !== 'Selesai').length;
  const totalCount = pendaftarList.length;

  const pageTitles: Record<ActiveTab, string> = {
    dashboard: 'Dashboard Kredensialing',
    pendaftaran: 'Formulir Pendaftaran Kredensial',
    rekap: 'Rekapitulasi Data Pendaftar',
    verifikasi: 'Verifikasi Berkas SIP & STR',
    penguji: 'Penilaian Tim Penguji Klinis',
    waktu: 'Batas Waktu Pendaftaran',
    tglPenilaian: 'Setting Tanggal Penilaian',
    ttd: 'Pejabat Penanda Tangan',
    cetak: 'Cetak Hasil Kredensialing',
    integration: 'Integrasi Google Spreadsheet & Drive'
  };

  // Filter nakes for Puskesmas user role if needed
  const roleFilteredList = currentUser.hak === 'User' && currentUser.puskesmas
    ? pendaftarList.filter(d => d.puskesmas.toLowerCase() === currentUser.puskesmas!.toLowerCase())
    : pendaftarList;

  // Selected puskesmas nakes for print modal
  const printNakesList = printModalInfo
    ? pendaftarList.filter(d => d.puskesmas.toLowerCase() === printModalInfo.puskesmas.toLowerCase())
    : [];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Sidebar
        currentRole={currentUser.hak}
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        pendingCount={pendingCount}
        readyGradingCount={readyGradingCount}
        totalPendaftarCount={totalCount}
      />

      <div className="lg:pl-72 flex-1 flex flex-col min-w-0">
        <Navbar
          user={currentUser}
          onLogout={handleLogout}
          onToggleSidebar={() => setIsMobileSidebarOpen(true)}
          pageTitle={pageTitles[activeTab]}
          onSwitchUserRole={handleSwitchUserRole}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              pendaftarList={roleFilteredList}
              deadlineSettings={deadlineSettings}
              onNavigateTab={(tab) => setActiveTab(tab)}
              onRefresh={reloadData}
            />
          )}

          {activeTab === 'pendaftaran' && (
            <PendaftaranView
              currentUser={currentUser}
              deadlineSettings={deadlineSettings}
              onSuccessSubmit={() => {
                reloadData();
                setActiveTab('rekap');
              }}
            />
          )}

          {activeTab === 'rekap' && (
            <RekapView
              pendaftarList={roleFilteredList}
              currentUser={currentUser}
              onNavigatePendaftaran={() => setActiveTab('pendaftaran')}
              onRefresh={reloadData}
            />
          )}

          {activeTab === 'verifikasi' && (
            <VerifikasiView
              pendaftarList={pendaftarList}
              onNavigatePenguji={() => setActiveTab('penguji')}
              onRefresh={reloadData}
              onOpenPreview={() => setActiveTab('rekap')}
            />
          )}

          {activeTab === 'penguji' && (
            <PengujiView
              pendaftarList={pendaftarList}
              currentUser={currentUser}
              tanggalPenilaianMode={tanggalPenilaianMode}
              onRefresh={reloadData}
            />
          )}

          {['waktu', 'tglPenilaian', 'ttd', 'cetak', 'integration'].includes(activeTab) && (
            <AdminSettingsView
              initialSubTab={activeTab as any}
              deadlineSettings={deadlineSettings}
              tanggalPenilaianMode={tanggalPenilaianMode}
              penandaTanganSettings={penandaTanganSettings}
              suratSettings={suratSettings}
              integrationSettings={integrationSettings}
              pendaftarList={pendaftarList}
              onOpenPrintModal={(puskesmas, nomorSurat) => setPrintModalInfo({ puskesmas, nomorSurat })}
              onRefresh={reloadData}
            />
          )}
        </main>
      </div>

      {/* Print Document Modal */}
      {printModalInfo && (
        <PrintModal
          puskesmas={printModalInfo.puskesmas}
          nomorSurat={printModalInfo.nomorSurat}
          nakesList={printNakesList}
          penandaTangan={penandaTanganSettings}
          suratSettings={suratSettings}
          onClose={() => setPrintModalInfo(null)}
        />
      )}
    </div>
  );
}
