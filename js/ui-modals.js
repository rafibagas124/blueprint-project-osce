// =========================================================================
// MODAL UI: Petunjuk Pintu, Peta Station, Lembar Kerja, Blueprint
// =========================================================================

// Modal Petunjuk Pintu
async function openInstructionModal() {
  playBell("click");
  state.hasReadInstruction = true;
  const idx = state.currentStationIdx;
  const stationNo = idx + 1; // TODO Fase 4: rotasi dinamis per ronde
  const st = (typeof STATIONS !== "undefined" && STATIONS[idx]) ? STATIONS[idx] : {};

  if (!activeStationServerData && stationNo <= 9 && typeof ExamAPI !== "undefined" && ExamAPI.fetchStation) {
    try {
      activeStationServerData = await ExamAPI.fetchStation(stationNo);
    } catch (e) {
      // Gunakan fallback lokal sementara jika ada kendala
    }
  }

  const data = activeStationServerData || st;
  document.getElementById("inst-badge").textContent = `${data.code || st.code} • ${(data.area || st.area || "OSCE").toUpperCase()}`;
  document.getElementById("inst-title").textContent = data.title || st.title || "";
  document.getElementById("inst-scenario").textContent = data.scenario || st.scenario || "";
  document.getElementById("inst-tasks").innerHTML = (data.tasks || st.tasks || []).map(t => `<li>${t}</li>`).join("");
  document.getElementById("inst-competencies").textContent = data.competencies || st.competencies || "";

  const doorStatus = document.getElementById("inst-door-status");
  if (state.phase === "prep") {
    doorStatus.textContent = "Pintu Terkunci (Waktu Persiapan)";
    doorStatus.className = "px-2.5 py-1 rounded-lg font-bold text-xs bg-amber-200 text-amber-950";
  } else {
    doorStatus.textContent = "Pintu Terbuka (Silakan Masuk)";
    doorStatus.className = "px-2.5 py-1 rounded-lg font-bold text-xs bg-emerald-200 text-emerald-950";
  }

  const modal = document.getElementById("modal-instruction");
  modal.classList.remove("hidden");
  modal.classList.add("flex");
}

function closeInstructionModal() {
  const modal = document.getElementById("modal-instruction");
  modal.classList.add("hidden");
  modal.classList.remove("flex");
}

// Modal Peta 10 Station
function openMapModal() {
  playBell("click");
  const isAssessor = (state.userProfile.role === "assessor");
  const tbody = document.getElementById("map-stations-tbody");
  tbody.innerHTML = STATIONS.map((st, idx) => {
    const isCurrent = (idx === state.currentStationIdx);
    const prog = state.stationProgress[idx];
    const canJump = isAssessor || isCurrent;
    return `
      <tr class="hover:bg-slate-50 transition ${isCurrent ? 'bg-teal-50/70 font-semibold' : ''}">
        <td class="p-2.5 text-center font-bold">${st.code}</td>
        <td class="p-2.5 font-medium">${st.title}</td>
        <td class="p-2.5 text-slate-600 font-medium">${st.area}</td>
        <td class="p-2.5 text-center">
          <span class="px-2 py-0.5 rounded text-[11px] font-bold ${prog.completed ? 'bg-emerald-100 text-emerald-950' : isCurrent ? 'bg-teal-100 text-teal-950' : 'bg-slate-100 text-slate-900'}">
            ${prog.completed ? 'Selesai' : isCurrent ? 'Sedang Aktif' : 'Belum'}
          </span>
        </td>
        <td class="p-2.5 text-center">
          <button type="button" class="btn-jump-station px-3 py-1 rounded-lg text-xs font-bold transition ${canJump ? (isCurrent ? 'bg-emerald-800 hover:bg-emerald-900 text-white' : 'bg-teal-800 hover:bg-teal-900 text-white') : 'bg-slate-200 text-slate-600 cursor-not-allowed'}" data-idx="${idx}" data-allowed="${canJump}">
            ${isCurrent ? 'Posisi Anda ✓' : (canJump ? 'Ke Station Ini →' : 'Terkunci 🔒')}
          </button>
        </td>
      </tr>
    `;
  }).join("");

  document.querySelectorAll(".btn-jump-station").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const idx = parseInt(e.currentTarget.dataset.idx, 10);
      const allowed = e.currentTarget.dataset.allowed === "true";
      if (!allowed) {
        showToast(`⛔ Akses Ditolak: Anda belum giliran di ${STATIONS[idx].code}! Selesaikan ${STATIONS[state.currentStationIdx].code} terlebih dahulu.`, "warning");
        playBell("click");
        return;
      }
      state.currentStationIdx = idx;
      moveCameraToStationWaitingSpot(idx, true);
      startPrepPhase();
      closeMapModal();
    });
  });

  const modal = document.getElementById("modal-map");
  modal.classList.remove("hidden");
  modal.classList.add("flex");
}

