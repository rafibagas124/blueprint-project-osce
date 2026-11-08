// =========================================================================
// UNIT TEST: FASE 3B — Lockout Global, Static Allowlist, & Endpoint Soal
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
  globalNimLockoutMap,
  clearLoginFailure,
  unlockAccount,
  resolveOptionId,
  generateOptionId
} = require("../../server");

const { getBank } = require("../../src/data/question-bank");

let baseUrl;
let testPort;

before(async () => {
  await store.clear();
  loginLockoutMap.clear();
  globalNimLockoutMap.clear();

  // Daftarkan asesor koordinator
  await store.saveAssessor({
    username: "koordinator_3b",
    passwordHash: bcrypt.hashSync(crypto.randomBytes(16).toString("hex"), 10),
    nama: "dr. Koordinator 3B",
    role: "coordinator"
  });

  // Daftarkan mahasiswa Koridor A
  await store.saveStudent({
    nim: "NIM-3B-A01",
    nama: "Mahasiswa 3B A",
    gender: "L",
    corridor: "KOR-A",
    group: "GRP-01",
    seat: 1,
    tokenHash: bcrypt.hashSync("token3BA", 10)
  });

  // Daftarkan mahasiswa Koridor B
  await store.saveStudent({
    nim: "NIM-3B-B01",
    nama: "Mahasiswa 3B B",
    gender: "P",
    corridor: "KOR-B",
    group: "GRP-01",
    seat: 2,
    tokenHash: bcrypt.hashSync("token3BB", 10)
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

// Helper JWT
function makeStudentJwt(nim, corridor, name = "Mahasiswa Test") {
  return signJwt({ sub: nim, name, corridor, group: "GRP-01", seat: 1, role: "student" });
}
function makeCoordinatorJwt() {
  return signJwt({ sub: "koordinator_3b", name: "dr. Koordinator 3B", role: "coordinator" });
}

// =========================================================================
// 3B.1 PERBAIKAN LOCKOUT (TAMBAHAN KECIL)
// =========================================================================
describe("3B.1 Perbaikan Lockout (Global NIM & IP Trust)", () => {
  beforeEach(() => {
    loginLockoutMap.clear();
    globalNimLockoutMap.clear();
    delete process.env.TRUST_PROXY;
  });

  it("1. Pergantian IP tidak menghapus hitungan per NIM (30 kegagalan mengunci akun permanen)", () => {
    const testNim = "NIM-GLOBAL-LOCK";

    // Simulasikan 30 kegagalan login dari 10 IP berbeda (masing-masing 3 kegagalan, tidak memicu batas 5 per IP)
    for (let ipIdx = 1; ipIdx <= 10; ipIdx++) {
      const ip = `192.168.1.${ipIdx}`;
      for (let attempt = 1; attempt <= 3; attempt++) {
        const { recordLoginFailure } = require("../../server");
        recordLoginFailure(ip, testNim);
      }
    }

    // Hitungan global NIM mencapai 30 -> terkunci permanen
    const { isIdentifierLocked } = require("../../server");
    const isLockedFromFreshIp = isIdentifierLocked("10.0.0.99", testNim);
    assert.equal(isLockedFromFreshIp, true, "NIM harus terkunci bahkan dari IP baru setelah 30 kegagalan");

    // Dibuka manual oleh koordinator
    unlockAccount(testNim);
    const isLockedAfterUnlock = isIdentifierLocked("10.0.0.99", testNim);
    assert.equal(isLockedAfterUnlock, false, "Kunci global NIM harus terhapus setelah dibuka koordinator");
  });

  it("2. Header palsu X-Forwarded-For tidak mengubah IP saat TRUST_PROXY nonaktif", async () => {
    delete process.env.TRUST_PROXY;
    const { getClientIp } = require("../../server");

    const reqMock = {
      headers: { "x-forwarded-for": "203.0.113.195, 70.41.3.18" },
      socket: { remoteAddress: "127.0.0.1" }
    };

    const evaluatedIp = getClientIp(reqMock);
    assert.equal(evaluatedIp, "127.0.0.1", "Header X-Forwarded-For wajib diabaikan saat TRUST_PROXY nonaktif");

    // Jika TRUST_PROXY diaktifkan
    process.env.TRUST_PROXY = "true";
    const evaluatedTrustedIp = getClientIp(reqMock);
    assert.equal(evaluatedTrustedIp, "203.0.113.195", "Header X-Forwarded-For dipercaya saat TRUST_PROXY aktif");
    delete process.env.TRUST_PROXY;
  });

  it("3. unlock-account menolak pemanggil tanpa token (401) dan token mahasiswa (403), hanya koordinator yang berhasil (200)", async () => {
    const testNim = "2024-TEST-TARGET";

    // 1. Tanpa token -> 401
    const resNoToken = await fetch(`${baseUrl}/api/auth/unlock-account`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nim: testNim })
    });
    assert.equal(resNoToken.status, 401);

    // 2. Token mahasiswa -> 403
    const studentJwt = makeStudentJwt("NIM-3B-A01", "KOR-A");
    const resStudent = await fetch(`${baseUrl}/api/auth/unlock-account`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${studentJwt}`
      },
      body: JSON.stringify({ nim: testNim })
    });
    assert.equal(resStudent.status, 403);

    // 3. Token koordinator -> 200
    const koorJwt = makeCoordinatorJwt();
    const resKoor = await fetch(`${baseUrl}/api/auth/unlock-account`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${koorJwt}`
      },
      body: JSON.stringify({ nim: testNim })
    });
    assert.equal(resKoor.status, 200);
    const body = await resKoor.json();
    assert.equal(body.ok, true);
  });
});

