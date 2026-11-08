// =========================================================================
// SISTEM PENILAIAN OSCE (FASE 3D-2: BERSIH DARI KUNCI & PEMBAHASAN)
// Seluruh evaluasi penilaian, skor, dan pembahasan diproses secara otoritatif di server.
// File ini hanya mempertahankan antarmuka aman tanpa logika rahasia.
// =========================================================================

const OSCE_SCORING = {
  isRestStation(i) {
    return Number(i) === 9;
  },

  showStudentResultModal() {
    if (typeof showToast === "function") {
      showToast("Nilai resmi diproses di server dan dirilis setelah sesi ujian selesai.", "info");
    }
  },

  exportScoreToCSV() {
    if (typeof showToast === "function") {
      showToast("Unduhan rekap nilai resmi tersedia melalui portal asesor atau server.", "info");
    }
  }
};

if (typeof window !== "undefined") {
  window.OSCE_SCORING = OSCE_SCORING;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = OSCE_SCORING;
}
