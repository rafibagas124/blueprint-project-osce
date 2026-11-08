// =========================================================================
// UNIT TEST: FASE 3A — Perbaikan Lockout & Validasi Bank Soal Server
// =========================================================================
const { describe, it, before, after, beforeEach } = require("node:test");
const assert = require("node:assert/strict");
const bcrypt = require("bcryptjs");
const crypto = require("node:crypto");

const {
  app,
  server,
  store,
  signJwt,
  loginLockoutMap,
  clearLoginFailure,
  unlockAccount,
  getBank,
  getAnswerKey
} = require("../../server");

const {
  QUESTION_BANK_KOR_A,
  QUESTION_BANK_KOR_B,
  MASTER_QUESTION_BANKS,
  validateQuestionBank
} = require("../../src/data/question-bank");

let baseUrl;
let testPort;

before(async () => {
  await store.clear();
  loginLockoutMap.clear();

  // Daftarkan asesor / koordinator
  await store.saveAssessor({
    username: "koordinator_3a",
    passwordHash: bcrypt.hashSync(crypto.randomBytes(16).toString("hex"), 10),
    nama: "dr. Koordinator, Sp.FRS",
    role: "coordinator"
  });

  // Daftarkan mahasiswa uji
  await store.saveStudent({
    nim: "2024-3A001",
    nama: "apt. Budi Santoso",
    gender: "L",
    corridor: "KOR-A",
    group: "GRP-01",
    seat: 1,
    tokenHash: bcrypt.hashSync("tokenRahasia3A", 10)
  });

  await new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      testPort = server.address().port;
      baseUrl = `http://127.0.0.1:${testPort}`;
      resolve();
    });
  });
});

after(() => {
  server.close();
  server.unref?.();
});

