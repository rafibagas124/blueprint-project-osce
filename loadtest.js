// Load test: simulasi N mahasiswa (default 2000) terhubung via WebSocket
// Pakai:  node loadtest.js [jumlah] [url]
const N = parseInt(process.argv[2] || "2000", 10);
const URL_WS = process.argv[3] || "ws://localhost:8080/ws";
const DURATION_MS = 15000;

let connected = 0, joined = 0, errors = 0, msgsIn = 0, bytesIn = 0;
const rooms = new Set();
const sockets = [];

function makeClient(i) {
  const ws = new WebSocket(URL_WS);
  sockets.push(ws);
  let x = (Math.random() - 0.5) * 4, z = Math.random() * 10 - 5, t = null;
  ws.onopen = () => {
    connected++;
    ws.send(JSON.stringify({
      type: "join", clientId: "load_" + i, name: "Mhs " + i,
      nim: "2024-" + String(i).padStart(5, "0"), gender: i % 2 ? "female" : "male", role: "student"
    }));
  };
  ws.onmessage = (e) => {
    msgsIn++; bytesIn += e.data.length;
    const m = JSON.parse(e.data);
    if (m.type === "joined") {
      joined++; rooms.add(m.room);
      t = setInterval(() => {
        x += (Math.random() - 0.5) * 0.3; z += (Math.random() - 0.5) * 0.3;
        ws.send(JSON.stringify({ type: "state", x, z, yaw: 0, isSeated: false, isMoving: true, sceneView: "corridor", stationIdx: 0 }));
      }, 100);
    }
  };
  ws.onerror = () => errors++;
  ws.onclose = () => { if (t) clearInterval(t); };
}

(async () => {
  console.log(`Menghubungkan ${N} klien ke ${URL_WS} ...`);
  for (let i = 0; i < N; i++) {
    makeClient(i);
    if (i % 100 === 0) await new Promise((r) => setTimeout(r, 50));
  }
  const start = Date.now();
  const timer = setInterval(() => {
    console.log(`t=${((Date.now() - start) / 1000).toFixed(0)}s  connected=${connected} joined=${joined} rooms=${rooms.size} errors=${errors} msg/s~${Math.round(msgsIn / ((Date.now() - start) / 1000))} MB in=${(bytesIn / 1e6).toFixed(1)}`);
  }, 3000);
  setTimeout(() => {
    clearInterval(timer);
    console.log(`\nHASIL: joined=${joined}/${N}, rooms=${rooms.size}, errors=${errors}`);
    sockets.forEach((s) => { try { s.close(); } catch (e) {} });
    setTimeout(() => process.exit(0), 500);
  }, DURATION_MS);
})();

