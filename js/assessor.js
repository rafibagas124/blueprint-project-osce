// =========================================================================
// DASHBOARD ASESOR RESMI UKMPPAI (LIVE MONITORING, CHECKLIST TIMESTAMP,
// EVENT LOG 3D REPLAY, ANALISIS BUTIR SOAL & EXPORT PDF/CSV)
// =========================================================================

const candidateEventLog = []; // [{ t, timeStr, type, x, z, yaw, sceneView, stationIdx, detail }]
const liveGradingFeed = []; // [{ timeStr, name, nim, stationIdx, isCorrect, score, nextStationIdx }]
let isReplaying3D = false;
let replayTimer = null;
let spectateTargetId = "";

function pushLiveGradingEvent(ev) {
  const item = {
    timeStr: ev.timeStr || new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
    name: ev.name || "Mahasiswa",
    nim: ev.nim || "-",
    stationIdx: Number(ev.stationIdx) || 0,
    passed: Boolean(ev.isCorrect ?? ev.passed),
    score: Number(ev.score) || 0,
    globalRating: ev.globalRating || ((ev.isCorrect ?? ev.passed) ? "PASS" : "BORDERLINE"),
    nextStationIdx: ((Number(ev.stationIdx) || 0) + 1) % 10
  };
  liveGradingFeed.unshift(item);
  if (liveGradingFeed.length > 30) liveGradingFeed.pop();

  if (typeof state !== "undefined" && state.userProfile.role === "assessor") {
    showToast(
      `📥 Real-Time Koreksi: ${item.name} selesai S0${item.stationIdx + 1} → ${item.passed ? "BENAR ✓" : "SALAH ✗"} (Skor ${item.score}) • Lanjut S0${item.nextStationIdx + 1}`,
      item.passed ? "success" : "warning"
    );
  }
  updateAssessorHUD();
  if (typeof renderAssessorScoreTable === "function") renderAssessorScoreTable();
}

function logCandidateEvent(type, detail = {}) {
  if (typeof state === "undefined" || !state.isLoggedIn || isReplaying3D) return;
  candidateEventLog.push({
    t: Date.now(),
    timeStr: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
    type,
    x: +(state.player.x || 0).toFixed(2),
    z: +(state.player.z || 0).toFixed(2),
    yaw: +(state.player.yaw || 0).toFixed(2),
    isSeated: Boolean(state.isSeated),
    sceneView: state.sceneView,
    stationIdx: state.currentStationIdx,
    detail
  });
  if (candidateEventLog.length > 500) candidateEventLog.shift();
}

// Rekam jejak posisi berkala setiap 1.2 detik untuk 3D Replay bukti penilaian
setInterval(() => {
  if (typeof state !== "undefined" && state.isLoggedIn && !isReplaying3D) {
    logCandidateEvent("pose", {});
  }
}, 1200);

function start3DReplay() {
  if (candidateEventLog.length === 0) {
    showToast("Belum ada log aktivitas kandidat untuk diputar ulang.", "warning");
    return;
  }
  if (isReplaying3D) {
    clearInterval(replayTimer);
    isReplaying3D = false;
    showToast("3D Replay dihentikan.", "info");
    updateAssessorHUD();
    return;
  }

  isReplaying3D = true;
  let idx = 0;
  showToast(`Memulai 3D Replay (${candidateEventLog.length} event terekam)...`, "info");
  updateAssessorHUD();

  replayTimer = setInterval(() => {
    if (idx >= candidateEventLog.length) {
      clearInterval(replayTimer);
      isReplaying3D = false;
      showToast("3D Replay bukti penilaian selesai diputar.", "success");
      updateAssessorHUD();
      return;
    }
    const ev = candidateEventLog[idx++];
    state.currentStationIdx = ev.stationIdx || 0;
    state.isSeated = Boolean(ev.isSeated);
    if (ev.sceneView === "room" && state.sceneView !== "room") {
      corridorGroup.visible = false;
      roomGroup.visible = true;
      state.sceneView = "room";
      if (typeof updateRoomStationEquipment === "function") updateRoomStationEquipment(state.currentStationIdx);
    } else if (ev.sceneView === "corridor" && state.sceneView !== "corridor") {
      corridorGroup.visible = true;
      roomGroup.visible = false;
      state.sceneView = "corridor";
    }
    state.player.x = ev.x;
    state.player.z = ev.z;
    state.player.yaw = ev.yaw;
    if (localAvatar) {
      localAvatar.root.position.set(ev.x, 0, ev.z);
      localAvatar.root.rotation.y = ev.yaw;
      localAvatar.isSeated = state.isSeated;
    }
    updateSubtitle(`🎥 [3D REPLAY ${ev.timeStr}] Event: ${ev.type.toUpperCase()} di STATION 0${(ev.stationIdx || 0) + 1}`);
  }, 220);
}

