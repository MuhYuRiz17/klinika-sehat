// Mock Data untuk Sistem Informasi Klinik Pratama

export interface Pasien {
  id: string;
  nik: string;
  noRm: string;
  namaLengkap: string;
  jenisKelamin: 'L' | 'P';
  tanggalLahir: string;
  alamat: string;
  noHp: string;
  statusBpjs: boolean;
  kontakDarurat: string;
  createdAt: string;
}

export interface Dokter {
  id: string;
  namaDokter: string;
  sip: string;
  spesialisasi: string;
  noHp: string;
  foto?: string;
}

export interface JadwalPraktik {
  id: string;
  dokterId: string;
  hari: string;
  jamMulai: string;
  jamSelesai: string;
  kuotaPasien?: number;
}

export type StatusKunjungan = 'menunggu' | 'sedang_diperiksa' | 'selesai';

export interface Kunjungan {
  id: string;
  tanggalWaktu: string;
  pasienId: string;
  dokterId: string;
  statusKunjungan: StatusKunjungan;
  nomorAntrian: number;
}

export interface RekamMedis {
  id: string;
  kunjunganId: string;
  pasienId: string;
  dokterId: string;
  tanggal: string;
  keluhan: string;
  anamnesis: string;
  diagnosa: string;
  tindakan: string;
  resep: string;
  catatan?: string;
}

// Data Pasien
export const pasienData: Pasien[] = [
  {
    id: '1',
    nik: '3201234567890001',
    noRm: 'RM-2024-0001',
    namaLengkap: 'Ahmad Sudrajat',
    jenisKelamin: 'L',
    tanggalLahir: '1985-03-15',
    alamat: 'Jl. Merdeka No. 45, Jakarta Selatan',
    noHp: '081234567890',
    statusBpjs: true,
    kontakDarurat: '081234567891',
    createdAt: '2024-01-10',
  },
  {
    id: '2',
    nik: '3201234567890002',
    noRm: 'RM-2024-0002',
    namaLengkap: 'Siti Nurhaliza',
    jenisKelamin: 'P',
    tanggalLahir: '1990-07-22',
    alamat: 'Jl. Sudirman No. 12, Jakarta Pusat',
    noHp: '081234567892',
    statusBpjs: true,
    kontakDarurat: '081234567893',
    createdAt: '2024-01-12',
  },
  {
    id: '3',
    nik: '3201234567890003',
    noRm: 'RM-2024-0003',
    namaLengkap: 'Budi Santoso',
    jenisKelamin: 'L',
    tanggalLahir: '1978-11-08',
    alamat: 'Jl. Gatot Subroto No. 88, Jakarta Barat',
    noHp: '081234567894',
    statusBpjs: false,
    kontakDarurat: '081234567895',
    createdAt: '2024-01-15',
  },
  {
    id: '4',
    nik: '3201234567890004',
    noRm: 'RM-2024-0004',
    namaLengkap: 'Dewi Lestari',
    jenisKelamin: 'P',
    tanggalLahir: '1995-02-28',
    alamat: 'Jl. Veteran No. 23, Jakarta Timur',
    noHp: '081234567896',
    statusBpjs: true,
    kontakDarurat: '081234567897',
    createdAt: '2024-01-18',
  },
  {
    id: '5',
    nik: '3201234567890005',
    noRm: 'RM-2024-0005',
    namaLengkap: 'Rudi Hermawan',
    jenisKelamin: 'L',
    tanggalLahir: '1982-09-10',
    alamat: 'Jl. Diponegoro No. 56, Jakarta Utara',
    noHp: '081234567898',
    statusBpjs: false,
    kontakDarurat: '081234567899',
    createdAt: '2024-01-20',
  },
];

// Data Dokter
export const dokterData: Dokter[] = [
  {
    id: '1',
    namaDokter: 'dr. Andi Wijaya, Sp.PD',
    sip: 'SIP-DKI-2020-12345',
    spesialisasi: 'Penyakit Dalam',
    noHp: '081111111111',
  },
  {
    id: '2',
    namaDokter: 'dr. Maya Sari, Sp.A',
    sip: 'SIP-DKI-2019-12346',
    spesialisasi: 'Anak',
    noHp: '081111111112',
  },
  {
    id: '3',
    namaDokter: 'dr. Bambang Kusuma',
    sip: 'SIP-DKI-2021-12347',
    spesialisasi: 'Umum',
    noHp: '081111111113',
  },
];