function closeMapModal() {
  const modal = document.getElementById("modal-map");
  modal.classList.add("hidden");
  modal.classList.remove("flex");
}

// Modal Lembar Kerja / Workstation
var selectedDecision = null; // ID opsi jawaban yang dipilih peserta (string opt.id)
let currentWorkTab = "form";
let activeStationServerData = null; // Disimpan HANYA di memori modul aktif (tidak ke localStorage)

function updateCompleteButtonState() {
  const btn = document.getElementById("btn-complete-station");
  if (!btn) return;
  const idx = state.currentStationIdx;
  const stationNo = idx + 1; // TODO Fase 4: rotasi dinamis per ronde

  if (stationNo === 10) {
    btn.disabled = false;
    btn.classList.remove("opacity-50", "cursor-not-allowed");
    btn.textContent = "Selesai Istirahat ✓";
    return;
  }

  const isSubmitted = (typeof ExamAPI !== "undefined" && ExamAPI.isStationSubmitted(stationNo)) ||
                      (state.stationProgress && state.stationProgress[idx] && state.stationProgress[idx].submitted);

  if (isSubmitted) {
    btn.disabled = true;
    btn.classList.add("opacity-50", "cursor-not-allowed");
    btn.textContent = "Jawaban diterima ✓";
    return;
  }

  if (selectedDecision === null || selectedDecision === undefined || selectedDecision === "") {
    btn.disabled = true;
    btn.classList.add("opacity-50", "cursor-not-allowed");
    btn.textContent = "Selesaikan Tugas Station Ini ✓";
  } else {
    btn.disabled = false;
    btn.classList.remove("opacity-50", "cursor-not-allowed");
    btn.textContent = "Selesaikan Tugas Station Ini ✓";
  }
}

async function openWorkstationModal(tab = "form") {
  playBell("click");
  currentWorkTab = tab;
  const idx = state.currentStationIdx;
  const stationNo = idx + 1; // TODO Fase 4: rotasi dinamis per ronde

  if (stationNo === 10) {
    activeStationServerData = {
      isRest: true,
      stationNo: 10,
      code: "S10",
      area: "Istirahat",
      title: "Station 10 - Istirahat",
      scenario: "Station Istirahat. Silakan manfaatkan waktu untuk rehat sejenak.",
      decisionQuestion: "Station Istirahat resmi. Silakan manfaatkan waktu untuk rehat sejenak.",
      options: []
    };
  } else {
    try {
      if (typeof ExamAPI !== "undefined" && ExamAPI.fetchStation) {
        activeStationServerData = await ExamAPI.fetchStation(stationNo);
      }
    } catch (err) {
      if (typeof showToast === "function") {
        showToast(err.message || "Gagal memuat soal stasiun.", "error");
      }
      return;
    }
  }

  renderWorkstationModal();
  const modal = document.getElementById("modal-workstation");
  modal.classList.remove("hidden");
  modal.classList.add("flex");
}

