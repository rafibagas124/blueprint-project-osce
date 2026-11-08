// =========================================================================
// MAIN OSCE APPLICATION CONTROLLER
// Login Gate, Camera Controller, Input Handlers, Main Loop
// =========================================================================

const state = {
  isLoggedIn: false,
  userProfile: {
    name: "Kandidat Mahasiswa",
    nim: "2024-08001",
    gender: "male",
    role: "student"
  },
  clientId: "cand_" + Math.random().toString(36).substring(2, 9),
  wing: 0, // 0 = Koridor A, 1 = Koridor B
  corridorCode: "", // Kode koridor yang diinput saat login (KOR-A-xxxx / KOR-B-xxxx)
  roomId: null,
  assessorPin: "",
  examMode: "practice",
  movementMode: "hybrid",
  cameraMode: "third",
  voiceEnabled: true,
  sceneView: "corridor",
  currentStationIdx: 0,
  phase: "prep",
  timerSeconds: 30,
  isSeated: false,
  hasReadInstruction: false,
  stationProgress: STATIONS.map(() => ({
    completed: false,
    dialogDone: false,
    labDone: false,
    decisionDone: false,
    score: 0
  })),
  player: {
    x: 0, y: 1.65, z: 10.5,
    yaw: 0, pitch: 0,
    targetX: null, targetZ: null, targetYaw: null
  },
  keys: { w: false, a: false, s: false, d: false }
};

let scene, camera, renderer;
let corridorGroup, roomGroup, wingBGroup;
let localAvatar = null;
let animFrameId = null;

// =========================================================================
// VALIDASI KODE KORIDOR: menentukan wing (A=0, B=1) dari kode yang dosen beri
// Format bebas: "KOR-A-xxxx", "KORIDOR-B", "A", "B", dll.
// Server dapat memasukkan kode custom yang mengandung huruf A atau B
// =========================================================================
const CORRIDOR_CODES_A = new Set(); // terisi dari server via WebSocket atau .env
const CORRIDOR_CODES_B = new Set();

function detectWingFromCode(code = "") {
  const upper = code.toUpperCase().trim();
  // Cek exact match kode custom dulu (dari server)
  if (CORRIDOR_CODES_A.has(upper)) return 0;
  if (CORRIDOR_CODES_B.has(upper)) return 1;
  // Heuristik: kode mengandung "-A" / " A" / "KORA" / "KORIDOR A" → wing 0
  if (/[-\s_]A($|\d)/i.test(upper) || upper.endsWith("-A") || upper === "A") return 0;
  if (/[-\s_]B($|\d)/i.test(upper) || upper.endsWith("-B") || upper === "B") return 1;
  // Fallback: ada substring "KOR-A" atau "KOR-B"
  if (upper.includes("KOR-A") || upper.includes("KORA") || upper.includes("KORIDOR-A") || upper.includes("KORIDOR A")) return 0;
  if (upper.includes("KOR-B") || upper.includes("KORB") || upper.includes("KORIDOR-B") || upper.includes("KORIDOR B")) return 1;
  return -1; // tidak valid
}

// =========================================================================
// CEK PROXIMITY STASIUN: mahasiswa hanya bisa masuk jika berada di dekat
// stasiun YANG SEDANG DIJADWALKAN — bukan stasiun lain
// =========================================================================
function isNearCurrentStation() {
  const anchor = station3DAnchors[state.currentStationIdx];
  if (!anchor) return true; // jika anchor tidak ada, izinkan (pratik)
  const doorX = anchor.doorPos.x + wingOffsetX();
  const doorZ = anchor.doorPos.z;
  const dx = state.player.x - doorX;
  const dz = state.player.z - doorZ;
  const dist = Math.sqrt(dx * dx + dz * dz);
  return dist < 3.8; // radius 3.8 meter dari pintu stasiun
}

// =========================================================================
// AUDIO SYSTEM
// =========================================================================
let audioCtx = null;
function ensureAudio() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) audioCtx = new AudioContextClass();
  }
  if (audioCtx && audioCtx.state === "suspended") audioCtx.resume();
}

