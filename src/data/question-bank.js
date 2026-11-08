// =========================================================================
// BANK SOAL RESMI OSCE CENTER 3D — SISI SERVER (FASE 3A)
// =========================================================================

const QUESTION_BANK_KOR_A = [
  {
    stationNo: 1,
    code: "STATION 01",
    area: "Pembuatan 1 (R&D)",
    title: "Perancangan Sediaan Farmasi (Formula & Eksipien)",
    type: "Analisis & Rekomendasi Teknis",
    npcName: "Manager R&D Industri Farmasi",
    npcRole: "Penguji Station R&D",
    labObjectTitle: "Master Formula & Bahan Baku Emulsi",
    doorShortInstruction: "PELAJARI MASALAH STABILITAS FORMULA EMULSI MINYAK IKAN. HITUNG NILAI HLB BUTUH & TENTUKAN EMULGATOR KOMBINASI (SPAN & TWEEN).",
    scenario: "Anda adalah Apoteker R&D yang sedang merancang formula emulsi minyak ikan (Oleum Iecoris Aselli 30%). Pada uji stabilitas pendahuluan terjadi creaming dan cracking karena ketidaksesuaian nilai HLB emulgator.",
    tasks: [
      "Pelajari komposisi formula yang ada pada lembar kerja digital.",
      "Hitung proporsi surfaktan Span 80 (HLB 4.3) dan Tween 80 (HLB 15.0) untuk target HLB Butuh 12.0.",
      "Tentukan eksipien antioksidan dan pemanis yang aman untuk sediaan emulsi oral pediatrik."
    ],
    competencies: "Penetapan Masalah, Penyelesaian Masalah, Sikap dan Perilaku Profesional",
    npcDialogs: [
      { q: "Tanyakan riwayat pengujian stabilitas sediaan", a: "Sediaan mengalami pemisahan fase minyak dan air setelah sentrifugasi 3.000 rpm selama 30 menit." },
      { q: "Konfirmasi target organoleptik sediaan untuk anak", a: "Target berupa emulsi tipe O/W yang homogen, rasa manis jeruk, tidak tengik, dan viskositas mudah dituang (150–250 cP)." }
    ],
    labData: "Formula: Minyak Ikan 30%, Span 80 & Tween 80 (total emulgator 5%), Gliserin 10%, Sirupus Simplex 20%, BHT 0.02%, Aqua ad 100 ml. Target HLB = 12.0.",
    decisionQuestion: "Berapa proporsi Tween 80 dan Span 80 yang harus Anda tetapkan untuk mencapai HLB butuh 12.0?",
    options: [
      { text: "Tween 80 sebesar 3.60 g dan Span 80 sebesar 1.40 g (Rasio 72% : 28%)", correct: true },
      { text: "Tween 80 sebesar 1.40 g dan Span 80 sebesar 3.60 g (Rasio 28% : 72%)", correct: false },
      { text: "Hanya menggunakan Span 80 sebesar 5.0 g tanpa Tween 80", correct: false }
    ],
    checklist: [
      { id: "c1_1", label: "Menggali data hasil sentrifugasi & viskositas sediaan", weight: 20, critical: false, domain: "Pengumpulan Data" },
      { id: "c1_2", label: "Menghitung rasio Span 80 (1.40 g / 28%) & Tween 80 (3.60 g / 72%) untuk HLB 12.0", weight: 45, critical: true, domain: "Penyelesaian Masalah" },
      { id: "c1_3", label: "Menetapkan antioksidan BHT & pemanis yang tepat untuk pediatrik", weight: 20, critical: false, domain: "Penetapan Masalah" },
      { id: "c1_4", label: "Sikap profesional & sistematis dalam pelaporan R&D", weight: 15, critical: false, domain: "Sikap Profesional" }
    ],
    pembahasan: "HLB campuran = (3,60 x 15,0 + 1,40 x 4,3) / 5,0 = 12,0 sehingga sesuai HLB butuh emulsi O/W; fraksi Tween 80 harus lebih besar karena HLB-nya tinggi."
  },
  {
    stationNo: 2,
    code: "STATION 02",
    area: "Pembuatan 2 (Produksi)",
    title: "IPC Proses Manufaktur & Validasi Produksi",
    type: "Penetapan Parameter Kritis IPC",
    npcName: "Supervisor Produksi Solid",
    npcRole: "Penguji Station Produksi",
    labObjectTitle: "Alat Uji IPC (Friabilator, Disintegrator, Hardness)",
    doorShortInstruction: "EVALUASI MASALAH TABLET CAPPING / LAMINASI PADA MESIN ROTARY TABLET CETAK. TETAPKAN TINDAKAN KOREKTIF FORMULASI & IPC.",
    scenario: "Pada proses pencetakan tablet Parasetamol 500 mg skala bets pilot (100.000 tablet), ditemukan 14% tablet mengalami kerusakan 'capping' (bagian atas terlepas) dan 'lamination'.",
    tasks: [
      "Lakukan analisis akar penyebab capping berdasarkan parameter granulasi dan tekanan kompresi.",
      "Tentukan tindakan koreksi pada mesin cetak tablet (pre-compression force & punch speed).",
      "Tetapkan parameter IPC yang wajib diuji sebelum bets boleh dilanjutkan."
    ],
    competencies: "Penyelesaian Masalah, Pencatatan & Pelaporan, Sikap Profesional",
    npcDialogs: [
      { q: "Tanyakan kadar air (LOD) granul sebelum pencetakan", a: "Hasil pengujian Loss on Drying (LOD) granul Parasetamol adalah 0.4% (sangat kering dari rentang spesifikasi 1.5–2.5%)." },
      { q: "Tanyakan kecepatan mesin cetak tablet saat terjadi capping", a: "Mesin rotary dioperasikan pada kecepatan maksimum 55 rpm dengan gaya pra-kompresi belum diaktifkan." }
    ],
    labData: "Data IPC Granul: LOD = 0.4%, Sudut Diam = 38 derajat, Indeks Carr = 23%. Kekerasan tablet = 3.2 kP (Syarat 4–8 kP), Kerapuhan = 1.8% (Syarat < 1%).",
    decisionQuestion: "Langkah koreksi teknis utama yang harus Anda rekomendasikan sebagai Apoteker Produksi adalah:",
    options: [
      { text: "Atur kelembapan granul ke rentang 1.5–2.0%, kurangi kecepatan rotasi punch, dan aktifkan gaya pra-kompresi untuk mengeluarkan udara terjebak", correct: true },
      { text: "Tingkatkan gaya kompresi utama hingga maksimum tanpa mengubah kelembapan granul", correct: false },
      { text: "Menambahkan magnesium stearat hingga 5% langsung ke dalam hopper", correct: false }
    ],
    checklist: [
      { id: "c2_1", label: "Mengidentifikasi LOD granul terlalu kering (0.4% vs syarat 1.5–2.5%)", weight: 25, critical: false, domain: "Pengumpulan Data" },
      { id: "c2_2", label: "Menurunkan kecepatan turret RPM & mengaktifkan gaya pra-kompresi (capping < 1%)", weight: 45, critical: true, domain: "Penyelesaian Masalah" },
      { id: "c2_3", label: "Menetapkan parameter IPC kekerasan (4–8 kP) & kerapuhan (< 1%)", weight: 20, critical: false, domain: "Pencatatan & Pelaporan" },
      { id: "c2_4", label: "Komunikasi teknis efektif dengan Supervisor Produksi", weight: 10, critical: false, domain: "Komunikasi Efektif" }
    ],
    pembahasan: "Capping terjadi karena granul terlalu kering (LOD 0,4%) dan udara terjebak. Koreksi: atur kelembapan granul 1,5-2,0%, turunkan kecepatan punch, dan aktifkan pra-kompresi."
  },
  {
    stationNo: 3,
    code: "STATION 03",
    area: "Pembuatan 3 (QC / QA)",
    title: "Pengujian Mutu Sediaan & Keputusan Rilis Bets",
    type: "Interpretasi Data Kromatogram & Rilis Bets",
    npcName: "Manager QA (Pemastian Mutu)",
    npcRole: "Penguji Station QA/QC",
    labObjectTitle: "Instrumen KCKT / HPLC & Spektrofotometer UV-Vis",
    doorShortInstruction: "ANALISIS KROMATOGRAM KCKT KADAR BAHAN AKTIF TABLET PARASETAMOL. TETAPKAN STATUS KELULUSAN BETS PRODUKSI.",
    scenario: "Anda menerima hasil uji penetapan kadar Parasetamol 500 mg secara KCKT untuk bets B2401. Area puncak sampel = 1.250.000, Area puncak baku = 1.220.000 (Konsentrasi baku = 50 mcg/ml).",
    tasks: [
      "Hitung perolehan kadar Parasetamol dalam tablet berdasarkan persamaan baku.",
      "Bandingkan hasil terhadap batas spesifikasi Farmakope Indonesia Edisi VI (90.0% – 110.0%).",
      "Buat rekomendasi formal rilis bets atau investigasi deviasi (OOS)."
    ],
    competencies: "Pengumpulan Data, Penetapan Masalah, Pencatatan & Pelaporan",
    npcDialogs: [
      { q: "Tanyakan apakah uji kesesuaian sistem (SST) HPLC memenuhi syarat", a: "SST memenuhi syarat: %RSD luas area = 0.8% (syarat < 2.0%), faktor ikutan / tailing factor = 1.2 (syarat < 2.0)." },
      { q: "Konfirmasi riwayat deviasi pada bets B2401 selama proses pengemasan", a: "Tidak ada deviasi kritis tercatat pada batch record pengemasan primer maupun sekunder." }
    ],
    labData: "Data Uji: Kadar terhitung = 102.5% dari klaim etiket (512.5 mg/tablet). Syarat FI VI: 90.0%–110.0%. Uji disolusi: Q30 = 88% (Syarat Q > 80%).",
    decisionQuestion: "Keputusan QA manakah yang sah dan scientifically-sound untuk Bets B2401?",
    options: [
      { text: "Rilis Bets B2401 karena seluruh parameter uji (kadar 102.5%, disolusi 88%, SST KCKT) memenuhi seluruh spesifikasi Farmakope Indonesia VI", correct: true },
      { text: "Tolak bets karena kadar melebihi tepat 100.0%", correct: false },
      { text: "Lakukan pengujian ulang (re-test) tanpa membuka formulir investigasi OOS", correct: false }
    ],
    checklist: [
      { id: "c3_1", label: "Memverifikasi kesesuaian sistem SST HPLC (RSD < 2%, Tailing < 2)", weight: 20, critical: false, domain: "Pengumpulan Data" },
      { id: "c3_2", label: "Menghitung kadar Parasetamol (102.5%) & membandingkan dengan syarat FI VI", weight: 45, critical: true, domain: "Penyelesaian Masalah" },
      { id: "c3_3", label: "Menetapkan status rilis bets QA B2401 secara tepat", weight: 25, critical: true, domain: "Penetapan Masalah" },
      { id: "c3_4", label: "Kelengkapan tanda tangan Sertifikat Analisis (CoA)", weight: 10, critical: false, domain: "Pencatatan & Pelaporan" }
    ],
    pembahasan: "Kadar 102,5% (512,5 mg/tablet) berada dalam rentang Farmakope 90,0-110,0%, sehingga bets memenuhi syarat dan dapat dirilis oleh Apoteker QA."
  },
  {
    stationNo: 4,
    code: "STATION 04",
    area: "Pengelolaan 1 (Seleksi & Pengadaan)",
    title: "Analisis ABC-VEN & Perencanaan Anggaran Farmasi",
    type: "Analisis Finansial & Kebijakan Pengadaan",
    npcName: "Kepala Instalasi Farmasi RS",
    npcRole: "Penguji Station Pengelolaan",
    labObjectTitle: "Komputer SIM-RS & Lembar Analisis Matriks ABC-VEN",
    doorShortInstruction: "LAKUKAN EFISIENSI ANGGARAN APOTIK/RS RP 300 JUTA DENGAN METODE MATRIKS ABC-VEN. PILIH KATEGORI OBAT YANG DIKURANGI.",
    scenario: "Rumah Sakit mengalami pemotongan anggaran pengadaan obat triwulanan sebesar Rp 300.000.000. Anda diminta merevisi rencana pengadaan tanpa mengganggu pelayanan rawat darurat dan intensif.",
    tasks: [
      "Klasifikasikan 5 kelompok obat prioritas berdasarkan matriks ABC-VEN.",
      "Tentukan kelompok obat mana yang anggarannya dapat dialihkan/dipangkas tanpa membahayakan jiwa pasien.",
      "Pertahankan stok obat kategori Vital (V) dan prioritas tinggi (VA & VB)."
    ],
    competencies: "Penetapan Masalah, Penyelesaian Masalah, Sikap Profesional",
    npcDialogs: [
      { q: "Tanyakan ketersediaan dana sisa kas farmasi", a: "Sisa plafon anggaran adalah Rp 700 Juta dari total usulan awal Rp 1 Miliar (kurang Rp 300 Juta)." },
      { q: "Konfirmasi daftar obat kategori Vital (V)", a: "Kategori Vital meliputi: Adrenalin injeksi, Oksigen, Anti Bisa Ular, Insulin reguler, dan Furosemid injeksi." }
    ],
    labData: "Tabel Matriks: Kelompok VA = Rp 450 Jt (100% vital), VB = Rp 250 Jt, VC = Rp 100 Jt, NA = Rp 150 Jt, NB = Rp 50 Jt. Target efisiensi = Rp 300 Jt.",
    decisionQuestion: "Kelompok manakah yang paling rasional untuk dipangkas/diefisiensikan terlebih dahulu?",
    options: [
      { text: "Pangkas pengadaan kelompok Non-Esensial & Komplementer kategori C dan B (NC & NB) serta sebagian NA; pertahankan kelompok Vital (VA, VB, VC) 100%", correct: true },
      { text: "Pangkas semua obat kategori Vital A (VA) karena menyerap anggaran paling besar (Rp 450 Juta)", correct: false },
      { text: "Kurangi pengadaan seluruh obat secara rata sebesar 30% tanpa memandang kelas VEN", correct: false }
    ],
    checklist: [
      { id: "c4_1", label: "Menganalisis matriks kombinasi ABC-VEN pada usulan belanja farmasi", weight: 25, critical: false, domain: "Pengumpulan Data" },
      { id: "c4_2", label: "Menolak pemangkasan obat kategori Vital (VA, VB, VC) untuk keselamatan nyawa", weight: 45, critical: true, domain: "Penyelesaian Masalah" },
      { id: "c4_3", label: "Memangkas anggaran tepat Rp 300 Juta dari kelompok Non-Esensial (NC/NB/NA)", weight: 20, critical: false, domain: "Penetapan Masalah" },
      { id: "c4_4", label: "Menyampaikan laporan rasionalisasi anggaran secara objektif", weight: 10, critical: false, domain: "Komunikasi Efektif" }
    ],
    pembahasan: "Analisis ABC-VEN: item vital (VA) dipertahankan 100%; efisiensi anggaran Rp 300 Juta diambil dari item non-esensial kategori C (NC)."
  },
  {
    stationNo: 5,
    code: "STATION 05",
    area: "Pengelolaan 2 (Penyimpanan & Distribusi)",
    title: "Penyimpanan Obat High Alert & Rantai Dingin Vaksin (Cold Chain)",
    type: "Audit Tata Kelola Penyimpanan Farmasi",
    npcName: "Apoteker Penanggung Jawab Gudang",
    npcRole: "Penguji Station Distribusi",
    labObjectTitle: "Chiller Vaksin (2-8°C), Termometer & Lemari Narkotika/LASA",
    doorShortInstruction: "AUDIT SUHU KULKAS VAKSIN DENGAN VVM TAHAP C/D & TATA LETAK HIGH-ALERT ELEKTROLIT KONSENTRAT (KCL 7.46%).",
    scenario: "Saat audit gudang farmasi, Anda menemukan Chiller Vaksin menunjukkan suhu 12°C selama 6 jam akibat pemadaman listrik, dan botol KCl konsentrat 7.46% tersimpan di rak obat umum tanpa penandaan khusus.",
    tasks: [
      "Periksa kondisi Vaccine Vial Monitor (VVM) dan freeze tag pada vaksin polio dan DPT-HB-Hib.",
      "Ambil tindakan karantina dan pelaporan terhadap vaksin yang terpapar suhu di luar 2–8°C.",
      "Koreksi tata letak penyimpanan elektrolit pekat (High Alert) sesuai standar Akreditasi RS / Permenkes."
    ],
    competencies: "Penetapan Masalah, Penyelesaian Masalah, Pencatatan & Pelaporan",
    npcDialogs: [
      { q: "Periksa indikator VVM vaksin campak dan polio", a: "VVM vaksin campak berada pada tahap 3 (segiempat sama gelap dengan lingkaran luar)." },
      { q: "Periksa lokasi penyimpanan injeksi KCl 7.46%", a: "KCl 7.46% berada di rak alfabetis 'K' berdampingan dengan larutan infus NaCl 0.9%." }
    ],
    labData: "Kondisi: Suhu chiller tercatat 12°C selama 6 jam berturut-turut. Indikator VVM = Tahap 3 (warna segi empat sama gelap dengan lingkaran). Regulasi: High Alert wajib label merah.",
    decisionQuestion: "Tindakan gawat-darurat penyimpanan manakah yang harus Anda lakukan seketika?",
    options: [
      { text: "Karantina vaksin dengan VVM tahap 3 (tidak boleh digunakan), pindahkan KCl 7.46% ke lemari khusus High Alert dengan stiker merah 'HIGH ALERT' mencolok", correct: true },
      { text: "Segera bekukan kembali vaksin campak ke dalam freezer suhu -20°C agar VVM memutih kembali", correct: false },
      { text: "Biarkan KCl 7.46% di rak umum selama stok belum habis", correct: false }
    ],
    checklist: [
      { id: "c5_1", label: "Mengidentifikasi status VVM Tahap 3 & suhu cold chain out-of-spec (12°C)", weight: 25, critical: false, domain: "Pengumpulan Data" },
      { id: "c5_2", label: "Melakukan karantina total vaksin VVM Tahap 3 ke dalam box terpisah berlabel MERAH", weight: 40, critical: true, domain: "Penyelesaian Masalah" },
      { id: "c5_3", label: "Memindahkan KCl pekat ke lemari High Alert terkunci dengan label merah menyala", weight: 25, critical: true, domain: "Penyelesaian Masalah" },
      { id: "c5_4", label: "Membuat Berita Acara Kerusakan Vaksin dan insiden keselamatan pasien", weight: 10, critical: false, domain: "Pencatatan & Pelaporan" }
    ],
    pembahasan: "Vaksin dengan indikator VVM tahap 3 dikarantina di kotak merah; KCl 7.46% adalah High Alert yang wajib disimpan di lemari terkunci berlabel merah."
  },
  {
    stationNo: 6,
    code: "STATION 06",
    area: "Pelayanan 1 (Pengkajian Resep & Interaksi)",
    title: "Skrining Resep, Identifikasi DRP & Interaksi Obat",
    type: "Skrining Resep Klinis & Konfirmasi Dokter",
    npcName: "dr. Bambang, Sp.PD",
    npcRole: "Dokter Penulis Resep (Komunikasi SBAR)",
    labObjectTitle: "Berkas Resep Rawat Jalan & Buku Interaksi Medscape/Stockley",
    doorShortInstruction: "SKRINING RESEP PASIEN GERIATRI DENGAN WARFARIN & ASAM MEFENAMAT. HUBUNGI DOKTER PENULIS RESEP DENGAN TEKNIK SBAR.",
    scenario: "Pasien Tn. Anwar (68 tahun, riwayat atrial fibrilasi rutin minum Warfarin 2 mg) membawa resep baru berisi Asam Mefenamat 500 mg 3x1 tablet untuk keluhan nyeri sendi lutut.",
    tasks: [
      "Lakukan pengkajian administratif, farmasetis, dan klinis resep.",
      "Identifikasi interaksi obat potensial farmakodinamik antara Warfarin dan Asam Mefenamat.",
      "Hubungi dokter penulis resep menggunakan teknik komunikasi SBAR (Situation, Background, Assessment, Recommendation)."
    ],
    competencies: "Pengumpulan Data, Penetapan Masalah, Komunikasi Efektif, Sikap Profesional",
    npcDialogs: [
      { q: "Hubungi dokter via telepon: sampaikan identitas diri dan tujuan konfirmasi", a: "Halo Apoteker, iya saya dr. Bambang Sp.PD. Ada masalah apa dengan resep Tn. Anwar?" },
      { q: "Sampaikan rekomendasi penggantian obat analgetik", a: "Terima kasih infonya, saya setuju Asam Mefenamat diganti Parasetamol saja dosis rendah jika nyeri." }
    ],
    labData: "Data Lab Tn. Anwar: Nilai INR saat ini = 2.6 (Target terapeutik: 2.0–3.0). Riwayat: Ulkus peptikum 2 tahun lalu.",
    decisionQuestion: "Rekomendasi klinis yang wajib Anda berikan kepada dokter adalah:",
    options: [
      { text: "Menghentikan Asam Mefenamat karena meningkatkan risiko perdarahan lambung akibat efek antiplatelet dan ulserogenik; ganti dengan Parasetamol dosis terbagi", correct: true },
      { text: "Menyetujui resep dan menaikkan dosis Warfarin menjadi 10 mg", correct: false },
      { text: "Mengganti Warfarin dengan Aspirin 100 mg tanpa persetujuan dokter", correct: false }
    ],
    checklist: [
      { id: "c6_1", label: "Mengidentifikasi interaksi mayor perdarahan: Warfarin + Asam Mefenamat (INR 2.6)", weight: 25, critical: true, domain: "Penetapan Masalah" },
      { id: "c6_2", label: "Melakukan komunikasi telepon SBAR (Situation, Background, Assessment, Recommendation)", weight: 35, critical: false, domain: "Komunikasi Efektif" },
      { id: "c6_3", label: "Merekomendasikan penggantian analgesik aman: Parasetamol dosis terbagi", weight: 30, critical: true, domain: "Penyelesaian Masalah" },
      { id: "c6_4", label: "Mencatat hasil konfirmasi dokter pada lembar resep & rekam farmasi", weight: 10, critical: false, domain: "Pencatatan & Pelaporan" }
    ],
    pembahasan: "Asam mefenamat bersama warfarin meningkatkan risiko perdarahan GI mayor. Gunakan komunikasi SBAR untuk menyarankan penggantian ke Parasetamol."
  },
  {
    stationNo: 7,
    code: "STATION 07",
    area: "Pelayanan 2 (Konseling Swamedikasi)",
    title: "Konseling Pasien Swamedikasi (WWHAM)",
    type: "Simulasi Pasien Standar di Apotek",
    npcName: "Ibu Maya (32 Tahun) — Pasien Standar",
    npcRole: "Pasien Apotek (Ibu Rumah Tangga)",
    labObjectTitle: "Rak Obat Bebas Terbatas (W-Line) & Brosur",
    doorShortInstruction: "GALI KELUHAN PASIEN BATUK BERDAHAK DENGAN METODE WWHAM. PILIH OBAT BEBAS TERBATAS & BERIKAN EDUKASI TERAPI NON-OBAT.",
    scenario: "Ibu Maya datang ke apotek ingin membeli obat batuk untuk dirinya sendiri yang sedang menyusui bayi berusia 3 bulan.",
    tasks: [
      "Gali informasi pasien menggunakan metode WWHAM (Who, What, How long, Action taken, Medication).",
      "Pilihkan sediaan obat batuk bebas/bebas terbatas yang aman untuk ibu menyusui (ekspektoran Gliseril Guaiakolat).",
      "Berikan informasi dosis, cara pemakaian, efek samping, dan terapi non-farmakologis."
    ],
    competencies: "Pengumpulan Data, Penyelesaian Masalah, Komunikasi Efektif, Sikap Profesional",
    npcDialogs: [
      { q: "Tanyakan untuk siapa obat ini dan apa gejala utamanya", a: "Untuk saya sendiri Apoteker. Batuknya berdahak sudah 3 hari, tenggorokan gatal, tidak ada demam, tapi saya sedang menyusui bayi usia 3 bulan." },
      { q: "Tanyakan apakah sudah meminum obat lain sebelumnya", a: "Belum minum obat apapun, baru minum teh hangat dan madu tapi dahak masih susah keluar." }
    ],
    labData: "Kondisi Khusus: Ibu menyusui (Laktasi, Bayi 3 bulan). Kontraindikasi: Antitusif golongan Dekstrometorfan dosis tinggi atau Kodein.",
    decisionQuestion: "Obat batuk dan anjuran manakah yang paling rasional untuk Ibu Maya?",
    options: [
      { text: "Tablet Gliseril Guaiakolat (Guaifenesin) 100 mg diminum 3 kali sehari 1 tablet sesudah makan dengan banyak air putih hangat", correct: true },
      { text: "Sirup Dekstrometorfan HBr dicampur Pseudoefedrin dosis maksimal", correct: false },
      { text: "Antibiotik Amoksisilin 500 mg tanpa resep dokter", correct: false }
    ],
    checklist: [
      { id: "c7_1", label: "Menggali informasi lengkap dengan metode WWHAM (bayi 3 bulan menyusui)", weight: 25, critical: false, domain: "Pengumpulan Data" },
      { id: "c7_2", label: "Memilih obat rasional ekspektoran Guaifenesin (aman laktasi)", weight: 45, critical: true, domain: "Penyelesaian Masalah" },
      { id: "c7_3", label: "Menghindari kontraindikasi Dekstrometorfan dosis tinggi / Kodein", weight: 20, critical: false, domain: "Penetapan Masalah" },
      { id: "c7_4", label: "Edukasi terapi suportif: minum air hangat, istirahat cukup", weight: 10, critical: false, domain: "Komunikasi Efektif" }
    ],
    pembahasan: "Guaifenesin (Gliseril Guaiakolat) adalah ekspektoran pilihan yang aman untuk ibu menyusui setelah penggalian WWHAM."
  },
  {
    stationNo: 8,
    code: "STATION 08",
    area: "Pelayanan 3 (Compounding & Dispensing)",
    title: "Peracikan Puyer Pediatrik & Perhitungan BUD",
    type: "Praktik Peracikan di Laboratorium Apotek",
    npcName: "Penguji Station Compounding",
    npcRole: "Observasi Teknik Peracikan & Etiket",
    labObjectTitle: "Mortir-Stamper, Kertas Perkamen & Botol Sirup Kering",
    doorShortInstruction: "HITUNG JUMLAH TABLET KEBUTUHAN PUYER DTD. SIAPKAN PERACIKAN, ETIKET PUTIH, DAN TETAPKAN BEYOND USE DATE (BUD).",
    scenario: "Anda menerima resep racikan puyer untuk anak (BB 15 kg): R/ Parasetamol 150 mg, m.f. pulv. dtd No. X (S 3 dd 1 pulv prn demam). Tersedia tablet Parasetamol 500 mg di apotek.",
    tasks: [
      "Hitung jumlah tablet Parasetamol 500 mg yang dibutuhkan untuk membuat 10 bungkus puyer (dtd).",
      "Siapkan peracikan, kemasan, etiket putih (obat dalam), dan salinan resep.",
      "Tetapkan Beyond Use Date (BUD) sediaan puyer racikan sesuai pedoman USP/Farmakope."
    ],
    competencies: "Penetapan Masalah, Penyelesaian Masalah, Pencatatan & Pelaporan, Sikap Profesional",
    npcDialogs: [
      { q: "Periksa tanggal kedaluwarsa tablet Parasetamol 500 mg di wadah asli", a: "Tablet Parasetamol 500 mg pada botol pabrik memiliki sisa masa kedaluwarsa 24 bulan (2 tahun)." },
      { q: "Konfirmasi ketersediaan kertas perkamen dan etiket", a: "Kertas perkamen, plastik klip obat, dan etiket putih untuk penggunaan oral sudah siap di meja." }
    ],
    labData: "Resep bertanda 'dtd' (da tales doses = berikan sekian takaran): 150 mg x 10 bungkus = 1.500 mg total Parasetamol. Tablet tersedia: 500 mg.",
    decisionQuestion: "Berapa jumlah tablet Parasetamol 500 mg yang diambil dan berapa BUD maksimal puyer tersebut?",
    options: [
      { text: "Mengambil 3 tablet Parasetamol 500 mg (1.500 mg total), etiket putih, BUD maksimal 180 hari (6 bulan) atau 25% dari sisa ED", correct: true },
      { text: "Mengambil 10 tablet Parasetamol 500 mg dengan etiket biru", correct: false },
      { text: "Mengambil 1.5 tablet Parasetamol 500 mg dengan BUD 14 hari di suhu ruang", correct: false }
    ],
    checklist: [
      { id: "c8_1", label: "Menghitung kebutuhan obat dtd (150 mg x 10 = 1500 mg / 3 tab)", weight: 35, critical: true, domain: "Penetapan Masalah" },
      { id: "c8_2", label: "Menetapkan BUD puyer non-aqueous oral (USP <795>: maks 180 hari)", weight: 35, critical: true, domain: "Penyelesaian Masalah" },
      { id: "c8_3", label: "Menyiapkan etiket putih obat dalam dengan aturan pakai prn demam", weight: 20, critical: false, domain: "Pencatatan & Pelaporan" },
      { id: "c8_4", label: "Kebersihan alat mortir dan kerapian pengemasan puyer", weight: 10, critical: false, domain: "Sikap Profesional" }
    ],
    pembahasan: "Dosis 1.500 mg (150 mg x 10 DTD) dipenuhi dengan 3 tablet Parasetamol 500 mg, etiket putih (oral), dan BUD maksimal 180 hari."
  },
  {
    stationNo: 9,
    code: "STATION 09",
    area: "Pelayanan 4 (Dispensing KIE & MESO)",
    title: "Dispensing (KIE Alat Khusus Insulin) & Pelaporan MESO",
    type: "Interaktif (Konseling Pasien & Pelaporan MESO)",
    npcName: "Ny. Ratna (48 Tahun) — Pasien DM & Hipertensi",
    npcRole: "Pasien Standar (Konseling Pen Insulin)",
    labObjectTitle: "FlexPen Insulin Glargine, Jarum & Form MESO",
    doorShortInstruction: "DEMONSTRASIKAN CARA PENGGUNAAN PEN INSULIN & PENYIMPANANNYA. CATAT EFEK SAMPING BATUK KERING ACEi PADA FORM MESO.",
    scenario: "Ny. Ratna datang menebus resep Insulin Glargine Pen pertama kalinya dan mengeluhkan batuk kering terus-menerus sejak rutin meminum Kaptopril 25 mg.",
    tasks: [
      "Berikan KIE langkah penggunaan Pen Insulin (pasang jarum, priming 2 unit, suntik subkutan 90 derajat, tahan 10 detik).",
      "Identifikasi keluhan batuk kering akibat Kaptopril menggunakan Algoritma Naranjo dan isi Form Kuning MESO.",
      "Rekomendasikan konsultasi ke dokter untuk peralihan Kaptopril (ACEi) ke golongan ARB."
    ],
    competencies: "Pengumpulan Data, Penetapan Masalah, Penyelesaian Masalah, Komunikasi Efektif",
    npcDialogs: [
      { q: "Gali riwayat batuk kering pasien untuk penilaian Algoritma Naranjo", a: "Batuk kering muncul 5 hari setelah mulai minum Kaptopril, tanpa demam. Saya belum pernah menyuntikkan insulin pen ini sebelumnya." },
      { q: "Edukasi cara penyimpanan insulin pen sebelum dan sesudah dibuka", a: "Baik Bu/Pak Apoteker, jadi pen yang belum dipakai disimpan di kulkas (2–8°C), sedangkan yang sedang dipakai disimpan di suhu ruang maksimal 28 hari ya." }
    ],
    labData: "Efek Samping Obat: Batuk kering persisten akibat akumulasi bradikinin oleh Kaptopril (Skor Naranjo = 7 / Probable). BUD Pen saat digunakan = 28 hari suhu ruang.",
    decisionQuestion: "Manakah paket tindakan KIE dan MESO yang lengkap dan tepat untuk Ny. Ratna?",
    options: [
      { text: "Mendemonstrasikan teknik suntik subkutan & penyimpanan insulin (BUD 28 hari suhu ruang), mencatat ESO batuk Kaptopril pada Form MESO, dan menyarankan penggantian ke ARB kepada dokter", correct: true },
      { text: "Menyuruh pasien menyimpan insulin yang sedang dipakai di dalam freezer (-15°C)", correct: false },
      { text: "Memberikan obat batuk kodein tanpa mengevaluasi penggunaan Kaptopril", correct: false }
    ],
    checklist: [
      { id: "c9_1", label: "Edukasi teknik pen insulin lengkap (pasang jarum, prime, cubit, tahan 10 detik)", weight: 35, critical: true, domain: "Komunikasi Efektif" },
      { id: "c9_2", label: "Edukasi penyimpanan: pen aktif suhu ruang < 28 hari, cadangan 2-8 C", weight: 25, critical: false, domain: "Penyelesaian Masalah" },
      { id: "c9_3", label: "Identifikasi batuk Kaptopril via Naranjo & rekomendasi ganti ARB", weight: 30, critical: true, domain: "Penetapan Masalah" },
      { id: "c9_4", label: "Pengisian Form Kuning MESO BPOM secara lengkap", weight: 10, critical: false, domain: "Pencatatan & Pelaporan" }
    ],
    pembahasan: "Insulin pen yang sedang dipakai disimpan di suhu ruang maksimal 28 hari; batuk kering Kaptopril dicatat di Form Kuning MESO dan disarankan beralih ke ARB."
  },
  {
    stationNo: 10,
    code: "STATION 10",
    area: "Station Istirahat (Rest Station)",
    title: "Station Istirahat (Tanpa Soal Ujian)",
    type: "Ruang Jeda Resmi (1 Putaran Waktu)",
    npcName: "Pengawas Ruangan Istirahat",
    npcRole: "Tidak Ada Penilaian di Station Ini",
    labObjectTitle: "Kursi Sofa Istirahat & Air Mineral",
    doorShortInstruction: "STATION ISTIRAHAT RESMI. DUDUK BERISTIRAHAT DENGAN TERTIB SAMPAI SINYAL BEL ROTASI BERIKUTNYA BERBUNYI.",
    scenario: "Selamat! Anda berada di Station Istirahat (1 dari 10 station dalam cetak biru UKMPPAI OSCE). Di station ini tidak terdapat soal ujian. Gunakan waktu ini untuk menenangkan pikiran.",
    tasks: [
      "Duduk beristirahat dan mengatur pernapasan.",
      "Menjaga ketenangan dan tidak berkomunikasi dengan peserta lain.",
      "Menunggu sinyal bel untuk melanjutkan rotasi."
    ],
    competencies: "Sikap dan Perilaku Profesional (Ketertiban Ujian)",
    npcDialogs: [
      { q: "Sapa pengawas ruang istirahat", a: "Silakan beristirahat dengan tenang. Anda telah bekerja dengan baik, tetap fokus untuk station selanjutnya." }
    ],
    labData: "Station Istirahat: Sesuai Blueprint UKAI OSCE, 1 putaran terdiri dari 9 station soal dan 1 station istirahat (total 10 station).",
    decisionQuestion: "Konfirmasi kesiapan Anda di Station Istirahat:",
    // Stasiun 10 tidak punya soal ujian (options kosong)
    options: [],
    checklist: [],
    pembahasan: ""
  }
];

