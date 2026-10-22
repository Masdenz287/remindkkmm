import type {
  AppNotification,
  Block,
  Issue,
  ItemDef,
  Reminder,
  Report,
  Role,
  Shift,
  StatusMark,
  StoreState,
  User,
  Visit,
} from './types';
import { hashStr, mulberry32, offsetDateStr, todayStr, uid } from './utils';

export const BLOCKS: Block[] = ['Persiapan Buka', 'Operasional', 'Tutup Toko'];

export const CHECKLIST_DEFS: ItemDef[] = [
  // ===== PERSIAPAN BUKA — semua peran =====
  { id: 'o-seragam', block: 'Persiapan Buka', title: 'Absen & pakai seragam lengkap', detail: 'Seragam bersih, apron, topi/penutup kepala, dan masker. Cek kuku & kerapian.', time: '05:30', roles: ['komandan', 'wakil', 'koki', 'goreng'] },
  { id: 'o-cucitangan', block: 'Persiapan Buka', title: 'Cuci tangan sesuai SOP', detail: 'Sabun + air mengalir 20 detik, keringkan dengan tisu/hand dryer, bukan lap kotor.', time: '05:35', roles: ['komandan', 'wakil', 'koki', 'goreng'], critical: true },
  { id: 'o-gas', block: 'Persiapan Buka', title: 'Cek tekanan tabung gas & regulator', detail: 'Putar valve, cek kebocoran pakai busa sabun. Pastikan selang tidak retak.', time: '05:40', roles: ['komandan', 'koki', 'goreng'], critical: true },
  { id: 'o-kompor', block: 'Persiapan Buka', title: 'Panaskan kompor & nyalakan tungku', detail: 'Korek api biru merata. Pilot light menyala stabil, tidak ada bau gas.', time: '05:45', roles: ['komandan', 'koki', 'goreng'] },
  { id: 'o-minyak-awal', block: 'Persiapan Buka', title: 'Panaskan minyak goreng (cek suhu)', detail: 'Panaskan minyak di wajan/deep fryer ke 170–180°C sebelum ayam masuk.', time: '05:50', roles: ['komandan', 'koki', 'goreng'] },
  { id: 'o-kulkas', block: 'Persiapan Buka', title: 'Cek suhu kulkas & freezer', detail: 'Kulkas 0–5°C, freezer di bawah -18°C. Catat angka di log harian.', time: '05:45', roles: ['komandan', 'wakil', 'koki', 'goreng'], critical: true },
  { id: 'o-bahan', block: 'Persiapan Buka', title: 'Cek stok bahan baku (FIFO)', detail: 'Ambil barang terlama duluan. Cek ayam, bumbu, minyak, beras, tepung, telur.', time: '06:00', roles: ['komandan', 'wakil', 'koki', 'goreng'] },
  { id: 'o-ekspirasi', block: 'Persiapan Buka', title: 'Cek tanggal kedaluwarsa semua bahan', detail: 'Pisahkan & tandai bahan expired dari lokasi stok. Laporkan ke Komandan Mispin.', time: '06:10', roles: ['komandan', 'wakil', 'koki', 'goreng'], critical: true },

  // ===== PERSIAPAN BUKA — spesifik goreng =====
  { id: 'g-ayam-marinasi', block: 'Persiapan Buka', title: 'Marinasi ayam (ayam kampung & bumbu kalasan)', detail: 'Lumuri ayam potong 1/8 dengan bumbu: bawang putih, ketumbar, kemiri, santan, gula merah, serai. Diamkan minimal 30 menit.', time: '06:15', roles: ['goreng'] },
  { id: 'g-tepung-balur', block: 'Persiapan Buka', title: 'Siapkan adonan balur tepung', detail: 'Tepung terigu + maizena + garam + lada + kaldu bubuk. Ayak sampai halus, tidak menggumpal.', time: '06:30', roles: ['goreng'] },
  { id: 'g-bumbu-halus', block: 'Persiapan Buka', title: 'Giling bumbu halus segar hari ini', detail: 'Bawang merah ½ kg, bawang putih ¼ kg, kunyit, jahe, lengkuas, serai. Giling segar, jangan sisakan kemarin.', time: '06:20', roles: ['goreng'] },
  { id: 'g-sambal', block: 'Persiapan Buka', title: 'Buat sambal terasi & sambal bawang', detail: 'Ulek cabai rawit, cabai merah, terasi bakar, gula merah. Sambal harus segar setiap pagi.', time: '06:45', roles: ['goreng'] },
  { id: 'g-tempe-tahu', block: 'Persiapan Buka', title: 'Rendam tempe & tahu dengan bumbu', detail: 'Iris tempe ½ cm, rendam di bumbu bawang putih + ketumbar + garam minimal 15 menit.', time: '06:40', roles: ['goreng'] },

  // ===== PERSIAPAN BUKA — spesifik koki =====
  { id: 'k-nasi-ulam', block: 'Persiapan Buka', title: 'Masak nasi uduk / nasi kuning untuk jualan', detail: 'Cuci beras 3x sampai air bening. Masak dengan santan/daun salam/serai. Takaran pas, tidak lembek tidak keras.', time: '06:00', roles: ['koki'] },
  { id: 'k-menu', block: 'Persiapan Buka', title: 'Cek ketersediaan menu di papan & aplikasi', detail: 'Coret menu yang habis/tidak tersedia. Koordinasi dengan kasir untuk info pelayanan.', time: '06:30', roles: ['koki', 'wakil'] },
  { id: 'k-qc-porsi', block: 'Persiapan Buka', title: 'Standarisasi porsi & tampilan piring', detail: 'Nasi 150g per porsi, ayam 1 potong/porsi, lalap secukupnya. Lay out sesuai standar foto.', time: '07:00', roles: ['koki', 'goreng'] },

  // ===== PERSIAPAN BUKA — wakil & komandan =====
  { id: 'w-brifing', block: 'Persiapan Buka', title: 'Brifing pagi kru (absensi & pembagian tugas)', detail: 'Brief 10 menit: evaluasi kemarin, pembagian station hari ini, target penjualan, pengingat SOP.', time: '05:45', roles: ['komandan', 'wakil'] },
  { id: 'm-kas', block: 'Persiapan Buka', title: 'Hitung uang kas awal & saldo laci', detail: 'Hitung modal receh & pecahan besar di laci kasir. Catat di buku kas dengan tanda tangan.', time: '05:50', roles: ['komandan'] },

  // ===== OPERASIONAL =====
  { id: 'o-suhu-sajian', block: 'Operasional', title: 'Jaga suhu sajian makanan > 60°C', detail: 'Gunakan food warmer/steam table. Cek suhu dengan termometer tiap jam saat jam sibuk.', time: '10:00', roles: ['komandan', 'wakil', 'koki', 'goreng'] },
  { id: 'o-kebersihan', block: 'Operasional', title: 'Lap meja & sanitasi area tiap jam', detail: 'Spray disinfektan food-grade di meja, counter, dan handle. Ganti lap bersih setiap 2 jam.', time: '12:00', roles: ['komandan', 'wakil', 'koki', 'goreng'] },
  { id: 'o-minyak-jam', block: 'Operasional', title: 'Saring & cek kualitas minyak tiap 2 jam', detail: 'Saring minyak dari remah tepung. Jika warna terlalu gelap/berbusa, ganti minyak baru.', time: '12:30', roles: ['komandan', 'koki', 'goreng'] },
  { id: 'o-walkin', block: 'Operasional', title: 'Pantau stok live & input yang habis', detail: 'Cek stok real-time: ayam, sambal, lalap. Input barang habis ke grup & sistem untuk restock.', time: '13:00', roles: ['komandan', 'wakil', 'koki', 'goreng'] },
  { id: 'o-keluhan', block: 'Operasional', title: 'Catat semua keluhan & komplain pelanggan', detail: 'Catat: nama, pesanan, masalah, waktu, kontak. Jangan berdebat — tangani dengan senyum & solusi.', time: '14:00', roles: ['komandan', 'wakil', 'koki', 'goreng'] },
  { id: 'o-cuci-alat', block: 'Operasional', title: 'Cuci & sterilkan alat masak di sela sibuk', detail: 'Bilas segera setelah dipakai. Keringkan dengan rak, jangan ditumpuk basah.', time: '15:00', roles: ['komandan', 'wakil', 'koki', 'goreng'] },
  { id: 'g-goreng-batch', block: 'Operasional', title: 'Goreng ayam & tempe batch besar jam 11 & 17', detail: 'Goreng ayam: 6–8 menit per sisi. Tiriskan 2 menit di rak minyak. Suhu internal ayam > 75°C.', time: '11:00', roles: ['goreng'], critical: true },
  { id: 'g-lalapan', block: 'Operasional', title: 'Potong lalapan segar & cuci berkali-kali', detail: 'Timun, kol, kemangi, tomat. Rendam air garam 5 menit, bilas, simpan di kulkas dalam wadah tertutup.', time: '16:00', roles: ['goreng'] },
  { id: 'k-tes-rasa', block: 'Operasional', title: 'Tes rasa semua menu tiap pergantian shift', detail: 'Cicip nasi uduk, ayam, sambal, tempe. Bumbu kurang → tambahkan. Jangan tunggu komplain.', time: '14:30', roles: ['koki'] },
  { id: 'k-porsi-tera', block: 'Operasional', title: 'Tera porsi nasi & lauk (jangan berlebih/kurang)', detail: 'Nasi 150g (±¾ gelas ukur), ayam 1 pcs, tempe 2 pcs, lalap 1 piring kecil. Konsisten setiap porsi.', time: '11:30', roles: ['koki', 'goreng'] },
  { id: 'w-pantau-antre', block: 'Operasional', title: 'Pantau antrean & koordinasi dapur–kasir', detail: 'Jika antrean > 5 orang, bantu antar pesanan atau panggil bantuan. Jangan biarkan pelanggan menunggu tanpa info.', time: '12:30', roles: ['wakil', 'komandan'] },

  // ===== TUTUP TOKO =====
  { id: 't-kompor-mati', block: 'Tutup Toko', title: 'Matikan semua kompor & keran gas', detail: 'Tutup valve di tabung dulu, biarkan api mati, baru matikan knob kompor. Cek sekali lagi.', time: '21:30', roles: ['komandan', 'koki', 'goreng'], critical: true },
  { id: 't-listrik', block: 'Tutup Toko', title: 'Matikan listrik & AC (kecuali kulkas & freezer)', detail: 'Matikan lampu sign, AC, kipas. Biarkan kulkas & freezer tetap menyala. Cabut alat yang tidak perlu.', time: '22:00', roles: ['komandan', 'wakil', 'koki', 'goreng'], critical: true },
  { id: 't-kulkas-tutup', block: 'Tutup Toko', title: 'Masukkan semua sisa bahan ke kulkas/freezer', detail: 'Tutup rapat wadah bahan. Ayam sisa harus di freezer. Label sisa makanan dengan tanggal.', time: '21:45', roles: ['komandan', 'wakil', 'koki', 'goreng'] },
  { id: 't-wajan', block: 'Tutup Toko', title: 'Cuci & sikat wajan deep fryer & wajan besar', detail: 'Buang minyak kotor ke jerigen limbah (jangan dibuang ke saluran). Sikat dengan sabun & air panas.', time: '21:40', roles: ['komandan', 'koki', 'goreng'] },
  { id: 't-lantai', block: 'Tutup Toko', title: 'Sapu & pel lantai dapur + area makan', detail: 'Sapu dulu seluruh area, lalu pel dengan cairan pembersih lantai. Perhatikan sudut & bawah meja.', time: '22:00', roles: ['komandan', 'wakil', 'koki', 'goreng'] },
  { id: 't-sampah', block: 'Tutup Toko', title: 'Buang semua sampah & ganti plastik baru', detail: 'Pisahkan sampah basah & kering. Ikat rapat kantong kuning. Taruh di bak sampah depan.', time: '22:15', roles: ['komandan', 'wakil', 'koki', 'goreng'] },
  { id: 't-setoran', block: 'Tutup Toko', title: 'Hitung setoran akhir & tutup shift kasir', detail: 'Total penjualan cash + transfer + QRIS. Cocokkan dengan struk. Buat laporan & tanda tangan.', time: '22:20', roles: ['komandan'], critical: true },
  { id: 't-kunci', block: 'Tutup Toko', title: 'Kunci semua pintu & gerbang toko', detail: 'Kunci pagar depan, pintu belakang, dan laci kasir. Cek pintu 2x sebelum pulang.', time: '22:30', roles: ['komandan', 'wakil'], critical: true },
];