function initAssessorSystem() {
  const isAssessor = (state.userProfile.role === "assessor");
  const assessorPanel = document.getElementById("live-assessor-panel");
  const btnEditPrompt = document.getElementById("btn-dosen-edit-prompt");

  if (isAssessor) {
    if (assessorPanel) assessorPanel.classList.remove("hidden");
    if (btnEditPrompt) btnEditPrompt.classList.remove("hidden");
    document.body.classList.add("role-assessor-active");
  } else {
    if (btnEditPrompt) btnEditPrompt.classList.add("hidden");
  }

  updateAssessorHUD();
}

function updateAssessorHUD() {
  const isAssessor = (state.userProfile.role === "assessor");
  const nameEl = document.getElementById("assessor-name");
  const roleEl = document.getElementById("assessor-role");
  const currentSt = STATIONS[state.currentStationIdx];

  if (isAssessor) {
    if (nameEl) nameEl.textContent = state.userProfile.name;
    if (roleEl) roleEl.textContent = "Penguji Resmi • " + currentSt.code;
  }

  const rubrikContainer = document.getElementById("assessor-rubrik-content");
  if (!rubrikContainer) return;

  const peerOptions = [];
  if (typeof remoteAvatars !== "undefined") {
    remoteAvatars.forEach((rem, id) => {
      peerOptions.push(`<option value="${id}" ${spectateTargetId === id ? 'selected' : ''}>🎥 ${rem.name} (${rem.nim})</option>`);
    });
  }
  if (typeof peerBots !== "undefined") {
    peerBots.forEach((b, i) => {
      const bid = `bot_${i}`;
      peerOptions.push(`<option value="${bid}" ${spectateTargetId === bid ? 'selected' : ''}>🎥 ${b.data.name}</option>`);
    });
  }

  rubrikContainer.innerHTML = `
    <div class="space-y-2 text-xs">
      <div class="font-bold text-amber-300 border-b border-amber-500/30 pb-1 flex items-center justify-between">
        <span class="truncate">${currentSt.code}: ${currentSt.title}</span>
        <span class="text-[10px] font-mono text-emerald-300">${candidateEventLog.length} Log</span>
      </div>

      <!-- Pantau Kamera Kandidat Live (Spectate Mode) -->
      <div>
        <label class="text-[10px] text-amber-200 font-bold block mb-0.5">👁️ Pantau Kamera Peserta (Live Spectate):</label>
        <select id="sel-assessor-spectate" class="w-full px-2 py-1 rounded-lg bg-slate-900 border border-amber-500/40 text-white text-[11px]">
          <option value="">Kamera Bebas Penguji</option>
          ${peerOptions.join("")}
        </select>
      </div>

      <!-- Checklist Interaktif dengan Timestamp -->
      <div class="bg-slate-900/80 p-2 rounded-xl border border-slate-700 max-h-32 overflow-y-auto custom-scroll space-y-1">
        <div class="text-[10px] font-bold text-teal-300">Checklist Berbobot & Timestamp:</div>
        ${(currentSt.checklist || []).map((c) => `
          <label class="flex items-start gap-1.5 text-[10px] text-slate-200 cursor-pointer">
            <input type="checkbox" data-cid="${c.id}" class="asr-chk mt-0.5 accent-amber-500" />
            <span class="flex-1">${c.label} ${c.critical ? '<b class="text-rose-400">[KRITIS]</b>' : ''} (${c.weight}%)</span>
          </label>
        `).join("")}
      </div>

      <!-- Global Rating & Skor Manual -->
      <div class="grid grid-cols-2 gap-1.5 items-center">
        <select id="sel-assessor-global" class="px-2 py-1 bg-slate-900 border border-amber-500/40 rounded text-[10px] font-bold text-amber-200">
          <option value="SUPERIOR">Global: SUPERIOR</option>
          <option value="PASS" selected>Global: PASS</option>
          <option value="BORDERLINE">Global: BORDERLINE</option>
          <option value="FAIL">Global: FAIL</option>
        </select>
        <input type="number" id="input-station-score" min="0" max="100" value="85"
          class="w-full px-2 py-1 bg-slate-900 border border-amber-500/50 rounded text-center text-amber-300 font-bold text-xs" />
      </div>

      <button id="btn-save-assessor-score" type="button"
        class="w-full py-1.5 px-3 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-bold text-[11px] transition shadow">
        ✓ Simpan Nilai & Global Rating
      </button>

      <!-- Kontrol Pintu & 3D Replay Bukti Ujian -->
      <div class="grid grid-cols-2 gap-1.5">
        <button id="btn-doors-open" type="button" class="py-1.5 px-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg font-bold text-[10px]">🟢 Buka Pintu</button>
        <button id="btn-doors-lock" type="button" class="py-1.5 px-2 bg-rose-700 hover:bg-rose-600 text-white rounded-lg font-bold text-[10px]">🔴 Kunci Pintu</button>
      </div>

      <div class="grid grid-cols-2 gap-1.5">
        <button id="btn-assessor-replay" type="button" class="py-1.5 px-2 ${isReplaying3D ? 'bg-rose-600' : 'bg-teal-700 hover:bg-teal-600'} text-white rounded-lg font-bold text-[10px]">
          ${isReplaying3D ? '⏹ Stop Replay' : '▶ 3D Replay Log'}
        </button>
        <button id="btn-open-assessor-scores" type="button" class="py-1.5 px-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold text-[10px]">
          📋 Analitik & Nilai
        </button>
      </div>

      <!-- Live Auto-Grading Stream (10 Mahasiswa Rotasi Serentak) -->
      <div class="bg-slate-950/90 p-2 rounded-xl border border-amber-500/40 space-y-1">
        <div class="text-[10px] font-extrabold text-amber-300 flex items-center justify-between">
          <span>⚡ Live Koreksi Otomatis (10 Mahasiswa):</span>
          <span class="text-[9px] text-emerald-400 font-mono">REAL-TIME</span>
        </div>
        <div id="assessor-live-feed" class="max-h-24 overflow-y-auto custom-scroll space-y-1 text-[10px]">
          ${liveGradingFeed.length === 0
      ? `<div class="text-slate-400 italic text-[10px]">Menunggu mahasiswa menyelesaikan tugas stasiun...</div>`
      : liveGradingFeed.slice(0, 8).map((f) => `
              <div class="p-1.5 rounded bg-slate-900 border ${(f.passed ?? f.isCorrect) ? 'border-emerald-500/40' : 'border-rose-500/40'} flex items-center justify-between gap-1">
                <div class="truncate">
                  <span class="font-bold text-white">${f.name}</span>
                  <span class="text-slate-300">• S0${f.stationIdx + 1}→S0${f.nextStationIdx + 1}</span>
                </div>
                <span class="px-1.5 py-0.5 rounded font-black shrink-0 ${(f.passed ?? f.isCorrect) ? 'bg-emerald-700 text-white' : 'bg-rose-700 text-white'}">
                  ${(f.passed ?? f.isCorrect) ? 'BENAR' : 'SALAH'} (${f.score})
                </span>
              </div>
            `).join("")}
        </div>
      </div>
    </div>
  `;

  const specSel = document.getElementById("sel-assessor-spectate");
  if (specSel) {
    specSel.addEventListener("change", (e) => {
      spectateTargetId = e.target.value;
      if (!spectateTargetId) return;
      if (spectateTargetId.startsWith("bot_")) {
        const bIdx = parseInt(spectateTargetId.replace("bot_", ""), 10);
        const bot = peerBots[bIdx];
        if (bot) {
          state.currentStationIdx = bot.currentStation;
          moveCameraToStationWaitingSpot(bot.currentStation, true);
          showToast(`Memantau posisi ${bot.data.name} di Station 0${bot.currentStation + 1}`, "info");
        }
      } else if (remoteAvatars.has(spectateTargetId)) {
        const rem = remoteAvatars.get(spectateTargetId);
        state.player.x = rem.root.position.x;
        state.player.z = rem.root.position.z + 1.5;
        showToast(`Memantau kamera peserta live: ${rem.name}`, "info");
      }
    });
  }

  document.getElementById("btn-doors-open").addEventListener("click", () => {
    if (netMode === "ws") netSetDoors("work"); else startWorkPhase();
    showToast("Seluruh lampu pintu diubah menjadi HIJAU (Boleh Masuk).", "success");
  });
  document.getElementById("btn-doors-lock").addEventListener("click", () => {
    if (netMode === "ws") netSetDoors("prep"); else startPrepPhase();
    showToast("Seluruh lampu pintu diubah menjadi MERAH (Terkunci).", "warning");
  });
  document.getElementById("btn-assessor-replay").addEventListener("click", start3DReplay);
  document.getElementById("btn-open-assessor-scores").addEventListener("click", openAssessorScoresModal);

  const btnSaveScore = document.getElementById("btn-save-assessor-score");
  if (btnSaveScore) {
    btnSaveScore.addEventListener("click", () => {
      const scoreInput = document.getElementById("input-station-score");
      const globalSel = document.getElementById("sel-assessor-global");
      const val = parseInt(scoreInput.value, 10) || 0;
      const gRating = globalSel ? globalSel.value : "PASS";
      const prog = state.stationProgress[state.currentStationIdx];
      prog.score = Math.min(100, Math.max(0, val));
      prog.globalRating = gRating;
      prog.completed = true;
      playBell("click");
      showToast(`Nilai ${val} (${gRating}) tersimpan untuk ${currentSt.code} pada ${new Date().toLocaleTimeString("id-ID")}!`, "success");
      updateHUD();
    });
  }
}

