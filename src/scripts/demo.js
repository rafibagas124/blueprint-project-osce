// =========================================================================
// SKRIP DEMO OSCE CENTER 3D (UNTUK PENGUJI / EVALUATOR)
// Menolak berjalan bila NODE_ENV=production.
// Membuat data 20 mahasiswa DEV + akun koordinator dev-koordinator (kredensial acak).
// Menyalakan server & mencetak kredensial ke terminal dan data/demo-credentials.txt.
// =========================================================================

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const { server, store } = require("../../server");

const DEMO_STUDENT_NAMES = [
  // Koridor A (Seat 1 - 10)
  { nim: "DEV-001", nama: "apt. Andika Pratama, S.Farm", gender: "L", corridor: "KOR-A", seat: 1 },
  { nim: "DEV-002", nama: "apt. Bella Safitri, S.Farm", gender: "P", corridor: "KOR-A", seat: 2 },
  { nim: "DEV-003", nama: "apt. Citra Dewi, S.Farm", gender: "P", corridor: "KOR-A", seat: 3 },
  { nim: "DEV-004", nama: "apt. Dimas Ramadhan, S.Farm", gender: "L", corridor: "KOR-A", seat: 4 },
  { nim: "DEV-005", nama: "apt. Eka Rahmawati, S.Farm", gender: "P", corridor: "KOR-A", seat: 5 },
  { nim: "DEV-006", nama: "apt. Farhan Alamsyah, S.Farm", gender: "L", corridor: "KOR-A", seat: 6 },
  { nim: "DEV-007", nama: "apt. Gita Permata, S.Farm", gender: "P", corridor: "KOR-A", seat: 7 },
  { nim: "DEV-008", nama: "apt. Hendra Gunawan, S.Farm", gender: "L", corridor: "KOR-A", seat: 8 },
  { nim: "DEV-009", nama: "apt. Indah Kusuma, S.Farm", gender: "P", corridor: "KOR-A", seat: 9 },
  { nim: "DEV-010", nama: "apt. Joko Wibowo, S.Farm", gender: "L", corridor: "KOR-A", seat: 10 },

  // Koridor B (Seat 1 - 10)
  { nim: "DEV-011", nama: "apt. Karina Putri, S.Farm", gender: "P", corridor: "KOR-B", seat: 1 },
  { nim: "DEV-012", nama: "apt. Lukman Hakim, S.Farm", gender: "L", corridor: "KOR-B", seat: 2 },
  { nim: "DEV-013", nama: "apt. Mega Suryani, S.Farm", gender: "P", corridor: "KOR-B", seat: 3 },
  { nim: "DEV-014", nama: "apt. Naufal Azizi, S.Farm", gender: "L", corridor: "KOR-B", seat: 4 },
  { nim: "DEV-015", nama: "apt. Olivia Tamara, S.Farm", gender: "P", corridor: "KOR-B", seat: 5 },
  { nim: "DEV-016", nama: "apt. Panji Kusuma, S.Farm", gender: "L", corridor: "KOR-B", seat: 6 },
  { nim: "DEV-017", nama: "apt. Qonita Larasati, S.Farm", gender: "P", corridor: "KOR-B", seat: 7 },
  { nim: "DEV-018", nama: "apt. Reza Maulana, S.Farm", gender: "L", corridor: "KOR-B", seat: 8 },
  { nim: "DEV-019", nama: "apt. Salsabila Khairani, S.Farm", gender: "P", corridor: "KOR-B", seat: 9 },
  { nim: "DEV-020", nama: "apt. Taufik Hidayat, S.Farm", gender: "L", corridor: "KOR-B", seat: 10 }
];

function generateRandomStudentToken() {
  return "TK-" + crypto.randomBytes(4).toString("hex").toUpperCase();
}

function generateRandomCoordinatorPassword() {
  return "KoorDemo_" + crypto.randomBytes(6).toString("hex") + "!#A1";
}

async function prepareDemoData(customStore = null) {
  if (process.env.NODE_ENV === "production") {
    throw new Error("npm run demo DITOLAK: dilarang menjalankan mode demo pada production environment!");
  }

  const activeStore = customStore || store;
  const group = "GRP-DEMO";
  const studentRecords = [];

  // 1. Daftarkan 20 Mahasiswa DEV (10 Koridor A, 10 Koridor B, satu grup, seat 1-10)
  for (const s of DEMO_STUDENT_NAMES) {
    const rawToken = generateRandomStudentToken();
    const tokenHash = bcrypt.hashSync(rawToken, 10);

    await activeStore.saveStudent({
      nim: s.nim,
      nama: s.nama,
      gender: s.gender,
      corridor: s.corridor,
      group,
      seat: s.seat,
      tokenHash,
      createdAt: new Date().toISOString()
    });

    studentRecords.push({
      ...s,
      group,
      token: rawToken
    });
  }

  // 2. Daftarkan Koordinator dev-koordinator dengan password acak
  const coordinatorUsername = "dev-koordinator";
  const coordinatorPassword = generateRandomCoordinatorPassword();
  const coordinatorHash = bcrypt.hashSync(coordinatorPassword, 10);

  await activeStore.saveAssessor({
    username: coordinatorUsername,
    nama: "Koordinator Penguji Demo",
    role: "coordinator",
    passwordHash: coordinatorHash
  });

  return {
    students: studentRecords,
    coordinator: {
      username: coordinatorUsername,
      password: coordinatorPassword,
      role: "coordinator"
    }
  };
}

