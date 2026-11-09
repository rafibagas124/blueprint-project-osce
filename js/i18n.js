// =========================================================================
// INTERNATIONALIZATION (i18n) & TOAST NOTIFICATION ENGINE
// Fitur:
// 1. Deteksi otomatis bahasa perangkat (navigator.language / languages)
//    Jika bahasa perangkat bukan Bahasa Indonesia ('id'), otomatis menerjemahkan
//    seluruh antarmuka ke Bahasa Inggris ('en') / bahasa perangkat.
// 2. Tombol switch bahasa instan (ID / EN) di halaman Login & HUD Atas.
// 3. Sistem Toast Notification modern pengganti alert() yang memblokir layar.
// =========================================================================

const OSCE_I18N = {
  currentLang: "id",

  dictionary: {
    id: {
      login_title: "Gerbang Masuk OSCE Center 3D",
      login_subtitle: "Simulasi Ujian Kompetensi Apoteker & Dokter (UKMPPAI) Berbasis Web",
      login_name_label: "Nama Lengkap Mahasiswa / Dosen:",
      login_name_placeholder: "Masukkan nama lengkap beserta gelar...",
      login_nim_label: "Nomor Induk Mahasiswa (NIM) / NIDN:",
      login_nim_placeholder: "Contoh: 2024-08192",
      login_gender_label: "Pilih Jenis Kelamin & Karakter 3D:",
      login_gender_female: "👩‍⚕️ Perempuan (Mahasiswi Berhijab Rapi & Jas Snelli)",
      login_gender_male: "👨‍⚕️ Laki-laki (Mahasiswa Berambut Rapi & Jas Snelli)",
      login_role_label: "Pilih Peran Pengguna:",
      login_role_student: "🎓 Mahasiswa / Peserta Ujian OSCE",
      login_role_assessor: "👨‍🏫 Dosen / Asesor Penguji (Fitur Input Petunjuk & Rubrik)",
      login_pin_label: "PIN Asesor (diberikan panitia ujian):",
      login_pin_placeholder: "Masukkan PIN asesor (default: 2026)",
      login_badge_info: "✨ Kartu Tanda Pengenal Otomatis: Data Nama, NIM, dan Jenis Kelamin akan langsung tertempel pada kartu identitas di dada kanan avatar 3D Anda!",
      login_submit: "Masuk ke Simulasi Ujian OSCE →",
      hud_prep_time: "Waktu persiapan",
      hud_work_time: "Waktu kerja",
      hud_candidate_mode: "Kandidat Peserta",
      hud_assessor_mode: "Mode Asesor Penguji",
      hud_skip_time: "Lewati sisa waktu",
      hud_move: "Bergerak",
      hud_look: "Melihat",
      hud_use: "Gunakan",
      hud_cam_3rd: "Kamera Orang ke-3",
      hud_cam_1st: "Kamera Orang ke-1",
      hud_peers_btn: "👥 Mahasiswa",
      hud_map_btn: "Peta 10 Station",
      hud_score_btn: "Nilai Ujian",
      hud_edit_prompt: "Edit Petunjuk",
      hud_voice: "Suara",
      hud_rotation: "Rotasi:",
      hud_station_order: "Urutan station",
      hud_completed: "selesai",
      hud_exit_room: "← Keluar ke Koridor",
      hud_sit_chair: "Duduk di kursi tunggu",
      hud_read_enter: "Baca Petunjuk & Masuk",
      hud_read_prompt: "Baca Petunjuk Peserta",
      hud_enter_room: "Masuk Ruangan Station",
      hud_open_workstation: "Buka Lembar Kerja",
      hud_sit_action: "Duduk",
      toast_login_required: "Harap masukkan Nama Lengkap dan NIM sebelum masuk ke simulasi OSCE!",
      toast_pin_required: "Masukkan PIN Asesor yang diberikan panitia ujian.",
      toast_select_decision: "Pilih keputusan klinis atau selesaikan simulasi interaktif terlebih dahulu!",
      toast_saved: "Data berhasil disimpan!",
      toast_lang_switched: "Bahasa antarmuka diatur ke Bahasa Indonesia (ID)",
      tutorial_title: "Panduan Cepat Simulasi OSCE 3D",
      tutorial_step1: "1. Duduk di kursi tunggu biru & baca papan petunjuk di samping pintu saat lampu pintu MERAH (Waktu Persiapan).",
      tutorial_step2: "2. Saat lampu atas pintu berubah HIJAU, tekan [E] atau klik pintu untuk masuk ke ruangan station.",
      tutorial_step3: "3. Di dalam ruangan: ajak bicara Pasien AI (bisa lewat mikrofon/teks), gunakan alat simulasi 3D interaktif, lalu isi keputusan klinis."
    },
    en: {
      login_title: "OSCE Center 3D — Entry Portal",
      login_subtitle: "Web-Based Pharmacist & Medical Competency Exam Simulation (UKMPPAI)",
      login_name_label: "Full Name (Candidate / Assessor):",
      login_name_placeholder: "Enter your full name and title...",
      login_nim_label: "Student ID (NIM) / Faculty ID:",
      login_nim_placeholder: "Example: 2024-08192",
      login_gender_label: "Select Gender & 3D Avatar Model:",
      login_gender_female: "👩‍⚕️ Female (Hijab & White Clinical Lab Coat)",
      login_gender_male: "👨‍⚕️ Male (Formal Hair & White Clinical Lab Coat)",
      login_role_label: "Select User Role:",
      login_role_student: "🎓 Student / OSCE Exam Candidate",
      login_role_assessor: "👨‍🏫 Faculty / OSCE Examiner (Rubric, Replay & Prompt Editor)",
      login_pin_label: "Assessor PIN (provided by exam committee):",
      login_pin_placeholder: "Enter Assessor PIN (default: 2026)",
      login_badge_info: "✨ Automatic 3D ID Badge: Your Name, ID, and Gender are dynamically rendered on the right-chest ID card of your 3D avatar!",
      login_submit: "Enter OSCE Exam Simulation →",
      hud_prep_time: "Preparation Time",
      hud_work_time: "Working Time",
      hud_candidate_mode: "Exam Candidate",
      hud_assessor_mode: "Examiner Mode",
      hud_skip_time: "Skip remaining time",
      hud_move: "Move",
      hud_look: "Look",
      hud_use: "Interact",
      hud_cam_3rd: "3rd Person Cam",
      hud_cam_1st: "1st Person Cam",
      hud_peers_btn: "👥 Candidates",
      hud_map_btn: "10-Station Map",
      hud_score_btn: "Exam Report",
      hud_edit_prompt: "Edit Door Prompt",
      hud_voice: "Audio",
      hud_rotation: "Rotation:",
      hud_station_order: "Station progress",
      hud_completed: "done",
      hud_exit_room: "← Exit to Corridor",
      hud_sit_chair: "Sit on waiting chair",
      hud_read_enter: "Read Prompt & Enter",
      hud_read_prompt: "Read Candidate Prompt",
      hud_enter_room: "Enter Station Room",
      hud_open_workstation: "Open Workstation",
      hud_sit_action: "Sit",
      toast_login_required: "Please enter your Full Name and Student ID before entering the OSCE simulation!",
      toast_pin_required: "Please enter the Assessor PIN provided by the committee.",
      toast_select_decision: "Please select a clinical decision or complete the interactive simulation first!",
      toast_saved: "Data saved successfully!",
      toast_lang_switched: "Interface language automatically set to English (Device Locale Detected)",
      tutorial_title: "Quick Guide: 3D OSCE Simulation",
      tutorial_step1: "1. Sit on the blue waiting chair & read the door instruction poster while the overhead door lamp is RED (Prep Phase).",
      tutorial_step2: "2. When the overhead door lamp turns GREEN, press [E] or click the door to enter the station room.",
      tutorial_step3: "3. Inside the room: interview the AI Patient (via voice mic or text), operate the interactive 3D lab instruments, and submit your clinical decision."
    }
  },

  detectDeviceLanguage() {
    try {
      const saved = localStorage.getItem("osce_lang_pref");
      if (saved === "id" || saved === "en") {
        this.currentLang = saved;
        return this.currentLang;
      }
      const rawLang = (navigator.languages && navigator.languages[0]) || navigator.language || "id";
      const short = String(rawLang).toLowerCase().slice(0, 2);
      // Jika perangkat bukan Bahasa Indonesia ('id'), otomatis terjemahkan ke Inggris ('en')
      this.currentLang = (short === "id") ? "id" : "en";
    } catch (e) {
      this.currentLang = "id";
    }
    return this.currentLang;
  },

  t(key, fallback = "") {
    const pack = this.dictionary[this.currentLang] || this.dictionary.id;
    return pack[key] || this.dictionary.id[key] || fallback || key;
  },

  setLanguage(lang, notify = true) {
    this.currentLang = (lang === "en") ? "en" : "id";
    try { localStorage.setItem("osce_lang_pref", this.currentLang); } catch (e) {}
    document.documentElement.lang = this.currentLang;
    this.applyDomTranslations();
    if (typeof updateHUD === "function" && typeof state !== "undefined" && state.isLoggedIn) {
      updateHUD();
    }
    if (notify) {
      showToast(this.t("toast_lang_switched"), "info");
    }
  },

  toggleLanguage() {
    this.setLanguage(this.currentLang === "id" ? "en" : "id", true);
  },

  applyDomTranslations() {
    const isEn = (this.currentLang === "en");
    const mapText = {
      "chair-marker-label": this.t("hud_sit_chair"),
      "door-marker-text": this.t("hud_read_enter"),
      "btn-skip-label": this.t("hud_skip_time"),
      "btn-open-map": this.t("hud_map_btn"),
      "btn-exit-room": this.t("hud_exit_room"),
      "voice-label": this.t("hud_voice"),
      "btn-login-submit": this.t("login_submit")
    };
    Object.keys(mapText).forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.textContent = mapText[id];
    });

    // Update Login Modal Labels
    const loginModal = document.getElementById("modal-login");
    if (loginModal) {
      const h2 = loginModal.querySelector("h2");
      const pSub = loginModal.querySelector("p");
      if (h2) h2.textContent = this.t("login_title");
      if (pSub) pSub.textContent = this.t("login_subtitle");

      const nameInp = document.getElementById("login-input-name");
      if (nameInp) {
        nameInp.placeholder = this.t("login_name_placeholder");
        if (nameInp.previousElementSibling) nameInp.previousElementSibling.textContent = this.t("login_name_label");
      }
      const nimInp = document.getElementById("login-input-nim");
      if (nimInp) {
        nimInp.placeholder = this.t("login_nim_placeholder");
        if (nimInp.previousElementSibling) nimInp.previousElementSibling.textContent = this.t("login_nim_label");
      }
      const genSel = document.getElementById("login-select-gender");
      if (genSel) {
        if (genSel.previousElementSibling) genSel.previousElementSibling.textContent = this.t("login_gender_label");
        if (genSel.options[0]) genSel.options[0].textContent = this.t("login_gender_female");
        if (genSel.options[1]) genSel.options[1].textContent = this.t("login_gender_male");
      }
      const roleSel = document.getElementById("login-select-role");
      if (roleSel) {
        if (roleSel.previousElementSibling) roleSel.previousElementSibling.textContent = this.t("login_role_label");
        if (roleSel.options[0]) roleSel.options[0].textContent = this.t("login_role_student");
        if (roleSel.options[1]) roleSel.options[1].textContent = this.t("login_role_assessor");
      }
      const pinInp = document.getElementById("login-input-pin");
      if (pinInp) {
        pinInp.placeholder = this.t("login_pin_placeholder");
        if (pinInp.previousElementSibling) pinInp.previousElementSibling.textContent = this.t("login_pin_label");
      }
    }

    // Update Language Switcher Buttons
    document.querySelectorAll(".btn-lang-switch").forEach((btn) => {
      btn.innerHTML = isEn ? "🌐 <span>EN</span>" : "🇮🇩 <span>ID</span>";
      btn.title = isEn ? "Switch to Bahasa Indonesia" : "Switch to English";
    });
  }
};