// Data Jadwal Praktik
export const jadwalPraktikData: JadwalPraktik[] = [
  { id: '1', dokterId: '1', hari: 'Senin', jamMulai: '08:00', jamSelesai: '12:00', kuotaPasien: 20 },
  { id: '2', dokterId: '1', hari: 'Rabu', jamMulai: '08:00', jamSelesai: '12:00', kuotaPasien: 20 },
  { id: '3', dokterId: '1', hari: 'Jumat', jamMulai: '08:00', jamSelesai: '12:00', kuotaPasien: 20 },
  { id: '4', dokterId: '2', hari: 'Senin', jamMulai: '13:00', jamSelesai: '17:00', kuotaPasien: 15 },
  { id: '5', dokterId: '2', hari: 'Selasa', jamMulai: '08:00', jamSelesai: '12:00', kuotaPasien: 15 },
  { id: '6', dokterId: '2', hari: 'Kamis', jamMulai: '13:00', jamSelesai: '17:00', kuotaPasien: 15 },
  { id: '7', dokterId: '3', hari: 'Senin', jamMulai: '08:00', jamSelesai: '15:00', kuotaPasien: 30 },
  { id: '8', dokterId: '3', hari: 'Selasa', jamMulai: '08:00', jamSelesai: '15:00', kuotaPasien: 30 },
  { id: '9', dokterId: '3', hari: 'Rabu', jamMulai: '08:00', jamSelesai: '15:00', kuotaPasien: 30 },
  { id: '10', dokterId: '3', hari: 'Kamis', jamMulai: '08:00', jamSelesai: '15:00', kuotaPasien: 30 },
  { id: '11', dokterId: '3', hari: 'Jumat', jamMulai: '08:00', jamSelesai: '15:00', kuotaPasien: 30 },
];

// Data Kunjungan
export const kunjunganData: Kunjungan[] = [
  { id: '1', tanggalWaktu: '2024-01-20 08:30', pasienId: '1', dokterId: '3', statusKunjungan: 'selesai', nomorAntrian: 1 },
  { id: '2', tanggalWaktu: '2024-01-20 09:00', pasienId: '2', dokterId: '3', statusKunjungan: 'selesai', nomorAntrian: 2 },
  { id: '3', tanggalWaktu: '2024-01-21 08:15', pasienId: '3', dokterId: '1', statusKunjungan: 'selesai', nomorAntrian: 1 },
  { id: '4', tanggalWaktu: '2024-01-21 13:30', pasienId: '4', dokterId: '2', statusKunjungan: 'selesai', nomorAntrian: 1 },
  { id: '5', tanggalWaktu: '2024-01-22 08:00', pasienId: '5', dokterId: '3', statusKunjungan: 'selesai', nomorAntrian: 1 },
  { id: '6', tanggalWaktu: '2024-01-22 09:30', pasienId: '1', dokterId: '3', statusKunjungan: 'selesai', nomorAntrian: 2 },
  { id: '7', tanggalWaktu: '2024-01-23 08:00', pasienId: '2', dokterId: '1', statusKunjungan: 'selesai', nomorAntrian: 1 },
  { id: '8', tanggalWaktu: '2024-01-23 14:00', pasienId: '3', dokterId: '2', statusKunjungan: 'selesai', nomorAntrian: 1 },
  { id: '9', tanggalWaktu: '2025-01-09 08:30', pasienId: '4', dokterId: '3', statusKunjungan: 'menunggu', nomorAntrian: 1 },
  { id: '10', tanggalWaktu: '2025-01-09 09:00', pasienId: '5', dokterId: '3', statusKunjungan: 'sedang_diperiksa', nomorAntrian: 2 },
];

