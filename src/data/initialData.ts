import type {
  User,
  Pendaftar,
  InstrumentItem,
  DeadlineSettings,
  PenandaTanganSettings,
  SuratSettings,
  GoogleIntegrationSettings
} from '../types/index.ts';

export const MASTER_USERS: User[] = [
  {
    username: 'admin',
    nama: 'Administrator Dinkes',
    puskesmas: 'Dinas Kesehatan Kab. Garut',
    hak: 'Admin'
  },
  {
    username: 'garut',
    nama: 'Puskesmas Garut',
    puskesmas: 'Puskesmas Garut',
    hak: 'User'
  },
  {
    username: 'tarogong',
    nama: 'Puskesmas Tarogong',
    puskesmas: 'Puskesmas Tarogong',
    hak: 'User'
  },
  {
    username: 'cikajang',
    nama: 'Puskesmas Cikajang',
    puskesmas: 'Puskesmas Cikajang',
    hak: 'User'
  },
  {
    username: 'penguji_dr',
    nama: 'dr. H. Budi Ramdani, Sp.KKLP',
    puskesmas: 'Tim Penguji Medis',
    hak: 'Penguji',
    profesi: 'Dokter'
  },
  {
    username: 'penguji_drg',
    nama: 'drg. Rina Marlina, M.Kes',
    puskesmas: 'Tim Penguji Gigi',
    hak: 'Penguji',
    profesi: 'Dokter Gigi'
  },
  {
    username: 'penguji_bidan',
    nama: 'Hj. Neneng Rohayati, S.ST., Bdn',
    puskesmas: 'Tim Penguji Kebidanan',
    hak: 'Penguji',
    profesi: 'Bidan'
  },
  {
    username: 'penguji_perawat',
    nama: 'Asep Saepuloh, S.Kep., Ners',
    puskesmas: 'Tim Penguji Keperawatan',
    hak: 'Penguji',
    profesi: 'Perawat'
  },
  {
    username: 'verifikator',
    nama: 'Tim Verifikasi SDK Dinkes',
    puskesmas: 'Dinas Kesehatan Kab. Garut',
    hak: 'Verifikator'
  }
];

export const MASTER_PENGUJI_BY_PROFESI: Record<string, string[]> = {
  'Dokter': [
    'dr. H. Budi Ramdani, Sp.KKLP',
    'dr. Hj. Yanti Suryanti, M.K.M.',
    'dr. Firman Gunawan, M.Kes',
    'dr. Ahmad Hidayat',
    'dr. Siti Nurhaliza'
  ],
  'Dokter Gigi': [
    'drg. Rina Marlina, M.Kes',
    'drg. Hendra Lesmana',
    'drg. Dewi Sartika, Sp.KG',
    'drg. Wahyu Pratama'
  ],
  'Bidan': [
    'Hj. Neneng Rohayati, S.ST., Bdn',
    'Bd. Sri Wahyuni, M.Tr.Keb',
    'Bd. Eni Heryani, S.ST',
    'Bd. Dedeh Kurniasih, S.Keb',
    'Bd. Imas Masitoh, A.Md.Keb'
  ],
  'Perawat': [
    'Asep Saepuloh, S.Kep., Ners',
    'Ns. Dadang Suherman, M.Kep',
    'Ns. Rina Kusmawati, S.Kep',
    'Yudi Supriadi, S.Kep., Ners',
    'Ns. Taufik Ismail, S.Kep'
  ]
};

