const { describe, it, beforeEach } = require("node:test");
const assert = require("node:assert");
const ExamAPI = require("../../js/exam-api.js");

describe("Fase 3D-1: Client Exam API (js/exam-api.js)", () => {
  beforeEach(() => {
    ExamAPI.clearSubmittedStations();
  });

  describe("fetchStation(stationNo)", () => {
    it("stasiun 10 istirahat tidak memanggil fetch dan mengembalikan status istirahat", async () => {
      let fetchCalled = false;
      const mockFetch = async () => {
        fetchCalled = true;
        return { ok: true, json: async () => ({}) };
      };

      const res = await ExamAPI.fetchStation(10, { fetchFn: mockFetch });
      assert.strictEqual(fetchCalled, false, "Stasiun 10 tidak boleh memanggil server");
      assert.strictEqual(res.isRest, true);
    });

    it("memanggil GET /api/station/:stationNo dengan header Authorization Bearer", async () => {
      let capturedUrl = "";
      let capturedOptions = null;

      const mockFetch = async (url, opts) => {
        capturedUrl = url;
        capturedOptions = opts;
        return {
          ok: true,
          status: 200,
          json: async () => ({
            ok: true,
            stationNo: 1,
            title: "Uji Emulsi",
            decisionQuestion: "Hitung HLB",
            options: [{ id: "opt-1", text: "Pilihan A" }]
          })
        };
      };

      const data = await ExamAPI.fetchStation(1, {
        token: "test-token-jwt",
        fetchFn: mockFetch
      });

      assert.strictEqual(capturedUrl, "/api/station/1");
      assert.strictEqual(capturedOptions.method, "GET");
      assert.strictEqual(capturedOptions.headers["Authorization"], "Bearer test-token-jwt");
      assert.strictEqual(data.stationNo, 1);
      assert.strictEqual(data.options[0].id, "opt-1");
    });

    it("menangani status 401 (sesi berakhir)", async () => {
      const mockFetch = async () => ({
        ok: false,
        status: 401,
        json: async () => ({ error: "Token tidak valid" })
      });

      await assert.rejects(
        async () => {
          await ExamAPI.fetchStation(2, { token: "expired-token", fetchFn: mockFetch });
        },
        (err) => {
          assert.strictEqual(err.status, 401);
          assert.match(err.message, /Sesi telah berakhir/);
          return true;
        }
      );
    });

    it("menangani status 429 (rate limit)", async () => {
      const mockFetch = async () => ({
        ok: false,
        status: 429,
        json: async () => ({ error: "Terlalu banyak permintaan" })
      });

      await assert.rejects(
        async () => {
          await ExamAPI.fetchStation(3, { token: "test-token", fetchFn: mockFetch });
        },
        (err) => {
          assert.strictEqual(err.status, 429);
          assert.match(err.message, /Terlalu banyak permintaan/);
          return true;
        }
      );
    });

    it("menangani jaringan putus (network error)", async () => {
      const mockFetch = async () => {
        throw new TypeError("Failed to fetch");
      };

      await assert.rejects(
        async () => {
          await ExamAPI.fetchStation(4, { token: "test-token", fetchFn: mockFetch });
        },
        (err) => {
          assert.strictEqual(err.isNetworkError, true);
          assert.match(err.message, /Koneksi jaringan terputus/);
          return true;
        }
      );
    });
  });

  describe("submitAnswer(stationNo, optionId)", () => {
    it("mengirim POST /api/submit dengan body HANYA { stationNo, optionId }", async () => {
      let capturedUrl = "";
      let capturedOptions = null;

      const mockFetch = async (url, opts) => {
        capturedUrl = url;
        capturedOptions = opts;
        return {
          ok: true,
          status: 200,
          json: async () => ({ accepted: true, stationNo: 1 })
        };
      };

      const result = await ExamAPI.submitAnswer(1, "opt-xyz-123", {
        token: "token-mahasiswa",
        fetchFn: mockFetch
      });

      assert.strictEqual(capturedUrl, "/api/submit");
      assert.strictEqual(capturedOptions.method, "POST");
      assert.strictEqual(capturedOptions.headers["Authorization"], "Bearer token-mahasiswa");

      const bodyObj = JSON.parse(capturedOptions.body);
      const keys = Object.keys(bodyObj).sort();
      assert.deepStrictEqual(keys, ["optionId", "stationNo"]);
      assert.strictEqual(bodyObj.stationNo, 1);
      assert.strictEqual(bodyObj.optionId, "opt-xyz-123");

      // Pastikan field terlarang tidak pernah ada
      assert.strictEqual(bodyObj.score, undefined);
      assert.strictEqual(bodyObj.isCorrect, undefined);
      assert.strictEqual(bodyObj.rating, undefined);
      assert.strictEqual(bodyObj.nim, undefined);

      assert.strictEqual(result.accepted, true);
    });

    it("submit kedua untuk stasiun yang sama ditahan di sisi klien (idempoten)", async () => {
      let callCount = 0;
      const mockFetch = async () => {
        callCount++;
        return {
          ok: true,
          status: 200,
          json: async () => ({ accepted: true, stationNo: 2 })
        };
      };

      const firstSubmit = await ExamAPI.submitAnswer(2, "opt-abc", {
        token: "tok",
        fetchFn: mockFetch
      });
      assert.strictEqual(callCount, 1);
      assert.strictEqual(firstSubmit.accepted, true);
      assert.strictEqual(ExamAPI.isStationSubmitted(2), true);

      // Submit kedua untuk stasiun 2 dengan jawaban berbeda
      const secondSubmit = await ExamAPI.submitAnswer(2, "opt-other", {
        token: "tok",
        fetchFn: mockFetch
      });

      assert.strictEqual(callCount, 1, "Fetch tidak boleh dipanggil kedua kalinya untuk stasiun yang sama");
      assert.strictEqual(secondSubmit.accepted, true);
      assert.strictEqual(secondSubmit.alreadySubmitted, true);
    });

    it("menangani status 401 pada submit", async () => {
      const mockFetch = async () => ({
        ok: false,
        status: 401,
        json: async () => ({ error: "Sesi expired" })
      });

      await assert.rejects(
        async () => {
          await ExamAPI.submitAnswer(3, "opt-a", { token: "bad-token", fetchFn: mockFetch });
        },
        (err) => {
          assert.strictEqual(err.status, 401);
          assert.match(err.message, /Sesi telah berakhir/);
          return true;
        }
      );
    });

    it("menangani status 429 pada submit", async () => {
      const mockFetch = async () => ({
        ok: false,
        status: 429,
        json: async () => ({ error: "Rate limit" })
      });

      await assert.rejects(
        async () => {
          await ExamAPI.submitAnswer(3, "opt-a", { token: "valid-tok", fetchFn: mockFetch });
        },
        (err) => {
          assert.strictEqual(err.status, 429);
          assert.match(err.message, /Terlalu banyak permintaan/);
          return true;
        }
      );
    });

    it("menangani kegagalan jaringan saat submit", async () => {
      const mockFetch = async () => {
        throw new Error("Network offline");
      };

      await assert.rejects(
        async () => {
          await ExamAPI.submitAnswer(5, "opt-b", { token: "tok", fetchFn: mockFetch });
        },
        (err) => {
          assert.strictEqual(err.isNetworkError, true);
          assert.match(err.message, /Koneksi jaringan terputus/);
          return true;
        }
      );
    });
  });
});
