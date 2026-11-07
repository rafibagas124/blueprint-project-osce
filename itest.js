// Uji integrasi protokol server: node itest.js  (server harus jalan di PORT)
const URL_WS = "ws://localhost:" + (process.env.PORT || 8098) + "/ws";
const PIN = process.env.OSCE_ASSESSOR_PIN || "osce2026";
const results = [];
const ok = (name, cond) => { results.push([name, !!cond]); console.log((cond ? "PASS " : "FAIL ") + name); };

function client(join) {
  return new Promise((resolve) => {
    const ws = new WebSocket(URL_WS);
    const c = { ws, msgs: [], joined: null };
    ws.onopen = () => ws.send(JSON.stringify(Object.assign({ type: "join" }, join)));
    ws.onmessage = (e) => { const m = JSON.parse(e.data); c.msgs.push(m); if (m.type === "joined") { c.joined = m; resolve(c); } if (m.type === "error") resolve(c); };
  });
}
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const a = await client({ clientId: "A", name: "Mhs A", nim: "111", gender: "female", role: "student" });
  const b = await client({ clientId: "B", name: "Mhs B", nim: "222", gender: "male", role: "student" });
  ok("mahasiswa A & B masuk room yang sama", a.joined && b.joined && a.joined.room === b.joined.room);
  ok("keduanya di koridor A (wing 0)", a.joined.wing === 0 && b.joined.wing === 0);

  a.ws.send(JSON.stringify({ type: "state", x: 1.5, z: 2.5, yaw: 0.3, isSeated: false, isMoving: true, sceneView: "corridor", stationIdx: 0 }));
  await wait(400);
  const got = b.msgs.filter((m) => m.type === "states").flatMap((m) => m.list).find((s) => s.id === "A");
  ok("B menerima posisi live A (x=1.5, z=2.5, bergerak)", got && got.x === 1.5 && got.z === 2.5 && got.mv === 1);
  const roster = b.msgs.filter((m) => m.type === "roster").pop();
  ok("roster berisi identitas A (nama/NIM)", roster && roster.list.some((p) => p.clientId === "A" && p.nim === "111"));

  b.ws.send(JSON.stringify({ type: "score", stationIdx: 0, selected: 0, isCorrect: true, score: 100 }));
  b.ws.send(JSON.stringify({ type: "score", stationIdx: 1, selected: 2, isCorrect: false, score: 35 }));

  const bad = await client({ clientId: "X", name: "Palsu", nim: "999", role: "assessor", pin: "salah" });
  ok("asesor dengan PIN salah ditolak", bad.msgs.some((m) => m.type === "error" && m.code === "bad_pin"));

  const s = await client({ clientId: "S", name: "Dosen", nim: "NIDN1", role: "assessor", pin: PIN, room: a.joined.room });
  ok("asesor dengan PIN benar diterima di room yang sama", s.joined && s.joined.room === a.joined.room);
  s.ws.send(JSON.stringify({ type: "get_scores" }));
  await wait(400);
  const sc = s.msgs.find((m) => m.type === "scores");
  const rec = sc && sc.data.find((r) => r.nim === "222");
  ok("asesor melihat jawaban B: station1 BENAR, station2 SALAH", rec && rec.stations[0].isCorrect === true && rec.stations[1].isCorrect === false);

  s.ws.send(JSON.stringify({ type: "assessor_score", nim: "222", stationIdx: 1, score: 60 }));
  s.ws.send(JSON.stringify({ type: "door", phase: "work" }));
  await wait(400);
  ok("pintu dibuka asesor -> mahasiswa menerima 'door: work'", a.msgs.some((m) => m.type === "door" && m.phase === "work"));

  a.ws.send(JSON.stringify({ type: "get_scores" }));
  await wait(300);
  ok("mahasiswa TIDAK boleh mengambil nilai peserta lain", !a.msgs.some((m) => m.type === "scores"));
  a.ws.send(JSON.stringify({ type: "door", phase: "prep" }));
  await wait(300);
  ok("mahasiswa TIDAK boleh mengubah lampu pintu", !b.msgs.some((m) => m.type === "door" && m.phase === "prep"));

  // NIM ganda: sesi lama diputus
  let closed = false; a.ws.onclose = () => { closed = true; };
  await client({ clientId: "A2", name: "Mhs A (login ulang)", nim: "111", role: "student" });
  await wait(300);
  ok("login ulang NIM yang sama memutus sesi lama", closed);

  b.ws.close();
  await wait(400);
  const dr = await fetch("http://localhost:" + (process.env.PORT || 8098) + "/api/scores.csv?pin=" + PIN).then((r) => r.text());
  ok("CSV nilai tersedia untuk asesor (berisi BENAR & SALAH)", dr.includes("BENAR") && dr.includes("SALAH"));
  const nopin = await fetch("http://localhost:" + (process.env.PORT || 8098) + "/api/scores.csv").then((r) => r.status);
  ok("CSV tanpa PIN ditolak (401)", nopin === 401);
  const dataBlocked = await fetch("http://localhost:" + (process.env.PORT || 8098) + "/data/scores.json").then((r) => r.status);
  ok("folder data/ tidak bisa diunduh publik", dataBlocked === 403);

  const failed = results.filter((r) => !r[1]).length;
  console.log(failed ? `\n${failed} GAGAL` : "\nSEMUA UJI LULUS");
  process.exit(failed ? 1 : 0);
})();

