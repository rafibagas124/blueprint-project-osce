// =========================================================================
// SEEDER ROSTER ASLI DARI FILE CSV
// Penggunaan: npm run seed:roster -- <path/ke/roster.csv> [path/ke/output_tokens.csv]
// =========================================================================

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const { getStore } = require("../store");
const { CorridorCapacityError, SeatConflictError, RosterValidationError } = require("../store/store-interface");

function parseCSV(content) {
  const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];

  const delimiter = lines[0].includes(";") ? ";" : ",";
  const headers = lines[0].split(delimiter).map((h) => h.trim().toLowerCase().replace(/^["']|["']$/g, ""));

  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const rawCols = lines[i].split(delimiter).map((c) => c.trim().replace(/^["']|["']$/g, ""));
    if (rawCols.length < headers.length) continue;
    const row = {};
    headers.forEach((h, idx) => {
      row[h] = rawCols[idx];
    });
    rows.push(row);
  }
  return rows;
}

function generateStudentToken() {
  return "TK-" + crypto.randomBytes(4).toString("hex").toUpperCase();
}

async function runRosterSeeder(inputCsvPath, outputCsvPath) {
  if (!inputCsvPath) {
    throw new Error("Harap sertakan file CSV roster: npm run seed:roster -- <file.csv>");
  }

  const resolvedInput = path.resolve(process.cwd(), inputCsvPath);
  if (!fs.existsSync(resolvedInput)) {
    throw new Error(`File CSV tidak ditemukan pada: ${resolvedInput}`);
  }

  const store = getStore();
  const rawContent = fs.readFileSync(resolvedInput, "utf8");
  const rows = parseCSV(rawContent);

  if (rows.length === 0) {
    throw new Error("File CSV kosong atau tidak memiliki baris data valid.");
  }

  const seenNims = new Set();
  const groupCorridorSeats = new Map(); // `${group}:${corridor}` -> Set<seat>
  const groupCorridorCounts = new Map(); // `${group}:${corridor}` -> count
  const tokenRecords = [];

  for (let idx = 0; idx < rows.length; idx++) {
    const r = rows[idx];
    const rowNum = idx + 2;

    const nim = String(r.nim || "").trim();
    const nama = String(r.nama || r.name || "").trim();
    let gender = String(r.gender || r.jenis_kelamin || "").trim().toUpperCase();
    if (gender === "LAKI-LAKI" || gender === "MALE" || gender === "L") gender = "L";
    else if (gender === "PEREMPUAN" || gender === "FEMALE" || gender === "P") gender = "P";

    let corridor = String(r.corridor || r.koridor || "").trim().toUpperCase();
    if (corridor === "A" || corridor === "KOR-A") corridor = "KOR-A";
    else if (corridor === "B" || corridor === "KOR-B") corridor = "KOR-B";

    const group = String(r.group || r.grup || "GRP-01").trim();
    const seat = parseInt(r.seat || r.kursi, 10);

    // 1. Validasi Keberadaan Field
    if (!nim || !nama) {
      throw new RosterValidationError(`Baris ${rowNum}: NIM dan Nama wajib diisi.`);
    }

    // 2. Validasi NIM Duplikat dalam file
    if (seenNims.has(nim)) {
      throw new RosterValidationError(`Baris ${rowNum}: Duplikat NIM '${nim}' ditolak.`);
    }
    seenNims.add(nim);

    // 3. Validasi Gender (L/P)
    if (gender !== "L" && gender !== "P") {
      throw new RosterValidationError(`Baris ${rowNum}: Gender untuk NIM ${nim} harus 'L' atau 'P'.`);
    }

    // 4. Validasi Koridor (KOR-A / KOR-B)
    if (corridor !== "KOR-A" && corridor !== "KOR-B") {
      throw new RosterValidationError(`Baris ${rowNum}: Koridor untuk NIM ${nim} harus 'KOR-A' atau 'KOR-B'.`);
    }

    // 5. Validasi Seat (1-10)
    if (isNaN(seat) || seat < 1 || seat > 10) {
      throw new RosterValidationError(`Baris ${rowNum}: Seat untuk NIM ${nim} harus bilangan bulat 1-10.`);
    }

    // 6. Validasi Kapasitas Koridor (Maks 10 per koridor per group)
    const gcKey = `${group}:${corridor}`;
    const curCount = groupCorridorCounts.get(gcKey) || 0;
    if (curCount >= 10) {
      throw new CorridorCapacityError(`Baris ${rowNum}: Batas maksimal 10 mahasiswa di ${corridor} grup ${group} telah tercapai.`);
    }

    // 7. Validasi Seat Unik per (group, corridor)
    let seatsInGC = groupCorridorSeats.get(gcKey);
    if (!seatsInGC) {
      seatsInGC = new Set();
      groupCorridorSeats.set(gcKey, seatsInGC);
    }
    if (seatsInGC.has(seat)) {
      throw new SeatConflictError(`Baris ${rowNum}: Seat ${seat} sudah digunakan oleh mahasiswa lain di ${corridor} grup ${group}.`);
    }
    seatsInGC.add(seat);
    groupCorridorCounts.set(gcKey, curCount + 1);

    // Generate Token Login
    const plaintextToken = generateStudentToken();
    const tokenHash = bcrypt.hashSync(plaintextToken, 10);

    // Simpan ke Store
    await store.saveStudent({
      nim,
      nama,
      gender,
      corridor,
      group,
      seat,
      tokenHash,
      createdAt: new Date().toISOString()
    });

    tokenRecords.push({ nim, nama, gender, corridor, group, seat, token: plaintextToken });
  }

  // Tulis Plaintext Token ke CSV Terpisah (Masuk .gitignore)
  const defaultOutputDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(defaultOutputDir)) {
    fs.mkdirSync(defaultOutputDir, { recursive: true });
  }
  const outPath = outputCsvPath
    ? path.resolve(process.cwd(), outputCsvPath)
    : path.join(defaultOutputDir, `tokens_${Date.now()}.csv`);

  let csvOut = "nim,nama,gender,corridor,group,seat,login_token\n";
  tokenRecords.forEach((t) => {
    csvOut += `"${t.nim}","${t.nama}","${t.gender}","${t.corridor}","${t.group}",${t.seat},"${t.token}"\n`;
  });
  fs.writeFileSync(outPath, csvOut, "utf8");

  console.log(`[seed:roster] Berhasil mendaftarkan ${tokenRecords.length} mahasiswa ke Store.`);
  console.log(`[seed:roster] Token login plaintext dicetak ke: ${outPath}`);
  console.log(`[seed:roster] PERINGATAN: File token masuk .gitignore dan jangan pernah di-commit.`);
  return { count: tokenRecords.length, outputPath: outPath };
}

if (require.main === module) {
  const input = process.argv[2];
  const output = process.argv[3];
  runRosterSeeder(input, output)
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(`[seed:roster ERROR] ${err.message}`);
      process.exit(1);
    });
}

module.exports = { runRosterSeeder, generateStudentToken };