function playBell(type = "chime") {
  if (!state.voiceEnabled) return;
  try {
    ensureAudio();
    if (!audioCtx) return;
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    if (type === "chime") {
      osc.frequency.setValueAtTime(587.33, now);
      osc.frequency.setValueAtTime(880, now + 0.18);
      gain.gain.setValueAtTime(0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
      osc.start(now);
      osc.stop(now + 0.65);
    } else if (type === "click") {
      osc.frequency.setValueAtTime(720, now);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.start(now);
      osc.stop(now + 0.12);
    }
  } catch (e) {}
}

function speakAnnouncement(text) {
  if (!state.voiceEnabled) return;
  try {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = "id-ID";
      utter.rate = 0.98;
      utter.pitch = 1.02;
      window.speechSynthesis.speak(utter);
    }
  } catch (e) {}
}

// Helper Offset lateral agar peserta bersamaan di station yang sama berdiri berdampingan
function getClientOffset(scale = 0.42) {
  if (!state.clientId) return 0;
  let hash = 0;
  for (let i = 0; i < state.clientId.length; i++) {
    hash = (hash * 31 + state.clientId.charCodeAt(i)) & 0xffff;
  }
  return ((hash % 3) - 1) * scale;
}

// =========================================================================
// INIT THREE.JS 3D WORLD
// =========================================================================
function initThreeJS() {
  const container = document.getElementById("canvas-container");
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x94a3b8);
  scene.fog = new THREE.FogExp2(0x94a3b8, 0.022);

  camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.rotation.order = "YXZ";

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.92;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.innerHTML = "";
  container.appendChild(renderer.domElement);

  if (typeof createProceduralHDRIEnvironment === "function") {
    scene.environment = createProceduralHDRIEnvironment(renderer);
  }

  const ambient = new THREE.AmbientLight(0xfff8ef, 0.68);
  scene.add(ambient);

  const dirLight = new THREE.DirectionalLight(0xfff5e0, 0.62);
  dirLight.position.set(4, 10, 8);
  dirLight.castShadow = true;
  scene.add(dirLight);

  // Cahaya biru lembut dari atas (simulasi lampu TL klinik)
  const fillLight = new THREE.DirectionalLight(0xe8f4fd, 0.28);
  fillLight.position.set(-3, 8, -5);
  scene.add(fillLight);

  corridorGroup = new THREE.Group();
  roomGroup = new THREE.Group();
  roomGroup.visible = false;
  scene.add(corridorGroup);
  scene.add(roomGroup);

  buildCorridor3D(corridorGroup);

  // KORIDOR B: salinan lengkap (pintu, kursi, papan petunjuk, lampu) di sisi sumbu-X
  wingBGroup = new THREE.Group();
  wingBGroup.position.x = WING_DX;
  buildCorridor3D(wingBGroup, true);
  corridorGroup.add(wingBGroup);

  buildRoom3D(roomGroup);
  updateDoorStatusLamps("prep", 0);

  // Set default initial camera position facing down corridor
  camera.position.set(0, 2.3, 13);
  camera.lookAt(0, 1.4, 0);

  // START 3D ANIMATION / RENDER LOOP SEGERA
  if (!animFrameId) {
    animate();
  }
}