// Salin dasar Koridor A ke Koridor B
const QUESTION_BANK_KOR_B = JSON.parse(JSON.stringify(QUESTION_BANK_KOR_A));

// STASIUN 1 KORIDOR B (Data dari DEFAULT_STATIONS_WING_B[0])
// Checklist dan Pembahasan TIDAK ADA di data asli -> Beri tanda TODO_DOSEN
QUESTION_BANK_KOR_B[0] = {
  stationNo: 1,
  code: "STATION 01",
  area: "Pembuatan 1 (R&D)",
  title: "R&D Sediaan Suspensi Antasida (Suspending Agent & Viskositas)",
  type: "Analisis & Rekomendasi Teknis",
  npcName: "Manager R&D Formulasi Suspensi",
  npcRole: "Penguji Station R&D Koridor B",
  labObjectTitle: "Viskometer Brookfield, Gelas Ukur Sedimentasi & Suspensi Antasida",
  doorShortInstruction: "EVALUASI LAJU ENDAP & FLOKULASI SUSPENSI ANTASIDA. HITUNG KONSENTRASI SUSPENDING AGENT PGS & XANTHAN GUM.",
  scenario: "Anda adalah Apoteker R&D yang merancang formula suspensi antasida (Alumunium Hidroksida & Magnesium Hidroksida). Formula mengalami caking keras yang sulit diredispersi.",
  tasks: [
    "Evaluasi tipe suspensi (flokulasi vs deflokulasi) berdasarkan volume sedimentasi (F).",
    "Pilih suspending agent dan zat pembasah yang tepat untuk mencegah caking.",
    "Tetapkan rekomendasi formulasi ulang suspensi antasida."
  ],
  competencies: "Penetapan Masalah, Penyelesaian Masalah, Sikap Profesional",
  npcDialogs: [
    { q: "Tanyakan nilai volume sedimentasi formula saat ini", a: "Nilai F = 0.1 setelah 24 jam dengan endapan sangat kompak di dasar botol." }
  ],
  labData: "Data Formula: Al(OH)3 200 mg/5ml, Mg(OH)2 200 mg/5ml. Mengalami caking pada uji freeze-thaw.",
  decisionQuestion: "Sistem suspensi apa dan kombinasi pensuspensi yang paling tepat untuk mencegah caking?",
  options: [
    { text: "Membentuk suspensi terflokulasi dengan penambahan suspending agent Xanthan Gum 0.2% dan elektrolit KH2PO4", correct: true },
    { text: "Membentuk suspensi deflokulasi murni tanpa agen pembasah", correct: false },
    { text: "Menaikkan kadar gliserin hingga 40% tanpa bahan pensuspensi", correct: false }
  ],
  checklist: "TODO_DOSEN",
  pembahasan: "TODO_DOSEN"
};

