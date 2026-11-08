// =========================================================================
// NETWORK LAYER — WebSocket (produksi, lintas perangkat) + BroadcastChannel
// (cadangan saat dibuka langsung via file:// atau server statis tanpa /ws)
//
// Alur:  login -> initMultiplayerSync() -> WS join -> server menetapkan
//        room (20 peserta = 2 koridor x 10) dan koridor (wing 0 = A, 1 = B)
// =========================================================================

let netSocket = null;
let netMode = "offline"; // 'ws' | 'bc' | 'offline'
let netEverOpened = false;
let netReconnectTimer = null;
let lastSentKey = "";
let lastSentAt = 0;
const rosterMap = new Map(); // clientId -> { name, nim, gender, role, wing }
window.lastScores = [];

// ------------------------------------------------------------ transport ---
function initMultiplayerSync() {
  if (netMode !== "offline") return;
  const served = location.protocol === "http:" || location.protocol === "https:";
  if (served && "WebSocket" in window) {
    connectWebSocket();
  } else {
    initBroadcastFallback();
  }
  if (!window._netTick) {
    window._netTick = setInterval(broadcastLocalPlayer, 100); // 10 Hz, hanya kirim jika berubah
    setInterval(cleanupStaleRemotes, 3000);
    setInterval(pollOnlineCount, 10000);
    pollOnlineCount();
  }
}

function connectWebSocket() {
  const proto = location.protocol === "https:" ? "wss:" : "ws:";
  try {
    netSocket = new WebSocket(`${proto}//${location.host}/ws`);
  } catch (e) {
    initBroadcastFallback();
    return;
  }

  netSocket.onopen = () => {
    netEverOpened = true;
    netSocket.send(JSON.stringify({
      type: "join",
      clientId: state.clientId,
      token: state.jwtToken
    }));
  };

  netSocket.onmessage = (e) => {
    let m;
    try { m = JSON.parse(e.data); } catch (err) { return; }
    handleServerMessage(m);
  };

  netSocket.onerror = () => { };

  netSocket.onclose = () => {
    const wasWs = netMode === "ws";
    netSocket = null;
    if (!netEverOpened) { // server tidak mendukung WebSocket -> mode cadangan
      initBroadcastFallback();
      return;
    }
    if (wasWs && state.isLoggedIn) {
      netMode = "offline";
      lastSentKey = "";
      if (typeof updateSubtitle === "function") updateSubtitle("Koneksi terputus. Mencoba menyambung kembali...");
      clearTimeout(netReconnectTimer);
      netReconnectTimer = setTimeout(connectWebSocket, 2000);
    }
  };
}

function initBroadcastFallback() {
  if (netMode === "bc" || !("BroadcastChannel" in window)) return;
  netMode = "bc";
  multiChannel = new BroadcastChannel("osce_multiplayer_sync");
  multiChannel.onmessage = (e) => handleRemoteMessage(e.data);
  window.addEventListener("beforeunload", () => {
    try { multiChannel.postMessage({ type: "player_leave", clientId: state.clientId }); } catch (err) { }
  });
  updateTelemetry();
}

function netSend(obj) {
  if (netSocket && netSocket.readyState === 1) netSocket.send(JSON.stringify(obj));
}

// ------------------------------------------------------------- outbound ---
function currentIsMoving() {
  return Boolean(
    state.keys.w || state.keys.s || state.keys.a || state.keys.d ||
    (state.player.targetX !== null && state.player.targetZ !== null)
  );
}

function broadcastLocalPlayer(force = false) {
  if (!state.isLoggedIn) return;
  const isMoving = currentIsMoving();
  const x = +state.player.x.toFixed(2), z = +state.player.z.toFixed(2), yaw = +state.player.yaw.toFixed(2);
  const key = `${x}|${z}|${yaw}|${state.isSeated}|${isMoving}|${state.sceneView}|${state.currentStationIdx}`;
  const now = Date.now();
  // Kirim hanya saat berubah; heartbeat tiap 1 detik agar tidak dianggap keluar
  if (!force && key === lastSentKey && now - lastSentAt < 1000) return;
  lastSentKey = key;
  lastSentAt = now;

  if (netMode === "ws") {
    netSend({ type: "state", x, z, yaw, isSeated: state.isSeated, isMoving, sceneView: state.sceneView, stationIdx: state.currentStationIdx });
  } else if (netMode === "bc" && multiChannel) {
    multiChannel.postMessage({
      type: "player_sync", clientId: state.clientId,
      name: state.userProfile.name, nim: state.userProfile.nim,
      gender: state.userProfile.gender, role: state.userProfile.role,
      x, z, yaw, isSeated: state.isSeated, isMoving,
      sceneView: state.sceneView, stationIdx: state.currentStationIdx, time: now
    });
  }
}

