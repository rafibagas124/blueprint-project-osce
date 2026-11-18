# OSCE Center 3D

OSCE Center 3D adalah platform simulasi ujian OSCE UKMPPAI berbasis web 3D interaktif yang menyajikan stasiun klinis farmasi secara realistis. Sistem ini berjalan dengan arsitektur server-authoritative menggunakan Node.js, Express, WebSocket, dan validasi kontrak ketat Zod.

## Prasyarat
- Node.js versi 20 ke atas (`node -v`).
- Dependensi akan terpasang otomatis saat Anda menekan **F5** (melalui preLaunchTask).
  *(Dapat juga dijalankan manual via VS Code: **Command Palette** (`Ctrl+Shift+P`) > **Tasks: Run Task** > pilih **npm install**)*.

## Cara Menjalankan (F5 di VS Code)
1. Buka folder projek ini di Visual Studio Code.
2. Buka panel **Run and Debug** (`Ctrl+Shift+D`), pastikan konfigurasi **"OSCE: Demo (data + akun otomatis)"** terpilih, lalu tekan **F5**.
3. Server otomatis menyala dan peramban web akan langsung terbuka ke `http://localhost:8080/blueprint.html`.

## Kredensial Pengujian
Kredensial login dibuat acak secara dinamis setiap kali mode demo dijalankan. Informasi kredensial tercetak langsung pada **Debug Console** VS Code dan tersimpan di file:
`data/demo-credentials.txt`

### Alur Login
- **Mahasiswa**: Pilih peran **Mahasiswa / Peserta Ujian**, masukkan NIM (`DEV-001` s.d. `DEV-020`) beserta Token Ujian dari file kredensial.
- **Asesor / Koordinator**: Pilih peran **Dosen / Asesor Penguji**, masukkan username `dev-koordinator` dan Password acak dari file kredensial.

## Modul OSCE Klinis (8 Station)
- Setelah login, buka **OSCE Klinis** di blueprint untuk timer 15 menit, skenario peserta, permintaan hasil pemeriksaan, pad resep, dan rubrik penguji.
- Bank kasus server-authoritative berada di `src/data/osce-clinical-seed.js`; jawaban, diagnosis, dan tatalaksana hanya dikirim kepada akun penguji. Peserta meminta hasil fisik/penunjang melalui endpoint terautentikasi.
- Spesifikasi sumber ada di `KETENTUAN_OSCE.md`. Daftar Penyakit Dalam memuat 26 kasus spesifik walaupun judul spesifikasi menyebut 21; semua kasus yang tercantum dipertahankan.
- Untuk meninjau seluruh komponen UI dalam satu layar dan mengimpor desain ke Figma, buka `http://localhost:8080/osce-preview.html` lalu gunakan plugin html.to.design.

## Deployment Vercel
- `vercel.json` mengarahkan `/` ke halaman blueprint dan membiarkan file HTML/CSS/JS statis dilayani langsung oleh Vercel. Endpoint `/api/*` menggunakan Express melalui Vercel Function.
- Pada Vercel, WebSocket dinonaktifkan dan penyimpanan memakai `MemoryStore`; data sesi tidak persisten antar-cold-start. Tambahkan `JWT_SECRET` minimal 32 karakter di Project Settings untuk sesi autentikasi yang stabil. Tanpa secret, preview tetap dapat berjalan dengan secret acak per instance.
- File di `/src/*` sengaja tidak disajikan sebagai aset statis karena berisi bank soal dan kunci jawaban server-side.

## Menjalankan Pengujian Otomatis
Jalankan seluruh rangkaian tes otomatis:
```bash
npm test
```
*(Atau via VS Code: **Command Palette** > **Tasks: Run Task** > pilih **npm test**)*.

## Troubleshooting
- **Grafik 3D / WebGL Gagal Dimulai**: Menekan **F5** di VS Code secara otomatis membuka Google Chrome dengan profil bersih dan opsi WebGL aman (`--ignore-gpu-blocklist`, `--enable-unsafe-swiftshader`). Mode software (SwiftShader) memungkinkan rendering 3D tetap berjalan meskipun GPU browser diblokir, namun performanya bisa terasa lebih lambat dibanding akselerasi hardware.
- **Alternatif Browser**: Jika Chrome tetap bermasalah, gunakan konfigurasi debugger **"OSCE: Browser Edge (WebGL aman)"** di panel Run & Debug, atau perbarui driver grafis Anda. Alternatif lain adalah mengaktifkan akselerasi hardware di pengaturan browser (`chrome://settings/system`).

> [!NOTE]
> Secara default, server hanya dapat diakses dari komputer lokal yang sama (`127.0.0.1`). Untuk mengizinkan akses dari perangkat lain pada jaringan lokal yang sama, atur `HOST=0.0.0.0` pada file `.env`. File `.env` bersifat opsional dan hanya diperlukan jika ingin mengubah konfigurasi default.
