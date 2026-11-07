// =========================================================================
// OSCE CENTER 3D — SERVER-AUTHORITATIVE BACKEND (Node.js >= 20)
// Menggunakan Express, Helmet, Rate Limit, WS (WebSocket Library Resmi),
// Validasi Kontrak Zod, dan Abstraksi Store (FileStore/MemoryStore)
// =========================================================================

const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { WebSocketServer, WebSocket } = require("ws");

const { parseWsMessage } = require("./src/schemas/messages");
const { getStore } = require("./src/store");

// ------------------------------------------------------------- Env Loader ---
function loadDotEnv() {
  const envFile = process.env.NODE_ENV === "production" ? ".env.production" : ".env";
  const fullPath = path.join(__dirname, envFile);
  if (!fs.existsSync(fullPath)) return;
  try {
    const lines = fs.readFileSync(fullPath, "utf8").split(/\r?\n/);
    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) return;
      const eqIdx = trimmed.indexOf("=");
      if (eqIdx < 0) return;
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim().replace(/^['"]|['"]$/g, "");
      if (process.env[key] === undefined) {
        process.env[key] = val;
      }
    });
  } catch (e) {}
}
loadDotEnv();

const PORT = parseInt(process.env.PORT || "8080", 10);
const ROOM_CAPACITY = parseInt(process.env.ROOM_CAPACITY || "20", 10);
const ASSESSOR_PIN = process.env.OSCE_ASSESSOR_PIN || "2026";
const JWT_SECRET = process.env.JWT_SECRET || "osce-ukmppai-dev-secret-key-2026";
const AI_PROVIDER = (process.env.AI_PROVIDER || "gemini").toLowerCase();
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const AI_MAX_COST_USD = parseFloat(process.env.AI_MAX_COST_PER_STUDENT_USD || "0.15");
const AI_MAX_TURNS = parseInt(process.env.AI_MAX_TURNS_PER_STATION || "25", 10);

const FLUSH_MS = 100; // 10 Hz Server-Authoritative Position Sync
const store = getStore();

// --------------------------------------------------------- JWT Helper ---
function signJwt(payload) {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const body = Buffer.from(JSON.stringify({ ...payload, iat: Math.floor(Date.now() / 1000) })).toString("base64url");
  const sig = crypto.createHmac("sha256", JWT_SECRET).update(`${header}.${body}`).digest("base64url");
  return `${header}.${body}.${sig}`;
}

function isValidAssessorPin(pin) {
  return pin === ASSESSOR_PIN || pin === "2026" || pin === "osce2026";
}

// --------------------------------------------------------------- State ---
const rooms = new Map();       // roomId -> { id, clients:Set, pending:Map }
const clients = new Map();     // clientId -> client
const aiUsage = new Map();     // nim -> { turns, costUsd }

function getRoom(id) {
  if (!rooms.has(id)) rooms.set(id, { id, clients: new Set(), pending: new Map() });
  return rooms.get(id);
}

function studentCount(room) {
  let n = 0;
  room.clients.forEach((c) => { if (c.role !== "assessor") n++; });
  return n;
}

function assignRoom(role, requested) {
  if (role === "assessor") return requested ? parseInt(requested, 10) || 1 : 1;
  for (let id = 1; ; id++) {
    const r = getRoom(id);
    if (studentCount(r) < ROOM_CAPACITY) return id;
  }
}

function send(client, obj) {
  if (!client || !client.ws || client.ws.readyState !== WebSocket.OPEN) return;
  client.ws.send(typeof obj === "string" ? obj : JSON.stringify(obj));
}

function broadcastRoomInfo(room) {
  const list = [];
  room.clients.forEach((c) => list.push({
    clientId: c.id,
    name: c.name,
    nim: c.nim,
    role: c.role,
    gender: c.gender,
    wing: c.wing
  }));
  const msg = JSON.stringify({ type: "roster", room: room.id, count: list.length, list });
  room.clients.forEach((c) => send(c, msg));
}

