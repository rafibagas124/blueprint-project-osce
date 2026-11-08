const { describe, it, before, after } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const {
  prepareDemoData,
  writeCredentialsFile,
  DEMO_STUDENT_NAMES,
  generateRandomStudentToken,
  generateRandomCoordinatorPassword
} = require("../../src/scripts/demo");
const { store } = require("../../server");

describe("Fitur Demo Penguji: npm run demo & Kredensial Acak", () => {
  const ROOT_DIR = path.resolve(__dirname, "../..");
  const testDataDir = path.join(ROOT_DIR, "data");

  it("1. Demo menolak berjalan pada NODE_ENV=production", async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";

    try {
      await assert.rejects(
        async () => {
          await prepareDemoData();
        },
        (err) => /production/i.test(err.message)
      );
    } finally {
      process.env.NODE_ENV = originalEnv;
    }
  });

  it("2. Membuat data 20 mahasiswa DEV (10 Koridor A, 10 Koridor B, 1 grup, seat 1-10)", async () => {
    const demoData = await prepareDemoData();
    assert.strictEqual(demoData.students.length, 20);

    const korA = demoData.students.filter((s) => s.corridor === "KOR-A");
    const korB = demoData.students.filter((s) => s.corridor === "KOR-B");

    assert.strictEqual(korA.length, 10);
    assert.strictEqual(korB.length, 10);

    // Semua NIM berawalan DEV-
    demoData.students.forEach((s) => {
      assert.ok(s.nim.startsWith("DEV-"), `NIM harus berawalan DEV-, ditemukan: ${s.nim}`);
      assert.ok(s.token && s.token.startsWith("TK-"), "Token mahasiswa harus ada dan berformat TK-");
      assert.strictEqual(s.group, "GRP-DEMO");
      assert.ok(s.seat >= 1 && s.seat <= 10);
    });

    // Koordinator dev-koordinator
    assert.strictEqual(demoData.coordinator.username, "dev-koordinator");
    assert.strictEqual(demoData.coordinator.role, "coordinator");
    assert.ok(demoData.coordinator.password.length >= 12, "Password koordinator harus >= 12 karakter");
  });

  it("3. Kredensial acak dan berbeda tiap eksekusi", async () => {
    const run1 = await prepareDemoData();
    const run2 = await prepareDemoData();

    // Password koordinator harus berbeda
    assert.notStrictEqual(run1.coordinator.password, run2.coordinator.password);

    // Token mahasiswa harus berbeda
    const tokensRun1 = run1.students.map((s) => s.token);
    const tokensRun2 = run2.students.map((s) => s.token);

    assert.notDeepStrictEqual(tokensRun1, tokensRun2);
  });

  it("4. Kredensial ditulis ke file data/demo-credentials.txt", async () => {
    const demoData = await prepareDemoData();
    const filePath = writeCredentialsFile(demoData, 3000);

    assert.ok(fs.existsSync(filePath), "File demo-credentials.txt harus dibuat");
    const content = fs.readFileSync(filePath, "utf8");

    assert.ok(content.includes("http://localhost:3000/blueprint.html"));
    assert.ok(content.includes("dev-koordinator"));
    assert.ok(content.includes(demoData.coordinator.password));
    assert.ok(content.includes("DEV-001"));
    assert.ok(content.includes("DEV-020"));
  });

  it("5. File data/demo-credentials.txt tidak terlacak Git (ter-ignore)", () => {
    const credPath = "data/demo-credentials.txt";
    // Jalankan git check-ignore untuk memastikan diabaikan oleh .gitignore
    const output = execSync(`git check-ignore ${credPath}`, { encoding: "utf8" }).trim();
    assert.strictEqual(output.replace(/\\/g, "/"), credPath);

    // Pastikan git status tidak menampilkan file tersebut
    const statusOutput = execSync("git status --porcelain data/demo-credentials.txt", { encoding: "utf8" }).trim();
    assert.strictEqual(statusOutput, "", "data/demo-credentials.txt tidak boleh muncul di git status");
  });

  it("6. Tidak ada password tetap di src/, test/, .env.example", () => {
    // 1. Pastikan .env.example tidak memuat password tetap
    if (fs.existsSync(path.join(ROOT_DIR, ".env.example"))) {
      const envExample = fs.readFileSync(path.join(ROOT_DIR, ".env.example"), "utf8");
      assert.strictEqual(/PASSWORD=[^\r\n\s]+/i.test(envExample), false, ".env.example tidak boleh memuat password tetap");
    }

    // 2. Pastikan seeder src/scripts/demo.js dan seed-dev.js tidak memuat password tetap
    const demoScript = fs.readFileSync(path.join(ROOT_DIR, "src/scripts/demo.js"), "utf8");
    assert.strictEqual(/password:\s*["'][^"']+["']/i.test(demoScript), false, "demo.js tidak boleh memuat password tetap hardcoded");

    // 3. Pastikan test tidak menggunakan password tetap umum (admin, password, secret123)
    const testFiles = fs.readdirSync(path.join(ROOT_DIR, "test/unit")).filter((f) => f.endsWith(".js"));
    testFiles.forEach((tf) => {
      const content = fs.readFileSync(path.join(ROOT_DIR, "test/unit", tf), "utf8");
      assert.strictEqual(
        /password:\s*["'](?:admin|password|secret|123456)/i.test(content),
        false,
        `Test ${tf} tidak boleh memuat password tetap`
      );
    });
  });

  it("7. blueprint.html memuat teks peringatan akses file://", () => {
    const bpPath = path.join(ROOT_DIR, "blueprint.html");
    const html = fs.readFileSync(bpPath, "utf8");

    assert.ok(
      html.includes("Buka lewat http://localhost:PORT/blueprint.html, bukan langsung dari file."),
      "blueprint.html harus memuat pesan peringatan file://"
    );
  });
});