// =========================================================================
// LOGIN & SETUP AVATAR SESUAI GENDER & IDENTITAS RESMI DARI SERVER
// Mahasiswa: NIM + Token -> Data Nama, Gender, Koridor diambil dari Server Store
// Asesor: Username + Password -> Autentikasi JWT
// =========================================================================
async function handleLoginSubmit() {
  const roleInput = document.getElementById("login-select-role").value;

  if (roleInput === "student") {
    const nimInput = document.getElementById("login-input-nim").value.trim();
    const tokenInput = document.getElementById("login-input-token").value.trim();

    if (!nimInput || !tokenInput) {
      showToast("Harap masukkan NIM dan Token Ujian!", "warning");
      return;
    }

    try {
      const res = await fetch("/api/auth/login-student", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nim: nimInput, token: tokenInput })
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "NIM atau token ujian tidak valid.", "error");
        return;
      }

      state.jwtToken = data.token;
      try { sessionStorage.setItem("osce_jwt", data.token); } catch (e) {}

      // Ambil identitas otoritatif dari server
      const st = data.student;
      state.userProfile.name = st.nama;
      state.userProfile.nim = st.nim;
      state.userProfile.gender = (st.gender === "P" || st.gender === "female") ? "female" : "male";
      state.userProfile.role = "student";
      state.userProfile.seat = st.seat;
      state.userProfile.group = st.group;
      state.corridorCode = st.corridor;
      state.wing = st.corridor === "KOR-B" ? 1 : 0;

      // Tampilkan hasil verifikasi identitas (hanya-baca) pada kartu HUD
      const card = document.getElementById("hud-student-card");
      if (card) {
        card.classList.remove("hidden");
        const elName = document.getElementById("hud-student-name");
        const elNim = document.getElementById("hud-student-nim");
        const elCorridor = document.getElementById("hud-student-corridor");
        const elGender = document.getElementById("hud-student-gender-badge");
        if (elName) elName.textContent = st.nama;
        if (elNim) elNim.textContent = st.nim;
        if (elCorridor) elCorridor.textContent = `${st.corridor} (Seat ${st.seat})`;
        if (elGender) elGender.textContent = st.gender === "P" ? "Perempuan" : "Laki-laki";
      }

      showToast(`Login berhasil. Selamat datang, ${st.nama} (${st.corridor})!`, "success");
      if (typeof ExamAPI !== "undefined" && ExamAPI.fetchProgress) {
        ExamAPI.fetchProgress().catch((e) => console.warn("[Progress] Gagal memuat progres awal:", e.message));
      }
    } catch (err) {
      showToast("Gagal terhubung ke server autentikasi: " + err.message, "error");
      return;
    }
  } else {
    // Role: Assessor
    const userInput = document.getElementById("login-input-assessor-user").value.trim();
    const passInput = document.getElementById("login-input-assessor-pass").value;

    if (!userInput || !passInput) {
      showToast("Harap masukkan Username dan Password Asesor!", "warning");
      return;
    }

    try {
      const res = await fetch("/api/auth/login-assessor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: userInput, password: passInput })
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Username atau password asesor salah.", "error");
        return;
      }

      state.jwtToken = data.token;
      try { sessionStorage.setItem("osce_jwt", data.token); } catch (e) {}

      state.userProfile.name = data.user.nama;
      state.userProfile.nim = data.user.username;
      state.userProfile.gender = "male";
      state.userProfile.role = data.user.role || "assessor";
      state.corridorCode = "DOSEN-ALL";
      state.wing = 0;

      showToast(`Selamat datang, ${data.user.nama}! Panel Asesor aktif.`, "success");
    } catch (err) {
      showToast("Gagal terhubung ke server autentikasi: " + err.message, "error");
      return;
    }
  }

  state.isLoggedIn = true;
  if (typeof syncActiveStations === "function") syncActiveStations(state.wing);
  if (typeof randomizeStationOptionsForCandidate === "function") {
    randomizeStationOptionsForCandidate(state.userProfile.nim);
  }
  if (typeof startAmbientHVAC === "function") {
    startAmbientHVAC();
  }
  if (typeof showOnboardingTutorialOverlay === "function") {
    showOnboardingTutorialOverlay(false);
  }

  // Tutup Modal Login
  document.getElementById("modal-login").classList.add("hidden");

  // Inisialisasi Avatar 3D Karakter Lokal
  if (localAvatar) {
    corridorGroup.remove(localAvatar.root);
    roomGroup.remove(localAvatar.root);
  }

  localAvatar = createDetailedHumanoidAvatar({
    name: state.userProfile.name,
    nim: state.userProfile.nim,
    gender: state.userProfile.gender,
    role: state.userProfile.role,
    isLocal: true,
    coatColor: 0xffffff,
    pantsColor: 0x1e293b,
    shoesColor: 0x09090b
  });
  corridorGroup.add(localAvatar.root);

  // Inisialisasi 9 Teman Mahasiswa Sekoridor & Multiplayer
  initPeerAvatars(corridorGroup);
  initMultiplayerSync();
  initAssessorSystem();

  // Bawa ke Station 01
  moveCameraToStationWaitingSpot(0, true);
  startPrepPhase();

  // Pastikan render loop aktif
  if (!animFrameId) {
    animate();
  }

  // Update telemetry & HUD badge
  const roleBadge = document.getElementById("hud-mode-badge");
  if (roleBadge) {
    roleBadge.textContent = (roleInput === "assessor") ? "Mode Asesor Penguji" : "Kandidat Peserta";
    roleBadge.className = (roleInput === "assessor") ? "text-amber-600 font-bold" : "text-teal-700 font-bold";
  }

  playBell("chime");
  speakAnnouncement(`Selamat datang di OSCE Center, ${state.userProfile.name}. Waktu persiapan dimulai.`);
  updateHUD();
}

