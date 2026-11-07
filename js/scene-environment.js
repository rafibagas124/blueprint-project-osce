// =========================================================================
// 3D ENVIRONMENT SCENE (CORRIDOR + STATION INTERIOR ROOMS)
// Fitur: Papan Petunjuk Dinamis Setiap Ruangan (Dapat Di-Input Dosen)
//        Kursi Tunggu Klinik Biru Presisi Tinggi
//        Palet Warna Realistis Rumah Sakit / Klinik Modern Indonesia
// =========================================================================

const station3DAnchors = [];
const stationDoorPosterMeshes = [];
const stationDoorPosterMeshesAlt = []; // poster di Koridor B
const WING_DX = 11.5; // jarak sumbu-X antara Koridor A dan Koridor B
const stationDoorLamps = [];
let clockCanvas, clockCtx, clockTexture;
let npcMeshGroup, labHighlightMesh, roomAvatarNpc;

// Helper: Buat Tekstur Lantai Ubin Keramik Rumah Sakit Realistis (60x60cm + Nat Abu-Abu)
let cachedTileBaseCanvas = null;
function createRealisticTileFloorTexture(repeatX = 12, repeatY = 64) {
  if (!cachedTileBaseCanvas) {
    const c = document.createElement("canvas");
    c.width = 256;
    c.height = 256;
    const ctx = c.getContext("2d");

    // Nat ubin (grout) abu-abu gelap kontras nyaman
    ctx.fillStyle = "#64748b";
    ctx.fillRect(0, 0, 256, 256);

    // 2x2 ubin keramik porselen hangat (tidak menyilaukan mata)
    const tiles = [
      [4, 4, 120, 120, "#cbd5e1"],
      [132, 4, 120, 120, "#c4ceda"],
      [4, 132, 120, 120, "#c4ceda"],
      [132, 132, 120, 120, "#cbd5e1"]
    ];
    tiles.forEach(([x, y, w, h, col]) => {
      ctx.fillStyle = col;
      ctx.fillRect(x, y, w, h);
      // Bevel tepi ubin halus
      ctx.strokeStyle = "#dde5ed";
      ctx.lineWidth = 2;
      ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);
      // Bintik granit/marmer halus
      ctx.fillStyle = "rgba(100, 116, 139, 0.10)";
      for (let s = 0; s < 18; s++) {
        const sx = x + ((s * 37) % (w - 8)) + 4;
        const sy = y + ((s * 53) % (h - 8)) + 4;
        ctx.fillRect(sx, sy, 3, 3);
      }
    });
    cachedTileBaseCanvas = c;
  }
  const tex = new THREE.CanvasTexture(cachedTileBaseCanvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeatX, repeatY);
  tex.needsUpdate = true;
  return tex;
}

// Helper: Perbarui warna & pancaran cahaya lampu bulat di atas semua pintu stasiun
// - MERAH (0xef4444): Waktu Persiapan (baca instruksi) ATAU ketika kandidat sudah selesai mengerjakan di dalam ruangan & kembali ke koridor
// - HIJAU BERSINAR (0x22c55e): Saat muncul "Silakan memasuki stasiun / ruangan" (Waktu Kerja & tugas stasiun belum selesai)
function updateDoorStatusLamps(phase, currentStationIdx) {
  stationDoorLamps.forEach((lamp) => {
    if (!lamp.material) return;
    const prog = (typeof state !== "undefined" && state.stationProgress) ? state.stationProgress[lamp.stationIndex] : null;
    const alreadyDone = Boolean(prog && prog.completed);

    const isAllowedGreen = (
      phase === "work" &&
      !alreadyDone &&
      (lamp.stationIndex === currentStationIdx || (typeof state !== "undefined" && state.examMode === "practice" && lamp.stationIndex === currentStationIdx))
    );

    if (isAllowedGreen) {
      lamp.material.color.setHex(0x22c55e); // HIJAU TERANG
      if (lamp.haloMat) {
        lamp.haloMat.color.setHex(0x4ade80);
        lamp.haloMat.opacity = 0.65;
      }
      if (lamp.pointLight) {
        lamp.pointLight.color.setHex(0x22c55e);
        lamp.pointLight.intensity = 1.35;
      }
    } else {
      lamp.material.color.setHex(0xef4444); // MERAH (Terkunci / Sudah Selesai & Kembali ke Koridor)
      if (lamp.haloMat) {
        lamp.haloMat.color.setHex(0xf87171);
        lamp.haloMat.opacity = 0.38;
      }
      if (lamp.pointLight) {
        lamp.pointLight.color.setHex(0xef4444);
        lamp.pointLight.intensity = 0.65;
      }
    }
  });
}

// Helper untuk membuat Canvas Texture tulisan berkualitas tinggi
function makeTextCanvasTexture(lines, opts = {}) {
  const w = opts.width || 512;
  const h = opts.height || 256;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d");

  ctx.fillStyle = opts.bg || "#1a2744";
  ctx.fillRect(0, 0, w, h);

  if (opts.border) {
    ctx.strokeStyle = opts.border;
    ctx.lineWidth = 8;
    ctx.strokeRect(4, 4, w - 8, h - 8);
  }

  ctx.textAlign = opts.align || "center";
  ctx.textBaseline = "middle";

  lines.forEach((line) => {
    ctx.font = line.font || "bold 44px Inter, sans-serif";
    ctx.fillStyle = line.color || "#ffffff";
    ctx.fillText(line.text, line.x !== undefined ? line.x : w / 2, line.y || h / 2);
  });

  const tex = new THREE.CanvasTexture(c);
  tex.needsUpdate = true;
  return tex;
}