// STASIUN 2 KORIDOR B (Data dari DEFAULT_STATIONS_WING_B[1])
QUESTION_BANK_KOR_B[1] = {
  stationNo: 2,
  code: "STATION 02",
  area: "Pembuatan 2 (Produksi)",
  title: "Manufaktur Kapsul Keras & Uji Keseragaman Bobot (IPC)",
  type: "Penetapan Parameter Kritis IPC",
  npcName: "Supervisor Produksi Kapsul Keras",
  npcRole: "Penguji Station Produksi Koridor B",
  labObjectTitle: "Mesin Otomatis Dosator Kapsul & Timbangan Analitik",
  doorShortInstruction: "ANALISIS PENYEBAB KERAGAMAN BOBOT KAPSUL CEFADROXIL PADA MESIN FILLING OTOMATIS.",
  scenario: "Pada proses pengisian kapsul Cefadroxil 500 mg pada mesin otomatis kecepatan tinggi, ditemukan variasi keragaman bobot melebihi batas penerimaan Farmakope.",
  tasks: [
    "Identifikasi akar masalah variasi bobot pada dosator kapsul otomatis.",
    "Lakukan optimasi parameter mekanik mesin dan sifat alir massa serbuk.",
    "Tetapkan batas kendali IPC keragaman bobot kapsul keras."
  ],
  competencies: "Penyelesaian Masalah, Pencatatan & Pelaporan, Sikap Profesional",
  npcDialogs: [
    { q: "Tanyakan parameter dosator mesin kapsul saat ini", a: "Kedalaman tamping pin belum dikalibrasi pasca penggantian punch, dan serbuk menunjukkan sifat alir sukar mengalir (Indeks Carr 28%)." }
  ],
  labData: "Data IPC Kapsul: Bobot rata-rata 580 mg, standar deviasi 38 mg (%RSD = 6.5%, syarat Farmakope %RSD < 2.0%).",
  decisionQuestion: "Langkah optimalisasi mesin pengisi kapsul (dosator) untuk mengatasi variasi bobot adalah:",
  options: [
    { text: "Kalibrasi tinggi tamping pin dosator, perbaiki sifat alir serbuk dengan glidan aerosil 0.5%, dan kontrol kelembapan ruang < 40%", correct: true },
    { text: "Menaikkan kecepatan putar mesin tanpa memeriksa kompaktibilitas serbuk", correct: false },
    { text: "Mengganti ukuran cangkang kapsul dari 0 ke nomor 3 tanpa reformulasi", correct: false }
  ],
  checklist: "TODO_DOSEN",
  pembahasan: "TODO_DOSEN"
};