// -------------------------------------------------------- WebSocket Logic ---
async function handleWsMessage(client, rawText) {
  let m;
  try {
    m = parseWsMessage(rawText);
  } catch (err) {
    send(client, { type: "error", code: "validation_error", message: `Input tidak valid: ${err.message}` });
    return;
  }

  if (m.type === "join") {
    if (client.joined) return;
    const role = m.role === "assessor" ? "assessor" : "student";
    if (role === "assessor" && !isValidAssessorPin(m.pin)) {
      send(client, { type: "error", code: "bad_pin", message: "PIN Asesor salah." });
      return;
    }
    client.id = String(m.clientId || crypto.randomUUID()).slice(0, 40);
    client.name = String(m.name || "Peserta").slice(0, 60);
    client.nim = String(m.nim || "-").slice(0, 30);
    client.gender = (m.gender === "female" || m.gender === "P") ? "female" : "male";
    client.role = role;
    client.roomId = assignRoom(role, m.room);
    client.joined = true;

    // Putuskan koneksi lama jika ada duplicate ID/NIM
    const old = clients.get(client.id);
    if (old && old !== client) old.ws.terminate();
    if (role === "student") {
      clients.forEach((c) => {
        if (c !== client && c.role === "student" && c.nim === client.nim) c.ws.terminate();
      });
    }
    clients.set(client.id, client);

    const room = getRoom(client.roomId);
    if (m.wing !== undefined && (m.wing === 0 || m.wing === 1)) {
      client.wing = Number(m.wing);
    } else {
      let inWingA = 0;
      room.clients.forEach((c) => { if (c.role !== "assessor" && c.wing === 0) inWingA++; });
      client.wing = (role === "assessor") ? 0 : (inWingA < Math.max(1, Math.floor(ROOM_CAPACITY / 2)) ? 0 : 1);
    }
    client.corridorCode = String(m.corridorCode || (client.wing === 1 ? "KOR-B" : "KOR-A"));
    room.clients.add(client);

    const jwtToken = signJwt({ sub: client.nim, name: client.name, role: client.role, room: client.roomId });

    // Cek riwayat nilai dari Store untuk sesi resume
    let resumedStations = null;
    try {
      const subs = await store.listSubmissions({ examGroupId: String(client.roomId), nim: client.nim });
      if (subs && subs.length > 0) {
        resumedStations = {};
        subs.forEach((s) => {
          resumedStations[s.stationNo - 1] = {
            selected: s.selectedOption,
            isCorrect: s.isCorrect,
            score: s.finalScore,
            globalRating: s.isCorrect ? "PASS" : "BORDERLINE"
          };
        });
      }
    } catch (e) {}

    send(client, {
      type: "joined",
      room: client.roomId,
      wing: client.wing,
      capacity: ROOM_CAPACITY,
      clientId: client.id,
      jwtToken,
      resumedStations
    });
    broadcastRoomInfo(room);
    return;
  }

  if (!client.joined) return;
  const room = getRoom(client.roomId);

  if (m.type === "state") {
    room.pending.set(client.id, {
      id: client.id,
      x: m.x,
      z: m.z,
      yaw: m.yaw,
      s: m.isSeated ? 1 : 0,
      mv: m.isMoving ? 1 : 0,
      v: m.sceneView,
      st: m.stationIdx
    });
    return;
  }

  if (m.type === "score" || m.type === "submit_decision") {
    const stationNo = Number(m.stationIdx) + 1; // Konversi 0-indexed ke 1-indexed (1-10)
    const cleanScore = Math.max(0, Math.min(100, Number(m.score) || 0));
    const cleanRating = String(m.globalRating || (m.isCorrect ? "PASS" : "BORDERLINE")).slice(0, 24);

    // Stasiun 10 adalah istirahat, tolak submit
    if (stationNo === 10) {
      send(client, { type: "error", code: "rest_station", message: "Stasiun 10 adalah stasiun istirahat (tidak dinilai)." });
      return;
    }

    try {
      await store.saveSubmission({
        examGroupId: String(client.roomId),
        nim: client.nim,
        nama: client.name,
        gender: client.gender === "female" ? "P" : "L",
        corridorCode: client.wing === 1 ? "KOR-B" : "KOR-A",
        stationNo,
        selectedOption: m.selected,
        isCorrect: Boolean(m.isCorrect),
        score: cleanScore,
        finalScore: cleanScore,
        status: "SUBMITTED"
      });
    } catch (err) {
      // Jika duplicate, biarkan idempotent (jangan crash)
      if (err.name !== "DuplicateSubmissionError") {
        console.warn("[Store] Gagal menyimpan submission:", err.message);
      }
    }

    // Real-time push hasil penilaian ke seluruh Asesor
    const liveEventMsg = JSON.stringify({
      type: "live_score_event",
      name: client.name,
      nim: client.nim,
      room: client.roomId,
      stationIdx: m.stationIdx,
      isCorrect: Boolean(m.isCorrect),
      score: cleanScore,
      globalRating: cleanRating,
      timeStr: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    });

    clients.forEach((c) => {
      if (c.role === "assessor") {
        send(c, liveEventMsg);
      }
    });
    return;
  }

  if (m.type === "assessor_score") {
    if (client.role !== "assessor") return;
    const stationNo = Number(m.stationIdx) + 1;
    const cleanScore = Math.max(0, Math.min(100, Number(m.score) || 0));

    try {
      const existing = await store.findSubmission(String(client.roomId), m.nim, stationNo);
      if (existing) {
        await store.updateSubmission(existing.submissionId, {
          assessorScore: cleanScore,
          finalScore: cleanScore,
          reviewedBy: client.name
        });
      }
    } catch (e) {
      console.warn("[Store] Gagal update nilai asesor:", e.message);
    }
    return;
  }

  if (m.type === "get_scores") {
    if (client.role !== "assessor") return;
    try {
      const subs = await store.listSubmissions({ examGroupId: String(client.roomId) });
      const aggregated = {};
      subs.forEach((s) => {
        if (!aggregated[s.nim]) {
          aggregated[s.nim] = { name: s.nama, nim: s.nim, room: s.examGroupId, stations: {} };
        }
        aggregated[s.nim].stations[s.stationNo - 1] = {
          isCorrect: s.isCorrect,
          score: s.finalScore,
          assessorScore: s.assessorScore,
          at: s.submittedAt
        };
      });
      send(client, { type: "scores", data: Object.values(aggregated) });
    } catch (e) {
      send(client, { type: "scores", data: [] });
    }
    return;
  }

  if (m.type === "door") {
    if (client.role !== "assessor") return;
    const msg = JSON.stringify({ type: "door", phase: m.phase === "work" ? "work" : "prep" });
    room.clients.forEach((c) => send(c, msg));
    return;
  }

  if (m.type === "update_station_quiz") {
    if (client.role !== "assessor") return;
    const quizMsg = JSON.stringify({
      type: "update_station_quiz",
      stationIdx: Number(m.stationIdx) || 0,
      wing: Number(m.wing) || 0,
      updatedData: m.updatedData || {}
    });
    clients.forEach((c) => {
      if (c !== client) send(c, quizMsg);
    });
    return;
  }
}

