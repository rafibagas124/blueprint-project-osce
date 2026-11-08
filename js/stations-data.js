// =========================================================================
// DATA 10 STATION STANDAR UKMPPAI OSCE APOTEKER (FASE 3D-2: BERSIH DARI KUNCI)
// Memuat metadata untuk rendering adegan 3D, NPC interaktif, dan simulasi lab.
// Soal keputusan, pilihan jawaban, kunci, dan rubrik penilaian telah dipindahkan
// secara otoritatif ke sisi server (src/data/question-bank.js).
// =========================================================================

const DEFAULT_STATIONS = [
  {
    id: 1,
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
    decisionQuestion: "Berapa proporsi Tween 80 dan Span 80 yang harus Anda tetapkan untuk mencapai HLB butuh 12.0?"
  },
  {
    id: 2,
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
    decisionQuestion: "Langkah koreksi teknis utama yang harus Anda rekomendasikan sebagai Apoteker Produksi adalah:"
  },
  {
    id: 3,
    code: "STATION 03",
    area: "Pembuatan 3 (QC / QA)",
    title: "Pengujian Mutu Sediaan (HPLC & Spektrofotometri)",
    type: "Interpretasi Kromatogram & Keputusan Rilis",
    npcName: "Analis Pengujian Laboratorium QC",
    npcRole: "Penguji Station QC/QA",
    labObjectTitle: "Sistem KCKT / HPLC & Baku Pembanding",
    doorShortInstruction: "HITUNG KADAR ZAT AKTIF TABLET DARI KROMATOGRAM HPLC. TETAPKAN KEPUTUSAN RELEASE / REJECT BETS SESUAI FARMAKOPE.",
    scenario: "Anda menerima lembar kromatogram HPLC pengujian kadar Amoksisilin Trihidrat dari tablet 500 mg bets komersial nomor B240801.",
    tasks: [
      "Periksa kesesuaian sistem KCKT (resolusi, faktor ikutan tailing, dan %RSD waktu retensi).",
      "Hitung persentase kadar zat aktif terhadap klaim etiket menggunakan persamaan kalibrasi.",
      "Tentukan keputusan rilis QA apakah bets memenuhi spesifikasi Farmakope Indonesia VI (90.0% – 110.0%)."
    ],
    competencies: "Pengumpulan Data, Penetapan Masalah, Pencatatan & Pelaporan",
    npcDialogs: [
      { q: "Tanyakan parameter kesesuaian sistem HPLC", a: "Resolusi puncak Amoksisilin dengan senyawa sejenis = 2.4, Tailing factor = 1.1, %RSD area standar (n=5) = 0.8%." },
      { q: "Konfirmasi pengenceran sampel", a: "10 tablet ditimbang seksama (bobot rata-rata 650 mg), diserbukkan setara 50 mg zat aktif, dilarutkan dalam labu takar 100 ml, disaring 0.45 um." }
    ],
    labData: "Luas Area Sampel = 845.210 uAU*s. Luas Area Standar Amoksisilin 500 ppm = 824.600 uAU*s. Bobot rata-rata tablet = 650.0 mg. Serbuk yang ditimbang = 65.0 mg.",
    decisionQuestion: "Berapa kadar Amoksisilin per tablet dan bagaimana keputusan Apoteker QA?"
  },
  {
    id: 4,
    code: "STATION 04",
    area: "Pengelolaan 1 (Seleksi & Pengadaan)",
    title: "Analisis ABC-VEN & Perhitungan Buffer Stock",
    type: "Analisis Data Logistik Farmasi",
    npcName: "Kepala Instalasi Farmasi Rumah Sakit",
    npcRole: "Penguji Station Logistik",
    labObjectTitle: "Formularium RS & Data Konsumsi Obat",
    doorShortInstruction: "LAKUKAN MATRIKS ABC-VEN PADA ANGGARAN OBAT RS. PRIORITASKAN PENGADAAN OBAT KELOMPOK VA & ESTIMASI SAFETY STOCK.",
    scenario: "RS mengalokasikan anggaran Rp 1.2 Miliar, namun total pengajuan mencapai Rp 1.5 Miliar (defisit Rp 300 Juta). Anda harus memangkas anggaran tanpa mengganggu pelayanan darurat.",
    tasks: [
      "Kelompokkan obat ke dalam matriks kombinasi ABC (Investasi) dan VEN (Kritikalitas).",
      "Tentukan item obat yang tidak boleh dipangkas sama sekali (Kelompok VA, VB, EA).",
      "Pangkas item non-esensial (NC) dan negosiasikan sistem konsinyasi."
    ],
    competencies: "Penyelesaian Masalah, Pengumpulan Data, Sikap Profesional",
    npcDialogs: [
      { q: "Minta rekapitulasi data konsumsi dan anggaran", a: "Daftar konsumsi 50 item obat prioritas dan nilai investasinya telah tersaji di layar komputer station." },
      { q: "Konfirmasi ketersediaan obat alternatif di formularium", a: "Untuk suplemen vitamin C injeksi dan albumin 20% tersedia alternatif terapi oral dan donor plasma." }
    ],
    labData: "Kelompok VA: Epinefrin Injeksi, Insulin Reguler, Oksitosin Injeksi (Total Rp 450 Juta). Kelompok NC: Multivitamin Injeksi, Suplemen Enzim (Total Rp 320 Juta).",
    decisionQuestion: "Manakah strategi rasionalisasi anggaran pengadaan yang paling tepat dan aman bagi pasien?"
  },
  {
    id: 5,
    code: "STATION 05",
    area: "Pengelolaan 2 (Penyimpanan & Distribusi)",
    title: "Suhu Cold Chain, High Alert Medication & LASA",
    type: "Inspeksi Kepatuhan CDOB / GSP",
    npcName: "Inspektur Mutu / Auditor Eksternal",
    npcRole: "Penguji Station CDOB",
    labObjectTitle: "Kulkas Suhu Terkontrol (2-8C) & Lemari Narkotika",
    doorShortInstruction: "AUDIT KEPATUHAN PENYIMPANAN OBAT VAKSIN & HIGH-ALERT. PERIKSA LOG SUHU, LABEL LASA, DAN PENATAAN FIFO/FEFO.",
    scenario: "Pada inspeksi berkala di gudang farmasi, ditemukan chiller vaksin berada pada suhu 11.2°C selama 4 jam akibat pemadaman listrik darurat.",
    tasks: [
      "Periksa status indikator Vaccine Vial Monitor (VVM) dan Freeze-Tag vaksin Hepatitis B dan Polio.",
      "Identifikasi penataan obat High Alert (Elektrolit Konsentrat KCl 7.46%) dan obat LASA (Look-Alike Sound-Alike).",
      "Buat Berita Acara Karantina dan tindakan perbaikan (CAPA)."
    ],
    competencies: "Penetapan Masalah, Penyelesaian Masalah, Sikap Profesional",
    npcDialogs: [
      { q: "Tanyakan pembacaan data logger chiller vaksin", a: "Data logger menunjukkan suhu naik bertahap dari 4.5°C ke 11.2°C selama 4 jam 15 menit." },
      { q: "Periksa lokasi penyimpanan KCl 7.46% di ruang rawat", a: "Ditemukan 5 vial KCl 7.46% tersimpan di rak terbuka bersama Natrium Klorida 0.9% tanpa label High Alert." }
    ],
    labData: "VVM Vaksin Polio: Kotak bagian dalam masih lebih terang dari lingkaran luar (Tahap 2: Boleh digunakan segera). VVM Vaksin Hepatitis B: Kotak sama gelap dengan lingkaran (Tahap 3: Jangan digunakan!).",
    decisionQuestion: "Tindakan Apoteker yang paling tepat sesuai pedoman CDOB/Kemenkes adalah:"
  },
  {
    id: 6,
    code: "STATION 06",
    area: "Pelayanan 1 (Skrining Resep)",
    title: "Skrining Administratif, Farmasetik & Klinis",
    type: "Verifikasi Resep & DRP (Drug Related Problems)",
    npcName: "Dokter Spesialis Penyakit Dalam (Sp.PD)",
    npcRole: "Kolaborator Interprofesional",
    labObjectTitle: "Lembar Resep Poliklinik & Rekam Medis",
    doorShortInstruction: "SKRINING RESEP PASIEN LANSIA DENGAN INTERAKSI OBAT MAYOR (WARFARIN + SIMVASTATIN). HUBUNGI DOKTER PENULIS RESEP.",
    scenario: "Pasien Tn. Anwar (68 tahun, BB 60 kg) membawa resep pasca-rawat: R/ Warfarin 5 mg tab No. XXX (S 1 dd 1 tab malam), R/ Simvastatin 40 mg No. XXX (S 0-0-1), R/ Asam Mefenamat 500 mg No. XV (S 3 dd 1 tab prn).",
    tasks: [
      "Identifikasi interaksi obat mayor antara Warfarin dan Asam Mefenamat (risiko pendarahan gastrointestinal hebat).",
      "Lakukan konfirmasi telepon ke dokter penulis resep dengan teknik komunikasi SBAR.",
      "Rekomendasikan analgetik alternatif yang aman bagi pasien yang mengonsumsi antikoagulan."
    ],
    competencies: "Pengumpulan Data, Penetapan Masalah, Komunikasi Efektif, Sikap Profesional",
    npcDialogs: [
      { q: "Hubungi dokter via telepon: sampaikan identitas diri dan tujuan konfirmasi", a: "Halo Apoteker, iya saya dr. Bambang Sp.PD. Ada masalah apa dengan resep Tn. Anwar?" },
      { q: "Sampaikan rekomendasi penggantian obat analgetik", a: "Terima kasih infonya, saya setuju Asam Mefenamat diganti Parasetamol saja dosis rendah jika nyeri." }
    ],
    labData: "Data Lab Tn. Anwar: Nilai INR saat ini = 2.6 (Target terapeutik: 2.0–3.0). Riwayat: Ulkus peptikum 2 tahun lalu.",
    decisionQuestion: "Rekomendasi klinis yang wajib Anda berikan kepada dokter adalah:"
  },
  {
    id: 7,
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
    decisionQuestion: "Obat batuk dan anjuran manakah yang paling rasional untuk Ibu Maya?"
  },
  {
    id: 8,
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
    decisionQuestion: "Berapa jumlah tablet Parasetamol 500 mg yang diambil dan berapa BUD maksimal puyer tersebut?"
  },
  {
    id: 9,
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
      { q: "Gali riwayat batuk kering pasien untuk penilaian Algoritma Naranjo", a: "Batuk kering tanpa dahak ini muncul 5 hari sejak saya rutin minum obat tensi Kaptopril 25 mg." },
      { q: "Edukasi cara penyimpanan insulin pen sebelum dan sesudah dibuka", a: "Baik Bu/Pak Apoteker, jadi pen yang belum dipakai disimpan di kulkas (2–8°C), sedangkan yang sedang dipakai disimpan di suhu ruang maksimal 28 hari ya." }
    ],
    labData: "Efek Samping Obat: Batuk kering persisten akibat akumulasi bradikinin oleh Kaptopril (Skor Naranjo = 7 / Probable). BUD Pen saat digunakan = 28 hari suhu ruang.",
    decisionQuestion: "Manakah paket tindakan KIE dan MESO yang lengkap dan tepat untuk Ny. Ratna?"
  },
  {
    id: 10,
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
    decisionQuestion: "Konfirmasi kesiapan Anda di Station Istirahat:"
  }
];

