// =========================================================================
// 3D STATION EQUIPMENT MODELS (PBR & GLTF/DRACO READY) + AMBIENT AUDIO
// Fitur:
// 1. Model 3D Peralatan Spesifik per Station (menggantikan geometri primitif):
//    - Station 1: Botol Emulsi & Timbangan Analitik Digital (Analytical Balance)
//    - Station 2: Mesin Tablet Rotary (Rotary Tablet Press dengan Turret Berputar)
//    - Station 3: Sistem HPLC + Monitor Kromatogram yang Hidup (Real-Time)
//    - Station 5: Kulkas Vaksin Pintu Kaca + Display Suhu LED Digital
//    - Station 8: Lumpang-Alu Porselen (Mortar & Pestle) & Timbangan Puyer
//    - Station 9: Insulin Pen (FlexPen) Presisi Tinggi & Form Kuning MESO
// 2. HDRI Lingkungan Prosedural (PBR Studio Reflection)
// 3. Suara Ambient Klinik (AC/HVAC, Langkah Kaki, Pintu Buka/Tutup)
// =========================================================================

let stationEquipmentGroup = null;
let rotaryTurretMesh = null;
let hplcCanvas = null, hplcCtx = null, hplcTex = null;
let fridgeTempCanvas = null, fridgeTempCtx = null, fridgeTempTex = null;
let equipAnimTime = 0;

// Buat tekstur HDRI Equirectangular Prosedural untuk pantulan PBR realistis
function createProceduralHDRIEnvironment(renderer) {
  try {
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 256;
    const ctx = c.getContext("2d");

    // Gradasi langit-langit klinik terang ke lantai vinyl lembut
    const grad = ctx.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0.0, "#ffffff");
    grad.addColorStop(0.25, "#e0f2fe");
    grad.addColorStop(0.5, "#f1f5f9");
    grad.addColorStop(0.75, "#cbd5e1");
    grad.addColorStop(1.0, "#94a3b8");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 256);

    // Strip lampu panel plafon untuk specular highlight PBR
    ctx.fillStyle = "#fffbeb";
    for (let x = 32; x < 512; x += 96) {
      ctx.fillRect(x, 24, 52, 22);
    }

    const envTex = new THREE.CanvasTexture(c);
    envTex.mapping = THREE.EquirectangularReflectionMapping;
    if (THREE.PMREMGenerator && renderer) {
      const pmrem = new THREE.PMREMGenerator(renderer);
      const target = pmrem.fromEquirectangular(envTex);
      pmrem.dispose();
      return target.texture;
    }
    return envTex;
  } catch (e) {
    return null;
  }
}

// Helper teks LCD digital untuk alat lab (timbangan / kulkas / HPLC)
function makeLCDTexture(text, bg = "#064e3b", fg = "#34d399", sub = "") {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 96;
  const ctx = c.getContext("2d");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 256, 96);
  ctx.strokeStyle = "#334155";
  ctx.lineWidth = 6;
  ctx.strokeRect(3, 3, 250, 90);
  ctx.fillStyle = fg;
  ctx.font = "900 40px monospace";
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  ctx.fillText(text, 236, sub ? 40 : 48);
  if (sub) {
    ctx.font = "700 16px Inter, sans-serif";
    ctx.fillStyle = "#a7f3d0";
    ctx.fillText(sub, 236, 74);
  }
  const t = new THREE.CanvasTexture(c);
  t.needsUpdate = true;
  return t;
}

