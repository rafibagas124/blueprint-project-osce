"use strict";

const TASKS = [
  "Perkenalkan diri, verifikasi identitas, jaga kerahasiaan, dan minta informed consent verbal.",
  "Lakukan anamnesis Sacred 7 serta riwayat penyakit, keluarga, sosial/lingkungan, obat, alergi, dan last meal bila relevan.",
  "Minta hasil tanda vital, pemeriksaan umum, dan status lokalis yang sesuai kasus.",
  "Usulkan pemeriksaan penunjang/media yang relevan dan interpretasikan hasilnya.",
  "Sampaikan diagnosis kerja dan 2-3 diagnosis banding; untuk neurologi sebutkan klinis, topis, dan etiologi.",
  "Susun tatalaksana farmakologi dalam format resep R/ dan S, serta tindakan non-farmakologi/prosedur.",
  "Berikan KIE, safety-netting, dan rujukan spesialis yang sesuai."
];

const ANAMNESIS = {
  presentIllness: [
    "Onset", "Lokasi", "Kualitas", "Kuantitas (VAS/NRS)",
    "Kronologi/MOI", "Faktor memperingan", "Faktor memperberat", "Keluhan lain"
  ],
  pastHistory: [
    "Riwayat penyakit dahulu (RPD)", "Riwayat penyakit keluarga (RPK)",
    "Riwayat sosial/lingkungan", "Riwayat obat/medikasi (RPO)",
    "Alergi", "Last meal (kasus bedah)"
  ],
  psychiatry: ["Autoanamnesis", "Heteroanamnesis", "Riwayat psikiatri", "Riwayat NAPZA"],
  obstetrics: ["Riwayat obstetri (G-P-A)", "HPHT, siklus, taksiran persalinan",
    "Riwayat KB", "Riwayat ANC"]
};

const GENERAL_EXAM = [
  "Kesadaran (CM/Koma/AVPU), TD, HR, RR, suhu, SpO2, BB/TB/LP",
  "Kepala; mata; mulut/lidah",
  "Leher: KGB, JVP, tiroid",
  "Thorax: jantung dan paru",
  "Abdomen",
  "Ekstremitas: CRT, edema, akral"
];

const INVESTIGATION_MENU = [
  "Lab: DL, UL, FL, kimia darah, fungsi tiroid, AGD, elektrolit, Gram/KOH, BTA, kultur, Troponin, ASTO, RF, IgM",
  "Media: EKG 12-Lead, Foto Thorax (CXR), X-Ray lokal (ankle/klavikula/lumbosakral), USG, CT-Scan"
];

const REFERRAL_OPTIONS = [
  "Sp.JP", "Sp.PD", "Sp.OG", "Sp.S", "Sp.B", "Sp.OT", "Sp.U",
  "Sp.BP", "Sp.Onk", "Sp.KJ", "Sp.M"
];

function makeCase(title, patientScenario, findings, investigations, treatment, options = {}) {
  return {
    title,
    patientScenario,
    findings: findings || "Belum dirinci dalam sumber spesifikasi; minta hasil pemeriksaan kepada penguji.",
    investigations: investigations || "Belum dirinci dalam sumber spesifikasi.",
    diagnosis: title,
    differentials: options.differentials || [],
    treatment: treatment || "Belum dirinci dalam sumber spesifikasi.",
    procedure: options.procedure || "Tidak ada prosedur spesifik yang dirinci dalam sumber spesifikasi.",
    kie: options.kie || "Edukasi sesuai diagnosis, tanda bahaya, kepatuhan terapi, pencegahan, dan rencana tindak lanjut.",
    referral: options.referral || "",
    psychiatricStatus: options.psychiatricStatus || null,
    tasks: TASKS,
    anamnesis: ANAMNESIS,
    generalExam: GENERAL_EXAM,
    investigationMenu: INVESTIGATION_MENU,
    prescriptionFormat: {
      heading: "R/ Nama obat • dosis • bentuk sediaan • No. Romawi",
      instruction: "S frekuensi dd takaran rute/keterangan"
    },
    rubric: {
      scale: [
        { score: 0, label: "Tidak dilakukan" },
        { score: 1, label: "Tidak sempurna" },
        { score: 2, label: "Sesuai prosedur" }
      ],
      items: TASKS.map((label, index) => ({ id: `step-${index + 1}`, label }))
    },
    sourceNote: "Materi edukasi/simulasi berdasarkan spesifikasi pengguna, bukan instruksi terapi untuk pasien nyata. Validasi isi klinis dan dosis oleh pengajar sebelum digunakan."
  };
}

const cases = (stationNo, items) => items.map((item, index) => ({
  number: index + 1,
  ...makeCase(...item)
}));