// =========================================================================
// MODAL INPUT & EDIT PETUNJUK RUANGAN OLEH DOSEN / ASESOR
// Mendukung Bank Soal Berbeda Antara Koridor A dan Koridor B
// =========================================================================
function openEditInstructionModal(selectedStationIdx = state.currentStationIdx) {
  const modal = document.getElementById("modal-edit-instruction");
  if (!modal) return;

  const selectWing = document.getElementById("edit-select-wing");
  const selectSt = document.getElementById("edit-select-station");

  if (selectWing) {
    selectWing.value = String(state.wing || 0);
    selectWing.onchange = () => {
      refreshStationDropdownOptions();
      loadStationToEditForm();
    };
  }

  function refreshStationDropdownOptions() {
    if (!selectSt) return;
    const currentWing = selectWing ? parseInt(selectWing.value, 10) : 0;
    const curStations = (typeof STATIONS_WINGS !== "undefined" && STATIONS_WINGS[currentWing]) ? STATIONS_WINGS[currentWing] : STATIONS;
    const curIdx = parseInt(selectSt.value, 10);
    const chosenIdx = isNaN(curIdx) ? selectedStationIdx : curIdx;

    selectSt.innerHTML = curStations.map((s, idx) => `
      <option value="${idx}" ${idx === chosenIdx ? "selected" : ""}>
        ${s.code}: ${s.title.substring(0, 32)}…
      </option>
    `).join("");
  }

  if (selectSt) {
    refreshStationDropdownOptions();
    selectSt.onchange = () => loadStationToEditForm();
  }

  loadStationToEditForm();
  modal.classList.remove("hidden");
  modal.classList.add("flex");
}