export const DEFS_BY_BLOCK = BLOCKS.map((b) => ({
  block: b,
  items: CHECKLIST_DEFS.filter((d) => d.block === b),
}));

export const defsForRole = (role: Role): ItemDef[] =>
  CHECKLIST_DEFS.filter((d) => d.roles.includes(role));

export const defsForUser = (u: User) => defsForRole(u.role);

export const USERS: User[] = [
  { id: 'u-mispin', name: 'Mispin Sudrajat', username: 'mispin', email: 'mispin@kampungkecil.id', password: 'mispin123', role: 'komandan', jabatan: 'Komandan Mispin (Owner)', shift: 'Pagi', phone: '0812-1100-0001', color: '#b91c1c', active: true, joinDate: '2023-01-15' },
  { id: 'u-rahmat', name: 'Rahmat Hidayat', username: 'rahmat', email: 'rahmat@kampungkecil.id', password: 'rahmat123', role: 'wakil', jabatan: 'Wakil Rahmat (SPV Dapur)', shift: 'Pagi', phone: '0812-1100-0002', color: '#4338ca', active: true, joinDate: '2023-03-01' },
  { id: 'u-dewi', name: 'Rani Puspitasari', username: 'dewi', email: 'dewi@kampungkecil.id', password: 'dewi123', role: 'koki', jabatan: 'Koki Kepala', shift: 'Pagi', phone: '0812-1100-0003', color: '#d97706', active: true, joinDate: '2023-05-20' },
  { id: 'u-andi', name: 'Andi Wijaya', username: 'andi', email: 'andi@kampungkecil.id', password: 'andi123', role: 'goreng', jabatan: 'Goreng 1 (Pagi)', shift: 'Pagi', phone: '0812-1100-0004', color: '#059669', active: true, joinDate: '2024-02-11' },
  { id: 'u-budi', name: 'Budi Santoso', username: 'budi', email: 'budi@kampungkecil.id', password: 'budi123', role: 'goreng', jabatan: 'Goreng 2 (Pagi)', shift: 'Pagi', phone: '0812-1100-0005', color: '#0e7490', active: true, joinDate: '2024-06-05' },
  { id: 'u-citra', name: 'Citra Lestari', username: 'citra', email: 'citra@kampungkecil.id', password: 'citra123', role: 'goreng', jabatan: 'Goreng 3 (Siang)', shift: 'Siang', phone: '0812-1100-0006', color: '#7c3aed', active: true, joinDate: '2024-09-18' },
  { id: 'u-dimas', name: 'Dimas Prakoso', username: 'dimas', email: 'dimas@kampungkecil.id', password: 'dimas123', role: 'goreng', jabatan: 'Goreng 4 (Siang)', shift: 'Siang', phone: '0812-1100-0007', color: '#be185d', active: true, joinDate: '2025-01-09' },
  { id: 'u-eka', name: 'Eka Saputra', username: 'eka', email: 'eka@kampungkecil.id', password: 'eka123', role: 'goreng', jabatan: 'Goreng 5 (Malam)', shift: 'Malam', phone: '0812-1100-0008', color: '#334155', active: false, joinDate: '2025-04-22' },
];