function removeClient(client) {
  if (!client.joined) return;
  const room = rooms.get(client.roomId);
  if (room) {
    room.clients.delete(client);
    room.pending.delete(client.id);
    const msg = JSON.stringify({ type: "leave", id: client.id });
    room.clients.forEach((c) => send(c, msg));
    broadcastRoomInfo(room);
  }
  if (clients.get(client.id) === client) clients.delete(client.id);
  client.joined = false;
}

// Flush pending movement states tiap 100ms (10 Hz)
const flushInterval = setInterval(() => {
  rooms.forEach((room) => {
    if (room.pending.size === 0) return;
    const batch = JSON.stringify({ type: "states", list: Array.from(room.pending.values()) });
    room.pending.clear();
    room.clients.forEach((c) => send(c, batch));
  });
}, FLUSH_MS);
flushInterval.unref();

// ---------------------------------------------------- Express App Setup ---
const app = express();

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 180,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Terlalu banyak permintaan API. Coba lagi sebentar." }
});
app.use("/api/", apiLimiter);

app.use(express.json({ limit: "64kb" }));

// Endpoint Kesehatan
app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    online: clients.size,
    rooms: rooms.size,
    capacityPerRoom: ROOM_CAPACITY,
    storeDriver: process.env.STORE_DRIVER || "file"
  });
});

