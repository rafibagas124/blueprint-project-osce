const { describe, it, before, after, beforeEach } = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const { app, server, store, signJwt } = require("../../server");
const ExamAPI = require("../../js/exam-api");

describe("Fase 3E: Endpoint GET /api/progress & Modul Klien ExamAPI.fetchProgress", () => {
  let baseUrl;
  let testPort;
  let startedLocalServer = false;

  const testGroup = "G3E_" + crypto.randomBytes(4).toString("hex");

  const studentA = {
    nim: "MHS-3E-A-" + crypto.randomBytes(3).toString("hex"),
    nama: "Mahasiswa 3E-A",
    gender: "L",
    corridor: "KOR-A",
    group: testGroup,
    seat: 1
  };

  const studentB = {
    nim: "MHS-3E-B-" + crypto.randomBytes(3).toString("hex"),
    nama: "Mahasiswa 3E-B",
    gender: "P",
    corridor: "KOR-A",
    group: testGroup,
    seat: 2
  };

  const assessor = {
    username: "asr_3e_" + crypto.randomBytes(3).toString("hex"),
    nama: "dr. Penguji 3E",
    role: "assessor"
  };

  let tokenStudentA;
  let tokenStudentB;
  let tokenAssessor;

  before(async () => {
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

    await store.saveStudent(studentA);
    await store.saveStudent(studentB);
    await store.saveAssessor({
      username: assessor.username,
      nama: assessor.nama,
      role: "assessor",
      passwordHash: "dummy-hash"
    });

    tokenStudentA = signJwt({
      sub: studentA.nim,
      name: studentA.nama,
      role: "student",
      corridor: studentA.corridor,
      group: studentA.group
    });

    tokenStudentB = signJwt({
      sub: studentB.nim,
      name: studentB.nama,
      role: "student",
      corridor: studentB.corridor,
      group: studentB.group
    });

    tokenAssessor = signJwt({
      sub: assessor.username,
      name: assessor.nama,
      role: "assessor"
    });
  });

  after(async () => {
    ExamAPI.clearSubmittedStations();
    if (startedLocalServer && server.listening) {
      await new Promise((resolve) => server.close(resolve));
      server.unref?.();
    }
  });

  beforeEach(() => {
    ExamAPI.clearSubmittedStations();
  });

  describe("1. Endpoint Server GET /api/progress", () => {
    it("tanpa token autentikasi ditolak 401", async () => {
      const res = await fetch(`${baseUrl}/api/progress`);
      assert.strictEqual(res.status, 401);
      const data = await res.json();
      assert.match(data.error, /token/i);
    });

    it("token asesor ditolak 403 (hanya mahasiswa)", async () => {
      const res = await fetch(`${baseUrl}/api/progress`, {
        headers: { Authorization: `Bearer ${tokenAssessor}` }
      });
      assert.strictEqual(res.status, 403);
      const data = await res.json();
      assert.match(data.error, /mahasiswa/i);
    });

    it("query parameter tak dikenal ditolak 400 (Zod Strict)", async () => {
      const res = await fetch(`${baseUrl}/api/progress?invalidParam=123`, {
        headers: { Authorization: `Bearer ${tokenStudentA}` }
      });
      assert.strictEqual(res.status, 400);
    });

    it("mengembalikan { submittedStations: [] } sebelum mahasiswa submit stasiun apa pun", async () => {
      const res = await fetch(`${baseUrl}/api/progress`, {
        headers: { Authorization: `Bearer ${tokenStudentA}` }
      });
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.deepStrictEqual(data, { submittedStations: [] });
      assert.strictEqual(data.isCorrect, undefined);
      assert.strictEqual(data.score, undefined);
      assert.strictEqual(data.answerKey, undefined);
    });

    it("setelah submit, nomor stasiun muncul di progress; tidak memuat isCorrect, skor, atau kunci", async () => {
      // Dapatkan optionId untuk stasiun 1 dari endpoint stasiun
      const stRes = await fetch(`${baseUrl}/api/station/1`, {
        headers: { Authorization: `Bearer ${tokenStudentA}` }
      });
      const stData = await stRes.json();
      const firstOptId = stData.options[0].id;

      // Submit stasiun 1
      const subRes = await fetch(`${baseUrl}/api/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenStudentA}`
        },
        body: JSON.stringify({ stationNo: 1, optionId: firstOptId })
      });
      assert.strictEqual(subRes.status, 200);

      // Cek progres
      const progRes = await fetch(`${baseUrl}/api/progress`, {
        headers: { Authorization: `Bearer ${tokenStudentA}` }
      });
      assert.strictEqual(progRes.status, 200);
      const progData = await progRes.json();

      assert.deepStrictEqual(progData.submittedStations, [1]);
      // Pastikan HANYA properti submittedStations
      assert.strictEqual(Object.keys(progData).length, 1);
      assert.strictEqual(progData.isCorrect, undefined);
      assert.strictEqual(progData.score, undefined);
      assert.strictEqual(progData.skor, undefined);
      assert.strictEqual(progData.key, undefined);
    });

    it("mahasiswa lain (studentB) tidak melihat progres mahasiswa studentA", async () => {
      const res = await fetch(`${baseUrl}/api/progress`, {
        headers: { Authorization: `Bearer ${tokenStudentB}` }
      });
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.deepStrictEqual(data.submittedStations, []);
    });
  });

  describe("2. Modul Klien ExamAPI.fetchProgress & submitAnswer (Pure Functions / Mock Fetch)", () => {
    it("fetchProgress sukses mengambil data dan mengisi submittedStations lokal", async () => {
      const mockFetch = async (url, options) => {
        assert.strictEqual(url, "/api/progress");
        assert.strictEqual(options.headers["Authorization"], "Bearer test-jwt");
        return {
          ok: true,
          status: 200,
          json: async () => ({ submittedStations: [2, 4] })
        };
      };

      const result = await ExamAPI.fetchProgress({ token: "test-jwt", fetchFn: mockFetch });
      assert.deepStrictEqual(result.submittedStations, [2, 4]);
      assert.strictEqual(ExamAPI.isStationSubmitted(2), true);
      assert.strictEqual(ExamAPI.isStationSubmitted(4), true);
      assert.strictEqual(ExamAPI.isStationSubmitted(1), false);
      assert.deepStrictEqual(ExamAPI.getSubmittedStations(), [2, 4]);
    });

    it("fetchProgress menangani galat 401 dan melempar error sesi berakhir", async () => {
      const mockFetch = async () => ({
        ok: false,
        status: 401,
        json: async () => ({ error: "Unauthorized" })
      });

      await assert.rejects(
        async () => {
          await ExamAPI.fetchProgress({ token: "bad-token", fetchFn: mockFetch });
        },
        (err) => err.status === 401 && /sesi telah berakhir/i.test(err.message)
      );
    });

    it("fetchProgress menangani galat 429 dan melempar pesan coba lagi sebentar", async () => {
      const mockFetch = async () => ({
        ok: false,
        status: 429,
        json: async () => ({ error: "Too many requests" })
      });

      await assert.rejects(
        async () => {
          await ExamAPI.fetchProgress({ token: "valid-jwt", fetchFn: mockFetch });
        },
        (err) => err.status === 429 && /coba lagi sebentar/i.test(err.message)
      );
    });

    it("fetchProgress menangani jaringan putus dan menandai isNetworkError: true", async () => {
      const mockFetch = async () => {
        throw new TypeError("Failed to fetch");
      };

      await assert.rejects(
        async () => {
          await ExamAPI.fetchProgress({ token: "valid-jwt", fetchFn: mockFetch });
        },
        (err) => err.isNetworkError === true && /koneksi jaringan terputus/i.test(err.message)
      );
    });

    it("jika submit gagal karena jaringan, stasiun TIDAK ditandai terkirim", async () => {
      const mockFetch = async (url) => {
        if (url === "/api/progress") {
          return { ok: true, status: 200, json: async () => ({ submittedStations: [] }) };
        }
        if (url === "/api/submit") {
          throw new TypeError("Network error when posting submit");
        }
      };

      await assert.rejects(
        async () => {
          await ExamAPI.submitAnswer(3, "opt-xyz", { token: "token", fetchFn: mockFetch });
        },
        (err) => err.isNetworkError === true
      );

      assert.strictEqual(ExamAPI.isStationSubmitted(3), false);
    });

    it("stasiun yang sudah tercatat terkirim tidak memanggil POST /api/submit lagi", async () => {
      let submitCalled = false;
      const mockFetch = async (url) => {
        if (url === "/api/progress") {
          return { ok: true, status: 200, json: async () => ({ submittedStations: [5] }) };
        }
        if (url === "/api/submit") {
          submitCalled = true;
          return { ok: true, status: 200, json: async () => ({ accepted: true, stationNo: 5 }) };
        }
      };

      // Ambil progres terlebih dahulu (sebagaimana dilakukan saat login / masuk ujian)
      await ExamAPI.fetchProgress({ token: "token", fetchFn: mockFetch });
      const res = await ExamAPI.submitAnswer(5, "opt-abc", { token: "token", fetchFn: mockFetch });
      assert.strictEqual(res.accepted, true);
      assert.strictEqual(res.alreadySubmitted, true);
      assert.strictEqual(submitCalled, false, "Endpoint POST /api/submit tidak boleh dipanggil");

      // Cek juga skenario kirim ulang dengan opsi checkProgress: true
      ExamAPI.clearSubmittedStations();
      const res2 = await ExamAPI.submitAnswer(5, "opt-abc", { token: "token", fetchFn: mockFetch, checkProgress: true });
      assert.strictEqual(res2.accepted, true);
      assert.strictEqual(res2.alreadySubmitted, true);
      assert.strictEqual(submitCalled, false, "Endpoint POST /api/submit tidak boleh dipanggil");
    });
  });
});
