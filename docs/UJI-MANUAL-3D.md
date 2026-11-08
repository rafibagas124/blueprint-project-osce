# Panduan Uji Manual Alur Ujian (Fase 3D)

Dokumen ini berisi panduan pengujian manual melalui peramban web (browser) untuk memverifikasi integrasi alur ujian antara klien 3D dan endpoint otoritatif server.

> [!NOTE]
> Panduan ini disiapkan untuk pengujian manual oleh penguji manusia. Status uji manual belum dinyatakan lulus sampai diverifikasi secara langsung di browser.

---

## Prasyarat Pengujian

1. Pastikan database dan seeder dev siap:
   ```bash
   node src/scripts/seed-dev.js
   ```
2. Jalankan server:
   ```bash
   node server.js
   ```
3. Buka browser (Chrome / Edge / Firefox) dan buka DevTools (`F12`), lalu pilih tab **Network**.

---

## Langkah-Langkah Pengujian Manual

1. **Akses Halaman Ujian**:
   - Buka `http://localhost:3000/blueprint.html`.
   - Pastikan tab Network memuat aset dengan status `200` (termasuk `js/exam-api.js`).

2. **Login Mahasiswa**:
   - Pilih role **Mahasiswa**.
   - Masukkan NIM uji (dari output `seed-dev`, contoh `DEV-A01`) dan Token Ujian.
   - Klik **Masuk Ujian**.
   - Periksa tab Network: request `POST /api/auth/login-student` menghasilkan `200` dan mengembalikan token JWT.

3. **Membuka Stasiun 1 (Ruang Ujian)**:
   - Masuk ke Stasiun 01 dan klik meja/interaksi lembar kerja.
   - Buka tab **Keputusan Klinis / Lembar Jawaban**.
   - Periksa tab Network:
     - Request `GET /api/station/1` terkirim dengan header `Authorization: Bearer <jwt>`.
     - Respons `200` berisikan soal dan daftar opsi dengan `id` deterministik (misal: 12 karakter base64url).
     - **Verifikasi**: Tidak ada field `correct`, `pembahasan`, `checklist`, atau `TODO_DOSEN` di respons.

4. **Verifikasi Tombol Kirim & Konfirmasi**:
   - Pastikan tombol **Kirim Jawaban Stasiun** dalam keadaan nonaktif (disabled) saat belum ada opsi yang dipilih.
   - Pilih salah satu opsi radio button. Tombol kirim harus menjadi aktif.
   - Klik tombol **Kirim Jawaban Stasiun**.
   - Muncul dialog konfirmasi: `"Yakin kirim jawaban? Jawaban tidak dapat diubah."`
   - Klik **Batal (Cancel)**: pastikan tidak ada request network yang terkirim.
   - Klik tombol kirim lagi, lalu klik **OK (Konfirmasi)**.

5. **Verifikasi Pengiriman Jawaban (POST /api/submit)**:
   - Periksa tab Network pada request `POST /api/submit`:
     - Payload request **HANYA** `{ "stationNo": 1, "optionId": "<id>" }`.
     - Tidak ada field `score`, `isCorrect`, atau `rating`.
     - Respons server mengembalikan `{ "accepted": true, "stationNo": 1 }`.
   - Periksa UI:
     - Notifikasi hanya menampilkan: `"Jawaban diterima."`
     - Tidak ada skor, status benar/salah, maupun kunci jawaban yang ditampilkan kepada mahasiswa.
   - Buka kembali lembar kerja Stasiun 01: tombol kirim terkunci (disabled) dan tidak dapat mengirim ulang.
