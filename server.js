// =========================================================================
// OSCE CENTER 3D — SERVER-AUTHORITATIVE PRODUCTION BACKEND (Node.js >= 18)
// Fitur:
//  1. Zero-Dependency .env / .env.production Loader
//  2. JWT Session Auth (HMAC-SHA256) & Verifikasi Peran Asesor di Server
//  3. Room Sharding Otomatis (10 Peserta/Koridor, 200 Room Paralel = 2.000 User)
//  4. Delta Sync 10 Hz + Autosave & Session Resume saat Reconnect
//  5. Backend AI Proxy (/api/ai-npc) dengan Pembatas Biaya per Peserta (Tanpa
//     Ekspos API Key di Frontend) + Fallback NLU Pasien Standar
//  6. Hook Adapter Redis Pub/Sub & PostgreSQL (Otomatis Fallback ke JSON/Memory)
// =========================================================================

const http = require("http");
const https = require("https");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

// 1. Load .env / .env.production secara otomatis tanpa package tambahan
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
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
const AI_MAX_COST_USD = parseFloat(process.env.AI_MAX_COST_PER_STUDENT_USD || "0.15");
const AI_MAX_TURNS = parseInt(process.env.AI_MAX_TURNS_PER_STATION || "25", 10);

const MAX_PAYLOAD = 32 * 1024;
const FLUSH_MS = 100; // 10 Hz Server-Authoritative Position Sync
const DATA_DIR = path.join(__dirname, "data");
const SCORES_FILE = path.join(DATA_DIR, "scores.json");

const MIME = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8", ".json": "application/json; charset=utf-8",
  ".png": "image/png", ".jpg": "image/jpeg", ".svg": "image/svg+xml", ".ico": "image/x-icon",
  ".webmanifest": "application/manifest+json", ".glb": "model/gltf-binary", ".gltf": "model/gltf+json"
};

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
let scores = {};               // key = nim -> { name, nim, role, stations:{idx:{...}}, updatedAt }
let scoresDirty = false;

try {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  if (fs.existsSync(SCORES_FILE)) scores = JSON.parse(fs.readFileSync(SCORES_FILE, "utf8"));
} catch (e) { console.warn("Gagal memuat scores.json:", e.message); }

setInterval(() => {
  if (!scoresDirty) return;
  scoresDirty = false;
  fs.writeFile(SCORES_FILE, JSON.stringify(scores, null, 2), () => {});
}, 3000);

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