const OSCE_CLINICAL_STATIONS = [
  {
    number: 1, name: "Kardiologi", declaredCaseCount: 6,
    cases: cases(1, [
      ["Cardiac Arrest", "Laki-laki 65 tahun, ditemukan tidak sadar di UGD.",
        "Tidak sadar; hasil vital dan pemeriksaan lain diminta kepada penguji.",
        "Cek irama shockable (pVT/VF) vs non-shockable (PEA/asistol); pertimbangkan EKG.",
        "Algoritma RJP/CPR 5 siklus, cek irama, defibrilasi bila shockable, epinefrin 1 mg, amiodaron 300 mg; oksigen nasal kanul; ISDN 5 mg; aspirin 80 mg No. IV; clopidogrel 75 mg No. IV.",
        { differentials: ["Penyebab reversibel 5H/5T", "STEMI"], procedure: "RJP/CPR 5 siklus; identifikasi irama; defibrilasi/shock sesuai irama." }],
      ["Suspek CHF NYHA FC III", "Laki-laki 65 tahun, sesak napas 7 bulan, PND, tidur dengan 3 bantal, riwayat hipertensi.",
        "TD 160/100; JVP 5+3; kardiomegali; S3 gallop; ronki basal; pitting edema.",
        "EKG: LVH. CXR: kardiomegali dan edema paru.",
        "O2 nasal kanul; captopril 12.5 mg; bisoprolol 2.5 mg; furosemid 40 mg.",
        { referral: "Sp.JP" }],
      ["Hipertensi Grade I", "Laki-laki 45 tahun, nyeri kepala dan kaku tengkuk selama 1 minggu.",
        "TD 145/90.",
        "Belum dirinci dalam sumber spesifikasi.",
        "Amlodipin 5 mg atau captopril 12.5 mg."],
      ["Atrial Fibrilasi + HT Grade II", "Laki-laki 50 tahun, berdebar tidak teratur selama 2 minggu, sering minum kopi.",
        "TD 170/100; HR 120x/menit; S1S2 ireguler.",
        "EKG: atrial fibrilasi. Media pembanding: SVT, atrial flutter, PVC/VES.",
        "Captopril 25 mg; bisoprolol 2.5 mg; warfarin 2 mg."],
      ["Sinus Bradikardia", "Laki-laki 45 tahun, sensasi hampir pingsan selama 2 bulan.",
        "TD 100/60; HR 60x/menit.",
        "EKG: sinus bradikardia. Media pembanding: AV block derajat 1, Mobitz 1, Mobitz 2, total AV block.",
        "Rujuk Sp.JP.", { referral: "Sp.JP" }],
      ["STEMI Anterior Ekstensif", "Perempuan 55 tahun, nyeri dada kiri menjalar ke lengan kiri selama 16 jam, berkeringat dingin.",
        "TD 150/90.",
        "Troponin 15.499; CXR CTR 65%; EKG ST elevasi I, aVL, V1-V5. Media pembanding: STEMI inferior, anteroseptal, septal, lateral.",
        "Nasal kanul; ISDN 5 mg; aspirin 80 mg No. IV; clopidogrel 75 mg No. IV."]
    ])
  },
  {
    number: 2, name: "Respirasi", declaredCaseCount: 6,
    cases: cases(2, [
      ["PPOK Tipe Emfisema", "Perempuan 45 tahun, sesak 3 jam dengan keluhan kronis 3 bulan; pekerja tambang/kapas, eks-perokok.",
        "RR 28x/menit; sianosis; pursed-lip breathing; pink puffer; barrel chest; wheezing +/+; ronki +/+; hipersonor.",
        "Spirometri FEV1/FVC 60%; CXR emfisema, hiperinflasi, jantung pendulum.",
        "Beclomethasone 100 mcg MDI; salbutamol MDI."],
      ["TB Paru", "Laki-laki 55 tahun, batuk 3 bulan disertai darah, keringat malam, dan berat badan turun.",
        "Suhu 38 C; KGB leher (+); ronki (+).",
        "BTA ++; CXR kavitas/bercak awan apeks.",
        "Regimen yang dicantumkan: 2HRZE+4H3R3; isoniazid 300 mg; rifampisin 450 mg; pirazinamid 500 mg; ethambutol 250 mg."],
      ["Pneumonia Komunitas CURB-65=0", "Laki-laki 30 tahun, demam 3 hari sampai 39 C, batuk berdahak kuning kehijauan.",
        "RR 27x/menit; SpO2 94%; fremitus meningkat; perkusi redup; ronki +/+.",
        "CXR: konsolidasi dan air bronchogram.",
        "Azitromisin 500 mg No. VII."],
      ["Asma Intermitten Serangan Berat", "Laki-laki 15 tahun, sesak 1 jam; mengi sejak 4 jam setelah menginap di Kintamani.",
        "RR 28x/menit; wheezing (+); retraksi interkostal (+).",
        "Spirometri FEV1 72%; reversibilitas >12%.",
        "NRM; aminofilin fls; salbutamol nebulisasi; ipratropium bromide; metilprednisolon injeksi; Combivent."],
      ["Bronkiektasis", "Laki-laki 50 tahun, batuk berdahak kental 2 tahun, memberat pagi hari; bekerja sebagai tukang parkir.",
        "Wheezing +/+; ronki +/+; clubbing finger (+).",
        "Sputum 3 lapis; CXR honeycomb/tram-track appearance.",
        "Amoksisilin 500 mg; formoterol MDI; N-asetilsistein 200 mg; salbutamol MDI."],
      ["Suspek Tumor Paru", "Perempuan 70 tahun, batuk kering 6 bulan, berat badan turun; bekerja di pabrik selama 30 tahun.",
        "Anemis; KGB (+); wheezing +/+; stridor (+).",
        "CXR massa radiopak batas tegas; CEA/NSE/Cyfra 21-2.",
        "Ambroxol sirup; rujuk.", { referral: "Sp.PD" }]
    ])
  },
  {
    number: 3, name: "Obstetri & Ginekologi", declaredCaseCount: 8,
    cases: cases(3, [
      ["Abortus Komplet", "Perempuan 24 tahun, G1P0A0, hamil 2 bulan; perdarahan pervaginam disertai gumpalan jaringan.",
        "Inspekulo/VT: OUI/porsio tertutup.",
        "USG: endometrium tebal, kantung kehamilan (-).",
        "Sulfas ferosus 300 mg; asam mefenamat 500 mg.", { referral: "Sp.OG" }],
      ["Vulvitis", "Perempuan 28 tahun, P1A0, gatal dan panas pada bibir kemaluan 1 bulan; memakai pantyliner.",
        "Vulva hiperemis, edema, bercak putih.",
        "KOH (-).",
        "Hydrocortisone cream; CTM 2 mg atau cetirizine."],
      ["Vaginosis Bakterialis", "Perempuan 32 tahun, P1A0, keputihan berbau amis 1 bulan; sering mencuci dengan air sirih.",
        "Belum dirinci dalam sumber spesifikasi.",
        "Clue cell (+); pH >4.5.",
        "Metronidazole 500 mg 2x1 (atau 2 g dosis tunggal); atau clindamycin 300 mg."],
      ["Servisitis Gonorea", "Perempuan 32 tahun, cairan hijau kekuningan 1 bulan dan nyeri berkemih; pasangan memiliki riwayat kencing nanah.",
        "Inspekulo: serviks merah, erosi, sekret mukopurulen.",
        "Gram: diplococcus gram negatif berbentuk biji kopi.",
        "Cefixime 400 mg dosis tunggal + azitromisin 1 g dosis tunggal.", { referral: "Sp.OG" }],
      ["Asuhan Persalinan Normal / APN", "Perempuan 18 tahun, hamil 40 minggu, pembukaan lengkap.",
        "Pemeriksaan obstetri sesuai lembar APN.",
        "Belum dirinci dalam sumber spesifikasi.",
        "Oksitosin 10 IU IM; vitamin K1; Hep B.",
        { procedure: "Rubrik 57 langkah APN: Kala 2, Kala 3/manajemen aktif, oksitosin 10 IU IM, PTT, masase fundus, IMD, vitamin K1, Hep B.", referral: "Sp.OG" }],
      ["Konseling & Pemasangan KB", "Perempuan 30 tahun, datang untuk konseling dan pemasangan/pelepasan kontrasepsi.",
        "Penapisan hormonal dan AKDR sesuai lembar kerja.",
        "Belum dirinci dalam sumber spesifikasi.",
        "Konseling SATU TUJU; pilihan AKDR Copper T 380A dan implan.",
        { procedure: "Rubrik skor 0-1-2: pemasangan AKDR Copper T 380A (27 langkah withdrawal technique), pemasangan dan pencabutan implan (15 langkah)." }],
      ["Prosedur ANC Lengkap", "Perempuan hamil 30 tahun, datang untuk pemeriksaan antenatal lengkap.",
        "Identitas, riwayat obstetri, HPHT/rumus TP Naegele, TFU, Leopold 1-4, auskultasi BJA monoaural 5 detik x 3 x 4.",
        "Belum dirinci dalam sumber spesifikasi.",
        "Tindak lanjut ANC sesuai hasil pemeriksaan.",
        { procedure: "Rubrik skor 0-1-2, 26 langkah pemeriksaan ANC.", referral: "Sp.OG" }],
      ["Screening Pap Smear & IVA", "Perempuan 45 tahun, keputihan 5 bulan dan perdarahan pascakoitus; ibu memiliki riwayat kanker serviks.",
        "Pemeriksaan ginekologi sesuai prosedur.",
        "IVA: asam asetat 3-5%, hasil epitel putih (+).",
        "Pap smear dan IVA; tindak lanjut/rujukan sesuai hasil.",
        { procedure: "Pap smear menggunakan spatula Ayre dan Cytobrush 360 derajat; fiksasi alkohol 96% 30 menit. IVA dengan asam asetat 3-5%.", referral: "Sp.OG" }]
    ])
  },
  {
    number: 4, name: "Ilmu Penyakit Dalam", declaredCaseCount: 21,
    caseCountNote: "Judul sumber menyebut 21 kasus, tetapi daftar spesifik memuat 26 kasus; seluruh 26 kasus yang dirinci dipertahankan.",
    cases: cases(4, [
      ["Graves Disease", "Perempuan 20 tahun, berdebar; eksoftalmus dan struma difus dengan bruit.",
        "Eksoftalmus; struma difus bruit (+).",
        "TSH rendah; FT4 tinggi.",
        "PTU 100 mg; propranolol 10 mg."],
      ["Hipotiroid Defisiensi Iodium", "Perempuan 20 tahun, gondok di Kintamani; bradikardia dan miksedema.",
        "Bradikardia 50x/menit; miksedema; gondok.",
        "Belum dirinci dalam sumber spesifikasi.",
        "Levothyroxine 50 mcg."],
      ["DM Tipe 2", "Laki-laki 58 tahun, kurus dan lemas, gejala 3P.",
        "Kurus; lemas.",
        "GDP 170; TTGO 350.",
        "Metformin 500 mg. Kalkulator diet: 30 kkal x BBI dengan koreksi umur/aktivitas/BB."],
      ["Ketoasidosis Diabetik (KAD)", "Laki-laki 58 tahun, koma, napas Kussmaul.",
        "Koma; napas Kussmaul.",
        "GDS 350; keton (+); asidosis.",
        "NaCl 0.9%; insulin Aspart; KCl."],
      ["Hyperosmolar Hyperglycemic State (HHS)", "Laki-laki 58 tahun, koma.",
        "Koma.",
        "GDS 700; pH >7.3; keton urin (-).",
        "NaCl 0.9%; insulin Aspart; KCl."],
      ["Hipoglikemia", "Laki-laki 58 tahun, koma setelah penggunaan insulin.",
        "Koma.",
        "GDS 40.",
        "Dextrose 40% 2 flakon + D10%."],
      ["Addison Disease", "Laki-laki 30 tahun, nyeri perut dan berat badan turun.",
        "TD 90/60; hiperpigmentasi.",
        "Kortisol rendah.",
        "NaCl; D10%; hydrocortisone 100 mg."],
      ["Sindrom Metabolik", "Perempuan 40 tahun.",
        "BB 90 kg; TB 150 cm; LP 90 cm; TD 140/90.",
        "GDP 130; HDL 38; TG 250.",
        "Simvastatin 20 mg; captopril 12.5 mg; metformin 500 mg."],
      ["OA Genu", "Perempuan 60 tahun, nyeri lutut dengan kekakuan <30 menit.",
        "Krepitasi (+).",
        "Osteofit.",
        "Ibuprofen 400 mg."],
      ["Rheumatoid Arthritis", "Perempuan 40 tahun, nyeri sendi jari tangan dengan kekakuan >30 menit.",
        "Swan neck/Boutonniere.",
        "RF (+).",
        "Natrium diklofenak 50 mg."],
      ["Gout Arthritis", "Laki-laki 50 tahun, nyeri mendadak ibu jari kaki kiri pada pagi hari; sering makan jeroan.",
        "Nyeri ibu jari kaki kiri.",
        "Belum dirinci dalam sumber spesifikasi.",
        "Colchicine 0.5 mg."],
      ["Pyelonefritis Akut", "Perempuan 40 tahun, nyeri pinggang kanan dan demam.",
        "Suhu 39.5 C; nyeri ketok CVA (+).",
        "Kultur >10^5 CFU.",
        "Levofloxacin 500 mg + PCT."],
      ["Sindrom Nefritik Akut Post-streptokokus", "Perempuan 40 tahun, bengkak kaki dan urin seperti cucian daging; riwayat ISPA.",
        "TD 140/90; bengkak kaki.",
        "ASTO meningkat.",
        "Furosemid 40 mg; amoksisilin 500 mg; PCT."],
      ["Sindrom Nefrotik", "Laki-laki 20 tahun, anasarka dan urin berbuih.",
        "Bengkak seluruh tubuh/anasarka.",
        "Hipoalbumin; oval fat bodies (+); hiperkolesterolemia.",
        "Prednison 5 mg."],
      ["Dispepsia Fungsional", "Perempuan 23 tahun, rasa terbakar di dada/epigastrium.",
        "Belum dirinci dalam sumber spesifikasi.",
        "Belum dirinci dalam sumber spesifikasi.",
        "Omeprazol 20 mg + ranitidin 150 mg."],
      ["Ulkus Peptikum", "Perempuan 56 tahun, nyeri perut dan BAB hitam/melena; konsumsi obat nyeri lutut 2 tahun.",
        "Nyeri perut; melena.",
        "Endoskopi: robekan duodenum.",
        "Omeprazol; ranitidin; sucralfat; celecoxib."],
      ["GERD", "Laki-laki 47 tahun, ulu hati terbakar saat berbaring setelah makan, mulut terasa asam.",
        "Belum dirinci dalam sumber spesifikasi.",
        "Mucosal break.",
        "Omeprazol; lansoprazol; metoclopramide."],
      ["Irritable Bowel Syndrome (IBS)", "Perempuan 32 tahun, manajer; BAB cair berulang saat stres tenggat pekerjaan.",
        "Belum dirinci dalam sumber spesifikasi.",
        "Pemeriksaan lab/endoskopi normal.",
        "Metoclopramide; manajemen stres."],
      ["Hepatitis A Akut", "Perempuan 24 tahun, mual muntah dan ikterik setelah makan bersama rekan kerja.",
        "Ikterik (+); hepatomegali.",
        "IgM anti-HAV (+).",
        "Metoclopramide + PCT."],
      ["Disentri Amuba", "Laki-laki 21 tahun, BAB cair berlendir darah 6-8x.",
        "BAB cair berlendir darah.",
        "Tropozoit dengan inti 4 dan eritrosit trapping.",
        "Metronidazole 500 mg; metoclopramide; PCT."],
      ["Demam Tifoid", "Laki-laki 21 tahun, demam 5 hari pola step-ladder.",
        "Bradikardi relatif HR 62x/menit saat suhu 38.5 C; rose spot (+).",
        "Widal 1/320.",
        "Kloramfenikol 500 mg; metoclopramide; PCT."],
      ["Anemia Defisiensi Besi ec Hemoroid Grade 3", "Perempuan 31 tahun, lemas 1 bulan.",
        "Papil atrofi.",
        "Hb 8; MCV 65.",
        "Sulfas ferosus 325 mg + vitamin C 1000 mg.", { referral: "Sp.B" }],
      ["Leptospirosis", "Perempuan 31 tahun, petugas kebersihan selokan, demam 3 hari.",
        "Nyeri betis gastrocnemius (+).",
        "Belum dirinci dalam sumber spesifikasi.",
        "Doksisiklin 100 mg + PCT."],
      ["Malaria Falciparum", "Laki-laki 25 tahun, baru pulang dari Labuan Bajo; demam menggigil dan berkeringat.",
        "Ikterik; hepatosplenomegali.",
        "Gametosit berbentuk bulan sabit/headphone.",
        "Kombipak artesunat-amodiakuin + primakuin 15 mg + PCT."],
      ["Kandidiasis Oral ec HIV", "Laki-laki 39 tahun, plak putih di mulut 2 bulan; HIV (+) selama 5 tahun.",
        "Plak putih mulut.",
        "KOH: pseudohifa.",
        "Nystatin drop; flukonazol 50 mg; ARV TDF-3TC-EFV."],
      ["Keracunan Organofosfat", "Perempuan 25 tahun, menelan racun serangga.",
        "Hipersalivasi.",
        "Belum dirinci dalam sumber spesifikasi.",
        "Tatalaksana keracunan sesuai protokol dan bantuan emergensi.",
        { procedure: "Prosedur pemasangan NGT 14 langkah dan pemasangan infus 7 langkah." }]
    ])
  },
  {
    number: 5, name: "Neurologi", declaredCaseCount: 9,
    cases: cases(5, [
      ["Tension Type Headache / TTH", "Perempuan 25 tahun, nyeri kepala bilateral seperti terikat, VAS 3-5.",
        "Nyeri kepala bilateral seperti terikat.",
        "Belum dirinci dalam sumber spesifikasi.",
        "Ibuprofen 400 mg."],
      ["Migrain dengan Aura", "Laki-laki 35 tahun, nyeri kepala kanan berdenyut, VAS 7-9, kilatan cahaya, mual.",
        "Nyeri kepala berdenyut; mual.",
        "Belum dirinci dalam sumber spesifikasi.",
        "Ibuprofen 400 mg + sumatriptan 30 mg."],
      ["Cluster Headache", "Laki-laki 28 tahun, nyeri hebat seperti dibor pada mata kanan, VAS 9-10.",
        "Injeksi konjungtiva, lakrimasi, ptosis, rinore.",
        "Belum dirinci dalam sumber spesifikasi.",
        "O2 NRM + sumatriptan 6 mg/0.5 ml."],
      ["Stroke Iskemik Trombus", "Laki-laki 58 tahun, hemiparesis dextra mendadak saat bangun tidur, pelo, mulut mencong; DM.",
        "N. VII sentral; N. XII sentral; skala kekuatan otot MRC 0-5; sensorik; refleks fisiologis/patologis; tonus dan tropik.",
        "CT-Scan: hipodens hemisfer sinistra.",
        "Aspilet 80 mg No. IV + clopidogrel 75 mg No. IV.",
        { procedure: "Pemeriksaan neurologis: N. VII/N. XII sentral; MRC 0-5; sensorik; refleks Babinski, Chaddock, Oppenheim, Gordon, Schaeffer, Gonda, Hoffman-Tromner; tonus dan tropik." }],
      ["Bell's Palsy / Paresis N.VII LMN Kanan", "Perempuan 35 tahun, sekretaris yang bekerja di ruang ber-AC, mulut mencong kanan.",
        "Kerutan dahi asimetris; lagophthalmos.",
        "Belum dirinci dalam sumber spesifikasi.",
        "Prednison 5 mg; hidroksietilselulosa ED; vitamin B6."],
      ["HNP Lumbal L5-S1", "Laki-laki 40 tahun, tukang bangunan, nyeri punggung menjalar ke kaki kanan setelah mengangkat batako.",
        "Laseque (+); Bragard (+); Valsava (+); Naffziger (+); Patrick (-); kontrapatrick (-).",
        "MRI: herniasi diskus.",
        "Asam mefenamat 500 mg."],
      ["Carpal Tunnel Syndrome / CTS", "Laki-laki 25 tahun, admin rumah sakit, nyeri dan kesemutan jari 1-4 kanan.",
        "Atrofi tenar (+); Phalen (+); Tinel (+); Flick sign (+); Luthy sign (+).",
        "Belum dirinci dalam sumber spesifikasi.",
        "Paracetamol 500 mg + wrist splint."],
      ["BPPV / Vertigo Perifer", "Perempuan 38 tahun, pusing berputar saat bangun tidur atau mengubah posisi.",
        "Dix-Hallpike: nistagmus horizontal; Romberg dan Romberg dipertajam; tandem gait.",
        "Belum dirinci dalam sumber spesifikasi.",
        "Betahistin 12 mg/6 mg; manuver Epley dan Brandt-Daroff.",
        { procedure: "Manuver Epley dan Brandt-Daroff." }],
      ["Meningitis Bakteri", "Perempuan 30 tahun, nyeri kepala dan demam 39.8 C; riwayat radang tenggorokan.",
        "Kaku kuduk (+); Kernig (+); Brudzinski 1 dan 2 (+).",
        "CSF keruh; PMN dominan; glukosa turun.",
        "Ceftriaxone 2000 mg flc imm + Paracetamol 500 mg."]
    ])
  },
  {
    number: 6, name: "Ilmu Bedah", declaredCaseCount: 9,
    cases: cases(6, [
      ["Retensio Urin ec Suspek BPH", "Laki-laki 70 tahun, tidak dapat BAK 1 hari; LUTS selama 1 tahun.",
        "Distensi vesika urinaria; evaluasi kontraindikasi kateter: hematom perineum (-), bloody discharge MUE (-).",
        "Belum dirinci dalam sumber spesifikasi.",
        "Belum dirinci dalam sumber spesifikasi.",
        { procedure: "Pemasangan kateter Foley 18 langkah.", referral: "Sp.U" }],
      ["Suspek Ruptur Tendon Achilles Dekstra", "Laki-laki 27 tahun, nyeri tumit kanan dan terdengar 'pop' saat bermain badminton.",
        "Look-Feel-Move: gap posterior ankle (+); plantar fleksi lemah; Thompson/Simmond test (+).",
        "Belum dirinci dalam sumber spesifikasi.",
        "Paracetamol 500 mg; rest, ice, imobilisasi plantarfleksi; rujuk.",
        { procedure: "Rest, ice, imobilisasi plantarfleksi.", referral: "Sp.OT" }],
      ["Fraktur Tertutup 1/3 Tengah Os Klavikula Sinistra", "Laki-laki 27 tahun, nyeri bahu kiri setelah jatuh dari motor.",
        "Swelling; krepitasi (+); ROM terbatas.",
        "X-Ray: diskontinuitas 1/3 tengah klavikula sinistra.",
        "Paracetamol 500 mg; rujuk.",
        { procedure: "Pemasangan figure of eight dan arm sling.", referral: "Sp.OT" }],
      ["Sirkumsisi", "Anak laki-laki 7 tahun, datang untuk tindakan sirkumsisi.",
        "Evaluasi kontraindikasi genital: hipospadia (-), epispadia (-), chordee (-), webbed penis (-).",
        "Belum dirinci dalam sumber spesifikasi.",
        "Gentamisin ointment; amoksisilin sirup 125 mg/5 ml; paracetamol 500 mg.",
        { procedure: "Sirkumsisi 15 langkah." }],
      ["Kolik Ureter ec Suspek Ureterolithiasis Dekstra", "Laki-laki 20 tahun, nyeri pinggang kanan menjalar ke skrotum, NRS 7; BAK merah/berpasir.",
        "Ballottement; pemeriksaan suprapubik; nyeri ketok CVA (+).",
        "UL; BNO-IVP.",
        "Paracetamol 500 mg; rujuk.",
        { referral: "Sp.U" }],
      ["Fibroadenoma Mammae / FAM", "Perempuan 25 tahun, benjolan payudara kanan 3 cm kuadran kanan atas, kenyal, mobile, tidak nyeri.",
        "Pemeriksaan payudara dan KGB aksila/supraklavikula.",
        "USG mammae.",
        "Rujuk.",
        { procedure: "Pemeriksaan payudara dan KGB aksila/supraklavikula; edukasi langkah SADARI.", referral: "Sp.Onk" }],
      ["Suspek Apendisitis Akut", "Perempuan 18 tahun, nyeri perut kanan bawah berpindah dari ulu hati/pusat; demam 39 C, mual, muntah.",
        "MANTRELS; McBurney (+); Rovsing (+); Blumberg/nyeri lepas (+); obturator (+); psoas (+); Dunphy (+).",
        "Belum dirinci dalam sumber spesifikasi.",
        "Paracetamol 500 mg; ceftriaxone 1 g vial IM; rujuk.",
        { referral: "Sp.B" }],
      ["Luka Bakar Derajat 2B TBSA 18%", "Laki-laki 45 tahun, kulit dada dan perut melepuh terkena air panas.",
        "Luka bakar derajat 2B; TBSA 18%.",
        "Belum dirinci dalam sumber spesifikasi.",
        "Paracetamol 500 mg; ceftriaxone 1 g vial IM; rujuk.",
        { referral: "Sp.BP" }],
      ["Hemoroid Interna Grade 3", "Laki-laki 35 tahun, benjolan anus 2 minggu tidak dapat didorong masuk, BAB darah segar menetes.",
        "Belum dirinci dalam sumber spesifikasi.",
        "Belum dirinci dalam sumber spesifikasi.",
        "Paracetamol 500 mg + Ardium 500 mg; rujuk.",
        { procedure: "Rectal toucher/colok dubur 16 langkah.", referral: "Sp.B" }]
    ])
  },
  {
    number: 7, name: "Psikiatri", declaredCaseCount: 7,
    psychiatricStatusFields: [
      "Kesan Umum", "Kesadaran", "Mood/Afek", "Proses & Isi Pikir",
      "Persepsi", "Dorongan Instingtual", "Psikomotor"
    ],
    cases: cases(7, [
      ["Gangguan Nyeri Somatoform Menetap F45.4", "Perempuan 30 tahun, nyeri ulu hati 2 minggu saat stres akibat bos baru/tenggat; pemeriksaan lab normal.",
        "Afek disforik; preokupasi penyakit.",
        "Pemeriksaan laboratorium normal.",
        "Belum dirinci dalam sumber spesifikasi.",
        { psychiatricStatus: { "Mood/Afek": "Disforik", "Proses & Isi Pikir": "Preokupasi penyakit" } }],
      ["Gangguan Somatisasi", "Perempuan 30 tahun, nyeri berpindah-pindah 1 tahun pada perut, kepala, dada, dan kaki; cemas saat suami dinas luar kota.",
        "Belum dirinci dalam sumber spesifikasi.",
        "Belum dirinci dalam sumber spesifikasi.",
        "Belum dirinci dalam sumber spesifikasi."],
      ["Gangguan Hipokondriasis", "Laki-laki 45 tahun, batuk 3 bulan; yakin menderita kanker paru setelah tetangga meninggal karena kanker paru.",
        "Belum dirinci dalam sumber spesifikasi.",
        "Hasil pemeriksaan lab/dokter normal.",
        "Belum dirinci dalam sumber spesifikasi."],
      ["Gangguan Cemas Menyeluruh / GAD", "Perempuan 45 tahun, berdebar, gemetar, keringat dingin, insomnia selama 3 bulan sejak di-PHK saat pandemi.",
        "Mood/afek cemas; psikomotor gelisah.",
        "Belum dirinci dalam sumber spesifikasi.",
        "Belum dirinci dalam sumber spesifikasi.",
        { psychiatricStatus: { "Mood/Afek": "Cemas", "Psikomotor": "Gelisah" } }],
      ["Gangguan Depresi Ringan", "Perempuan 30 tahun, tidak nafsu makan 3 minggu sejak anjing kesayangan mati; kehilangan energi dan minat.",
        "Mood hipotimia/anhedonia; hipobulia; middle insomnia; psikomotor menurun.",
        "Belum dirinci dalam sumber spesifikasi.",
        "Belum dirinci dalam sumber spesifikasi.",
        { psychiatricStatus: { "Mood/Afek": "Hipotimia/anhedonia", "Dorongan Instingtual": "Hipobulia", "Proses & Isi Pikir": "Middle insomnia", "Psikomotor": "Menurun" } }],
      ["Skizofrenia Paranoid", "Perempuan 30 tahun, diantar kakak; mendengar suara laki-laki memaki selama 1 bulan sejak suami meninggal, bicara sendiri, memukul kepala.",
        "Kontak visual tidak adekuat; afek inappropriate; halusinasi auditorik (+).",
        "Belum dirinci dalam sumber spesifikasi.",
        "Rujuk.",
        { psychiatricStatus: { "Kesan Umum": "Kontak visual tidak adekuat", "Mood/Afek": "Inappropriate", "Persepsi": "Halusinasi auditorik (+)" }, referral: "Sp.KJ" }],
      ["Gangguan Insomnia Tipe Early", "Perempuan 25 tahun, sulit memulai tidur dan baru tidur jam 3 subuh selama 3 minggu setelah UAS.",
        "Belum dirinci dalam sumber spesifikasi.",
        "Belum dirinci dalam sumber spesifikasi.",
        "Triazolam tablet 1 mg No. X; S 1 dd 1 sebelum tidur."]
    ])
  },
  {
    number: 8, name: "Mata", declaredCaseCount: 10,
    eyeExam: [
      "Visus: Snellen chart 6 m, pinhole, hitung jari 1-6 m (1/60-6/60), lambaian tangan 1 m (1/300), penlight 25 cm (1/tak hingga), LP good/bad projection atau NLP.",
      "Segmen anterior: palpebra, eversi konjungtiva, kornea, BMD/COA, iris, pupil/RAPD, lensa."
    ],
    cases: cases(8, [
      ["ODS Dry Eye Syndrome", "Perempuan 20 tahun, mata merah dan terasa mengganjal 3 hari setelah mengerjakan tugas di laptop.",
        "Belum dirinci dalam sumber spesifikasi.",
        "Schirmer test (+), <10 mm.",
        "Hidroksietilselulosa ED 6 dd gtt 1 ODS + sodium hialuronat 0.1% ED."],
      ["ODS Rabun Senja ec Defisiensi Vitamin A", "Anak 2.5 tahun, sulit melihat sore hari dan menabrak benda; belum mendapat vitamin A.",
        "Belum dirinci dalam sumber spesifikasi.",
        "Belum dirinci dalam sumber spesifikasi.",
        "Vitamin A 200.000 IU caps No. I + hidroksietilselulosa ED."],
      ["ODS Konjungtivitis Bakterial", "Laki-laki 22 tahun, mata merah, berair, sekret mukopurulen 5 hari.",
        "Belum dirinci dalam sumber spesifikasi.",
        "Gram: bakteri kokus gram positif bergerombol ungu.",
        "Kloramfenikol 1% EO tube; S u.e o.8.h ODS."],
      ["OD Blefaritis Anterior / Seboroik", "Laki-laki 30 tahun, mata kanan gatal 2 minggu, skuama/ketombe pada bulu mata dan bulu mata rontok.",
        "Skuama pada bulu mata; bulu mata rontok.",
        "Belum dirinci dalam sumber spesifikasi.",
        "Kompres hangat; cuci dengan sampo bayi; kloramfenikol 0.5% EO atau gentamisin 0.3% EO."],
      ["OS Hordeolum Interna", "Laki-laki 25 tahun, benjolan kelopak mata kiri atas 2 hari, nyeri dan merah.",
        "Eversi konjungtiva: benjolan hiperemis.",
        "Belum dirinci dalam sumber spesifikasi.",
        "Kompres hangat; kloramfenikol 1% EO + gentamisin 0.3% EO."],
      ["OD Pterigium Grade II", "Laki-laki 55 tahun, nelayan, mata kanan merah dan jaringan segitiga putih melewati limbus <2 mm.",
        "Jaringan segitiga putih melewati limbus <2 mm.",
        "Tes sonde (-).",
        "Hidroksietilselulosa ED + fluorometholone 0.1% ED."],
      ["OD Dakrioadenitis", "Anak 7 tahun, bengkak kelopak mata atas sisi luar/superotemporal 5 hari; riwayat campak 1 bulan lalu.",
        "Bengkak kelopak mata superotemporal.",
        "Anel test (+); regurgitasi test (-).",
        "Kompres hangat + fluorometholone 0.1% ED."],
      ["OS Keratitis Fungal", "Laki-laki 40 tahun, petani, mata kiri merah, buram, silau, nyeri 3 hari setelah tergores rumput.",
        "Belum dirinci dalam sumber spesifikasi.",
        "KOH: hifa panjang bersepta; tes fluoresensi (+); Seidel test (-).",
        "Amfoterisin B 0.15% ED + natamycin 5% ED; rujuk.",
        { referral: "Sp.M" }],
      ["ODS Episkleritis", "Perempuan 17 tahun, mata merah pink salmon 2 hari; riwayat SLE, nodul hiperemis nyeri tekan.",
        "Nodul hiperemis nyeri tekan.",
        "Tes fenilefrin 2.5%: kemerahan berkurang.",
        "Hidroksietilselulosa ED + betamethasone 0.1% ED."],
      ["OD Glaukoma Akut", "Laki-laki 50 tahun, nyeri mata kanan mendadak NRS 7/10 saat menonton TV, buram, mual, fotofobia.",
        "Lapang pandang menyempit; refleks fundus menurun; tonometri palpasi N+1 keras; COA dangkal; pupil midriasis; edema kornea.",
        "Schiotz: prosedur 14 langkah; TIO >21 mmHg.",
        "Asetazolamid 500 mg tablet No. X (3 dd 1) + timolol 0.5% ED (2 dd gtt 1 OD); rujuk segera.",
        { procedure: "Uji konfrontasi; funduskopi; tonometri palpasi dan Schiotz 14 langkah.", referral: "Sp.M segera" }]
    ])
  }
];

