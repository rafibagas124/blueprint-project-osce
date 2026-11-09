// =========================================================================
// REAL-TIME MULTIPLAYER & PEER CANDIDATES ENGINE
// Fitur: BroadcastChannel Multi-Tab + 9 Simulasi Mahasiswa Pria & Wanita
// =========================================================================

const remoteAvatars = new Map();
const peerBots = [];
let multiChannel = null;

// Data 9 Mahasiswa Teman Sekoridor (Kombinasi Pria & Wanita/Hijab)
const DEFAULT_PEER_STUDENTS = [
  { stationIdx: 1, name: "apt. Sarah Amalia, S.Farm.", nim: "2024-08102", gender: "female", coat: 0xffffff, pants: 0x1e293b, hair: 0x1e1b18, hijab: 0x0f766e },
  { stationIdx: 2, name: "apt. Dimas Prasetyo", nim: "2024-08103", gender: "male", coat: 0xffffff, pants: 0x0f172a, hair: 0x271c19 },
  { stationIdx: 3, name: "apt. Farhan Ramadhan", nim: "2024-08104", gender: "male", coat: 0xffffff, pants: 0x334155, hair: 0x1a1a1a },
  { stationIdx: 4, name: "apt. Anisa Rahmawati", nim: "2024-08105", gender: "female", coat: 0xffffff, pants: 0x1e293b, hair: 0x2e1065, hijab: 0x4338ca },
  { stationIdx: 5, name: "apt. Bagus Tri Wicaksono", nim: "2024-08106", gender: "male", coat: 0xffffff, pants: 0x1e293b, hair: 0x18181b },
  { stationIdx: 6, name: "apt. Cindy Claudia", nim: "2024-08107", gender: "female", coat: 0xffffff, pants: 0x0f172a, hair: 0x3b1a10, hijab: 0x0284c7 },
  { stationIdx: 7, name: "apt. Dedi Kurniawan", nim: "2024-08108", gender: "male", coat: 0xffffff, pants: 0x334155, hair: 0x171717 },
  { stationIdx: 8, name: "apt. Elisa Putri, S.Farm.", nim: "2024-08109", gender: "female", coat: 0xffffff, pants: 0x1e293b, hair: 0x221711, hijab: 0x047857 },
  { stationIdx: 9, name: "apt. Fajar Nugroho", nim: "2024-08110", gender: "male", coat: 0xffffff, pants: 0x0f172a, hair: 0x1c1917 }
];

// Inisialisasi 9 Teman Mahasiswa di Koridor
function initPeerAvatars(corridorGroup) {
  DEFAULT_PEER_STUDENTS.forEach((p) => {
    const anchor = station3DAnchors[p.stationIdx];
    if (!anchor) return;

    const avatar = createDetailedHumanoidAvatar({
      name: p.name,
      nim: p.nim,
      gender: p.gender,
      role: "student",
      isLocal: false,
      coatColor: p.coat,
      pantsColor: p.pants,
      hairColor: p.hair,
      hijabColor: p.hijab || 0x0f766e
    });

    // POSISI DUDUK PRESISI: Tepat di atas dudukan kursi
    // Dudukan kursi berada di xChair, 0, chairZ dengan rotasi menghadap koridor
    const isRight = anchor.isRightSide;
    avatar.root.position.set(anchor.xChair, 0, anchor.chairZ);
    avatar.root.rotation.y = isRight ? -Math.PI / 2 : Math.PI / 2;
    avatar.isSeated = true;
    avatar.updateAnimation(false, true, 0.016);

    avatar.nameSprite.updateText(`Station ${String(p.stationIdx + 1).padStart(2, "0")}`);
    corridorGroup.add(avatar.root);

    peerBots.push({
      data: p,
      avatar,
      anchor,
      currentStation: p.stationIdx,
      isSeated: true,
      isMoving: false,
      inRoom: false,
      targetX: null,
      targetZ: null,
      targetYaw: null
    });
  });

  renderPeersList();
}