function closeWorkstationModal() {
  const modal = document.getElementById("modal-workstation");
  modal.classList.add("hidden");
  modal.classList.remove("flex");
}

function renderWorkstationModal() {
  const idx = state.currentStationIdx;
  const stationNo = idx + 1; // TODO Fase 4: rotasi dinamis per ronde
  const st = (typeof STATIONS !== "undefined" && STATIONS[idx]) ? STATIONS[idx] : {};
  const serverData = activeStationServerData || {};
  const prog = (state.stationProgress && state.stationProgress[idx]) ? state.stationProgress[idx] : {};
  prog.checklistTicks = prog.checklistTicks || {};

  const badgeText = `${serverData.code || st.code || `S${stationNo}`} • ${(serverData.area || st.area || "OSCE").toUpperCase()}`;
  const titleText = serverData.title || st.title || `Station ${stationNo}`;

  document.getElementById("workstation-badge").textContent = badgeText;
  document.getElementById("workstation-title").textContent = titleText;

  // Highlight active tab button
  ["npc", "lab", "form"].forEach((t) => {
    const b = document.getElementById(`tab-work-${t}`);
    if (b) {
      b.className = (t === currentWorkTab)
        ? "px-3.5 py-1.5 rounded-xl bg-teal-700 text-white font-bold text-xs shadow"
        : "px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-xs";
    }
  });

  const contentDiv = document.getElementById("workstation-tab-content");

  if (stationNo === 10) {
    contentDiv.innerHTML = `
      <div class="p-6 rounded-2xl bg-amber-50 border border-amber-300 text-center space-y-2">
        <div class="text-3xl">☕</div>
        <div class="font-bold text-base text-amber-950">Station 10 - Istirahat</div>
        <div class="text-xs text-amber-950 leading-relaxed font-medium">
          Ini adalah stasiun istirahat resmi. Anda dapat memanfaatkan waktu untuk beristirahat sebelum rotasi ke stasiun berikutnya.
        </div>
      </div>
    `;
    updateCompleteButtonState();
    return;
  }

  if (currentWorkTab === "npc") {
    if (typeof renderAiNpcTab === "function") {
      renderAiNpcTab(idx, contentDiv);
    }
  } else if (currentWorkTab === "lab") {
    contentDiv.innerHTML = `
      <div class="space-y-3">
        <div class="bg-amber-50 border border-amber-300 rounded-xl p-3 flex items-center justify-between">
          <div>
            <div class="font-bold text-amber-950">🔬 Pemeriksaan Alat 3D & Simulasi Laboratorium Interaktif</div>
            <div class="text-xs text-amber-950 mt-0.5">${serverData.labObjectTitle || st.labObjectTitle || ""}</div>
          </div>
          <span class="px-2.5 py-1 rounded-lg bg-amber-200 text-amber-950 font-bold text-[10px]">INTERAKTIF LANGSUNG</span>
        </div>
        <div class="p-3 rounded-xl border border-slate-200 bg-slate-50 font-mono text-xs leading-relaxed text-slate-800">
          ${serverData.labData || st.labData || ""}
        </div>
        <div id="workstation-interactive-sim"></div>
      </div>
    `;
    if (typeof renderInteractiveLabSimulation === "function") {
      renderInteractiveLabSimulation(idx, document.getElementById("workstation-interactive-sim"));
    }
  } else {
    // Tab Form / Keputusan Farmasetis
    const scenario = serverData.scenario || st.scenario || "";
    const decisionQ = serverData.decisionQuestion || st.decisionQuestion || "Pertanyaan keputusan klinis belum tersedia.";
    const options = (serverData.options && serverData.options.length > 0)
      ? serverData.options
      : ((st.options || []).map((o, i) => ({ id: String(i), text: o.text })));

    const isSubmitted = (typeof ExamAPI !== "undefined" && ExamAPI.isStationSubmitted(stationNo)) ||
                        (prog && prog.submitted);

    if (isSubmitted) {
      contentDiv.innerHTML = `
        <div class="space-y-4 py-6 text-center">
          <div class="w-16 h-16 mx-auto bg-emerald-100 text-emerald-950 rounded-full flex items-center justify-center text-3xl font-bold">
            ✓
          </div>
          <div class="space-y-1">
            <h4 class="text-base font-bold text-slate-900">Jawaban diterima</h4>
            <p class="text-xs text-slate-600 font-medium">Stasiun ini telah selesai dikerjakan dan jawaban Anda telah diterima oleh server.</p>
          </div>
          <div class="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-950 text-xs font-bold inline-flex items-center gap-2">
            <span>🔒</span> Stasiun terkunci.
          </div>
        </div>
      `;
      updateCompleteButtonState();
      return;
    }

    contentDiv.innerHTML = `
      <div class="space-y-3">
        <div id="workstation-form-sim-slot"></div>

        ${scenario ? `
          <div class="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1">
            <div class="font-bold text-slate-800 text-xs">📖 Skenario Kasus:</div>
            <div class="text-xs text-slate-700 leading-relaxed">${scenario}</div>
          </div>
        ` : ""}

        <div class="bg-indigo-50 border border-indigo-300 rounded-xl p-3">
          <div class="font-bold text-indigo-950 mb-1">Pertanyaan Keputusan Klinis / Farmasetis Akhir:</div>
          <div class="text-xs text-indigo-950">${decisionQ}</div>
        </div>

        <div class="space-y-2">
          ${options.map((opt) => `
            <label class="block p-3 rounded-xl border border-slate-200 hover:border-teal-500 cursor-pointer bg-white transition">
              <input type="radio" name="decision-option" value="${opt.id}" ${selectedDecision === opt.id ? "checked" : ""} class="mr-2 text-teal-600" />
              <span class="text-xs text-slate-800">${opt.text}</span>
            </label>
          `).join("")}
        </div>
      </div>
    `;

    if (typeof renderInteractiveLabSimulation === "function") {
      renderInteractiveLabSimulation(idx, document.getElementById("workstation-form-sim-slot"));
    }

    // Pasang event listener pada setiap radio opsi jawaban
    contentDiv.querySelectorAll('input[name="decision-option"]').forEach((radio) => {
      radio.addEventListener("change", (e) => {
        selectedDecision = e.target.value;
        updateCompleteButtonState();
      });
    });
  }

  updateCompleteButtonState();
}

