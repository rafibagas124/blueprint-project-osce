// =========================================================================
// 3D HUMANOID AVATAR GENERATOR (MALE & FEMALE / HIJAB & NON-HIJAB)
// Fitur: Mata, Kaki, Tangan + Jari Lengkap, Jas Snelli, Sepatu Pantofel,
//        ID Card Dada Kanan, Posisi duduk presisi di kursi (Tidak Melayang)
// =========================================================================

// Helper: Buat 1 jari dari silinder-silinder (3 ruas)
function createFinger(skinMat, len1 = 0.028, len2 = 0.024, len3 = 0.018, r = 0.009) {
  const fingerGroup = new THREE.Group();
  const seg1 = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 1.1, len1, 7), skinMat);
  seg1.position.y = -len1 / 2;
  fingerGroup.add(seg1);
  const knuckle1 = new THREE.Group();
  knuckle1.position.y = -len1;
  fingerGroup.add(knuckle1);
  const seg2 = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.95, r, len2, 7), skinMat);
  seg2.position.y = -len2 / 2;
  knuckle1.add(seg2);
  const knuckle2 = new THREE.Group();
  knuckle2.position.y = -len2;
  knuckle1.add(knuckle2);
  const seg3 = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.75, r * 0.9, len3, 7), skinMat);
  seg3.position.y = -len3 / 2;
  knuckle2.add(seg3);
  // Kuku kecil di ujung
  const nail = new THREE.Mesh(new THREE.BoxGeometry(r * 1.6, r * 0.4, r * 1.1), new THREE.MeshStandardMaterial({ color: 0xfce7de, roughness: 0.5 }));
  nail.position.set(0, -len3 - 0.003, r * 0.3);
  knuckle2.add(nail);
  return { group: fingerGroup, knuckle1, knuckle2 };
}

// Helper: Buat tangan lengkap dengan telapak + 4 jari + ibu jari
function createHandWithFingers(skinMat, side = "left") {
  const handGroup = new THREE.Group();
  const palmSign = side === "left" ? 1 : -1;

  // Telapak tangan (metacarpus)
  const palm = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.075, 0.028), skinMat);
  palm.position.y = -0.0375;
  handGroup.add(palm);

  // 4 Jari (telunjuk, tengah, manis, kelingking) di ujung telapak
  const fingerDefs = [
    { x: -0.019, len1: 0.028, len2: 0.022, len3: 0.016, r: 0.0085 }, // telunjuk
    { x: -0.006, len1: 0.032, len2: 0.025, len3: 0.018, r: 0.009 }, // tengah
    { x: 0.007, len1: 0.030, len2: 0.023, len3: 0.016, r: 0.0085 }, // manis
    { x: 0.019, len1: 0.022, len2: 0.016, len3: 0.012, r: 0.0075 }, // kelingking
  ];

  const fingers = [];
  fingerDefs.forEach((fd) => {
    const f = createFinger(skinMat, fd.len1, fd.len2, fd.len3, fd.r);
    f.group.position.set(fd.x * palmSign, -0.075, 0);
    handGroup.add(f.group);
    fingers.push(f);
  });

  // Ibu jari (lebih pendek, sudut berbeda)
  const thumbBase = new THREE.Group();
  thumbBase.position.set(palmSign * 0.030, -0.025, 0.006);
  thumbBase.rotation.z = palmSign * 0.6;
  thumbBase.rotation.x = -0.3;
  handGroup.add(thumbBase);
  const thumbSeg1 = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.012, 0.030, 7), skinMat);
  thumbSeg1.position.y = -0.015;
  thumbBase.add(thumbSeg1);
  const thumbKnuckle = new THREE.Group();
  thumbKnuckle.position.y = -0.030;
  thumbBase.add(thumbKnuckle);
  const thumbSeg2 = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.010, 0.022, 7), skinMat);
  thumbSeg2.position.y = -0.011;
  thumbKnuckle.add(thumbSeg2);

  return { group: handGroup, fingers, thumbBase, thumbKnuckle };
}