// =========================================================================
// PERGERAKAN & DUDUK PRESISI PADA KURSI KLINIK BIRU (TIDAK MELAYANG)
// =========================================================================
function moveCameraToStationWaitingSpot(stationIdx, instant = false) {
  const anchor = station3DAnchors[stationIdx];
  if (!anchor) return;
  state.sceneView = "corridor";
  corridorGroup.visible = true;
  roomGroup.visible = false;
  document.getElementById("btn-exit-room").classList.add("hidden");

  const lateralOffset = getClientOffset(0.42);
  const targetX = anchor.standPos.x + (anchor.isRightSide ? -lateralOffset : lateralOffset) + wingOffsetX();
  const targetZ = anchor.standPos.z;

  if (instant) {
    state.player.x = targetX;
    state.player.y = 1.65;
    state.player.z = targetZ;
    state.player.yaw = anchor.standYaw;
    state.player.pitch = -0.05;
    state.player.targetX = null;
    state.player.targetZ = null;
    state.player.targetYaw = null;
  } else {
    state.player.targetX = targetX;
    state.player.targetZ = targetZ;
    state.player.targetYaw = anchor.standYaw;
  }
  state.isSeated = false;

  if (localAvatar) {
    if (!corridorGroup.children.includes(localAvatar.root)) {
      roomGroup.remove(localAvatar.root);
      corridorGroup.add(localAvatar.root);
    }
    localAvatar.root.position.set(state.player.x, 0, state.player.z);
    localAvatar.root.rotation.y = state.player.yaw;
    localAvatar.nameSprite.updateText(STATIONS[stationIdx].code);
    localAvatar.isSeated = false;
  }
  broadcastLocalPlayer();
  updateHUD();
}

// DUDUK DI KURSI TUNGGU (DUDUKAN PAS PADA KURSI BIRU)
function sitOnWaitingChair() {
  const anchor = station3DAnchors[state.currentStationIdx];
  if (!anchor) return;
  if (state.userProfile.role !== "assessor" && !isNearCurrentStation()) {
    showToast(`⛔ Kursi ini milik stasiun lain! Silakan menuju kursi stasiun giliran Anda (${STATIONS[state.currentStationIdx].code}).`, "warning");
    return;
  }
  playBell("click");
  state.isSeated = true;

  // Letakkan koordinat tepat di pusat kursi klinik
  state.player.x = anchor.xChair + wingOffsetX();
  state.player.y = 1.65;
  state.player.z = anchor.chairZ;
  state.player.yaw = anchor.isRightSide ? -Math.PI / 2 : Math.PI / 2;
  state.player.pitch = 0.08;

  if (localAvatar) {
    localAvatar.root.position.set(state.player.x, 0, anchor.chairZ);
    localAvatar.root.rotation.y = state.player.yaw;
    localAvatar.isSeated = true;
    localAvatar.updateAnimation(false, true, 0.016);
  }

  broadcastLocalPlayer();
  updateSubtitle(`Anda duduk di kursi tunggu ${STATIONS[state.currentStationIdx].code}. Tekan [E] atau tombol di tengah bawah untuk membaca Petunjuk Peserta.`);
  updateHUD();
}

