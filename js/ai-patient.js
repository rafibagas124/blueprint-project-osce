// =========================================================================
// AI STANDARDIZED PATIENT & COLLEAGUE NPC ENGINE (STT + TTS + BACKEND PROXY)
// Fitur:
// 1. Percakapan Bebas Suara (Web Speech API STT) & Teks dengan Pasien / Kolega AI
// 2. Persona, Emosi Dinamis & Fakta Tersembunyi (Terbuka saat Anamnesis Tepat)
// 3. Evaluasi Transkrip Otomatis terhadap Checklist Anamnesis & Komunikasi
// 4. Semua panggilan LLM lewat Backend Proxy (/api/ai-npc) dengan pembatas biaya
//    per peserta (Tidak ada API Key di frontend!) + Smart Local Clinical Fallback
// =========================================================================

const AI_NPC_SESSIONS = {}; // stationIdx -> { messages:[], revealedFacts:Set, emotion, anamnesisScore, costUsd }
let speechRec = null;
let isListeningSTT = false;

function getNpcSession(stationIdx) {
  const st = STATIONS[stationIdx];
  const persona = (st && st.aiPersona) || { emotion: "Kooperatif", greeting: "Selamat pagi Apoteker.", hiddenFacts: [] };
  if (!AI_NPC_SESSIONS[stationIdx]) {
    AI_NPC_SESSIONS[stationIdx] = {
      messages: [
        { role: "npc", text: persona.greeting, time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) }
      ],
      revealedFacts: new Set(),
      emotion: persona.emotion,
      anamnesisScore: 0,
      costUsd: 0.0
    };
  }
  return AI_NPC_SESSIONS[stationIdx];
}

// Evaluasi lokal pintar jika offline / tanpa API key eksternal, dan sebagai pencocok fakta klinis
function evaluateAnamnesisAndLocalReply(stationIdx, userText) {
  const st = STATIONS[stationIdx];
  const session = getNpcSession(stationIdx);
  const persona = st.aiPersona || { hiddenFacts: [] };
  const lower = userText.toLowerCase();

  let matchedReply = null;
  let newlyRevealed = 0;

  // 1. Cek kecocokan dengan Hidden Facts
  (persona.hiddenFacts || []).forEach((hf, idx) => {
    const hit = (hf.keywords || []).some((kw) => lower.includes(kw.toLowerCase()));
    if (hit) {
      matchedReply = hf.fact;
      if (!session.revealedFacts.has(idx)) {
        session.revealedFacts.add(idx);
        newlyRevealed++;
        session.anamnesisScore = Math.min(100, session.anamnesisScore + 50);
      }
    }
  });

  // 2. Cek dialog standar station
  if (!matchedReply && st.npcDialogs) {
    for (const d of st.npcDialogs) {
      const qWords = d.q.toLowerCase().split(/\s+/).filter((w) => w.length > 4);
      if (qWords.some((w) => lower.includes(w))) {
        matchedReply = d.a;
        session.anamnesisScore = Math.min(100, session.anamnesisScore + 35);
        break;
      }
    }
  }

  // 3. Cek sapaan / empati / perkenalan diri (komunikasi efektif SBAR/WWHAM)
  if (!matchedReply) {
    if (/halo|selamat|perkenalkan|saya apoteker|izin|sbar/.test(lower)) {
      session.anamnesisScore = Math.min(100, session.anamnesisScore + 20);
      matchedReply = `Terima kasih Apoteker. Saya ${st.npcName}. Silakan sampaikan pertanyaan spesifik terkait data klinis, keluhan, atau parameter pengujian di ${st.code}.`;
    } else {
      matchedReply = `Mengenai hal tersebut: ${st.labData} Apakah ada parameter spesifik lain yang ingin Anda konfirmasi?`;
    }
  }

  // Update emosi pasien bila fakta penting berhasil digali
  if (session.revealedFacts.size >= (persona.hiddenFacts || []).length && (persona.hiddenFacts || []).length > 0) {
    session.emotion = "Tenang & Percaya pada Apoteker";
  } else if (newlyRevealed > 0) {
    session.emotion = "Kooperatif & Terbuka";
  }

  // Tandai checklist Pengumpulan Data / Komunikasi Efektif pada progress mahasiswa
  const prog = state.stationProgress[stationIdx];
  if (prog) {
    prog.dialogDone = true;
    prog.anamnesisScore = session.anamnesisScore;
    prog.checklistTicks = prog.checklistTicks || {};
    if (st.checklist && st.checklist[0] && session.anamnesisScore >= 40) {
      prog.checklistTicks[st.checklist[0].id] = true;
    }
  }

  return matchedReply;
}

