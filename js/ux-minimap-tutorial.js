// =========================================================================
// UX & POLISH: LIVE 2D MINIMAP, TOUCH JOYSTICK, ONBOARDING TUTORIAL,
// GRAPHICS QUALITY PRESETS (RENDAH/SEDANG/TINGGI), ACCESSIBILITY & WEBXR
// =========================================================================

let minimapCanvas = null, minimapCtx = null;
let graphicsPreset = "high"; // 'low' | 'medium' | 'high'
let highContrastMode = false;

function initUxPolishSystem() {
  injectMinimapAndJoystickDOM();
  injectSettingsMenuControls();
  initVirtualTouchJoystick();
}

// 1. Buat Widget 2D Minimap Live & Virtual Touch Joystick di HUD
function injectMinimapAndJoystickDOM() {
  if (document.getElementById("osce-minimap-wrap")) return;

  const wrap = document.createElement("div");
  wrap.id = "osce-minimap-wrap";
  wrap.className = "hud-interactive fixed left-3 bottom-20 z-10 glass-dark rounded-2xl p-2 border border-teal-500/40 shadow-xl hidden sm:flex flex-col items-center";
  wrap.innerHTML = `
    <div class="flex items-center justify-between w-full px-1 mb-1">
      <span class="text-[9px] font-black tracking-wider text-teal-300 uppercase">MINIMAP 2 KORIDOR</span>
      <span id="minimap-pos-label" class="text-[9px] font-mono text-slate-300">ST-01</span>
    </div>
    <canvas id="osce-minimap-canvas" width="136" height="168" class="rounded-xl bg-slate-950 border border-slate-700 cursor-pointer" title="Klik untuk buka Peta 10 Station"></canvas>
  `;
  document.body.appendChild(wrap);

  minimapCanvas = document.getElementById("osce-minimap-canvas");
  if (minimapCanvas) {
    minimapCtx = minimapCanvas.getContext("2d");
    minimapCanvas.addEventListener("click", () => {
      if (typeof openMapModal === "function") openMapModal();
    });
  }

  // Virtual Analog Touch Joystick (khusus layar sentuh / HP / Tablet)
  const joyWrap = document.createElement("div");
  joyWrap.id = "osce-touch-joystick";
  joyWrap.className = "hud-interactive fixed left-4 bottom-24 z-10 w-24 h-24 rounded-full bg-slate-900/55 border-2 border-teal-400/50 backdrop-blur-sm flex sm:hidden items-center justify-center touch-none select-none shadow-xl";
  joyWrap.innerHTML = `
    <div id="osce-joystick-knob" class="w-10 h-10 rounded-full bg-teal-500/90 border-2 border-white shadow-md transition-transform duration-75"></div>
  `;
  document.body.appendChild(joyWrap);
}

