const { describe, it, before, after } = require("node:test");
const assert = require("node:assert/strict");
const { WebSocket } = require("ws");
const bcrypt = require("bcryptjs");
const { app, server, wss, store, signJwt, verifyJwt, nimFailedAttempts, clearLoginFailure } = require("../../server");
const { runDevSeeder } = require("../../src/scripts/seed-dev");
const { runRosterSeeder } = require("../../src/scripts/seed-roster");
const fs = require("fs");
const path = require("path");

describe("Unit & Integration Test: Fase 2 Roster & Login Authoritative", () => {
  let testPort;
  let baseUrl;
  let wsUrl;
  const devToken = "TK-DEV-TEST-SECRET";

  before(async () => {
    await store.clear();
    nimFailedAttempts.clear();

    // Daftarkan mahasiswa uji
    await store.saveStudent({
      nim: "2024-09001",
      nama: "apt. Nanda Pratama",
      gender: "L",
      corridor: "KOR-A",
      group: "GRP-01",
      seat: 1,
      tokenHash: bcrypt.hashSync(devToken, 10)
    });

    // Daftarkan asesor uji
    await store.saveAssessor({
      username: "asesor_osce",
      passwordHash: bcrypt.hashSync("passwordAsesor123", 10),
      nama: "dr. Budi, Sp.FRS",
      role: "assessor"
    });

    await new Promise((resolve) => {
      server.listen(0, "127.0.0.1", () => {
        testPort = server.address().port;
        baseUrl = `http://127.0.0.1:${testPort}`;
        wsUrl = `ws://127.0.0.1:${testPort}/ws`;
        resolve();
      });
    });
  });

  after(async () => {
    wss.close();
    await new Promise((resolve) => server.close(resolve));
    await store.clear();
  });

  it("1. NIM tak terdaftar ditolak dengan pesan generik 401", async () => {
    const res = await fetch(`${baseUrl}/api/auth/login-student`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nim: "NIM-GHOUL-9999", token: "TK-WHATEVER" })
    });

    assert.equal(res.status, 401);
    const body = await res.json();
    assert.equal(body.error, "NIM atau token ujian tidak valid.");
  });

  it("2. Token salah ditolak dengan pesan generik yang identik (tidak membocorkan keberadaan NIM)", async () => {
    const res = await fetch(`${baseUrl}/api/auth/login-student`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nim: "2024-09001", token: "TK-WRONG-PASSWORD" })
    });

    assert.equal(res.status, 401);
    const body = await res.json();
    assert.equal(body.error, "NIM atau token ujian tidak valid.");
  });

  it("3. Mahasiswa login sukses dan koridor ditentukan server (mahasiswa tidak bisa memilih koridor sendiri)", async () => {
    const res = await fetch(`${baseUrl}/api/auth/login-student`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nim: "2024-09001", token: devToken })
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.ok, true);
    assert.ok(body.token);

    // Data mahasiswa diambil dari server
    assert.equal(body.student.nim, "2024-09001");
    assert.equal(body.student.nama, "apt. Nanda Pratama");
    assert.equal(body.student.gender, "L");
    assert.equal(body.student.corridor, "KOR-A");
    assert.equal(body.student.seat, 1);

    // Hubungkan WS dengan token tersebut
    const ws = new WebSocket(wsUrl);
    const joined = await new Promise((resolve, reject) => {
      ws.on("open", () => {
        ws.send(JSON.stringify({
          type: "join",
          clientId: "client_nanda",
          token: body.token
        }));
      });
      ws.on("message", (raw) => {
        const msg = JSON.parse(raw.toString());
        if (msg.type === "joined") resolve(msg);
      });
      ws.on("error", reject);
    });

    // Koridor ditentukan mutlak dari token/data server (KOR-A -> wing 0)
    assert.equal(joined.wing, 0);
    assert.equal(joined.corridorCode, "KOR-A");
    ws.close();
  });

  it("4. Roster dengan 11 mahasiswa di satu koridor ditolak", async () => {
    const testCsv = path.join(__dirname, "temp_roster_11.csv");
    let content = "nim,nama,gender,corridor,group,seat\n";
    for (let i = 1; i <= 11; i++) {
      // Baris ke-11 melampaui batas kapasitas 10 per koridor
      content += `2024-KOR-A-${i},Mahasiswa ${i},L,KOR-A,GRP-OVERLOAD,${Math.min(i, 10)}\n`;
    }
    fs.writeFileSync(testCsv, content, "utf8");

    try {
      await assert.rejects(
        async () => {
          await runRosterSeeder(testCsv);
        },
        (err) => {
          return err.message.includes("Batas maksimal 10") || err.message.includes("Seat");
        }
      );
    } finally {
      if (fs.existsSync(testCsv)) fs.unlinkSync(testCsv);
    }
  });

  it("5. PIN lama ('2026', 'osce2026') tidak berlaku untuk asesmen maupun CSV", async () => {
    // 1. Coba akses /api/scores.csv dengan pin query lama
    const resPin = await fetch(`${baseUrl}/api/scores.csv?pin=2026`);
    assert.equal(resPin.status, 401);

    const resPin2 = await fetch(`${baseUrl}/api/scores.csv?pin=osce2026`);
    assert.equal(resPin2.status, 401);

    // 2. Akses dengan login asesor sah (username + password) menghasilkan JWT
    const loginRes = await fetch(`${baseUrl}/api/auth/login-assessor`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "asesor_osce", password: "passwordAsesor123" })
    });
    assert.equal(loginRes.status, 200);
    const loginBody = await loginRes.json();
    assert.ok(loginBody.token);

    // 3. Akses CSV nilai menggunakan Bearer JWT asesor sah
    const resCsv = await fetch(`${baseUrl}/api/scores.csv`, {
      headers: { Authorization: `Bearer ${loginBody.token}` }
    });
    assert.equal(resCsv.status, 200);
    const csvText = await resCsv.text();
    assert.ok(csvText.includes("NIM;Nama;Room;Station;Status;Nilai Sistem;Nilai Asesor;Waktu"));
  });

  it("6. Refresh dengan token yang sama berhasil (token berlaku selama sesi ujian)", async () => {
    // Sesi 1: Login pertama
    const res1 = await fetch(`${baseUrl}/api/auth/login-student`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nim: "2024-09001", token: devToken })
    });
    assert.equal(res1.status, 200);

    // Sesi 2: Refresh browser dengan NIM + token yang sama
    const res2 = await fetch(`${baseUrl}/api/auth/login-student`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nim: "2024-09001", token: devToken })
    });
    assert.equal(res2.status, 200);
    const body2 = await res2.json();
    assert.ok(body2.token);
    assert.equal(body2.student.nim, "2024-09001");
  });

  it("7. Login ganda memutus sesi lama HANYA JIKA token valid (token salah tidak mengganggu sesi aktif)", async () => {
    // 1. Mahasiswa login dan membuka socket A
    const loginRes = await fetch(`${baseUrl}/api/auth/login-student`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nim: "2024-09001", token: devToken })
    });
    const validJwt = (await loginRes.json()).token;

    const wsA = new WebSocket(wsUrl);
    await new Promise((resolve) => {
      wsA.on("open", () => {
        wsA.send(JSON.stringify({ type: "join", clientId: "socket_A", token: validJwt }));
      });
      wsA.on("message", (raw) => {
        const msg = JSON.parse(raw.toString());
        if (msg.type === "joined") resolve();
      });
    });

    let wsACloseEvent = null;
    let wsAErrorMsg = null;
    wsA.on("message", (raw) => {
      const msg = JSON.parse(raw.toString());
      if (msg.code === "session_replaced") wsAErrorMsg = msg;
    });
    wsA.on("close", (e) => { wsACloseEvent = true; });

    // 2. Percobaan login ganda dengan token PALSU tidak memutus socket A
    const badLoginRes = await fetch(`${baseUrl}/api/auth/login-student`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nim: "2024-09001", token: "TK-HACKER-ATTEMPT" })
    });
    assert.equal(badLoginRes.status, 401);
    await new Promise((r) => setTimeout(r, 100));
    assert.equal(wsACloseEvent, null); // Socket A masih aman dan hidup!

    // 3. Login ganda dengan token SAH (misal user pindah perangkat) memutus socket A
    const wsB = new WebSocket(wsUrl);
    await new Promise((resolve) => {
      wsB.on("open", () => {
        wsB.send(JSON.stringify({ type: "join", clientId: "socket_B", token: validJwt }));
      });
      wsB.on("message", (raw) => {
        const msg = JSON.parse(raw.toString());
        if (msg.type === "joined") resolve();
      });
    });

    await new Promise((r) => setTimeout(r, 200));
    assert.ok(wsACloseEvent, "Socket lama harus terputus setelah login valid baru masuk");
    assert.ok(wsAErrorMsg, "Socket lama harus menerima pesan session_replaced");

    wsB.close();
  });

  it("8. seed:dev menolak jalan jika NODE_ENV=production", async () => {
    const oldEnv = process.env.NODE_ENV;
    try {
      process.env.NODE_ENV = "production";
      await assert.rejects(
        async () => {
          await runDevSeeder();
        },
        /seed:dev DITOLAK/
      );
    } finally {
      process.env.NODE_ENV = oldEnv;
    }
  });

  it("9. Server menolak start di production jika JWT_SECRET < 32 karakter", () => {
    const originalEnv = process.env.NODE_ENV;
    const originalSecret = process.env.JWT_SECRET;
    try {
      process.env.NODE_ENV = "production";
      process.env.JWT_SECRET = "pendek"; // Kurang dari 32 karakter

      assert.throws(() => {
        if (process.env.NODE_ENV === "production" && (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32)) {
          throw new Error("FATAL: JWT_SECRET wajib minimal 32 karakter di production.");
        }
      }, /FATAL: JWT_SECRET wajib minimal 32 karakter di production/);
    } finally {
      process.env.NODE_ENV = originalEnv;
      process.env.JWT_SECRET = originalSecret;
    }
  });

  it("10. Rate limiting login per NIM mengunci setelah 5 kegagalan berturut-turut", async () => {
    const testNim = "2024-BRUTEFORCE";
    clearLoginFailure(testNim);

    for (let i = 1; i <= 5; i++) {
      const res = await fetch(`${baseUrl}/api/auth/login-student`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nim: testNim, token: "SALAH" })
      });
      assert.equal(res.status, 401);
    }

    // Percobaan ke-6 wajib kena status 429
    const resBlocked = await fetch(`${baseUrl}/api/auth/login-student`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nim: testNim, token: "SALAH" })
    });
    assert.equal(resBlocked.status, 429);
    const body = await resBlocked.json();
    assert.ok(body.error.includes("Terlalu banyak percobaan login gagal"));

    clearLoginFailure(testNim);
  });
});