// =========================================================================
// 3B.2 STATIC HANDLER ALLOWLIST
// =========================================================================
describe("3B.2 Static Handler memakai ALLOWLIST", () => {
  it("4. Halaman utama dan semua aset yang dirujuk tetap 200", async () => {
    const validEndpoints = [
      "/",
      "/blueprint.html",
      "/index.html",
      "/manifest.json",
      "/sw.js",
      "/css/style.css",
      "/js/app.js",
      "/vendor/three.min.js",
      "/icons/icon-192.png"
    ];

    for (const urlPath of validEndpoints) {
      const res = await fetch(`${baseUrl}${urlPath}`);
      assert.equal(res.status, 200, `Endpoint yang diizinkan ${urlPath} harus berstatus 200`);
    }
  });

  it("5. File rahasia, source code, data, git, env, csv semuanya 404", async () => {
    const forbiddenEndpoints = [
      "/server.js",
      "/package.json",
      "/src/data/question-bank.js",
      "/.git/config",
      "/test/unit/auth-roster.test.js",
      "/data/store.json",
      "/itest.js",
      "/loadtest.js",
      "/.env",
      "/.env.production",
      "/scores.csv",
      "/docs/SCORING.md",
      "/.vscode/settings.json"
    ];

    for (const urlPath of forbiddenEndpoints) {
      const res = await fetch(`${baseUrl}${urlPath}`);
      assert.equal(res.status, 404, `Endpoint terlarang ${urlPath} wajib berstatus 404`);
    }
  });
});