// Gambar Minimap 2D secara real-time di dalam loop animate()
function updateLiveMinimap() {
  if (!minimapCtx || typeof state === "undefined") return;
  const ctx = minimapCtx;
  const w = 136, h = 168;
  ctx.fillStyle = "#090d16";
  ctx.fillRect(0, 0, w, h);

  // Gambar Koridor A (kiri, x=38) & Koridor B (kanan, x=98)
  const drawCorridorColumn = (cx, label, isActiveWing) => {
    ctx.fillStyle = isActiveWing ? "rgba(15, 118, 110, 0.25)" : "rgba(30, 41, 59, 0.45)";
    ctx.strokeStyle = isActiveWing ? "#14b8a6" : "#334155";
    ctx.lineWidth = 1.5;
    ctx.fillRect(cx - 20, 18, 40, 140);
    ctx.strokeRect(cx - 20, 18, 40, 140);

    ctx.fillStyle = isActiveWing ? "#5eead4" : "#94a3b8";
    ctx.font = "bold 9px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(label, cx, 12);

    // 10 Titik Pintu Station (5 kanan: 01..05, 5 kiri: 10..06)
    for (let i = 0; i < 10; i++) {
      const isRight = i < 5;
      const row = isRight ? i : (9 - i);
      const sy = 30 + row * 26;
      const sx = isRight ? cx + 18 : cx - 18;
      const isCurr = (i === state.currentStationIdx && isActiveWing);
      const isGreen = (state.phase === "work" && (i === state.currentStationIdx || state.examMode === "practice"));

      ctx.fillStyle = isGreen ? "#22c55e" : "#ef4444";
      ctx.beginPath();
      ctx.arc(sx, sy, isCurr ? 4.2 : 2.8, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  drawCorridorColumn(38, "KORIDOR A", state.wing === 0);
  drawCorridorColumn(98, "KORIDOR B", state.wing === 1);

  // Posisi Pemain Lokal
  const activeCx = state.wing === 1 ? 98 : 38;
  const localX = state.player.x - (state.wing === 1 ? WING_DX : 0);
  const px = activeCx + (localX / 3.6) * 16;
  const pz = 18 + ((13.5 - state.player.z) / 33.0) * 136;

  // Kerucut arah pandang kamera
  ctx.fillStyle = "rgba(56, 189, 248, 0.32)";
  ctx.beginPath();
  ctx.moveTo(px, pz);
  ctx.arc(px, pz, 14, -state.player.yaw - Math.PI / 2 - 0.45, -state.player.yaw - Math.PI / 2 + 0.45);
  ctx.closePath();
  ctx.fill();

  // Titik pemain
  ctx.fillStyle = "#38bdf8";
  ctx.beginPath();
  ctx.arc(px, pz, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  const lbl = document.getElementById("minimap-pos-label");
  if (lbl) lbl.textContent = `ST-${String(state.currentStationIdx + 1).padStart(2, "0")}`;
}

// 2. Virtual Analog Touch Joystick untuk HP / Layar Sentuh
function initVirtualTouchJoystick() {
  const pad = document.getElementById("osce-touch-joystick");
  const knob = document.getElementById("osce-joystick-knob");
  if (!pad || !knob) return;

  let active = false;
  let cx = 0, cy = 0;

  const handleMove = (clientX, clientY) => {
    const dx = clientX - cx;
    const dy = clientY - cy;
    const maxR = 32;
    const dist = Math.min(maxR, Math.hypot(dx, dy));
    const ang = Math.atan2(dy, dx);
    const kx = Math.cos(ang) * dist;
    const ky = Math.sin(ang) * dist;
    knob.style.transform = `translate(${kx}px, ${ky}px)`;

    state.keys.w = ky < -10;
    state.keys.s = ky > 10;
    state.keys.a = kx < -10;
    state.keys.d = kx > 10;
  };

  pad.addEventListener("touchstart", (e) => {
    if (!e.touches[0]) return;
    active = true;
    const rect = pad.getBoundingClientRect();
    cx = rect.left + rect.width / 2;
    cy = rect.top + rect.height / 2;
    handleMove(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: true });

  pad.addEventListener("touchmove", (e) => {
    if (!active || !e.touches[0]) return;
    handleMove(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: true });

  const stopJoy = () => {
    active = false;
    knob.style.transform = "translate(0px, 0px)";
    state.keys.w = false;
    state.keys.s = false;
    state.keys.a = false;
    state.keys.d = false;
  };
  pad.addEventListener("touchend", stopJoy);
  pad.addEventListener("touchcancel", stopJoy);
}

// 3. Pengaturan Kualitas Grafis (Rendah / Sedang / Tinggi), Aksesibilitas & WebXR di Modal Menu
function injectSettingsMenuControls() {
  const menuModal = document.getElementById("modal-menu");
  if (!menuModal) return;
  const resumeBtn = document.getElementById("btn-resume-sim");
  if (!resumeBtn || document.getElementById("settings-extra-controls")) return;

  const extra = document.createElement("div");
  extra.id = "settings-extra-controls";
  extra.className = "space-y-3 mb-3 text-xs";
  extra.innerHTML = `
    <div class="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
      <div class="font-bold text-slate-800">🎨 Kualitas Grafis 3D (HP Murah vs Laptop):</div>
      <div class="grid grid-cols-3 gap-1.5">
        <button type="button" data-q="low" class="btn-gfx-preset py-1.5 rounded-xl border border-slate-300 font-bold text-[11px] bg-white text-slate-700">Rendah (Hemat)</button>
        <button type="button" data-q="medium" class="btn-gfx-preset py-1.5 rounded-xl border border-slate-300 font-bold text-[11px] bg-white text-slate-700">Sedang</button>
        <button type="button" data-q="high" class="btn-gfx-preset py-1.5 rounded-xl border border-teal-600 font-bold text-[11px] bg-teal-700 text-white">Tinggi (PBR)</button>
      </div>
    </div>

    <div class="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
      <div class="font-bold text-slate-800">♿ Aksesibilitas, Bahasa & Mode Ujian:</div>
      <div class="grid grid-cols-2 gap-1.5">
        <button id="btn-toggle-contrast" type="button" class="py-2 px-2.5 rounded-xl bg-white border border-slate-300 font-bold text-[11px] text-slate-800 hover:bg-slate-100">
          👁️ Kontras Tinggi
        </button>
        <button id="btn-menu-lang" type="button" class="py-2 px-2.5 rounded-xl bg-white border border-slate-300 font-bold text-[11px] text-slate-800 hover:bg-slate-100">
          🌐 Ganti Bahasa (ID/EN)
        </button>
        <button id="btn-show-onboarding" type="button" class="py-2 px-2.5 rounded-xl bg-indigo-50 border border-indigo-200 font-bold text-[11px] text-indigo-900 hover:bg-indigo-100">
          📖 Tutorial Singkat
        </button>
        <button id="btn-enter-webxr" type="button" class="py-2 px-2.5 rounded-xl bg-teal-50 border border-teal-200 font-bold text-[11px] text-teal-900 hover:bg-teal-100">
          🥽 Mode WebXR / VR
        </button>
      </div>
    </div>
  `;
  resumeBtn.parentNode.insertBefore(extra, resumeBtn);

  extra.querySelectorAll(".btn-gfx-preset").forEach((btn) => {
    btn.addEventListener("click", () => {
      applyGraphicsQualityPreset(btn.dataset.q);
      extra.querySelectorAll(".btn-gfx-preset").forEach((b) => {
        b.className = (b.dataset.q === graphicsPreset)
          ? "btn-gfx-preset py-1.5 rounded-xl border border-teal-600 font-bold text-[11px] bg-teal-700 text-white"
          : "btn-gfx-preset py-1.5 rounded-xl border border-slate-300 font-bold text-[11px] bg-white text-slate-700";
      });
    });
  });

  document.getElementById("btn-toggle-contrast").addEventListener("click", () => {
    highContrastMode = !highContrastMode;
    document.body.classList.toggle("contrast-125", highContrastMode);
    showToast(highContrastMode ? "Mode Kontras Tinggi diaktifkan." : "Mode Kontras Standar.", "info");
  });

  document.getElementById("btn-menu-lang").addEventListener("click", () => {
    if (typeof OSCE_I18N !== "undefined") OSCE_I18N.toggleLanguage();
  });

  document.getElementById("btn-show-onboarding").addEventListener("click", () => {
    menuModal.classList.add("hidden");
    menuModal.classList.remove("flex");
    showOnboardingTutorialOverlay(true);
  });

  document.getElementById("btn-enter-webxr").addEventListener("click", async () => {
    if (navigator.xr && renderer && renderer.xr) {
      try {
        renderer.xr.enabled = true;
        const supported = await navigator.xr.isSessionSupported("immersive-vr");
        if (supported) {
          const session = await navigator.xr.requestSession("immersive-vr");
          renderer.xr.setSession(session);
          showToast("Sesi WebXR VR Aktif!", "success");
          return;
        }
      } catch (e) {}
    }
    showToast("Perangkat/Browser saat ini dalam mode layar standar (Headset WebXR tidak terdeteksi).", "info");
  });
}

function applyGraphicsQualityPreset(preset) {
  graphicsPreset = preset;
  if (!renderer || !scene) return;
  if (preset === "low") {
    renderer.setPixelRatio(1.0);
    renderer.shadowMap.enabled = false;
    scene.fog = new THREE.FogExp2(0xd4dce8, 0.035);
    showToast("Kualitas Grafis: RENDAH (Optimal untuk HP RAM 2-4GB / Hemat Baterai).", "info");
  } else if (preset === "medium") {
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.shadowMap.enabled = true;
    scene.fog = new THREE.FogExp2(0xd4dce8, 0.028);
    showToast("Kualitas Grafis: SEDANG (Seimbang 60 FPS).", "info");
  } else {
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2.0));
    renderer.shadowMap.enabled = true;
    scene.fog = new THREE.FogExp2(0xd4dce8, 0.022);
    showToast("Kualitas Grafis: TINGGI (PBR + ACES Tone Mapping + HDRI + Shadow).", "success");
  }
}

// 4. Onboarding Tutorial Singkat (Muncul saat pertama kali masuk atau dari Menu)
function showOnboardingTutorialOverlay(force = false) {
  try {
    if (!force && localStorage.getItem("osce_tutorial_seen") === "1") return;
    localStorage.setItem("osce_tutorial_seen", "1");
  } catch (e) {}

  let tut = document.getElementById("osce-onboarding-modal");
  if (tut) tut.remove();

  const t = (k) => (typeof OSCE_I18N !== "undefined" ? OSCE_I18N.t(k) : k);
  tut = document.createElement("div");
  tut.id = "osce-onboarding-modal";
  tut.className = "fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-fadeIn";
  tut.innerHTML = `
    <div class="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-teal-300 space-y-4">
      <div class="flex items-center justify-between border-b border-slate-200 pb-3">
        <div class="flex items-center gap-2">
          <span class="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold">🩺</span>
          <h3 class="font-black text-base text-slate-900">${t("tutorial_title")}</h3>
        </div>
        <button id="btn-close-tut" type="button" class="text-slate-400 hover:text-slate-700 font-bold">✕</button>
      </div>
      <div class="space-y-2.5 text-xs text-slate-700 leading-relaxed">
        <div class="p-3 rounded-xl bg-rose-50 border border-rose-200">🔴 <strong>Tahap 1:</strong> ${t("tutorial_step1")}</div>
        <div class="p-3 rounded-xl bg-emerald-50 border border-emerald-200">🟢 <strong>Tahap 2:</strong> ${t("tutorial_step2")}</div>
        <div class="p-3 rounded-xl bg-teal-50 border border-teal-200">🔬 <strong>Tahap 3:</strong> ${t("tutorial_step3")}</div>
      </div>
      <button id="btn-start-tut" type="button" class="w-full py-2.5 rounded-xl bg-teal-700 hover:bg-teal-600 text-white font-extrabold text-xs shadow-lg">
        Mengerti, Mulai Simulasi →
      </button>
    </div>
  `;
  document.body.appendChild(tut);
  const close = () => tut.remove();
  tut.querySelector("#btn-close-tut").addEventListener("click", close);
  tut.querySelector("#btn-start-tut").addEventListener("click", close);
}