function enterStationRoom() {
  if (state.phase === "prep") {
    if (state.examMode === "practice" || state.userProfile.role === "assessor") {
      startWorkPhase();
    } else {
      updateSubtitle("Mode Ujian Resmi: Pintu masih terkunci hingga waktu persiapan (60 detik) selesai.");
      showToast("Pintu masih terkunci! Anda sedang dalam waktu persiapan membaca instruksi.", "warning");
      return;
    }
  }

  // Validasi ketat giliran stasiun & posisi
  if (state.userProfile.role !== "assessor" && !isNearCurrentStation()) {
    showToast(`⛔ Akses Ditolak: Anda berada di stasiun yang salah! Giliran Anda saat ini adalah ${STATIONS[state.currentStationIdx].code}.`, "warning");
    updateSubtitle(`Pintu ini terkunci! Stasiun giliran Anda saat ini adalah ${STATIONS[state.currentStationIdx].code}. Silakan kembali.`);
    playBell("click");
    return;
  }

  if (typeof playDoorSFX === "function") playDoorSFX(true);
  if (typeof updateRoomStationEquipment === "function") updateRoomStationEquipment(state.currentStationIdx);
  if (typeof logCandidateEvent === "function") logCandidateEvent("enter_room", { stationIdx: state.currentStationIdx });
  state.sceneView = "room";
  state.isSeated = false;
  corridorGroup.visible = false;
  roomGroup.visible = true;

  const roomOffsetX = getClientOffset(0.5);
  state.player.x = roomOffsetX;
  state.player.y = 1.65;
  state.player.z = 1.85;
  state.player.yaw = 0;
  state.player.pitch = -0.06;
  state.player.targetX = null;
  state.player.targetZ = null;
  document.getElementById("btn-exit-room").classList.remove("hidden");

  if (localAvatar) {
    corridorGroup.remove(localAvatar.root);
    roomGroup.add(localAvatar.root);
    localAvatar.root.position.set(roomOffsetX, 0, 1.85);
    localAvatar.root.rotation.y = 0;
    localAvatar.isSeated = false;
  }
  broadcastLocalPlayer();

  const st = STATIONS[state.currentStationIdx];
  updateSubtitle(`Anda berada di dalam ${st.code} (${st.title}). Klik objek atau tekan [E] untuk menyelesaikan tugas.`);
  updateHUD();
}

function exitStationRoomToCorridor() {
  if (typeof playDoorSFX === "function") playDoorSFX(false);
  if (typeof logCandidateEvent === "function") logCandidateEvent("exit_room", { stationIdx: state.currentStationIdx });
  if (localAvatar) {
    roomGroup.remove(localAvatar.root);
    corridorGroup.add(localAvatar.root);
  }
  // Saat peserta keluar kembali ke koridor setelah berada di dalam ruangan, lampu di atas pintu kembali MERAH
  if (state.stationProgress[state.currentStationIdx]) {
    state.stationProgress[state.currentStationIdx].completed = true;
  }
  updateDoorStatusLamps(state.phase, state.currentStationIdx);
  moveCameraToStationWaitingSpot(state.currentStationIdx, true);
  broadcastLocalPlayer();
  updateSubtitle(`Anda kembali ke koridor di depan ${STATIONS[state.currentStationIdx].code}. Lampu pintu kembali MERAH (Terkunci / Selesai).`);
}

function toggleCameraView() {
  state.cameraMode = (state.cameraMode === "third") ? "first" : "third";
  const hint = document.getElementById("cam-hint-label");
  if (hint) {
    hint.textContent = (state.cameraMode === "third") ? "Kamera Orang ke-3" : "Kamera Orang ke-1";
  }
  if (localAvatar) {
    localAvatar.root.visible = (state.cameraMode === "third");
  }
}

// 3D Screen Projection untuk penanda tombol
function project3DToScreen(vec3, applyWing = false) {
  const v = vec3.clone();
  if (applyWing) v.x += wingOffsetX();
  v.project(camera);
  if (v.z > 1) return null;
  const x = (v.x * 0.5 + 0.5) * window.innerWidth;
  const y = (-(v.y * 0.5) + 0.5) * window.innerHeight;
  return { x, y };
}