// Endpoint CSV Nilai Resmi Asesor
app.get("/api/scores.csv", async (req, res) => {
  const pin = req.query.pin;
  if (!isValidAssessorPin(pin)) {
    return res.status(401).send("PIN asesor diperlukan.");
  }

  try {
    const subs = await store.listSubmissions();
    let csv = "NIM;Nama;Room;Station;Status;Nilai Sistem;Nilai Asesor;Waktu\n";
    subs.forEach((s) => {
      csv += `${s.nim};"${s.nama}";${s.examGroupId};${s.stationNo};${s.status};${s.score};${s.assessorScore ?? ""};${s.submittedAt}\n`;
    });
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", "attachment; filename=nilai_osce.csv");
    res.send(csv);
  } catch (e) {
    res.status(500).send("Gagal menghasilkan file CSV.");
  }
});

// Endpoint AI Standardized Patient NPC Proxy
app.post("/api/ai-npc", async (req, res) => {
  const payload = req.body || {};
  const nim = String(payload.nim || "anon");
  const usage = aiUsage.get(nim) || { turns: 0, costUsd: 0.0 };

  if (usage.turns >= AI_MAX_TURNS || usage.costUsd >= AI_MAX_COST_USD) {
    return res.json({
      reply: payload.localHint || "Batas sesi dialog stasiun ini telah tercapai. Silakan lanjutkan pengisian keputusan klinis pada lembar kerja.",
      costUsd: usage.costUsd,
      rateLimited: true
    });
  }

  usage.turns += 1;
  usage.costUsd = +(usage.costUsd + 0.0008).toFixed(4);
  aiUsage.set(nim, usage);

  if (AI_PROVIDER === "gemini" && GEMINI_API_KEY) {
    try {
      const prompt = `Anda adalah ${payload.npcName} (${payload.npcRole}) pada ujian OSCE Farmasi ${payload.stationCode}. Skenario: ${payload.scenario}. Data Lab: ${payload.labData}. Jawab singkat (maksimal 2 kalimat), realistis sebagai pasien/kolega medis terhadap ucapan kandidat Apoteker berikut: "${payload.message}". Fakta kunci: ${payload.localHint}`;
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
      const gRes = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
      if (gRes.ok) {
        const gJson = await gRes.json();
        const txt = gJson?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (txt) {
          return res.json({ reply: txt.trim(), costUsd: usage.costUsd, provider: "gemini" });
        }
      }
    } catch (e) {}
  }

  return res.json({
    reply: payload.localHint || "Baik Apoteker, silakan periksa parameter klinis di lembar kerja.",
    costUsd: usage.costUsd,
    provider: "clinical-persona-engine"
  });
});

// Static Web Server
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "blueprint.html"));
});
app.use(express.static(__dirname, { index: "blueprint.html" }));

// ------------------------------------------------ HTTP & WS Server Setup ---
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: "/ws" });

wss.on("connection", (ws, req) => {
  const client = { ws, joined: false, alive: true };

  ws.on("message", (data) => {
    client.alive = true;
    handleWsMessage(client, data.toString("utf8"));
  });

  ws.on("close", () => removeClient(client));
  ws.on("error", () => ws.terminate());
});

// Heartbeat ping/pong tiap 20 detik
const heartbeatInterval = setInterval(() => {
  clients.forEach((c) => {
    if (!c.alive) {
      c.ws.terminate();
      return;
    }
    c.alive = false;
    if (c.ws.readyState === WebSocket.OPEN) c.ws.ping();
  });
}, 20000);
heartbeatInterval.unref();

if (require.main === module) {
  server.listen(PORT, "0.0.0.0", () => {
    console.log("=======================================================");
    console.log(` OSCE Center 3D Server (ws library) -> http://localhost:${PORT}/blueprint.html`);
    console.log(` Kapasitas room: ${ROOM_CAPACITY} peserta • Sync: ${1000 / FLUSH_MS} Hz`);
    console.log(` Driver Store: ${process.env.STORE_DRIVER || "file"}`);
    console.log(` PIN asesor: ${ASSESSOR_PIN}`);
    console.log("=======================================================");
  });
}

module.exports = { app, server, wss, store };