// =========================================================================
// AI PERSONA & VARIAN STATION (UNTUK ADEGAN 3D & DIALOG NPC)
// =========================================================================
const STATION_ENRICHMENTS = [
  { // Station 1
    aiPersona: {
      emotion: "Tegas & Analitis",
      greeting: "Selamat pagi Apoteker. Emulsi minyak ikan bets percobaan mengalami creaming. Silakan tanyakan data uji stabilitas atau laporkan perhitungan HLB Anda.",
      hiddenFacts: [
        { keywords: ["sentrifugasi", "stabilitas", "pisah", "creaming", "rpm"], fact: "Pemisahan fase terjadi setelah sentrifugasi 3.000 rpm selama 30 menit karena HLB surfaktan sebelumnya hanya 8.5.", points: 10 },
        { keywords: ["organoleptik", "viskositas", "rasa", "anak", "target"], fact: "Target viskositas adalah 150–250 cP dengan tipe O/W rasa jeruk manis.", points: 10 }
      ]
    },
    variants: [
      { variantCode: "VAR-A", targetHLB: 12.0, totalEmul: 5.0 },
      { variantCode: "VAR-B", targetHLB: 12.0, totalEmul: 5.0 }
    ]
  },
  { // Station 2
    aiPersona: {
      emotion: "Khawatir (Target Produksi Mendesak)",
      greeting: "Apoteker, mesin cetak rotary sedang dihentikan sementara karena 14% tablet Parasetamol mengalami capping. Apa yang perlu Anda periksa?",
      hiddenFacts: [
        { keywords: ["lod", "kadar air", "kering", "kelembapan", "granul"], fact: "Hasil LOD granul hanya 0.4%, jauh di bawah spesifikasi 1.5–2.5% sehingga daya ikat antar-granul lemah.", points: 10 },
        { keywords: ["kecepatan", "rpm", "kompresi", "pra", "udara"], fact: "Mesin dipacu pada 55 rpm dan pre-compression force = 0 kN sehingga udara terjebak di dalam die.", points: 10 }
      ]
    }
  },
  { // Station 3
    aiPersona: {
      emotion: "Teliti & Kooperatif",
      greeting: "Halo Apoteker QA, injeksi sampel Amoksisilin bets B240801 sudah selesai di HPLC. Silakan periksa kesesuaian sistem dan integrasikan puncaknya.",
      hiddenFacts: [
        { keywords: ["resolusi", "tailing", "rsd", "kesesuaian", "sistem"], fact: "Resolusi puncak = 2.4, Tailing factor = 1.1, dan %RSD 5 kali injeksi standar = 0.8% (Memenuhi Syarat).", points: 10 },
        { keywords: ["pengenceran", "bobot", "sampel", "standar", "area"], fact: "Luas area sampel 845.210 uAU*s dibanding standar 500 ppm sebesar 824.600 uAU*s.", points: 10 }
      ]
    }
  },
  { // Station 4
    aiPersona: {
      emotion: "Serius (Defisit Anggaran Rp 300 Juta)",
      greeting: "Apoteker, direksi meminta kita memangkas pengajuan anggaran obat sebesar Rp 300 Juta hari ini tanpa menyebabkan kekosongan obat emergensi.",
      hiddenFacts: [
        { keywords: ["konsumsi", "anggaran", "data", "investasi", "abc"], fact: "Kelompok VA (Epinefrin, Insulin, Oksitosin) menyerap Rp 450 Juta, sedangkan kelompok NC (Multivitamin & Suplemen Enzim) mencapai Rp 320 Juta.", points: 10 },
        { keywords: ["alternatif", "formularium", "konsinyasi", "pengganti"], fact: "Tersedia multivitamin oral generik sehingga injeksi vitamin non-esensial (NC) aman untuk diefisiensikan.", points: 10 }
      ]
    }
  },
  { // Station 5
    aiPersona: {
      emotion: "Kritis & Objektif (Auditor CDOB)",
      greeting: "Saya menemukan suhu chiller vaksin sempat menyentuh 11.2°C dan ada vial KCl pekat di rak terbuka. Jelaskan tindakan korektif Anda!",
      hiddenFacts: [
        { keywords: ["logger", "suhu", "jam", "listrik", "vvm"], fact: "VVM Vaksin Hepatitis B sudah berubah sama gelap dengan lingkaran luar (Tahap 3 / rusak), sedangkan Vaksin Polio masih Tahap 2.", points: 10 },
        { keywords: ["kcl", "high alert", "kalium", "lasa", "lemari"], fact: "5 vial KCl 7.46% ditemukan bercampur dengan NaCl 0.9% tanpa stiker merah High Alert.", points: 10 }
      ]
    }
  },
  { // Station 6
    aiPersona: {
      emotion: "Sibuk namun Terbuka terhadap Bukti Klinis",
      greeting: "Halo Apoteker, saya dr. Bambang Sp.PD. Ada yang perlu dikonfirmasi terkait resep pasien saya, Tn. Anwar?",
      hiddenFacts: [
        { keywords: ["sbar", "interaksi", "warfarin", "mefenamat", "pendarahan", "perdarahan", "inr"], fact: "Benar Apoteker, nilai INR Tn. Anwar 2.6 dan beliau punya riwayat tukak lambung 2 tahun lalu.", points: 10 },
        { keywords: ["parasetamol", "ganti", "rekomendasi", "alternatif"], fact: "Saya setuju Asam Mefenamat dihentikan dan diganti Parasetamol 500 mg bila nyeri saja.", points: 10 }
      ]
    }
  },
  { // Station 7
    aiPersona: {
      emotion: "Cemas & Ingin Cepat Sembuh",
      greeting: "Selamat siang Apoteker, saya mau beli obat batuk yang paling ampuh dong, tenggorokan saya gatal dan batuk terus.",
      hiddenFacts: [
        { keywords: ["siapa", "gejala", "dahak", "kering", "lama", "berapa hari"], fact: "Obatnya untuk saya sendiri, batuknya berdahak kental sudah 3 hari, tidak ada demam.", points: 10 },
        { keywords: ["hamil", "menyusui", "kondisi", "bayi", "obat lain"], fact: "Oh iya Apoteker, saya sedang menyusui bayi saya yang baru berusia 3 bulan. Belum minum obat apa-apa.", points: 15 }
      ]
    }
  },
  { // Station 8
    aiPersona: {
      emotion: "Tenang & Mengamati (Penguji Compounding)",
      greeting: "Silakan lakukan perhitungan kebutuhan tablet untuk resep puyer DTD ini, timbang di timbangan virtual, dan tetapkan BUD-nya.",
      hiddenFacts: [
        { keywords: ["ed", "kedaluwarsa", "expired", "botol", "pabrik"], fact: "Tanggal kedaluwarsa tablet Parasetamol 500 mg pada wadah asli masih 24 bulan lagi.", points: 10 },
        { keywords: ["etiket", "perkamen", "bud", "simpan"], fact: "Gunakan etiket putih untuk sediaan oral dan hitung 25% dari sisa ED atau maksimal 180 hari.", points: 10 }
      ]
    }
  },
  { // Station 9
    aiPersona: {
      emotion: "Bingung & Batuk Kering Sesekali",
      greeting: "Uhuk.. Permisi Apoteker, saya baru pertama kali dapat resep suntikan pen insulin ini, saya takut salah pakai. Terus kenapa ya saya batuk kering terus?",
      hiddenFacts: [
        { keywords: ["kaptopril", "tensi", "batuk", "kapan", "mulai", "naranjo"], fact: "Batuk kering tanpa dahak ini muncul 5 hari sejak saya rutin minum obat tensi Kaptopril 25 mg.", points: 10 },
        { keywords: ["simpan", "kulkas", "suhu ruang", "jarum", "suntik"], fact: "Saya belum tahu cara pasang jarum dan apakah pen yang sedang dipakai harus masuk kulkas atau suhu ruang.", points: 10 }
      ]
    }
  },
  { // Station 10
    aiPersona: {
      emotion: "Ramah",
      greeting: "Silakan duduk beristirahat dengan tenang sambil menunggu bel rotasi berikutnya.",
      hiddenFacts: []
    }
  }
];

