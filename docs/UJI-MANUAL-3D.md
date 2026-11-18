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
   - Buka `http://localhost:8080/blueprint.html`.
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

6. **Pemeriksaan DevTools (Tab Sources dan Tab Network)**:
   - Buka DevTools (`F12`) -> Tab **Sources**:
     - Buka `js/stations-data.js` dan `js/scoring.js`.
     - Verifikasi tidak ada kunci jawaban, penanda `correct`, `EXPLAIN`, `getStationRationale`, `rationale`, atau `checklist` dengan bobot di dalam file klien.
   - Buka DevTools -> Tab **Network**:
     - Periksa panggilan `GET /api/station/:stationNo`: verifikasi bahwa data soal tidak memuat kunci jawaban maupun pembahasan.
     - Periksa panggilan `POST /api/submit`: verifikasi respons hanya berisikan `{ accepted: true, stationNo }` tanpa skor atau indikator evaluasi jawaban.

---

## Skenario Uji Manual: Pintu Interior Ruang Stasiun (Exit Door)

Skenario ini memverifikasi keberadaan, visual, dan fungsionalitas pintu keluar interior di dalam ruang stasiun (`roomGroup`).

### Langkah-Langkah Pengujian:

1. **Masuk ke Ruang Stasiun**:
   - Login sebagai Mahasiswa / Asesor dan masuk ke dalam stasiun (misalnya Stasiun 01) melalui koridor (`[E]` Masuk Stasiun).
   - Saat spawn di dalam ruangan, pemain menghadap ke arah dinding belakang (-Z).

2. **Orientasi Kamera ke Belakang (Dinding Depan)**:
   - Putar pandangan kamera 180° menghadap ke arah dinding depan (arah +Z, koordinat $z = +3.5$).

3. **Inspeksi Visual Pintu Interior & Dinding Depan**:
   - Pastikan pintu interior rumah sakit terpasang simetris di tengah dinding depan ($x = 0$).
   - Verifikasi elemen visual identik dengan pintu koridor:
     - Kusen charcoal (`#253243`).
     - Daun pintu abu-es kehijauan (`#cfe3e0`).
     - Papan pelindung tendangan (kick plate) dan dorong (push plate) satin metal (`#64748b`).
     - Garis aksen horizontal dark teal (`#0f766e`).
     - Jendela kaca vertikal gelap di sisi handle.
     - Gagang pintu tuas satin metal.
   - Verifikasi papan penanda menyala **"KELUAR / EXIT"** terpasang di atas pintu ($y \approx 2.78$) dengan latar hijau tua dan teks kontras.
   - Verifikasi lis dinding bawah (wainscot/dado teal) terpasang rapi di sisi kiri dan kanan kusen pintu tanpa celah dan tanpa z-fighting.

4. **Deteksi Jarak & Indikator HUD**:
   - Gerakkan avatar mendekati pintu (jarak $\le 2.2$ meter).
   - Amati HUD bagian bawah: tombol aksi kontekstual berubah menjadi **"E Keluar ke Koridor"**.
   - Amati floating marker 3D di atas pintu: muncul pin interaktif **"[E] Keluar ke Koridor"**.
   - Uji batas pergerakan: pastikan avatar tidak dapat menembus daun pintu atau dinding depan ($z$ dibatasi $\le 2.7$).

5. **Interaksi Keluar (Keyboard, Marker, & Mesh)**:
   - Uji keluar dengan salah satu dari 3 cara interaksi:
     - Tekan tombol keyboard `[E]`.
     - Klik tombol floating marker **"[E] Keluar ke Koridor"**.
     - Klik langsung pada mesh daun pintu dengan mouse (Raycaster).
   - Verifikasi animasi ayunan engsel pintu:
     - Daun pintu berayun membuka ke arah luar (sudut $\approx 70^\circ$) secara mulus selama $\pm 0.4$ detik.
     - Transisi pandangan/kamera kembali ke koridor berlangsung mulus tanpa lag input.

6. **Verifikasi Pasca Keluar di Koridor**:
   - Pemain kembali berada di koridor di depan stasiun terkait.
   - Lampu indikator status pintu stasiun di koridor berfungsi sesuai status sesi/stasiun.