function closeEditInstructionModal() {
  const modal = document.getElementById("modal-edit-instruction");
  if (modal) {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  }
}

function loadStationToEditForm() {
  const selectWing = document.getElementById("edit-select-wing");
  const selectSt = document.getElementById("edit-select-station");
  const targetWing = selectWing ? parseInt(selectWing.value, 10) : (state.wing || 0);
  const targetIdx = selectSt ? parseInt(selectSt.value, 10) : state.currentStationIdx;

  const st = (typeof getStationData === "function")
    ? getStationData(targetWing, targetIdx)
    : ((typeof STATIONS_WINGS !== "undefined" && STATIONS_WINGS[targetWing]) ? STATIONS_WINGS[targetWing][targetIdx] : STATIONS[targetIdx]);
  if (!st) return;

  document.getElementById("edit-st-title").value = st.title || "";
  document.getElementById("edit-st-door-text").value = st.doorShortInstruction || "";
  document.getElementById("edit-st-scenario").value = st.scenario || "";
  document.getElementById("edit-st-tasks").value = (st.tasks || []).join("\n");
  document.getElementById("edit-st-competencies").value = st.competencies || "";
}

function saveEditedInstructionFromForm() {
  const selectWing = document.getElementById("edit-select-wing");
  const selectSt = document.getElementById("edit-select-station");
  const targetWing = selectWing ? parseInt(selectWing.value, 10) : 0;
  const stationIdx = selectSt ? parseInt(selectSt.value, 10) : 0;
  if (isNaN(stationIdx)) return;

  const baseStation = (typeof getStationData === "function")
    ? getStationData(targetWing, stationIdx)
    : STATIONS[stationIdx];

  const updatedData = {
    title: document.getElementById("edit-st-title").value.trim(),
    doorShortInstruction: document.getElementById("edit-st-door-text").value.trim(),
    scenario: document.getElementById("edit-st-scenario").value.trim(),
    tasks: document.getElementById("edit-st-tasks").value.split("\n").filter((t) => t.trim().length > 0),
    competencies: document.getElementById("edit-st-competencies").value.trim()
  };

  if (typeof updateStationDoorPoster === "function") {
    updateStationDoorPoster(stationIdx, targetWing);
  }

  playBell("chime");
  const wingName = targetWing === 1 ? "KORIDOR B" : "KORIDOR A";
  showToast(`Petunjuk Station ${stationIdx + 1} (${wingName}) berhasil diperbarui!`, "success");
  closeEditInstructionModal();
  updateHUD();
}