/* ============ SEED REMINDERS ============ */
export const SEED_REMINDERS: Reminder[] = [
  { id: 'r-brifing', title: 'Brifing pagi kru — absensi & pembagian tugas', time: '05:30', days: [1, 2, 3, 4, 5, 6, 0], roles: ['komandan', 'wakil', 'koki', 'goreng'], active: true },
  { id: 'r-minyak', title: 'Cek & saring minyak goreng (jam sibuk mendekat)', time: '10:30', days: [1, 2, 3, 4, 5, 6, 0], roles: ['komandan', 'koki', 'goreng'], active: true },
  { id: 'r-tes-rasa', title: 'Tes rasa semua menu — pergantian shift', time: '13:30', days: [1, 2, 3, 4, 5, 6, 0], roles: ['koki', 'wakil'], active: true },
  { id: 'r-lalapan', title: 'Restock lalapan & sambal (stok sore menipis)', time: '16:00', days: [1, 2, 3, 4, 5, 6, 0], roles: ['goreng'], active: true },
  { id: 'r-setoran', title: 'Hitung setoran & tutup shift — GOTAK WAKTU!', time: '22:00', days: [1, 2, 3, 4, 5, 6, 0], roles: ['komandan'], active: true },
  { id: 'r-ekspirasi', title: 'Audit tanggal kedaluwarsa bahan baku mingguan', time: '07:00', days: [1], roles: ['komandan', 'wakil', 'koki'], active: true },
];