// Render Panel Daftar Mahasiswa di Lorong
function renderPeersList() {
  const container = document.getElementById("peers-list-container");
  if (!container) return;
  let html = "";

  // 1. User Lokal
  const localSt = `Station ${String(state.currentStationIdx + 1).padStart(2, "0")}`;
  const isAssessor = (state.userProfile.role === "assessor");

  html += `
    <div class="${isAssessor ? 'bg-amber-950/70 border-amber-500/50' : 'bg-teal-950/70 border-teal-500/50'} border rounded-xl p-2.5 flex items-center justify-between">
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 rounded-full ${isAssessor ? 'bg-amber-800' : 'bg-teal-800'} text-white flex items-center justify-center font-bold text-xs">
          ${state.userProfile.gender === 'female' ? '👩‍⚕️' : '👨‍⚕️'}
        </div>
        <div>
          <div class="font-bold text-white text-xs">${state.userProfile.name}</div>
          <div class="text-[10px] ${isAssessor ? 'text-amber-300' : 'text-teal-300'} font-mono">${state.userProfile.nim} • ${isAssessor ? 'ASESOR PENGUJI' : 'PESERTA'}</div>
        </div>
      </div>
      <div class="text-right">
        <span class="px-2 py-0.5 rounded ${isAssessor ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-teal-500/20 text-teal-300 border-teal-500/30'} font-bold text-[10px] border">${localSt}</span>
        <div class="text-[9px] text-emerald-400 mt-0.5 font-mono">0ms (Host)</div>
      </div>
    </div>
  `;

  // 2. Remote User (Multi-tab Live)
  remoteAvatars.forEach((remote) => {
    html += `
      <div class="bg-indigo-950/70 border border-indigo-500/50 rounded-xl p-2.5 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-full bg-indigo-800 text-white flex items-center justify-center font-bold text-xs">
            ${remote.gender === 'female' ? '👩‍⚕️' : '👨‍⚕️'}
          </div>
          <div>
            <div class="font-bold text-white text-xs">${remote.name || "Peserta Lain"}</div>
            <div class="text-[10px] text-indigo-300 font-mono">${remote.nim || "Tab Sinkron"} • LIVE</div>
          </div>
        </div>
        <div class="text-right">
          <span class="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold text-[10px] border border-indigo-500/30">Station ${String((remote.stationIdx || 0) + 1).padStart(2, "0")}</span>
          <div class="text-[9px] text-emerald-400 mt-0.5 font-mono">8ms</div>
        </div>
      </div>
    `;
  });

  // 3. 9 Mahasiswa Teman Sekoridor
  peerBots.forEach((b) => {
    const stCode = `Station ${String(b.currentStation + 1).padStart(2, "0")}`;
    const statusBadge = b.inRoom ? "DI DALAM RUANGAN" : (b.isMoving ? "BERJALAN ROTASI" : "DI KORIDOR");
    html += `
      <div class="bg-slate-800/80 border border-slate-700 rounded-xl p-2.5 flex items-center justify-between hover:bg-slate-800 transition">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-full bg-slate-700 text-slate-200 flex items-center justify-center font-bold text-xs">
            ${b.data.gender === 'female' ? '👩‍⚕️' : '👨‍⚕️'}
          </div>
          <div>
            <div class="font-bold text-slate-200 text-xs">${b.data.name}</div>
            <div class="text-[10px] text-slate-300 font-mono">${b.data.nim} • ${statusBadge}</div>
          </div>
        </div>
        <div class="text-right">
          <span class="px-2 py-0.5 rounded bg-slate-700 text-slate-300 font-semibold text-[10px]">${stCode}</span>
          <div class="text-[9px] text-emerald-400 mt-0.5 font-mono">14ms</div>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

function togglePeersPanel() {
  const p = document.getElementById("panel-peers");
  if (!p) return;
  p.classList.toggle("hidden");
  renderPeersList();
}

// Sinkronisasi Fase 9 Mahasiswa Sekoridor (Prep = Baca Instruksi di Koridor, Work = Masuk Ruangan)
function setPeerBotsPhase(phase) {
  if (typeof netMode !== "undefined" && netMode === "ws") return;
  peerBots.forEach((b) => {
    const anchor = station3DAnchors[b.currentStation];
    if (!anchor) return;
    if (phase === "work") {
      // Berdiri dari kursi tunggu lalu masuk ke dalam ruangan stasiun masing-masing
      b.isSeated = false;
      b.avatar.isSeated = false;
      b.isMoving = true;
      b.targetX = anchor.doorPos.x;
      b.targetZ = anchor.doorPos.z;
      b.targetYaw = anchor.standYaw;
      setTimeout(() => {
        b.inRoom = true;
        b.isMoving = false;
        b.avatar.root.visible = false; // berada di dalam ruangan stasiunnya
        renderPeersList();
      }, 950);
    } else {
      // Fase persiapan: berada di koridor membaca petunjuk di depan pintu masing-masing
      b.inRoom = false;
      b.avatar.root.visible = true;
      b.isSeated = true;
      b.avatar.isSeated = true;
      b.isMoving = false;
      b.targetX = null;
      b.targetZ = null;
      b.avatar.root.position.set(anchor.xChair, 0, anchor.chairZ);
      b.avatar.root.rotation.y = anchor.isRightSide ? -Math.PI / 2 : Math.PI / 2;
    }
  });
  renderPeersList();
}

// Seluruh mahasiswa keluar dari ruangan kembali ke koridor setelah selesai mengerjakan tugas
function peerBotsExitToCorridor() {
  if (typeof netMode !== "undefined" && netMode === "ws") return;
  peerBots.forEach((b) => {
    const anchor = station3DAnchors[b.currentStation];
    if (!anchor) return;
    b.inRoom = false;
    b.avatar.root.visible = true;
    b.isSeated = false;
    b.avatar.isSeated = false;
    b.isMoving = false;
    b.targetX = null;
    b.targetZ = null;
    b.avatar.root.position.set(anchor.standPos.x, 0, anchor.standPos.z);
    b.avatar.root.rotation.y = anchor.standYaw;
    b.avatar.nameSprite.updateText(`Selesai S${String(b.currentStation + 1).padStart(2, "0")}`);
  });
  renderPeersList();
}

// Rotasi Semua Mahasiswa Teman Sekoridor (Stasiun k -> Stasiun k+1 secara bergantian)
function rotatePeerBots() {
  if (typeof netMode !== "undefined" && netMode === "ws") return;
  peerBots.forEach((b) => {
    b.inRoom = false;
    b.avatar.root.visible = true;
    b.currentStation = (b.currentStation + 1) % 10;
    const newAnchor = station3DAnchors[b.currentStation];
    if (newAnchor) {
      b.isSeated = false;
      b.avatar.isSeated = false;
      b.isMoving = true;
      b.targetX = newAnchor.xChair;
      b.targetZ = newAnchor.chairZ;
      b.targetYaw = newAnchor.isRightSide ? -Math.PI / 2 : Math.PI / 2;
      b.avatar.nameSprite.updateText(`Station ${String(b.currentStation + 1).padStart(2, "0")}`);
    }
  });
  renderPeersList();
}

function updatePeerBotsAnimation(dt = 0.016) {
  peerBots.forEach((b) => {
    if (b.targetX !== null && b.targetZ !== null) {
      const dx = b.targetX - b.avatar.root.position.x;
      const dz = b.targetZ - b.avatar.root.position.z;
      const dist = Math.hypot(dx, dz);
      if (dist > 0.06) {
        b.avatar.root.position.x += dx * 0.07;
        b.avatar.root.position.z += dz * 0.07;
        b.avatar.root.rotation.y = Math.atan2(-dx, -dz);
        b.isMoving = true;
      } else {
        b.avatar.root.position.set(b.targetX, 0, b.targetZ);
        if (b.targetYaw !== null) b.avatar.root.rotation.y = b.targetYaw;
        b.targetX = null;
        b.targetZ = null;
        b.isMoving = false;
        if (typeof state !== "undefined" && state.phase === "prep") {
          b.isSeated = true;
          b.avatar.isSeated = true;
        }
      }
    }
    b.avatar.updateAnimation(b.isMoving, b.avatar.isSeated, dt);
  });
}

