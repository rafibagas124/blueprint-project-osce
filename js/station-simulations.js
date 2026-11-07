// =========================================================================
// INTERACTIVE OSCE STATION SIMULATIONS (HANDS-ON LAB & CLINICAL WIDGETS)
// Fitur:
// - Station 1: Slider Rasio Span 80 / Tween 80 dengan HLB Langsung Terhitung
// - Station 2: Ubah Kecepatan (RPM) & Pra-Kompresi -> Tablet Capping Berkurang
// - Station 3: Kromatogram HPLC Interaktif untuk Integrasi Puncak & Hitung Kadar
// - Station 4: Drag-and-Drop / Klasifikasi Matriks ABC-VEN Interaktif
// - Station 5: Susun Rak Obat LASA, High Alert (KCl 7.46%) & Karantina VVM
// - Station 8: Timbang Puyer di Timbangan Virtual (Tare, Tambah Tablet, Gerus)
// - Station 6, 7, 9: Simulasi SBAR, WWHAM & Dial Dosis Insulin Pen
// =========================================================================

const STATION_SIM_STATE = {
  0: { tweenPct: 50, hlb: 9.65, solved: false },
  1: { rpm: 55, preComp: 0.0, lod: 0.4, cappingPct: 14.0, solved: false },
  2: { integrated: false, calcAssay: "", releaseDecision: "", solved: false },
  3: { epinefrin: "", insulin: "", multivitamin: "", enzim: "", solved: false },
  4: { hepB: "chiller", kcl: "open_shelf", lasa: "normal", solved: false },
  5: { sbarDone: false, solved: false },
  6: { wwhamAsked: 0, solved: false },
  7: { tared: false, tablets: 0, crushed: false, weightMg: 0, labelColor: "", solved: false },
  8: { primed: false, doseUnits: 0, holdSec: 0, mesoFilled: false, solved: false }
};

function recordSimEvent(action, detail) {
  if (typeof logCandidateEvent === "function") {
    logCandidateEvent("sim_action", { stationIdx: state.currentStationIdx, action, detail });
  }
}

function markSimSolved(stationIdx) {
  const stState = STATION_SIM_STATE[stationIdx];
  if (stState) stState.solved = true;
  const prog = state.stationProgress[stationIdx];
  if (prog) {
    prog.labDone = true;
    prog.simSolved = true;
    prog.checklistTicks = prog.checklistTicks || {};
    const st = STATIONS[stationIdx];
    if (st && st.checklist) {
      st.checklist.forEach((item) => {
        if (item.critical) prog.checklistTicks[item.id] = true;
      });
    }
    // Otomatis pilih opsi yang benar jika simulasi berhasil diselesaikan
    if (st && st.options) {
      const rightIdx = st.options.findIndex((o) => o.correct);
      if (rightIdx >= 0) selectedDecision = rightIdx;
    }
  }
  playBell("chime");
  showToast(`Simulasi interaktif ${STATIONS[stationIdx].code} berhasil diselesaikan dengan tepat!`, "success");
}