// Bicara dengan suara TTS + Gerakkan Bibir (Lip-Sync) Avatar 3D di Ruangan
function speakNpcResponseWithLipSync(text) {
  if (!state.voiceEnabled) return;
  try {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = (typeof OSCE_I18N !== "undefined" && OSCE_I18N.currentLang === "en") ? "en-US" : "id-ID";
      utter.rate = 1.0;
      utter.pitch = 1.02;
      utter.onstart = () => {
        if (typeof roomAvatarNpc !== "undefined" && roomAvatarNpc && roomAvatarNpc.setSpeaking) {
          roomAvatarNpc.setSpeaking(true);
        }
      };
      utter.onend = () => {
        if (typeof roomAvatarNpc !== "undefined" && roomAvatarNpc && roomAvatarNpc.setSpeaking) {
          roomAvatarNpc.setSpeaking(false);
        }
      };
      utter.onerror = () => {
        if (typeof roomAvatarNpc !== "undefined" && roomAvatarNpc && roomAvatarNpc.setSpeaking) {
          roomAvatarNpc.setSpeaking(false);
        }
      };
      window.speechSynthesis.speak(utter);
    }
  } catch (e) {}
}

// Kirim pesan ke Backend Proxy (/api/ai-npc) dengan fallback instan
async function sendNpcChatMessage(stationIdx, userText) {
  const clean = String(userText || "").trim();
  if (!clean) return;
  const session = getNpcSession(stationIdx);
  const st = STATIONS[stationIdx];
  const nowStr = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

  session.messages.push({ role: "student", text: clean, time: nowStr });
  if (typeof logCandidateEvent === "function") {
    logCandidateEvent("npc_dialog", { stationIdx, text: clean });
  }

  // Evaluasi lokal untuk membuka hidden facts & skor anamnesis
  const localReply = evaluateAnamnesisAndLocalReply(stationIdx, clean);
  let finalReply = localReply;

  // Coba panggil Backend Proxy (/api/ai-npc) jika berjalan di atas HTTP/HTTPS server.js
  if (location.protocol === "http:" || location.protocol === "https:") {
    try {
      const resp = await fetch("/api/ai-npc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nim: state.userProfile.nim,
          studentName: state.userProfile.name,
          stationIdx,
          stationCode: st.code,
          npcName: st.npcName,
          npcRole: st.npcRole,
          scenario: st.scenario,
          labData: st.labData,
          message: clean,
          localHint: localReply
        })
      });
      if (resp.ok) {
        const data = await resp.json();
        if (data && data.reply) finalReply = data.reply;
        if (data && typeof data.costUsd === "number") session.costUsd = data.costUsd;
      }
    } catch (e) {
      // Gunakan localReply jika offline
    }
  }

  session.messages.push({ role: "npc", text: finalReply, time: nowStr });
  speakNpcResponseWithLipSync(finalReply);
  renderAiNpcTab(stationIdx, document.getElementById("workstation-tab-content"));
}

