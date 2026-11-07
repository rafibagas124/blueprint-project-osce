// =========================================================================
// INPUT HANDLER: Event listener, keyboard, mouse, touch, joystick
// =========================================================================

// =========================================================================
// INPUT & EVENT LISTENERS
// =========================================================================
function wireEvents() {
  // Login Form
  document.getElementById("btn-login-submit").addEventListener("click", handleLoginSubmit);

  // Top Row Buttons
  document.getElementById("btn-skip-phase").addEventListener("click", () => {
    if (state.phase === "prep") startWorkPhase();
    else if (state.sceneView === "corridor") enterStationRoom();
    else openWorkstationModal("form");
  });

  document.getElementById("btn-toggle-camera").addEventListener("click", toggleCameraView);
  document.getElementById("btn-toggle-peers").addEventListener("click", togglePeersPanel);
  document.getElementById("btn-close-peers").addEventListener("click", togglePeersPanel);

  document.getElementById("btn-open-map").addEventListener("click", openMapModal);
  document.getElementById("btn-toggle-station-list").addEventListener("click", openMapModal);
  document.getElementById("btn-close-map").addEventListener("click", closeMapModal);

  document.getElementById("btn-open-blueprint").addEventListener("click", openBlueprintModal);
  document.getElementById("btn-close-blueprint").addEventListener("click", closeBlueprintModal);
  document.getElementById("btn-close-blueprint-bottom").addEventListener("click", closeBlueprintModal);

  document.getElementById("btn-bp-tab-algo").addEventListener("click", () => switchBlueprintTab("algo"));
  document.getElementById("btn-bp-tab-stations").addEventListener("click", () => switchBlueprintTab("stations"));
  document.getElementById("btn-bp-tab-arch").addEventListener("click", () => switchBlueprintTab("arch"));
  document.getElementById("btn-bp-tab-score").addEventListener("click", () => switchBlueprintTab("score"));

  // Dosen Edit Door Prompt Button & Form
  const btnEditPrompt = document.getElementById("btn-dosen-edit-prompt");
  if (btnEditPrompt) btnEditPrompt.addEventListener("click", () => openEditInstructionModal(state.currentStationIdx));
  document.getElementById("btn-close-edit-instruction").addEventListener("click", closeEditInstructionModal);
  document.getElementById("btn-cancel-edit-instruction").addEventListener("click", closeEditInstructionModal);
  document.getElementById("btn-save-edit-instruction").addEventListener("click", saveEditedInstructionFromForm);

  // Floating 3D Markers Click
  document.getElementById("btn-chair-marker").addEventListener("click", sitOnWaitingChair);
  document.getElementById("btn-door-marker").addEventListener("click", () => {
    if (state.phase === "prep") openInstructionModal();
    else enterStationRoom();
  });
  document.getElementById("btn-room-npc").addEventListener("click", () => openWorkstationModal("npc"));
  document.getElementById("btn-room-lab").addEventListener("click", () => openWorkstationModal("lab"));
  document.getElementById("btn-room-desk").addEventListener("click", () => openWorkstationModal("form"));

  // Bottom Center Context Action
  document.getElementById("btn-context-action").addEventListener("click", triggerPrimaryContextAction);
  document.getElementById("btn-exit-room").addEventListener("click", exitStationRoomToCorridor);

  // Instruction Modal
  document.getElementById("btn-close-instruction").addEventListener("click", closeInstructionModal);
  document.getElementById("btn-inst-sit").addEventListener("click", () => {
    closeInstructionModal();
    sitOnWaitingChair();
  });
  document.getElementById("btn-inst-enter").addEventListener("click", () => {
    closeInstructionModal();
    enterStationRoom();
  });

  // Workstation Modal
  document.getElementById("btn-close-workstation").addEventListener("click", closeWorkstationModal);
  document.getElementById("tab-work-npc").addEventListener("click", () => {
    currentWorkTab = "npc";
    renderWorkstationModal();
  });
  document.getElementById("tab-work-lab").addEventListener("click", () => {
    currentWorkTab = "lab";
    renderWorkstationModal();
  });
  document.getElementById("tab-work-form").addEventListener("click", () => {
    currentWorkTab = "form";
    renderWorkstationModal();
  });
  document.getElementById("btn-complete-station").addEventListener("click", () => {
    const idx = state.currentStationIdx;
    const prog = state.stationProgress[idx];
    if (selectedDecision === null && !(prog && prog.simSolved)) {
      showToast(typeof OSCE_I18N !== "undefined" ? OSCE_I18N.t("toast_select_decision") : "Pilih salah satu jawaban atau selesaikan simulasi interaktif terlebih dahulu.", "warning");
      currentWorkTab = "form";
      renderWorkstationModal();
      return;
    }
    const chosenIdx = selectedDecision !== null ? selectedDecision : 0;
    const result = OSCE_SCORING.evaluateStudentDecision(idx, chosenIdx);
    selectedDecision = null;
    closeWorkstationModal();

    // 1. Kembalikan peserta & seluruh teman sekoridor dari dalam ruangan ke koridor terlebih dahulu
    exitStationRoomToCorridor();
    if (typeof peerBotsExitToCorridor === "function") peerBotsExitToCorridor();
    updateDoorStatusLamps(state.phase, idx);

    const nextStCode = STATIONS[(idx + 1) % STATIONS.length].code;
    if (result && !OSCE_SCORING.isRestStation(idx)) {
      const statusText = result.isCorrect ? "BENAR ✓" : "SALAH ✗";
      showToast(`Terkirim ke Dosen: ${statusText} (Skor: ${result.score} • ${result.globalRating}). Kembali ke koridor → lanjut ke ${nextStCode}`, result.isCorrect ? "success" : "warning");
      updateSubtitle(`Tugas ${STATIONS[idx].code} selesai & terkirim ke Dosen (${statusText}, Skor ${result.score}). Anda kembali di koridor (Lampu Pintu MERAH). Bersiap rotasi ke ${nextStCode}...`);
    }
    const summary = OSCE_SCORING.calculateSummary();
    if (summary.completedCount >= summary.totalStations) {
      OSCE_SCORING.showStudentResultModal();
    }
    // 2. Setelah kembali ke koridor (1.4 detik), bergeser/berjalan menuju stasiun berikutnya
    setTimeout(() => {
      advanceToNextStation();
    }, 1400);
  });

  // Voice Announcement Toggle
  document.getElementById("btn-toggle-voice").addEventListener("click", () => {
    state.voiceEnabled = !state.voiceEnabled;
    document.getElementById("voice-icon").textContent = state.voiceEnabled ? "🔊" : "🔇";
    document.getElementById("voice-label").textContent = state.voiceEnabled ? "Suara Aktif" : "Suara Mati";
  });

  // Rotasi mode selector
  document.getElementById("select-movement-mode").addEventListener("change", (e) => {
    state.movementMode = e.target.value;
    if (state.movementMode === "map") openMapModal();
  });

  // Menu Modal (Esc)
  const menuModal = document.getElementById("modal-menu");
  document.getElementById("btn-open-menu").addEventListener("click", () => {
    menuModal.classList.remove("hidden");
    menuModal.classList.add("flex");
  });
  document.getElementById("btn-close-menu").addEventListener("click", () => {
    menuModal.classList.add("hidden");
    menuModal.classList.remove("flex");
  });
  document.getElementById("btn-resume-sim").addEventListener("click", () => {
    menuModal.classList.add("hidden");
    menuModal.classList.remove("flex");
  });

  // D-Pad On Screen Controls
  const moveStep = (forward, turn) => {
    state.player.targetX = null;
    state.player.targetZ = null;
    state.isSeated = false;
    state.player.y = 1.65;
    state.player.yaw += turn;
    const speed = 0.55 * forward;
    state.player.x -= Math.sin(state.player.yaw) * speed;
    state.player.z -= Math.cos(state.player.yaw) * speed;
    clampPlayerPosition();
  };
  // Tombol layar sentuh: tahan untuk berjalan terus (HP / tablet / iPhone)
  const holdKey = (id, key) => {
    const el = document.getElementById(id);
    if (!el) return;
    const down = (e) => { e.preventDefault(); state.keys[key] = true; };
    const up = (e) => { e.preventDefault(); state.keys[key] = false; };
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointerleave", up);
    el.addEventListener("pointercancel", up);
    el.addEventListener("contextmenu", (e) => e.preventDefault());
  };
  holdKey("btn-move-forward", "w");
  holdKey("btn-move-back", "s");
  holdKey("btn-turn-left", "a");
  holdKey("btn-turn-right", "d");

  // Form Login: toggle role Mahasiswa (NIM + Token) vs Asesor (Username + Password)
  document.getElementById("login-select-role").addEventListener("change", (e) => {
    const isAssessor = (e.target.value === "assessor");
    const studentSec = document.getElementById("login-student-section");
    const assessorSec = document.getElementById("login-assessor-section");
    if (studentSec) studentSec.classList.toggle("hidden", isAssessor);
    if (assessorSec) assessorSec.classList.toggle("hidden", !isAssessor);
  });
  document.getElementById("btn-close-assessor-scores").addEventListener("click", closeAssessorScoresModal);
  document.getElementById("btn-assessor-refresh").addEventListener("click", () => {
    if (netMode === "ws") netRequestScores(); else renderAssessorScoreTable();
  });
  document.getElementById("btn-assessor-csv").addEventListener("click", downloadAllScoresCsv);
  document.getElementById("btn-toggle-corridor").addEventListener("click", switchCorridorWing);
  document.getElementById("btn-view-score").addEventListener("click", () => OSCE_SCORING.showStudentResultModal());
  const closeScore = () => {
    const m = document.getElementById("modal-scoring-result");
    m.classList.add("hidden");
    m.classList.remove("flex");
  };
  document.getElementById("btn-close-score-result").addEventListener("click", closeScore);
  document.getElementById("btn-close-score-bottom").addEventListener("click", closeScore);
  document.getElementById("btn-export-csv").addEventListener("click", () => OSCE_SCORING.exportScoreToCSV());

  // Keyboard Navigation
  window.addEventListener("keydown", (e) => {
    if (!state.isLoggedIn) return;
    const tag = (e.target && e.target.tagName) || "";
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return; // jangan bergerak saat mengetik
    const k = e.key.toLowerCase();
    if (k === "w" || e.key === "ArrowUp") state.keys.w = true;
    if (k === "s" || e.key === "ArrowDown") state.keys.s = true;
    if (k === "a" || e.key === "ArrowLeft") state.keys.a = true;
    if (k === "d" || e.key === "ArrowRight") state.keys.d = true;
    if (k === "e") triggerPrimaryContextAction();
    if (k === "v") toggleCameraView();
    if (k === "p") togglePeersPanel();
    if (e.key === "Escape") {
      menuModal.classList.toggle("hidden");
      menuModal.classList.toggle("flex");
    }
  });

  window.addEventListener("keyup", (e) => {
    const k = e.key.toLowerCase();
    if (k === "w" || e.key === "ArrowUp") state.keys.w = false;
    if (k === "s" || e.key === "ArrowDown") state.keys.s = false;
    if (k === "a" || e.key === "ArrowLeft") state.keys.a = false;
    if (k === "d" || e.key === "ArrowRight") state.keys.d = false;
  });

  // Mouse Drag to look around in 3D
  let isDragging = false;
  let prevX = 0;
  let prevY = 0;
  const canvasContainer = document.getElementById("canvas-container");

  canvasContainer.addEventListener("mousedown", (e) => {
    isDragging = true;
    prevX = e.clientX;
    prevY = e.clientY;
    state.player.targetYaw = null;
  });

  window.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    const dx = e.clientX - prevX;
    const dy = e.clientY - prevY;
    prevX = e.clientX;
    prevY = e.clientY;
    state.player.yaw -= dx * 0.0045;
    state.player.pitch = Math.max(-0.55, Math.min(0.55, state.player.pitch - dy * 0.0035));
  });

  window.addEventListener("mouseup", () => { isDragging = false; });

  // Touch Support
  canvasContainer.addEventListener("touchstart", (e) => {
    if (e.touches.length === 1) {
      isDragging = true;
      prevX = e.touches[0].clientX;
      prevY = e.touches[0].clientY;
      state.player.targetYaw = null;
    }
  }, { passive: true });

  window.addEventListener("touchmove", (e) => {
    if (!isDragging || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - prevX;
    const dy = e.touches[0].clientY - prevY;
    prevX = e.touches[0].clientX;
    prevY = e.touches[0].clientY;
    state.player.yaw -= dx * 0.005;
    state.player.pitch = Math.max(-0.55, Math.min(0.55, state.player.pitch - dy * 0.004));
  }, { passive: true });

  window.addEventListener("touchend", () => { isDragging = false; });

  window.addEventListener("resize", () => {
    if (!camera || !renderer) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
}

let lastBarrierWarningTime = 0;

function clampPlayerPosition() {
  if (state.sceneView === "corridor") {
    state.player.z = Math.max(-19.5, Math.min(13.5, state.player.z));
    const isStudent = (state.userProfile.role !== "assessor");

    if (isStudent) {
      // MAHASISWA TERISOLASI DI KORIDOR MASING-MASING (TIDAK BISA MENYEBERANG)
      if (state.wing === 0) {
        // Koridor A: batas x = -2.35 s/d 3.40 (pintu selasar penghubung terkunci untuk mahasiswa)
        if (state.player.x > 3.40) {
          state.player.x = 3.40;
          const now = Date.now();
          if (now - lastBarrierWarningTime > 2800) {
            lastBarrierWarningTime = now;
            showToast("⛔ AKSES DITOLAK: Anda mahasiswa KORIDOR A! Dilarang melintas ke wilayah Koridor B.", "error");
            playBell("click");
          }
        }
        state.player.x = Math.max(-2.35, Math.min(3.40, state.player.x));
      } else {
        // Koridor B: batas x = WING_DX - 3.40 s/d WING_DX + 2.35 (8.10 s/d 13.85)
        const minX = WING_DX - 3.40;
        if (state.player.x < minX) {
          state.player.x = minX;
          const now = Date.now();
          if (now - lastBarrierWarningTime > 2800) {
            lastBarrierWarningTime = now;
            showToast("⛔ AKSES DITOLAK: Anda mahasiswa KORIDOR B! Dilarang melintas ke wilayah Koridor A.", "error");
            playBell("click");
          }
        }
        state.player.x = Math.max(minX, Math.min(WING_DX + 2.35, state.player.x));
      }
    } else {
      // DOSEN / ASESOR DAPAT MENYEBERANG BEBAS ANTARA KORIDOR A & B MELALUI JALAN PENGHUBUNG
      if (state.player.z >= 9.0 && state.player.z <= 12.6) {
        state.player.x = Math.max(-2.35, Math.min(WING_DX + 2.35, state.player.x));
        const newWing = state.player.x > (WING_DX * 0.5) ? 1 : 0;
        if (newWing !== state.wing) {
          state.wing = newWing;
          if (typeof syncActiveStations === "function") syncActiveStations(state.wing);
          if (typeof updateTelemetry === "function") updateTelemetry();
          showToast(newWing === 1 ? "Dosen memasuki Gedung / Koridor B" : "Dosen memasuki Gedung / Koridor A", "info");
        }
      } else {
        const off = wingOffsetX();
        state.player.x = Math.max(off - 2.35, Math.min(off + 2.35, state.player.x));
      }
    }
  } else {
    state.player.x = Math.max(-2.6, Math.min(2.6, state.player.x));
    state.player.z = Math.max(-0.3, Math.min(2.7, state.player.z));
  }
}