// =========================================================================
// STATION 1: BOTOL EMULSI & TIMBANGAN ANALITIK DIGITAL (ANALYTICAL BALANCE)
// =========================================================================
function buildStation1Equipment() {
  const g = new THREE.Group();
  const metalMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.75, roughness: 0.22 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.3, roughness: 0.5 });
  const glassMat = new THREE.MeshStandardMaterial({ color: 0xe0f2fe, transparent: true, opacity: 0.32, roughness: 0.08, metalness: 0.1 });

  // 1. Timbangan Analitik Presisi (Analytical Balance dengan Kaca Pelindung)
  const balGroup = new THREE.Group();
  balGroup.position.set(-0.22, 0, 0);

  const base = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.08, 0.36), darkMat);
  base.position.y = 0.04;
  balGroup.add(base);

  // Layar LCD Timbangan Analitik (menampilkan 3.6000 g Tween 80)
  const lcdMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(0.20, 0.055),
    new THREE.MeshBasicMaterial({ map: makeLCDTexture("3.6000 g", "#022c22", "#4ade80", "TWEEN 80 • TARE OK") })
  );
  lcdMesh.position.set(0, 0.048, 0.182);
  lcdMesh.rotation.x = -0.25;
  balGroup.add(lcdMesh);

  // Piringan Timbang Stainless (Weighing Pan)
  const panStem = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.05, 16), metalMat);
  panStem.position.set(0, 0.10, -0.02);
  balGroup.add(panStem);
  const pan = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.01, 24), metalMat);
  pan.position.set(0, 0.125, -0.02);
  balGroup.add(pan);

  // Ruang Kaca Pelindung Angin (Draft Shield)
  const shield = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.26, 0.26), glassMat);
  shield.position.set(0, 0.21, -0.02);
  balGroup.add(shield);
  const topCap = new THREE.Mesh(new THREE.BoxGeometry(0.29, 0.02, 0.27), metalMat);
  topCap.position.set(0, 0.345, -0.02);
  balGroup.add(topCap);
  g.add(balGroup);

  // 2. Botol Emulsi Minyak Ikan + Botol Surfaktan Span 80 & Tween 80
  const bottles = [
    { x: 0.14, z: 0.04, r: 0.052, h: 0.24, col: 0xfef08a, cap: 0x0f766e, lbl: "EMULSI\nO/W 30%" },
    { x: 0.28, z: -0.04, r: 0.042, h: 0.19, col: 0xd97706, cap: 0x1e293b, lbl: "SPAN 80\nHLB 4.3" },
    { x: 0.02, z: -0.08, r: 0.042, h: 0.19, col: 0xf59e0b, cap: 0x1e293b, lbl: "TWEEN 80\nHLB 15" }
  ];
  bottles.forEach((b) => {
    const bGrp = new THREE.Group();
    bGrp.position.set(b.x, 0, b.z);
    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(b.r, b.r, b.h, 20),
      new THREE.MeshStandardMaterial({ color: b.col, roughness: 0.2, metalness: 0.05, transparent: true, opacity: 0.9 })
    );
    body.position.y = b.h / 2;
    bGrp.add(body);
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(b.r * 0.45, b.r * 0.55, 0.04, 16), body.material);
    neck.position.y = b.h + 0.02;
    bGrp.add(neck);
    const cap = new THREE.Mesh(
      new THREE.CylinderGeometry(b.r * 0.5, b.r * 0.5, 0.035, 16),
      new THREE.MeshStandardMaterial({ color: b.cap, roughness: 0.4 })
    );
    cap.position.y = b.h + 0.05;
    bGrp.add(cap);
    g.add(bGrp);
  });

  return g;
}