function netSendScore(stationIdx, selected, isCorrect, score, globalRating = "PASS") {
  const payload = {
    type: "score",
    name: state.userProfile.name,
    nim: state.userProfile.nim,
    stationIdx,
    selected,
    isCorrect,
    score,
    globalRating,
    eventCount: typeof candidateEventLog !== "undefined" ? candidateEventLog.length : 0
  };
  netSend(payload);

  // Kirim juga ke tab Dosen/Asesor jika menggunakan BroadcastChannel & catat ke Live Feed
  if (typeof pushLiveGradingEvent === "function") {
    pushLiveGradingEvent(payload);
  }
  if (multiChannel) {
    try { multiChannel.postMessage({ type: "live_score_event", ...payload }); } catch (e) { }
  }

  // Jika dalam mode simulasi 10 mahasiswa sekoridor (tanpa 9 tab asli), simulasikan 9 teman sekoridor
  // mengumpulkan tugas di stasiunnya masing-masing secara real-time sebelum bergeser ke stasiun berikutnya
  if (netMode !== "ws" && typeof peerBots !== "undefined") {
    peerBots.forEach((b, i) => {
      if (OSCE_SCORING.isRestStation(b.currentStation)) return;
      const botCorrect = ((b.currentStation + i) % 4 !== 0); // ~75% menjawab benar
      const botScore = botCorrect ? (82 + ((b.currentStation * 3 + i * 5) % 16)) : (52 + ((i * 7) % 15));
      const botEvent = {
        name: b.data.name,
        nim: b.data.nim,
        stationIdx: b.currentStation,
        passed: botCorrect,
        score: botScore,
        globalRating: botCorrect ? (botScore >= 90 ? "SUPERIOR" : "PASS") : "BORDERLINE"
      };
      if (typeof pushLiveGradingEvent === "function") pushLiveGradingEvent(botEvent);
    });
  }
}

function netSendStationQuiz(stationIdx, updatedData, wing = 0) {
  netSend({ type: "update_station_quiz", stationIdx, updatedData, wing });
  if (multiChannel) {
    try { multiChannel.postMessage({ type: "update_station_quiz", stationIdx, updatedData, wing }); } catch (e) { }
  }
}

function netSendAssessorScore(nim, stationIdx, score) {
  netSend({ type: "assessor_score", nim, stationIdx, score });
}

function netRequestScores() {
  netSend({ type: "get_scores" });
}

function netSetDoors(phase) {
  netSend({ type: "door", phase });
}