export const MASTER_INSTRUMENTS: Record<string, InstrumentItem[]> = {
  'Dokter': [
    { id: 1, nama: 'Pemeriksaan fisik diagnostik komprehensif' },
    { id: 2, nama: 'Tatalaksana kedaruratan & Resusitasi Jantung Paru (RJP/BCLS)' },
    { id: 3, nama: 'Penjahitan luka robek / hecting & perawatan luka kotor' },
    { id: 4, nama: 'Pemasangan pipa orofaring / endotrakeal awal dan oksigenasi' },
    { id: 5, nama: 'Insisi dan drainase abses' },
    { id: 6, nama: 'Ekstraksi kuku / ekstraksi korpus alienum telinga, hidung, mata' },
    { id: 7, nama: 'Sirkumsisi / khitan tanpa komplikasi' },
    { id: 8, nama: 'Pemasangan nasogastric tube (NGT) & kateter urine pria/wanita' },
    { id: 9, nama: 'Interpretasi hasil rekam jantung (EKG 12 lead)' },
    { id: 10, nama: 'Skrining dan tata laksana awal kegawatdaruratan maternal & neonatal' }
  ],
  'Dokter Gigi': [
    { id: 1, nama: 'Pemeriksaan dan diagnosis penyakit jaringan keras & lunak mulut' },
    { id: 2, nama: 'Penambalan gigi dengan bahan resin komposit (light cure)' },
    { id: 3, nama: 'Penambalan gigi dengan Glass Ionomer Cement (GIC)' },
    { id: 4, nama: 'Pembersihan karang gigi / scaling supra gingiva manual & ultrasonic' },
    { id: 5, nama: 'Ekstraksi gigi sulung dengan anestesi topikal / infiltrasi' },
    { id: 6, nama: 'Ekstraksi gigi tetap tanpa komplikasi' },
    { id: 7, nama: 'Perawatan darurat abses odontogenik (insisi abses submukosa)' },
    { id: 8, nama: 'Perawatan tumpatan sementara & pulpotomi darurat' }
  ],
  'Bidan Vokasi': [
    { id: 1, nama: 'Pemeriksaan antenatal care (ANC) terpadu sesuai standar 10T' },
    { id: 2, nama: 'Pertolongan persalinan normal fisiologis (APN 60 langkah)' },
    { id: 3, nama: 'Resusitasi bayi baru lahir dengan asfiksia ringan' },
    { id: 4, nama: 'Penjahitan luka perineum derajat I dan II' },
    { id: 5, nama: 'Pelayanan kontrasepsi suntik, pil, dan kondom' },
    { id: 6, nama: 'Pemasangan dan pencabutan Alat Kontrasepsi Dalam Rahim (AKDR/IUD)' },
    { id: 7, nama: 'Pemasangan dan pencabutan implan / susuk KB' },
    { id: 8, nama: 'Tatalaksana awal kegawatdaruratan obstetri & stabilisasi rujukan' }
  ],
  'Bidan DIV': [
    { id: 1, nama: 'Pemeriksaan antenatal care (ANC) terpadu komprehensif' },
    { id: 2, nama: 'Manajemen persalinan normal dan deteksi komplikasi dini' },
    { id: 3, nama: 'Resusitasi bayi baru lahir dan perawatan metode kangguru (KMC)' },
    { id: 4, nama: 'Penjahitan robekan perineum derajat I, II & pendampingan derajat III' },
    { id: 5, nama: 'Pemasangan dan pencabutan AKDR/IUD serta Implan 2 batang' },
    { id: 6, nama: 'Skrining kanker leher rahim dengan Inspeksi Visual Asam Asetat (IVA)' },
    { id: 7, nama: 'Konseling laktasi lanjutan dan pemantauan tumbuh kembang balita (SDIDTK)' },
    { id: 8, nama: 'Pemberian MgSO4 pada preeklampsia berat sesuai SOP rujukan' }
  ],
  'Bidan Profesi': [
    { id: 1, nama: 'Asuhan kebidanan holistik antenatal, intranatal, dan postnatal berpusat pada wanita' },
    { id: 2, nama: 'Penatalaksanaan kolaboratif kebidanan risiko tinggi' },
    { id: 3, nama: 'Pemeriksaan IVA test dan pap smear skrining serviks' },
    { id: 4, nama: 'Pemasangan dan pencabutan kontrasepsi jangka panjang (IUD & Implan)' },
    { id: 5, nama: 'Penatalaksanaan perdarahan pasca salin (kompresi bimanual internal/eksternal)' },
    { id: 6, nama: 'Pemberian terapi antibiotik dan uterotonika emergensi maternal' },
    { id: 7, nama: 'Evaluasi audit maternal perinatal (AMP) di tingkat Puskesmas' }
  ],
  'Perawat Vokasi': [
    { id: 1, nama: 'Pengkajian dasar keperawatan dan observasi tanda-tanda vital' },
    { id: 2, nama: 'Pemasangan dan pemantauan terapi cairan intravena (infus)' },
    { id: 3, nama: 'Pemasangan kateter urine sementara dan menetap (dower catheter)' },
    { id: 4, nama: 'Pemberian obat per oral, subkutan, intramuskular, dan intravena' },
    { id: 5, nama: 'Perawatan luka bersih dan luka kotor kronis' },
    { id: 6, nama: 'Bantuan Hidup Dasar (BHD / Basic Life Support)' },
    { id: 7, nama: 'Penyedotan lendir (suctioning) jalan nafas atas' }
  ],
  'Perawat Profesi': [
    { id: 1, nama: 'Pengkajian keperawatan holistik dan penegakan diagnosis keperawatan (SDKI/SIKI)' },
    { id: 2, nama: 'Triase gawat darurat (ATS/ESI) dan manajemen bencana' },
    { id: 3, nama: 'Pemasangan infus pada kondisi sulit dan titrasi obat darurat' },
    { id: 4, nama: 'Perawatan luka modern (modern wound dressing) pada ulkus diabetikum' },
    { id: 5, nama: 'Interpretasi awal rekam jantung (EKG) aritmia letal' },
    { id: 6, nama: 'Pemasangan selang nasogastrik (NGT) dekompresi / enteral' },
    { id: 7, nama: 'Edukasi dan discharge planning keperawatan mandiri keluarga' }
  ]
};