// =========================================================================
// STATION 2: MESIN TABLET ROTARY (ROTARY TABLET PRESS MACHINE)
// =========================================================================
function buildStation2Equipment() {
  const g = new THREE.Group();
  const steelMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.85, roughness: 0.2 });
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x0f766e, metalness: 0.4, roughness: 0.35 });
  const glassMat = new THREE.MeshStandardMaterial({ color: 0xbae6fd, transparent: true, opacity: 0.35, roughness: 0.1 });

  // Kabinet Bawah Mesin Rotary
  const lowerCab = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.22, 0.42), frameMat);
  lowerCab.position.y = 0.11;
  g.add(lowerCab);

  // Ruang Kompresi Berpelindung Akrilik (Turret Guard)
  const guard = new THREE.Mesh(new THREE.CylinderGeometry(0.20, 0.20, 0.26, 20), glassMat);
  guard.position.y = 0.35;
  g.add(guard);

  // Turret Rotary & 8 Stasiun Punch (Berputar di animate())
  rotaryTurretMesh = new THREE.Group();
  rotaryTurretMesh.position.y = 0.34;
  const dieTable = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.04, 24), steelMat);
  rotaryTurretMesh.add(dieTable);

  for (let i = 0; i < 8; i++) {
    const ang = (i / 8) * Math.PI * 2;
    const punch = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.14, 10), steelMat);
    punch.position.set(Math.cos(ang) * 0.11, 0.05, Math.sin(ang) * 0.11);
    rotaryTurretMesh.add(punch);
  }
  g.add(rotaryTurretMesh);

  // Hopper Kerucut Stainless di Atas
  const hopper = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.22, 20, 1, true), steelMat);
  hopper.rotation.x = Math.PI;
  hopper.position.set(-0.06, 0.58, 0);
  g.add(hopper);

  // Chute Keluar Tablet + Cawan Tablet Putih
  const chute = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.02, 0.08), steelMat);
  chute.position.set(0.24, 0.22, 0.08);
  chute.rotation.z = -0.35;
  g.add(chute);

  return g;
}

// =========================================================================
// STATION 3: SISTEM HPLC DENGAN MONITOR KROMATOGRAM YANG HIDUP
// =========================================================================
function buildStation3Equipment() {
  const g = new THREE.Group();
  const hplcBodyMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.3, metalness: 0.15 });
  const accentMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4, metalness: 0.5 });

  // Tumpukan 4 Modul HPLC (Solvent Tray, Pump, Autosampler, UV Detector)
  const modules = [
    { y: 0.045, h: 0.08, label: "QUATERNARY PUMP • 1.0 mL/min" },
    { y: 0.135, h: 0.08, label: "AUTOSAMPLER • 20 uL INJ" },
    { y: 0.225, h: 0.08, label: "COLUMN COMPARTMENT • 30.0 C" },
    { y: 0.315, h: 0.08, label: "UV-VIS DETECTOR • 254 nm" }
  ];
  modules.forEach((m) => {
    const mod = new THREE.Mesh(new THREE.BoxGeometry(0.32, m.h, 0.32), hplcBodyMat);
    mod.position.set(-0.18, m.y, 0);
    g.add(mod);
    const frontPanel = new THREE.Mesh(new THREE.BoxGeometry(0.30, m.h * 0.55, 0.015), accentMat);
    frontPanel.position.set(-0.18, m.y, 0.16);
    g.add(frontPanel);
  });

  // Botol Eluen Fase Gerak di atas Tray HPLC
  [-0.25, -0.11].forEach((bx, idx) => {
    const bottle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 0.14, 16),
      new THREE.MeshStandardMaterial({ color: idx === 0 ? 0x92400e : 0xbae6fd, transparent: true, opacity: 0.8, roughness: 0.15 })
    );
    bottle.position.set(bx, 0.43, 0);
    g.add(bottle);
  });

  // Monitor Kromatogram Hidup di sebelah kanan HPLC
  if (!hplcCanvas) {
    hplcCanvas = document.createElement("canvas");
    hplcCanvas.width = 320;
    hplcCanvas.height = 200;
    hplcCtx = hplcCanvas.getContext("2d");
    hplcTex = new THREE.CanvasTexture(hplcCanvas);
  }
  const monStand = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.05, 0.12, 12), accentMat);
  monStand.position.set(0.22, 0.06, 0.04);
  g.add(monStand);
  const monFrame = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.25, 0.03), accentMat);
  monFrame.position.set(0.22, 0.21, 0.04);
  monFrame.rotation.y = -0.18;
  g.add(monFrame);
  const monScreen = new THREE.Mesh(
    new THREE.PlaneGeometry(0.35, 0.22),
    new THREE.MeshBasicMaterial({ map: hplcTex })
  );
  monScreen.position.set(0.22, 0.21, 0.058);
  monScreen.rotation.y = -0.18;
  g.add(monScreen);

  drawLiveHPLCChromatogram(0);
  return g;
}