// -------------------------------------------------------------- inbound ---
function handleServerMessage(m) {
  switch (m.type) {
    case "joined":
      netMode = "ws";
      state.roomId = m.room;
      state.wing = m.wing || 0;
      if (m.jwtToken) state.jwtToken = m.jwtToken;
      // Restore saved progress on reconnect (Session Resume)
      if (typeof ExamAPI !== "undefined" && ExamAPI.fetchProgress) {
        ExamAPI.fetchProgress().catch((e) => console.warn("[Progress] Gagal memuat progres reconnect:", e.message));
      }
      if (m.resumedStations && typeof m.resumedStations === "object") {
        Object.keys(m.resumedStations).forEach((sIdx) => {
          const idxNum = parseInt(sIdx, 10);
          if (state.stationProgress[idxNum]) {
            state.stationProgress[idxNum].completed = true;
            state.stationProgress[idxNum].submitted = true;
          }
        });
        updateHUD();
      }
      peerBots.forEach((b) => { b.avatar.root.visible = false; });
      if (state.sceneView === "corridor") moveCameraToStationWaitingSpot(state.currentStationIdx, true);
      updateTelemetry();
      lastSentKey = "";
      broadcastLocalPlayer(true);
      break;
    case "roster":
      rosterMap.clear();
      m.list.forEach((p) => rosterMap.set(p.clientId, p));
      remoteAvatars.forEach((rem, id) => { if (!rosterMap.has(id)) removeRemote(id); });
      renderPeersList();
      updateTelemetry();
      break;
    case "states":
      m.list.forEach((s) => {
        if (s.id === state.clientId) return;
        const info = rosterMap.get(s.id);
        if (!info) return; // tunggu roster agar identitas (nama/NIM) tersedia
        handleRemoteMessage({
          type: "player_sync", clientId: s.id,
          name: info.name, nim: info.nim, gender: info.gender, role: info.role,
          x: s.x, z: s.z, yaw: s.yaw, isSeated: !!s.s, isMoving: !!s.mv,
          sceneView: s.v, stationIdx: s.st
        });
      });
      break;
    case "leave":
      removeRemote(m.id);
      break;
    case "door":
      if (state.userProfile.role === "student") {
        if (m.phase === "work" && state.phase === "prep") startWorkPhase();
        else if (m.phase === "prep" && state.phase === "work") startPrepPhase();
      }
      break;
    case "scores":
      window.lastScores = m.data || [];
      if (typeof renderAssessorScoreTable === "function") renderAssessorScoreTable();
      break;
    case "live_score_event":
      if (typeof pushLiveGradingEvent === "function") pushLiveGradingEvent(m);
      break;
    case "update_station_quiz":
      if (typeof saveCustomStationData === "function" && m.updatedData) {
        saveCustomStationData(m.stationIdx, m.updatedData, m.wing ?? 0);
        if (typeof updateStationDoorPoster === "function") updateStationDoorPoster(m.stationIdx, m.wing ?? 0);
        const wName = (m.wing === 1) ? "Koridor B" : "Koridor A";
        showToast(`Dosen memperbarui soal & petunjuk ${STATIONS[m.stationIdx]?.code || "Station"} (${wName})`, "info");
      }
      break;
    case "error":
      showToast(m.message || "Terjadi kesalahan koneksi.", "error");
      if (m.code === "session_replaced") {
        clearTimeout(netReconnectTimer);
        state.isLoggedIn = false;
        alert("Sesi Anda telah dibuka di perangkat / tab lain. Sesi pada tab ini dinonaktifkan.");
      } else if (m.code === "unauthorized") {
        clearTimeout(netReconnectTimer);
        setTimeout(() => location.reload(), 1500);
      }
      break;
  }
}

function removeRemote(id) {
  const rem = remoteAvatars.get(id);
  if (!rem) return;
  if (rem.root.parent) rem.root.parent.remove(rem.root);
  remoteAvatars.delete(id);
  renderPeersList();
}

function cleanupStaleRemotes() {
  const now = Date.now();
  remoteAvatars.forEach((rem, id) => {
    if (now - (rem.lastSeen || now) > 6000) removeRemote(id);
  });
}

