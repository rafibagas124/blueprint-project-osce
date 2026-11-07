// =========================================================================
// PWA: pendaftaran service worker + tombol "Install App"
//  - Android / Chrome / Edge (Windows, macOS): prompt install bawaan
//  - iPhone / iPad / Safari macOS: panduan "Tambah ke Layar Utama / Dock"
// =========================================================================

(function () {
  let deferredPrompt = null;
  const isStandalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isMacSafari = /Macintosh/.test(ua) && /Safari/.test(ua) && !/Chrome|Chromium|Edg/.test(ua);

  if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost" || location.hostname === "127.0.0.1")) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("sw.js").catch((e) => console.warn("SW gagal:", e));
    });
  }

  function showInstallBtn() {
    const btn = document.getElementById("btn-pwa-install");
    if (btn && !isStandalone) btn.classList.remove("hidden");
  }

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    showInstallBtn();
  });

  window.addEventListener("appinstalled", () => {
    const btn = document.getElementById("btn-pwa-install");
    if (btn) btn.classList.add("hidden");
    deferredPrompt = null;
  });

  window.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("btn-pwa-install");
    if (!btn) return;

    if (isIOS || isMacSafari) showInstallBtn(); // Safari tidak mengirim beforeinstallprompt

    btn.addEventListener("click", async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        await deferredPrompt.userChoice;
        deferredPrompt = null;
        btn.classList.add("hidden");
      } else if (isIOS) {
        alert("Cara install di iPhone / iPad:\n1. Buka halaman ini di Safari\n2. Ketuk tombol Bagikan (kotak dengan panah ke atas)\n3. Pilih 'Tambah ke Layar Utama'\n4. Ketuk 'Tambah'");
      } else if (isMacSafari) {
        alert("Cara install di MacBook (Safari 17+):\n1. Menu File > Add to Dock\n2. Ketuk 'Add'");
      } else {
        alert("Gunakan menu browser: Install app / Tambahkan ke layar utama.\n(Syarat: halaman dibuka lewat https atau localhost.)");
      }
    });
  });
})();