// =========================================================================
// PAPAN PETUNJUK DI PINTU LUAR SETIAP RUANGAN
// Desain: Bolder, Kontras Tinggi, Mudah Dibaca Dari Jarak 3D
// =========================================================================
function createDoorPosterTexture(station) {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 768;
  const ctx = c.getContext("2d");

  // === BACKGROUND PUTIH BERSIH ===
  ctx.fillStyle = "#f8fafc";
  ctx.fillRect(0, 0, 512, 768);

  // Shadow halus di tepi
  ctx.fillStyle = "#e2e8f0";
  ctx.fillRect(0, 0, 512, 6);
  ctx.fillRect(0, 762, 512, 6);
  ctx.fillRect(0, 0, 6, 768);
  ctx.fillRect(506, 0, 6, 768);

  // === HEADER BANNER (Teal Medis Kuat) ===
  const hGrad = ctx.createLinearGradient(0, 0, 512, 130);
  hGrad.addColorStop(0, "#0d6b63");
  hGrad.addColorStop(1, "#0f766e");
  ctx.fillStyle = hGrad;
  ctx.fillRect(0, 0, 512, 130);

  // Nomor Station (besar, putih, tegas)
  ctx.fillStyle = "#ffffff";
  ctx.font = "900 52px Inter, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillText(station.code, 256, 65);

  // Area (hijau muda, mudah dibaca)
  ctx.fillStyle = "#a7f3d0";
  ctx.font = "700 20px Inter, sans-serif";
  ctx.fillText(station.area.toUpperCase(), 256, 110);

  // === STRIP PUTIH — LABEL PETUNJUK ===
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 130, 512, 52);
  ctx.fillStyle = "#0f172a";
  ctx.font = "900 24px Inter, sans-serif";
  ctx.fillText("PETUNJUK PESERTA UJIAN", 256, 162);

  // Garis tegas pemisah
  ctx.fillStyle = "#0d9488";
  ctx.fillRect(0, 182, 512, 5);

  // === AREA INSTRUKSI (bg cream lembut) ===
  ctx.fillStyle = "#fffbeb";
  ctx.fillRect(0, 187, 512, 340);

  ctx.fillStyle = "#92400e";
  ctx.font = "800 20px Inter, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("📋  INSTRUKSI KHUSUS:", 28, 222);

  // Garis bawah instruksi
  ctx.strokeStyle = "#fbbf24";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(28, 232);
  ctx.lineTo(484, 232);
  ctx.stroke();

  // Teks petunjuk — BESAR, KONTRAS TINGGI, hitam di cream
  ctx.font = "600 19px Inter, sans-serif";
  ctx.fillStyle = "#1c1917";
  const textToDraw = station.doorShortInstruction || station.scenario || "";
  const words = textToDraw.split(" ");
  let lineTxt = "";
  let y = 258;
  const maxWidth = 456;
  const lineH = 32;
  for (let n = 0; n < words.length; n++) {
    const test = lineTxt + words[n] + " ";
    if (ctx.measureText(test).width > maxWidth && n > 0) {
      ctx.fillText(lineTxt, 28, y);
      lineTxt = words[n] + " ";
      y += lineH;
      if (y > 500) { ctx.fillText("…", 28, y); break; }
    } else {
      lineTxt = test;
    }
  }
  if (y <= 500) ctx.fillText(lineTxt, 28, y);

  // Garis pemisah sebelum kompetensi
  ctx.fillStyle = "#0d9488";
  ctx.fillRect(0, 527, 512, 4);

  // === BOX KOMPETENSI (bg teal muda) ===
  ctx.fillStyle = "#ccfbf1";
  ctx.fillRect(0, 531, 512, 110);

  ctx.fillStyle = "#065f46";
  ctx.font = "800 18px Inter, sans-serif";
  ctx.textAlign = "left";
  ctx.fillText("KOMPETENSI UTAMA:", 28, 562);

  ctx.fillStyle = "#064e3b";
  ctx.font = "600 17px Inter, sans-serif";
  const compText = (station.competencies || "").length > 60
    ? (station.competencies || "").substring(0, 57) + "…"
    : (station.competencies || "");
  ctx.fillText(compText, 28, 588);

  // Waktu ujian
  ctx.fillStyle = "#065f46";
  ctx.font = "700 16px Inter, sans-serif";
  ctx.fillText("⏱  Waktu: 10 menit / station", 28, 618);

  // Garis pemisah
  ctx.fillStyle = "#0d9488";
  ctx.fillRect(0, 641, 512, 4);

  // === FOOTER CTA (gradient kuat, tulisan besar) ===
  const ftGrad = ctx.createLinearGradient(0, 645, 0, 768);
  ftGrad.addColorStop(0, "#0d6b63");
  ftGrad.addColorStop(1, "#065f46");
  ctx.fillStyle = ftGrad;
  ctx.fillRect(0, 645, 512, 123);

  ctx.fillStyle = "#ffffff";
  ctx.font = "900 26px Inter, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("⬇  KLIK / [E] BACA & MASUK", 256, 695);
  ctx.font = "600 18px Inter, sans-serif";
  ctx.fillStyle = "#a7f3d0";
  ctx.fillText("Tekan [E] atau klik tombol untuk membuka", 256, 730);
  ctx.fillText("petunjuk lengkap dan memasuki ruangan", 256, 753);

  const texture = new THREE.CanvasTexture(c);
  texture.needsUpdate = true;
  return texture;
}

// Fungsi untuk memperbarui tampilan papan petunjuk 3D saat Dosen mengedit
function updateStationDoorPoster(stationIndex, wing = undefined) {
  const getTex = (w) => createDoorPosterTexture((typeof getStationData === "function") ? getStationData(w, stationIndex) : STATIONS[stationIndex]);
  if (wing === 0 || wing === undefined) {
    if (stationDoorPosterMeshes[stationIndex]) {
      stationDoorPosterMeshes[stationIndex].material.map = getTex(0);
      stationDoorPosterMeshes[stationIndex].material.needsUpdate = true;
    }
  }
  if (wing === 1 || wing === undefined) {
    if (stationDoorPosterMeshesAlt[stationIndex]) {
      stationDoorPosterMeshesAlt[stationIndex].material.map = getTex(1);
      stationDoorPosterMeshesAlt[stationIndex].material.needsUpdate = true;
    }
  }
}