/* ============ SEED ISSUES (masalah) ============ */
export const SEED_ISSUES: Issue[] = [
  { id: 'i-1', title: 'Regulator kompor utama bau gas tipis', detail: 'Bau gas samar dari regulator kompor besar sejak kemarin sore. Sudah dikencangkan tapi bau masih terasa. Butuh penggantian regulator baru SEGERA.', reporterId: 'u-dewi', reporterName: 'Rani Puspitasari', date: offsetDateStr(-1), time: '18:20', severity: 'tinggi', status: 'progress' },
  { id: 'i-2', title: 'Kulkas display nomor 2 tidak dingin maksimal', detail: 'Suhu kulkas display menunjukkan 9°C (harusnya 0–5°C). Minuman di bagian atas dingin, bawah kurang. Dicurigai freon/evaporator kotor.', reporterId: 'u-rahmat', reporterName: 'Rahmat Hidayat', date: offsetDateStr(-2), time: '14:05', severity: 'sedang', status: 'open' },
  { id: 'i-3', title: 'Stok cabai rawit mau habis — sambal terancam tidak tersedia', detail: 'Sisa cabai rawit ±1 kg. Kebutuhan harian 2 kg. Supplier baru bisa kirim besok pagi. Mohon info ke kasir untuk antisipasi pesanan pedas.', reporterId: 'u-andi', reporterName: 'Andi Wijaya', date: todayStr(), time: '09:15', severity: 'sedang', status: 'open' },
  { id: 'i-4', title: 'Tepung maizena menggumpal di gudang kering', detail: 'Ditemukan 3 sak tepung maizena lembab & menggumpal. Penyebab: bocor kecil di atap gudang saat hujan. Sak-sak tersebut diamankan.', reporterId: 'u-mispin', reporterName: 'Mispin Sudrajat', date: offsetDateStr(-6), time: '08:40', severity: 'rendah', status: 'selesai' },
];

