import React, { useState, useEffect } from 'react';
import { Menu, LogOut, Radio, Clock, ShieldCheck, UserCheck, CheckCircle2, ChevronDown } from 'lucide-react';
import type { User, UserRole } from '../types/index.ts';
import { MASTER_USERS } from '../data/initialData.ts';
import { saveUser } from '../services/storageService.ts';

interface NavbarProps {
  user: User;
  onLogout: () => void;
  onToggleSidebar: () => void;
  pageTitle: string;
  onSwitchUserRole?: (user: User) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onLogout,
  onToggleSidebar,
  pageTitle,
  onSwitchUserRole
}) => {
  const [currentTimeStr, setCurrentTimeStr] = useState('');
  const [currentDateStr, setCurrentDateStr] = useState('');
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hari = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'][now.getDay()];
      const bulan = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'][now.getMonth()];
      const pad = (n: number) => String(n).padStart(2, '0');

      setCurrentDateStr(`${hari}, ${pad(now.getDate())} ${bulan} ${now.getFullYear()}`);
      setCurrentTimeStr(`${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())} WIB`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSelectRole = (targetRole: UserRole) => {
    const found = MASTER_USERS.find(u => u.hak === targetRole);
    if (found) {
      saveUser(found, true);
      if (onSwitchUserRole) {
        onSwitchUserRole(found);
      }
    }
    setShowRoleMenu(false);
  };

  const getRoleBadgeStyle = (role: UserRole) => {
    switch (role) {
      case 'Admin':
        return 'bg-teal-50 text-teal-800 border-teal-200';
      case 'User':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Penguji':
        return 'bg-indigo-50 text-indigo-800 border-indigo-200';
      case 'Verifikator':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      default:
        return 'bg-slate-50 text-slate-800 border-slate-200';
    }
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-6 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label="Buka menu navigasi"
          className="p-2 -ml-1 text-slate-600 rounded-xl hover:bg-slate-100 hover:text-slate-900 transition-colors lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-base md:text-lg font-bold text-slate-900 leading-tight">
            {pageTitle}
          </h1>
          <p className="text-[11px] text-slate-500 hidden sm:block">
            Portal Kredensialing Tenaga Kesehatan Puskesmas Kab. Garut
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        {/* Realtime Status Indicator */}
        <div className="hidden sm:inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/70 shadow-xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="tracking-tight text-[11px] font-bold">Realtime Aktif</span>
        </div>

        {/* Live Clock */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-600 font-mono">
          <Clock className="w-3.5 h-3.5 text-teal-600" />
          <span>{currentDateStr}</span>
          <span className="font-bold text-slate-800">{currentTimeStr}</span>
        </div>

        {/* Role Quick Switcher */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-xs ${getRoleBadgeStyle(user.hak)}`}
            title="Klik untuk ganti mode peran uji coba"
          >
            <span>Role: {user.hak}</span>
            <ChevronDown className="w-3 h-3 opacity-60" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200/80 py-2 z-50 text-xs animate-in fade-in slide-in-from-top-2">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                Pilih Peran Uji Coba (Live Switch)
              </div>
              <button
                type="button"
                onClick={() => handleSelectRole('Admin')}
                className="w-full px-3 py-2 text-left flex items-center justify-between hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-2 font-medium text-slate-800">
                  <ShieldCheck className="w-4 h-4 text-teal-600" />
                  <span>Admin Dinkes</span>
                </div>
                {user.hak === 'Admin' && <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />}
              </button>

              <button
                type="button"
                onClick={() => handleSelectRole('User')}
                className="w-full px-3 py-2 text-left flex items-center justify-between hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-2 font-medium text-slate-800">
                  <Radio className="w-4 h-4 text-emerald-600" />
                  <span>Puskesmas (User)</span>
                </div>
                {user.hak === 'User' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
              </button>

              <button
                type="button"
                onClick={() => handleSelectRole('Penguji')}
                className="w-full px-3 py-2 text-left flex items-center justify-between hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-2 font-medium text-slate-800">
                  <UserCheck className="w-4 h-4 text-indigo-600" />
                  <span>Tim Penguji</span>
                </div>
                {user.hak === 'Penguji' && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />}
              </button>

              <button
                type="button"
                onClick={() => handleSelectRole('Verifikator')}
                className="w-full px-3 py-2 text-left flex items-center justify-between hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-2 font-medium text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-amber-600" />
                  <span>Tim Verifikator</span>
                </div>
                {user.hak === 'Verifikator' && <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />}
              </button>
            </div>
          )}
        </div>

        {/* User Chip */}
        <div className="hidden md:flex items-center gap-2.5 pl-2 pr-3 py-1 bg-slate-50 border border-slate-200/80 rounded-full">
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-teal-700 to-teal-500 text-white font-bold text-xs flex items-center justify-center shadow-xs">
            {user.nama.charAt(0).toUpperCase()}
          </div>
          <div className="text-left leading-tight">
            <div className="text-xs font-bold text-slate-800 max-w-[130px] truncate">{user.nama}</div>
            <div className="text-[10px] text-slate-500 max-w-[130px] truncate">{user.puskesmas || user.hak}</div>
          </div>
        </div>

        {/* Logout Button */}
        <button
          type="button"
          onClick={onLogout}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-xl transition-all"
          title="Keluar dari sistem"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Keluar</span>
        </button>
      </div>
    </header>
  );
};