// =========================================================================
// 3B.3 ENDPOINT SOAL UNTUK MAHASISWA (GET /api/station/:stationNo)
// =========================================================================
describe("3B.3 Endpoint Soal untuk Mahasiswa (GET /api/station/:stationNo)", () => {
  it("6. Tanpa token autentikasi ditolak 401", async () => {
    const res = await fetch(`${baseUrl}/api/station/1`);
    assert.equal(res.status, 401);
  });

  it("7. Stasiun 10 (Istirahat) ditolak dengan 400", async () => {
    const jwt = makeStudentJwt("NIM-3B-A01", "KOR-A");
    const res = await fetch(`${baseUrl}/api/station/10`, {
      headers: { "Authorization": `Bearer ${jwt}` }
    });
    assert.equal(res.status, 400);
    const data = await res.json();
    assert.ok(data.error.includes("istirahat"));
  });

  it("8. Mahasiswa Koridor A tidak bisa meminta soal Koridor B (403)", async () => {
    const jwt = makeStudentJwt("NIM-3B-A01", "KOR-A");
    const res = await fetch(`${baseUrl}/api/station/1?corridor=KOR-B`, {
      headers: { "Authorization": `Bearer ${jwt}` }
    });
    assert.equal(res.status, 403);
    const data = await res.json();
    assert.ok(data.error.includes("tidak dapat mengakses soal koridor lain"));
  });

  it("9. Respons tidak memuat field/teks terlarang (correct, answerKey, checklist, pembahasan, TODO_DOSEN)", async () => {
    const jwtA = makeStudentJwt("NIM-3B-A01", "KOR-A");
    const jwtB = makeStudentJwt("NIM-3B-B01", "KOR-B");

    // Uji respons stasiun 1 Koridor A dan Koridor B
    for (const [jwt, sNo] of [[jwtA, 1], [jwtB, 1], [jwtA, 2], [jwtB, 3]]) {
      const res = await fetch(`${baseUrl}/api/station/${sNo}`, {
        headers: { "Authorization": `Bearer ${jwt}` }
      });
      assert.equal(res.status, 200);
      const rawText = await res.text();

      const forbiddenStrings = [
        "\"correct\"",
        "\"answerKey\"",
        "\"checklist\"",
        "\"pembahasan\"",
        "TODO_DOSEN"
      ];

      for (const kw of forbiddenStrings) {
        assert.ok(!rawText.includes(kw), `Respons stasiun ${sNo} tidak boleh memuat kata terlarang: ${kw}`);
      }
    }
  });

  it("10. Refresh menghasilkan urutan dan id opsi yang sama persis (deterministik)", async () => {
    const jwt = makeStudentJwt("NIM-3B-A01", "KOR-A");

    const res1 = await fetch(`${baseUrl}/api/station/1`, { headers: { "Authorization": `Bearer ${jwt}` } });
    const data1 = await res1.json();

    const res2 = await fetch(`${baseUrl}/api/station/1`, { headers: { "Authorization": `Bearer ${jwt}` } });
    const data2 = await res2.json();

    assert.deepEqual(data1.options, data2.options, "Urutan dan ID opsi wajib sama persis saat refresh");
  });

  it("11. Dua mahasiswa berbeda menghasilkan id opsi yang berbeda", async () => {
    const jwtA = makeStudentJwt("NIM-STUDENT-ALPHA", "KOR-A");
    const jwtB = makeStudentJwt("NIM-STUDENT-BETA", "KOR-A");

    const resA = await fetch(`${baseUrl}/api/station/1`, { headers: { "Authorization": `Bearer ${jwtA}` } });
    const dataA = await resA.json();

    const resB = await fetch(`${baseUrl}/api/station/1`, { headers: { "Authorization": `Bearer ${jwtB}` } });
    const dataB = await resB.json();

    const idsA = dataA.options.map((o) => o.id).join(",");
    const idsB = dataB.options.map((o) => o.id).join(",");
    assert.notEqual(idsA, idsB, "Dua mahasiswa berbeda harus mendapatkan optionId yang berbeda");
  });

  it("12. resolveOptionId benar untuk semua opsi asli dan null untuk optionId palsu", () => {
    const nim = "NIM-3B-A01";
    const corridor = "KOR-A";
    const stationNo = 1;
    const st = getBank(corridor, stationNo);

    // Verifikasi semua opsi asli
    for (let origIdx = 0; origIdx < st.options.length; origIdx++) {
      const optId = generateOptionId(nim, corridor, stationNo, origIdx);
      const resolved = resolveOptionId(nim, corridor, stationNo, optId);
      assert.equal(resolved, origIdx, `resolveOptionId harus mengembalikan indeks asli ${origIdx}`);
    }

    // Opsi palsu / sembarang -> null
    const fakeResolved = resolveOptionId(nim, corridor, stationNo, "fake-opt-id-xyz");
    assert.equal(fakeResolved, null, "resolveOptionId harus null untuk optionId yang tidak valid");
  });
});
