# Dokumentasi Sistem Penilaian OSCE Center 3D (Fase 3C)

## 1. Rumus Penilaian Otoritatif Server

Skor stasiun ujian dihitung secara mutlak dan otoritatif di sisi server:
- **Jawaban Benar**: `100`
- **Jawaban Salah**: `0`

Klien browser tidak memiliki hak maupun kemampuan untuk mengirimkan nilai, status kebenaran (`isCorrect`), ataupun rating. Jika klien mengirimkan field nilai/status tersebut pada `POST /api/submit`, server akan menolak permintaan dengan kode HTTP **400 Bad Request** melalui validasi Zod strict schema.

## 2. Asumsi dan Kebijakan

1. **Rubrik Resmi Menunggu Dosen**:
   - Skema penilaian 100/0 pada Fase 3 adalah skema dasar otoritatif MCQ stasiun UKMPPAI.
   - Penilaian berbobot rubrik analitis bertahap akan diintegrasikan setelah formasi rubrik resmi dari dosen/institusi disahkan.
2. **Checklist Observasi**:
   - Checklist kompetensi pada stasiun bersifat instrumen observasi/asesor dan **TIDAK** dipakai untuk menghitung skor kelulusan stasiun MCQ otomatis ini.
   - Checklist tidak melakukan auto-centang saat jawaban dipilih.
3. **Stasiun 10 (Rest Station)**:
   - Stasiun 10 merupakan jeda istirahat resmi sesuai cetak biru OSCE UKMPPAI.
   - Tidak ada soal pada Stasiun 10 dan submit untuk Stasiun 10 ditolak mutlak oleh server.
4. **Idempotensi Jawaban**:
   - Setiap peserta hanya memiliki satu kesempatan penilaian per stasiun.
   - Submit berulang (termasuk submit paralel akibat koneksi ganda) bersifat idempoten: jawaban dan skor pertama yang tersimpan tidak akan pernah tertimpa atau berubah.
5. **Kerahasiaan Mode Ujian**:
   - Selama sesi ujian berlangsung, server hanya memberikan respons konfirmasi `{ accepted: true, stationNo }` tanpa membocorkan skor, status benar/salah, maupun kunci pembahasan kepada mahasiswa.
