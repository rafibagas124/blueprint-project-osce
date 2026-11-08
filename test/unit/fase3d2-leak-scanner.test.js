const { describe, it, before, after } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { WebSocket } = require("ws");
const { server, store, signJwt } = require("../../server");
const { createAssessor } = require("../../src/scripts/create-assessor");

describe("Fase 3D-2: Pemindai Kebocoran Kunci & Penolakan WS update_station_quiz", () => {
  const ROOT_DIR = path.resolve(__dirname, "../..");
  let wsUrl;
  let testPort;
  let startedLocalServer = false;

  // Akun asesor pengujian dengan kredensial acak per eksekusi
  const randomAssessorUser = "as_3d2_" + crypto.randomBytes(4).toString("hex");
  const randomAssessorPass = "Sec3D2_" + crypto.randomBytes(8).toString("hex") + "!#Aa";

  before(async () => {
    await new Promise((resolve) => {
      if (server.listening) {
        testPort = server.address().port;
        wsUrl = `ws://127.0.0.1:${testPort}/ws`;
        return resolve();
      }
      server.listen(0, "127.0.0.1", () => {
        startedLocalServer = true;
        testPort = server.address().port;
        wsUrl = `ws://127.0.0.1:${testPort}/ws`;
        resolve();
      });
    });
  });

  after(async () => {
    // Bersihkan akun pengujian dari Store jika ada
    if (store && store.assessors) {
      store.assessors.delete(randomAssessorUser);
    }
    if (store && store.assessorsDir) {
      const fp = path.join(store.assessorsDir, `${randomAssessorUser}.json`);
      if (fs.existsSync(fp)) {
        try { fs.unlinkSync(fp); } catch (e) {}
      }
    }

    if (startedLocalServer && server.listening) {
      await new Promise((resolve) => server.close(resolve));
      server.unref?.();
    }
  });

  describe("Pemindai Kebocoran Klien (Allowlist Static Files)", () => {
    const FORBIDDEN_PATTERNS = [
      "correct:",
      "correct :",
      '"correct"',
      "EXPLAIN",
      "rationale",
      "getStationRationale",
      "answerKey",
      "TODO_DOSEN"
    ];

    function getAllStaticFiles() {
      const files = [];

      // File root yang disajikan allowlist
      const rootFiles = ["blueprint.html", "index.html", "manifest.json", "sw.js"];
      rootFiles.forEach((rf) => {
        const fullPath = path.join(ROOT_DIR, rf);
        if (fs.existsSync(fullPath)) files.push(fullPath);
      });

      // Folder js/ (seluruh file)
      const jsDir = path.join(ROOT_DIR, "js");
      if (fs.existsSync(jsDir)) {
        fs.readdirSync(jsDir).forEach((f) => {
          if (f.endsWith(".js")) files.push(path.join(jsDir, f));
        });
      }

      // Folder css/ (seluruh file)
      const cssDir = path.join(ROOT_DIR, "css");
      if (fs.existsSync(cssDir)) {
        fs.readdirSync(cssDir).forEach((f) => {
          if (f.endsWith(".css")) files.push(path.join(cssDir, f));
        });
      }

      return files;
    }

    const staticFiles = getAllStaticFiles();

    it("menemukan file statis allowlist untuk dipindai (tidak kosong)", () => {
      assert.ok(staticFiles.length > 5, `File statis harus > 5, ditemukan ${staticFiles.length}`);
    });

    staticFiles.forEach((filePath) => {
      const relPath = path.relative(ROOT_DIR, filePath).replace(/\\/g, "/");

      it(`file '${relPath}' bebas dari seluruh pola kebocoran kunci & pembahasan`, () => {
        const content = fs.readFileSync(filePath, "utf8");

        FORBIDDEN_PATTERNS.forEach((pattern) => {
          const found = content.includes(pattern);
          assert.strictEqual(
            found,
            false,
            `Kebocoran terdeteksi pada file '${relPath}': mengandung pola terlarang '${pattern}'`
          );
        });
      });
    });
  });

  describe("WebSocket: Penolakan update_station_quiz", () => {
    // Helper dengan batas waktu agar tidak pernah menggantung (timeout 3000ms)
    function waitForWsOpen(ws, timeoutMs = 3000, errorMsg = "Batas waktu koneksi WebSocket terlampaui") {
      return new Promise((resolve, reject) => {
        if (ws.readyState === WebSocket.OPEN) return resolve();
        let timer = null;
        const onOpen = () => { cleanup(); resolve(); };
        const onError = (err) => { cleanup(); reject(err); };
        const cleanup = () => {
          if (timer) clearTimeout(timer);
          ws.off("open", onOpen);
          ws.off("error", onError);
        };
        timer = setTimeout(() => {
          cleanup();
          reject(new Error(`${errorMsg} (${timeoutMs}ms)`));
        }, timeoutMs);
        ws.on("open", onOpen);
        ws.on("error", onError);
      });
    }

    function waitForWsMessage(ws, predicate, timeoutMs = 3000, errorMsg = "Batas waktu pesan WebSocket terlampaui") {
      return new Promise((resolve, reject) => {
        let timer = null;
        const onMessage = (raw) => {
          try {
            const msg = JSON.parse(raw.toString("utf8"));
            if (predicate(msg)) {
              cleanup();
              resolve(msg);
            }
          } catch (e) {}
        };
        const onError = (err) => {
          cleanup();
          reject(new Error(`WebSocket error: ${err.message}`));
        };
        const onClose = (code, reason) => {
          cleanup();
          reject(new Error(`WebSocket tertutup (code: ${code}, reason: ${reason})`));
        };
        const cleanup = () => {
          if (timer) clearTimeout(timer);
          ws.off("message", onMessage);
          ws.off("error", onError);
          ws.off("close", onClose);
        };
        timer = setTimeout(() => {
          cleanup();
          reject(new Error(`${errorMsg} (${timeoutMs}ms)`));
        }, timeoutMs);
        ws.on("message", onMessage);
        ws.on("error", onError);
        ws.on("close", onClose);
      });
    }

    it("server menolak pesan update_station_quiz dan TIDAK meneruskannya ke klien lain", async () => {
      // 1. Buat akun asesor di dalam tes dengan password acak per eksekusi
      await createAssessor({
        username: randomAssessorUser,
        role: "assessor",
        nama: "Asesor Uji 3D2",
        password: randomAssessorPass
      });

      // Login untuk mendapatkan JWT asesor valid
      const loginRes = await fetch(`http://127.0.0.1:${testPort}/api/auth/login-assessor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: randomAssessorUser,
          password: randomAssessorPass
        })
      });
      assert.strictEqual(loginRes.status, 200, "Login asesor harus sukses");
      const { token: assessorJwt } = await loginRes.json();
      assert.ok(assessorJwt, "Token JWT asesor harus ada");

      // JWT mahasiswa pengujian
      const studentJwt = signJwt({
        sub: "DEV-A01",
        name: "Mahasiswa Test",
        role: "student",
        corridor: "KOR-A",
        examGroupId: "A-1"
      });

      const wsAssessor = new WebSocket(wsUrl);
      const wsStudent = new WebSocket(wsUrl);

      try {
        await Promise.all([
          waitForWsOpen(wsAssessor, 3000, "Timeout koneksi wsAssessor"),
          waitForWsOpen(wsStudent, 3000, "Timeout koneksi wsStudent")
        ]);

        const assessorJoinedPromise = waitForWsMessage(
          wsAssessor,
          (m) => m.type === "joined",
          3000,
          "wsAssessor tidak menerima respon 'joined'"
        );
        const studentJoinedPromise = waitForWsMessage(
          wsStudent,
          (m) => m.type === "joined",
          3000,
          "wsStudent tidak menerima respon 'joined'"
        );

        // Join asesor & mahasiswa dengan schema valid (properti 'room', bukan 'roomId')
        wsAssessor.send(JSON.stringify({
          type: "join",
          clientId: "client-assessor-3d2",
          token: assessorJwt,
          room: "A-1"
        }));

        wsStudent.send(JSON.stringify({
          type: "join",
          clientId: "client-student-3d2",
          token: studentJwt,
          room: "A-1"
        }));

        await Promise.all([assessorJoinedPromise, studentJoinedPromise]);

        // Siapkan penunggu respons penolakan untuk asesor
        const assessorErrorPromise = waitForWsMessage(
          wsAssessor,
          (m) => m.type === "error" && m.code === "ws_update_quiz_rejected",
          3000,
          "Asesor tidak menerima error 'ws_update_quiz_rejected'"
        );

        // Pantau pesan pada mahasiswa: TIDAK boleh menerima update_station_quiz
        let studentReceivedQuizUpdate = false;
        const studentListener = (raw) => {
          try {
            const m = JSON.parse(raw.toString("utf8"));
            if (m.type === "update_station_quiz") {
              studentReceivedQuizUpdate = true;
            }
          } catch (e) {}
        };
        wsStudent.on("message", studentListener);

        // Kirim update_station_quiz dari asesor
        wsAssessor.send(JSON.stringify({
          type: "update_station_quiz",
          stationIdx: 0,
          wing: 0,
          updatedData: {
            decisionQuestion: "Pertanyaan palsu",
            options: [{ text: "Pilihan bocor", correct: true }]
          }
        }));

        const rejectedMsg = await assessorErrorPromise;
        assert.strictEqual(rejectedMsg.code, "ws_update_quiz_rejected");
        assert.match(rejectedMsg.message, /tidak diizinkan/i);

        // Tunggu sebentar untuk memastikan pesan tidak dibroadcast ke mahasiswa
        await new Promise((r) => setTimeout(r, 200));
        assert.strictEqual(studentReceivedQuizUpdate, false, "Mahasiswa tidak boleh menerima update_station_quiz");

        wsStudent.off("message", studentListener);
      } finally {
        wsAssessor.close();
        wsStudent.close();
      }
    });
  });
});
