(() => {
  const overlayId = "osce-clinical-overlay";
  const mentalStatusFields = [
    "Kesan Umum", "Kesadaran", "Mood/Afek", "Proses & Isi Pikir",
    "Persepsi", "Dorongan Instingtual", "Psikomotor"
  ];
  const state = {
    stations: [],
    role: "student",
    mode: "participant",
    stationIndex: 0,
    caseIndex: 0,
    timerSeconds: 15 * 60,
    timerId: null,
    timerRunning: false,
    revealed: {},
    scores: {},
    prescriptions: {},
    mentalStatus: {},
    dietInputs: { bbi: "55", correction: "0" }
  };

  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, (char) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[char]));
  }

  function authToken() {
    if (typeof window.state !== "undefined" && window.state.jwtToken) return window.state.jwtToken;
    return window.sessionStorage ? window.sessionStorage.getItem("osce_jwt") || "" : "";
  }

  function activeStation() {
    return state.stations[state.stationIndex];
  }

  function activeCase() {
    const station = activeStation();
    return station && station.cases[state.caseIndex];
  }

  function activeCaseKey() {
    const station = activeStation();
    const clinicalCase = activeCase();
    return `${station.number}-${clinicalCase.number}`;
  }

  function isExaminer() {
    return state.mode === "examiner";
  }

  function fmtTime(seconds) {
    const safeSeconds = Math.max(0, seconds);
    return `${String(Math.floor(safeSeconds / 60)).padStart(2, "0")}:${String(safeSeconds % 60).padStart(2, "0")}`;
  }

  function showToast(message) {
    if (typeof window.showToast === "function") window.showToast(message, "error");
  }

  async function loadStations() {
    const token = authToken();
    if (!token) throw new Error("Silakan login terlebih dahulu untuk membuka modul OSCE klinis.");
    const response = await fetch("/api/clinical-osce", {
      headers: { Authorization: `Bearer ${token}` }
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(body.error || `Gagal memuat bank kasus (HTTP ${response.status}).`);
    state.role = body.role;
    state.mode = body.role === "assessor" ? "examiner" : "participant";
    state.stations = body.stations;
    state.stationIndex = 0;
    state.caseIndex = 0;
    state.timerSeconds = 15 * 60;
    state.timerRunning = false;
    state.revealed = {};
    state.scores = {};
  }

  function taskList(items) {
    return `<ol class="osce-task-list">${items.map((task) => `<li>${escapeHtml(task)}</li>`).join("")}</ol>`;
  }

  function chipList(items) {
    return `<div class="osce-chip-list">${items.map((item) => `<span class="osce-chip">${escapeHtml(item)}</span>`).join("")}</div>`;
  }

  function renderSidebar() {
    return `<aside class="osce-sidebar">
      <div class="osce-sidebar-heading">Pilih Station & Kasus</div>
      ${state.stations.map((station, stationIndex) => `
        <div>
          <button type="button" class="osce-station-button ${stationIndex === state.stationIndex ? "is-active" : ""}" data-action="select-station" data-station="${stationIndex}" aria-current="${stationIndex === state.stationIndex ? "true" : "false"}">
            <span class="osce-station-number">${String(station.number).padStart(2, "0")}</span>
            <span class="osce-station-name">${escapeHtml(station.name)}</span>
            <span class="osce-station-count">${station.caseCount}</span>
          </button>
          ${stationIndex === state.stationIndex ? `<ul class="osce-case-list">${station.cases.map((clinicalCase, caseIndex) => `
            <li><button type="button" class="${caseIndex === state.caseIndex ? "is-active" : ""}" data-action="select-case" data-case="${caseIndex}">
              ${isExaminer() ? escapeHtml(clinicalCase.title) : `Kasus ${String(clinicalCase.number).padStart(2, "0")}`}
            </button></li>`).join("")}</ul>` : ""}
        </div>`).join("")}
    </aside>`;
  }

  function renderHeader(station) {
    const modeButtons = state.role === "assessor" ? `
      <div class="osce-mode-switch" aria-label="Mode tampilan">
        <button type="button" data-action="set-mode" data-mode="participant" aria-pressed="${!isExaminer()}">Peserta</button>
        <button type="button" data-action="set-mode" data-mode="examiner" aria-pressed="${isExaminer()}">Penguji</button>
      </div>` : "";
    return `<header class="osce-topbar">
      <div class="osce-brand">
        <div class="osce-brand-mark">OS</div>
        <div><div class="osce-brand-title">Clinical OSCE</div><div class="osce-brand-subtitle">Case workspace · 8 stations</div></div>
      </div>
      <div class="osce-top-meta">
        <span class="osce-role-label">${isExaminer() ? "Mode Penguji" : "Mode Peserta"}</span>
        ${modeButtons}
        <span class="osce-role-label">${escapeHtml(station.name)}</span>
        <button type="button" class="osce-close" data-action="close" aria-label="Tutup OSCE klinis">×</button>
      </div>
    </header>`;
  }

  function renderCaseTitle(station, clinicalCase) {
    const title = isExaminer() ? clinicalCase.title : `Station ${String(station.number).padStart(2, "0")} · Kasus ${String(clinicalCase.number).padStart(2, "0")}`;
    return `<div class="osce-page-heading">
      <div><div class="osce-eyebrow">Station ${String(station.number).padStart(2, "0")} / 08 · Durasi 15 menit</div>
        <h1>${escapeHtml(title)}</h1>
        <p>Gunakan alur anamnesis, pemeriksaan, penunjang, diagnosis, tatalaksana, dan KIE.</p>
      </div>
      <div class="osce-timer-card">
        <div class="osce-timer-icon">◷</div>
        <div><div class="osce-countdown" aria-live="polite">${fmtTime(state.timerSeconds)}</div><div class="osce-timer-caption">SISA WAKTU STATION</div></div>
        <div class="osce-timer-controls">
          <button type="button" data-action="toggle-timer">${state.timerRunning ? "Jeda" : "Mulai"}</button>
          <button type="button" data-action="reset-timer">Reset</button>
        </div>
      </div>
    </div>`;
  }

  function renderScenario(station, clinicalCase) {
    const scenario = clinicalCase.candidateScenario || "Skenario peserta belum tersedia.";
    return `<section class="osce-patient-banner">
      <div><div class="osce-label">Skenario Klinik · Soal Peserta</div><div class="osce-patient-text">${escapeHtml(scenario)}</div></div>
      <div><div class="osce-label">Instruksi Tugas</div>${taskList(clinicalCase.tasks || [])}</div>
    </section>
    ${isExaminer() && station.caseCountNote ? `<div class="osce-reveal-box">${escapeHtml(station.caseCountNote)}</div>` : ""}
    <div class="osce-two-column">
      <section class="osce-card">
        <div class="osce-card-head"><div class="osce-card-title"><span class="osce-card-icon">⌕</span>Anamnesis</div><span class="osce-eyebrow">Sacred 7 + riwayat</span></div>
        <div class="osce-label">Present Illness · Sacred 7</div>
        ${chipList(["Onset", "Lokasi", "Kualitas", "Kuantitas · VAS/NRS", "Kronologi/MOI", "Memperingan", "Memperberat", "Keluhan lain"])}
        <div class="osce-label" style="margin-top:11px">Past History</div>
        ${chipList(["RPD", "RPK", "Sosial/Lingkungan", "RPO/Medikasi", "Alergi", "Last meal · bedah"])}
        ${station.number === 3 ? `<div class="osce-label" style="margin-top:11px">Khusus Obgin</div>${chipList(["G-P-A", "HPHT · siklus · TP", "Riwayat KB", "Riwayat ANC"])}` : ""}
        ${station.number === 7 ? `<div class="osce-label" style="margin-top:11px">Khusus Psikiatri</div>${chipList(["Autoanamnesis", "Heteroanamnesis", "Riwayat psikiatri", "Riwayat NAPZA"])}` : ""}
      </section>
      <section class="osce-card">
        <div class="osce-card-head"><div class="osce-card-title"><span class="osce-card-icon">✚</span>Pemeriksaan Fisik</div>
          <button type="button" class="osce-request-button" data-action="request-physical">Minta hasil ke penguji</button></div>
        <div class="osce-card-copy">${chipList(["Vital: Kesadaran/AVPU", "TD · HR · RR · Suhu · SpO2", "BB · TB · LP", "General", "Status lokalis/khusus"])}</div>
        <div class="osce-card-copy" style="margin-top:8px">Hasil pemeriksaan hanya muncul setelah peserta meminta kepada penguji.</div>
        ${state.revealed.physical ? `<div class="osce-reveal-box"><strong>Hasil pemeriksaan:</strong>\n${escapeHtml(state.revealed.physical.findings)}\n<strong>Checklist umum:</strong>\n${escapeHtml((state.revealed.physical.generalExam || []).join(" · "))}</div>` : ""}
        ${station.eyeExam && station.eyeExam.length ? `<div class="osce-label" style="margin-top:10px">Pemeriksaan khusus mata</div>${chipList(station.eyeExam)}` : ""}
      </section>
    </div>
    <section class="osce-card">
      <div class="osce-card-head"><div class="osce-card-title"><span class="osce-card-icon">⌁</span>Pemeriksaan Penunjang & Media</div>
        <button type="button" class="osce-request-button" data-action="request-investigations">Minta hasil pemeriksaan</button></div>
      <div class="osce-card-copy">${chipList(["DL · UL · FL · kimia darah", "Fungsi tiroid · AGD · elektrolit", "Gram/KOH · BTA · kultur", "Troponin · ASTO · RF · IgM", "EKG · CXR · X-Ray lokal", "USG · CT-Scan"])}</div>
      ${state.revealed.investigations ? `<div class="osce-reveal-box">${escapeHtml(state.revealed.investigations.investigations)}</div>` : ""}
    </section>
    ${isExaminer() ? renderExaminerDetails(station, clinicalCase) : ""}
    ${station.number === 7 ? renderPsychStatus(clinicalCase) : ""}
    ${station.number === 4 && clinicalCase.number === 3 ? renderDietCalculator() : ""}
    ${renderPrescriptionPad(clinicalCase)}`;
  }

  function renderExaminerDetails(station, clinicalCase) {
    const dd = (clinicalCase.differentials && clinicalCase.differentials.length)
      ? clinicalCase.differentials.join(" · ")
      : "Belum dirinci dalam spesifikasi sumber.";
    const detail = [
      `<div><div class="osce-label">Diagnosis kerja</div><div class="osce-card-copy">${escapeHtml(clinicalCase.diagnosis)}</div></div>`,
      `<div style="margin-top:10px"><div class="osce-label">Diagnosis banding (2-3)</div><div class="osce-card-copy">${escapeHtml(dd)}</div></div>`,
      `<div style="margin-top:10px"><div class="osce-label">Tatalaksana / sumber kasus</div><div class="osce-card-copy">${escapeHtml(clinicalCase.treatment)}</div></div>`,
      `<div style="margin-top:10px"><div class="osce-label">Prosedur</div><div class="osce-card-copy">${escapeHtml(clinicalCase.procedure)}</div></div>`,
      `<div style="margin-top:10px"><div class="osce-label">KIE & rujukan</div><div class="osce-card-copy">${escapeHtml(clinicalCase.kie)}${clinicalCase.referral ? ` · Rujuk ${escapeHtml(clinicalCase.referral)}` : ""}</div></div>`,
      `<div style="margin-top:10px"><div class="osce-card-copy">${escapeHtml(clinicalCase.sourceNote)}</div></div>`
    ].join("");
    const items = (clinicalCase.rubric && clinicalCase.rubric.items) || [];
    return `<div class="osce-two-column">
      <section class="osce-card"><div class="osce-card-head"><div class="osce-card-title"><span class="osce-card-icon">◇</span>Diagnosis & Tatalaksana Penguji</div></div>${detail}</section>
      <section class="osce-card"><div class="osce-card-head"><div class="osce-card-title"><span class="osce-card-icon">☷</span>Rubrik Prosedur · Skor 0-1-2</div></div>
        ${renderRubric(station, clinicalCase, items)}
      </section>
    </div>`;
  }

  function renderRubric(station, clinicalCase, items) {
    if (!items.length) return `<div class="osce-card-copy">Rubrik belum tersedia.</div>`;
    const scores = state.scores[`${station.number}-${clinicalCase.number}`] || {};
    return `<table class="osce-rubric-table"><thead><tr><th>Komponen observasi</th><th>Skor</th></tr></thead><tbody>
      ${items.map((item, index) => `<tr><td>${escapeHtml(item.label)}</td><td><div class="osce-score-buttons">
        ${[0, 1, 2].map((score) => `<button type="button" data-action="score" data-item="${index}" data-score="${score}" aria-label="Beri skor ${score}" aria-pressed="${scores[index] === score}">${score}</button>`).join("")}
      </div></td></tr>`).join("")}
      </tbody></table>
      <div class="osce-calc-caption">0 = Tidak dilakukan · 1 = Tidak sempurna · 2 = Sesuai prosedur. Skor tersimpan sementara di halaman ini.</div>`;
  }

  function renderPrescriptionPad(clinicalCase) {
    const saved = state.prescriptions[activeCaseKey()] || {};
    return `<section class="osce-card">
      <div class="osce-card-head"><div class="osce-card-title"><span class="osce-card-icon">Rx</span>Pad Resep Dokter</div><span class="osce-eyebrow">R/ dan S</span></div>
      <div class="osce-rx-pad">
        <div class="osce-label">R/ Nama obat · dosis · sediaan · No. Romawi</div>
        <textarea data-prescription="medication" aria-label="Nama obat dosis sediaan dan jumlah resep" placeholder="R/ Nama obat, dosis, bentuk sediaan No. ...">${escapeHtml(saved.medication || "")}</textarea>
        <div class="osce-label" style="margin-top:9px">S frekuensi dd takaran rute/keterangan</div>
        <textarea data-prescription="sig" aria-label="Signa resep" placeholder="S ... dd ... ...">${escapeHtml(saved.sig || "")}</textarea>
        ${isExaminer() ? `<div class="osce-rx-paper"><strong>Catatan terapi pada sumber kasus (bukan resep final):</strong>\n${escapeHtml(clinicalCase.treatment)}</div>` : ""}
      </div>
    </section>`;
  }

  function renderPsychStatus(clinicalCase) {
    const data = isExaminer() ? clinicalCase.psychiatricStatus || {} : {};
    const saved = state.mentalStatus[activeCaseKey()] || {};
    return `<section class="osce-card">
      <div class="osce-card-head"><div class="osce-card-title"><span class="osce-card-icon">◉</span>Status Psikiatri</div><span class="osce-eyebrow">7 domain wajib</span></div>
      ${mentalStatusFields.map((field) => `<label class="osce-mental-row"><span>${escapeHtml(field)}</span>
        ${isExaminer()
          ? `<span class="osce-mental-answer">${escapeHtml(data[field] || "Tidak dirinci dalam sumber")}</span>`
          : `<input class="osce-mental-input" data-mental-field="${escapeHtml(field)}" type="text" value="${escapeHtml(saved[field] || "")}" placeholder="Catat hasil pemeriksaan">`}
      </label>`).join("")}
    </section>`;
  }

  function renderDietCalculator() {
    const bbi = Number(state.dietInputs.bbi) || 0;
    const correction = Number(state.dietInputs.correction) || 0;
    return `<section class="osce-card">
      <div class="osce-card-head"><div class="osce-card-title"><span class="osce-card-icon">∑</span>Kalkulator Diet DM</div><span class="osce-eyebrow">Rumus sumber</span></div>
      <div class="osce-card-copy">Kebutuhan energi = 30 kkal × BBI + koreksi umur/aktivitas/BB.</div>
      <div class="osce-mental-row"><label for="osce-bbi">BBI (kg)</label><input id="osce-bbi" class="osce-diet-input" type="number" min="0" step="0.1" value="${escapeHtml(state.dietInputs.bbi)}"></div>
      <div class="osce-mental-row"><label for="osce-correction">Total koreksi (kkal)</label><input id="osce-correction" class="osce-diet-input" type="number" step="1" value="${escapeHtml(state.dietInputs.correction)}"></div>
      <div id="osce-diet-result" class="osce-calc-output">${Math.max(0, 30 * bbi + correction).toLocaleString("id-ID")} kkal/hari</div>
      <div class="osce-calc-caption">Nilai koreksi perlu ditentukan penguji berdasarkan kondisi pasien. Kalkulator ini hanya menghitung rumus yang dicantumkan dalam spesifikasi.</div>
    </section>`;
  }

  function render() {
    const root = document.getElementById(overlayId);
    const station = activeStation();
    const clinicalCase = activeCase();
    if (!root || !station || !clinicalCase) return;
    root.innerHTML = `<div class="osce-shell">
      ${renderHeader(station)}
      <div class="osce-layout">
        ${renderSidebar()}
        <main class="osce-main">${renderCaseTitle(station, clinicalCase)}${renderScenario(station, clinicalCase)}</main>
        <aside class="osce-rightbar">
          <section class="osce-card">
            <div class="osce-card-head"><div class="osce-card-title"><span class="osce-card-icon">✓</span>Alur Kasus</div></div>
            <div class="osce-card-copy">A. Consent → B. Anamnesis → C. Pemeriksaan → D. Penunjang → E. Diagnosis → F. Tatalaksana → G. KIE</div>
            <div class="osce-calc-caption">Mode peserta dan penguji mengikuti peran akun yang terautentikasi.</div>
          </section>
        </aside>
      </div>
    </div>`;
    const count = root.querySelector(".osce-countdown");
    if (count) count.textContent = fmtTime(state.timerSeconds);
  }

  async function reveal(kind) {
    const station = activeStation();
    const clinicalCase = activeCase();
    const token = authToken();
    try {
      const response = await fetch(`/api/clinical-osce/${station.number}/${clinicalCase.number}/${kind}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error || "Hasil pemeriksaan tidak dapat dimuat.");
      state.revealed[kind] = body;
      render();
    } catch (error) {
      showToast(error.message || "Gagal memuat hasil pemeriksaan.");
    }
  }

  function close() {
    const root = document.getElementById(overlayId);
    if (root) root.classList.remove("is-open");
    if (state.timerId) window.clearInterval(state.timerId);
    state.timerId = null;
    state.timerRunning = false;
  }

  function open() {
    let root = document.getElementById(overlayId);
    if (!root) {
      root = document.createElement("div");
      root.id = overlayId;
      document.body.appendChild(root);
    }
    root.classList.add("is-open");
    root.innerHTML = `<div class="osce-error">Memuat bank kasus OSCE klinis...</div>`;
    loadStations().then(render).catch((error) => {
      root.innerHTML = `<div class="osce-error"><strong>Bank kasus belum dapat dibuka.</strong><br>${escapeHtml(error.message)}<br>
        Gunakan sesi akun peserta/penguji yang sudah login, lalu coba lagi.
        <div><button type="button" data-action="close">Tutup</button></div></div>`;
    });
  }

  function setTimer(running) {
    state.timerRunning = running;
    if (state.timerId) window.clearInterval(state.timerId);
    state.timerId = null;
    if (running) {
      state.timerId = window.setInterval(() => {
        if (state.timerSeconds > 0) state.timerSeconds -= 1;
        if (state.timerSeconds === 0) {
          state.timerRunning = false;
          window.clearInterval(state.timerId);
          state.timerId = null;
        }
        const timer = document.querySelector(`#${overlayId} .osce-countdown`);
        if (timer) timer.textContent = fmtTime(state.timerSeconds);
        const button = document.querySelector(`#${overlayId} [data-action="toggle-timer"]`);
        if (button) button.textContent = state.timerRunning ? "Jeda" : "Mulai";
      }, 1000);
    }
    render();
  }

  function calculateDiet() {
    const bbi = Number(state.dietInputs.bbi) || 0;
    const correction = Number(state.dietInputs.correction) || 0;
    const result = document.getElementById("osce-diet-result");
    if (result) result.textContent = `${Math.max(0, (30 * bbi) + correction).toLocaleString("id-ID")} kkal/hari`;
  }

  function handleClick(event) {
    const button = event.target.closest("[data-action]");
    if (!button) return;
    const action = button.dataset.action;
    if (action === "close") return close();
    if (action === "select-station") {
      state.stationIndex = Number(button.dataset.station);
      state.caseIndex = 0;
      state.revealed = {};
      state.timerSeconds = 15 * 60;
      return render();
    }
    if (action === "select-case") {
      state.caseIndex = Number(button.dataset.case);
      state.revealed = {};
      state.timerSeconds = 15 * 60;
      return render();
    }
    if (action === "set-mode" && state.role === "assessor") {
      state.mode = button.dataset.mode;
      state.revealed = {};
      return render();
    }
    if (action === "request-physical") return reveal("physical");
    if (action === "request-investigations") return reveal("investigations");
    if (action === "toggle-timer") return setTimer(!state.timerRunning);
    if (action === "reset-timer") {
      state.timerSeconds = 15 * 60;
      state.timerRunning = false;
      return setTimer(false);
    }
    if (action === "score") {
      const key = activeCaseKey();
      if (!state.scores[key]) state.scores[key] = {};
      state.scores[key][button.dataset.item] = Number(button.dataset.score);
      return render();
    }
  }

  function init() {
    const button = document.getElementById("btn-open-clinical-osce");
    if (button) button.addEventListener("click", open);
    document.addEventListener("click", handleClick);
    document.addEventListener("input", (event) => {
      const target = event.target;
      if (target.matches("[data-prescription]")) {
        const key = activeCaseKey();
        if (!state.prescriptions[key]) state.prescriptions[key] = {};
        state.prescriptions[key][target.dataset.prescription] = target.value;
      } else if (target.matches("[data-mental-field]")) {
        const key = activeCaseKey();
        if (!state.mentalStatus[key]) state.mentalStatus[key] = {};
        state.mentalStatus[key][target.dataset.mentalField] = target.value;
      } else if (target.id === "osce-bbi" || target.id === "osce-correction") {
        state.dietInputs[target.id === "osce-bbi" ? "bbi" : "correction"] = target.value;
        calculateDiet();
      }
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && document.getElementById(overlayId)?.classList.contains("is-open")) close();
    });
  }

  window.addEventListener("DOMContentLoaded", init);
})();