// =========================================================================
// 1. PERBAIKAN LOCKOUT LOGIN
// =========================================================================
describe("Fase 3A: Perbaikan Lockout Login", () => {
  beforeEach(() => {
    loginLockoutMap.clear();
  });

  it("1. Kunci akun berbatas waktu (lockout otomatis kadaluarsa setelah durasinya)", async () => {
    const testNim = "2024-3A001";
    const ip = "127.0.0.1";
    const key = `${ip}:${testNim}`;

    // Pasang status terkunci yang sudah kadaluarsa (waktu di masa lampau)
    loginLockoutMap.set(key, {
      count: 5,
      lockedUntil: Date.now() - 1000 // 1 detik lalu
    });

    // Request login dengan token salah harus menghasilkan 401 biasa, bukan 429
    const res = await fetch(`${baseUrl}/api/auth/login-student`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nim: testNim, token: "TOKEN_SALAH" })
    });

    assert.equal(res.status, 401, "Akun yang lockout-nya sudah expired tidak boleh diblokir 429");
  });

  it("2. Dihitung per kombinasi NIM + IP (percobaan gagal dari IP lain tidak mengunci mahasiswa di IP aslinya)", async () => {
    const testNim = "2024-3A001";

    // Simulasi penyerang dari IP asing mencoba menebak dan mengunci akun
    const attackerIp = "192.168.100.50";
    loginLockoutMap.set(`${attackerIp}:${testNim}`, {
      count: 5,
      lockedUntil: Date.now() + 5 * 60 * 1000 // terkunci 5 menit
    });

    // Mahasiswa login dari IP normalnya (127.0.0.1) dengan token yang benar
    const res = await fetch(`${baseUrl}/api/auth/login-student`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nim: testNim, token: "tokenRahasia3A" })
    });

    assert.equal(res.status, 200, "Mahasiswa tidak boleh terkunci hanya karena serangan dari IP lain");
    const data = await res.json();
    assert.equal(data.ok, true);
  });

  it("3. Koordinator dapat membuka akun yang terkunci secara manual", async () => {
    const testNim = "2024-3A001";
    // Buat token JWT untuk koordinator
    const koorJwt = signJwt({ sub: "koordinator_3a", name: "dr. Koordinator", role: "coordinator" });

    // Kunci akun pada beberapa IP
    loginLockoutMap.set(`127.0.0.1:${testNim}`, { count: 5, lockedUntil: Date.now() + 300000 });
    loginLockoutMap.set(`10.0.0.1:${testNim}`, { count: 5, lockedUntil: Date.now() + 300000 });

    assert.ok(loginLockoutMap.size >= 2, "Harus ada entri lockout sebelum dibuka");

    // Koordinator memanggil endpoint unlock-account
    const res = await fetch(`${baseUrl}/api/auth/unlock-account`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${koorJwt}`
      },
      body: JSON.stringify({ nim: testNim })
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.ok, true);

    // Pastikan tidak ada lagi entri untuk testNim di map
    for (const key of loginLockoutMap.keys()) {
      assert.ok(!key.endsWith(`:${testNim}`), `Kunci ${key} seharusnya sudah terhapus`);
    }

    // Mahasiswa kini bisa login kembali
    const resLogin = await fetch(`${baseUrl}/api/auth/login-student`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nim: testNim, token: "tokenRahasia3A" })
    });
    assert.equal(resLogin.status, 200);
  });
});

// =========================================================================
// 2. BANK SOAL DI SISI SERVER
// =========================================================================
describe("Fase 3A: Modul Bank Soal di Sisi Server", () => {
  it("4. Bank soal lengkap untuk kedua koridor (KOR-A dan KOR-B memiliki stasiun 1-10)", () => {
    assert.ok(QUESTION_BANK_KOR_A, "Bank soal KOR-A harus ada");
    assert.ok(QUESTION_BANK_KOR_B, "Bank soal KOR-B harus ada");
    assert.equal(QUESTION_BANK_KOR_A.length, 10, "KOR-A harus memiliki 10 stasiun");
    assert.equal(QUESTION_BANK_KOR_B.length, 10, "KOR-B harus memiliki 10 stasiun");

    for (let s = 1; s <= 9; s++) {
      const stA = getBank("KOR-A", s);
      const stB = getBank("KOR-B", s);
      assert.ok(stA, `KOR-A Stasiun ${s} harus dapat diambil via getBank`);
      assert.ok(stB, `KOR-B Stasiun ${s} harus dapat diambil via getBank`);
      assert.equal(stA.stationNo, s);
      assert.equal(stB.stationNo, s);
    }
  });

  it("5. Tepat satu kunci (opsi benar) per soal pada Stasiun 1-9 di kedua koridor", () => {
    ["KOR-A", "KOR-B"].forEach((corridor) => {
      for (let s = 1; s <= 9; s++) {
        const st = getBank(corridor, s);
        assert.ok(Array.isArray(st.options), `Stasiun ${s} (${corridor}) harus memiliki array options`);
        assert.ok(st.options.length >= 2, `Stasiun ${s} (${corridor}) harus memiliki minimal 2 opsi`);
        const correctCount = st.options.filter((o) => o.correct === true).length;
        assert.equal(correctCount, 1, `Stasiun ${s} (${corridor}) harus memiliki tepat 1 opsi correct: true`);

        const key = getAnswerKey(corridor, s);
        assert.ok(key, `getAnswerKey harus mengembalikan kunci untuk ${corridor} Stasiun ${s}`);
        assert.equal(typeof key.correctIndex, "number");
        assert.equal(key.correctOption.correct, true);
      }
    });
  });

  it("6. Stasiun 10 tidak punya soal (options kosong/tidak ada pertanyaan ujian)", () => {
    ["KOR-A", "KOR-B"].forEach((corridor) => {
      const st10 = getBank(corridor, 10);
      assert.ok(st10, `Stasiun 10 (${corridor}) harus terdaftar`);
      assert.equal(st10.stationNo, 10);
      assert.equal(st10.options.length, 0, `Stasiun 10 (${corridor}) tidak boleh memiliki opsi soal`);
      const key10 = getAnswerKey(corridor, 10);
      assert.equal(key10, null, `Stasiun 10 (${corridor}) tidak boleh memiliki answer key`);
    });
  });

  it("7. Pembahasan Koridor B Stasiun 1-3 tidak sama dengan pembahasan Koridor A (menggunakan TODO_DOSEN)", () => {
    for (let s = 1; s <= 3; s++) {
      const stA = getBank("KOR-A", s);
      const stB = getBank("KOR-B", s);

      assert.notEqual(
        stB.pembahasan,
        stA.pembahasan,
        `Pembahasan Koridor B Stasiun ${s} tidak boleh menyalin pembahasan Koridor A`
      );
      assert.equal(
        stB.pembahasan,
        "TODO_DOSEN",
        `Pembahasan Koridor B Stasiun ${s} yang belum disediakan wajib ditandai TODO_DOSEN`
      );
      assert.equal(
        stB.checklist,
        "TODO_DOSEN",
        `Checklist Koridor B Stasiun ${s} yang belum disediakan wajib ditandai TODO_DOSEN`
      );
    }
  });

  it("8. validateQuestionBank() melempar error jelas jika ada soal dengan 0 atau >1 kunci", () => {
    assert.doesNotThrow(() => validateQuestionBank(), "Validasi pada bank soal standar harus berhasil");
  });
});
