import React, { useState, useEffect } from 'react';
import {
  Users,
  Hourglass,
  CheckCircle2,
  ClipboardCheck,
  Trophy,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  Sparkles,
  PieChart
} from 'lucide-react';
import type { Pendaftar, DeadlineSettings } from '../types/index.ts';
import { calculateKPIs, calculateCountdown, formatDateShort } from '../utils/rules.ts';

interface DashboardViewProps {
  pendaftarList: Pendaftar[];
  deadlineSettings: DeadlineSettings | null;
  onNavigateTab: (tab: any) => void;
  onRefresh: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  pendaftarList,
  deadlineSettings,
  onNavigateTab,
  onRefresh
}) => {
  const [selectedProfesiFilter, setSelectedProfesiFilter] = useState('ALL');
  const [countdown, setCountdown] = useState(
    calculateCountdown(deadlineSettings?.tanggal, deadlineSettings?.jam)
  );

  // Live countdown timer ticking each second
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(calculateCountdown(deadlineSettings?.tanggal, deadlineSettings?.jam));
    }, 1000);
    return () => clearInterval(timer);
  }, [deadlineSettings]);

  const kpis = calculateKPIs(pendaftarList);

  // Professions breakdown
  const profesiGroups = pendaftarList.reduce((acc, curr) => {
    const key = curr.jenisProfesi || curr.profesi || 'Lainnya';
    if (!acc[key]) {
      acc[key] = { total: 0, pending: 0, diterima: 0, ditolak: 0, dinilai: 0, profesi: curr.profesi };
    }
    acc[key].total++;
    if (curr.statusVerifikasi === 'Diterima') acc[key].diterima++;
    else if (curr.statusVerifikasi === 'Ditolak') acc[key].ditolak++;
    else acc[key].pending++;

    if (curr.statusPenilaian === 'Selesai') acc[key].dinilai++;
    return acc;
  }, {} as Record<string, { total: number; pending: number; diterima: number; ditolak: number; dinilai: number; profesi: string }>);

  // Filtered list for bar chart
  const filteredForChart = Object.entries(profesiGroups).filter(([_, data]) => {
    if (selectedProfesiFilter === 'ALL') return true;
    return data.profesi === selectedProfesiFilter;
  });

  const maxChartVal = Math.max(...filteredForChart.map(([_, d]) => d.total), 1);

  // Top Puskesmas Leaderboard
  const puskesmasMap = pendaftarList.reduce((acc, curr) => {
    const p = curr.puskesmas || 'Puskesmas Umum';
    acc[p] = (acc[p] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topPuskesmas = Object.entries(puskesmasMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const maxPuskesmasCount = topPuskesmas[0] ? topPuskesmas[0][1] : 1;

  // Recent 5 applicants
  const recentList = [...pendaftarList]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Hero Banner with Live Countdown */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-800 via-teal-700 to-teal-900 text-white p-6 md:p-8 shadow-xl shadow-teal-900/10">
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-white/5 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/15 border border-white/20 backdrop-blur-md mb-3">
              <Sparkles className="w-3.5 h-3.5 text-teal-300" />
              Periode Kredensialing & Rekredensialing Aktif 2026
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white leading-tight">
              Portal Kredensialing Tenaga Kesehatan Puskesmas
            </h1>
            <p className="mt-2 text-xs md:text-sm text-teal-100/90 leading-relaxed max-w-xl">
              Memverifikasi kompetensi klinis Dokter, Dokter Gigi, Bidan, dan Perawat untuk penerbitan Rekomendasi Rincian Kewenangan Klinis (RKK) dan Surat Keputusan Kepala Dinas Kesehatan.
            </p>
          </div>

          {/* Live Countdown Card */}
          <div className="w-full lg:w-auto bg-slate-900/40 backdrop-blur-md border border-white/20 rounded-2xl p-4 sm:p-5 flex-none shadow-lg">
            <div className="flex items-center justify-between gap-4 mb-3">
              <span className="text-xs font-bold text-teal-200 flex items-center gap-1.5">
                <Hourglass className="w-3.5 h-3.5" />
                Batas Waktu Pendaftaran:
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold ${
                  countdown.isClosed
                    ? 'bg-rose-500 text-white'
                    : 'bg-emerald-400 text-emerald-950'
                }`}
              >
                {countdown.isClosed ? 'Ditutup' : 'Dibuka'}
              </span>
            </div>

            {countdown.hasDeadline ? (
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="bg-white/10 rounded-xl p-2.5 border border-white/15 min-w-[55px]">
                  <div className="text-xl sm:text-2xl font-black font-mono tracking-tight">{String(countdown.days).padStart(2, '0')}</div>
                  <div className="text-[10px] uppercase font-bold text-teal-200 mt-0.5">Hari</div>
                </div>
                <div className="bg-white/10 rounded-xl p-2.5 border border-white/15 min-w-[55px]">
                  <div className="text-xl sm:text-2xl font-black font-mono tracking-tight">{String(countdown.hours).padStart(2, '0')}</div>
                  <div className="text-[10px] uppercase font-bold text-teal-200 mt-0.5">Jam</div>
                </div>
                <div className="bg-white/10 rounded-xl p-2.5 border border-white/15 min-w-[55px]">
                  <div className="text-xl sm:text-2xl font-black font-mono tracking-tight">{String(countdown.minutes).padStart(2, '0')}</div>
                  <div className="text-[10px] uppercase font-bold text-teal-200 mt-0.5">Menit</div>
                </div>
                <div className="bg-white/10 rounded-xl p-2.5 border border-white/15 min-w-[55px]">
                  <div className="text-xl sm:text-2xl font-black font-mono tracking-tight text-emerald-300">{String(countdown.seconds).padStart(2, '0')}</div>
                  <div className="text-[10px] uppercase font-bold text-teal-200 mt-0.5">Detik</div>
                </div>
              </div>
            ) : (
              <div className="text-center py-2 text-xs text-teal-100 font-medium">
                Pendaftaran dibuka tanpa batas waktu tertentu.
              </div>
            )}

            <div className="mt-3 pt-2.5 border-t border-white/10 text-center text-[11px] text-teal-200">
              Batas: <strong className="text-white">{deadlineSettings ? `${deadlineSettings.tanggal} ${deadlineSettings.jam} WIB` : 'Tidak Dibatasi'}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all relative overflow-hidden group">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-teal-600 rounded-l-2xl" />
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-3">
            <Users className="w-5 h-5" />
          </div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Pendaftar</div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-0.5 tracking-tight">{kpis.total}</div>
          <div className="text-xs text-slate-500 mt-1">Seluruh nakes Puskesmas</div>
        </div>

        {/* Pending */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all relative overflow-hidden group">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-amber-500 rounded-l-2xl" />
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
            <Hourglass className="w-5 h-5" />
          </div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Menunggu Verifikasi</div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-0.5 tracking-tight">{kpis.pending}</div>
          <div className="text-xs text-slate-500 mt-1">Berkas belum diverifikasi</div>
        </div>

        {/* Diterima */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all relative overflow-hidden group">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-600 rounded-l-2xl" />
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Terverifikasi (Valid)</div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-0.5 tracking-tight">{kpis.diterima}</div>
          <div className="text-xs text-slate-500 mt-1">Siap dinilai tim penguji</div>
        </div>

        {/* Sudah Dinilai */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all relative overflow-hidden group">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-indigo-600 rounded-l-2xl" />
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
            <ClipboardCheck className="w-5 h-5" />
          </div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Sudah Dinilai</div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-0.5 tracking-tight">{kpis.selesaiPenilaian}</div>
          <div className="text-xs text-slate-500 mt-1">{kpis.progressPercent}% total selesai</div>
        </div>
      </div>

      {/* Middle Row: Chart & Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profession Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Pendaftaran Berdasarkan Jenis Profesi</h2>
                <p className="text-xs text-slate-500">Komparasi jumlah pendaftar nakes</p>
              </div>
            </div>

            <select
              value={selectedProfesiFilter}
              onChange={(e) => setSelectedProfesiFilter(e.target.value)}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 outline-none focus:border-teal-600"
            >
              <option value="ALL">Semua Profesi</option>
              <option value="Dokter">Dokter</option>
              <option value="Dokter Gigi">Dokter Gigi</option>
              <option value="Bidan">Bidan</option>
              <option value="Perawat">Perawat</option>
            </select>
          </div>

          <div className="space-y-4">
            {filteredForChart.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">Belum ada data pendaftaran</div>
            ) : (
              filteredForChart.map(([nama, data]) => {
                const percent = Math.round((data.total / maxChartVal) * 100);
                return (
                  <div key={nama} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">{nama}</span>
                      <div className="flex items-center gap-2 font-mono">
                        <span className="text-slate-500">{data.dinilai} dinilai /</span>
                        <span className="font-bold text-teal-700">{data.total} nakes</span>
                      </div>
                    </div>
                    <div className="h-4 bg-slate-100 rounded-full overflow-hidden flex">
                      <div
                        className="h-full bg-gradient-to-r from-teal-500 to-teal-700 rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Status Verification Donut Summary */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
                <PieChart className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Distribusi Verifikasi</h2>
                <p className="text-xs text-slate-500">Status berkas administrasi</p>
              </div>
            </div>

            {/* Circular Visual Indicator */}
            <div className="flex items-center justify-center my-4">
              <div className="relative w-36 h-36 rounded-full flex items-center justify-center bg-slate-50 border-8 border-slate-100">
                <div className="text-center">
                  <div className="text-2xl font-black text-slate-900 tracking-tight">{kpis.progressPercent}%</div>
                  <div className="text-[10px] font-bold text-slate-500 uppercase">Dinilai</div>
                </div>
              </div>
            </div>

            <div className="space-y-2.5 text-xs font-semibold">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 text-emerald-900">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  Diterima (Valid)
                </span>
                <span className="font-bold font-mono text-sm">{kpis.diterima}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50 text-amber-900">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  Menunggu (Pending)
                </span>
                <span className="font-bold font-mono text-sm">{kpis.pending}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-rose-50 text-rose-900">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  Ditolak
                </span>
                <span className="font-bold font-mono text-sm">{kpis.ditolak}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigateTab('verifikasi')}
            className="mt-5 w-full py-2.5 px-3 rounded-xl border border-teal-200 text-teal-800 hover:bg-teal-50 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <span>Buka Antrean Verifikasi</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Bottom Row: Top Puskesmas Leaderboard & Recent Applicants */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Puskesmas */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Trophy className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Top Puskesmas Pendaftar</h2>
                <p className="text-xs text-slate-500">Puskesmas dengan ajuan terbanyak</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {topPuskesmas.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">Belum ada data Puskesmas</div>
            ) : (
              topPuskesmas.map(([puskName, count], idx) => {
                const percent = Math.round((count / maxPuskesmasCount) * 100);
                const medalColors = ['bg-amber-400 text-amber-950', 'bg-slate-300 text-slate-800', 'bg-amber-600 text-white'];
                const badgeClass = idx < 3 ? medalColors[idx] : 'bg-slate-100 text-slate-600';

                return (
                  <div key={puskName} className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors">
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs flex-none ${badgeClass}`}>
                      {idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-800 truncate">{puskName}</div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-1.5">
                        <div
                          className="bg-teal-600 h-full rounded-full transition-all"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-right flex-none pl-2">
                      <span className="font-extrabold text-sm text-slate-900">{count}</span>
                      <span className="text-[10px] text-slate-500 block">nakes</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Recent Applicants */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Pendaftar Terbaru</h2>
                  <p className="text-xs text-slate-500">Ajuan masuk terakhir ke sistem</p>
                </div>
              </div>

              <button
                type="button"
                onClick={onRefresh}
                className="p-1.5 text-slate-400 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition-colors cursor-pointer"
                title="Perbarui data"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {recentList.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">Belum ada ajuan pendaftaran</div>
              ) : (
                recentList.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-50/70 border border-slate-100">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-teal-700 text-white font-bold text-xs flex items-center justify-center flex-none">
                        {item.nama.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-800 truncate">{item.nama}</div>
                        <div className="text-[11px] text-slate-500 truncate">
                          {item.profesi} • {item.puskesmas}
                        </div>
                      </div>
                    </div>

                    <div className="flex-none text-right">
                      {item.statusVerifikasi === 'Diterima' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          Diterima
                        </span>
                      ) : item.statusVerifikasi === 'Ditolak' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                          Ditolak
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                          Pending
                        </span>
                      )}
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {formatDateShort(item.timestamp)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigateTab('rekap')}
            className="mt-4 w-full py-2.5 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <span>Buka Rekapitulasi Lengkap</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