export const INITIAL_PENDAFTAR: Pendaftar[] = [
  {
    id: 'pkm-001',
    rowIndex: 2,
    timestamp: '2026-10-14 09:15:20',
    kategori: 'Kredensial',
    nama: 'dr. Aisyah Rahmania, Sp.KKLP',
    nip: '198705122011012003',
    puskesmas: 'Puskesmas Garut',
    profesi: 'Dokter',
    jenisProfesi: 'Dokter',
    noSurat: '445/112/PKM-GRT/2026',
    tglMasaSIP: '2028-05-12',
    urlAjuan: 'https://drive.google.com/file/d/1demoAjuanAisyah/view',
    urlSTR: 'https://drive.google.com/file/d/1demoSTRAisyah/view',
    urlSIP: 'https://drive.google.com/file/d/1demoSIPAisyah/view',
    fileAjuanName: 'Surat_Ajuan_dr_Aisyah.pdf',
    fileSTRName: 'STR_dr_Aisyah.pdf',
    fileSIPName: 'SIP_dr_Aisyah.pdf',
    statusVerifikasi: 'Diterima',
    statusPenilaian: 'Selesai',
    tglPenilaian: '14-10-2026',
    namaPenguji: 'dr. H. Budi Ramdani, Sp.KKLP | dr. Hj. Yanti Suryanti, M.K.M. | dr. Firman Gunawan, M.Kes',
    namaPengujiList: [
      'dr. H. Budi Ramdani, Sp.KKLP',
      'dr. Hj. Yanti Suryanti, M.K.M.',
      'dr. Firman Gunawan, M.Kes'
    ],
    rekomendasi: 'Direkomendasikan',
    catatan: 'Seluruh kewenangan klinis tingkat primer disetujui penuh. Memenuhi standar pelayanan Puskesmas.',
    rincian: [
      { tindakan: 'Pemeriksaan fisik diagnostik komprehensif', pilihan: '1', keputusanPenguji: 'Disetujui berwenang penuh' },
      { tindakan: 'Tatalaksana kedaruratan & Resusitasi Jantung Paru (RJP/BCLS)', pilihan: '1', keputusanPenguji: 'Disetujui berwenang penuh' },
      { tindakan: 'Penjahitan luka robek / hecting & perawatan luka kotor', pilihan: '1', keputusanPenguji: 'Disetujui berwenang penuh' },
      { tindakan: 'Pemasangan pipa orofaring / endotrakeal awal dan oksigenasi', pilihan: '1', keputusanPenguji: 'Disetujui berwenang penuh' },
      { tindakan: 'Insisi dan drainase abses', pilihan: '1', keputusanPenguji: 'Disetujui berwenang penuh' },
      { tindakan: 'Ekstraksi kuku / ekstraksi korpus alienum telinga, hidung, mata', pilihan: '1', keputusanPenguji: 'Disetujui berwenang penuh' },
      { tindakan: 'Sirkumsisi / khitan tanpa komplikasi', pilihan: '1', keputusanPenguji: 'Disetujui berwenang penuh' },
      { tindakan: 'Pemasangan nasogastric tube (NGT) & kateter urine pria/wanita', pilihan: '1', keputusanPenguji: 'Disetujui berwenang penuh' },
      { tindakan: 'Interpretasi hasil rekam jantung (EKG 12 lead)', pilihan: '1', keputusanPenguji: 'Disetujui berwenang penuh' },
      { tindakan: 'Skrining dan tata laksana awal kegawatdaruratan maternal & neonatal', pilihan: '1', keputusanPenguji: 'Disetujui berwenang penuh' }
    ]
  },
  {
    id: 'pkm-002',
    rowIndex: 3,
    timestamp: '2026-10-14 11:22:10',
    kategori: 'Rekredensial',
    nama: 'drg. Hendra Pratama, M.Kes',
    nip: '198909182014021001',
    puskesmas: 'Puskesmas Tarogong',
    profesi: 'Dokter Gigi',
    jenisProfesi: 'Dokter Gigi',
    noSurat: '445/087/PKM-TRG/2026',
    tglMasaSIP: '2027-09-18',
    urlAjuan: 'https://drive.google.com/file/d/1demoAjuanHendra/view',
    urlSTR: 'https://drive.google.com/file/d/1demoSTRHendra/view',
    urlSIP: 'https://drive.google.com/file/d/1demoSIPHendra/view',
    fileAjuanName: 'Surat_Ajuan_drg_Hendra.pdf',
    fileSTRName: 'STR_drg_Hendra.pdf',
    fileSIPName: 'SIP_drg_Hendra.pdf',
    statusVerifikasi: 'Diterima',
    statusPenilaian: 'Belum',
    rincian: [
      { tindakan: 'Pemeriksaan dan diagnosis penyakit jaringan keras & lunak mulut', pilihan: '1' },
      { tindakan: 'Penambalan gigi dengan bahan resin komposit (light cure)', pilihan: '1' },
      { tindakan: 'Penambalan gigi dengan Glass Ionomer Cement (GIC)', pilihan: '1' },
      { tindakan: 'Pembersihan karang gigi / scaling supra gingiva manual & ultrasonic', pilihan: '1' },
      { tindakan: 'Ekstraksi gigi sulung dengan anestesi topikal / infiltrasi', pilihan: '1' },
      { tindakan: 'Ekstraksi gigi tetap tanpa komplikasi', pilihan: '1' },
      { tindakan: 'Perawatan darurat abses odontogenik (insisi abses submukosa)', pilihan: '2' },
      { tindakan: 'Perawatan tumpatan sementara & pulpotomi darurat', pilihan: '1' }
    ]
  },
  {
    id: 'pkm-003',
    rowIndex: 4,
    timestamp: '2026-10-14 13:05:44',
    kategori: 'Kredensial',
    nama: 'Sri Heryani, S.ST., Bdn',
    nip: '199103152015032004',
    puskesmas: 'Puskesmas Garut',
    profesi: 'Bidan',
    jenisProfesi: 'Bidan Profesi',
    noSurat: '445/115/PKM-GRT/2026',
    tglMasaSIP: '2028-03-15',
    urlAjuan: 'https://drive.google.com/file/d/1demoAjuanSri/view',
    urlSTR: 'https://drive.google.com/file/d/1demoSTRSri/view',
    urlSIP: 'https://drive.google.com/file/d/1demoSIPSri/view',
    fileAjuanName: 'Surat_Ajuan_Sri_Bdn.pdf',
    fileSTRName: 'STR_Sri_Bdn.pdf',
    fileSIPName: 'SIP_Sri_Bdn.pdf',
    statusVerifikasi: 'Diterima',
    statusPenilaian: 'Selesai',
    tglPenilaian: '14-10-2026',
    namaPenguji: 'Hj. Neneng Rohayati, S.ST., Bdn | Bd. Sri Wahyuni, M.Tr.Keb | Bd. Eni Heryani, S.ST',
    namaPengujiList: [
      'Hj. Neneng Rohayati, S.ST., Bdn',
      'Bd. Sri Wahyuni, M.Tr.Keb',
      'Bd. Eni Heryani, S.ST'
    ],
    rekomendasi: 'Direkomendasikan dengan Catatan',
    catatan: 'Untuk tindakan komplikasi lanjutan perlu pendampingan supervisi dokter Sp.OG.',
    rincian: [
      { tindakan: 'Asuhan kebidanan holistik antenatal, intranatal, dan postnatal berpusat pada wanita', pilihan: '1', keputusanPenguji: 'Disetujui berwenang penuh' },
      { tindakan: 'Penatalaksanaan kolaboratif kebidanan risiko tinggi', pilihan: '2', keputusanPenguji: 'Disetujui dibawah supervise' },
      { tindakan: 'Pemeriksaan IVA test dan pap smear skrining serviks', pilihan: '1', keputusanPenguji: 'Disetujui berwenang penuh' },
      { tindakan: 'Pemasangan dan pencabutan kontrasepsi jangka panjang (IUD & Implan)', pilihan: '1', keputusanPenguji: 'Disetujui berwenang penuh' },
      { tindakan: 'Penatalaksanaan perdarahan pasca salin (kompresi bimanual internal/eksternal)', pilihan: '1', keputusanPenguji: 'Disetujui berwenang penuh' },
      { tindakan: 'Pemberian terapi antibiotik dan uterotonika emergensi maternal', pilihan: '1', keputusanPenguji: 'Disetujui berwenang penuh' },
      { tindakan: 'Evaluasi audit maternal perinatal (AMP) di tingkat Puskesmas', pilihan: '1', keputusanPenguji: 'Disetujui berwenang penuh' }
    ]
  },
  {
    id: 'pkm-004',
    rowIndex: 5,
    timestamp: '2026-10-14 14:40:12',
    kategori: 'Kredensial',
    nama: 'Yudi Supriadi, S.Kep., Ners',
    nip: '198811202012011002',
    puskesmas: 'Puskesmas Cikajang',
    profesi: 'Perawat',
    jenisProfesi: 'Perawat Profesi',
    noSurat: '445/054/PKM-CKJ/2026',
    tglMasaSIP: '2027-11-20',
    urlAjuan: 'https://drive.google.com/file/d/1demoAjuanYudi/view',
    urlSTR: 'https://drive.google.com/file/d/1demoSTRYudi/view',
    urlSIP: 'https://drive.google.com/file/d/1demoSIPYudi/view',
    fileAjuanName: 'Surat_Ajuan_Yudi_Ners.pdf',
    fileSTRName: 'STR_Yudi_Ners.pdf',
    fileSIPName: 'SIP_Yudi_Ners.pdf',
    statusVerifikasi: 'Pending',
    statusPenilaian: 'Belum',
    rincian: [
      { tindakan: 'Pengkajian keperawatan holistik dan penegakan diagnosis keperawatan (SDKI/SIKI)', pilihan: '1' },
      { tindakan: 'Triase gawat darurat (ATS/ESI) dan manajemen bencana', pilihan: '1' },
      { tindakan: 'Pemasangan infus pada kondisi sulit dan titrasi obat darurat', pilihan: '1' },
      { tindakan: 'Perawatan luka modern (modern wound dressing) pada ulkus diabetikum', pilihan: '1' },
      { tindakan: 'Interpretasi awal rekam jantung (EKG) aritmia letal', pilihan: '2' },
      { tindakan: 'Pemasangan selang nasogastrik (NGT) dekompresi / enteral', pilihan: '1' },
      { tindakan: 'Edukasi dan discharge planning keperawatan mandiri keluarga', pilihan: '1' }
    ]
  },
  {
    id: 'pkm-005',
    rowIndex: 6,
    timestamp: '2026-10-14 16:10:05',
    kategori: 'Kredensial',
    nama: 'Rian Firmansyah, A.Md.Kep',
    nip: '0',
    puskesmas: 'Puskesmas Tarogong',
    profesi: 'Perawat',
    jenisProfesi: 'Perawat Vokasi',
    noSurat: '445/091/PKM-TRG/2026',
    tglMasaSIP: '2026-12-31',
    urlAjuan: 'https://drive.google.com/file/d/1demoAjuanRian/view',
    urlSTR: 'https://drive.google.com/file/d/1demoSTRRian/view',
    urlSIP: 'https://drive.google.com/file/d/1demoSIPRian/view',
    fileAjuanName: 'Surat_Ajuan_Rian.pdf',
    fileSTRName: 'STR_Rian.pdf',
    fileSIPName: 'SIP_Rian.pdf',
    statusVerifikasi: 'Ditolak',
    statusPenilaian: 'Belum',
    rincian: [
      { tindakan: 'Pengkajian dasar keperawatan dan observasi tanda-tanda vital', pilihan: '1' },
      { tindakan: 'Pemasangan dan pemantauan terapi cairan intravena (infus)', pilihan: '1' },
      { tindakan: 'Pemasangan kateter urine sementara dan menetap (dower catheter)', pilihan: '1' },
      { tindakan: 'Pemberian obat per oral, subkutan, intramuskular, dan intravena', pilihan: '1' },
      { tindakan: 'Perawatan luka bersih dan luka kotor kronis', pilihan: '1' },
      { tindakan: 'Bantuan Hidup Dasar (BHD / Basic Life Support)', pilihan: '1' },
      { tindakan: 'Penyedotan lendir (suctioning) jalan nafas atas', pilihan: '1' }
    ]
  }
];