function getClinicalStations(role) {
  const isAssessor = role === "assessor" || role === "coordinator";
  return OSCE_CLINICAL_STATIONS.map((station) => ({
    number: station.number,
    name: station.name,
    durationMinutes: 15,
    caseCount: station.cases.length,
    declaredCaseCount: station.declaredCaseCount,
    caseCountNote: station.caseCountNote || "",
    psychiatricStatusFields: station.psychiatricStatusFields || [],
    eyeExam: station.eyeExam || [],
    cases: station.cases.map((clinicalCase) => {
      const base = {
        number: clinicalCase.number,
        candidateScenario: clinicalCase.patientScenario,
        tasks: clinicalCase.tasks
      };
      return isAssessor
        ? { ...base, ...clinicalCase }
        : base;
    })
  }));
}

function getCaseFindings(stationNo, caseNo, kind) {
  const station = OSCE_CLINICAL_STATIONS.find((item) => item.number === Number(stationNo));
  const clinicalCase = station && station.cases.find((item) => item.number === Number(caseNo));
  if (!clinicalCase) return null;
  if (kind === "physical") {
    return {
      stationNo: station.number,
      caseNo: clinicalCase.number,
      findings: clinicalCase.findings,
      generalExam: clinicalCase.generalExam
    };
  }
  if (kind === "investigations") {
    return {
      stationNo: station.number,
      caseNo: clinicalCase.number,
      investigations: clinicalCase.investigations
    };
  }
  return null;
}

module.exports = {
  OSCE_CLINICAL_STATIONS,
  TASKS,
  ANAMNESIS,
  GENERAL_EXAM,
  INVESTIGATION_MENU,
  REFERRAL_OPTIONS,
  getClinicalStations,
  getCaseFindings
};