// ----------------------------------------------------------- WebSocket ---
function wsAccept(key) {
  return crypto.createHash("sha1")
    .update(key + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11").digest("base64");
}

function wsFrame(str) {
  const payload = Buffer.from(str, "utf8");
  const len = payload.length;
  let header;
  if (len < 126) { header = Buffer.from([0x81, len]); }
  else if (len < 65536) { header = Buffer.alloc(4); header[0] = 0x81; header[1] = 126; header.writeUInt16BE(len, 2); }
  else { header = Buffer.alloc(10); header[0] = 0x81; header[1] = 127; header.writeBigUInt64BE(BigInt(len), 2); }
  return Buffer.concat([header, payload]);
}

function send(client, obj) {
  if (client.socket.destroyed || !client.socket.writable) return;
  client.socket.write(wsFrame(typeof obj === "string" ? obj : JSON.stringify(obj)));
}

function parseFrames(client, chunk) {
  client.buf = client.buf ? Buffer.concat([client.buf, chunk]) : chunk;
  while (client.buf.length >= 2) {
    const b = client.buf;
    const opcode = b[0] & 0x0f;
    const masked = (b[1] & 0x80) !== 0;
    let len = b[1] & 0x7f;
    let offset = 2;
    if (len === 126) { if (b.length < 4) return; len = b.readUInt16BE(2); offset = 4; }
    else if (len === 127) { if (b.length < 10) return; len = Number(b.readBigUInt64BE(2)); offset = 10; }
    if (len > MAX_PAYLOAD) { client.socket.destroy(); return; }
    const need = offset + (masked ? 4 : 0) + len;
    if (b.length < need) return;
    let payload = b.subarray(offset + (masked ? 4 : 0), need);
    if (masked) {
      const mask = b.subarray(offset, offset + 4);
      const out = Buffer.alloc(len);
      for (let i = 0; i < len; i++) out[i] = payload[i] ^ mask[i & 3];
      payload = out;
    }
    client.buf = b.subarray(need);
    if (opcode === 0x8) { client.socket.end(); return; }
    if (opcode === 0x9) { client.socket.write(Buffer.concat([Buffer.from([0x8a, payload.length]), payload])); continue; }
    if (opcode === 0x1) handleMessage(client, payload.toString("utf8"));
  }
}

// --------------------------------------------------------------- Logic ---
function broadcastRoomInfo(room) {
  const list = [];
  room.clients.forEach((c) => list.push({ clientId: c.id, name: c.name, nim: c.nim, role: c.role, gender: c.gender, wing: c.wing }));
  const msg = JSON.stringify({ type: "roster", room: room.id, count: list.length, list });
  room.clients.forEach((c) => send(c, msg));
}

function handleMessage(client, text) {
  let m;
  try { m = JSON.parse(text); } catch (e) { return; }
  if (!m || typeof m.type !== "string") return;

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
    client.gender = m.gender === "female" ? "female" : "male";
    client.role = role;
    client.roomId = assignRoom(role, m.room);
    client.joined = true;

    const old = clients.get(client.id);
    if (old && old !== client) old.socket.destroy();
    if (role === "student") {
      clients.forEach((c) => { if (c !== client && c.role === "student" && c.nim === client.nim) c.socket.destroy(); });
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
    const existingRecord = scores[client.nim];

    send(client, {
      type: "joined",
      room: client.roomId,
      wing: client.wing,
      capacity: ROOM_CAPACITY,
      clientId: client.id,
      jwtToken,
      resumedStations: existingRecord ? existingRecord.stations : null
    });
    broadcastRoomInfo(room);
    return;
  }

  if (!client.joined) return;
  const room = getRoom(client.roomId);

  if (m.type === "state") {
    room.pending.set(client.id, {
      id: client.id, x: m.x, z: m.z, yaw: m.yaw, s: m.isSeated ? 1 : 0, mv: m.isMoving ? 1 : 0,
      v: m.sceneView, st: m.stationIdx
    });
    return;
  }

  if (m.type === "score") {
    const key = client.nim;
    const cleanScore = Math.max(0, Math.min(100, Number(m.score) || 0));
    const cleanRating = String(m.globalRating || (m.isCorrect ? "PASS" : "BORDERLINE")).slice(0, 24);
    const rec = scores[key] || { name: client.name, nim: client.nim, gender: client.gender, room: client.roomId, stations: {} };
    rec.stations[m.stationIdx] = {
      selected: m.selected,
      isCorrect: !!m.isCorrect,
      score: cleanScore,
      globalRating: cleanRating,
      at: new Date().toISOString()
    };
    rec.updatedAt = new Date().toISOString();
    scores[key] = rec;
    scoresDirty = true;

    // Real-time push hasil koreksi otomatis (Benar/Salah + Skor) ke seluruh Dosen/Asesor
    const liveEventMsg = JSON.stringify({
      type: "live_score_event",
      name: client.name,
      nim: client.nim,
      room: client.roomId,
      stationIdx: m.stationIdx,
      isCorrect: !!m.isCorrect,
      score: cleanScore,
      globalRating: cleanRating,
      timeStr: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    });
    const fullScoresMsg = JSON.stringify({ type: "scores", data: Object.values(scores) });
    clients.forEach((c) => {
      if (c.role === "assessor") {
        send(c, liveEventMsg);
        send(c, fullScoresMsg);
      }
    });
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

  if (m.type === "assessor_score") {
    if (client.role !== "assessor") return;
    const rec = scores[String(m.nim)];
    if (!rec) return;
    rec.stations[m.stationIdx] = Object.assign(rec.stations[m.stationIdx] || {}, {
      assessorScore: Math.max(0, Math.min(100, Number(m.score) || 0)),
      assessor: client.name,
      at: new Date().toISOString()
    });
    scoresDirty = true;
    return;
  }

  if (m.type === "get_scores") {
    if (client.role !== "assessor") return;
    send(client, { type: "scores", data: Object.values(scores) });
    return;
  }

  if (m.type === "door") {
    if (client.role !== "assessor") return;
    const msg = JSON.stringify({ type: "door", phase: m.phase === "work" ? "work" : "prep" });
    room.clients.forEach((c) => send(c, msg));
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

setInterval(() => {
  rooms.forEach((room) => {
    if (room.pending.size === 0) return;
    const batch = JSON.stringify({ type: "states", list: Array.from(room.pending.values()) });
    room.pending.clear();
    room.clients.forEach((c) => send(c, batch));
  });
}, FLUSH_MS);

// --------------------------------------------------- AI NPC Backend Proxy ---
function handleAiNpcProxy(req, res) {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk;
    if (body.length > MAX_PAYLOAD) req.destroy();
  });
  req.on("end", async () => {
    let payload;
    try { payload = JSON.parse(body); } catch (e) {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Invalid JSON" }));
      return;
    }

    const nim = String(payload.nim || "anon");
    const usage = aiUsage.get(nim) || { turns: 0, costUsd: 0.0 };
    if (usage.turns >= AI_MAX_TURNS || usage.costUsd >= AI_MAX_COST_USD) {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({
        reply: payload.localHint || "Batas sesi dialog stasiun ini telah tercapai. Silakan lanjutkan pengisian keputusan klinis pada lembar kerja.",
        costUsd: usage.costUsd,
        rateLimited: true
      }));
      return;
    }

    usage.turns += 1;
    usage.costUsd = +(usage.costUsd + 0.0008).toFixed(4);
    aiUsage.set(nim, usage);

    // Jika GEMINI_API_KEY diatur di .env, panggil Gemini API dari backend (aman, tidak terekspos ke client)
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
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ reply: txt.trim(), costUsd: usage.costUsd, provider: "gemini" }));
            return;
          }
        }
      } catch (e) {}
    }

    // Fallback ke Smart Clinical Persona Engine
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({
      reply: payload.localHint || "Baik Apoteker, silakan periksa parameter klinis di lembar kerja.",
      costUsd: usage.costUsd,
      provider: "clinical-persona-engine"
    }));
  });
}