export const INITIAL_DEADLINE: DeadlineSettings = {
  tanggal: '2026-12-31',
  jam: '23:59'
};

export const INITIAL_PENANDA_TANGAN: PenandaTanganSettings = {
  nama: 'drg. Hj. Leli Yuliani, M.M.',
  pangkat: 'Pembina Utama Muda (IV/c)',
  nip: '19700812 199503 2 001'
};

export const INITIAL_SURAT_SETTINGS: SuratSettings = {
  kodeSurat: '400.7.22.1',
  logoKop: 'https://drive.google.com/thumbnail?id=1pPj8_JplR9wlHCQqCG4Wxf0Yo9NXJsyY&sz=w200',
  paperSize: 'F4',
  nomorSuratMap: {
    'Puskesmas Garut': '421/KEP-GRT/2026',
    'Puskesmas Tarogong': '421/KEP-TRG/2026',
    'Puskesmas Cikajang': '421/KEP-CKJ/2026'
  }
};

export const INITIAL_INTEGRATION_SETTINGS: GoogleIntegrationSettings = {
  appsScriptUrl: '',
  spreadsheetRekapId: '1CRPBD-wv7fEV4P9SapJLrIo1SGnjQPxgr6lVGDWbYu0',
  spreadsheetInstrumenId: '1Afxk_2YkhY21ZzCMUjEkP0twOJeQt55cRQTaiym8yTc',
  spreadsheetPengujiId: '1cI0ep19CLHO8eWBkZ39SQ9kkwaVGSTBdAxhzSsTyrJ4',
  spreadsheetHasilPengujiId: '1Ml-7pmjDXC0r28iNnHxVQe3INS4TWksXnPUwBX57teg',
  sdmkSpreadsheetId: '1cI0ep19CLHO8eWBkZ39SQ9kkwaVGSTBdAxhzSsTyrJ4',
  folderDriveId: '1LqMGBg4zRNfIiXXtZ_OVQ9iLUAYzlENr',
  autoSyncIntervalSec: 15,
  lastSyncTime: new Date().toISOString()
};