// Data Rekam Medis
export const rekamMedisData: RekamMedis[] = [
  {
    id: '1',
    kunjunganId: '1',
    pasienId: '1',
    dokterId: '3',
    tanggal: '2024-01-20',
    keluhan: 'Demam dan batuk sejak 3 hari yang lalu',
    anamnesis: 'Pasien mengeluh demam tinggi disertai batuk berdahak. Tidak ada riwayat alergi obat.',
    diagnosa: 'ISPA (Infeksi Saluran Pernapasan Akut)',
    tindakan: 'Pemeriksaan fisik, pengukuran suhu tubuh',
    resep: 'Paracetamol 500mg 3x1, Ambroxol 30mg 3x1, Vitamin C 500mg 1x1',
    catatan: 'Istirahat yang cukup, banyak minum air putih',
  },
  {
    id: '2',
    kunjunganId: '2',
    pasienId: '2',
    dokterId: '3',
    tanggal: '2024-01-20',
    keluhan: 'Sakit kepala dan pusing',
    anamnesis: 'Pasien mengeluh sakit kepala sejak 2 hari yang lalu, pusing saat bangun tidur.',
    diagnosa: 'Tension Headache',
    tindakan: 'Pemeriksaan tekanan darah, pemeriksaan neurologis sederhana',
    resep: 'Paracetamol 500mg 3x1, Antasida 3x1',
    catatan: 'Kurangi stres, tidur yang cukup',
  },
  {
    id: '3',
    kunjunganId: '3',
    pasienId: '3',
    dokterId: '1',
    tanggal: '2024-01-21',
    keluhan: 'Nyeri lambung dan mual',
    anamnesis: 'Pasien mengeluh nyeri ulu hati sejak 1 minggu, mual setelah makan.',
    diagnosa: 'Gastritis Akut',
    tindakan: 'Pemeriksaan fisik abdomen',
    resep: 'Omeprazole 20mg 2x1, Sucralfate 3x1, Domperidone 10mg 3x1',
    catatan: 'Hindari makanan pedas dan asam, makan teratur',
  },
  {
    id: '4',
    kunjunganId: '4',
    pasienId: '4',
    dokterId: '2',
    tanggal: '2024-01-21',
    keluhan: 'Anak demam dan tidak mau makan',
    anamnesis: 'Anak usia 5 tahun demam sejak kemarin, nafsu makan menurun.',
    diagnosa: 'Faringitis Akut',
    tindakan: 'Pemeriksaan tenggorokan, pengukuran suhu',
    resep: 'Paracetamol sirup 3x1 cth, Amoxicillin sirup 3x1 cth',
    catatan: 'Beri minum yang banyak, kompres hangat',
  },
  {
    id: '5',
    kunjunganId: '5',
    pasienId: '5',
    dokterId: '3',
    tanggal: '2024-01-22',
    keluhan: 'Batuk berdahak dan sesak napas',
    anamnesis: 'Pasien mengeluh batuk berdahak warna kuning, sesak napas terutama malam hari.',
    diagnosa: 'Bronkitis Akut',
    tindakan: 'Pemeriksaan fisik paru, auskultasi',
    resep: 'Ambroxol 30mg 3x1, Salbutamol 2mg 3x1, Methylprednisolone 4mg 3x1',
    catatan: 'Hindari debu dan asap rokok',
  },
  {
    id: '6',
    kunjunganId: '6',
    pasienId: '1',
    dokterId: '3',
    tanggal: '2024-01-22',
    keluhan: 'Kontrol setelah pengobatan ISPA',
    anamnesis: 'Pasien datang untuk kontrol. Demam sudah turun, batuk berkurang.',
    diagnosa: 'ISPA (Perbaikan)',
    tindakan: 'Pemeriksaan fisik',
    resep: 'Vitamin C 500mg 1x1 (lanjutan 7 hari)',
    catatan: 'Kondisi membaik, lanjutkan vitamin',
  },
  {
    id: '7',
    kunjunganId: '7',
    pasienId: '2',
    dokterId: '1',
    tanggal: '2024-01-23',
    keluhan: 'Nyeri sendi tangan dan kaki',
    anamnesis: 'Pasien mengeluh nyeri sendi terutama pagi hari, kaku sekitar 30 menit.',
    diagnosa: 'Artralgia',
    tindakan: 'Pemeriksaan sendi, ROM test',
    resep: 'Meloxicam 15mg 1x1, Glucosamine 500mg 2x1',
    catatan: 'Hindari aktivitas berat, kompres hangat pada sendi',
  },
  {
    id: '8',
    kunjunganId: '8',
    pasienId: '3',
    dokterId: '2',
    tanggal: '2024-01-23',
    keluhan: 'Anak diare sejak kemarin',
    anamnesis: 'Anak usia 7 tahun diare 5x sehari, tidak ada demam.',
    diagnosa: 'Gastroenteritis Akut',
    tindakan: 'Pemeriksaan dehidrasi',
    resep: 'Oralit 3x1, Zinc sirup 1x1, Probiotik 2x1',
    catatan: 'Banyak minum, hindari makanan berminyak',
  },
];

// Helper functions
export const getPasienById = (id: string): Pasien | undefined => 
  pasienData.find(p => p.id === id);

export const getDokterById = (id: string): Dokter | undefined => 
  dokterData.find(d => d.id === id);

export const getKunjunganByPasienId = (pasienId: string): Kunjungan[] => 
  kunjunganData.filter(k => k.pasienId === pasienId);

export const getRekamMedisByPasienId = (pasienId: string): RekamMedis[] => 
  rekamMedisData.filter(r => r.pasienId === pasienId);

export const getRekamMedisByKunjunganId = (kunjunganId: string): RekamMedis | undefined => 
  rekamMedisData.find(r => r.kunjunganId === kunjunganId);

export const getJadwalByDokterId = (dokterId: string): JadwalPraktik[] => 
  jadwalPraktikData.filter(j => j.dokterId === dokterId);

export const formatTanggal = (tanggal: string): string => {
  const date = new Date(tanggal);
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

export const formatWaktu = (waktu: string): string => {
  return waktu.split(' ')[1] || waktu;
};

export const hitungUmur = (tanggalLahir: string): number => {
  const today = new Date();
  const birthDate = new Date(tanggalLahir);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};