function createIDBadgeTexture({ name, nim, gender, role }) {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 160;
  const ctx = canvas.getContext("2d");

  // Background kartu laminating
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, 256, 160);

  // Border & Header strip
  const isAssessor = (role === "assessor");
  ctx.fillStyle = isAssessor ? "#d97706" : "#0f766e";
  ctx.fillRect(0, 0, 256, 36);

  // Header Title
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 16px Inter, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(isAssessor ? "ASESOR / PENGUJI OSCE" : "KANDIDAT PESERTA OSCE", 128, 18);

  // Foto Box / Silhouette
  ctx.fillStyle = isAssessor ? "#fef3c7" : "#ccfbf1";
  ctx.fillRect(14, 46, 52, 64);
  ctx.strokeStyle = isAssessor ? "#d97706" : "#0f766e";
  ctx.lineWidth = 2;
  ctx.strokeRect(14, 46, 52, 64);

  // Foto icon
  ctx.fillStyle = isAssessor ? "#92400e" : "#115e59";
  ctx.font = "26px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(gender === "female" ? "👩‍⚕️" : "👨‍⚕️", 40, 84);

  // Nama Mahasiswa
  ctx.fillStyle = "#0f172a";
  ctx.font = "bold 15px Inter, sans-serif";
  ctx.textAlign = "left";
  const displayNm = name.length > 18 ? name.substring(0, 17) + "…" : name;
  ctx.fillText(displayNm, 74, 58);

  // NIM
  ctx.fillStyle = "#475569";
  ctx.font = "600 12px Inter, monospace";
  ctx.fillText(nim || "NIM: 2024-00000", 74, 78);

  // Jenis Kelamin
  ctx.fillStyle = "#0284c7";
  ctx.font = "bold 11px Inter, sans-serif";
  const jkStr = gender === "female" ? "JK: Perempuan (P)" : "JK: Laki-laki (L)";
  ctx.fillText(jkStr, 74, 96);

  // Footer bar: barcode effect
  ctx.fillStyle = "#1e293b";
  ctx.fillRect(14, 122, 228, 22);
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 10px Inter, monospace";
  ctx.textAlign = "center";
  ctx.fillText("UKMPPAI — IAI & APTFI VERIFIED", 128, 133);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

// 3D Billboard Name Tag yang melayang di atas kepala
function createNameTagSprite(name, nim, isLocal = false, role = "student") {
  const canvas = document.createElement("canvas");
  canvas.width = 384;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");

  function draw(statusText = "Station Active") {
    ctx.clearRect(0, 0, 384, 128);
    const isAssessor = (role === "assessor");

    // Background pill
    if (isAssessor) {
      ctx.fillStyle = "rgba(180, 83, 9, 0.94)";
    } else if (isLocal) {
      ctx.fillStyle = "rgba(15, 118, 110, 0.94)";
    } else {
      ctx.fillStyle = "rgba(15, 23, 42, 0.92)";
    }

    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(10, 16, 364, 96, 20);
    } else {
      ctx.rect(10, 16, 364, 96);
    }
    ctx.fill();

    ctx.strokeStyle = isAssessor ? "rgba(251, 191, 36, 0.95)" : isLocal ? "rgba(94, 234, 212, 0.95)" : "rgba(148, 163, 184, 0.55)";
    ctx.lineWidth = 4;
    ctx.stroke();

    // Live dot
    ctx.fillStyle = isAssessor ? "#f59e0b" : "#10b981";
    ctx.beginPath();
    ctx.arc(38, 48, 9, 0, Math.PI * 2);
    ctx.fill();

    // Nama
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 23px Inter, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    const displayName = name.length > 20 ? name.substring(0, 19) + "…" : name;
    ctx.fillText(displayName, 56, 48);

    // Subtext (NIM / Station / Role)
    ctx.fillStyle = isAssessor ? "#fef3c7" : isLocal ? "#a7f3d0" : "#94a3b8";
    ctx.font = "600 17px Inter, sans-serif";
    ctx.fillText(`${nim} • ${statusText}`, 38, 84);
  }

  draw();

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true });
  const sprite = new THREE.Sprite(spriteMat);
  sprite.scale.set(1.65, 0.55, 1);
  sprite.renderOrder = 999;
  sprite.updateText = (statusText) => {
    draw(statusText);
    texture.needsUpdate = true;
  };
  return sprite;
}