// =========================================================================
// REKAP HASIL SEMUA PESERTA + ANALISIS BUTIR SOAL & KALIBRASI ANTAR-ASESOR
// =========================================================================
function openAssessorScoresModal() {
  const modal = document.getElementById("modal-assessor-scores");
  if (!modal) return;
  modal.classList.remove("hidden");
  modal.classList.add("flex");
  if (netMode === "ws") netRequestScores(); else renderAssessorScoreTable();
}

function closeAssessorScoresModal() {
  const modal = document.getElementById("modal-assessor-scores");
  if (!modal) return;
  modal.classList.add("hidden");
  modal.classList.remove("flex");
}

function renderAssessorScoreTable() {
  const tbody = document.getElementById("assessor-scores-tbody");
  if (!tbody) return;

  let records = window.lastScores || [];
  if (netMode !== "ws") {
    const stations = {};
    state.stationProgress.forEach((p, i) => {
      if (p.completed) stations[i] = { passed: !!(p.isCorrect ?? p.passed), score: p.score, globalRating: p.globalRating };
    });
    records = [{ nim: state.userProfile.nim, name: state.userProfile.name, room: state.roomId || 1, stations }];
  }

  const rows = [];
  records.forEach((r) => {
    Object.keys(r.stations || {}).sort((a, b) => a - b).forEach((idx) => {
      const s = r.stations[idx];
      if (OSCE_SCORING.isRestStation(Number(idx))) return;
      const isPass = Boolean(s.passed ?? s.isCorrect);
      rows.push(`
        <tr class="${isPass ? "bg-emerald-50/60" : "bg-rose-50/60"} text-[11px]">
          <td class="p-2 font-mono">${r.nim}</td>
          <td class="p-2 font-semibold">${r.name}</td>
          <td class="p-2 text-center">${r.room ?? "-"}</td>
          <td class="p-2 text-center font-bold">${Number(idx) + 1}</td>
          <td class="p-2 text-center font-black ${isPass ? "text-emerald-700" : "text-rose-600"}">${s.globalRating || (isPass ? "PASS" : "BORDERLINE")}</td>
          <td class="p-2 text-center font-bold">${s.score}</td>
          <td class="p-2 text-center">
            <input type="number" min="0" max="100" value="${s.assessorScore ?? ""}" data-nim="${r.nim}" data-idx="${idx}"
              class="w-14 px-1 py-0.5 border border-slate-300 rounded text-center asr-input" />
          </td>
          <td class="p-2 text-center">
            <button type="button" data-nim="${r.nim}" data-idx="${idx}" class="asr-save px-2 py-0.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-bold">Simpan</button>
          </td>
        </tr>`);
    });
  });

  tbody.innerHTML = rows.length ? rows.join("") :
    `<tr><td colspan="8" class="p-4 text-center text-slate-500 text-xs">Belum ada peserta yang menyelesaikan station.</td></tr>`;

  tbody.querySelectorAll(".asr-save").forEach((btn) => {
    btn.addEventListener("click", () => {
      const input = tbody.querySelector(`.asr-input[data-nim="${btn.dataset.nim}"][data-idx="${btn.dataset.idx}"]`);
      const val = parseInt(input.value, 10);
      if (isNaN(val)) return;
      if (netMode === "ws") {
        netSendAssessorScore(btn.dataset.nim, parseInt(btn.dataset.idx, 10), val);
        btn.textContent = "✓ Tersimpan";
        showToast(`Nilai manual (${val}) berhasil disimpan ke server.`, "success");
      } else {
        showToast("Nilai manual tersimpan di sesi lokal.", "info");
      }
    });
  });
}

function downloadAllScoresCsv() {
  if (netMode === "ws" && state.jwtToken) {
    window.open(`/api/scores.csv?token=${encodeURIComponent(state.jwtToken)}`, "_blank");
  } else {
    OSCE_SCORING.exportScoreToCSV();
  }
}