function drawLiveHPLCChromatogram(t) {
  if (!hplcCtx || !hplcTex) return;
  const ctx = hplcCtx;
  ctx.fillStyle = "#090d16";
  ctx.fillRect(0, 0, 320, 200);

  // Grid kromatogram
  ctx.strokeStyle = "#1e293b";
  ctx.lineWidth = 1;
  for (let x = 30; x < 310; x += 35) { ctx.beginPath(); ctx.moveTo(x, 20); ctx.lineTo(x, 170); ctx.stroke(); }
  for (let y = 30; y < 175; y += 28) { ctx.beginPath(); ctx.moveTo(30, y); ctx.lineTo(310, y); ctx.stroke(); }

  // Header
  ctx.fillStyle = "#38bdf8";
  ctx.font = "bold 11px monospace";
  ctx.fillText("HPLC CHROMATOGRAM • AMOXICILLIN 254nm", 34, 16);

  // Kurva Elusi (Solvent Front + Impurity kecil + Puncak Utama Amoksisilin tR = 4.82m)
  const scanX = 40 + ((t * 45) % 265);
  ctx.strokeStyle = "#10b981";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  for (let x = 32; x <= Math.min(305, scanX); x++) {
    const norm = (x - 32) / 270;
    const solvent = Math.exp(-Math.pow((norm - 0.12) / 0.02, 2)) * 22;
    const imp = Math.exp(-Math.pow((norm - 0.34) / 0.025, 2)) * 14;
    const mainPeak = Math.exp(-Math.pow((norm - 0.62) / 0.042, 2)) * 118;
    const y = 162 - (solvent + imp + mainPeak);
    if (x === 32) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.stroke();

  // Label Puncak Utama
  ctx.fillStyle = "#fbbf24";
  ctx.font = "bold 11px monospace";
  ctx.fillText("tR=4.82m | AUC: 845,210", 145, 38);
  ctx.fillStyle = "#94a3b8";
  ctx.fillText("Kadar: 102.5% (PASS)", 145, 52);

  hplcTex.needsUpdate = true;
}

// =========================================================================
// STATION 5: KULKAS VAKSIN PINTU KACA DENGAN DISPLAY SUHU DIGITAL
// =========================================================================
function buildStation5Equipment() {
  const g = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3, metalness: 0.2 });
  const headerMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.35 });
  const glassMat = new THREE.MeshStandardMaterial({ color: 0xbae6fd, transparent: true, opacity: 0.38, roughness: 0.08 });

  // Badan Kulkas Vaksin Medis
  const cab = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.62, 0.36), bodyMat);
  cab.position.set(-0.1, 0.31, 0);
  g.add(cab);

  // Panel Kontrol Atas + Display Suhu LED
  const topPanel = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.10, 0.37), headerMat);
  topPanel.position.set(-0.1, 0.65, 0);
  g.add(topPanel);

  if (!fridgeTempCanvas) {
    fridgeTempCanvas = document.createElement("canvas");
    fridgeTempCanvas.width = 256;
    fridgeTempCanvas.height = 80;
    fridgeTempCtx = fridgeTempCanvas.getContext("2d");
    fridgeTempTex = new THREE.CanvasTexture(fridgeTempCanvas);
  }
  const tempScreen = new THREE.Mesh(
    new THREE.PlaneGeometry(0.26, 0.075),
    new THREE.MeshBasicMaterial({ map: fridgeTempTex })
  );
  tempScreen.position.set(-0.1, 0.65, 0.188);
  g.add(tempScreen);

  // Pintu Kaca Kulkas + Rak Vaksin
  const glassDoor = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.52, 0.02), glassMat);
  glassDoor.position.set(-0.1, 0.31, 0.185);
  g.add(glassDoor);

  // Kotak Karantina Merah (VVM Tahap 3 & High Alert KCl 7.46%)
  const redBox = new THREE.Mesh(
    new THREE.BoxGeometry(0.24, 0.14, 0.22),
    new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.4 })
  );
  redBox.position.set(0.28, 0.07, 0.04);
  g.add(redBox);

  updateFridgeTemperatureDisplay(0);
  return g;
}

