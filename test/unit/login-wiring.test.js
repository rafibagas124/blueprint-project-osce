const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

test("Verifikasi Pengkabelan Event Login, Fallback WebGL, dan Komponen Notifikasi Error", async (t) => {
  const appJsPath = path.resolve(__dirname, "../../js/app.js");
  const inputJsPath = path.resolve(__dirname, "../../js/input.js");
  const blueprintHtmlPath = path.resolve(__dirname, "../../blueprint.html");
  const swJsPath = path.resolve(__dirname, "../../sw.js");
  const launchJsonPath = path.resolve(__dirname, "../../.vscode/launch.json");

  const appJs = fs.readFileSync(appJsPath, "utf8");
  const inputJs = fs.readFileSync(inputJsPath, "utf8");
  const blueprintHtml = fs.readFileSync(blueprintHtmlPath, "utf8");
  const swJs = fs.readFileSync(swJsPath, "utf8");
  const launchJson = JSON.parse(fs.readFileSync(launchJsonPath, "utf8"));

  await t.test("1. window.onload di js/app.js memanggil wireEvents() SEBELUM initThreeJS()", () => {
    assert.match(appJs, /window\.onload\s*=\s*function/);
    const onloadBlock = appJs.slice(appJs.indexOf("window.onload = function"));
    const idxWireEvents = onloadBlock.indexOf("wireEvents();");
    const idxInitThree = onloadBlock.indexOf("initThreeJS();");

    assert.ok(idxWireEvents !== -1, "wireEvents() harus dipanggil di window.onload");
    assert.ok(idxInitThree !== -1, "initThreeJS() harus dipanggil di window.onload");
    assert.ok(
      idxWireEvents < idxInitThree,
      `wireEvents() (pos ${idxWireEvents}) harus dipanggil sebelum initThreeJS() (pos ${idxInitThree})`
    );
  });

  await t.test("2. Fallback WebGL multi-tier di initThreeJS dan pesan error baru", () => {
    const initThreeBlock = appJs.slice(appJs.indexOf("function initThreeJS()"), appJs.indexOf("function showLoginError"));
    assert.match(initThreeBlock, /high-performance/);
    assert.match(initThreeBlock, /fallback-default/);
    assert.match(initThreeBlock, /low-power/);
    assert.match(initThreeBlock, /\[WebGL\] mode:/);

    // Pesan error WebGL baru di showLoginError
    const expectedMsg = "Grafik 3D (WebGL) gagal dimulai. Jalankan aplikasi lewat F5 di VS Code (pilih 'OSCE: Demo') agar terbuka di Chrome bersih, atau coba Microsoft Edge. Alternatif: aktifkan akselerasi hardware di pengaturan browser (chrome://settings/system).";
    assert.ok(appJs.includes(expectedMsg), "Pesan kegagalan WebGL baru harus ada di js/app.js");
  });

  await t.test("3. blueprint.html memiliki elemen #login-error dengan atribut role='alert' dan aria-live='polite'", () => {
    assert.match(blueprintHtml, /id=["']login-error["']/);
    assert.match(blueprintHtml, /role=["']alert["']/);
    assert.match(blueprintHtml, /aria-live=["']polite["']/);

    // Pastikan berada sebelum tombol submit
    const idxErrorBox = blueprintHtml.indexOf('id="login-error"');
    const idxSubmitBtn = blueprintHtml.indexOf('id="btn-login-submit"');
    assert.ok(idxErrorBox !== -1 && idxSubmitBtn !== -1, "Kedua elemen harus ada");
    assert.ok(idxErrorBox < idxSubmitBtn, "#login-error harus berada tepat di atas #btn-login-submit");
  });

  await t.test("4. Helper showLoginError dan clearLoginError menggunakan textContent aman (bukan innerHTML)", () => {
    assert.match(appJs, /function showLoginError\(/);
    assert.match(appJs, /function clearLoginError\(/);

    const showFn = appJs.slice(appJs.indexOf("function showLoginError"));
    const showFnBody = showFn.slice(0, showFn.indexOf("}"));
    assert.match(showFnBody, /\.textContent\s*=\s*message/, "showLoginError wajib menggunakan textContent");
    assert.doesNotMatch(showFnBody, /\.innerHTML/, "showLoginError tidak boleh menggunakan innerHTML untuk cegah XSS");
  });

  await t.test("5. handleLoginSubmit memanggil showLoginError pada validasi kosong, error server, dan network error", () => {
    const fnStart = appJs.indexOf("async function handleLoginSubmit()");
    assert.ok(fnStart !== -1, "handleLoginSubmit harus ada");
    const fnCode = appJs.slice(fnStart, fnStart + 8000);

    // Membersihkan error di awal
    assert.match(fnCode, /clearLoginError\(\)/);

    // Pencegahan submit jika WebGL gagal
    assert.match(fnCode, /__webglReady\s*===\s*false/);

    // Validasi kosong memanggil showLoginError
    assert.match(fnCode, /Harap masukkan NIM dan Token Ujian/);
    assert.match(fnCode, /Harap masukkan Username dan Password Asesor/);

    // Network error / server mati
    assert.match(fnCode, /Tidak bisa terhubung ke server/);
    assert.match(fnCode, /showLoginError\(netErrMsg\)/);

    // Loading UX: tombol disabled saat memproses dan dipulihkan di finally
    assert.match(fnCode, /btnSubmit\.disabled\s*=\s*true/);
    assert.match(fnCode, /Memproses\.\.\./);
    assert.match(fnCode, /finally\s*\{/);
    assert.match(fnCode, /btnSubmit\.disabled\s*=\s*false/);
  });

  await t.test("6. js/input.js memasang pembersih error saat mengetik dan mendukung submit via tombol Enter", () => {
    assert.match(inputJs, /clearLoginError\(\)/);
    assert.match(inputJs, /e\.key\s*===\s*["']Enter["']/);
    assert.match(inputJs, /handleLoginSubmit\(\)/);
  });

  await t.test("7. sw.js menggunakan CACHE_NAME 'osce-center-3d-v8'", () => {
    assert.match(swJs, /const CACHE_NAME\s*=\s*["']osce-center-3d-v8["']/);
  });

  await t.test("8. .vscode/launch.json memiliki config Browser WebGL aman dengan argumen SwiftShader", () => {
    const chromeCfg = launchJson.configurations.find((c) => c.name === "OSCE: Browser (WebGL aman)");
    assert.ok(chromeCfg, "Config 'OSCE: Browser (WebGL aman)' harus ada");
    assert.equal(chromeCfg.type, "chrome");
    assert.equal(chromeCfg.request, "launch");
    assert.ok(!chromeCfg.userDataDir, "userDataDir tidak boleh diset agar profil bersih");
    assert.deepEqual(chromeCfg.runtimeArgs, ["--ignore-gpu-blocklist", "--enable-unsafe-swiftshader"]);

    const demoCfg = launchJson.configurations.find((c) => c.name.startsWith("OSCE: Demo"));
    assert.ok(demoCfg, "Config Demo harus ada");
    assert.equal(demoCfg.serverReadyAction.action, "startDebugging");
    assert.equal(demoCfg.serverReadyAction.name, "OSCE: Browser (WebGL aman)");
    assert.equal(demoCfg.serverReadyAction.uriFormat, undefined, "uriFormat harus dihapus");
  });

  await t.test("9. Tes regresi: wingOffsetX terdefinisi dan setiap file di js/ yang memanggilnya tidak berdiri tanpa definisi", () => {
    assert.match(appJs, /function wingOffsetX\(\)/, "js/app.js harus memuat definisi function wingOffsetX()");

    const jsDir = path.resolve(__dirname, "../../js");
    const jsFiles = fs.readdirSync(jsDir).filter((f) => f.endsWith(".js"));

    const callers = [];
    for (const f of jsFiles) {
      const content = fs.readFileSync(path.join(jsDir, f), "utf8");
      if (content.includes("wingOffsetX(")) {
        callers.push(f);
      }
    }

    assert.ok(callers.length > 0, "Harus ada file yang memanggil wingOffsetX");
    assert.ok(callers.includes("app.js"), "app.js memanggil wingOffsetX");

    for (const caller of callers) {
      assert.ok(
        blueprintHtml.includes(`src="js/${caller}"`),
        `File ${caller} yang memanggil wingOffsetX harus dimuat di blueprint.html bersama app.js`
      );
    }
    assert.ok(blueprintHtml.includes('src="js/app.js"'), "js/app.js yang mendefinisikan wingOffsetX harus dimuat di blueprint.html");
  });

  await t.test("10. window.onload dan handleLoginSubmit membedakan error WebGL vs error inisialisasi 3D lainnya", () => {
    assert.match(appJs, /\/webgl\|context\/i/);
    assert.match(appJs, /Terjadi kesalahan saat memuat dunia 3D:/);
    assert.match(appJs, /Buka Console \(F12\) untuk detail/);
  });
});