DEFAULT_STATIONS.forEach((st, idx) => {
  const enrich = STATION_ENRICHMENTS[idx] || {};
  st.aiPersona = enrich.aiPersona || { emotion: "Netral", greeting: "Silakan mulai.", hiddenFacts: [] };
  st.variants = enrich.variants || [];
});

// =========================================================================
// METADATA ALTERNATIF KORIDOR B (WING 1)
// =========================================================================
const DEFAULT_STATIONS_WING_B = JSON.parse(JSON.stringify(DEFAULT_STATIONS));

if (DEFAULT_STATIONS_WING_B[0]) {
  DEFAULT_STATIONS_WING_B[0].title = "R&D Sediaan Suspensi Antasida (Suspending Agent & Viskositas)";
  DEFAULT_STATIONS_WING_B[0].doorShortInstruction = "EVALUASI LAJU ENDAP & FLOKULASI SUSPENSI ANTASIDA. HITUNG KONSENTRASI SUSPENDING AGENT PGS & XANTHAN GUM.";
  DEFAULT_STATIONS_WING_B[0].scenario = "Anda adalah Apoteker R&D yang merancang formula suspensi antasida (Alumunium Hidroksida & Magnesium Hidroksida). Formula mengalami caking keras yang sulit diredispersi.";
  DEFAULT_STATIONS_WING_B[0].decisionQuestion = "Sistem suspensi apa dan kombinasi pensuspensi yang paling tepat untuk mencegah caking?";
}
if (DEFAULT_STATIONS_WING_B[1]) {
  DEFAULT_STATIONS_WING_B[1].title = "Manufaktur Kapsul Keras & Uji Keseragaman Bobot (IPC)";
  DEFAULT_STATIONS_WING_B[1].doorShortInstruction = "ANALISIS PENYEBAB KERAGAMAN BOBOT KAPSUL CEFADROXIL PADA MESIN FILLING OTOMATIS.";
  DEFAULT_STATIONS_WING_B[1].decisionQuestion = "Langkah optimalisasi mesin pengisi kapsul (dosator) untuk mengatasi variasi bobot adalah:";
}
if (DEFAULT_STATIONS_WING_B[2]) {
  DEFAULT_STATIONS_WING_B[2].title = "QC Spektrofotometri UV-Vis & Uji Disolusi Terbanding (F2)";
  DEFAULT_STATIONS_WING_B[2].doorShortInstruction = "HITUNG NILAI FAKTOR KEMIRIPAN (F2) PADA UJI DISOLUSI TERBANDING TABLET FUROSEMID.";
  DEFAULT_STATIONS_WING_B[2].decisionQuestion = "Berapa kesimpulan nilai f2 jika profil pelepasan obat uji mendekati obat inovator (f2 = 64.2)?";
}