function handleRemoteMessage(data) {
  if (!data || data.clientId === state.clientId) return;

  if (data.type === "player_leave") { removeRemote(data.clientId); return; }
  if (data.type === "live_score_event") {
    if (typeof pushLiveGradingEvent === "function") pushLiveGradingEvent(data);
    return;
  }
  if (data.type === "update_station_quiz") {
    if (typeof saveCustomStationData === "function" && data.updatedData) {
      saveCustomStationData(data.stationIdx, data.updatedData);
      if (typeof updateStationDoorPoster === "function") updateStationDoorPoster(data.stationIdx);
    }
    return;
  }
  if (data.type !== "player_sync") return;

  let rem = remoteAvatars.get(data.clientId);
  if (!rem) {
    rem = createDetailedHumanoidAvatar({
      name: data.name || "Kandidat Mahasiswa",
      nim: data.nim || "2024-08000",
      gender: data.gender || "male",
      role: data.role || "student",
      isLocal: false,
      coatColor: 0xffffff,
      pantsColor: 0x0f172a,
      hairColor: data.gender === "female" ? 0x2e1065 : 0x18181b,
      hijabColor: 0x0f766e
    });
    rem.name = data.name;
    rem.nim = data.nim;
    rem.gender = data.gender;
    rem.role = data.role;
    rem.root.position.set(data.x, 0, data.z);
    rem.root.rotation.y = data.yaw;
    remoteAvatars.set(data.clientId, rem);
    renderPeersList();
    if (typeof updateSubtitle === "function") updateSubtitle(`${data.name} terhubung secara real-time.`);
  }

  rem.targetX = data.x;
  rem.targetZ = data.z;
  rem.targetYaw = data.yaw;
  rem.isSeated = data.isSeated;
  rem.isMoving = data.isMoving;
  rem.stationIdx = data.stationIdx;
  rem.sceneView = data.sceneView;
  rem.lastSeen = Date.now();

  // Visibilitas: satu ruangan station yang sama, atau sama-sama di koridor
  const inSameRoom = (data.sceneView === "room" && state.sceneView === "room" && data.stationIdx === state.currentStationIdx);
  const inCorridor = (data.sceneView === "corridor" && state.sceneView === "corridor");
  const parent = inSameRoom ? roomGroup : (inCorridor ? corridorGroup : null);

  if (parent) {
    if (rem.root.parent !== parent) {
      if (rem.root.parent) rem.root.parent.remove(rem.root);
      parent.add(rem.root);
      rem.root.position.set(data.x, 0, data.z); // hindari meluncur dari posisi lama
    }
    rem.root.visible = true;
  } else {
    rem.root.visible = false;
  }

  // Redraw label hanya bila berubah (canvas mahal jika tiap 100 ms)
  const label = data.sceneView === "room"
    ? `Ruang ${String((data.stationIdx || 0) + 1).padStart(2, "0")}`
    : `Station ${String((data.stationIdx || 0) + 1).padStart(2, "0")}`;
  if (rem.lastLabel !== label) {
    rem.lastLabel = label;
    rem.nameSprite.updateText(label);
  }
}

// ------------------------------------------------------------ telemetry ---
let onlineTotal = null;

function pollOnlineCount() {
  if (netMode !== "ws") return;
  fetch("/api/health").then((r) => r.json()).then((j) => {
    onlineTotal = j.online;
    updateTelemetry();
  }).catch(() => { });
}

function updateTelemetry() {
  const usersEl = document.getElementById("telemetry-users");
  const clusterEl = document.getElementById("telemetry-cluster");
  const modeEl = document.getElementById("telemetry-assessor-mode");
  const wingLabel = document.getElementById("label-corridor-wing");
  if (wingLabel) wingLabel.textContent = state.wing === 1 ? "Koridor B (11-20)" : "Koridor A (01-10)";

  const peersBtn = document.getElementById("btn-toggle-peers");
  if (peersBtn) {
    const span = peersBtn.querySelector("span:last-child");
    if (span) span.textContent = `👥 Mahasiswa (${rosterMap.size || 1 + remoteAvatars.size})`;
  }

  if (netMode === "ws") {
    if (usersEl) usersEl.textContent = `${onlineTotal ?? "…"} Peserta Online`;
    if (clusterEl) clusterEl.textContent = `Room #${state.roomId} • ${state.wing === 1 ? "Koridor B" : "Koridor A"} • ${rosterMap.size} di room`;
    if (modeEl) modeEl.textContent = "Server Live (WebSocket)";
  } else if (netMode === "bc") {
    if (usersEl) usersEl.textContent = "Mode Lokal (antar-tab)";
    if (clusterEl) clusterEl.textContent = "Jalankan server.js untuk multi-perangkat";
    if (modeEl) modeEl.textContent = "BroadcastChannel";
  }
}

function switchCorridorWing() {
  if (state.userProfile.role === "student") {
    showToast("Akses Ditolak: Anda sudah ditempatkan di " + (state.wing === 0 ? "Koridor A" : "Koridor B") + " sesuai kode ujian Anda!", "warning");
    return;
  }
  state.wing = state.wing === 1 ? 0 : 1;
  if (typeof syncActiveStations === "function") syncActiveStations(state.wing);
  if (state.sceneView === "corridor") {
    state.isSeated = false;
    moveCameraToStationWaitingSpot(state.currentStationIdx, true);
  }
  updateTelemetry();
  broadcastLocalPlayer(true);
}