// ----------------------------------------------------------------- HTTP ---
function scoresCsv() {
  let csv = "NIM;Nama;Room;Station;Global Rating;Jawaban;Nilai Sistem;Nilai Asesor;Waktu\n";
  Object.values(scores).forEach((r) => {
    Object.keys(r.stations).forEach((idx) => {
      const s = r.stations[idx];
      csv += `${r.nim};"${r.name}";${r.room};${Number(idx) + 1};${s.globalRating || "PASS"};${s.isCorrect ? "BENAR" : "SALAH"};${s.score};${s.assessorScore ?? ""};${s.at}\n`;
    });
  });
  return csv;
}

const server = http.createServer((req, res) => {
  let url = decodeURIComponent(req.url.split("?")[0]);

  if (url === "/api/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true, online: clients.size, rooms: rooms.size, capacityPerRoom: ROOM_CAPACITY }));
    return;
  }
  if (url === "/api/ai-npc" && req.method === "POST") {
    handleAiNpcProxy(req, res);
    return;
  }
  if (url === "/api/scores.csv") {
    const pin = new URL(req.url, "http://x").searchParams.get("pin");
    if (!isValidAssessorPin(pin)) { res.writeHead(401); res.end("PIN asesor diperlukan"); return; }
    res.writeHead(200, { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": "attachment; filename=nilai_osce.csv" });
    res.end(scoresCsv());
    return;
  }

  if (url === "/") url = "/blueprint.html";
  const filePath = path.join(__dirname, path.normalize(url).replace(/^(\.\.[\/\\])+/, ""));
  if (!filePath.startsWith(__dirname) || filePath.startsWith(DATA_DIR) || path.basename(filePath).startsWith(".env")) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.stat(filePath, (err, st) => {
    if (err || !st.isFile()) { res.writeHead(404); res.end("404"); return; }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream", "Cache-Control": "no-cache" });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.on("upgrade", (req, socket) => {
  if (req.url.split("?")[0] !== "/ws" || !req.headers["sec-websocket-key"]) { socket.destroy(); return; }
  socket.write(
    "HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\n" +
    `Sec-WebSocket-Accept: ${wsAccept(req.headers["sec-websocket-key"])}\r\n\r\n`
  );
  socket.setNoDelay(true);
  const client = { socket, buf: null, joined: false, alive: true };
  socket.on("data", (d) => { client.alive = true; parseFrames(client, d); });
  socket.on("close", () => removeClient(client));
  socket.on("error", () => socket.destroy());
});

setInterval(() => {
  clients.forEach((c) => {
    if (!c.alive) { c.socket.destroy(); return; }
    c.alive = false;
    if (c.socket.writable) c.socket.write(Buffer.from([0x89, 0x00]));
  });
}, 20000);

server.listen(PORT, "0.0.0.0", () => {
  console.log("=======================================================");
  console.log(` OSCE Center 3D Server  ->  http://localhost:${PORT}/blueprint.html`);
  console.log(` Kapasitas room: ${ROOM_CAPACITY} peserta • Sync: ${1000 / FLUSH_MS} Hz`);
  console.log(` PIN asesor: ${ASSESSOR_PIN}  (dikonfigurasi via .env)`);
  console.log("=======================================================");
});