/* ============ SEED NOTIFICATIONS ============ */
export const SEED_NOTIFICATIONS: AppNotification[] = [
  { id: 'n-1', type: 'masalah', title: 'Masalah kritis: bau gas regulator kompor', body: 'Rani melaporkan bau gas tipis dari kompor utama. Menunggu penggantian regulator. Prioritas TINGGI.', time: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), read: false, roles: 'all' },
  { id: 'n-2', type: 'laporan', title: 'Laporan shift pagi kemarin terverifikasi', body: 'Laporan checklist Andi & Budi (kemarin) sudah diverifikasi oleh Koki Dewi. 2 item perlu perhatian.', time: new Date(Date.now() - 1000 * 60 * 60 * 9).toISOString(), read: true, roles: ['komandan', 'wakil'] },
  { id: 'n-3', type: 'reminder', title: 'Reminder: audit kedaluwarsa bahan baku', body: 'Jadwal mingguan — audit tanggal kedaluwarsa seluruh bahan baku setiap Senin pagi sebelum operasional.', time: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(), read: true, roles: ['komandan', 'wakil', 'koki'] },
];

/* ============ SEED VISITS (kunjungan audit) ============ */
export const SEED_VISITS: Visit[] = [
  { id: 'v-1', date: offsetDateStr(-3), visitor: 'Pak H. Darmawan (Pengawas PT Maju Bersama)', purpose: 'Audit kebersihan & sanitasi bulanan', overall: 4, notes: 'Dapur rapi & bersih. Catatan: label tanggal di beberapa wadah bahan baku kurang jelas — segera diperbaiki.', areas: [ { area: 'Kebersihan Area Dapur', score: 5 }, { area: 'Suhu & Penyimpanan Bahan', score: 4 }, { area: 'Personal Hygiene Kru', score: 4 }, { area: 'Tanggal Kedaluwarsa / FIFO', score: 3 }, { area: 'Kesiapan Alat & Gas', score: 4 }, { area: 'Dokumen & Log Harian', score: 4 } ] },
  { id: 'v-2', date: offsetDateStr(-10), visitor: 'Ibu Sari (Dinas Kesehatan Kota Bekasi)', purpose: 'Inspeksi rutin sertifikasi laik higiene sanitasi', overall: 5, notes: 'Sangat baik. Suhu penyimpanan bahan, kebersihan wajan, dan manajemen sampah sesuai standar. Sertifikat diperpanjang 1 tahun.', areas: [ { area: 'Kebersihan Area Dapur', score: 5 }, { area: 'Suhu & Penyimpanan Bahan', score: 5 }, { area: 'Personal Hygiene Kru', score: 5 }, { area: 'Tanggal Kedaluwarsa / FIFO', score: 5 }, { area: 'Kesiapan Alat & Gas', score: 5 }, { area: 'Dokumen & Log Harian', score: 4 } ] },
  { id: 'v-3', date: offsetDateStr(-17), visitor: 'Pak Rendra (Konsultan Quality Control)', purpose: 'Konsultasi standar porsi & food cost', overall: 4, notes: 'Food cost aktual 34% vs target 32%. Rekomendasi: kontrol porsi nasi lebih ketat (timbang 150g) dan kurangi waste sambal.', areas: [ { area: 'Standar Porsi & Resep', score: 3 }, { area: 'Food Cost & Waste', score: 4 }, { area: 'Kelengkapan Menu', score: 4 }, { area: 'Kecepatan Pelayanan', score: 4 } ] },
];

