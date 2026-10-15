import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validatePengujiDistinct,
  validateEvaluationDate,
  calculateCountdown,
  formatDateIndo,
  formatDateShort,
  calculateKPIs,
  filterPendaftar
} from './rules.ts';
import type { Pendaftar } from '../types/index.ts';

test('validatePengujiDistinct should reject duplicate evaluators', () => {
  const result = validatePengujiDistinct(['Dr. Budi', 'Dr. Budi', 'Dr. Siti']);
  assert.equal(result.valid, false);
  assert.match(result.message, /tidak boleh sama/);
});

test('validatePengujiDistinct should accept 3 unique non-empty evaluators', () => {
  const result = validatePengujiDistinct(['Dr. Budi', 'Dr. Ahmad', 'Dr. Siti']);
  assert.equal(result.valid, true);
});

test('validatePengujiDistinct should reject fewer than 3 evaluators', () => {
  const result = validatePengujiDistinct(['Dr. Budi', '']);
  assert.equal(result.valid, false);
});

test('validateEvaluationDate enforces no_backdate mode', () => {
  const refNow = new Date('2026-10-15T10:00:00Z');
  // Past date
  const pastResult = validateEvaluationDate('2026-10-10', 'no_backdate', refNow);
  assert.equal(pastResult.valid, false);
  assert.match(pastResult.message, /tidak boleh mundur/);

  // Future/today date
  const okResult = validateEvaluationDate('2026-10-15', 'no_backdate', refNow);
  assert.equal(okResult.valid, true);
});

test('validateEvaluationDate allows any date in bebas mode', () => {
  const refNow = new Date('2026-10-15T10:00:00Z');
  const pastResult = validateEvaluationDate('2026-01-01', 'bebas', refNow);
  assert.equal(pastResult.valid, true);
});

test('calculateCountdown calculates days, hours, minutes, and isClosed status', () => {
  const now = new Date('2026-10-15T10:00:00').getTime();
  const future = calculateCountdown('2026-10-16', '12:00', now);
  assert.equal(future.isClosed, false);
  assert.equal(future.days, 1);
  assert.equal(future.hours, 2);

  const past = calculateCountdown('2026-10-14', '08:00', now);
  assert.equal(past.isClosed, true);
  assert.match(past.formattedText, /Ditutup/);
});

test('formatDateIndo formats correctly in Indonesian', () => {
  const formatted = formatDateIndo('2026-10-15');
  assert.equal(formatted, '15 Oktober 2026');
});

test('formatDateShort formats correctly as DD-MM-YYYY', () => {
  const formatted = formatDateShort('2026-10-15');
  assert.equal(formatted, '15-10-2026');
});

test('calculateKPIs aggregates total, pending, diterima, ditolak, and percentage', () => {
  const sampleList: Pendaftar[] = [
    {
      id: '1',
      rowIndex: 2,
      timestamp: '2026-10-14',
      kategori: 'Kredensial',
      nama: 'dr. Aisyah',
      nip: '198501012010012001',
      puskesmas: 'Puskesmas Garut',
      profesi: 'Dokter',
      jenisProfesi: 'Dokter',
      noSurat: '445/01/PKM',
      tglMasaSIP: '2028-01-01',
      urlAjuan: '',
      urlSTR: '',
      urlSIP: '',
      statusVerifikasi: 'Diterima',
      statusPenilaian: 'Selesai',
      rincian: []
    },
    {
      id: '2',
      rowIndex: 3,
      timestamp: '2026-10-14',
      kategori: 'Rekredensial',
      nama: 'Budi, A.Md.Kep',
      nip: '199002022015021002',
      puskesmas: 'Puskesmas Tarogong',
      profesi: 'Perawat',
      jenisProfesi: 'Perawat Vokasi',
      noSurat: '445/02/PKM',
      tglMasaSIP: '2027-06-01',
      urlAjuan: '',
      urlSTR: '',
      urlSIP: '',
      statusVerifikasi: 'Pending',
      statusPenilaian: 'Belum',
      rincian: []
    }
  ];

  const kpis = calculateKPIs(sampleList);
  assert.equal(kpis.total, 2);
  assert.equal(kpis.diterima, 1);
  assert.equal(kpis.pending, 1);
  assert.equal(kpis.selesaiPenilaian, 1);
  assert.equal(kpis.progressPercent, 50);
});

test('filterPendaftar filters accurately by keyword and profession', () => {
  const sampleList: Pendaftar[] = [
    {
      id: '1',
      rowIndex: 2,
      timestamp: '2026-10-14',
      kategori: 'Kredensial',
      nama: 'dr. Aisyah Putri',
      nip: '198501012010012001',
      puskesmas: 'Puskesmas Garut Kota',
      profesi: 'Dokter',
      jenisProfesi: 'Dokter',
      noSurat: '445/01/PKM',
      tglMasaSIP: '2028-01-01',
      urlAjuan: '',
      urlSTR: '',
      urlSIP: '',
      statusVerifikasi: 'Diterima',
      statusPenilaian: 'Selesai',
      rincian: []
    },
    {
      id: '2',
      rowIndex: 3,
      timestamp: '2026-10-14',
      kategori: 'Rekredensial',
      nama: 'Siti Rahma, S.ST.Keb',
      nip: '199203032016032003',
      puskesmas: 'Puskesmas Cikajang',
      profesi: 'Bidan',
      jenisProfesi: 'Bidan DIV',
      noSurat: '445/09/PKM',
      tglMasaSIP: '2027-12-01',
      urlAjuan: '',
      urlSTR: '',
      urlSIP: '',
      statusVerifikasi: 'Diterima',
      statusPenilaian: 'Belum',
      rincian: []
    }
  ];

  const byName = filterPendaftar(sampleList, 'Aisyah', '', '');
  assert.equal(byName.length, 1);
  assert.equal(byName[0].nama, 'dr. Aisyah Putri');

  const byProfesi = filterPendaftar(sampleList, '', 'Bidan', '');
  assert.equal(byProfesi.length, 1);
  assert.equal(byProfesi[0].profesi, 'Bidan');
});