// STASIUN 3 KORIDOR B (Data dari DEFAULT_STATIONS_WING_B[2])
QUESTION_BANK_KOR_B[2] = {
  stationNo: 3,
  code: "STATION 03",
  area: "Pembuatan 3 (QC / QA)",
  title: "QC Spektrofotometri UV-Vis & Uji Disolusi Terbanding (F2)",
  type: "Interpretasi Kromatogram & Keputusan Rilis",
  npcName: "Apoteker Pengujian Bioekivalensi In Vitro",
  npcRole: "Penguji Station QC Koridor B",
  labObjectTitle: "Dissolution Tester USP Tipe 2 & Spektrofotometer UV-Vis",
  doorShortInstruction: "HITUNG NILAI FAKTOR KEMIRIPAN (F2) PADA UJI DISOLUSI TERBANDING TABLET FUROSEMID.",
  scenario: "Sebagai Apoteker QC, Anda mengevaluasi profil disolusi terbanding tablet Furosemid 40 mg produk kopi terhadap obat inovator pada media pH 1.2, 4.5, dan 6.8.",
  tasks: [
    "Kumpulkan profil persen terdisolusi tablet uji dan inovator pada menit 10, 15, 30, 45, dan 60.",
    "Hitung nilai faktor kemiripan (f2) profil disolusi terbanding.",
    "Tentukan kesimpulan apakah produk kopi ekivalen secara in vitro dengan inovator."
  ],
  competencies: "Pengumpulan Data, Penetapan Masalah, Penyelesaian Masalah",
  npcDialogs: [
    { q: "Tanyakan hasil kalkulasi faktor kemiripan f2 pada pH 6.8", a: "Perhitungan matematis menghasilkan f2 = 64.2 dengan perbedaan persentase terdisolusi < 10% di setiap titik waktu." }
  ],
  labData: "Data Disolusi pH 6.8: Menit 15 (Inovator 68%, Kopi 65%), Menit 30 (Inovator 85%, Kopi 82%), Menit 45 (Inovator 96%, Kopi 94%). Nilai f2 = 64.2.",
  decisionQuestion: "Berapa kesimpulan nilai f2 jika profil pelepasan obat uji mendekati obat inovator (f2 = 64.2)?",
  options: [
    { text: "Nilai f2 = 64.2 (> 50), profil disolusi dinyatakan ekivalen / bioekivalen secara in vitro terhadap inovator", correct: true },
    { text: "Nilai f2 = 64.2 dinyatakan gagal karena nilai f2 harus di bawah 40", correct: false },
    { text: "Uji harus diulang karena Farmakope mensyaratkan f2 harus tepat 100", correct: false }
  ],
  checklist: "TODO_DOSEN",
  pembahasan: "TODO_DOSEN"
};