// Render UI Percakapan AI Pasien Standar di Tab Workstation
function renderAiNpcTab(stationIdx, containerEl) {
  if (!containerEl) return;
  const st = STATIONS[stationIdx];
  const session = getNpcSession(stationIdx);
  const persona = st.aiPersona || { hiddenFacts: [] };
  const totalFacts = (persona.hiddenFacts || []).length;
  const foundFacts = session.revealedFacts.size;

  containerEl.innerHTML = `
    <div class="space-y-3">
      <!-- Header Persona, Emosi & Skor Anamnesis -->
      <div class="bg-teal-950 text-white rounded-2xl p-3.5 border border-teal-500/40 flex flex-wrap items-center justify-between gap-2">
        <div class="flex items-center gap-2.5">
          <div class="w-10 h-10 rounded-2xl bg-teal-800 text-white flex items-center justify-center text-lg shadow">🩺</div>
          <div>
            <div class="font-black text-xs sm:text-sm flex items-center gap-2">
              <span>${st.npcName}</span>
              <span class="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">AI NPC Live</span>
            </div>
            <div class="text-[11px] text-teal-200">${st.npcRole} • Emosi: <strong class="text-amber-300">${session.emotion}</strong></div>
          </div>
        </div>
        <div class="text-right">
          <div class="text-[10px] text-teal-300 uppercase font-bold">Fakta Klinis Terungkap: ${foundFacts}/${totalFacts}</div>
          <div class="text-xs font-black text-emerald-400">Skor Anamnesis: ${session.anamnesisScore}/100</div>
        </div>
      </div>

      <!-- Tombol Pertanyaan Cepat + Petunjuk Fakta Tersembunyi -->
      <div class="flex flex-wrap gap-1.5">
        ${(st.npcDialogs || []).map((d, i) => `
          <button type="button" data-q="${d.q.replace(/"/g, '&quot;')}" class="btn-quick-npc px-2.5 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-950 border border-teal-300 text-[11px] font-bold transition">
            💬 "${d.q}"
          </button>
        `).join("")}
      </div>

      <!-- Riwayat Chat Transkrip -->
      <div id="ai-npc-chat-box" class="bg-slate-50 border border-slate-200 rounded-2xl p-3 h-48 overflow-y-auto custom-scroll space-y-2">
        ${session.messages.map((m) => `
          <div class="flex ${m.role === 'student' ? 'justify-end' : 'justify-start'}">
            <div class="max-w-[85%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed ${m.role === 'student' ? 'bg-teal-800 text-white' : 'bg-white border border-slate-300 text-slate-900 shadow-sm'}">
              <div class="font-bold text-[10px] ${m.role === 'student' ? 'text-teal-200' : 'text-teal-950'} mb-0.5">
                ${m.role === 'student' ? state.userProfile.name : st.npcName} • ${m.time}
              </div>
              <div>${m.text}</div>
            </div>
          </div>
        `).join("")}
      </div>

      <!-- Input Bebas (Teks + Mikrofon Suara STT) -->
      <div class="flex items-center gap-2">
        <button id="btn-npc-mic" type="button" class="px-3 py-2.5 rounded-xl ${isListeningSTT ? 'bg-rose-800 text-white animate-pulse' : 'bg-slate-900 hover:bg-slate-800 text-white'} font-bold text-xs flex items-center gap-1.5 shadow" title="Bicara via Mikrofon (Speech-to-Text)">
          <span>🎙️</span>
          <span class="hidden sm:inline">${isListeningSTT ? 'Mendengarkan...' : 'Bicara'}</span>
        </button>
        <input id="input-npc-chat" type="text" placeholder="Ketik pertanyaan anamnesis / komunikasi SBAR / WWHAM bebas di sini..." class="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none" />
        <button id="btn-npc-send" type="button" class="px-4 py-2.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs shadow">
          Kirim →
        </button>
      </div>
    </div>
  `;

  const chatBox = document.getElementById("ai-npc-chat-box");
  if (chatBox) chatBox.scrollTop = chatBox.scrollHeight;

  containerEl.querySelectorAll(".btn-quick-npc").forEach((btn) => {
    btn.addEventListener("click", () => sendNpcChatMessage(stationIdx, btn.dataset.q));
  });

  const inp = document.getElementById("input-npc-chat");
  const sendBtn = document.getElementById("btn-npc-send");
  if (sendBtn && inp) {
    sendBtn.addEventListener("click", () => sendNpcChatMessage(stationIdx, inp.value));
    inp.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        sendNpcChatMessage(stationIdx, inp.value);
      }
    });
  }

  // Tombol Mikrofon STT (Web Speech API)
  const micBtn = document.getElementById("btn-npc-mic");
  if (micBtn) {
    micBtn.addEventListener("click", () => {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SR) {
        showToast("Browser ini belum mendukung Speech-to-Text. Silakan ketik pertanyaan Anda.", "warning");
        return;
      }
      if (isListeningSTT && speechRec) {
        speechRec.stop();
        isListeningSTT = false;
        renderAiNpcTab(stationIdx, containerEl);
        return;
      }
      speechRec = new SR();
      speechRec.lang = (typeof OSCE_I18N !== "undefined" && OSCE_I18N.currentLang === "en") ? "en-US" : "id-ID";
      speechRec.interimResults = false;
      isListeningSTT = true;
      renderAiNpcTab(stationIdx, containerEl);
      speechRec.onresult = (ev) => {
        isListeningSTT = false;
        const transcript = ev.results[0] && ev.results[0][0] ? ev.results[0][0].transcript : "";
        if (transcript) sendNpcChatMessage(stationIdx, transcript);
      };
      speechRec.onerror = () => {
        isListeningSTT = false;
        renderAiNpcTab(stationIdx, containerEl);
      };
      speechRec.onend = () => {
        isListeningSTT = false;
      };
      speechRec.start();
    });
  }
}