// Modal Blueprint Teknis
function openBlueprintModal() {
  playBell("click");
  const modal = document.getElementById("modal-blueprint");
  modal.classList.remove("hidden");
  modal.classList.add("flex");
}

function closeBlueprintModal() {
  const modal = document.getElementById("modal-blueprint");
  modal.classList.add("hidden");
  modal.classList.remove("flex");
}

function switchBlueprintTab(activeKey) {
  ["algo", "stations", "arch", "score"].forEach(key => {
    const btn = document.getElementById(`btn-bp-tab-${key}`);
    const content = document.getElementById(`bp-content-${key}`);
    if (btn && content) {
      if (key === activeKey) {
        btn.className = "px-3.5 py-1.5 rounded-xl bg-indigo-800 text-white font-bold";
        content.classList.remove("hidden");
      } else {
        btn.className = "px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-900 hover:bg-slate-200 font-medium";
        content.classList.add("hidden");
      }
    }
  });

  if (activeKey === "stations") {
    const tbody = document.getElementById("bp-stations-tbody");
    tbody.innerHTML = STATIONS.map(st => `
      <tr class="hover:bg-slate-50 text-xs">
        <td class="p-2 font-bold">${st.code}</td>
        <td class="p-2 font-semibold text-teal-950">${st.title}</td>
        <td class="p-2 text-slate-600 font-medium">${st.area}</td>
        <td class="p-2">${st.type}</td>
        <td class="p-2 text-[11px] font-mono text-slate-600">${st.labObjectTitle}</td>
      </tr>
    `).join("");
  }
}

