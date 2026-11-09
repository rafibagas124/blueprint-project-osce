# Panduan Akses Developer & Pengujian

## 1. Alur Utama: Menjalankan Mode Demo (Rekomendasi)
Alur tercepat untuk pengembangan dan review:
1. Buka folder projek di VS Code.
2. Buka tab **Run and Debug** (`Ctrl+Shift+D`), pilih konfigurasi **"OSCE: Demo (data + akun otomatis)"**, lalu tekan **F5**.
   *(Atau jalankan `npm run demo` via terminal).*
3. Server otomatis menyala di `http://localhost:8080/blueprint.html` dan peramban akan terbuka otomatis.
4. Kredensial akun tercetak di Debug Console terminal dan tersimpan di `data/demo-credentials.txt`:
   - **Koordinator**: username `dev-koordinator` dengan password acak per eksekusi.
   - **Mahasiswa**: 20 akun (`DEV-001` s.d. `DEV-020`) dengan token acak masing-masing.

## 2. Opsi Lanjutan: Pembuatan Akun Asesor Manual (CLI Interaktif)
Skrip `create:assessor` membutuhkan terminal interaktif (TTY) untuk membaca password tersembunyi, sehingga tidak dapat dijalankan melalui tombol F5 di VS Code.

Jalankan perintah berikut di terminal:
```bash
npm run create:assessor -- --username nama_asesor --role koordinator
```
- Masukkan password saat diminta (minimal 12 karakter, input tersembunyi tanpa echo di terminal).
- Password disimpan dalam bentuk hash (bcrypt) di dalam store.

## 3. Seeder Tambahan Mahasiswa DEV
Untuk mengisi 20 mahasiswa DEV tanpa menyalakan server:
```bash
npm run seed:dev
```
Daftar NIM dan token sesi mahasiswa tersimpan di `data/dev_tokens.csv`.