/* ============ GENERATED REPORTS (riwayat 10 hari) ============ */
const NOTES_BY_STATUS: Record<StatusMark, string[]> = {
  ok: ['', '', '', 'Sudah sesuai SOP', 'Aman terkendali'],
  periksa: ['Suhu sedikit di atas batas — perlu dipantau', 'Stok mulai menipis, segera restock', 'Minyak mulai keruh, akan disaring', 'Cek ulang setelah jam makan siang'],
  masalah: ['Rusak — dilaporkan ke Komandan', 'Stok habis total, perlu restock SEGERA', 'Tidak berfungsi normal', 'Butuh penggantian segera'],
};

const pickNote = (rng: () => number, status: StatusMark) => {
  const list = NOTES_BY_STATUS[status];
  return list[Math.floor(rng() * list.length)];
};

const isoAt = (dateStr: string, hour: number, minute: number) =>
  new Date(`${dateStr}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`).toISOString();

export function generateHistoryReports(): Report[] {
  const reports: Report[] = [];
  const operationalUsers = USERS.filter((u) => u.role !== 'wakil'); // goreng tiap orang + koki + mispin
  for (let d = 1; d <= 10; d++) {
    const date = offsetDateStr(-d);
    for (const u of operationalUsers) {
      if (u.shift === 'Siang' && d % 4 === 0) continue; // sesekali libur
      const rng = mulberry32(hashStr(`${u.id}|${date}|KKMB-2026`));
      const defs = defsForRole(u.role);
      const items = defs.map((def) => {
        const r = rng();
        let status: StatusMark = 'ok';
        if (r > 0.945) status = 'masalah';
        else if (r > 0.84) status = 'periksa';
        return { id: def.id, title: def.title, time: def.time, status, note: pickNote(rng, status) };
      });
      const okCount = items.filter((i) => i.status === 'ok').length;
      const periksaCount = items.filter((i) => i.status === 'periksa').length;
      const masalahCount = items.filter((i) => i.status === 'masalah').length;
      const verified = d > 1 || rng() > 0.4;
      const sentHour = u.shift === 'Pagi' ? 13 : u.shift === 'Siang' ? 20 : 4;
      reports.push({
        id: `rep-${u.id}-${date}`,
        userId: u.id,
        userName: u.name,
        jabatan: u.jabatan,
        role: u.role,
        shift: u.shift as Shift,
        date,
        total: defs.length,
        done: defs.length,
        okCount,
        periksaCount,
        masalahCount,
        catatan: masalahCount > 0 ? 'Ada temuan masalah — lihat item bertanda merah.' : periksaCount > 0 ? 'Beberapa item perlu pemantauan lanjutan.' : 'Semua pekerjaan selesai sesuai SOP. Siap operasional.',
        items,
        sentAt: isoAt(date, sentHour, Math.floor(rng() * 59)),
        verified,
        verifiedBy: verified ? 'Rani Puspitasari' : null,
        verifiedAt: verified ? isoAt(date, sentHour + 1, 15) : null,
      });
    }
  }
  // Urutkan terbaru dulu
  reports.sort((a, b) => (a.date === b.date ? b.sentAt.localeCompare(a.sentAt) : b.date.localeCompare(a.date)));
  return reports;
}

