import React, { useState } from 'react';
import { ShieldCheck, Lock, User as UserIcon, Eye, EyeOff, LogIn, Sparkles, Building2, Stethoscope, CheckCircle2 } from 'lucide-react';
import type { User } from '../types/index.ts';
import { authenticate, saveUser } from '../services/storageService.ts';

interface LoginScreenProps {
  onLoginSuccess: (user: User) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    setTimeout(() => {
      const res = authenticate(username, password);
      setIsLoading(false);
      if (res.success && res.user) {
        saveUser(res.user, remember);
        onLoginSuccess(res.user);
      } else {
        setErrorMessage(res.message);
      }
    }, 300);
  };

  const handleQuickLogin = (uname: string, pass: string) => {
    setUsername(uname);
    setPassword(pass);
    setErrorMessage('');
    const res = authenticate(uname, pass);
    if (res.success && res.user) {
      saveUser(res.user, remember);
      onLoginSuccess(res.user);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col lg:flex-row bg-white overflow-y-auto">
      {/* Left Banner (40%) */}
      <div className="relative flex-none lg:w-5/12 bg-gradient-to-br from-teal-900 via-teal-800 to-teal-950 text-white p-8 lg:p-14 flex flex-col justify-between overflow-hidden shadow-2xl">
        {/* Subtle decorative glow circles */}
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        {/* Brand Top */}
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-2 flex items-center justify-center shadow-lg">
            <img
              src="https://drive.google.com/thumbnail?id=1pPj8_JplR9wlHCQqCG4Wxf0Yo9NXJsyY&sz=w200"
              alt="Logo Garut"
              className="w-full h-full object-contain"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white leading-none">SDMK Garut</h2>
            <p className="text-xs text-teal-200 mt-1 font-medium">Kredensialing Tenaga Kesehatan</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 my-10 lg:my-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white/15 border border-white/25 backdrop-blur-md text-teal-100 mb-6">
            <ShieldCheck className="w-4 h-4 text-teal-300" />
            Portal Resmi Dinas Kesehatan Kab. Garut
          </div>

          <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight mb-4">
            Portal Kredensialing & Rekredensialing SDMK
          </h1>

          <p className="text-sm lg:text-base text-teal-100/90 leading-relaxed mb-8 max-w-lg">
            Sistem terintegrasi untuk verifikasi kompetensi klinis Dokter, Dokter Gigi, Bidan, dan Perawat Puskesmas secara responsif dan realtime.
          </p>

          <div className="space-y-3.5">
            <div className="flex items-center gap-3 text-sm text-teal-50">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-400 shadow-[0_0_12px_#2dd4bf]" />
              <span>Verifikasi Berkas SIP, STR & Surat Ajuan Resmi</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-teal-50">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-400 shadow-[0_0_12px_#2dd4bf]" />
              <span>Penilaian Kewenangan Klinis oleh 3 Penguji Multi-Profesi</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-teal-50">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-400 shadow-[0_0_12px_#2dd4bf]" />
              <span>Penerbitan RKK & SK Kepala Dinas Kesehatan (F4/A4)</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-teal-50">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-400 shadow-[0_0_12px_#2dd4bf]" />
              <span>Sinkronisasi Google Spreadsheet & Drive Realtime</span>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="relative z-10 text-xs text-teal-200/80 pt-6 border-t border-white/10 flex items-center gap-2">
          <Lock className="w-3.5 h-3.5 text-teal-300 flex-none" />
          <span>Keamanan data terlindungi sesuai standar Dinkes Kab. Garut</span>
        </div>
      </div>

      {/* Right Login Form (60%) */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-14 bg-slate-50/80">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 lg:p-10 shadow-xl shadow-slate-200/60 border border-slate-100">
          <div className="mb-8">
            <span className="text-xs font-bold tracking-wider text-teal-700 uppercase bg-teal-50 px-3 py-1 rounded-full border border-teal-200/60">
              Dinas Kesehatan Garut
            </span>
            <h2 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight mt-3">
              Selamat Datang
            </h2>
            <p className="text-sm text-slate-500 mt-1.5">
              Silakan masuk dengan akun Puskesmas, Penguji, atau Administrator.
            </p>
          </div>

          {errorMessage && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2.5 animate-shake">
              <span className="w-2 h-2 rounded-full bg-rose-500 flex-none" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5" htmlFor="loginUsername">
                Username
              </label>
              <div className="relative rounded-xl border border-slate-200 bg-white focus-within:border-teal-600 focus-within:ring-4 focus-within:ring-teal-500/10 transition-all">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  id="loginUsername"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username akun"
                  required
                  className="w-full pl-10 pr-4 py-3 text-sm rounded-xl outline-none text-slate-900 placeholder:text-slate-400 bg-transparent font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5" htmlFor="loginPassword">
                Password
              </label>
              <div className="relative rounded-xl border border-slate-200 bg-white focus-within:border-teal-600 focus-within:ring-4 focus-within:ring-teal-500/10 transition-all">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="loginPassword"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  required
                  className="w-full pl-10 pr-11 py-3 text-sm rounded-xl outline-none text-slate-900 placeholder:text-slate-400 bg-transparent font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                  tabIndex={-1}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600 font-medium select-none">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-4 h-4 rounded text-teal-600 accent-teal-600 cursor-pointer"
                />
                <span>Ingat saya di perangkat ini</span>
              </label>
              <span className="text-slate-400">Auto-login 30 hari</span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3.5 px-5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 focus:outline-none focus:ring-4 focus:ring-teal-500/20 active:scale-[0.99] transition-all shadow-lg shadow-teal-700/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Masuk ke Portal Kredensialing</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Access Bar */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                Uji Coba Cepat (Pilih Role):
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin', 'admin123')}
                className="p-2.5 rounded-xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/50 text-left transition-all group"
              >
                <div className="font-bold text-slate-800 flex items-center gap-1 group-hover:text-teal-700">
                  <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                  Admin Dinkes
                </div>
                <div className="text-[11px] text-slate-500">Akses penuh semua menu</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('garut', 'puskesmas123')}
                className="p-2.5 rounded-xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/50 text-left transition-all group"
              >
                <div className="font-bold text-slate-800 flex items-center gap-1 group-hover:text-teal-700">
                  <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                  Puskesmas Garut
                </div>
                <div className="text-[11px] text-slate-500">Pendaftaran & Rekap</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('penguji_dr', 'penguji123')}
                className="p-2.5 rounded-xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/50 text-left transition-all group"
              >
                <div className="font-bold text-slate-800 flex items-center gap-1 group-hover:text-teal-700">
                  <Stethoscope className="w-3.5 h-3.5 text-indigo-600" />
                  Penguji Dokter
                </div>
                <div className="text-[11px] text-slate-500">Penilaian Klinis Dokter</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('verifikator', 'verif123')}
                className="p-2.5 rounded-xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/50 text-left transition-all group"
              >
                <div className="font-bold text-slate-800 flex items-center gap-1 group-hover:text-teal-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                  Verifikator SDK
                </div>
                <div className="text-[11px] text-slate-500">Verifikasi Berkas SIP/STR</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