// Full Humanoid 3D Avatar (Laki-laki / Perempuan)
function createDetailedHumanoidAvatar({
  name = "Kandidat",
  nim = "2024-00000",
  gender = "male", // 'male' | 'female'
  role = "student", // 'student' | 'assessor'
  isLocal = false,
  coatColor = 0xffffff,
  pantsColor = 0x1e293b,
  shoesColor = 0x09090b,
  skinColor = 0xf5d0b5,
  hairColor = 0x241c19,
  hijabColor = 0x0f766e
} = {}) {
  const root = new THREE.Group();

  // Materials
  const skinMat = new THREE.MeshStandardMaterial({ color: skinColor, roughness: 0.65 });
  const coatMat = new THREE.MeshStandardMaterial({ color: coatColor, roughness: 0.45 });
  const lapelMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.4 });
  const pantsMat = new THREE.MeshStandardMaterial({ color: pantsColor, roughness: 0.7 });
  const shoeMat = new THREE.MeshStandardMaterial({ color: shoesColor, roughness: 0.35, metalness: 0.15 });
  const hairMat = new THREE.MeshStandardMaterial({ color: hairColor, roughness: 0.8 });
  const hijabMat = new THREE.MeshStandardMaterial({ color: hijabColor, roughness: 0.75 });
  const eyeWhiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const pupilMat = new THREE.MeshBasicMaterial({ color: 0x09090b });

  // 1. Pelvis / Pusat Pinggul
  const pelvis = new THREE.Group();
  pelvis.position.set(0, 0.90, 0);
  root.add(pelvis);

  // 2. Torso & Seragam Jas Dokter/Apoteker (Snelli)
  const torsoGroup = new THREE.Group();
  pelvis.add(torsoGroup);

  // Badan Jas Putih
  const torsoWidth = (gender === "female") ? 0.35 : 0.38;
  const coatTorso = new THREE.Mesh(new THREE.BoxGeometry(torsoWidth, 0.50, 0.22), coatMat);
  coatTorso.position.set(0, 0.25, 0);
  torsoGroup.add(coatTorso);

  // Ekor Jas Dokter (Coat Hem menjuntai menutupi pinggul sampai atas paha)
  const coatHem = new THREE.Mesh(new THREE.BoxGeometry(torsoWidth + 0.02, 0.22, 0.24), coatMat);
  coatHem.position.set(0, -0.06, 0);
  torsoGroup.add(coatHem);

  // Kerah Jas (Lapels V-neck)
  const leftLapel = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.24, 0.035), lapelMat);
  leftLapel.position.set(-0.08, 0.34, 0.10);
  leftLapel.rotation.z = -0.22;
  torsoGroup.add(leftLapel);

  const rightLapel = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.24, 0.035), lapelMat);
  rightLapel.position.set(0.08, 0.34, 0.10);
  rightLapel.rotation.z = 0.22;
  torsoGroup.add(rightLapel);

  // Kemeja dalam di balik kerah jas
  const innerShirt = new THREE.Mesh(
    new THREE.BoxGeometry(0.08, 0.20, 0.02),
    new THREE.MeshStandardMaterial({ color: (role === "assessor") ? 0xf59e0b : 0x38bdf8 })
  );
  innerShirt.position.set(0, 0.35, 0.095);
  torsoGroup.add(innerShirt);

  // =======================================================================
  // KARTU TANDA PENGENAL (ID BADGE) RESMI TERTEMPEL DI DADA KANAN
  // Sesuai permintaan: Nama, NIM, Jenis Kelamin tertempel di baju kanan
  // =======================================================================
  const badgeTex = createIDBadgeTexture({ name, nim, gender, role });
  const badgeMat = new THREE.MeshBasicMaterial({ map: badgeTex });
  const badgeMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.11, 0.075), badgeMat);
  // Posisi di dada kanan avatar (x positif dari pandangan avatar):
  badgeMesh.position.set(0.10, 0.31, 0.115);
  torsoGroup.add(badgeMesh);

  // Penjepit ID Card / Klip saku dada kanan
  const badgeClip = new THREE.Mesh(new THREE.BoxGeometry(0.025, 0.012, 0.01), new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8 }));
  badgeClip.position.set(0.10, 0.355, 0.118);
  torsoGroup.add(badgeClip);

  // Pulpen saku dada kiri
  const pen = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.05), new THREE.MeshBasicMaterial({ color: 0xdc2626 }));
  pen.position.set(-0.10, 0.33, 0.116);
  torsoGroup.add(pen);

  // 3 Kancing Jas depan
  [0.21, 0.13, 0.05].forEach((btnY) => {
    const btn = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.011, 0.012, 8), new THREE.MeshBasicMaterial({ color: 0x475569 }));
    btn.rotation.x = Math.PI / 2;
    btn.position.set(0, btnY, 0.113);
    torsoGroup.add(btn);
  });

  // 3. Leher & Kepala
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.065, 0.08, 12), skinMat);
  neck.position.set(0, 0.52, 0);
  torsoGroup.add(neck);

  const headGroup = new THREE.Group();
  headGroup.position.set(0, 0.68, 0);
  torsoGroup.add(headGroup);

  const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.135, 18, 18), skinMat);
  headMesh.scale.set(1.0, 1.15, 1.05);
  headGroup.add(headMesh);

  // Model Rambut / Hijab sesuai Jenis Kelamin
  if (gender === "female") {
    // Hijab/Jilbab Syari Rapi (Khas Mahasiswi Medis Indonesia)
    const hijabHood = new THREE.Mesh(new THREE.SphereGeometry(0.152, 18, 18, 0, Math.PI * 2, 0, Math.PI * 0.75), hijabMat);
    hijabHood.position.set(0, 0.02, -0.015);
    headGroup.add(hijabHood);

    // Kain hijab yang menutupi leher dan dada atas
    const hijabNeck = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.16, 0.20, 16), hijabMat);
    hijabNeck.position.set(0, -0.12, 0.01);
    headGroup.add(hijabNeck);
  } else {
    // Rambut Pria Pendek & Rapi
    const maleHair = new THREE.Mesh(new THREE.SphereGeometry(0.146, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.52), hairMat);
    maleHair.position.set(0, 0.025, -0.01);
    headGroup.add(maleHair);
  }

  // MATA LENGKAP: SCLERA PUTIH + IRIS + PUPIL + KELOPAK MATA (BLINK) + ALIS EKSPRESIF
  const eyelids = [];
  const brows = [];
  [-0.050, 0.050].forEach((eyeX) => {
    const sclera = new THREE.Mesh(new THREE.SphereGeometry(0.023, 12, 12), eyeWhiteMat);
    sclera.scale.set(1.2, 0.78, 0.52);
    sclera.position.set(eyeX, 0.015, 0.124);
    headGroup.add(sclera);

    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.011, 10, 10), pupilMat);
    pupil.position.set(eyeX, 0.015, 0.137);
    headGroup.add(pupil);

    // Kelopak mata atas untuk animasi berkedip (blinking) natural
    const eyelid = new THREE.Mesh(new THREE.SphereGeometry(0.0245, 10, 10, 0, Math.PI * 2, 0, Math.PI * 0.55), skinMat);
    eyelid.scale.set(1.22, 0.1, 0.56);
    eyelid.position.set(eyeX, 0.022, 0.125);
    headGroup.add(eyelid);
    eyelids.push(eyelid);

    const brow = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.036, 8), hairMat);
    brow.rotation.z = Math.PI / 2;
    brow.position.set(eyeX, (gender === "female" ? 0.041 : 0.044), 0.129);
    headGroup.add(brow);
    brows.push(brow);
  });

  // Hidung Anatomis & Mulut Berkontur dengan Viseme Lip-Sync (Bukan Kotak Kaku)
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.015, 0.032, 10), skinMat);
  nose.position.set(0, -0.01, 0.142);
  nose.rotation.x = -Math.PI / 2;
  headGroup.add(nose);

  const mouthGroup = new THREE.Group();
  mouthGroup.position.set(0, -0.052, 0.128);
  headGroup.add(mouthGroup);

  const lipMat = new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.45 });
  const oralMat = new THREE.MeshBasicMaterial({ color: 0x3b0714 });

  // Rongga mulut dalam (terlihat membuka-menutup saat bicara / lip-sync)
  const mouthCavity = new THREE.Mesh(new THREE.SphereGeometry(0.018, 12, 10), oralMat);
  mouthCavity.scale.set(1.15, 0.18, 0.35);
  mouthGroup.add(mouthCavity);

  // Bibir atas & bibir bawah berkontur lembut
  const upperLip = new THREE.Mesh(new THREE.CylinderGeometry(0.0045, 0.0045, 0.038, 10), lipMat);
  upperLip.rotation.z = Math.PI / 2;
  upperLip.position.set(0, 0.0035, 0.004);
  mouthGroup.add(upperLip);

  const lowerLip = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.036, 10), lipMat);
  lowerLip.rotation.z = Math.PI / 2;
  lowerLip.position.set(0, -0.0035, 0.004);
  mouthGroup.add(lowerLip);

  // 4. TANGAN LENGKAP dengan JARI-JARI REALISTIS (Lengan berjas Snelli)
  // Lengan Kiri
  const leftShoulder = new THREE.Group();
  leftShoulder.position.set(-(torsoWidth * 0.5 + 0.04), 0.44, 0);
  torsoGroup.add(leftShoulder);

  const leftUpperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.046, 0.043, 0.24, 10), coatMat);
  leftUpperArm.position.set(0, -0.12, 0);
  leftShoulder.add(leftUpperArm);

  const leftElbow = new THREE.Group();
  leftElbow.position.set(0, -0.12, 0);
  leftUpperArm.add(leftElbow);

  const leftForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.041, 0.037, 0.22, 10), coatMat);
  leftForearm.position.set(0, -0.10, 0);
  leftElbow.add(leftForearm);

  // Pergelangan tangan kulit (peralihan dari lengan jas ke tangan)
  const leftWrist = new THREE.Mesh(new THREE.CylinderGeometry(0.034, 0.038, 0.04, 10), skinMat);
  leftWrist.position.set(0, -0.22, 0);
  leftForearm.add(leftWrist);

  // Tangan kiri dengan jari-jari lengkap
  const leftHandObj = createHandWithFingers(skinMat, "left");
  leftHandObj.group.position.set(0, -0.245, 0);
  leftForearm.add(leftHandObj.group);

  // Lengan Kanan
  const rightShoulder = new THREE.Group();
  rightShoulder.position.set((torsoWidth * 0.5 + 0.04), 0.44, 0);
  torsoGroup.add(rightShoulder);

  const rightUpperArm = new THREE.Mesh(new THREE.CylinderGeometry(0.046, 0.043, 0.24, 10), coatMat);
  rightUpperArm.position.set(0, -0.12, 0);
  rightShoulder.add(rightUpperArm);

  const rightElbow = new THREE.Group();
  rightElbow.position.set(0, -0.12, 0);
  rightUpperArm.add(rightElbow);

  const rightForearm = new THREE.Mesh(new THREE.CylinderGeometry(0.041, 0.037, 0.22, 10), coatMat);
  rightForearm.position.set(0, -0.10, 0);
  rightElbow.add(rightForearm);

  // Pergelangan tangan kulit
  const rightWrist = new THREE.Mesh(new THREE.CylinderGeometry(0.034, 0.038, 0.04, 10), skinMat);
  rightWrist.position.set(0, -0.22, 0);
  rightForearm.add(rightWrist);

  // Tangan kanan dengan jari-jari lengkap
  const rightHandObj = createHandWithFingers(skinMat, "right");
  rightHandObj.group.position.set(0, -0.245, 0);
  rightForearm.add(rightHandObj.group);

  // Helper Sepatu Pantofel Anatomis Berkontur (Bukan Kotak Kaku)
  function createContouredShoe() {
    const shoeGrp = new THREE.Group();
    const soleMat = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.7 });
    // Upper belakang & tengah
    const heelUpper = new THREE.Mesh(new THREE.CylinderGeometry(0.044, 0.048, 0.075, 14), shoeMat);
    heelUpper.position.set(0, 0.002, -0.025);
    shoeGrp.add(heelUpper);
    // Punggung sepatu melengkung ke ujung jari (vamp & rounded toe cap)
    const vamp = new THREE.Mesh(new THREE.SphereGeometry(0.049, 14, 12), shoeMat);
    vamp.scale.set(0.95, 0.68, 1.85);
    vamp.position.set(0, -0.008, 0.035);
    shoeGrp.add(vamp);
    // Sol bawah berkontur + hak pantofel
    const sole = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.050, 0.018, 16), soleMat);
    sole.scale.set(1.0, 1.0, 2.35);
    sole.position.set(0, -0.036, 0.025);
    shoeGrp.add(sole);
    const heelBlock = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.046, 0.026, 12), soleMat);
    heelBlock.position.set(0, -0.040, -0.035);
    shoeGrp.add(heelBlock);
    return shoeGrp;
  }

  // 5. KAKI LENGKAP (PAHA, BETIS DENGAN CELANA FORMAL + SEPATU BERKONTUR)
  const leftHip = new THREE.Group();
  leftHip.position.set(-0.11, 0, 0);
  pelvis.add(leftHip);

  const leftThigh = new THREE.Mesh(new THREE.CylinderGeometry(0.062, 0.053, 0.42, 12), pantsMat);
  leftThigh.position.set(0, -0.21, 0);
  leftHip.add(leftThigh);

  const leftKnee = new THREE.Group();
  leftKnee.position.set(0, -0.21, 0);
  leftThigh.add(leftKnee);

  const leftCalf = new THREE.Mesh(new THREE.CylinderGeometry(0.053, 0.046, 0.40, 12), pantsMat);
  leftCalf.position.set(0, -0.19, 0);
  leftKnee.add(leftCalf);

  const leftShoe = createContouredShoe();
  leftShoe.position.set(0, -0.21, 0.025);
  leftCalf.add(leftShoe);

  const rightHip = new THREE.Group();
  rightHip.position.set(0.11, 0, 0);
  pelvis.add(rightHip);

  const rightThigh = new THREE.Mesh(new THREE.CylinderGeometry(0.062, 0.053, 0.42, 12), pantsMat);
  rightThigh.position.set(0, -0.21, 0);
  rightHip.add(rightThigh);

  const rightKnee = new THREE.Group();
  rightKnee.position.set(0, -0.21, 0);
  rightThigh.add(rightKnee);

  const rightCalf = new THREE.Mesh(new THREE.CylinderGeometry(0.053, 0.046, 0.40, 12), pantsMat);
  rightCalf.position.set(0, -0.19, 0);
  rightKnee.add(rightCalf);

  const rightShoe = createContouredShoe();
  rightShoe.position.set(0, -0.21, 0.025);
  rightCalf.add(rightShoe);

  // 7. FLOATING 3D BILLBOARD NAME TAG DI ATAS KEPALA
  const nameSprite = createNameTagSprite(name, nim, isLocal, role);
  nameSprite.position.set(0, 1.95, 0);
  root.add(nameSprite);

  let walkPhase = Math.random() * Math.PI * 2;
  let blinkPhase = Math.random() * 4.0;
  let talkPhase = 0;
  let currentSittingState = false;
  let isSpeakingState = false;

  // =======================================================================
  // SKELETAL ANIMATION ENGINE: DUDUK, JALAN, IDLE NATURAL, BLINK & LIP-SYNC
  // =======================================================================
  function updateFacialAnimation(delta) {
    // 1. Berkedip otomatis setiap ~3.6 detik
    blinkPhase += delta;
    const isBlinking = (blinkPhase % 3.6) > 3.46;
    eyelids.forEach((lid) => {
      lid.scale.y = isBlinking ? 0.85 : 0.12;
      lid.position.y = isBlinking ? 0.015 : 0.023;
    });

    // 2. Lip-sync saat bicara (baik via flag isSpeaking maupun window.speechSynthesis)
    const synthSpeaking = ("speechSynthesis" in window) && window.speechSynthesis.speaking && !isLocal;
    const activeTalk = isSpeakingState || synthSpeaking;
    if (activeTalk) {
      talkPhase += delta * 18.0;
      const openAmt = 0.25 + Math.abs(Math.sin(talkPhase)) * 0.85 + Math.abs(Math.cos(talkPhase * 1.7)) * 0.35;
      mouthCavity.scale.y = openAmt;
      lowerLip.position.y = -0.0035 - openAmt * 0.0055;
      upperLip.position.y = 0.0035 + openAmt * 0.0015;
      brows.forEach((b, i) => {
        b.position.y = (gender === "female" ? 0.041 : 0.044) + Math.sin(talkPhase * 0.4) * 0.0025;
        b.rotation.z = Math.PI / 2 + (i === 0 ? 0.05 : -0.05) * Math.sin(talkPhase * 0.3);
      });
    } else {
      mouthCavity.scale.y = 0.16;
      lowerLip.position.y = -0.0035;
      upperLip.position.y = 0.0035;
    }
  }

  function updateAnimation(isMoving, isSeated, delta = 0.016) {
    updateFacialAnimation(delta);

    if (isSeated) {
      if (!currentSittingState) currentSittingState = true;
      walkPhase += delta * 1.8;

      // Panggul mendarat pas di bantalan kursi (0.47m) + nafas halus natural
      pelvis.position.y = 0.47;
      pelvis.position.z = -0.04;
      torsoGroup.position.y = Math.sin(walkPhase) * 0.004;
      torsoGroup.rotation.x = 0.05 + Math.sin(walkPhase * 0.7) * 0.01;
      headGroup.rotation.y = Math.sin(walkPhase * 0.5) * 0.05;
      headGroup.rotation.x = Math.cos(walkPhase * 0.4) * 0.025;

      leftHip.rotation.x = -Math.PI / 2;
      rightHip.rotation.x = -Math.PI / 2;
      leftKnee.rotation.x = Math.PI / 2;
      rightKnee.rotation.x = Math.PI / 2;

      leftShoulder.rotation.x = -0.45 + Math.sin(walkPhase * 0.8) * 0.02;
      rightShoulder.rotation.x = -0.45 + Math.cos(walkPhase * 0.8) * 0.02;
      leftElbow.rotation.x = -0.55;
      rightElbow.rotation.x = -0.55;
      return;
    }

    if (currentSittingState) {
      currentSittingState = false;
      pelvis.position.y = 0.90;
      pelvis.position.z = 0;
      torsoGroup.rotation.x = 0;
      leftKnee.rotation.x = 0;
      rightKnee.rotation.x = 0;
      leftElbow.rotation.x = 0;
      rightElbow.rotation.x = 0;
    }

    if (isMoving) {
      walkPhase += delta * 9.5;
      leftShoulder.rotation.x = Math.sin(walkPhase) * 0.45;
      rightShoulder.rotation.x = -Math.sin(walkPhase) * 0.45;
      leftElbow.rotation.x = -0.18 - Math.max(0, Math.sin(walkPhase)) * 0.22;
      rightElbow.rotation.x = -0.18 - Math.max(0, -Math.sin(walkPhase)) * 0.22;

      leftHip.rotation.x = -Math.sin(walkPhase) * 0.55;
      rightHip.rotation.x = Math.sin(walkPhase) * 0.55;
      leftKnee.rotation.x = Math.max(0, Math.sin(walkPhase)) * 0.48;
      rightKnee.rotation.x = Math.max(0, -Math.sin(walkPhase)) * 0.48;

      pelvis.position.y = 0.90 + Math.abs(Math.sin(walkPhase * 2)) * 0.032;
      torsoGroup.rotation.y = Math.sin(walkPhase) * 0.04;
    } else {
      // Idle natural: pernapasan dada, pergeseran tumpuan lembut & gerakan kepala
      walkPhase += delta * 2.1;
      leftShoulder.rotation.x = Math.sin(walkPhase * 0.7) * 0.025;
      rightShoulder.rotation.x = -Math.sin(walkPhase * 0.7) * 0.025;
      leftElbow.rotation.x = -0.08;
      rightElbow.rotation.x = -0.08;
      leftHip.rotation.x = 0;
      rightHip.rotation.x = 0;
      leftKnee.rotation.x = 0;
      rightKnee.rotation.x = 0;
      pelvis.position.y = 0.90;
      torsoGroup.position.y = Math.sin(walkPhase) * 0.009;
      torsoGroup.rotation.y = Math.sin(walkPhase * 0.35) * 0.025;
      headGroup.rotation.y = Math.sin(walkPhase * 0.5) * 0.065;
      headGroup.rotation.x = Math.cos(walkPhase * 0.4) * 0.02;
    }
  }

  return {
    root,
    pelvis,
    torsoGroup,
    headGroup,
    nameSprite,
    updateAnimation,
    setSpeaking: (val) => { isSpeakingState = Boolean(val); },
    targetX: null,
    targetZ: null,
    targetYaw: null,
    isSeated: false,
    isMoving: false,
    name,
    nim,
    gender,
    role
  };
}