function writeCredentialsFile(demoData, port, customDir = null) {
  const targetDir = customDir || path.join(process.cwd(), "data");
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const outPath = path.join(targetDir, "demo-credentials.txt");
  const korA = demoData.students.filter((s) => s.corridor === "KOR-A");
  const korB = demoData.students.filter((s) => s.corridor === "KOR-B");

  let text = "========================================================================\n";
  text += "             KREDENSIAL DEMO OSCE CENTER 3D (AKSES EVALUASI)            \n";
  text += "========================================================================\n\n";
  text += `Alamat URL Aplikasi : http://localhost:${port}/blueprint.html\n\n`;

  text += "--- AKUN KOORDINATOR / ASESOR ---\n";
  text += `Role     : ${demoData.coordinator.role}\n`;
  text += `Username : ${demoData.coordinator.username}\n`;
  text += `Password : ${demoData.coordinator.password}\n\n`;

  text += "--- AKUN MAHASISWA (20 PESERTA, GRUP " + demoData.students[0].group + ") ---\n\n";
  text += "KORIDOR A (Seat 1 - 10):\n";
  text += "------------------------------------------------------------------------\n";
  text += "NIM       | Kursi | Nama                              | Token Ujian\n";
  text += "------------------------------------------------------------------------\n";
  korA.forEach((s) => {
    text += `${s.nim.padEnd(9)} | ${String(s.seat).padStart(5)} | ${s.nama.padEnd(33)} | ${s.token}\n`;
  });
  text += "------------------------------------------------------------------------\n\n";

  text += "KORIDOR B (Seat 1 - 10):\n";
  text += "------------------------------------------------------------------------\n";
  text += "NIM       | Kursi | Nama                              | Token Ujian\n";
  text += "------------------------------------------------------------------------\n";
  korB.forEach((s) => {
    text += `${s.nim.padEnd(9)} | ${String(s.seat).padStart(5)} | ${s.nama.padEnd(33)} | ${s.token}\n`;
  });
  text += "========================================================================\n";

  fs.writeFileSync(outPath, text, "utf8");
  return outPath;
}

async function runDemo({ port = process.env.PORT || 8080, startServer = true, customStore = null } = {}) {
  const demoData = await prepareDemoData(customStore);
  const outPath = writeCredentialsFile(demoData, port);

  if (!startServer) {
    return { ...demoData, port, outPath };
  }

  return new Promise((resolve, reject) => {
    server.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        console.error(`\n[DEMO ERROR] Port ${port} sudah terpakai oleh proses lain.`);
        console.error(`Silakan matikan proses pada port ${port} atau jalankan dengan: PORT=<nomor_lain> npm run demo\n`);
        return reject(err);
      }
      console.error(`\n[DEMO ERROR] Gagal menyalakan server: ${err.message}\n`);
      return reject(err);
    });

    const host = process.env.HOST || (process.env.NODE_ENV === "production" ? "0.0.0.0" : "127.0.0.1");
    server.listen(port, host, () => {
      const korA = demoData.students.filter((s) => s.corridor === "KOR-A");
      const korB = demoData.students.filter((s) => s.corridor === "KOR-B");

      console.log("\n========================================================================");
      console.log("             KREDENSIAL DEMO OSCE CENTER 3D (AKSES EVALUASI)            ");
      console.log("========================================================================");
      console.log(`\n🌐 Alamat URL : http://localhost:${port}/blueprint.html\n`);
      console.log("--- AKUN KOORDINATOR / ASESOR ---");
      console.log(`Role     : ${demoData.coordinator.role}`);
      console.log(`Username : ${demoData.coordinator.username}`);
      console.log(`Password : ${demoData.coordinator.password}`);

      console.log("\n--- AKUN MAHASISWA KORIDOR A (Seat 1 - 10) ---");
      console.log("NIM       | Kursi | Nama                              | Token Ujian");
      console.log("------------------------------------------------------------------------");
      korA.forEach((s) => {
        console.log(`${s.nim.padEnd(9)} | ${String(s.seat).padStart(5)} | ${s.nama.padEnd(33)} | ${s.token}`);
      });

      console.log("\n--- AKUN MAHASISWA KORIDOR B (Seat 1 - 10) ---");
      console.log("NIM       | Kursi | Nama                              | Token Ujian");
      console.log("------------------------------------------------------------------------");
      korB.forEach((s) => {
        console.log(`${s.nim.padEnd(9)} | ${String(s.seat).padStart(5)} | ${s.nama.padEnd(33)} | ${s.token}`);
      });
      console.log("========================================================================");
      console.log(`📄 Kredensial lengkap tersimpan pada: ${outPath}`);
      console.log("🚀 Server demo berjalan. Tekan Ctrl+C untuk menghentikan.\n");

      resolve({ ...demoData, port, outPath, server });
    });
  });
}

if (require.main === module) {
  runDemo().catch(() => process.exit(1));
}

module.exports = {
  prepareDemoData,
  writeCredentialsFile,
  runDemo,
  DEMO_STUDENT_NAMES,
  generateRandomStudentToken,
  generateRandomCoordinatorPassword
};

