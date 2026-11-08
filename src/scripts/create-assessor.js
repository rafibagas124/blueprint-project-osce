const readline = require("readline");
const bcrypt = require("bcryptjs");
const { getStore } = require("../store");

/**
 * Membaca password dari terminal dengan input tersembunyi (hanya pada terminal TTY).
 * Jika stdin bukan terminal, langsung gagal dengan pesan jelas.
 */
function promptHiddenPassword(query = "Masukkan password (minimal 12 karakter): ") {
  return new Promise((resolve, reject) => {
    if (!process.stdin.isTTY) {
      return reject(new Error("CLI create-assessor memerlukan terminal interaktif (TTY) untuk input password tersembunyi. Untuk pengujian atau script, gunakan fungsi createAssessor() secara langsung."));
    }

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    process.stdin.setRawMode(true);
    process.stdout.write(query);
    let input = "";

    const onData = (chunk) => {
      const str = chunk.toString("utf8");
      for (const char of str) {
        if (char === "\r" || char === "\n" || char === "\u0004") {
          process.stdin.setRawMode(false);
          process.stdin.removeListener("data", onData);
          process.stdout.write("\n");
          rl.close();
          return resolve(input);
        } else if (char === "\u0003") { // Ctrl+C
          process.stdin.setRawMode(false);
          process.stdin.removeListener("data", onData);
          process.stdout.write("\n");
          process.exit(1);
        } else if (char === "\b" || char === "\x7f") { // Backspace
          if (input.length > 0) {
            input = input.slice(0, -1);
          }
        } else {
          input += char;
        }
      }
    };

    process.stdin.on("data", onData);
  });
}

/**
 * Logika murni pembuatan akun Asesor/Koordinator.
 * Dipakai baik oleh CLI terminal maupun oleh tes unit secara langsung.
 */
async function createAssessor({ username, role, password, nama, customStore = null }) {
  if (!username || typeof username !== "string" || username.trim().length < 3) {
    throw new Error("Username wajib diisi (minimal 3 karakter).");
  }

  const cleanUsername = username.trim().toLowerCase();

  const validRoles = ["koordinator", "coordinator", "asesor", "assessor"];
  const rawRole = String(role || "").trim().toLowerCase();
  if (!validRoles.includes(rawRole)) {
    throw new Error("Peran (role) tidak valid. Pilih 'koordinator' atau 'asesor'.");
  }

  // Normalisasi peran internal yang sudah ada
  const canonicalRole = (rawRole === "koordinator" || rawRole === "coordinator") ? "coordinator" : "assessor";

  if (!password || typeof password !== "string" || password.length < 12) {
    throw new Error("Password minimal 12 karakter.");
  }

  const store = customStore || getStore();

  // Tolak username ganda
  const existing = await store.findAssessorByUsername(cleanUsername);
  if (existing) {
    throw new Error(`Username '${cleanUsername}' sudah terdaftar. Gunakan username lain.`);
  }

  // Hash password dengan bcrypt (salt rounds = 10)
  const passwordHash = bcrypt.hashSync(password, 10);

  const newAccount = {
    username: cleanUsername,
    passwordHash,
    nama: (nama && String(nama).trim()) || cleanUsername,
    role: canonicalRole,
    createdAt: new Date().toISOString()
  };

  await store.saveAssessor(newAccount);

  return {
    ok: true,
    username: cleanUsername,
    role: canonicalRole,
    nama: newAccount.nama
  };
}

// Alias untuk kompatibilitas
const createAssessorAccount = createAssessor;

/**
 * CLI Runner: npm run create:assessor -- --username <nama> --role <koordinator|asesor>
 */
async function main() {
  if (!process.stdin.isTTY) {
    console.error("GALAT: CLI create-assessor memerlukan terminal interaktif (TTY) untuk menerima password tersembunyi.");
    console.error("Untuk otomatisasi atau pengujian, panggil fungsi createAssessor({username, role, password}) secara langsung.");
    process.exit(1);
  }

  const args = process.argv.slice(2);

  // Larangan mutlak: tolak jika password dimasukkan via argumen baris perintah
  const hasPasswordArg = args.some((a) => a.startsWith("--password") || a.startsWith("-p"));
  if (hasPasswordArg) {
    console.error("GALAT: Dilarang memasukkan password lewat argumen baris perintah.");
    console.error("Password harus dimasukkan lewat prompt terminal interaktif demi keamanan riwayat shell.");
    process.exit(1);
  }

  let username = "";
  let role = "";
  let nama = "";

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--username" && args[i + 1]) {
      username = args[i + 1];
      i++;
    } else if (args[i] === "--role" && args[i + 1]) {
      role = args[i + 1];
      i++;
    } else if (args[i] === "--nama" && args[i + 1]) {
      nama = args[i + 1];
      i++;
    }
  }

  if (!username || !role) {
    console.error("Penggunaan:");
    console.error("  npm run create:assessor -- --username <nama> --role <koordinator|asesor> [--nama \"Nama Lengkap\"]");
    process.exit(1);
  }

  try {
    const password = await promptHiddenPassword(`Masukkan password untuk akun '${username}' (minimal 12 karakter): `);

    const result = await createAssessor({
      username,
      role,
      password,
      nama
    });

    console.log(`Sukses: Akun ${result.role} '${result.username}' berhasil dibuat.`);
  } catch (err) {
    console.error(`GALAT: ${err.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  createAssessor,
  createAssessorAccount,
  promptHiddenPassword
};
