# Panduan Akses Developer & Pengujian

1. **Buat Akun Koordinator**:
   ```bash
   npm run create:assessor -- --username dev_koor --role koordinator
   ```
   Ketik password saat diminta di terminal (input tersembunyi, minimal 12 karakter).

2. **Jalankan Seeder Uji Mahasiswa**:
   ```bash
   npm run seed:dev
   ```
   Daftar NIM dan token sesi mahasiswa tersimpan di `data/dev_tokens.csv`.

3. **Login Pengujian** di `http://localhost:3000/blueprint.html`: Koordinator (username + password), Mahasiswa (NIM + Token).