// =========================================================================
// BUILD 3D CORRIDOR (LORONG OSCE LENGKAP DENGAN 10 STATIONS & KURSI PRESISI)
// Palet Warna Realistis: Rumah Sakit Klinik Modern Indonesia
// =========================================================================
function buildCorridor3D(corridorGroup, isSecondary = false) {
  // === LANTAI UBIN KERAMIK REALISTIS (60x60cm dengan Nat & Pantulan Halus) ===
  const floorGeo = new THREE.PlaneGeometry(7.2, 40);
  const floorMat = new THREE.MeshStandardMaterial({
    map: createRealisticTileFloorTexture(12, 66),
    color: 0xffffff,
    roughness: 0.26,
    metalness: 0.08
  });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, 0, -4);
  floor.receiveShadow = true;
  corridorGroup.add(floor);

  // Jalur garis kuning tengah lorong & Dekal Lantai Penunjuk Arah Rotasi OSCE
  const lineGeo = new THREE.PlaneGeometry(0.12, 40);
  const lineMat = new THREE.MeshBasicMaterial({ color: 0xd97706 });
  [-0.6, 0.6].forEach(xOff => {
    const lineM = new THREE.Mesh(lineGeo, lineMat);
    lineM.rotation.x = -Math.PI / 2;
    lineM.position.set(xOff, 0.002, -4);
    corridorGroup.add(lineM);
  });

  // Dekal Lantai Panah Rotasi & Zona Station (WCAG AAA Navy #0f172a + Putih)
  const decalTex = makeTextCanvasTexture(
    [{ text: "▲ JALUR ROTASI OSCE ▲", font: "900 34px Inter, sans-serif", color: "#ffffff", y: 64 }],
    { width: 512, height: 128, bg: "#0f172a", border: "#38bdf8" }
  );
  [4.0, -3.5, -11.0].forEach((dz) => {
    const decal = new THREE.Mesh(new THREE.PlaneGeometry(1.05, 0.28), new THREE.MeshBasicMaterial({ map: decalTex }));
    decal.rotation.x = -Math.PI / 2;
    decal.position.set(0, 0.003, dz);
    corridorGroup.add(decal);
  });

  // === PLAFON TEDUH & LAMPU PANEL PLAFON ===
  const ceilGeo = new THREE.PlaneGeometry(7.2, 40);
  const ceilMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.9 });
  const ceiling = new THREE.Mesh(ceilGeo, ceilMat);
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.set(0, 3.8, -4);
  corridorGroup.add(ceiling);

  for (let z = 12; z >= -20; z -= 4.5) {
    const lampFrame = new THREE.Mesh(
      new THREE.BoxGeometry(1.58, 0.04, 0.62),
      new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.7, roughness: 0.25 })
    );
    lampFrame.position.set(0, 3.79, z);
    corridorGroup.add(lampFrame);

    const lampGeo = new THREE.PlaneGeometry(1.5, 0.55);
    const lampMat = new THREE.MeshBasicMaterial({ color: 0xfef3c7 });
    const lamp = new THREE.Mesh(lampGeo, lampMat);
    lamp.rotation.x = Math.PI / 2;
    lamp.position.set(0, 3.765, z);
    corridorGroup.add(lamp);

    const haloGeo = new THREE.PlaneGeometry(2.1, 0.95);
    const haloMat = new THREE.MeshBasicMaterial({ color: 0xfde68a, transparent: true, opacity: 0.18 });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    halo.rotation.x = Math.PI / 2;
    halo.position.set(0, 3.76, z);
    corridorGroup.add(halo);
  }

  // === DINDING NYAMAN DI MATA (WCAG AAA CONTRAST UNTUK JAS SNELLI PUTIH) ===
  // Bagian atas: Warm Architectural Stone (0xd6d1c7 - tidak menyilaukan)
  // Bagian bawah (0..1.08m): Deep Slate Teal (0x164e63) agar jas putih avatar sangat jelas!
  // Catatan: Dinding antara Koridor A (kanan) & Koridor B (kiri) dibuka di z=9.0..12.6 sebagai Jalan Penghubung!
  const wallMat = new THREE.MeshStandardMaterial({ color: 0xd6d1c7, roughness: 0.78 });
  const wainscotMat = new THREE.MeshStandardMaterial({ color: 0x164e63, roughness: 0.55 });

  if (!isSecondary) {
    // Koridor A: dinding kiri utuh, dinding kanan terbuka di z = 9.0..12.6 (menuju Koridor B)
    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.2, 3.8, 40), wallMat);
    leftWall.position.set(-3.6, 1.9, -4);
    corridorGroup.add(leftWall);
    const leftWain = new THREE.Mesh(new THREE.BoxGeometry(0.23, 1.08, 40), wainscotMat);
    leftWain.position.set(-3.57, 0.54, -4);
    corridorGroup.add(leftWain);

    // Dinding kanan Koridor A (z = -24 s/d 9.0) + ambang atas lorong penghubung
    const rightWallMain = new THREE.Mesh(new THREE.BoxGeometry(0.2, 3.8, 33), wallMat);
    rightWallMain.position.set(3.6, 1.9, -7.5);
    corridorGroup.add(rightWallMain);
    const rightWainMain = new THREE.Mesh(new THREE.BoxGeometry(0.23, 1.08, 33), wainscotMat);
    rightWainMain.position.set(3.57, 0.54, -7.5);
    corridorGroup.add(rightWainMain);
  } else {
    // Koridor B: dinding kanan utuh, dinding kiri terbuka di z = 9.0..12.6 (dari Koridor A)
    const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.2, 3.8, 40), wallMat);
    rightWall.position.set(3.6, 1.9, -4);
    corridorGroup.add(rightWall);
    const rightWain = new THREE.Mesh(new THREE.BoxGeometry(0.23, 1.08, 40), wainscotMat);
    rightWain.position.set(3.57, 0.54, -4);
    corridorGroup.add(rightWain);

    const leftWallMain = new THREE.Mesh(new THREE.BoxGeometry(0.2, 3.8, 33), wallMat);
    leftWallMain.position.set(-3.6, 1.9, -7.5);
    corridorGroup.add(leftWallMain);
    const leftWainMain = new THREE.Mesh(new THREE.BoxGeometry(0.23, 1.08, 33), wainscotMat);
    leftWainMain.position.set(-3.57, 0.54, -7.5);
    corridorGroup.add(leftWainMain);
  }

  // Pita aksen atas dinding (Navy Gelap WCAG AAA #0f172a)
  const bandMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 });
  const leftBand = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.55, 40), bandMat);
  leftBand.position.set(-3.55, 3.52, -4);
  corridorGroup.add(leftBand);
  const rightBand = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.55, 40), bandMat);
  rightBand.position.set(3.55, 3.52, -4);
  corridorGroup.add(rightBand);

  // Bangun Selasar / Jalan Penghubung Gedung A <-> Gedung B (hanya sekali dari Koridor A)
  if (!isSecondary) {
    buildConnectingBridge3D(corridorGroup);
  }

  // === GAPURA DEPAN OSCE CENTER ===
  const archTex = makeTextCanvasTexture(
    [
      { text: isSecondary ? "OSCE CENTER — KORIDOR B" : "OSCE CENTER — KORIDOR A", font: "900 56px Inter, sans-serif", color: "#ffffff", y: 78 },
      { text: "UKMPPAI — FAKULTAS FARMASI & KEDOKTERAN", font: "700 26px Inter, sans-serif", color: "#a7f3d0", y: 155 }
    ],
    { width: 1024, height: 240, bg: "#0d4a46" }
  );
  const archMesh = new THREE.Mesh(
    new THREE.BoxGeometry(7.1, 0.65, 0.22),
    new THREE.MeshBasicMaterial({ map: archTex })
  );
  archMesh.position.set(0, 3.5, 7.2);
  corridorGroup.add(archMesh);

  // === DINDING BELAKANG & JAM DIGITAL ===
  const backWall = new THREE.Mesh(new THREE.BoxGeometry(7.4, 3.8, 0.2), wallMat);
  backWall.position.set(0, 1.9, -22);
  corridorGroup.add(backWall);

  if (!clockTexture) {
    clockCanvas = document.createElement("canvas");
    clockCanvas.width = 256;
    clockCanvas.height = 128;
    clockCtx = clockCanvas.getContext("2d");
    clockTexture = new THREE.CanvasTexture(clockCanvas);
    updateCorridorDigitalClock("00:30");
  }

  const clockMesh = new THREE.Mesh(
    new THREE.BoxGeometry(1.7, 0.75, 0.12),
    new THREE.MeshBasicMaterial({ map: clockTexture })
  );
  clockMesh.position.set(0, 2.55, -21.8);
  corridorGroup.add(clockMesh);

  // === 10 STATIONS: 5 di Kanan (01..05) dan 5 di Kiri (10..06) ===
  if (!isSecondary) {
    station3DAnchors.length = 0;
    stationDoorPosterMeshes.length = 0;
  }

  for (let i = 0; i < 10; i++) {
    const isRightSide = i < 5;
    const numStr = String(i + 1).padStart(2, "0");
    const stationData = (typeof getStationData === "function") ? getStationData(isSecondary ? 1 : 0, i) : STATIONS[i];

    const zPos = isRightSide ? 5.2 - i * 4.6 : -13.2 + (i - 5) * 4.6;
    const xWall = isRightSide ? 3.5 : -3.5;
    const xChair = isRightSide ? 2.55 : -2.55;
    const rotY = isRightSide ? -Math.PI / 2 : Math.PI / 2;

    // 1. Plang Atas Pintu (Header Sign) — tegas, besar, mudah dibaca
    const headerTex = makeTextCanvasTexture(
      [{ text: numStr, font: "900 120px Inter, sans-serif", color: "#ffffff", y: 128 }],
      { width: 256, height: 256, bg: "#0d6b63" }
    );
    const headerSign = new THREE.Mesh(
      new THREE.PlaneGeometry(1.9, 0.48),
      new THREE.MeshBasicMaterial({ map: headerTex })
    );
    headerSign.position.set(isRightSide ? 3.42 : -3.42, 3.32, zPos);
    headerSign.rotation.y = rotY;
    corridorGroup.add(headerSign);

    // 2. Kusen & Daun Pintu Ruangan Station (Kayu Walnut Gelap Kontras Tinggi WCAG AAA)
    const doorGroup = new THREE.Group();
    doorGroup.position.set(xWall, 0, zPos);
    doorGroup.rotation.y = rotY;

    const frameMesh = new THREE.Mesh(
      new THREE.BoxGeometry(1.42, 2.45, 0.08),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 })
    );
    frameMesh.position.set(0, 1.225, 0);
    doorGroup.add(frameMesh);

    const doorMat = new THREE.MeshStandardMaterial({ color: 0x6b4423, roughness: 0.45 });
    const doorLeaf = new THREE.Mesh(new THREE.BoxGeometry(1.30, 2.35, 0.05), doorMat);
    doorLeaf.position.set(0, 1.20, 0.02);
    doorGroup.add(doorLeaf);

    const panelMat = new THREE.MeshStandardMaterial({ color: 0x4a2e16, roughness: 0.55 });
    [[0, 1.75], [0, 0.75]].forEach(([px, py]) => {
      const panel = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.42, 0.03), panelMat);
      panel.position.set(px, py, 0.04);
      doorGroup.add(panel);
    });

    const glassMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.38, 0.52, 0.06),
      new THREE.MeshStandardMaterial({ color: 0xbae6fd, transparent: true, opacity: 0.65 })
    );
    glassMesh.position.set(0, 1.55, 0.02);
    doorGroup.add(glassMesh);

    const handleMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, metalness: 0.9, roughness: 0.15 });
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.12, 8), handleMat);
    handle.rotation.x = Math.PI / 2;
    handle.position.set(isRightSide ? -0.52 : 0.52, 1.1, 0.045);
    doorGroup.add(handle);

    // LAMPU BULAT INDIKATOR PINTU BESAR + HALO CAHAYA HIJAU/MERAH
    const lampFixtureBase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.13, 0.13, 0.04, 18),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.85, roughness: 0.2 })
    );
    lampFixtureBase.rotation.x = Math.PI / 2;
    lampFixtureBase.position.set(0, 2.62, 0.05);
    doorGroup.add(lampFixtureBase);

    const lampDomeMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    const lampDome = new THREE.Mesh(new THREE.SphereGeometry(0.105, 18, 18), lampDomeMat);
    lampDome.position.set(0, 2.62, 0.10);
    doorGroup.add(lampDome);

    // Efek Pancaran Cahaya (Glowing Halo Sphere) di sekeliling lampu pintu
    const lampHaloMat = new THREE.MeshBasicMaterial({ color: 0xf87171, transparent: true, opacity: 0.38 });
    const lampHalo = new THREE.Mesh(new THREE.SphereGeometry(0.24, 16, 16), lampHaloMat);
    lampHalo.position.set(0, 2.62, 0.10);
    doorGroup.add(lampHalo);

    stationDoorLamps.push({
      stationIndex: i,
      material: lampDomeMat,
      haloMat: lampHaloMat
    });

    corridorGroup.add(doorGroup);

    // 3. Papan Petunjuk Peserta Akrilik (Acrylic Nameplate + Baut Standoff Logam)
    const posterTex = createDoorPosterTexture(stationData);
    const posterZ = zPos + 1.30;
    const acrylicBack = new THREE.Mesh(
      new THREE.BoxGeometry(0.82, 1.10, 0.018),
      new THREE.MeshStandardMaterial({ color: 0xe0f2fe, transparent: true, opacity: 0.55, roughness: 0.08, metalness: 0.2 })
    );
    acrylicBack.position.set(isRightSide ? 3.45 : -3.45, 1.72, posterZ);
    acrylicBack.rotation.y = rotY;
    corridorGroup.add(acrylicBack);

    const posterMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(0.76, 1.04),
      new THREE.MeshBasicMaterial({ map: posterTex })
    );
    posterMesh.position.set(isRightSide ? 3.438 : -3.438, 1.72, posterZ);
    posterMesh.rotation.y = rotY;
    corridorGroup.add(posterMesh);
    (isSecondary ? stationDoorPosterMeshesAlt : stationDoorPosterMeshes).push(posterMesh);

    // Dekal Lantai Nomor Station di depan Pintu
    const stDecalTex = makeTextCanvasTexture(
      [{ text: `ST-${numStr}`, font: "900 48px Inter, sans-serif", color: "#ffffff", y: 64 }],
      { width: 256, height: 128, bg: "#0f766e", border: "#5eead4" }
    );
    const stDecal = new THREE.Mesh(new THREE.PlaneGeometry(0.75, 0.36), new THREE.MeshBasicMaterial({ map: stDecalTex }));
    stDecal.rotation.x = -Math.PI / 2;
    stDecal.rotation.z = isRightSide ? -Math.PI / 2 : Math.PI / 2;
    stDecal.position.set(isRightSide ? 2.85 : -2.85, 0.003, zPos);
    corridorGroup.add(stDecal);

    // 4. Kursi Tunggu Klinik — warna biru royal nyaman
    const chairGroup = new THREE.Group();
    const chairZ = zPos + 1.25;
    chairGroup.position.set(xChair, 0, chairZ);
    chairGroup.rotation.y = rotY;

    const chairBlueMat = new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.4 });
    const chairLegMat = new THREE.MeshStandardMaterial({ color: 0x374151, roughness: 0.5, metalness: 0.3 });

    // Bantalan Dudukan (Seat)
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.08, 0.52), chairBlueMat);
    seat.position.set(0, 0.46, 0);
    chairGroup.add(seat);

    // Sandaran (Backrest)
    const backrest = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.54, 0.08), chairBlueMat);
    backrest.position.set(0, 0.76, -0.22);
    chairGroup.add(backrest);

    // 4 Kaki Kursi Logam
    [[-0.25, -0.21], [0.25, -0.21], [-0.25, 0.21], [0.25, 0.21]].forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.46), chairLegMat);
      leg.position.set(lx, 0.23, lz);
      chairGroup.add(leg);
    });

    corridorGroup.add(chairGroup);

    // Simpan Anchor 3D
    if (!isSecondary) station3DAnchors.push({
      stationIndex: i,
      isRightSide,
      xChair,
      chairZ,
      chairPos: new THREE.Vector3(xChair, 1.25, chairZ),
      chairSeatPos: new THREE.Vector3(xChair, 0, chairZ),
      doorPos: new THREE.Vector3(xWall, 1.65, zPos),
      standPos: new THREE.Vector3(
        isRightSide ? 1.35 : -1.35,
        1.65,
        chairZ + 0.55
      ),
      standYaw: isRightSide ? -Math.PI / 2.6 : Math.PI / 2.6
    });
  }
}