const MASTER_QUESTION_BANKS = {
  "KOR-A": QUESTION_BANK_KOR_A,
  "KOR-B": QUESTION_BANK_KOR_B
};

// =========================================================================
// VALIDASI STRUKTUR BANK SOAL SAAT STARTUP
// - Tiap koridor punya Stasiun 1-9 lengkap
// - Tiap soal stasiun 1-9 punya tepat SATU opsi benar
// - Stasiun 10 tidak punya soal (options kosong)
// Server gagal start dengan pesan jelas jika ada yang salah.
// =========================================================================
function validateQuestionBank() {
  const corridors = ["KOR-A", "KOR-B"];
  for (const c of corridors) {
    const bank = MASTER_QUESTION_BANKS[c];
    if (!bank || !Array.isArray(bank)) {
      throw new Error(`[VALIDASI BANK SOAL GAGAL] Koridor ${c} tidak terdefinisi.`);
    }

    for (let s = 1; s <= 9; s++) {
      const st = bank.find((item) => item.stationNo === s);
      if (!st) {
        throw new Error(`[VALIDASI BANK SOAL GAGAL] Koridor ${c} Stasiun ${s} tidak ditemukan.`);
      }
      if (!Array.isArray(st.options) || st.options.length === 0) {
        throw new Error(`[VALIDASI BANK SOAL GAGAL] Koridor ${c} Stasiun ${s} tidak memiliki opsi jawaban.`);
      }
      const correctCount = st.options.filter((o) => o.correct === true).length;
      if (correctCount !== 1) {
        throw new Error(
          `[VALIDASI BANK SOAL GAGAL] Koridor ${c} Stasiun ${s} harus memiliki tepat 1 opsi benar, tetapi ditemukan ${correctCount}.`
        );
      }
    }

    const st10 = bank.find((item) => item.stationNo === 10);
    if (!st10) {
      throw new Error(`[VALIDASI BANK SOAL GAGAL] Koridor ${c} Stasiun 10 tidak ditemukan.`);
    }
    if (Array.isArray(st10.options) && st10.options.length > 0) {
      throw new Error(
        `[VALIDASI BANK SOAL GAGAL] Koridor ${c} Stasiun 10 adalah stasiun istirahat dan TIDAK BOLEH memiliki soal/opsi.`
      );
    }
  }
}

// Jalankan validasi struktur bank soal
validateQuestionBank();

// =========================================================================
// FUNGSI AKSES INTERNAL: getBank & getAnswerKey
// =========================================================================
function getBank(corridorCode, stationNo) {
  const c = String(corridorCode || "KOR-A").toUpperCase() === "KOR-B" ? "KOR-B" : "KOR-A";
  const num = Number(stationNo);
  const bank = MASTER_QUESTION_BANKS[c];
  return bank.find((st) => st.stationNo === num) || null;
}

function getAnswerKey(corridorCode, stationNo) {
  const st = getBank(corridorCode, stationNo);
  if (!st || !Array.isArray(st.options)) return null;
  const correctIdx = st.options.findIndex((o) => o.correct === true);
  if (correctIdx === -1) return null;
  return {
    correctIndex: correctIdx,
    correctOption: st.options[correctIdx],
    pembahasan: st.pembahasan,
    checklist: st.checklist
  };
}

module.exports = {
  QUESTION_BANK_KOR_A,
  QUESTION_BANK_KOR_B,
  MASTER_QUESTION_BANKS,
  validateQuestionBank,
  getBank,
  getAnswerKey
};