function update3DFloatingMarkers() {
  const chairMarker = document.getElementById("chair-marker");
  const doorMarker = document.getElementById("door-marker");
  const npcMarker = document.getElementById("room-marker-npc");
  const labMarker = document.getElementById("room-marker-lab");
  const deskMarker = document.getElementById("room-marker-desk");
  const st = STATIONS[state.currentStationIdx];

  if (state.sceneView === "corridor") {
    npcMarker.classList.add("hidden");
    labMarker.classList.add("hidden");
    deskMarker.classList.add("hidden");

    const anchor = station3DAnchors[state.currentStationIdx];
    if (!anchor) return;

    const chairScreen = project3DToScreen(anchor.chairPos, true);
    if (chairScreen && !state.isSeated) {
      chairMarker.classList.remove("hidden");
      chairMarker.style.left = `${chairScreen.x}px`;
      chairMarker.style.top = `${chairScreen.y}px`;
      document.getElementById("chair-marker-station").textContent = st.code;
    } else {
      chairMarker.classList.add("hidden");
    }

    const doorScreen = project3DToScreen(anchor.doorPos, true);
    if (doorScreen) {
      doorMarker.classList.remove("hidden");
      doorMarker.style.left = `${doorScreen.x}px`;
      doorMarker.style.top = `${doorScreen.y}px`;
      document.getElementById("door-marker-text").textContent =
        (state.phase === "prep") ? "Baca Petunjuk Peserta" : "Masuk Ruangan Station";
    } else {
      doorMarker.classList.add("hidden");
    }
  } else {
    chairMarker.classList.add("hidden");
    doorMarker.classList.add("hidden");

    const npcPos = project3DToScreen(new THREE.Vector3(-0.25, 2.05, -2.25));
    if (npcPos) {
      npcMarker.classList.remove("hidden");
      npcMarker.style.left = `${npcPos.x}px`;
      npcMarker.style.top = `${npcPos.y}px`;
      document.getElementById("room-npc-label").textContent = st.npcName;
    }

    const labPos = project3DToScreen(new THREE.Vector3(-1.75, 1.45, -1.2));
    if (labPos) {
      labMarker.classList.remove("hidden");
      labMarker.style.left = `${labPos.x}px`;
      labMarker.style.top = `${labPos.y}px`;
    }

    const deskPos = project3DToScreen(new THREE.Vector3(0.55, 1.35, -1.2));
    if (deskPos) {
      deskMarker.classList.remove("hidden");
      deskMarker.style.left = `${deskPos.x}px`;
      deskMarker.style.top = `${deskPos.y}px`;
    }
  }
}