function updateFridgeTemperatureDisplay(t) {
  if (!fridgeTempCtx || !fridgeTempTex) return;
  const ctx = fridgeTempCtx;
  ctx.fillStyle = "#0f172a";
  ctx.fillRect(0, 0, 256, 80);
  ctx.strokeStyle = "#38bdf8";
  ctx.lineWidth = 4;
  ctx.strokeRect(2, 2, 252, 76);
  const tempVal = (2.4 + Math.sin(t * 0.8) * 0.2).toFixed(1);
  ctx.fillStyle = "#22c55e";
  ctx.font = "900 38px monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(`${tempVal}°C`, 128, 34);
  ctx.fillStyle = "#bae6fd";
  ctx.font = "700 13px Inter, sans-serif";
  ctx.fillText("COLD CHAIN 2-8°C • LOG ACTIVE", 128, 64);
  fridgeTempTex.needsUpdate = true;
}

// =========================================================================
// STATION 8: LUMPANG-ALU PORSELEN (MORTAR & PESTLE) & TIMBANGAN PUYER
// =========================================================================
function buildStation8Equipment() {
  const g = new THREE.Group();
  const porcelainMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.18, metalness: 0.05 });

  // 1. Lumpang Porselen (Mortar)
  const mortarGroup = new THREE.Group();
  mortarGroup.position.set(-0.18, 0, 0.04);
  const mortarFoot = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.095, 0.035, 24), porcelainMat);
  mortarFoot.position.y = 0.0175;
  mortarGroup.add(mortarFoot);
  const mortarBowl = new THREE.Mesh(new THREE.CylinderGeometry(0.135, 0.08, 0.11, 24), porcelainMat);
  mortarBowl.position.y = 0.085;
  mortarGroup.add(mortarBowl);
  // Cekungan dalam lumpang + serbuk putih puyer
  const powder = new THREE.Mesh(
    new THREE.CylinderGeometry(0.11, 0.07, 0.02, 20),
    new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.9 })
  );
  powder.position.y = 0.132;
  mortarGroup.add(powder);

  // Alu Porselen (Pestle) bersandar di dalam lumpang
  const pestle = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.030, 0.22, 16), porcelainMat);
  pestle.position.set(0.03, 0.17, 0);
  pestle.rotation.z = -0.48;
  mortarGroup.add(pestle);
  g.add(mortarGroup);

  // 2. Timbangan Puyer Digital
  const scaleBase = new THREE.Mesh(
    new THREE.BoxGeometry(0.24, 0.045, 0.26),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 })
  );
  scaleBase.position.set(0.18, 0.0225, 0.02);
  g.add(scaleBase);
  const scalePan = new THREE.Mesh(
    new THREE.CylinderGeometry(0.085, 0.085, 0.012, 24),
    new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.8, roughness: 0.2 })
  );
  scalePan.position.set(0.18, 0.052, -0.01);
  g.add(scalePan);
  const scaleLcd = new THREE.Mesh(
    new THREE.PlaneGeometry(0.16, 0.042),
    new THREE.MeshBasicMaterial({ map: makeLCDTexture("1500 mg", "#064e3b", "#34d399", "3 TAB PCT 500mg") })
  );
  scaleLcd.position.set(0.18, 0.046, 0.11);
  scaleLcd.rotation.x = -Math.PI / 2.2;
  g.add(scaleLcd);

  return g;
}

