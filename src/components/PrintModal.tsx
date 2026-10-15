import React from 'react';
import { Printer, X, Download } from 'lucide-react';
import type { Pendaftar, PenandaTanganSettings, SuratSettings } from '../types/index.ts';
import { formatDateIndo } from '../utils/rules.ts';

interface PrintModalProps {
  puskesmas: string;
  nomorSurat: string;
  nakesList: Pendaftar[];
  penandaTangan: PenandaTanganSettings;
  suratSettings: SuratSettings;
  onClose: () => void;
}

export const PrintModal: React.FC<PrintModalProps> = ({
  puskesmas,
  nomorSurat,
  nakesList,
  penandaTangan,
  suratSettings,
  onClose
}) => {
  const currentDateStr = formatDateIndo(new Date());
  const kodeSurat = suratSettings.kodeSurat || '400.7.22.1';
  const logoSrc = suratSettings.logoKop || 'https://drive.google.com/thumbnail?id=1pPj8_JplR9wlHCQqCG4Wxf0Yo9NXJsyY&sz=w200';

  const handlePrint = () => {
    window.print();
  };

  const firstNakes = nakesList[0] || {
    noSurat: '445/PKM/2026',
    timestamp: new Date().toISOString()
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/70 backdrop-blur-xs">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl flex flex-col max-h-[96vh] overflow-hidden border border-slate-200">
        {/* Header Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50 flex-none print:hidden">
          <div>
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Printer className="w-5 h-5 text-teal-600" />
              <span>Pratinjau Cetak Surat Hasil Kredensialing</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {puskesmas} • {nakesList.length} Tenaga Kesehatan • Kertas: {suratSettings.paperSize || 'F4'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-teal-600 hover:bg-teal-700 transition-colors shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Dokumen Sekarang</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Document Body (Formatted for Screen and Print) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-100 print:bg-white print:p-0">
          <div className="print-document-container max-w-[215mm] mx-auto space-y-12 print:space-y-0 print:max-w-none">
            {/* ================= PAGE 1: SURAT PENGANTAR ================= */}
            <div className="print-page bg-white p-8 sm:p-12 rounded-2xl shadow-sm print:shadow-none print:p-0 print:rounded-none">
              {/* Kop Surat */}
              <div className="flex items-center gap-4 pb-3 border-b-4 border-double border-slate-900 mb-6">
                <div className="w-20 h-20 flex-none flex items-center justify-center">
                  <img
                    src={logoSrc}
                    alt="Logo Garut"
                    className="w-20 h-20 object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
                <div className="flex-1 text-center font-serif leading-snug">
                  <div className="text-base font-bold tracking-wider text-slate-900 uppercase">Pemerintah Kabupaten Garut</div>
                  <div className="text-xl font-black tracking-widest text-slate-900 uppercase my-0.5">Dinas Kesehatan</div>
                  <div className="text-[11px] text-slate-700">Jalan Proklamasi Nomor 7 Tarogong Kidul Telp (0262) 232670-2246426</div>
                  <div className="text-[11px] text-slate-700">Website : https://www.dinkes.garut.org</div>
                </div>
                <div className="w-20 flex-none" />
              </div>

              {/* Header Info */}
              <table className="w-full text-xs font-serif leading-relaxed mb-6">
                <tbody>
                  <tr>
                    <td className="w-20 align-top">Nomor</td>
                    <td className="w-3 align-top">:</td>
                    <td className="align-top font-bold">{kodeSurat}/{nomorSurat}/DINKES</td>
                    <td className="text-right align-top">Garut, {currentDateStr}</td>
                  </tr>
                  <tr>
                    <td className="align-top">Perihal</td>
                    <td className="align-top">:</td>
                    <td className="align-top font-bold" colSpan={2}>Hasil Kredensialing</td>
                  </tr>
                  <tr>
                    <td className="align-top">Lampiran</td>
                    <td className="align-top">:</td>
                    <td className="align-top" colSpan={2}>1 Berkas</td>
                  </tr>
                </tbody>
              </table>

              {/* Tujuan */}
              <div className="text-xs font-serif leading-relaxed mb-6">
                Yth. Kepala <strong>{puskesmas}</strong><br />
                di<br />
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Tempat
              </div>

              {/* Isi Surat */}
              <p className="text-xs font-serif text-justify leading-relaxed mb-3">
                Sehubungan dengan surat Saudara nomor : <strong>{firstNakes.noSurat}</strong> hal permohonan Kredensialing Tenaga Kesehatan. Bersama ini kami sampaikan hal-hal sebagai berikut :
              </p>

              <ol className="text-xs font-serif list-decimal pl-5 space-y-1.5 text-justify leading-relaxed mb-6">
                <li>Telah dilakukan proses kredensial terhadap tenaga kesehatan yang Saudara usulkan.</li>
                <li>Telah ditetapkan kewenangan klinis terhadap tenaga kesehatan yang bertugas di tempat Saudara sebagaimana terlampir.</li>
                <li>Terhadap tenaga kesehatan dengan rekomendasi tim kredensial berupa direkomendasikan dengan catatan, agar dilakukan pembinaan berupa asistensi atau pendampingan dalam melakukan pelayanan.</li>
                <li>Tenaga kesehatan yang tidak mendapatkan penetapan kewenangan klinis agar diusulkan untuk mendapatkan pembinaan lebih lanjut.</li>
              </ol>

              <p className="text-xs font-serif mb-12">
                Atas perhatian dan kerja sama Saudara, kami ucapkan terima kasih.
              </p>

              {/* Tanda Tangan */}
              <div className="flex justify-end font-serif text-xs">
                <div className="text-center w-64 leading-relaxed">
                  <div>Kepala Dinas Kesehatan</div>
                  <div>Kabupaten Garut</div>
                  <div className="h-20" />
                  <div className="font-bold underline uppercase">{penandaTangan.nama}</div>
                  <div>{penandaTangan.pangkat}</div>
                  <div>NIP. {penandaTangan.nip}</div>
                </div>
              </div>
            </div>

            {/* ================= PAGE 2: LAMPIRAN I ================= */}
            <div className="print-page bg-white p-8 sm:p-12 rounded-2xl shadow-sm print:shadow-none print:p-0 print:rounded-none">
              <div className="font-serif text-xs leading-relaxed mb-6">
                <div className="font-bold">Lampiran I</div>
                <table>
                  <tbody>
                    <tr>
                      <td className="w-20">Nomor</td>
                      <td className="w-3">:</td>
                      <td className="font-bold">{kodeSurat}/{nomorSurat}/DINKES</td>
                    </tr>
                    <tr>
                      <td>Tanggal</td>
                      <td>:</td>
                      <td>{currentDateStr}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="text-center font-serif mb-6">
                <h4 className="font-bold text-sm tracking-wider uppercase">
                  Daftar Ketetapan Kewenangan Klinis Tenaga Kesehatan
                </h4>
                <h5 className="font-bold text-sm uppercase">
                  Di {puskesmas}
                </h5>
              </div>

              <table className="w-full text-xs font-serif border border-slate-900 border-collapse mb-10">
                <thead>
                  <tr className="bg-slate-50 print:bg-transparent">
                    <th className="border border-slate-900 p-2 text-center w-10">No</th>
                    <th className="border border-slate-900 p-2 text-left">Nama Tenaga Kesehatan</th>
                    <th className="border border-slate-900 p-2 text-center">Nomor Surat Ajuan</th>
                    <th className="border border-slate-900 p-2 text-center">Profesi</th>
                    <th className="border border-slate-900 p-2 text-center">Berlaku Sampai</th>
                  </tr>
                </thead>
                <tbody>
                  {nakesList.map((nakes, idx) => (
                    <tr key={nakes.id}>
                      <td className="border border-slate-900 p-2 text-center">{idx + 1}</td>
                      <td className="border border-slate-900 p-2 font-bold">{nakes.nama}</td>
                      <td className="border border-slate-900 p-2 text-center font-mono">{nakes.noSurat}</td>
                      <td className="border border-slate-900 p-2 text-center">{nakes.jenisProfesi}</td>
                      <td className="border border-slate-900 p-2 text-center font-mono">{nakes.tglMasaSIP}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Tanda Tangan */}
              <div className="flex justify-end font-serif text-xs">
                <div className="text-center w-64 leading-relaxed">
                  <div>Kepala Dinas Kesehatan</div>
                  <div>Kabupaten Garut</div>
                  <div className="h-20" />
                  <div className="font-bold underline uppercase">{penandaTangan.nama}</div>
                  <div>{penandaTangan.pangkat}</div>
                  <div>NIP. {penandaTangan.nip}</div>
                </div>
              </div>
            </div>

            {/* ================= CERTIFICATE & DETAILED RKK PER NAKES ================= */}
            {nakesList.map((nakes, urut) => {
              const nomorUrut = urut + 1;
              return (
                <React.Fragment key={nakes.id}>
                  {/* Sertifikat Penetapan RKK */}
                  <div className="print-page bg-white p-8 sm:p-12 rounded-2xl shadow-sm print:shadow-none print:p-0 print:rounded-none">
                    <div className="text-center font-serif mb-6">
                      <h4 className="font-bold text-base tracking-wider uppercase">
                        Penetapan Kewenangan Klinis
                      </h4>
                    </div>

                    <div className="border-2 border-slate-900 font-serif text-xs">
                      <div className="grid grid-cols-2 border-b border-slate-900 p-3">
                        <div>
                          <strong>Nomor:</strong> {kodeSurat}/{nomorSurat}.{nomorUrut}/DINKES
                        </div>
                        <div className="text-right">
                          <strong>Tanggal:</strong> {currentDateStr}
                        </div>
                      </div>

                      <div className="p-3 border-b border-slate-900">
                        <strong>Tanggal Pelaksanaan:</strong> {nakes.tglPenilaian || currentDateStr}
                      </div>

                      <div className="p-3 border-b border-slate-900">
                        <strong>Catatan Penguji:</strong> {nakes.catatan || 'Kewenangan klinis disetujui sesuai rincian terlampir.'}
                      </div>

                      <div className="p-6 text-center leading-relaxed border-b border-slate-900">
                        <div className="font-bold text-sm mb-2">MENERANGKAN:</div>
                        <p className="max-w-xl mx-auto">
                          Bahwa <strong>{nakes.nama}</strong> telah menjalani kredensialing sebagai <strong>{nakes.profesi} ({nakes.jenisProfesi})</strong> di <strong>{nakes.puskesmas}</strong> dan diberikan kewenangan klinis sesuai hasil rekomendasi tim kredensial.
                        </p>
                      </div>

                      <div className="grid grid-cols-2 p-4">
                        <div>
                          <div className="font-bold mb-1">Berlaku sampai dengan:</div>
                          <div className="font-bold text-sm font-mono">{nakes.tglMasaSIP}</div>
                        </div>

                        <div className="text-center leading-relaxed">
                          <div>Kepala Dinas Kesehatan</div>
                          <div>Kabupaten Garut</div>
                          <div className="h-16" />
                          <div className="font-bold underline uppercase">{penandaTangan.nama}</div>
                          <div>{penandaTangan.pangkat}</div>
                          <div>NIP. {penandaTangan.nip}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Rincian Tindakan RKK */}
                  <div className="print-page bg-white p-8 sm:p-12 rounded-2xl shadow-sm print:shadow-none print:p-0 print:rounded-none">
                    <div className="text-center font-serif mb-6">
                      <h4 className="font-bold text-base tracking-wider uppercase">
                        Rincian Penetapan Kewenangan Klinis
                      </h4>
                    </div>

                    <table className="w-full text-xs font-serif mb-4 leading-relaxed">
                      <tbody>
                        <tr>
                          <td className="w-36">Nama & Gelar</td>
                          <td className="w-3">:</td>
                          <td className="font-bold">{nakes.nama}</td>
                        </tr>
                        <tr>
                          <td>Puskesmas</td>
                          <td>:</td>
                          <td>{nakes.puskesmas}</td>
                        </tr>
                        <tr>
                          <td>Profesi / Jenis</td>
                          <td>:</td>
                          <td>{nakes.profesi} / {nakes.jenisProfesi}</td>
                        </tr>
                        <tr>
                          <td>No. Surat Tugas</td>
                          <td>:</td>
                          <td>{nakes.noSurat}</td>
                        </tr>
                        <tr>
                          <td>Rekomendasi</td>
                          <td>:</td>
                          <td className="font-bold text-emerald-800">{nakes.rekomendasi || 'Direkomendasikan'}</td>
                        </tr>
                      </tbody>
                    </table>

                    <table className="w-full text-[11px] font-serif border border-slate-900 border-collapse mb-6">
                      <thead>
                        <tr className="bg-slate-50 print:bg-transparent">
                          <th className="border border-slate-900 p-1.5 text-center w-8">No</th>
                          <th className="border border-slate-900 p-1.5 text-left">Jenis Pelayanan / Tindakan</th>
                          <th className="border border-slate-900 p-1.5 text-center w-36">Pengajuan Nakes</th>
                          <th className="border border-slate-900 p-1.5 text-center w-48">Keputusan Tim Penguji</th>
                        </tr>
                      </thead>
                      <tbody>
                        {nakes.rincian?.map((r, i) => (
                          <tr key={i}>
                            <td className="border border-slate-900 p-1.5 text-center">{i + 1}</td>
                            <td className="border border-slate-900 p-1.5">{r.tindakan}</td>
                            <td className="border border-slate-900 p-1.5 text-center">
                              {r.pilihan === '1' ? 'Kompeten Sepenuhnya' : r.pilihan === '2' ? 'Perlu Supervisi' : 'Tidak Dimintakan'}
                            </td>
                            <td className="border border-slate-900 p-1.5 font-bold">
                              {r.keputusanPenguji || 'Disetujui berwenang penuh'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Penguji List */}
                    <div className="font-serif text-xs mb-8">
                      <div className="font-bold mb-1">Tim Penguji:</div>
                      <ol className="list-decimal pl-5 space-y-0.5">
                        {nakes.namaPengujiList?.map((p, idxP) => (
                          <li key={idxP}>{p}</li>
                        )) || (
                          <li>{nakes.namaPenguji || 'Tim Penguji Dinas Kesehatan'}</li>
                        )}
                      </ol>
                    </div>

                    {/* TTD */}
                    <div className="flex justify-end font-serif text-xs">
                      <div className="text-center w-64 leading-relaxed">
                        <div>Kepala Dinas Kesehatan</div>
                        <div>Kabupaten Garut</div>
                        <div className="h-20" />
                        <div className="font-bold underline uppercase">{penandaTangan.nama}</div>
                        <div>{penandaTangan.pangkat}</div>
                        <div>NIP. {penandaTangan.nip}</div>
                      </div>
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