// Bank Metadata per Koridor (Wing 0 = Koridor A, Wing 1 = Koridor B)
const STATIONS_WINGS = {
  0: JSON.parse(JSON.stringify(DEFAULT_STATIONS)),
  1: JSON.parse(JSON.stringify(DEFAULT_STATIONS_WING_B))
};

let STATIONS = JSON.parse(JSON.stringify(DEFAULT_STATIONS));

function syncActiveStations(wing = 0) {
  const targetWing = (wing === 1) ? 1 : 0;
  const currentSet = STATIONS_WINGS[targetWing] || STATIONS_WINGS[0];
  for (let i = 0; i < currentSet.length; i++) {
    STATIONS[i] = JSON.parse(JSON.stringify(currentSet[i]));
  }
  return STATIONS;
}

function getStationData(wing, stationIdx) {
  const w = (wing === 1) ? 1 : 0;
  return STATIONS_WINGS[w]?.[stationIdx] || STATIONS[stationIdx];
}

function loadCustomStationData() {
  const curWing = (typeof state !== "undefined" && state.wing === 1) ? 1 : 0;
  syncActiveStations(curWing);
  return STATIONS;
}

function saveCustomStationData(stationIdx, updatedData, wing = 0) {
  if (stationIdx < 0 || stationIdx >= 10) return false;
  const targetWing = (wing === 1) ? 1 : 0;
  if (!STATIONS_WINGS[targetWing]) STATIONS_WINGS[targetWing] = JSON.parse(JSON.stringify(DEFAULT_STATIONS));
  STATIONS_WINGS[targetWing][stationIdx] = { ...STATIONS_WINGS[targetWing][stationIdx], ...updatedData };
  const curWing = (typeof state !== "undefined" && state.wing === 1) ? 1 : 0;
  if (curWing === targetWing) {
    syncActiveStations(curWing);
  }
  return true;
}

function resetStationsToDefault() {
  STATIONS_WINGS[0] = JSON.parse(JSON.stringify(DEFAULT_STATIONS));
  STATIONS_WINGS[1] = JSON.parse(JSON.stringify(DEFAULT_STATIONS_WING_B));
  syncActiveStations(0);
  return STATIONS;
}

// Inisialisasi awal
loadCustomStationData();