// =========================================================================
// STATION 9: INSULIN PEN (FLEXPEN) PRESISI TINGGI & FORM KUNING MESO
// =========================================================================
function buildStation9Equipment() {
  const g = new THREE.Group();
  const penGroup = new THREE.Group();
  penGroup.position.set(-0.08, 0.06, 0.05);
  penGroup.rotation.z = Math.PI / 2;
  penGroup.rotation.y = 0.25;

  const bluePenMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.28, metalness: 0.35 });
  const glassCartMat = new THREE.MeshStandardMaterial({ color: 0xe0f2fe, transparent: true, opacity: 0.65, roughness: 0.1 });
  const dialMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.3 });

  // Badan Pen Insulin
  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 0.24, 20), bluePenMat);
  penGroup.add(barrel);

  // Jendela Dosis Kuning (2 Unit Priming / 10 Unit Dosis)
  const doseWin = new THREE.Mesh(new THREE.BoxGeometry(0.052, 0.045, 0.052), dialMat);
  doseWin.position.y = -0.09;
  penGroup.add(doseWin);

  // Tombol Dial Putar Ujung Belakang
  const dialBtn = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.04, 16), new THREE.MeshStandardMaterial({ color: 0xf8fafc }));
  dialBtn.position.y = -0.14;
  penGroup.add(dialBtn);

  // Cartridge Kaca Depan & Jarum Subkutan 4mm
  const cart = new THREE.Mesh(new THREE.CylinderGeometry(0.021, 0.021, 0.11, 18), glassCartMat);
  cart.position.y = 0.175;
  penGroup.add(cart);
  const needleHub = new THREE.Mesh(new THREE.ConeGeometry(0.018, 0.035, 16), new THREE.MeshStandardMaterial({ color: 0x10b981 }));
  needleHub.position.y = 0.245;
  penGroup.add(needleHub);
  const needle = new THREE.Mesh(new THREE.CylinderGeometry(0.002, 0.002, 0.035, 8), new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9 }));
  needle.position.y = 0.275;
  penGroup.add(needle);
  g.add(penGroup);

  // Lembar Form Kuning MESO (Monitoring Efek Samping Obat)
  const mesoSheet = new THREE.Mesh(
    new THREE.BoxGeometry(0.24, 0.006, 0.32),
    new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.6 })
  );
  mesoSheet.position.set(0.22, 0.004, 0.02);
  mesoSheet.rotation.y = -0.12;
  g.add(mesoSheet);

  return g;
}

// =========================================================================
// DISPATCHER: GANTI PERALATAN 3D SESUAI STATION YANG SEDANG DIMASUKI
// =========================================================================
function updateRoomStationEquipment(stationIdx) {
  if (typeof labHighlightMesh === "undefined" || !labHighlightMesh) return;
  while (labHighlightMesh.children.length > 0) {
    labHighlightMesh.remove(labHighlightMesh.children[0]);
  }
  rotaryTurretMesh = null;

  let model = null;
  if (stationIdx === 0) model = buildStation1Equipment();
  else if (stationIdx === 1) model = buildStation2Equipment();
  else if (stationIdx === 2) model = buildStation3Equipment();
  else if (stationIdx === 4) model = buildStation5Equipment();
  else if (stationIdx === 7) model = buildStation8Equipment();
  else if (stationIdx === 8) model = buildStation9Equipment();
  else model = buildStation1Equipment(); // default lab kit untuk station konsultasi/logistik

  if (model) {
    labHighlightMesh.add(model);
  }
}

function updateStation3DEquipmentAnimation(delta = 0.016) {
  equipAnimTime += delta;
  if (rotaryTurretMesh) {
    rotaryTurretMesh.rotation.y += delta * 2.2;
  }
  if (typeof state !== "undefined" && state.sceneView === "room") {
    if (state.currentStationIdx === 2 && Math.floor(equipAnimTime * 15) % 2 === 0) {
      drawLiveHPLCChromatogram(equipAnimTime);
    } else if (state.currentStationIdx === 4 && Math.floor(equipAnimTime * 4) % 4 === 0) {
      updateFridgeTemperatureDisplay(equipAnimTime);
    }
  }
}

// =========================================================================
// AMBIENT SOUND ENGINE (AC HUM, LANGKAH KAKI, PINTU KLINIK)
// =========================================================================
let hvacNoiseNode = null;
let footstepTimer = 0.36;
let stepLeftFoot = true;

function startAmbientHVAC() {
  if (hvacNoiseNode || typeof state === "undefined" || !state.voiceEnabled) return;
  try {
    ensureAudio();
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const filter = audioCtx.createBiquadFilter();
    const gain = audioCtx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(58, audioCtx.currentTime);
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(95, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.012, audioCtx.currentTime);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    hvacNoiseNode = { osc, gain };
  } catch (e) {}
}