// =========================================================================
// NON-BLOCKING TOAST NOTIFICATION SYSTEM (MENGGANTIKAN SEMUA alert())
// =========================================================================
function ensureToastContainer() {
  let c = document.getElementById("osce-toast-container");
  if (!c) {
    c = document.createElement("div");
    c.id = "osce-toast-container";
    c.className = "fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none px-2";
    document.body.appendChild(c);
  }
  return c;
}

function showToast(message, type = "info", durationMs = 3800) {
  const container = ensureToastContainer();
  const toast = document.createElement("div");

  const styles = {
    success: "bg-emerald-950 border-emerald-400 text-white",
    error: "bg-rose-950 border-rose-400 text-white",
    warning: "bg-amber-950 border-amber-400 text-white",
    info: "bg-slate-900 border-teal-400 text-white"
  };
  const icons = {
    success: "✅",
    error: "⚠️",
    warning: "🔔",
    info: "🩺"
  };

  toast.className = `pointer-events-auto flex items-start gap-2.5 px-4 py-3 rounded-2xl border shadow-2xl text-xs font-semibold transition-all duration-300 transform translate-y-0 opacity-100 ${styles[type] || styles.info}`;
  toast.innerHTML = `
    <span class="text-base leading-none mt-0.5">${icons[type] || icons.info}</span>
    <div class="flex-1 leading-relaxed">${message}</div>
    <button type="button" class="text-white hover:text-slate-200 font-bold px-1">✕</button>
  `;

  toast.querySelector("button").addEventListener("click", () => toast.remove());
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(-8px)";
    setTimeout(() => toast.remove(), 280);
  }, durationMs);
}

// Auto-init deteksi bahasa perangkat saat script dimuat
window.addEventListener("DOMContentLoaded", () => {
  const detected = OSCE_I18N.detectDeviceLanguage();
  OSCE_I18N.setLanguage(detected, false);
});

