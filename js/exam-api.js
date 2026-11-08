// =========================================================================
// MODUL API UJIAN RESMI OSCE CENTER 3D (FASE 3D-1)
// Fungsi murni untuk berkomunikasi dengan endpoint otoritatif server.
// Mendukung Browser (window.ExamAPI) dan Node.js (module.exports) untuk unit test.
// =========================================================================

const submittedStationsMap = new Set(); // Melacak stasiun yang sudah sukses submit

function getAuthToken() {
  if (typeof state !== "undefined" && state && state.jwtToken) {
    return state.jwtToken;
  }
  if (typeof sessionStorage !== "undefined") {
    return sessionStorage.getItem("osce_jwt") || "";
  }
  return "";
}

function handleAuthFailure() {
  const errMsg = "Sesi telah berakhir. Silakan login kembali.";
  if (typeof showToast === "function") {
    showToast(errMsg, "error");
  }
  const modalLogin = typeof document !== "undefined" && document.getElementById("modal-login");
  if (modalLogin) {
    modalLogin.classList.remove("hidden");
  }
}

/**
 * Mengambil soal stasiun dari server (GET /api/station/:stationNo)
 * Bersih dari kunci, pembahasan, dan checklist.
 */
async function fetchStation(stationNo, options = {}) {
  const sNo = Number(stationNo);
  if (sNo === 10) {
    return { ok: true, isRest: true, title: "Station Istirahat" };
  }

  const token = options.token !== undefined ? options.token : getAuthToken();
  const fetcher = options.fetchFn || (typeof fetch !== "undefined" ? fetch : null);
  if (!fetcher) throw new Error("Fetch API tidak tersedia.");

  const headers = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const res = await fetcher(`/api/station/${sNo}`, {
      method: "GET",
      headers
    });

    if (res.status === 401) {
      handleAuthFailure();
      const err = new Error("Sesi telah berakhir. Silakan login kembali.");
      err.status = 401;
      throw err;
    }

    if (res.status === 429) {
      const err = new Error("Terlalu banyak permintaan. Coba lagi sebentar.");
      err.status = 429;
      throw err;
    }

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      const err = new Error(data.error || `Gagal memuat soal stasiun (HTTP ${res.status}).`);
      err.status = res.status;
      throw err;
    }

    const data = await res.json();
    return data;
  } catch (err) {
    if (err.status) throw err;
    const netErr = new Error("Koneksi jaringan terputus. Periksa internet Anda dan coba lagi.");
    netErr.isNetworkError = true;
    throw netErr;
  }
}

/**
 * Mengirimkan jawaban stasiun ke server (POST /api/submit)
 * Body HANYA { stationNo, optionId }.
 * Idempoten di sisi klien: jika sudah pernah submit sukses, tidak kirim ulang.
 */
async function submitAnswer(stationNo, optionId, options = {}) {
  const sNo = Number(stationNo);

  // Jika sudah sukses submit di klien, tolak kirim ulang
  if (submittedStationsMap.has(sNo)) {
    return { accepted: true, stationNo: sNo, alreadySubmitted: true };
  }

  const token = options.token !== undefined ? options.token : getAuthToken();
  const fetcher = options.fetchFn || (typeof fetch !== "undefined" ? fetch : null);
  if (!fetcher) throw new Error("Fetch API tidak tersedia.");

  const headers = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // Body strictly ONLY { stationNo, optionId }
  const payload = {
    stationNo: sNo,
    optionId: String(optionId).trim()
  };

  try {
    const res = await fetcher("/api/submit", {
      method: "POST",
      headers,
      body: JSON.stringify(payload)
    });

    if (res.status === 401) {
      handleAuthFailure();
      const err = new Error("Sesi telah berakhir. Silakan login kembali.");
      err.status = 401;
      throw err;
    }

    if (res.status === 429) {
      const err = new Error("Terlalu banyak permintaan submit. Coba lagi sebentar.");
      err.status = 429;
      throw err;
    }

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      const err = new Error(data.error || `Gagal mengirim jawaban (HTTP ${res.status}).`);
      err.status = res.status;
      throw err;
    }

    const data = await res.json();
    submittedStationsMap.add(sNo);
    return data;
  } catch (err) {
    if (err.status) throw err;
    const netErr = new Error("Koneksi jaringan terputus. Periksa internet Anda dan coba lagi.");
    netErr.isNetworkError = true;
    throw netErr;
  }
}

function isStationSubmitted(stationNo) {
  return submittedStationsMap.has(Number(stationNo));
}

function clearSubmittedStations() {
  submittedStationsMap.clear();
}

const ExamAPI = {
  fetchStation,
  submitAnswer,
  isStationSubmitted,
  clearSubmittedStations
};

if (typeof window !== "undefined") {
  window.ExamAPI = ExamAPI;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = ExamAPI;
}