// =========================================================================
// TIMER & PHASE ENGINE
// =========================================================================
function formatTime(sec) {
  const m = Math.floor(Math.max(0, sec) / 60);
  const s = Math.max(0, sec) % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function startPrepPhase() {
  state.phase = "prep";
  state.timerSeconds = (state.examMode === "practice") ? 30 : 60;
  updateDoorStatusLamps("prep", state.currentStationIdx);
  if (typeof setPeerBotsPhase === "function") setPeerBotsPhase("prep");
  const st = STATIONS[state.currentStationIdx];
  updateSubtitle(`Waktu membaca instruksi (${state.timerSeconds} detik). Giliran Anda: ${st.code}. Lampu pintu MERAH (Belum boleh masuk).`);
  updateHUD();
}

function startWorkPhase() {
  state.phase = "work";
  state.timerSeconds = (state.examMode === "practice") ? 180 : 540;
  // Pastikan apabila stasiun ini belum selesai dikerjakan di putaran ini, lampu menyala HIJAU TERANG
  if (state.stationProgress[state.currentStationIdx]) {
    state.stationProgress[state.currentStationIdx].completed = false;
  }
  updateDoorStatusLamps("work", state.currentStationIdx);
  if (typeof setPeerBotsPhase === "function") setPeerBotsPhase("work");
  playBell("chime");
  const st = STATIONS[state.currentStationIdx];
  speakAnnouncement(`Waktu membaca instruksi selesai. Silakan memasuki ${st.code}.`);
  updateSubtitle(`🟢 SILAKAN MEMASUKI STASIUN / RUANGAN (${st.code})! Lampu atas pintu menyala HIJAU. Tekan [E] untuk masuk.`);
  updateHUD();
}

function advanceToNextStation() {
  playBell("chime");
  const nextIdx = (state.currentStationIdx + 1) % STATIONS.length;
  state.currentStationIdx = nextIdx;
  state.hasReadInstruction = false;
  selectedDecision = null;

  // Rotasi teman mahasiswa sekoridor
  rotatePeerBots();

  if (state.movementMode === "auto" || state.movementMode === "hybrid") {
    moveCameraToStationWaitingSpot(nextIdx, false);
  } else {
    moveCameraToStationWaitingSpot(nextIdx, true);
  }

  startPrepPhase();
  speakAnnouncement(`Silakan berpindah menuju ${STATIONS[nextIdx].code}.`);
}

// Timer Loop 1 detik
setInterval(() => {
  if (!state.isLoggedIn) return;
  if (state.timerSeconds > 0) {
    state.timerSeconds--;
  } else {
    if (state.phase === "prep") startWorkPhase();
    else if (state.phase === "work") advanceToNextStation();
  }
  const formatted = formatTime(state.timerSeconds);
  const timerEl = document.getElementById("hud-timer");
  if (timerEl) timerEl.textContent = formatted;
  updateCorridorDigitalClock(formatted);
}, 1000);

// =========================================================================
// HUD & MODAL HELPERS
// =========================================================================
function updateSubtitle(text) {
  const el = document.getElementById("hud-subtitle-banner");
  if (el) el.textContent = text;
}

function updateHUD() {
  const st = STATIONS[state.currentStationIdx];
  document.getElementById("hud-station-title").textContent = st.code;
  document.getElementById("hud-station-subtitle").textContent = `${st.area}: ${st.title}`;
  document.getElementById("hud-phase-label").textContent = (state.phase === "prep") ? "Waktu persiapan" : "Waktu kerja";

  const completedCount = state.stationProgress.filter(p => p.completed).length;
  document.getElementById("hud-progress-count").textContent = `${completedCount}/10 selesai`;

  const actionBtn = document.getElementById("btn-context-action");
  const actionLabel = document.getElementById("context-action-label");

  if (state.sceneView === "corridor") {
    if (!state.isSeated && state.phase === "prep") {
      actionLabel.textContent = `Duduk — ${st.code}`;
      actionBtn.classList.remove("hidden");
    } else if (state.phase === "prep") {
      actionLabel.textContent = `Baca Petunjuk — ${st.code}`;
      actionBtn.classList.remove("hidden");
    } else {
      actionLabel.textContent = `Masuk Ruangan — ${st.code}`;
      actionBtn.classList.remove("hidden");
    }
  } else {
    actionLabel.textContent = `Buka Lembar Kerja — ${st.code}`;
    actionBtn.classList.remove("hidden");
  }

  if (typeof updateAssessorHUD === "function") {
    updateAssessorHUD();
  }
}

function triggerPrimaryContextAction() {
  if (state.sceneView === "corridor") {
    if (!state.isSeated && state.phase === "prep") {
      sitOnWaitingChair();
    } else if (state.phase === "prep" && !state.hasReadInstruction) {
      openInstructionModal();
    } else if (state.phase === "work") {
      enterStationRoom();
    } else {
      openInstructionModal();
    }
  } else {
    openWorkstationModal("form");
  }
}

// =========================================================================
// MAIN ANIMATION LOOP
// =========================================================================
function animate() {
  animFrameId = requestAnimationFrame(animate);

  const moveSpeed = 0.085;
  const turnSpeed = 0.032;

  if (state.keys.w || state.keys.s || state.keys.a || state.keys.d) {
    state.player.targetX = null;
    state.player.targetZ = null;
    state.player.targetYaw = null;
    if (state.isSeated) {
      state.isSeated = false;
      state.player.y = 1.65;
    }
  }

  if (state.keys.w) {
    state.player.x -= Math.sin(state.player.yaw) * moveSpeed;
    state.player.z -= Math.cos(state.player.yaw) * moveSpeed;
  }
  if (state.keys.s) {
    state.player.x += Math.sin(state.player.yaw) * moveSpeed;
    state.player.z += Math.cos(state.player.yaw) * moveSpeed;
  }
  if (state.keys.a) state.player.yaw += turnSpeed;
  if (state.keys.d) state.player.yaw -= turnSpeed;

  clampPlayerPosition();

  // Smooth auto-glide ke stasiun
  if (state.player.targetX !== null && state.player.targetZ !== null) {
    state.player.x += (state.player.targetX - state.player.x) * 0.08;
    state.player.z += (state.player.targetZ - state.player.z) * 0.08;
    if (state.player.targetYaw !== null) {
      state.player.yaw += (state.player.targetYaw - state.player.yaw) * 0.08;
    }
    if (Math.abs(state.player.targetX - state.player.x) < 0.03 && Math.abs(state.player.targetZ - state.player.z) < 0.03) {
      state.player.targetX = null;
      state.player.targetZ = null;
      state.player.targetYaw = null;
    }
  }

  // Penguji duduk tegak di kursinya (tidak ada gerak naik-turun agar tidak "melayang")
  if (roomAvatarNpc && state.sceneView === "room") {
    roomAvatarNpc.updateAnimation(false, true, 0.016);
  }

  const isMoving = Boolean(
    state.keys.w || state.keys.s || state.keys.a || state.keys.d ||
    (state.player.targetX !== null && state.player.targetZ !== null)
  );

  // Update Avatar Lokal
  if (localAvatar) {
    localAvatar.root.visible = (state.cameraMode === "third");
    if (!state.isSeated) {
      localAvatar.root.position.set(state.player.x, 0, state.player.z);
      localAvatar.root.rotation.y = state.player.yaw;
    }
    localAvatar.updateAnimation(isMoving, state.isSeated, 0.016);
  }

  // Update Peer Candidate Bots
  if (typeof updatePeerBotsAnimation === "function") {
    updatePeerBotsAnimation(0.016);
  } else {
    peerBots.forEach((bot) => {
      bot.avatar.updateAnimation(false, bot.avatar.isSeated, 0.016);
    });
  }

  // Update Remote Multi-Tab Players
  remoteAvatars.forEach((rem) => {
    if (rem.targetX !== null && rem.targetZ !== null) {
      rem.root.position.x += (rem.targetX - rem.root.position.x) * 0.15;
      rem.root.position.z += (rem.targetZ - rem.root.position.z) * 0.15;
      if (rem.targetYaw !== null) {
        rem.root.rotation.y += (rem.targetYaw - rem.root.rotation.y) * 0.15;
      }
    }
    rem.updateAnimation(rem.isMoving, rem.isSeated, 0.016);
  });

  // Posisi Kamera (Orang ke-3 vs Orang ke-1)
  if (camera && renderer) {
    if (state.cameraMode === "third") {
      const dist = 2.4;
      const height = 0.65;
      const camX = state.player.x + Math.sin(state.player.yaw) * dist;
      const camZ = state.player.z + Math.cos(state.player.yaw) * dist;
      const camY = (state.isSeated ? 1.25 : 1.65) + height + state.player.pitch * 1.35;
      camera.position.set(camX, camY, camZ);
      camera.lookAt(state.player.x, (state.isSeated ? 0.95 : 1.35) + state.player.pitch * 0.4, state.player.z);
    } else {
      camera.position.set(state.player.x, state.isSeated ? 1.18 : 1.65, state.player.z);
      camera.rotation.y = state.player.yaw;
      camera.rotation.x = state.player.pitch;
    }
    renderer.render(scene, camera);
    update3DFloatingMarkers();
    if (typeof updateStation3DEquipmentAnimation === "function") updateStation3DEquipmentAnimation(0.016);
    if (typeof playFootstepSFX === "function") playFootstepSFX(0.016, isMoving);
    if (typeof updateLiveMinimap === "function") updateLiveMinimap();
  }
}

// Window Onload Entrypoint
window.onload = function () {
  initThreeJS();
  wireEvents();
  if (typeof initUxPolishSystem === "function") initUxPolishSystem();
  if (!animFrameId) {
    animate();
  }
};