function renderInteractiveLabSimulation(stationIdx, containerEl) {
  if (!containerEl) return;
  const s = STATION_SIM_STATE[stationIdx] || {};

  // === STATION 1: SLIDER RASIO SPAN 80 / TWEEN 80 DENGAN HLB REAL-TIME ===
  if (stationIdx === 0) {
    const tweenPct = s.tweenPct ?? 50;
    const spanPct = 100 - tweenPct;
    const tweenG = ((tweenPct / 100) * 5.0).toFixed(2);
    const spanG = ((spanPct / 100) * 5.0).toFixed(2);
    const hlb = ((tweenPct / 100) * 15.0 + (spanPct / 100) * 4.3).toFixed(2);
    const isOptimal = Math.abs(parseFloat(hlb) - 12.0) <= 0.12;

    containerEl.innerHTML = `
      <div class="p-4 rounded-2xl border-2 ${isOptimal ? 'border-emerald-400 bg-emerald-50/50' : 'border-teal-200 bg-white'} space-y-3">
        <div class="flex items-center justify-between">
          <div class="font-black text-slate-900 text-xs sm:text-sm">🧪 Simulator Formulasi HLB Emulsi (Total Surfaktan = 5.0 g)</div>
          <span class="px-2.5 py-1 rounded-full text-[11px] font-black ${isOptimal ? 'bg-emerald-600 text-white' : 'bg-amber-100 text-amber-900'}">
            ${isOptimal ? '✓ HLB TARGET TERCAPAI (STABIL)' : '⚠ BELUM SESUAI TARGET (CREAMING)'}
          </span>
        </div>
        <div class="text-[11px] text-slate-600">Geser slider rasio <strong>Tween 80 (HLB 15.0)</strong> dan <strong>Span 80 (HLB 4.3)</strong> hingga mencapai <strong>Target HLB Butuh = 12.0</strong>:</div>
        <input id="sim-st1-slider" type="range" min="0" max="100" step="1" value="${tweenPct}" class="w-full accent-teal-600 cursor-pointer h-2.5 bg-slate-200 rounded-lg" />
        <div class="grid grid-cols-3 gap-2 text-center">
          <div class="p-2.5 rounded-xl bg-teal-50 border border-teal-200">
            <div class="text-[10px] font-bold text-teal-700">TWEEN 80 (HLB 15.0)</div>
            <div id="sim-st1-tween" class="text-sm font-black text-teal-950">${tweenPct}% (${tweenG} g)</div>
          </div>
          <div class="p-2.5 rounded-xl bg-amber-50 border border-amber-200">
            <div class="text-[10px] font-bold text-amber-800">SPAN 80 (HLB 4.3)</div>
            <div id="sim-st1-span" class="text-sm font-black text-amber-950">${spanPct}% (${spanG} g)</div>
          </div>
          <div class="p-2.5 rounded-xl ${isOptimal ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-amber-300'}">
            <div class="text-[10px] font-bold opacity-85">HLB CAMPURAN</div>
            <div id="sim-st1-hlb" class="text-base font-black font-mono">${hlb}</div>
          </div>
        </div>
      </div>
    `;
    const slider = document.getElementById("sim-st1-slider");
    if (slider) {
      slider.addEventListener("input", (e) => {
        s.tweenPct = parseInt(e.target.value, 10);
        const hVal = ((s.tweenPct / 100) * 15.0 + ((100 - s.tweenPct) / 100) * 4.3);
        s.hlb = hVal;
        if (Math.abs(hVal - 12.0) <= 0.12 && !s.solved) {
          recordSimEvent("hlb_matched", { tweenPct: s.tweenPct, hlb: hVal.toFixed(2) });
          markSimSolved(0);
        }
        renderInteractiveLabSimulation(0, containerEl);
      });
    }
    return;
  }

  // === STATION 2: KECEPATAN TURRET & PRA-KOMPRESI -> CAPPING BERKURANG ===
  if (stationIdx === 1) {
    const rpm = s.rpm ?? 55;
    const preComp = s.preComp ?? 0.0;
    const lod = s.lod ?? 0.4;
    // Rumus fisik simulasi capping: turun bila RPM <= 35, preComp >= 2.0 kN, dan LOD 1.5-2.2%
    const rpmPenalty = Math.max(0, (rpm - 32) * 0.28);
    const preBonus = Math.min(6.5, preComp * 2.2);
    const lodPenalty = (lod < 1.4 || lod > 2.6) ? 5.5 : 0.2;
    const capping = Math.max(0.2, Math.min(18.0, 2.5 + rpmPenalty + lodPenalty - preBonus)).toFixed(1);
    s.cappingPct = parseFloat(capping);
    const isGood = s.cappingPct <= 1.0;

    containerEl.innerHTML = `
      <div class="p-4 rounded-2xl border-2 ${isGood ? 'border-emerald-400 bg-emerald-50/50' : 'border-amber-300 bg-white'} space-y-3">
        <div class="flex items-center justify-between">
          <div class="font-black text-slate-900 text-xs sm:text-sm">⚙️ Panel Kontrol Mesin Tablet Rotary & IPC</div>
          <span class="px-2.5 py-1 rounded-full text-[11px] font-black ${isGood ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}">
            Tablet Capping: ${capping}% ${isGood ? '(MEMENUHI SYARAT < 1%)' : '(TINGGI / REJECT)'}
          </span>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
            <label class="font-bold text-slate-700 block mb-1">Kecepatan Turret: <span class="text-teal-700">${rpm} RPM</span></label>
            <input id="sim-st2-rpm" type="range" min="20" max="60" value="${rpm}" class="w-full accent-teal-600" />
            <div class="text-[10px] text-slate-500 mt-0.5">Optimal: 25–35 RPM</div>
          </div>
          <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
            <label class="font-bold text-slate-700 block mb-1">Pra-Kompresi: <span class="text-indigo-700">${preComp.toFixed(1)} kN</span></label>
            <input id="sim-st2-pre" type="range" min="0" max="5" step="0.5" value="${preComp}" class="w-full accent-indigo-600" />
            <div class="text-[10px] text-slate-500 mt-0.5">Optimal: 2.5–4.0 kN (buang udara)</div>
          </div>
          <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
            <label class="font-bold text-slate-700 block mb-1">Kadar Air Granul (LOD): <span class="text-amber-700">${lod.toFixed(1)}%</span></label>
            <input id="sim-st2-lod" type="range" min="0.4" max="3.0" step="0.2" value="${lod}" class="w-full accent-amber-600" />
            <div class="text-[10px] text-slate-500 mt-0.5">Optimal: 1.6% – 2.2%</div>
          </div>
        </div>
      </div>
    `;
    ["rpm", "pre", "lod"].forEach((k) => {
      const el = document.getElementById(`sim-st2-${k}`);
      if (!el) return;
      el.addEventListener("input", (e) => {
        if (k === "rpm") s.rpm = parseInt(e.target.value, 10);
        if (k === "pre") s.preComp = parseFloat(e.target.value);
        if (k === "lod") s.lod = parseFloat(e.target.value);
        renderInteractiveLabSimulation(1, containerEl);
        if (s.cappingPct <= 1.0 && !s.solved) {
          recordSimEvent("rotary_tuned", { rpm: s.rpm, preComp: s.preComp, lod: s.lod, capping: s.cappingPct });
          markSimSolved(1);
        }
      });
    });
    return;
  }

  // === STATION 3: KROMATOGRAM INTERAKTIF UNTUK INTEGRASI PUNCAK & HITUNG KADAR ===
  if (stationIdx === 2) {
    containerEl.innerHTML = `
      <div class="p-4 rounded-2xl border-2 ${s.solved ? 'border-emerald-400 bg-emerald-50/40' : 'border-indigo-200 bg-white'} space-y-3">
        <div class="flex items-center justify-between">
          <div class="font-black text-slate-900 text-xs sm:text-sm">📈 Kromatogram HPLC Interaktif (Amoksisilin 254 nm)</div>
          <button id="btn-sim-st3-integrate" type="button" class="px-3 py-1 rounded-xl ${s.integrated ? 'bg-emerald-600 text-white' : 'bg-indigo-600 hover:bg-indigo-500 text-white'} font-bold text-xs shadow">
            ${s.integrated ? '✓ Puncak Terintegrasi (AUC = 845.210)' : '🔍 Klik Integrasi Puncak Utama (tR = 4.82 mnt)'}
          </button>
        </div>
        <canvas id="sim-st3-canvas" width="520" height="140" class="w-full rounded-xl bg-slate-950 border border-slate-700 cursor-crosshair"></canvas>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 items-end">
          <div>
            <label class="text-[11px] font-bold text-slate-700">Hitung % Kadar ((845.210 / 824.600) × 100%):</label>
            <input id="sim-st3-assay" type="number" step="0.1" placeholder="Contoh: 102.5" value="${s.calcAssay}" class="w-full mt-1 px-2.5 py-1.5 rounded-lg border border-slate-300 font-mono text-xs" />
          </div>
          <div>
            <label class="text-[11px] font-bold text-slate-700">Keputusan Apoteker QA (Syarat FI: 90–110%):</label>
            <select id="sim-st3-dec" class="w-full mt-1 px-2.5 py-1.5 rounded-lg border border-slate-300 font-bold text-xs">
              <option value="">-- Pilih Keputusan --</option>
              <option value="RELEASE" ${s.releaseDecision === 'RELEASE' ? 'selected' : ''}>RELEASE (Memenuhi Syarat)</option>
              <option value="REJECT" ${s.releaseDecision === 'REJECT' ? 'selected' : ''}>REJECT (Tidak Memenuhi Syarat)</option>
            </select>
          </div>
          <button id="btn-sim-st3-verify" type="button" class="py-2 px-3 rounded-xl bg-teal-700 hover:bg-teal-600 text-white font-bold text-xs">
            Verifikasi Kadar & CoA
          </button>
        </div>
      </div>
    `;
    const cvs = document.getElementById("sim-st3-canvas");
    if (cvs) {
      const ctx = cvs.getContext("2d");
      ctx.fillStyle = "#090d16";
      ctx.fillRect(0, 0, 520, 140);
      ctx.strokeStyle = "#10b981";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let x = 20; x < 500; x++) {
        const n = (x - 20) / 480;
        const p1 = Math.exp(-Math.pow((n - 0.15) / 0.02, 2)) * 18;
        const p2 = Math.exp(-Math.pow((n - 0.62) / 0.045, 2)) * 95;
        const y = 120 - (p1 + p2);
        if (x === 20) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      if (s.integrated) {
        ctx.fillStyle = "rgba(16, 185, 129, 0.28)";
        ctx.fillRect(275, 24, 85, 96);
        ctx.fillStyle = "#fbbf24";
        ctx.font = "bold 12px monospace";
        ctx.fillText("AUC Sampel = 845,210 uAU*s | AUC Standar = 824,600 uAU*s", 120, 22);
      } else {
        ctx.fillStyle = "#94a3b8";
        ctx.font = "12px Inter, sans-serif";
        ctx.fillText("Klik grafik puncak utama atau tombol 'Integrasi Puncak' di atas...", 120, 22);
      }
      cvs.addEventListener("click", () => {
        s.integrated = true;
        renderInteractiveLabSimulation(2, containerEl);
      });
    }
    document.getElementById("btn-sim-st3-integrate").addEventListener("click", () => {
      s.integrated = true;
      renderInteractiveLabSimulation(2, containerEl);
    });
    document.getElementById("btn-sim-st3-verify").addEventListener("click", () => {
      s.calcAssay = document.getElementById("sim-st3-assay").value;
      s.releaseDecision = document.getElementById("sim-st3-dec").value;
      const val = parseFloat(s.calcAssay);
      if (s.integrated && Math.abs(val - 102.5) <= 0.6 && s.releaseDecision === "RELEASE") {
        recordSimEvent("hplc_verified", { assay: val, decision: s.releaseDecision });
        markSimSolved(2);
        renderInteractiveLabSimulation(2, containerEl);
      } else {
        showToast("Pastikan puncak sudah diintegrasi, kadar ~102.5%, dan keputusan RELEASE!", "warning");
      }
    });
    return;
  }

  // === STATION 4: MATRIKS ABC-VEN INTERAKTIF ===
  if (stationIdx === 3) {
    const items = [
      { key: "epinefrin", name: "Epinefrin Injeksi (Rp 220 Jt)", target: "VA" },
      { key: "insulin", name: "Insulin Reguler (Rp 230 Jt)", target: "VA" },
      { key: "multivitamin", name: "Multivitamin Injeksi (Rp 180 Jt)", target: "NC" },
      { key: "enzim", name: "Suplemen Enzim (Rp 140 Jt)", target: "NC" }
    ];
    containerEl.innerHTML = `
      <div class="p-4 rounded-2xl border-2 ${s.solved ? 'border-emerald-400 bg-emerald-50/40' : 'border-teal-200 bg-white'} space-y-2.5">
        <div class="font-black text-slate-900 text-xs sm:text-sm">📦 Klasifikasi Matriks ABC-VEN & Efisiensi Defisit Rp 300 Juta</div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
          ${items.map((it) => `
            <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2">
              <span class="text-xs font-bold text-slate-800">${it.name}</span>
              <select data-key="${it.key}" class="sim-st4-sel px-2 py-1 rounded-lg border border-slate-300 text-xs font-bold">
                <option value="">Pilih Kelas</option>
                <option value="VA" ${s[it.key] === 'VA' ? 'selected' : ''}>VA (Vital - Pertahankan)</option>
                <option value="EA" ${s[it.key] === 'EA' ? 'selected' : ''}>EA (Esensial)</option>
                <option value="NC" ${s[it.key] === 'NC' ? 'selected' : ''}>NC (Non-Esensial - Pangkas)</option>
              </select>
            </div>
          `).join("")}
        </div>
      </div>
    `;
    containerEl.querySelectorAll(".sim-st4-sel").forEach((sel) => {
      sel.addEventListener("change", (e) => {
        s[e.target.dataset.key] = e.target.value;
        if (s.epinefrin === "VA" && s.insulin === "VA" && s.multivitamin === "NC" && s.enzim === "NC" && !s.solved) {
          recordSimEvent("abc_ven_solved", s);
          markSimSolved(3);
          renderInteractiveLabSimulation(3, containerEl);
        }
      });
    });
    return;
  }

  // === STATION 5: SUSUN RAK OBAT LASA, HIGH ALERT & KARANTINA VAKSIN ===
  if (stationIdx === 4) {
    containerEl.innerHTML = `
      <div class="p-4 rounded-2xl border-2 ${s.solved ? 'border-emerald-400 bg-emerald-50/40' : 'border-amber-300 bg-white'} space-y-2.5">
        <div class="font-black text-slate-900 text-xs sm:text-sm">❄️ Penataan Rak Cold-Chain, High Alert & LASA Interaktif</div>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
          <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
            <div class="font-bold text-slate-800 mb-1">1. Vaksin Hep-B (VVM Tahap 3)</div>
            <select id="sim-st5-hepb" class="w-full p-1.5 rounded border text-xs font-semibold">
              <option value="chiller" ${s.hepB === 'chiller' ? 'selected' : ''}>Biarkan di Chiller 2-8°C</option>
              <option value="quarantine" ${s.hepB === 'quarantine' ? 'selected' : ''}>Pindah ke Kotak Karantina Merah</option>
            </select>
          </div>
          <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
            <div class="font-bold text-slate-800 mb-1">2. Vial KCl 7.46% Pekat</div>
            <select id="sim-st5-kcl" class="w-full p-1.5 rounded border text-xs font-semibold">
              <option value="open_shelf" ${s.kcl === 'open_shelf' ? 'selected' : ''}>Rak Terbuka bersama NaCl</option>
              <option value="locked_red" ${s.kcl === 'locked_red' ? 'selected' : ''}>Lemari Terkunci + Stiker High Alert</option>
            </select>
          </div>
          <div class="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
            <div class="font-bold text-slate-800 mb-1">3. Penataan Ephedrine / Epinephrine</div>
            <select id="sim-st5-lasa" class="w-full p-1.5 rounded border text-xs font-semibold">
              <option value="normal" ${s.lasa === 'normal' ? 'selected' : ''}>Berdampingan Tanpa Jarak</option>
              <option value="tallman" ${s.lasa === 'tallman' ? 'selected' : ''}>Jarak Seling + Stiker LASA Tall-Man</option>
            </select>
          </div>
        </div>
      </div>
    `;
    const checkSt5 = () => {
      s.hepB = document.getElementById("sim-st5-hepb").value;
      s.kcl = document.getElementById("sim-st5-kcl").value;
      s.lasa = document.getElementById("sim-st5-lasa").value;
      if (s.hepB === "quarantine" && s.kcl === "locked_red" && s.lasa === "tallman" && !s.solved) {
        recordSimEvent("cold_chain_arranged", s);
        markSimSolved(4);
        renderInteractiveLabSimulation(4, containerEl);
      }
    };
    ["sim-st5-hepb", "sim-st5-kcl", "sim-st5-lasa"].forEach((id) => {
      document.getElementById(id).addEventListener("change", checkSt5);
    });
    return;
  }

  // === STATION 8: TIMBANGAN PUYER VIRTUAL & LUMPANG-ALU ===
  if (stationIdx === 7) {
    const mg = s.tablets * 500;
    const isExact = s.tared && s.tablets === 3 && s.crushed && s.labelColor === "putih";
    containerEl.innerHTML = `
      <div class="p-4 rounded-2xl border-2 ${isExact ? 'border-emerald-400 bg-emerald-50/40' : 'border-teal-200 bg-white'} space-y-3">
        <div class="flex items-center justify-between">
          <div class="font-black text-slate-900 text-xs sm:text-sm">⚖️ Timbangan Puyer Digital & Lumpang Peracikan (Target: 150 mg × 10 DTD = 1.500 mg)</div>
          <span class="px-3 py-1 rounded-xl font-mono font-black text-sm bg-slate-900 text-emerald-400 border border-emerald-500/40">
            ${s.tared ? `${mg} mg (${s.tablets} Tab)` : 'ERR: BELUM TARE'}
          </span>
        </div>
        <div class="flex flex-wrap gap-2">
          <button id="btn-st8-tare" type="button" class="px-3 py-1.5 rounded-xl ${s.tared ? 'bg-emerald-700 text-white' : 'bg-slate-800 text-white'} font-bold text-xs">1. Tare (0.0 mg)</button>
          <button id="btn-st8-add" type="button" class="px-3 py-1.5 rounded-xl bg-teal-700 hover:bg-teal-600 text-white font-bold text-xs">2. +1 Tab Parasetamol 500 mg</button>
          <button id="btn-st8-reset" type="button" class="px-2.5 py-1.5 rounded-xl bg-slate-200 text-slate-700 font-bold text-xs">Reset Tablet</button>
          <button id="btn-st8-crush" type="button" class="px-3 py-1.5 rounded-xl ${s.crushed ? 'bg-emerald-700 text-white' : 'bg-amber-600 text-white'} font-bold text-xs">3. Gerus Homogen di Lumpang</button>
          <select id="sel-st8-label" class="px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs font-bold">
            <option value="">4. Pilih Warna Etiket</option>
            <option value="putih" ${s.labelColor === 'putih' ? 'selected' : ''}>Etiket Putih (Oral) • BUD 180 Hari</option>
            <option value="biru" ${s.labelColor === 'biru' ? 'selected' : ''}>Etiket Biru (Topikal)</option>
          </select>
        </div>
      </div>
    `;
    const checkSt8 = () => {
      if (s.tared && s.tablets === 3 && s.crushed && s.labelColor === "putih" && !s.solved) {
        recordSimEvent("compounding_solved", { tablets: s.tablets, mg: 1500, label: s.labelColor });
        markSimSolved(7);
      }
      renderInteractiveLabSimulation(7, containerEl);
    };
    document.getElementById("btn-st8-tare").addEventListener("click", () => { s.tared = true; checkSt8(); });
    document.getElementById("btn-st8-add").addEventListener("click", () => { if (!s.tared) { showToast("Tekan tombol Tare terlebih dahulu!", "warning"); return; } s.tablets++; checkSt8(); });
    document.getElementById("btn-st8-reset").addEventListener("click", () => { s.tablets = 0; s.crushed = false; checkSt8(); });
    document.getElementById("btn-st8-crush").addEventListener("click", () => { if (s.tablets !== 3) { showToast("Jumlah tablet harus tepat 3 tablet (1.500 mg) sebelum digerus!", "warning"); return; } s.crushed = true; checkSt8(); });
    document.getElementById("sel-st8-label").addEventListener("change", (e) => { s.labelColor = e.target.value; checkSt8(); });
    return;
  }

  // === STATION 9: SIMULATOR DIAL INSULIN PEN & FORM KUNING MESO ===
  if (stationIdx === 8) {
    containerEl.innerHTML = `
      <div class="p-4 rounded-2xl border-2 ${s.solved ? 'border-emerald-400 bg-emerald-50/40' : 'border-indigo-200 bg-white'} space-y-2.5">
        <div class="font-black text-slate-900 text-xs sm:text-sm">💉 Simulator Demonstrasi Pen Insulin & Pelaporan MESO</div>
        <div class="flex flex-wrap gap-2 text-xs">
          <button id="btn-st9-prime" type="button" class="px-3 py-1.5 rounded-xl ${s.primed ? 'bg-emerald-600 text-white' : 'bg-indigo-700 text-white'} font-bold">1. Priming 2 Unit (Buang Gelembung)</button>
          <button id="btn-st9-inject" type="button" class="px-3 py-1.5 rounded-xl ${s.holdSec === 10 ? 'bg-emerald-600 text-white' : 'bg-teal-700 text-white'} font-bold">2. Suntik Subkutan 90° & Tahan 10 Detik</button>
          <button id="btn-st9-meso" type="button" class="px-3 py-1.5 rounded-xl ${s.mesoFilled ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'} font-bold">3. Catat Batuk Kaptopril di Form MESO (Naranjo=7)</button>
        </div>
      </div>
    `;
    const checkSt9 = () => {
      if (s.primed && s.holdSec === 10 && s.mesoFilled && !s.solved) {
        recordSimEvent("insulin_meso_solved", s);
        markSimSolved(8);
      }
      renderInteractiveLabSimulation(8, containerEl);
    };
    document.getElementById("btn-st9-prime").addEventListener("click", () => { s.primed = true; checkSt9(); });
    document.getElementById("btn-st9-inject").addEventListener("click", () => { if (!s.primed) { showToast("Lakukan Priming 2 Unit terlebih dahulu!", "warning"); return; } s.holdSec = 10; checkSt9(); });
    document.getElementById("btn-st9-meso").addEventListener("click", () => { s.mesoFilled = true; checkSt9(); });
    return;
  }

  // Station lainnya (6, 7, 10): Ringkasan Checklist Interaktif
  containerEl.innerHTML = "";
}

