// =========================================================================
// SISTEM PENILAIAN OSCE ASLI (WEIGHTED CHECKLIST, CRITICAL MUST-PASS,
// GLOBAL RATING SCALE, RADAR CHART KOMPETENSI & REKOMENDASI BELAJAR)
// =========================================================================

const OSCE_SCORING = {
  PASSING_GRADE: 70.0, // Borderline Regression Method Cut-Off

  DOMAINS: [
    "Pengumpulan Data",
    "Penetapan Masalah",
    "Penyelesaian Masalah",
    "Komunikasi Efektif",
    "Pencatatan & Pelaporan",
    "Sikap Profesional"
  ],

  evaluateStudentDecision(stationIdx, selectedOptionIdx) {
    const st = STATIONS[stationIdx];
    if (!st || !st.options) return null;

    const opt = st.options[selectedOptionIdx];
    const isCorrect = opt ? Boolean(opt.correct) : false;

    const prog = state.stationProgress[stationIdx];
    prog.checklistTicks = prog.checklistTicks || {};

    // Hitung skor checklist berbobot + verifikasi Item Kritis (Must-Pass)
    let checklistScore = 0;
    let criticalPassed = true;
    const checklist = st.checklist || [];

    checklist.forEach((item) => {
      // Jika jawaban utama benar atau simulasi selesai, item kritis otomatis lulus
      if (isCorrect || prog.simSolved) {
        prog.checklistTicks[item.id] = true;
      }
      const ticked = Boolean(prog.checklistTicks[item.id]);
      if (ticked) {
        checklistScore += item.weight;
      } else if (item.critical) {
        criticalPassed = false;
      }
    });

    if (checklist.length === 0) {
      checklistScore = isCorrect ? 100 : 35;
      criticalPassed = isCorrect;
    }

    // Nilai komposit (60% Checklist & Simulasi + 40% Keputusan Klinis)
    const rawScore = Math.round(checklistScore * 0.6 + (isCorrect ? 40 : 12));
    // Jika gagal item kritis, status Global Rating maksimal BORDERLINE
    const globalRating = (rawScore >= 85 && criticalPassed)
      ? "SUPERIOR"
      : (rawScore >= 70 && criticalPassed)
        ? "LULUS (PASS)"
        : (rawScore >= 58)
          ? "BORDERLINE"
          : "TIDAK LULUS (FAIL)";

    prog.completed = true;
    prog.decisionDone = true;
    prog.selectedOption = selectedOptionIdx;
    prog.isCorrect = isCorrect && criticalPassed;
    prog.criticalPassed = criticalPassed;
    prog.globalRating = globalRating;
    prog.score = rawScore;
    prog.submittedAt = new Date().toLocaleTimeString("id-ID");

    if (typeof logCandidateEvent === "function") {
      logCandidateEvent("submit_station", { stationIdx, score: rawScore, globalRating, isCorrect: prog.isCorrect });
    }
    if (typeof netSendScore === "function") {
      netSendScore(stationIdx, selectedOptionIdx, prog.isCorrect, rawScore, globalRating);
    }

    return {
      isCorrect: prog.isCorrect,
      criticalPassed,
      globalRating,
      score: rawScore,
      selectedText: opt ? opt.text : "-",
      stationTitle: st.title,
      rationale: this.getStationRationale(stationIdx, prog.isCorrect)
    };
  },

  isRestStation(i) {
    const st = STATIONS[i];
    return !!st && /istirahat/i.test(st.title);
  },

  EXPLAIN: [
    "HLB campuran = (3,60 x 15,0 + 1,40 x 4,3) / 5,0 = 12,0 sehingga sesuai HLB butuh emulsi O/W; fraksi Tween 80 harus lebih besar karena HLB-nya tinggi.",
    "Capping terjadi karena granul terlalu kering (LOD 0,4%) dan udara terjebak. Koreksi: atur kelembapan granul 1,5-2,0%, turunkan kecepatan punch, dan aktifkan pra-kompresi.",
    "Kadar 102,5% (512,5 mg/tablet) berada dalam rentang Farmakope 90,0-110,0%, sehingga bets memenuhi syarat dan dapat dirilis oleh Apoteker QA.",
    "Analisis ABC-VEN: item vital (VA) dipertahankan 100%; efisiensi anggaran Rp 300 Juta diambil dari item non-esensial kategori C (NC).",
    "Vaksin dengan indikator VVM tahap 3 dikarantina di kotak merah; KCl 7.46% adalah High Alert yang wajib disimpan di lemari terkunci berlabel merah.",
    "Asam mefenamat bersama warfarin meningkatkan risiko perdarahan GI mayor. Gunakan komunikasi SBAR untuk menyarankan penggantian ke Parasetamol.",
    "Guaifenesin (Gliseril Guaiakolat) adalah ekspektoran pilihan yang aman untuk ibu menyusui setelah penggalian WWHAM.",
    "Dosis 1.500 mg (150 mg x 10 DTD) dipenuhi dengan 3 tablet Parasetamol 500 mg, etiket putih (oral), dan BUD maksimal 180 hari.",
    "Insulin pen yang sedang dipakai disimpan di suhu ruang maksimal 28 hari; batuk kering Kaptopril dicatat di Form Kuning MESO dan disarankan beralih ke ARB.",
    "Station istirahat tidak memiliki soal dan tidak dihitung dalam nilai."
  ],

  getStationRationale(stationIdx, isCorrect) {
    const st = STATIONS[stationIdx];
    const explain = this.EXPLAIN[stationIdx] || "Pelajari kembali pedoman praktik kefarmasian terkait station ini.";
    if (isCorrect) return explain;
    const right = st && st.options ? st.options.find((o) => o.correct) : null;
    return (right ? "Kunci Tepat: " + right.text + ". " : "") + explain;
  },

  // Hitung skor per domain kompetensi untuk Radar Chart
  calculateDomainScores() {
    const domainTotals = {};
    const domainCounts = {};
    this.DOMAINS.forEach((d) => { domainTotals[d] = 0; domainCounts[d] = 0; });

    STATIONS.forEach((st, i) => {
      if (this.isRestStation(i)) return;
      const p = state.stationProgress[i] || {};
      const stScore = p.completed ? (p.score || 0) : 0;
      this.DOMAINS.forEach((dom) => {
        if ((st.competencies || "").toLowerCase().includes(dom.toLowerCase().split(" ")[0])) {
          domainTotals[dom] += stScore;
          domainCounts[dom]++;
        }
      });
    });

    return this.DOMAINS.map((dom) => ({
      domain: dom,
      value: domainCounts[dom] > 0 ? Math.round(domainTotals[dom] / domainCounts[dom]) : 0
    }));
  },

  calculateSummary() {
    let totalScore = 0, completedCount = 0, correctCount = 0, scoreable = 0, criticalFails = 0;

    STATIONS.forEach((st, i) => {
      if (this.isRestStation(i)) return;
      scoreable++;
      const p = state.stationProgress[i];
      if (p && p.completed) {
        completedCount++;
        totalScore += (p.score || 0);
        if (p.isCorrect) correctCount++;
        if (p.criticalPassed === false) criticalFails++;
      }
    });

    const averageScore = scoreable > 0 ? (totalScore / scoreable) : 0;
    const isPassed = averageScore >= this.PASSING_GRADE && criticalFails === 0;
    const globalScale = averageScore >= 85 && criticalFails === 0
      ? "SUPERIOR"
      : isPassed
        ? "PASS (LULUS)"
        : averageScore >= 60
          ? "BORDERLINE"
          : "FAIL (REMEDIAL)";

    return {
      totalScore,
      averageScore: averageScore.toFixed(1),
      completedCount,
      totalStations: scoreable,
      correctCount,
      incorrectCount: completedCount - correctCount,
      criticalFails,
      isPassed,
      globalScale,
      gradeLetter: globalScale
    };
  },

  // Gambar Radar Chart 6 Kompetensi UKMPPAI di Canvas
  drawCompetencyRadarChart(canvasId) {
    const cvs = document.getElementById(canvasId);
    if (!cvs) return;
    const ctx = cvs.getContext("2d");
    const w = cvs.width, h = cvs.height;
    const cx = w / 2, cy = h / 2, radius = Math.min(w, h) * 0.34;
    const data = this.calculateDomainScores();
    const n = data.length;

    ctx.clearRect(0, 0, w, h);

    // Jaring poligon latar (25%, 50%, 75%, 100%)
    [0.25, 0.5, 0.75, 1.0].forEach((lvl) => {
      ctx.beginPath();
      for (let i = 0; i < n; i++) {
        const ang = (Math.PI * 2 * i) / n - Math.PI / 2;
        const x = cx + Math.cos(ang) * radius * lvl;
        const y = cy + Math.sin(ang) * radius * lvl;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = "#cbd5e1";
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // Garis sumbu & label kompetensi
    ctx.font = "bold 10px Inter, sans-serif";
    ctx.fillStyle = "#334155";
    ctx.textAlign = "center";
    for (let i = 0; i < n; i++) {
      const ang = (Math.PI * 2 * i) / n - Math.PI / 2;
      const x = cx + Math.cos(ang) * radius;
      const y = cy + Math.sin(ang) * radius;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(x, y);
      ctx.strokeStyle = "#e2e8f0";
      ctx.stroke();

      const lx = cx + Math.cos(ang) * (radius + 24);
      const ly = cy + Math.sin(ang) * (radius + 16);
      ctx.fillText(`${data[i].domain.split(" ")[0]} (${data[i].value})`, lx, ly);
    }

    // Area capaian kandidat
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const ang = (Math.PI * 2 * i) / n - Math.PI / 2;
      const valR = (Math.max(10, data[i].value) / 100) * radius;
      const x = cx + Math.cos(ang) * valR;
      const y = cy + Math.sin(ang) * valR;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = "rgba(15, 118, 110, 0.32)";
    ctx.fill();
    ctx.strokeStyle = "#0f766e";
    ctx.lineWidth = 2.5;
    ctx.stroke();
  },

  showStudentResultModal() {
    const summary = this.calculateSummary();
    const modal = document.getElementById("modal-scoring-result");
    if (!modal) return;

    document.getElementById("score-student-name").textContent = state.userProfile.name;
    document.getElementById("score-student-nim").textContent = state.userProfile.nim;
    document.getElementById("score-final-val").textContent = summary.averageScore;
    document.getElementById("score-final-grade").textContent = summary.globalScale;

    const badgeStatus = document.getElementById("score-status-badge");
    if (summary.isPassed) {
      badgeStatus.textContent = `GLOBAL RATING: ${summary.globalScale}`;
      badgeStatus.className = "px-3 py-1 rounded-full text-xs font-black bg-emerald-500 text-white shadow-md";
    } else {
      badgeStatus.textContent = `GLOBAL RATING: ${summary.globalScale}`;
      badgeStatus.className = "px-3 py-1 rounded-full text-xs font-black bg-rose-500 text-white shadow-md";
    }

    const container = document.getElementById("score-stations-breakdown");
    const domScores = this.calculateDomainScores();
    const weakest = domScores.slice().sort((a, b) => a.value - b.value)[0];

    const radarBlock = `
      <div class="p-3.5 rounded-2xl border border-teal-200 bg-teal-50/40 grid grid-cols-1 sm:grid-cols-2 gap-3 items-center mb-2">
        <div class="flex flex-col items-center">
          <div class="text-[11px] font-black text-teal-900 mb-1">🕸️ Radar Chart 6 Kompetensi UKMPPAI</div>
          <canvas id="osce-radar-canvas" width="280" height="190" class="bg-white rounded-xl border border-slate-200"></canvas>
        </div>
        <div class="space-y-2 text-xs">
          <div class="font-black text-slate-900">🎯 Rekomendasi Belajar Personal AI:</div>
          <div class="p-2.5 rounded-xl bg-white border border-slate-200 text-[11px] text-slate-700 leading-relaxed">
            Kompetensi yang paling perlu diperkuat: <strong class="text-rose-700">${weakest ? weakest.domain : '-'} (${weakest ? weakest.value : 0}/100)</strong>.
            Latih kembali perhitungan farmasetika, verifikasi item kritis (Must-Pass), serta komunikasi terstruktur SBAR/WWHAM.
          </div>
          <div class="text-[11px] text-teal-900 font-semibold">
            Item Kritis Gagal: <strong>${summary.criticalFails}</strong> • Stasiun Selesai: <strong>${summary.completedCount}/${summary.totalStations}</strong>
          </div>
        </div>
      </div>
    `;

    const stationCards = STATIONS.map((st, i) => {
      if (this.isRestStation(i)) {
        return `<div class="p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-500">${st.code}: ${st.title} (Station Istirahat Resmi)</div>`;
      }
      const p = state.stationProgress[i];
      const hasAnswered = p && p.completed;
      const isCorrect = p && p.isCorrect;
      const rating = (p && p.globalRating) || (hasAnswered ? "BORDERLINE" : "BELUM");

      return `
        <div class="p-3 rounded-xl border ${isCorrect ? 'border-emerald-300 bg-emerald-50/60' : hasAnswered ? 'border-amber-300 bg-amber-50/60' : 'border-slate-200 bg-slate-50'} text-xs">
          <div class="flex items-center justify-between font-bold mb-1">
            <span class="text-slate-800">${st.code}: ${st.title}</span>
            <span class="${isCorrect ? 'text-emerald-700 font-black' : hasAnswered ? 'text-amber-800 font-black' : 'text-slate-400'}">
              ${hasAnswered ? `${rating} • Skor ${p.score}` : '⚪ Belum Dikerjakan (0)'}
            </span>
          </div>
          ${hasAnswered ? `
            <div class="p-2 rounded-lg bg-white/90 border border-slate-200 text-[11px] text-slate-700 leading-relaxed mt-1">
              <strong>Pembahasan & Rubrik:</strong> ${this.getStationRationale(i, isCorrect)}
            </div>
          ` : ''}
        </div>
      `;
    }).join("");

    container.innerHTML = radarBlock + stationCards;
    modal.classList.remove("hidden");
    modal.classList.add("flex");
    setTimeout(() => this.drawCompetencyRadarChart("osce-radar-canvas"), 50);
  },

  exportScoreToCSV() {
    const summary = this.calculateSummary();
    let csv = "REKAPITULASI HASIL UJIAN OSCE UKMPPAI RESMI\n";
    csv += `Nama Mahasiswa;${state.userProfile.name}\n`;
    csv += `NIM;${state.userProfile.nim}\n`;
    csv += `Global Rating;${summary.globalScale}\n`;
    csv += `Nilai Rata-rata;${summary.averageScore}\n\n`;
    csv += "No;Kode Station;Judul Station;Global Rating;Item Kritis;Nilai;Kompetensi Utama\n";

    STATIONS.forEach((st, i) => {
      const p = state.stationProgress[i];
      if (this.isRestStation(i)) { csv += `${i + 1};"${st.code}";"${st.title}";"ISTIRAHAT";"-";;"-"\n`; return; }
      const rating = (p && p.globalRating) || "BELUM";
      const crit = p && p.criticalPassed ? "LULUS KRITIS" : "GAGAL KRITIS";
      csv += `${i + 1};"${st.code}";"${st.title}";"${rating}";"${crit}";${p ? p.score : 0};"${st.competencies}"\n`;
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Nilai_OSCE_${state.userProfile.nim}_${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("Laporan CSV Nilai OSCE berhasil diunduh!", "success");
  }
};