export function buildSeedState(): StoreState {
  const reports = generateHistoryReports();
  // Semangat: sedikit progress hari ini untuk Andi (sudah jalan pagi ini)
  const today = todayStr();
  const andiDefs = defsForRole('goreng');
  const andiItems: StoreState['days'][string]['items'] = {};
  const seedDone = ['o-seragam', 'o-cucitangan', 'o-gas', 'o-kompor', 'o-minyak-awal', 'o-kulkas', 'g-ayam-marinasi', 'g-tepung-balur', 'g-bumbu-halus', 'g-sambal', 'g-tempe-tahu', 'o-bahan', 'o-ekspirasi'];
  for (const id of seedDone) {
    if (andiDefs.find((d) => d.id === id)) {
      andiItems[id] = { status: 'ok', note: '', checkedAt: isoAt(today, 6, 5 + Math.floor(Math.random() * 50)) };
    }
  }
  if (andiItems['o-ekspirasi']) andiItems['o-ekspirasi'].note = 'Tepung maizena lembab 3 sak — diamankan & dipisah';
  // Budi sudah mengerjakan sebagian
  const budiItems: StoreState['days'][string]['items'] = {};
  const budiDone = ['o-seragam', 'o-cucitangan', 'o-gas', 'o-kompor', 'o-minyak-awal', 'o-kulkas', 'g-ayam-marinasi', 'g-tepung-balur'];
  for (const id of budiDone) {
    budiItems[id] = { status: 'ok', note: '', checkedAt: isoAt(today, 6, 30) };
  }
  const days: StoreState['days'] = {
    [`u-andi|${today}`]: { items: andiItems, sentAt: null, verifiedAt: null, verifiedBy: null },
    [`u-budi|${today}`]: { items: budiItems, sentAt: null, verifiedAt: null, verifiedBy: null },
  };

  return {
    users: USERS,
    days,
    reports,
    issues: SEED_ISSUES,
    notifications: SEED_NOTIFICATIONS,
    reminders: SEED_REMINDERS,
    visits: SEED_VISITS,
    fired: {},
    lateNotified: {},
  };
}
