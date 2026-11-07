// =========================================================================
// SEEDER DATA PENGEMBANGAN (DEV ONLY)
// Menolak berjalan bila NODE_ENV=production.
// Mengisi 20 mahasiswa DEV (10 Koridor A, 10 Koridor B) & akun Asesor.
// =========================================================================

const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const { getStore } = require("../store");
const { generateStudentToken } = require("./seed-roster");

const DEV_STUDENTS = [
  // Koridor A (Seat 1 - 10)
  { nim: "DEV-001", nama: "apt. Andika Pratama, S.Farm", gender: "L", corridor: "KOR-A", group: "GRP-DEV", seat: 1 },
  { nim: "DEV-002", nama: "apt. Bella Safitri, S.Farm", gender: "P", corridor: "KOR-A", group: "GRP-DEV", seat: 2 },
  { nim: "DEV-003", nama: "apt. Citra Dewi, S.Farm", gender: "P", corridor: "KOR-A", group: "GRP-DEV", seat: 3 },
  { nim: "DEV-004", nama: "apt. Dimas Ramadhan, S.Farm", gender: "L", corridor: "KOR-A", group: "GRP-DEV", seat: 4 },
  { nim: "DEV-005", nama: "apt. Eka Rahmawati, S.Farm", gender: "P", corridor: "KOR-A", group: "GRP-DEV", seat: 5 },
  { nim: "DEV-006", nama: "apt. Farhan Alamsyah, S.Farm", gender: "L", corridor: "KOR-A", group: "GRP-DEV", seat: 6 },
  { nim: "DEV-007", nama: "apt. Gita Permata, S.Farm", gender: "P", corridor: "KOR-A", group: "GRP-DEV", seat: 7 },
  { nim: "DEV-008", nama: "apt. Hendra Gunawan, S.Farm", gender: "L", corridor: "KOR-A", group: "GRP-DEV", seat: 8 },
  { nim: "DEV-009", nama: "apt. Indah Kusuma, S.Farm", gender: "P", corridor: "KOR-A", group: "GRP-DEV", seat: 9 },
  { nim: "DEV-010", nama: "apt. Joko Wibowo, S.Farm", gender: "L", corridor: "KOR-A", group: "GRP-DEV", seat: 10 },

  // Koridor B (Seat 1 - 10)
  { nim: "DEV-011", nama: "apt. Karina Putri, S.Farm", gender: "P", corridor: "KOR-B", group: "GRP-DEV", seat: 1 },
  { nim: "DEV-012", nama: "apt. Lukman Hakim, S.Farm", gender: "L", corridor: "KOR-B", group: "GRP-DEV", seat: 2 },
  { nim: "DEV-013", nama: "apt. Mega Suryani, S.Farm", gender: "P", corridor: "KOR-B", group: "GRP-DEV", seat: 3 },
  { nim: "DEV-014", nama: "apt. Naufal Azizi, S.Farm", gender: "L", corridor: "KOR-B", group: "GRP-DEV", seat: 4 },
  { nim: "DEV-015", nama: "apt. Olivia Tamara, S.Farm", gender: "P", corridor: "KOR-B", group: "GRP-DEV", seat: 5 },
  { nim: "DEV-016", nama: "apt. Panji Kusuma, S.Farm", gender: "L", corridor: "KOR-B", group: "GRP-DEV", seat: 6 },
  { nim: "DEV-017", nama: "apt. Qonita Larasati, S.Farm", gender: "P", corridor: "KOR-B", group: "GRP-DEV", seat: 7 },
  { nim: "DEV-018", nama: "apt. Reza Maulana, S.Farm", gender: "L", corridor: "KOR-B", group: "GRP-DEV", seat: 8 },
  { nim: "DEV-019", nama: "apt. Salsabila Khairani, S.Farm", gender: "P", corridor: "KOR-B", group: "GRP-DEV", seat: 9 },
  { nim: "DEV-020", nama: "apt. Taufik Hidayat, S.Farm", gender: "L", corridor: "KOR-B", group: "GRP-DEV", seat: 10 }
];

const DEV_ASSESSORS = [
  { username: "asesor1", passwordPlain: "asesor123", nama: "dr. Budi Santoso, Sp.FRS", role: "assessor" },
  { username: "asesor2", passwordPlain: "asesor123", nama: "apt. Siti Nurhaliza, M.Farm", role: "assessor" },
  { username: "koordinator", passwordPlain: "admin123", nama: "Koordinator Ujian OSCE UKMPPAI", role: "coordinator" }
];

async function runDevSeeder(customStore = null) {
  // ATURAN MUTLAK: Menolak jalan jika NODE_ENV=production
  if (process.env.NODE_ENV === "production") {
    throw new Error("seed:dev DITOLAK: dilarang menjalankan seeder dev pada production environment!");
  }

  const store = customStore || getStore();
  const tokenRecords = [];

  // 1. Daftarkan 20 mahasiswa DEV
  for (const s of DEV_STUDENTS) {
    const plaintextToken = generateStudentToken();
    const tokenHash = bcrypt.hashSync(plaintextToken, 10);

    await store.saveStudent({
      ...s,
      tokenHash,
      createdAt: new Date().toISOString()
    });

    tokenRecords.push({ ...s, token: plaintextToken });
  }

  // 2. Daftarkan akun Asesor & Koordinator
  for (const a of DEV_ASSESSORS) {
    const passwordHash = bcrypt.hashSync(a.passwordPlain, 10);
    await store.saveAssessor({
      username: a.username,
      passwordHash,
      nama: a.nama,
      role: a.role
    });
  }

  // 3. Tulis file data/dev_tokens.csv (masuk .gitignore)
  const defaultOutputDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(defaultOutputDir)) {
    fs.mkdirSync(defaultOutputDir, { recursive: true });
  }
  const outPath = path.join(defaultOutputDir, "dev_tokens.csv");
  let csvOut = "nim,nama,gender,corridor,group,seat,login_token\n";
  tokenRecords.forEach((t) => {
    csvOut += `"${t.nim}","${t.nama}","${t.gender}","${t.corridor}","${t.group}",${t.seat},"${t.token}"\n`;
  });
  fs.writeFileSync(outPath, csvOut, "utf8");

  console.log(`[seed:dev] Sukses mendaftarkan 20 mahasiswa DEV dan ${DEV_ASSESSORS.length} akun asesor.`);
  console.log(`[seed:dev] Token mahasiswa DEV disimpan ke: ${outPath}`);
  return { students: tokenRecords, assessors: DEV_ASSESSORS, outputPath: outPath };
}

if (require.main === module) {
  runDevSeeder()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(`[seed:dev ERROR] ${err.message}`);
      process.exit(1);
    });
}

module.exports = { runDevSeeder, DEV_STUDENTS, DEV_ASSESSORS };
