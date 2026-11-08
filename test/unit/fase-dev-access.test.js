const { describe, it, before, after } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const crypto = require("node:crypto");
const { app, server, store, signJwt } = require("../../server");
const { createAssessor, promptHiddenPassword } = require("../../src/scripts/create-assessor");

describe("Fitur Akses Pengujian Pengembang: create:assessor & Login Koordinator", () => {
  let testPort;
  let baseUrl;
  let startedLocalServer = false;

  // Hasilkan username dan password acak per eksekusi tes agar tidak ada password tetap
  const testUser = "koor_" + crypto.randomBytes(4).toString("hex");
  const randomPassword12 = "TestSecret_" + crypto.randomBytes(8).toString("hex") + "!#";

  before(async () => {
    // Jalankan server di port 0 (port acak) jika belum berjalan
    await new Promise((resolve) => {
      if (server.listening) {
        testPort = server.address().port;
        baseUrl = `http://127.0.0.1:${testPort}`;
        return resolve();
      }
      server.listen(0, "127.0.0.1", () => {
        startedLocalServer = true;
        testPort = server.address().port;
        baseUrl = `http://127.0.0.1:${testPort}`;
        resolve();
      });
    });
  });

  after(async () => {
    // Bersihkan data akun pengujian dari Store
    if (store && store.assessors) {
      store.assessors.delete(testUser);
      store.assessors.delete("audit_pass_leak");
      store.assessors.delete("koor_pendek");
    }
    if (store && store.assessorsDir && fs.existsSync(store.assessorsDir)) {
      [testUser, "audit_pass_leak", "koor_pendek"].forEach((u) => {
        const fp = path.join(store.assessorsDir, `${u}.json`);
        if (fs.existsSync(fp)) {
          try { fs.unlinkSync(fp); } catch (e) {}
        }
      });
    }

    // Tutup server jika dibuka oleh tes ini
    if (startedLocalServer && server.listening) {
      await new Promise((resolve) => server.close(resolve));
      server.unref?.();
    }
  });

  it("1. Akun koordinator berhasil dibuat dengan password acak dan bisa login ke /api/auth/login-assessor", async () => {
    const created = await createAssessor({
      username: testUser,
      role: "koordinator",
      password: randomPassword12,
      nama: "Koordinator Dev Test",
      customStore: store
    });

    assert.strictEqual(created.ok, true);
    assert.strictEqual(created.username, testUser);
    assert.strictEqual(created.role, "coordinator");

    // Login via endpoint resmi
    const res = await fetch(`${baseUrl}/api/auth/login-assessor`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: testUser,
        password: randomPassword12
      })
    });

    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.ok, true);
    assert.ok(data.token, "Token JWT harus ada");
    assert.strictEqual(data.user.role, "coordinator");
  });

  it("2. Password kurang dari 12 karakter ditolak dengan pesan galat", async () => {
    await assert.rejects(
      async () => {
        await createAssessor({
          username: "koor_pendek",
          role: "koordinator",
          password: "pendek123", // hanya 9 karakter (< 12)
          customStore: store
        });
      },
      (err) => {
        assert.match(err.message, /minimal 12 karakter/i);
        return true;
      }
    );
  });

  it("3. Username ganda ditolak", async () => {
    await assert.rejects(
      async () => {
        await createAssessor({
          username: testUser, // sudah dibuat di tes 1
          role: "koordinator",
          password: randomPassword12,
          customStore: store
        });
      },
      (err) => {
        assert.match(err.message, /sudah terdaftar/i);
        return true;
      }
    );
  });

  it("4. Password tidak muncul di keluaran fungsi maupun di Store dalam bentuk plaintext", async () => {
    const leakPass = "RandomPass_" + crypto.randomBytes(6).toString("hex") + "!@#";
    const created = await createAssessor({
      username: "audit_pass_leak",
      role: "asesor",
      password: leakPass,
      customStore: store
    });

    // Cek hasil kembalian fungsi tidak memuat password
    assert.strictEqual(created.password, undefined);
    assert.strictEqual(created.passwordHash, undefined);

    // Cek record di Store
    const saved = await store.findAssessorByUsername("audit_pass_leak");
    assert.ok(saved);
    assert.strictEqual(saved.password, undefined);
    assert.strictEqual(saved.passwordPlain, undefined);
    assert.ok(saved.passwordHash.startsWith("$2"), "Password wajib disimpan sebagai bcrypt hash");
    assert.notStrictEqual(saved.passwordHash, leakPass);

    // Cek serialisasi JSON tidak membocorkan plaintext password
    const jsonString = JSON.stringify(saved);
    assert.strictEqual(jsonString.includes(leakPass), false);
  });

  it("5. Login koordinator bisa memanggil unlock-account, login mahasiswa tidak bisa (403)", async () => {
    // 1. Dapatkan token koordinator
    const resKoor = await fetch(`${baseUrl}/api/auth/login-assessor`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: testUser,
        password: randomPassword12
      })
    });
    const dataKoor = await resKoor.json();
    const koorToken = dataKoor.token;

    // 2. Koordinator memanggil unlock-account -> 200
    const resUnlockKoor = await fetch(`${baseUrl}/api/auth/unlock-account`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${koorToken}`
      },
      body: JSON.stringify({ identifier: "DEV-LOCK-1" })
    });
    assert.strictEqual(resUnlockKoor.status, 200);
    const unlockData = await resUnlockKoor.json();
    assert.strictEqual(unlockData.ok, true);

    // 3. Token mahasiswa memanggil unlock-account -> 403
    const studentToken = signJwt({
      sub: "DEV-A01",
      name: "Mahasiswa Test",
      role: "student",
      corridor: "KOR-A"
    });

    const resUnlockStudent = await fetch(`${baseUrl}/api/auth/unlock-account`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${studentToken}`
      },
      body: JSON.stringify({ identifier: "DEV-LOCK-1" })
    });
    assert.strictEqual(resUnlockStudent.status, 403);

    // 4. Tanpa token memanggil unlock-account -> 401
    const resUnlockNoToken = await fetch(`${baseUrl}/api/auth/unlock-account`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: "DEV-LOCK-1" })
    });
    assert.strictEqual(resUnlockNoToken.status, 401);
  });

  it("6. CLI promptHiddenPassword langsung menolak jika stdin bukan terminal interaktif (TTY)", async () => {
    // Saat dijalankan di lingkungan tes otomatis di mana stdin bukan TTY atau saat disimulasikan
    const origIsTTY = process.stdin.isTTY;
    process.stdin.isTTY = false;
    try {
      await assert.rejects(
        async () => {
          await promptHiddenPassword("Password: ");
        },
        (err) => {
          assert.match(err.message, /memerlukan terminal interaktif \(TTY\)/i);
          return true;
        }
      );
    } finally {
      process.stdin.isTTY = origIsTTY;
    }
  });
});
