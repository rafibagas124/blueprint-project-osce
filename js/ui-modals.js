// =========================================================================
// MODAL UI: Petunjuk Pintu, Peta Station, Lembar Kerja, Blueprint
// =========================================================================

// Modal Petunjuk Pintu
function openInstructionModal() {
  playBell("click");
  state.hasReadInstruction = true;
  const st = STATIONS[state.currentStationIdx];
  document.getElementById("inst-badge").textContent = `${st.code} • ${st.area.toUpperCase()}`;
  document.getElementById("inst-title").textContent = st.title;
  document.getElementById("inst-scenario").textContent = st.scenario;
  document.getElementById("inst-tasks").innerHTML = st.tasks.map(t => `<li>${t}</li>`).join("");
  document.getElementById("inst-competencies").textContent = st.competencies;

  const doorStatus = document.getElementById("inst-door-status");
  if (state.phase === "prep") {
    doorStatus.textContent = "Pintu Terkunci (Waktu Persiapan)";
    doorStatus.className = "px-2.5 py-1 rounded-lg font-bold text-xs bg-amber-200 text-amber-900";
  } else {
    doorStatus.textContent = "Pintu Terbuka (Silakan Masuk)";
    doorStatus.className = "px-2.5 py-1 rounded-lg font-bold text-xs bg-emerald-200 text-emerald-900";
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
        <td class="p-2.5 text-slate-500">${st.area}</td>
        <td class="p-2.5 text-center">
          <span class="px-2 py-0.5 rounded text-[11px] font-bold ${prog.completed ? 'bg-emerald-100 text-emerald-800' : isCurrent ? 'bg-teal-100 text-teal-800' : 'bg-slate-100 text-slate-600'}">
            ${prog.completed ? 'Selesai' : isCurrent ? 'Sedang Aktif' : 'Belum'}
          </span>
        </td>
        <td class="p-2.5 text-center">
          <button type="button" class="btn-jump-station px-3 py-1 rounded-lg text-xs font-bold transition ${canJump ? (isCurrent ? 'bg-emerald-700 hover:bg-emerald-600 text-white' : 'bg-teal-700 hover:bg-teal-600 text-white') : 'bg-slate-200 text-slate-400 cursor-not-allowed'}" data-idx="${idx}" data-allowed="${canJump}">
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
let currentWorkTab = "form";
let selectedDecision = null; // indeks jawaban yang dipilih peserta pada station aktif
function openWorkstationModal(tab = "form") {
  playBell("click");
  currentWorkTab = tab;
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
  const st = STATIONS[idx];
  const prog = state.stationProgress[idx] || {};
  prog.checklistTicks = prog.checklistTicks || {};

  document.getElementById("workstation-badge").textContent = `${st.code} • ${st.area.toUpperCase()}`;
  document.getElementById("workstation-title").textContent = st.title;

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
  if (currentWorkTab === "npc") {
    if (typeof renderAiNpcTab === "function") {
      renderAiNpcTab(idx, contentDiv);
    }
  } else if (currentWorkTab === "lab") {
    contentDiv.innerHTML = `
      <div class="space-y-3">
        <div class="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center justify-between">
          <div>
            <div class="font-bold text-amber-900">🔬 Pemeriksaan Alat 3D & Simulasi Laboratorium Interaktif</div>
            <div class="text-xs text-amber-950 mt-0.5">${st.labObjectTitle}</div>
          </div>
          <span class="px-2.5 py-1 rounded-lg bg-amber-200/80 text-amber-950 font-bold text-[10px]">INTERAKTIF LANGSUNG</span>
        </div>
        <div class="p-3 rounded-xl border border-slate-200 bg-slate-50 font-mono text-xs leading-relaxed text-slate-800">
          ${st.labData}
        </div>
        <div id="workstation-interactive-sim"></div>
      </div>
    `;
    if (typeof renderInteractiveLabSimulation === "function") {
      renderInteractiveLabSimulation(idx, document.getElementById("workstation-interactive-sim"));
    }
  } else {
    contentDiv.innerHTML = `
      <div class="space-y-3">
        <div id="workstation-form-sim-slot"></div>
        <!-- Checklist OSCE Berbobot & Item Kritis (Must-Pass) -->
        <div class="p-3.5 rounded-2xl border border-teal-200 bg-teal-50/40 space-y-2">
          <div class="flex items-center justify-between">
            <div class="font-black text-teal-950 text-xs">📋 Checklist Rubrik OSCE Asli (Item Berbobot & Item Kritis):</div>
            <span class="text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">★ = Item Kritis (Wajib Lulus)</span>
          </div>
          <div class="space-y-1.5">
            ${(st.checklist || []).map((c) => `
              <label class="flex items-center justify-between p-2 rounded-xl bg-white border ${c.critical ? 'border-rose-200' : 'border-slate-200'} cursor-pointer hover:border-teal-500">
                <div class="flex items-center gap-2">
                  <input type="checkbox" data-cid="${c.id}" class="chk-osce-item accent-teal-600 w-4 h-4" ${prog.checklistTicks[c.id] ? 'checked' : ''} />
                  <span class="text-xs text-slate-800 font-medium">${c.label}</span>
                  ${c.critical ? '<span class="px-1.5 py-0.5 rounded bg-rose-600 text-white font-black text-[9px]">★ KRITIS</span>' : ''}
                </div>
                <span class="text-[11px] font-mono font-bold text-teal-800">Bobot ${c.weight}%</span>
              </label>
            `).join("")}
          </div>
        </div>

        <div class="bg-indigo-50 border border-indigo-200 rounded-xl p-3">
          <div class="font-bold text-indigo-900 mb-1">Pertanyaan Keputusan Klinis / Farmasetis Akhir:</div>
          <div class="text-xs text-indigo-950">${st.decisionQuestion}</div>
        </div>
        <div class="space-y-2">
          ${st.options.map((opt, i) => `
            <label class="block p-3 rounded-xl border border-slate-200 hover:border-teal-500 cursor-pointer bg-white transition">
              <input type="radio" name="decision-option" value="${i}" ${selectedDecision === i ? "checked" : ""} onchange="selectedDecision = ${i}" class="mr-2 text-teal-600" />
              <span class="text-xs text-slate-800">${opt.text}</span>
            </label>
          `).join("")}
        </div>
      </div>
    `;
    if (typeof renderInteractiveLabSimulation === "function") {
      renderInteractiveLabSimulation(idx, document.getElementById("workstation-form-sim-slot"));
    }
    contentDiv.querySelectorAll(".chk-osce-item").forEach((chk) => {
      chk.addEventListener("change", (e) => {
        prog.checklistTicks[e.target.dataset.cid] = e.target.checked;
      });
    });
  }
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
        btn.className = "px-3.5 py-1.5 rounded-xl bg-indigo-700 text-white font-bold";
        content.classList.remove("hidden");
      } else {
        btn.className = "px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200";
        content.classList.add("hidden");
      }
    }
  });

  if (activeKey === "stations") {
    const tbody = document.getElementById("bp-stations-tbody");
    tbody.innerHTML = STATIONS.map(st => `
      <tr class="hover:bg-slate-50 text-xs">
        <td class="p-2 font-bold">${st.code}</td>
        <td class="p-2 font-semibold text-teal-800">${st.title}</td>
        <td class="p-2 text-slate-500">${st.area}</td>
        <td class="p-2">${st.type}</td>
        <td class="p-2 text-[11px] font-mono text-slate-600">${st.labObjectTitle}</td>
      </tr>
    `).join("");
  }
}

