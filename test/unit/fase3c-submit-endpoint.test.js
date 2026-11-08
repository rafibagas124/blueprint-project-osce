// =========================================================================
// UNIT TEST: FASE 3C — Penilaian Otoritatif Server (POST /api/submit)
// =========================================================================
const { describe, it, before, after, beforeEach } = require("node:test");
const assert = require("node:assert/strict");
const bcrypt = require("bcryptjs");
const crypto = require("node:crypto");
const { WebSocket } = require("ws");

const {
  app,
  server,
  store,
  signJwt,
  generateOptionId,
  getAnswerKey
} = require("../../server");

let baseUrl;
let testPort;
let wsUrl;

before(async () => {
  await store.clear();

  // Daftarkan mahasiswa Koridor A
  await store.saveStudent({
    nim: "2024-3C001",
    nama: "apt. Cinta Rahmawati",
    gender: "P",
    corridor: "KOR-A",
    group: "GRP-01",
    seat: 1,
    tokenHash: bcrypt.hashSync("tokenRahasia3C", 10)
  });

  // Daftarkan asesor
  await store.saveAssessor({
    username: "asesor_3c",
    passwordHash: bcrypt.hashSync(crypto.randomBytes(16).toString("hex"), 10),
    nama: "dr. Asesor 3C",
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

after(() => {
  server.close();
  server.unref?.();
});

function makeStudentJwt(nim = "2024-3C001", corridor = "KOR-A") {
  return signJwt({ sub: nim, name: "apt. Cinta Rahmawati", corridor, group: "GRP-01", seat: 1, role: "student" });
}

function makeAssessorJwt() {
  return signJwt({ sub: "asesor_3c", name: "dr. Asesor 3C", role: "assessor" });
}

describe("Fase 3C: Penilaian Otoritatif POST /api/submit", () => {
  beforeEach(async () => {
    await store.clear();
    await store.saveStudent({
      nim: "2024-3C001",
      nama: "apt. Cinta Rahmawati",
      gender: "P",
      corridor: "KOR-A",
      group: "GRP-01",
      seat: 1,
      tokenHash: bcrypt.hashSync("tokenRahasia3C", 10)
    });
  });

  it("1. Jawaban benar menghasilkan skor 100, jawaban salah menghasilkan skor 0 di Store", async () => {
    const nim = "2024-3C001";
    const jwt = makeStudentJwt(nim, "KOR-A");

    // Stasiun 1: Jawaban benar
    const keySt1 = getAnswerKey("KOR-A", 1);
    const correctOptIdSt1 = generateOptionId(nim, "KOR-A", 1, keySt1.correctIndex);

    const res1 = await fetch(`${baseUrl}/api/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${jwt}` },
      body: JSON.stringify({ stationNo: 1, optionId: correctOptIdSt1 })
    });
    assert.equal(res1.status, 200);
    const body1 = await res1.json();
    assert.equal(body1.accepted, true);

    const sub1 = await store.findSubmission("GRP-01", nim, 1);
    assert.ok(sub1, "Submission Stasiun 1 harus ada di Store");
    assert.equal(sub1.isCorrect, true);
    assert.equal(sub1.score, 100);

    // Stasiun 2: Jawaban salah
    const keySt2 = getAnswerKey("KOR-A", 2);
    const wrongIdxSt2 = (keySt2.correctIndex + 1) % 3;
    const wrongOptIdSt2 = generateOptionId(nim, "KOR-A", 2, wrongIdxSt2);

    const res2 = await fetch(`${baseUrl}/api/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${jwt}` },
      body: JSON.stringify({ stationNo: 2, optionId: wrongOptIdSt2 })
    });
    assert.equal(res2.status, 200);

    const sub2 = await store.findSubmission("GRP-01", nim, 2);
    assert.ok(sub2, "Submission Stasiun 2 harus ada di Store");
    assert.equal(sub2.isCorrect, false);
    assert.equal(sub2.score, 0);
  });

  it("2. Field palsu dari klien (score, isCorrect, rating) membuat request ditolak 400 (Zod Strict)", async () => {
    const jwt = makeStudentJwt();
    const key = getAnswerKey("KOR-A", 1);
    const optId = generateOptionId("2024-3C001", "KOR-A", 1, key.correctIndex);

    // Klien mencoba mengirimkan score dan isCorrect palsu
    const res = await fetch(`${baseUrl}/api/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${jwt}` },
      body: JSON.stringify({
        stationNo: 1,
        optionId: optId,
        score: 100,
        isCorrect: true
      })
    });
    assert.equal(res.status, 400, "Request dengan field tak dikenal wajib ditolak 400");
  });

  it("3. optionId palsu / sembarang ditolak 400", async () => {
    const jwt = makeStudentJwt();
    const res = await fetch(`${baseUrl}/api/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${jwt}` },
      body: JSON.stringify({
        stationNo: 1,
        optionId: "fake-option-id-999"
      })
    });
    assert.equal(res.status, 400);
    const data = await res.json();
    assert.ok(data.error.includes("Option ID tidak valid"));
  });

  it("4. S10 ditolak (400)", async () => {
    const jwt = makeStudentJwt();
    const res = await fetch(`${baseUrl}/api/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${jwt}` },
      body: JSON.stringify({
        stationNo: 10,
        optionId: "random-opt-id"
      })
    });
    assert.equal(res.status, 400);
  });

  it("5. Stasiun di luar 1-9 (misal stasiun 0 atau 11) ditolak 400", async () => {
    const jwt = makeStudentJwt();
    const res0 = await fetch(`${baseUrl}/api/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${jwt}` },
      body: JSON.stringify({ stationNo: 0, optionId: "some-id" })
    });
    assert.equal(res0.status, 400);

    const res11 = await fetch(`${baseUrl}/api/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${jwt}` },
      body: JSON.stringify({ stationNo: 11, optionId: "some-id" })
    });
    assert.equal(res11.status, 400);
  });

  it("6. Submit ganda dengan jawaban berbeda tidak mengubah skor dan hanya ada satu data di Store", async () => {
    const nim = "2024-3C001";
    const jwt = makeStudentJwt(nim);
    const key = getAnswerKey("KOR-A", 3);
    const correctOptId = generateOptionId(nim, "KOR-A", 3, key.correctIndex);
    const wrongOptId = generateOptionId(nim, "KOR-A", 3, (key.correctIndex + 1) % 3);

    // Submit pertama: BENAR
    const res1 = await fetch(`${baseUrl}/api/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${jwt}` },
      body: JSON.stringify({ stationNo: 3, optionId: correctOptId })
    });
    assert.equal(res1.status, 200);

    // Submit kedua: SALAH (mencoba mengubah)
    const res2 = await fetch(`${baseUrl}/api/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${jwt}` },
      body: JSON.stringify({ stationNo: 3, optionId: wrongOptId })
    });
    assert.equal(res2.status, 200);
    const body2 = await res2.json();
    assert.equal(body2.accepted, true);

    // Periksa Store: Skor harus tetap 100 dan jawaban asli tetap tersimpan
    const list = await store.listSubmissions({ examGroupId: "GRP-01", nim, stationNo: 3 });
    assert.equal(list.length, 1, "Harus hanya ada tepat 1 record di Store");
    assert.equal(list[0].score, 100, "Skor submit pertama tidak boleh berubah");
    assert.equal(list[0].selectedOption, key.correctIndex);
  });

  it("7. 20 submit paralel yang sama menghasilkan tepat satu data di Store", async () => {
    const nim = "2024-3C001";
    const jwt = makeStudentJwt(nim);
    const key = getAnswerKey("KOR-A", 4);
    const optId = generateOptionId(nim, "KOR-A", 4, key.correctIndex);

    const promises = Array.from({ length: 20 }, () =>
      fetch(`${baseUrl}/api/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${jwt}` },
        body: JSON.stringify({ stationNo: 4, optionId: optId })
      })
    );

    const responses = await Promise.all(promises);
    for (const r of responses) {
      assert.equal(r.status, 200);
      const b = await r.json();
      assert.equal(b.accepted, true);
    }

    const list = await store.listSubmissions({ examGroupId: "GRP-01", nim, stationNo: 4 });
    assert.equal(list.length, 1, "Harus tepat 1 record di Store setelah 20 submit paralel");
  });

  it("8. Respons tidak memuat isCorrect, skor, atau kunci", async () => {
    const nim = "2024-3C001";
    const jwt = makeStudentJwt(nim);
    const key = getAnswerKey("KOR-A", 5);
    const optId = generateOptionId(nim, "KOR-A", 5, key.correctIndex);

    const res = await fetch(`${baseUrl}/api/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${jwt}` },
      body: JSON.stringify({ stationNo: 5, optionId: optId })
    });
    assert.equal(res.status, 200);
    const rawText = await res.text();

    assert.ok(!rawText.includes("isCorrect"), "Respons tidak boleh membocorkan isCorrect");
    assert.ok(!rawText.includes("score"), "Respons tidak boleh membocorkan score");
    assert.ok(!rawText.includes("correct"), "Respons tidak boleh membocorkan correct");
    assert.ok(!rawText.includes("pembahasan"), "Respons tidak boleh membocorkan pembahasan");
    assert.ok(!rawText.includes("answerKey"), "Respons tidak boleh membocorkan answerKey");

    const parsed = JSON.parse(rawText);
    assert.deepEqual(Object.keys(parsed).sort(), ["accepted", "stationNo"]);
  });

  it("9. Tanpa token ditolak 401", async () => {
    const res = await fetch(`${baseUrl}/api/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stationNo: 1, optionId: "some-id" })
    });
    assert.equal(res.status, 401);
  });

  it("10. Token asesor tidak bisa submit (403)", async () => {
    const assessorJwt = makeAssessorJwt();
    const res = await fetch(`${baseUrl}/api/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${assessorJwt}` },
      body: JSON.stringify({ stationNo: 1, optionId: "some-id" })
    });
    assert.equal(res.status, 403);
    const data = await res.json();
    assert.ok(data.error.includes("Hanya mahasiswa aktif"));
  });

  it("11. Pesan WS 'score' ditolak dengan pesan galat dan Store tetap kosong", async () => {
    const jwt = makeStudentJwt();
    const ws = new WebSocket(wsUrl);

    await new Promise((resolve) => ws.on("open", resolve));

    // Kirim join
    ws.send(JSON.stringify({
      type: "join",
      clientId: "client-test-3c",
      token: jwt
    }));

    // Tunggu joined
    await new Promise((resolve) => {
      ws.on("message", (raw) => {
        const msg = JSON.parse(raw.toString("utf8"));
        if (msg.type === "joined") resolve();
      });
    });

    // Kirim pesan lama 'score' via WebSocket
    const errPromise = new Promise((resolve) => {
      ws.on("message", (raw) => {
        const msg = JSON.parse(raw.toString("utf8"));
        if (msg.type === "error" && msg.code === "ws_score_deprecated") {
          resolve(msg);
        }
      });
    });

    ws.send(JSON.stringify({
      type: "score",
      stationIdx: 0,
      selected: 0,
      score: 100,
      isCorrect: true
    }));

    const errMsg = await errPromise;
    assert.ok(errMsg, "Server harus membalas error ws_score_deprecated");
    assert.ok(errMsg.message.includes("POST /api/submit"));

    // Store harus tetap kosong (tidak ditulis sama sekali)
    const sub = await store.findSubmission("GRP-01", "2024-3C001", 1);
    assert.equal(sub, null, "Store tidak boleh ditulis oleh pesan WS score");

    ws.close();
  });
});