// =========================================================================
// JALAN / SELASAR PENGHUBUNG FISIK ANTARA GEDUNG/KORIDOR A <-> GEDUNG/KORIDOR B
// Pemain dapat berjalan kaki langsung dari Koridor A (x=0) ke Koridor B (x=11.5)
// pada area z = 9.0 s/d 12.6
// =========================================================================
function buildConnectingBridge3D(corridorGroup) {
  const bridgeGroup = new THREE.Group();
  const bridgeCenterX = WING_DX / 2; // 5.75
  const bridgeWidthX = WING_DX - 7.0; // 4.5m antara bibir dinding Koridor A (3.5) dan Koridor B (8.0)

  // Lantai ubin keramik selasar penghubung
  const bridgeFloor = new THREE.Mesh(
    new THREE.PlaneGeometry(bridgeWidthX + 0.6, 3.8),
    new THREE.MeshStandardMaterial({
      map: createRealisticTileFloorTexture(8, 6),
      color: 0xffffff,
      roughness: 0.25,
      metalness: 0.08
    })
  );
  bridgeFloor.rotation.x = -Math.PI / 2;
  bridgeFloor.position.set(bridgeCenterX, 0.001, 10.8);
  bridgeGroup.add(bridgeFloor);

  // Plafon selasar penghubung
  const bridgeCeil = new THREE.Mesh(
    new THREE.PlaneGeometry(bridgeWidthX + 0.6, 3.8),
    new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.9 })
  );
  bridgeCeil.rotation.x = Math.PI / 2;
  bridgeCeil.position.set(bridgeCenterX, 3.8, 10.8);
  bridgeGroup.add(bridgeCeil);

  // Dinding Utara & Selatan selasar penghubung (dengan wainscot gelap WCAG AAA)
  const wallMat = new THREE.MeshStandardMaterial({ color: 0xd6d1c7, roughness: 0.78 });
  const wainMat = new THREE.MeshStandardMaterial({ color: 0x164e63, roughness: 0.55 });
  [8.9, 12.7].forEach((bz) => {
    const bw = new THREE.Mesh(new THREE.BoxGeometry(bridgeWidthX + 0.4, 3.8, 0.2), wallMat);
    bw.position.set(bridgeCenterX, 1.9, bz);
    bridgeGroup.add(bw);
    const wn = new THREE.Mesh(new THREE.BoxGeometry(bridgeWidthX + 0.4, 1.08, 0.23), wainMat);
    wn.position.set(bridgeCenterX, 0.54, bz);
    bridgeGroup.add(wn);
  });

  // Plang Penunjuk Jalan Gedung A <-> Gedung B (Kontras AAA #0f172a + Putih/Emas)
  const signTex = makeTextCanvasTexture(
    [
      { text: "◀ GEDUNG / KORIDOR A          GEDUNG / KORIDOR B ▶", font: "900 32px Inter, sans-serif", color: "#ffffff", y: 50 },
      { text: "JALAN PENGHUBUNG ANTAR KORIDOR OSCE", font: "700 22px Inter, sans-serif", color: "#fde047", y: 98 }
    ],
    { width: 1024, height: 140, bg: "#0f172a", border: "#38bdf8" }
  );
  const signMesh = new THREE.Mesh(
    new THREE.BoxGeometry(4.0, 0.48, 0.14),
    new THREE.MeshBasicMaterial({ map: signTex })
  );
  signMesh.position.set(bridgeCenterX, 3.15, 10.8);
  bridgeGroup.add(signMesh);

  // Dekal Lantai Selasar Penghubung
  const floorDecal = new THREE.Mesh(
    new THREE.PlaneGeometry(3.4, 0.55),
    new THREE.MeshBasicMaterial({ map: signTex })
  );
  floorDecal.rotation.x = -Math.PI / 2;
  floorDecal.position.set(bridgeCenterX, 0.004, 10.8);
  bridgeGroup.add(floorDecal);

  // Barrier Pembatas Fisik & Visual (Mahasiswa Dilarang Menyeberang - Khusus Dosen/Pengawas)
  const barrierMat = new THREE.MeshStandardMaterial({ color: 0xef4444, metalness: 0.6, roughness: 0.3 });
  const gateSignTex = makeTextCanvasTexture(
    [{ text: "⛔ PEMBATAS KORIDOR: MAHASISWA DILARANG MELINTAS ⛔", font: "900 24px Inter, sans-serif", color: "#fef08a", y: 44 }],
    { width: 512, height: 80, bg: "#7f1d1d", border: "#f87171" }
  );
  [3.52, 7.98].forEach((gx) => {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.3), barrierMat);
    post.position.set(gx, 0.65, 10.8);
    bridgeGroup.add(post);
    const gateSign = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.32), new THREE.MeshBasicMaterial({ map: gateSignTex, side: THREE.DoubleSide }));
    gateSign.position.set(gx, 1.45, 10.8);
    gateSign.rotation.y = Math.PI / 2;
    bridgeGroup.add(gateSign);
  });

  // =========================================================================
  // LOGO JAKARTA GLOBAL UNIVERSITY (JGU) — Dinding Utara & Selatan Selasar
  // Embedded base64 PNG → bekerja di file:// maupun http:// tanpa server
  // Background putih dihapus via pixel-loop canvas → hanya logo + teks
  // =========================================================================
  (function placeJGULogo() {
    const logoSrc = (typeof JGU_LOGO_B64 !== "undefined") ? JGU_LOGO_B64 : null;
    if (!logoSrc) {
      console.warn("JGU_LOGO_B64 tidak ditemukan. Tambahkan <script src='js/jgu-logo.js'> di blueprint.html");
      return;
    }

    const geo = new THREE.PlaneGeometry(2.8, 1.08);

    // Placeholder transparan — akan diganti saat gambar ter-load
    const matN = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 });
    const matS = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 });

    // Dinding UTARA (z≈9.1) — menghadap ke selatan / ke dalam selasar
    const meshN = new THREE.Mesh(geo, matN);
    meshN.position.set(bridgeCenterX, 2.2, 9.14);
    meshN.rotation.y = Math.PI;
    bridgeGroup.add(meshN);

    // Dinding SELATAN (z≈12.5) — menghadap ke utara / ke dalam selasar
    const meshS = new THREE.Mesh(geo, matS);
    meshS.position.set(bridgeCenterX, 2.2, 12.46);
    meshS.rotation.y = 0;
    bridgeGroup.add(meshS);

    const img = new Image();
    img.onload = function () {
      try {
        const W = 640, H = 246;
        const cv = document.createElement("canvas");
        cv.width = W; cv.height = H;
        const cx = cv.getContext("2d");
        cx.clearRect(0, 0, W, H);
        cx.drawImage(img, 0, 0, W, H);

        // Hapus background putih/terang → transparan
        const id = cx.getImageData(0, 0, W, H);
        const px = id.data;
        for (let k = 0; k < px.length; k += 4) {
          if (px[k] > 230 && px[k + 1] > 230 && px[k + 2] > 230) px[k + 3] = 0;
        }
        cx.putImageData(id, 0, 0);

        const tex = new THREE.CanvasTexture(cv);
        tex.needsUpdate = true;

        // Tekstur SELATAN (normal, tidak di-flip)
        const matS = new THREE.MeshBasicMaterial({
          map: tex,
          transparent: true,
          alphaTest: 0.04,
          side: THREE.DoubleSide,
          depthWrite: false
        });
        meshS.material = matS;

        // Tekstur UTARA: clone + flip horizontal (repeat.x = -1, offset.x = 1)
        // karena rotation.y = Math.PI membalik arah U texture
        const texFlipped = tex.clone();
        texFlipped.wrapS = THREE.RepeatWrapping;
        texFlipped.repeat.set(-1, 1);
        texFlipped.offset.set(1, 0);
        texFlipped.needsUpdate = true;
        const matN = new THREE.MeshBasicMaterial({
          map: texFlipped,
          transparent: true,
          alphaTest: 0.04,
          side: THREE.DoubleSide,
          depthWrite: false
        });
        meshN.material = matN;
      } catch (e) { console.warn("JGU logo render error:", e); }
    };
    img.onerror = function () { console.warn("Gagal load logo JGU."); };
    img.src = logoSrc;
  })();

  corridorGroup.add(bridgeGroup);
}