function playFootstepSFX(delta, isMoving) {
  if (!isMoving || typeof state === "undefined" || !state.voiceEnabled) {
    footstepTimer = 0.34;
    return;
  }
  footstepTimer += delta;
  if (footstepTimer >= 0.36) {
    footstepTimer = 0;
    stepLeftFoot = !stepLeftFoot;
    try {
      ensureAudio();
      if (!audioCtx) return;
      const now = audioCtx.currentTime;

      // 1. Ketukan hak sepatu pantofel di atas lantai ubin keramik (Crisp Tap)
      const tapOsc = audioCtx.createOscillator();
      const tapGain = audioCtx.createGain();
      tapOsc.type = "triangle";
      tapOsc.frequency.setValueAtTime(stepLeftFoot ? 880 : 960, now);
      tapOsc.frequency.exponentialRampToValueAtTime(260, now + 0.045);
      tapGain.gain.setValueAtTime(0.16, now);
      tapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      tapOsc.connect(tapGain);
      tapGain.connect(audioCtx.destination);
      tapOsc.start(now);
      tapOsc.stop(now + 0.055);

      // 2. Hentakan sol sepatu di ubin (Low Thud)
      const thudOsc = audioCtx.createOscillator();
      const thudGain = audioCtx.createGain();
      thudOsc.type = "sine";
      thudOsc.frequency.setValueAtTime(165, now);
      thudOsc.frequency.exponentialRampToValueAtTime(55, now + 0.075);
      thudGain.gain.setValueAtTime(0.19, now);
      thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      thudOsc.connect(thudGain);
      thudGain.connect(audioCtx.destination);
      thudOsc.start(now);
      thudOsc.stop(now + 0.085);
    } catch (e) {}
  }
}

function playDoorSFX(opening = true) {
  if (typeof state === "undefined" || !state.voiceEnabled) return;
  try {
    ensureAudio();
    if (!audioCtx) return;
    const now = audioCtx.currentTime;

    // 1. Klik gagang pintu logam (Handle Latch Click)
    const clickOsc = audioCtx.createOscillator();
    const clickGain = audioCtx.createGain();
    clickOsc.type = "square";
    clickOsc.frequency.setValueAtTime(1350, now);
    clickOsc.frequency.exponentialRampToValueAtTime(520, now + 0.04);
    clickGain.gain.setValueAtTime(0.14, now);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);
    clickOsc.connect(clickGain);
    clickGain.connect(audioCtx.destination);
    clickOsc.start(now);
    clickOsc.stop(now + 0.05);

    // 2. Ayunan engsel daun pintu kayu (Door Creak / Swing)
    const swingOsc = audioCtx.createOscillator();
    const swingGain = audioCtx.createGain();
    swingOsc.type = "sawtooth";
    swingOsc.frequency.setValueAtTime(opening ? 195 : 310, now + 0.05);
    swingOsc.frequency.linearRampToValueAtTime(opening ? 320 : 175, now + 0.24);
    swingGain.gain.setValueAtTime(0.11, now + 0.05);
    swingGain.gain.exponentialRampToValueAtTime(0.001, now + 0.26);
    swingOsc.connect(swingGain);
    swingGain.connect(audioCtx.destination);
    swingOsc.start(now + 0.05);
    swingOsc.stop(now + 0.27);

    // 3. Dentuman penutup kusen pintu (Door Frame Thud)
    const closeOsc = audioCtx.createOscillator();
    const closeGain = audioCtx.createGain();
    closeOsc.type = "sine";
    closeOsc.frequency.setValueAtTime(135, now + 0.25);
    closeOsc.frequency.exponentialRampToValueAtTime(48, now + 0.36);
    closeGain.gain.setValueAtTime(0.22, now + 0.25);
    closeGain.gain.exponentialRampToValueAtTime(0.001, now + 0.37);
    closeOsc.connect(closeGain);
    closeGain.connect(audioCtx.destination);
    closeOsc.start(now + 0.25);
    closeOsc.stop(now + 0.38);
  } catch (e) {}
}

