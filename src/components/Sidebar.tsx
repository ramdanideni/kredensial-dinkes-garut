import React, { useState } from 'react';
import {
  LayoutDashboard,
  FilePlus,
  TableProperties,
  ShieldCheck,
  UserCheck,
  Settings,
  Clock,
  CalendarCheck,
  PenTool,
  Printer,
  CloudCog,
  ChevronDown,
  X,
  FileBadge
} from 'lucide-react';
import type { UserRole } from '../types/index.ts';

export type ActiveTab =
  | 'dashboard'
  | 'pendaftaran'
  | 'rekap'
  | 'verifikasi'
  | 'penguji'
  | 'waktu'
  | 'tglPenilaian'
  | 'ttd'
  | 'cetak'
  | 'integration';

interface SidebarProps {
  currentRole: UserRole;
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  pendingCount: number;
  readyGradingCount: number;
  totalPendaftarCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRole,
  activeTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile,
  pendingCount,
  readyGradingCount,
  totalPendaftarCount
}) => {
  const [isAdminSubmenuOpen, setIsAdminSubmenuOpen] = useState(
    ['waktu', 'tglPenilaian', 'ttd', 'cetak', 'integration'].includes(activeTab)
  );

  const handleNavClick = (tab: ActiveTab) => {
    onSelectTab(tab);
    onCloseMobile();
  };

  const isAdminTab = ['waktu', 'tglPenilaian', 'ttd', 'cetak', 'integration'].includes(activeTab);

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200/80 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 p-1 flex items-center justify-center flex-none">
              <img
                src="https://drive.google.com/thumbnail?id=1pPj8_JplR9wlHCQqCG4Wxf0Yo9NXJsyY&sz=w100"
                alt="Logo Garut"
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            <div>
              <div className="font-extrabold text-sm text-slate-900 tracking-tight leading-tight">SDMK Garut</div>
              <div className="text-[11px] text-teal-700 font-semibold">Kredensialing Nakes</div>
            </div>
          </div>

          <button
            type="button"
            onClick={onCloseMobile}
            className="p-1.5 text-slate-400 hover:text-slate-700 lg:hidden rounded-lg hover:bg-slate-100"
            aria-label="Tutup menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1.5 text-xs font-semibold">
          {/* Dashboard */}
          {(currentRole === 'Admin' || currentRole === 'Verifikator' || currentRole === 'User') && (
            <button
              type="button"
              onClick={() => handleNavClick('dashboard')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20 font-bold'
                  : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <LayoutDashboard className="w-4 h-4 flex-none" />
                <span>Dashboard</span>
              </div>
            </button>
          )}

          {/* Pendaftaran */}
          {(currentRole === 'Admin' || currentRole === 'User' || currentRole === 'Verifikator') && (
            <button
              type="button"
              onClick={() => handleNavClick('pendaftaran')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'pendaftaran'
                  ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20 font-bold'
                  : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <FilePlus className="w-4 h-4 flex-none" />
                <span>Pendaftaran Kredensial</span>
              </div>
              {currentRole === 'User' && (
                <span className="px-2 py-0.5 rounded-md bg-teal-100 text-teal-800 text-[10px] font-bold">
                  Form
                </span>
              )}
            </button>
          )}

          {/* Rekap Data */}
          {(currentRole === 'Admin' || currentRole === 'User' || currentRole === 'Verifikator') && (
            <button
              type="button"
              onClick={() => handleNavClick('rekap')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'rekap'
                  ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20 font-bold'
                  : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <TableProperties className="w-4 h-4 flex-none" />
                <span>Rekap Data</span>
              </div>
              <span
                className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                  activeTab === 'rekap'
                    ? 'bg-teal-700 text-teal-100'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {totalPendaftarCount}
              </span>
            </button>
          )}

          {/* Verifikasi */}
          {(currentRole === 'Admin' || currentRole === 'Verifikator') && (
            <button
              type="button"
              onClick={() => handleNavClick('verifikasi')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'verifikasi'
                  ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20 font-bold'
                  : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-4 h-4 flex-none" />
                <span>Verifikasi Berkas</span>
              </div>
              {pendingCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-bold animate-pulse">
                  {pendingCount} Menunggu
                </span>
              )}
            </button>
          )}

          {/* Penguji */}
          {(currentRole === 'Admin' || currentRole === 'Penguji') && (
            <button
              type="button"
              onClick={() => handleNavClick('penguji')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'penguji'
                  ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20 font-bold'
                  : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <UserCheck className="w-4 h-4 flex-none" />
                <span>Portal Penguji</span>
              </div>
              {readyGradingCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-bold">
                  {readyGradingCount} Siap
                </span>
              )}
            </button>
          )}

          {/* Admin Menu Dropdown */}
          {currentRole === 'Admin' && (
            <div className="pt-3">
              <button
                type="button"
                onClick={() => setIsAdminSubmenuOpen(!isAdminSubmenuOpen)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all cursor-pointer ${
                  isAdminTab
                    ? 'bg-teal-50 text-teal-800 font-bold'
                    : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Settings className="w-4 h-4 flex-none text-teal-600" />
                  <span>Menu Admin</span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    isAdminSubmenuOpen ? 'rotate-180 text-teal-600' : 'text-slate-400'
                  }`}
                />
              </button>

              {isAdminSubmenuOpen && (
                <div className="mt-1 pl-4 space-y-1 border-l-2 border-teal-100 ml-5">
                  <button
                    type="button"
                    onClick={() => handleNavClick('waktu')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-colors cursor-pointer ${
                      activeTab === 'waktu'
                        ? 'bg-teal-600 text-white font-bold'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Waktu Pendaftaran</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleNavClick('tglPenilaian')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-colors cursor-pointer ${
                      activeTab === 'tglPenilaian'
                        ? 'bg-teal-600 text-white font-bold'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <CalendarCheck className="w-3.5 h-3.5" />
                    <span>Setting Tgl Penilaian</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleNavClick('ttd')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-colors cursor-pointer ${
                      activeTab === 'ttd'
                        ? 'bg-teal-600 text-white font-bold'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <PenTool className="w-3.5 h-3.5" />
                    <span>Penanda Tangan</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleNavClick('cetak')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-colors cursor-pointer ${
                      activeTab === 'cetak'
                        ? 'bg-teal-600 text-white font-bold'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Cetak Hasil Surat</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleNavClick('integration')}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-colors cursor-pointer ${
                      activeTab === 'integration'
                        ? 'bg-teal-600 text-white font-bold'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <CloudCog className="w-3.5 h-3.5 text-amber-500" />
                    <span>Spreadsheet & Drive Sync</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </nav>

        {/* Sidebar Footer info */}
        <div className="p-4 border-t border-slate-100 text-[11px] text-slate-400 bg-slate-50/50">
          <div className="flex items-center gap-2 text-teal-800 font-bold mb-1">
            <FileBadge className="w-3.5 h-3.5 text-teal-600" />
            <span>Sistem Kredensialing SDMK</span>
          </div>
          <p className="text-[10px] leading-relaxed text-slate-500">
            Dinas Kesehatan Kab. Garut • Realtime Bridge & Multi-role Evaluation
          </p>
        </div>
      </aside>
    </>
  );
};