// Update jam digital lorong
function updateCorridorDigitalClock(timeStr) {
  if (!clockCtx) return;
  clockCtx.fillStyle = "#090d16";
  clockCtx.fillRect(0, 0, 256, 128);
  clockCtx.strokeStyle = "#38bdf8";
  clockCtx.lineWidth = 6;
  clockCtx.strokeRect(3, 3, 250, 122);
  clockCtx.fillStyle = "#fde047";
  clockCtx.font = "900 62px Inter, monospace";
  clockCtx.textAlign = "center";
  clockCtx.textBaseline = "middle";
  clockCtx.fillText(timeStr, 128, 66);
  if (clockTexture) clockTexture.needsUpdate = true;
}

// =========================================================================
// BUILD 3D INTERIOR STATION ROOM (APOTEK / LAB / KONSELING)
// Palet WCAG AAA Nyaman di Mata & Lantai Ubin Keramik Realistis
// =========================================================================
function buildRoom3D(roomGroup) {
  // Lantai ubin keramik ruang ujian (60x60cm realistis)
  const roomFloor = new THREE.Mesh(
    new THREE.PlaneGeometry(7, 7),
    new THREE.MeshStandardMaterial({
      map: createRealisticTileFloorTexture(11, 11),
      color: 0xffffff,
      roughness: 0.26,
      metalness: 0.08
    })
  );
  roomFloor.rotation.x = -Math.PI / 2;
  roomGroup.add(roomFloor);

  // Dinding ruang pemeriksaan (warm stone-beige + wainscot biru gelap kontras AAA)
  const wallMat = new THREE.MeshStandardMaterial({ color: 0xd6d1c7, roughness: 0.75 });
  const backW = new THREE.Mesh(new THREE.BoxGeometry(7, 3.6, 0.2), wallMat);
  backW.position.set(0, 1.8, -3.5);
  roomGroup.add(backW);

  const frontW = new THREE.Mesh(new THREE.BoxGeometry(7, 3.6, 0.2), wallMat);
  frontW.position.set(0, 1.8, 3.5);
  roomGroup.add(frontW);

  const leftW = new THREE.Mesh(new THREE.BoxGeometry(0.2, 3.6, 7), wallMat);
  leftW.position.set(-3.5, 1.8, 0);
  roomGroup.add(leftW);

  const rightW = new THREE.Mesh(new THREE.BoxGeometry(0.2, 3.6, 7), wallMat);
  rightW.position.set(3.5, 1.8, 0);
  roomGroup.add(rightW);

  // Plafon teduh
  const roomCeil = new THREE.Mesh(
    new THREE.PlaneGeometry(7, 7),
    new THREE.MeshBasicMaterial({ color: 0xe2e8f0 })
  );
  roomCeil.rotation.x = Math.PI / 2;
  roomCeil.position.set(0, 3.6, 0);
  roomGroup.add(roomCeil);

  // Wainscot bawah dinding gelap (0x164e63) agar jas putih penguji & kandidat kontras jelas
  const dadoMat = new THREE.MeshStandardMaterial({ color: 0x164e63, roughness: 0.55 });
  [
    [-3.42, 0.52, 0, 0.14, 1.04, 7],
    [3.42, 0.52, 0, 0.14, 1.04, 7],
    [0, 0.52, -3.42, 7, 1.04, 0.14],
  ].forEach(([x, y, z, w, h, d]) => {
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), dadoMat);
    stripe.position.set(x, y, z);
    roomGroup.add(stripe);
  });

  // Banner nama ruangan di atas (teal medis)
  const bannerMesh = new THREE.Mesh(
    new THREE.BoxGeometry(4.6, 0.52, 0.08),
    new THREE.MeshStandardMaterial({ color: 0x0d6b63 })
  );
  bannerMesh.position.set(0, 2.9, -3.38);
  roomGroup.add(bannerMesh);

  // Meja Konsultasi / Kerja Farmasi (kayu coklat gelap hangat)
  const deskMesh = new THREE.Mesh(
    new THREE.BoxGeometry(2.3, 0.78, 1.05),
    new THREE.MeshStandardMaterial({ color: 0x5c3d2e, roughness: 0.5 })
  );
  deskMesh.position.set(0, 0.39, -1.35);
  roomGroup.add(deskMesh);

  // Permukaan meja (kayu lebih terang)
  const deskTop = new THREE.Mesh(
    new THREE.BoxGeometry(2.34, 0.04, 1.08),
    new THREE.MeshStandardMaterial({ color: 0x7c5c40, roughness: 0.4 })
  );
  deskTop.position.set(0, 0.79, -1.35);
  roomGroup.add(deskTop);

  // Monitor PC di meja (monitor hitam modern)
  const monitorStand = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.07, 0.3, 10),
    new THREE.MeshStandardMaterial({ color: 0x1a1a1a })
  );
  monitorStand.position.set(0.55, 0.94, -1.2);
  roomGroup.add(monitorStand);

  const monitorMesh = new THREE.Mesh(
    new THREE.BoxGeometry(0.6, 0.38, 0.045),
    new THREE.MeshStandardMaterial({ color: 0x111111 })
  );
  monitorMesh.position.set(0.55, 1.1, -1.22);
  monitorMesh.rotation.y = -0.2;
  roomGroup.add(monitorMesh);

  // Layar monitor (glow biru teal)
  const screenMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(0.52, 0.32),
    new THREE.MeshBasicMaterial({ color: 0x0ea5e9 })
  );
  screenMesh.position.set(0.55, 1.1, -1.198);
  screenMesh.rotation.y = -0.2;
  roomGroup.add(screenMesh);

  // Rak Obat / Alat Lab di kiri (kayu natural)
  const shelfMesh = new THREE.Mesh(
    new THREE.BoxGeometry(1.1, 1.85, 0.42),
    new THREE.MeshStandardMaterial({ color: 0x8b7355, roughness: 0.5 })
  );
  shelfMesh.position.set(-2.3, 0.92, -1.9);
  roomGroup.add(shelfMesh);

  // Papan rak
  [0.55, 0.0, -0.55].forEach(ry => {
    const shelf = new THREE.Mesh(
      new THREE.BoxGeometry(1.08, 0.025, 0.4),
      new THREE.MeshStandardMaterial({ color: 0x6b5744, roughness: 0.5 })
    );
    shelf.position.set(-2.3, 0.92 + ry, -1.9);
    roomGroup.add(shelf);
  });

  // Meja Instrumen Laboratorium & Peralatan 3D Spesifik per Station (glTF/PBR)
  const labBench = new THREE.Mesh(
    new THREE.BoxGeometry(1.05, 0.80, 0.68),
    new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.25, metalness: 0.15 })
  );
  labBench.position.set(-1.75, 0.40, -1.2);
  roomGroup.add(labBench);

  const labBenchTop = new THREE.Mesh(
    new THREE.BoxGeometry(1.10, 0.04, 0.72),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.2, metalness: 0.3 })
  );
  labBenchTop.position.set(-1.75, 0.81, -1.2);
  roomGroup.add(labBenchTop);

  labHighlightMesh = new THREE.Group();
  labHighlightMesh.position.set(-1.75, 0.83, -1.2);
  roomGroup.add(labHighlightMesh);
  if (typeof updateRoomStationEquipment === "function") {
    updateRoomStationEquipment(0);
  }

  // AVATAR REALISTIS DI DALAM RUANGAN (ASESOR / DOKTER PENGUJI LENGKAP DENGAN JARI & JAS)
  const roomAvatar = createDetailedHumanoidAvatar({
    name: "apt. Hendra Wijaya, M.Farm.",
    nim: "NIDN: 0412088501",
    gender: "male",
    role: "assessor",
    isLocal: false,
    coatColor: 0xffffff,
    pantsColor: 0x1e293b,
    hairColor: 0x1e1b18
  });
  roomAvatar.root.position.set(-0.25, 0, -2.25);
  roomAvatar.root.rotation.y = 0;
  roomAvatar.isSeated = true;
  roomAvatar.updateAnimation(false, true, 0.016);

  // Kursi kantor ergonomis hitam beroda di belakang meja
  const officeChair = new THREE.Group();
  officeChair.position.set(-0.25, 0, -2.28);
  const chairBase = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.44, 10), new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 }));
  chairBase.position.y = 0.22;
  officeChair.add(chairBase);
  const chairSeat = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.08, 0.52), new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 }));
  chairSeat.position.y = 0.46;
  officeChair.add(chairSeat);
  const chairBack = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.62, 0.08), new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 }));
  chairBack.position.set(0, 0.78, -0.24);
  officeChair.add(chairBack);
  roomGroup.add(officeChair);

  npcMeshGroup = roomAvatar.root;
  roomAvatarNpc = roomAvatar;
  roomGroup.add(npcMeshGroup);
}

