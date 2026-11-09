# Laporan Audit Kontras WCAG 2.2 AAA & Pencahayaan 3D

Audit dilakukan langsung pada peramban Microsoft Edge Headless via Chrome DevTools Protocol (CDP).
Standar: WCAG 2.2 Level AAA (SC 1.4.6, rasio kontras >= 7.0:1 untuk semua teks visual).

## 1. Ringkasan Baseline (Sebelum Perbaikan)

### State: LOGIN MAHASISWA ID

| Selector | Teks Singkat | Warna Teks | Warna Latar | Rasio Kontras | Status Baseline | Status Target |
|---|---|---|---|---|---|---|
| div#chair-marker-station | /S/T/A/T/I/O/N/ /0/1/ | #99f6e4 | #0f766e | 4.34:1 | Gagal (4.34:1 < 7:1) | Target AAA (>= 7:1, Solid) |
| div#chair-marker-label | /D/u/d/u/k/ /d/i/ /k/u/r/s/i/ /t/u/ | #ffffff | #0f766e | 5.47:1 | Gagal (5.47:1 < 7:1) | Target AAA (>= 7:1, Solid) |
| span.px-1.5.py-0.5 | /E/ | #1e1b4b | #ffffff | 15.99:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| span#door-marker-text | /B/a/c/a/ /P/e/t/u/n/j/u/k/ /P/e/s/ | #ffffff | #2e2c78 | 12.02:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span#hud-phase-label | /W/a/k/t/u/ /p/e/r/s/i/a/p/a/n/ | #0f5132 | #f3f5f8 | 8.57:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span#hud-mode-badge | /K/a/n/d/i/d/a/t/ /P/e/s/e/r/t/a/ | #0f5132 | #f3f5f8 | 8.57:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| h2#hud-station-title | /S/t/a/t/i/o/n/ /0/1/ | #1e293b | #f3f5f8 | 13.39:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| div#hud-timer | /0/0/:/3/0/ | #0f5132 | #f3f5f8 | 8.57:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| div#hud-station-subtitle | /P/e/m/b/u/a/t/a/n/ /1/:/ /P/e/r/a/ | #1e293b | #f3f5f8 | 13.39:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span#btn-skip-label | /L/e/w/a/t/i/ /s/i/s/a/ /w/a/k/t/u/ | #1e293b | #f1f5f9 | 13.35:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| span | /→/ | #1e293b | #f1f5f9 | 13.35:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| span.inline-flex.items-center | /B/e/r/g/e/r/a/k/ | #334155 | #f3f5f8 | 9.48:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| kbd.px-1.5.py-0.5 | /W/A/S/D/ | #334155 | #f1f5f9 | 9.45:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| span.text-slate-300 | /|/ | #cbd5e1 | #f3f5f8 | 1.36:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span.text-slate-300.hidden | /|/ | #cbd5e1 | #f3f5f8 | 1.36:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| kbd.px-1.5.py-0.5 | /V/ | #0f5132 | #f1f5f9 | 8.54:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| span#cam-hint-label | /K/a/m/e/r/a/ /O/r/a/n/g/ /k/e/-/3/ | #0f5132 | #f3f5f8 | 8.57:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span | /�/�/ /M/a/h/a/s/i/s/w/a/ /(/1/0/)/ | #4338ca | #f3f5f8 | 7.24:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| button#btn-open-map | /P/e/t/a/ /1/0/ /S/t/a/t/i/o/n/ | #0f5132 | #f3f5f8 | 8.57:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span#telemetry-users | /2/./0/0/0/ /P/e/s/e/r/t/a/ /O/n/l/ | #34d399 | #090d17 | 10.1:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span.text-slate-500 | /•/ | #64748b | #090d17 | 4.08:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span#telemetry-cluster | /I/n/s/t/a/n/c/e/ /#/0/1/4///2/0/0/ | #e2e8f0 | #090d17 | 15.75:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span.text-slate-500.hidden | /•/ | #64748b | #090d17 | 4.08:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span#telemetry-assessor-mode | /S/h/a/r/d/i/n/g/:/ /R/o/o/m/ /P/a/ | #fcd34d | #090d17 | 13.47:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span | /�/�/ | #115e59 | #f3f5f8 | 6.94:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span#label-corridor-wing | /K/o/r/i/d/o/r/ /A/ /(/0/1/-/1/0/)/ | #115e59 | #f3f5f8 | 6.94:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span | /�/�/ | #ffffff | #059669 | 3.77:1 | Gagal (3.77:1 < 7:1) | Target AAA (>= 7:1, Solid) |
| span#voice-icon | /�/�/ | #334155 | #f3f5f8 | 9.48:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span#voice-label | /S/u/a/r/a/ | #334155 | #f3f5f8 | 9.48:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span | /�/�/ | #ffffff | #4f46e5 | 6.29:1 | Gagal (6.29:1 < 7:1) | Target AAA (>= 7:1, Solid) |
| span.hidden | /B/l/u/e/p/r/i/n/t/ | #ffffff | #4f46e5 | 6.29:1 | Gagal (6.29:1 < 7:1) | Target AAA (>= 7:1, Solid) |
| button#btn-hud-lang | /�/�/�/�/ | #334155 | #f3f5f8 | 9.48:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span | /I/D/ | #334155 | #f3f5f8 | 9.48:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| kbd.hidden.px-1 | /E/s/c/ | #334155 | #f1f5f9 | 9.45:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| span.text-slate-500.font-medium | /R/o/t/a/s/i/:/ | #1e293b | #f3f5f8 | 13.39:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| select#select-movement-mode | /h/y/b/r/i/d/ | #1e293b | #f1f5f9 | 13.35:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| button#btn-move-forward | /▲/ /W/ | #1e293b | #f1f5f9 | 13.35:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| button#btn-move-back | /▼/ /S/ | #1e293b | #f1f5f9 | 13.35:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| button#btn-turn-left | /◀/ /A/ | #1e293b | #f1f5f9 | 13.35:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| button#btn-turn-right | /D/ /▶/ | #1e293b | #f1f5f9 | 13.35:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| kbd.px-2.py-0.5 | /E/ | #ffffff | #0f766e | 5.47:1 | Gagal (5.47:1 < 7:1) | Target AAA (>= 7:1, Solid) |
| span#context-action-label | /D/u/d/u/k/ /—/ /S/t/a/t/i/o/n/ /0/ | #1e293b | #f3f5f8 | 13.39:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| div#hud-subtitle-banner | /S/e/l/a/m/a/t/ /d/a/t/a/n/g/ /d/i/ | #334155 | #f3f5f8 | 9.48:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span#hud-progress-count | /0///1/0/ /s/e/l/e/s/a/i/ | #1e293b | #f3f5f8 | 13.39:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span.text-slate-400 | /▼/ | #94a3b8 | #f3f5f8 | 2.35:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| button.btn-lang-switch.absolute | /�/�/�/�/ | #334155 | #f1f5f9 | 9.45:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| span | /I/D/ | #334155 | #f1f5f9 | 9.45:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| div.w-14.h-14 | /�/�/ | #ffffff | #0d9488 | 3.74:1 | Gagal (3.74:1 < 7:1) | Target AAA (>= 7:1, Solid) |
| h2.text-2xl.font-black | /G/e/r/b/a/n/g/ /M/a/s/u/k/ /O/S/C/ | #0f172a | #ffffff | 17.85:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| p.text-xs.text-slate-500 | /S/i/m/u/l/a/s/i/ /U/j/i/a/n/ /K/o/ | #64748b | #ffffff | 4.76:1 | Gagal (4.76:1 < 7:1) | Target AAA (>= 7:1, Solid) |
| label.block.text-xs | /P/i/l/i/h/ /P/e/r/a/n/ /P/e/n/g/g/ | #334155 | #ffffff | 10.35:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| select#login-select-role | /s/t/u/d/e/n/t/ | #1e293b | #f8fafc | 13.98:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| input#login-input-nim | /C/o/n/t/o/h/:/ /2/0/2/4/-/0/8/1/9/ | #000000 | #ffffff | 21:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| input#login-input-token | /M/a/s/u/k/k/a/n/ /t/o/k/e/n/ /u/j/ | #000000 | #f9fefd | 20.62:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| div.bg-teal-50.border | /✨/ /N/a/m/a/,/ /J/e/n/i/s/ /K/e/l/ | #134e4a | #f0fdfa | 9.09:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| strong | /O/t/o/r/i/t/a/s/ /R/o/s/t/e/r/ /S/ | #134e4a | #f0fdfa | 9.09:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| button#btn-login-submit | /M/a/s/u/k/ /k/e/ /S/i/m/u/l/a/s/i/ | #ffffff | #0f766e | 5.47:1 | Gagal (5.47:1 < 7:1) | Target AAA (>= 7:1, Solid) |
| span.font-black.tracking-wider | /M/I/N/I/M/A/P/ /2/ /K/O/R/I/D/O/R/ | #5eead4 | #090d17 | 13.13:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span#minimap-pos-label | /S/T/-/0/1/ | #cbd5e1 | #090d17 | 13.08:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |

### State: LOGIN MAHASISWA EN

| Selector | Teks Singkat | Warna Teks | Warna Latar | Rasio Kontras | Status Baseline | Status Target |
|---|---|---|---|---|---|---|
| div#chair-marker-station | /S/T/A/T/I/O/N/ /0/1/ | #99f6e4 | #0f766e | 4.34:1 | Gagal (4.34:1 < 7:1) | Target AAA (>= 7:1, Solid) |
| div#chair-marker-label | /S/i/t/ /o/n/ /w/a/i/t/i/n/g/ /c/h/ | #ffffff | #0f766e | 5.47:1 | Gagal (5.47:1 < 7:1) | Target AAA (>= 7:1, Solid) |
| span.px-1.5.py-0.5 | /E/ | #1e1b4b | #ffffff | 15.99:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| span#door-marker-text | /B/a/c/a/ /P/e/t/u/n/j/u/k/ /P/e/s/ | #ffffff | #2e2c78 | 12.02:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span#hud-phase-label | /W/a/k/t/u/ /p/e/r/s/i/a/p/a/n/ | #0f5132 | #f3f5f8 | 8.57:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span#hud-mode-badge | /K/a/n/d/i/d/a/t/ /P/e/s/e/r/t/a/ | #0f5132 | #f3f5f8 | 8.57:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| h2#hud-station-title | /S/t/a/t/i/o/n/ /0/1/ | #1e293b | #f3f5f8 | 13.39:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| div#hud-timer | /0/0/:/3/0/ | #0f5132 | #f3f5f8 | 8.57:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| div#hud-station-subtitle | /P/e/m/b/u/a/t/a/n/ /1/:/ /P/e/r/a/ | #1e293b | #f3f5f8 | 13.39:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span#btn-skip-label | /S/k/i/p/ /r/e/m/a/i/n/i/n/g/ /t/i/ | #1e293b | #f1f5f9 | 13.35:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| span | /→/ | #1e293b | #f1f5f9 | 13.35:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| span.inline-flex.items-center | /B/e/r/g/e/r/a/k/ | #334155 | #f3f5f8 | 9.48:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| kbd.px-1.5.py-0.5 | /W/A/S/D/ | #334155 | #f1f5f9 | 9.45:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| span.text-slate-300 | /|/ | #cbd5e1 | #f3f5f8 | 1.36:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span.text-slate-300.hidden | /|/ | #cbd5e1 | #f3f5f8 | 1.36:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| kbd.px-1.5.py-0.5 | /V/ | #0f5132 | #f1f5f9 | 8.54:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| span#cam-hint-label | /K/a/m/e/r/a/ /O/r/a/n/g/ /k/e/-/3/ | #0f5132 | #f3f5f8 | 8.57:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span | /�/�/ /M/a/h/a/s/i/s/w/a/ /(/1/0/)/ | #4338ca | #f3f5f8 | 7.24:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| button#btn-open-map | /1/0/-/S/t/a/t/i/o/n/ /M/a/p/ | #0f5132 | #f3f5f8 | 8.57:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span#telemetry-users | /2/./0/0/0/ /P/e/s/e/r/t/a/ /O/n/l/ | #34d399 | #090d17 | 10.1:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span.text-slate-500 | /•/ | #64748b | #090d17 | 4.08:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span#telemetry-cluster | /I/n/s/t/a/n/c/e/ /#/0/1/4///2/0/0/ | #e2e8f0 | #090d17 | 15.75:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span.text-slate-500.hidden | /•/ | #64748b | #090d17 | 4.08:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span#telemetry-assessor-mode | /S/h/a/r/d/i/n/g/:/ /R/o/o/m/ /P/a/ | #fcd34d | #090d17 | 13.47:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span | /�/�/ | #115e59 | #f3f5f8 | 6.94:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span#label-corridor-wing | /K/o/r/i/d/o/r/ /A/ /(/0/1/-/1/0/)/ | #115e59 | #f3f5f8 | 6.94:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span | /�/�/ | #ffffff | #059669 | 3.77:1 | Gagal (3.77:1 < 7:1) | Target AAA (>= 7:1, Solid) |
| span#voice-icon | /�/�/ | #334155 | #f3f5f8 | 9.48:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span#voice-label | /A/u/d/i/o/ | #334155 | #f3f5f8 | 9.48:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span | /�/�/ | #ffffff | #4f46e5 | 6.29:1 | Gagal (6.29:1 < 7:1) | Target AAA (>= 7:1, Solid) |
| span.hidden | /B/l/u/e/p/r/i/n/t/ | #ffffff | #4f46e5 | 6.29:1 | Gagal (6.29:1 < 7:1) | Target AAA (>= 7:1, Solid) |
| button#btn-hud-lang | /�/�/ | #334155 | #f3f5f8 | 9.48:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span | /E/N/ | #334155 | #f3f5f8 | 9.48:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| kbd.hidden.px-1 | /E/s/c/ | #334155 | #f1f5f9 | 9.45:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| span.text-slate-500.font-medium | /R/o/t/a/s/i/:/ | #1e293b | #f3f5f8 | 13.39:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| select#select-movement-mode | /h/y/b/r/i/d/ | #1e293b | #f1f5f9 | 13.35:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| button#btn-move-forward | /▲/ /W/ | #1e293b | #f1f5f9 | 13.35:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| button#btn-move-back | /▼/ /S/ | #1e293b | #f1f5f9 | 13.35:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| button#btn-turn-left | /◀/ /A/ | #1e293b | #f1f5f9 | 13.35:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| button#btn-turn-right | /D/ /▶/ | #1e293b | #f1f5f9 | 13.35:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| kbd.px-2.py-0.5 | /E/ | #ffffff | #0f766e | 5.47:1 | Gagal (5.47:1 < 7:1) | Target AAA (>= 7:1, Solid) |
| span#context-action-label | /D/u/d/u/k/ /—/ /S/t/a/t/i/o/n/ /0/ | #1e293b | #f3f5f8 | 13.39:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| div#hud-subtitle-banner | /S/e/l/a/m/a/t/ /d/a/t/a/n/g/ /d/i/ | #334155 | #f3f5f8 | 9.48:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span#hud-progress-count | /0///1/0/ /s/e/l/e/s/a/i/ | #1e293b | #f3f5f8 | 13.39:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span.text-slate-400 | /▼/ | #94a3b8 | #f3f5f8 | 2.35:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| button.btn-lang-switch.absolute | /�/�/ | #334155 | #f1f5f9 | 9.45:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| span | /E/N/ | #334155 | #f1f5f9 | 9.45:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| div.w-14.h-14 | /�/�/ | #ffffff | #0d9488 | 3.74:1 | Gagal (3.74:1 < 7:1) | Target AAA (>= 7:1, Solid) |
| h2.text-2xl.font-black | /O/S/C/E/ /C/e/n/t/e/r/ /3/D/ /—/ / | #0f172a | #ffffff | 17.85:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| p.text-xs.text-slate-500 | /W/e/b/-/B/a/s/e/d/ /P/h/a/r/m/a/c/ | #64748b | #ffffff | 4.76:1 | Gagal (4.76:1 < 7:1) | Target AAA (>= 7:1, Solid) |
| label.block.text-xs | /S/e/l/e/c/t/ /U/s/e/r/ /R/o/l/e/:/ | #334155 | #ffffff | 10.35:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| select#login-select-role | /s/t/u/d/e/n/t/ | #1e293b | #f8fafc | 13.98:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| input#login-input-nim | /E/x/a/m/p/l/e/:/ /2/0/2/4/-/0/8/1/ | #000000 | #ffffff | 21:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| input#login-input-token | /M/a/s/u/k/k/a/n/ /t/o/k/e/n/ /u/j/ | #000000 | #f9fefd | 20.62:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| div.bg-teal-50.border | /✨/ /N/a/m/a/,/ /J/e/n/i/s/ /K/e/l/ | #134e4a | #f0fdfa | 9.09:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| strong | /O/t/o/r/i/t/a/s/ /R/o/s/t/e/r/ /S/ | #134e4a | #f0fdfa | 9.09:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| button#btn-login-submit | /E/n/t/e/r/ /O/S/C/E/ /E/x/a/m/ /S/ | #ffffff | #0f766e | 5.47:1 | Gagal (5.47:1 < 7:1) | Target AAA (>= 7:1, Solid) |
| span.font-black.tracking-wider | /M/I/N/I/M/A/P/ /2/ /K/O/R/I/D/O/R/ | #5eead4 | #090d17 | 13.13:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span#minimap-pos-label | /S/T/-/0/1/ | #cbd5e1 | #090d17 | 13.08:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |

### State: LOGIN ASESOR

| Selector | Teks Singkat | Warna Teks | Warna Latar | Rasio Kontras | Status Baseline | Status Target |
|---|---|---|---|---|---|---|
| div#chair-marker-station | /S/T/A/T/I/O/N/ /0/1/ | #99f6e4 | #0f766e | 4.34:1 | Gagal (4.34:1 < 7:1) | Target AAA (>= 7:1, Solid) |
| div#chair-marker-label | /D/u/d/u/k/ /d/i/ /k/u/r/s/i/ /t/u/ | #ffffff | #0f766e | 5.47:1 | Gagal (5.47:1 < 7:1) | Target AAA (>= 7:1, Solid) |
| span.px-1.5.py-0.5 | /E/ | #1e1b4b | #ffffff | 15.99:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| span#door-marker-text | /B/a/c/a/ /P/e/t/u/n/j/u/k/ /P/e/s/ | #ffffff | #2e2c78 | 12.02:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span#hud-phase-label | /W/a/k/t/u/ /p/e/r/s/i/a/p/a/n/ | #0f5132 | #f3f5f8 | 8.57:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span#hud-mode-badge | /K/a/n/d/i/d/a/t/ /P/e/s/e/r/t/a/ | #0f5132 | #f3f5f8 | 8.57:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| h2#hud-station-title | /S/t/a/t/i/o/n/ /0/1/ | #1e293b | #f3f5f8 | 13.39:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| div#hud-timer | /0/0/:/3/0/ | #0f5132 | #f3f5f8 | 8.57:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| div#hud-station-subtitle | /P/e/m/b/u/a/t/a/n/ /1/:/ /P/e/r/a/ | #1e293b | #f3f5f8 | 13.39:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span#btn-skip-label | /L/e/w/a/t/i/ /s/i/s/a/ /w/a/k/t/u/ | #1e293b | #f1f5f9 | 13.35:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| span | /→/ | #1e293b | #f1f5f9 | 13.35:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| span.inline-flex.items-center | /B/e/r/g/e/r/a/k/ | #334155 | #f3f5f8 | 9.48:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| kbd.px-1.5.py-0.5 | /W/A/S/D/ | #334155 | #f1f5f9 | 9.45:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| span.text-slate-300 | /|/ | #cbd5e1 | #f3f5f8 | 1.36:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span.text-slate-300.hidden | /|/ | #cbd5e1 | #f3f5f8 | 1.36:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| kbd.px-1.5.py-0.5 | /V/ | #0f5132 | #f1f5f9 | 8.54:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| span#cam-hint-label | /K/a/m/e/r/a/ /O/r/a/n/g/ /k/e/-/3/ | #0f5132 | #f3f5f8 | 8.57:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span | /�/�/ /M/a/h/a/s/i/s/w/a/ /(/1/0/)/ | #4338ca | #f3f5f8 | 7.24:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| button#btn-open-map | /P/e/t/a/ /1/0/ /S/t/a/t/i/o/n/ | #0f5132 | #f3f5f8 | 8.57:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span#telemetry-users | /2/./0/0/0/ /P/e/s/e/r/t/a/ /O/n/l/ | #34d399 | #090d17 | 10.1:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span.text-slate-500 | /•/ | #64748b | #090d17 | 4.08:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span#telemetry-cluster | /I/n/s/t/a/n/c/e/ /#/0/1/4///2/0/0/ | #e2e8f0 | #090d17 | 15.75:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span.text-slate-500.hidden | /•/ | #64748b | #090d17 | 4.08:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span#telemetry-assessor-mode | /S/h/a/r/d/i/n/g/:/ /R/o/o/m/ /P/a/ | #fcd34d | #090d17 | 13.47:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span | /�/�/ | #115e59 | #f3f5f8 | 6.94:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span#label-corridor-wing | /K/o/r/i/d/o/r/ /A/ /(/0/1/-/1/0/)/ | #115e59 | #f3f5f8 | 6.94:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span | /�/�/ | #ffffff | #059669 | 3.77:1 | Gagal (3.77:1 < 7:1) | Target AAA (>= 7:1, Solid) |
| span#voice-icon | /�/�/ | #334155 | #f3f5f8 | 9.48:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span#voice-label | /S/u/a/r/a/ | #334155 | #f3f5f8 | 9.48:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span | /�/�/ | #ffffff | #4f46e5 | 6.29:1 | Gagal (6.29:1 < 7:1) | Target AAA (>= 7:1, Solid) |
| span.hidden | /B/l/u/e/p/r/i/n/t/ | #ffffff | #4f46e5 | 6.29:1 | Gagal (6.29:1 < 7:1) | Target AAA (>= 7:1, Solid) |
| button#btn-hud-lang | /�/�/�/�/ | #334155 | #f3f5f8 | 9.48:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span | /I/D/ | #334155 | #f3f5f8 | 9.48:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| kbd.hidden.px-1 | /E/s/c/ | #334155 | #f1f5f9 | 9.45:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| span.text-slate-500.font-medium | /R/o/t/a/s/i/:/ | #1e293b | #f3f5f8 | 13.39:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| select#select-movement-mode | /h/y/b/r/i/d/ | #1e293b | #f1f5f9 | 13.35:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| button#btn-move-forward | /▲/ /W/ | #1e293b | #f1f5f9 | 13.35:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| button#btn-move-back | /▼/ /S/ | #1e293b | #f1f5f9 | 13.35:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| button#btn-turn-left | /◀/ /A/ | #1e293b | #f1f5f9 | 13.35:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| button#btn-turn-right | /D/ /▶/ | #1e293b | #f1f5f9 | 13.35:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| kbd.px-2.py-0.5 | /E/ | #ffffff | #0f766e | 5.47:1 | Gagal (5.47:1 < 7:1) | Target AAA (>= 7:1, Solid) |
| span#context-action-label | /D/u/d/u/k/ /—/ /S/t/a/t/i/o/n/ /0/ | #1e293b | #f3f5f8 | 13.39:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| div#hud-subtitle-banner | /S/e/l/a/m/a/t/ /d/a/t/a/n/g/ /d/i/ | #334155 | #f3f5f8 | 9.48:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span#hud-progress-count | /0///1/0/ /s/e/l/e/s/a/i/ | #1e293b | #f3f5f8 | 13.39:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span.text-slate-400 | /▼/ | #94a3b8 | #f3f5f8 | 2.35:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| button.btn-lang-switch.absolute | /�/�/�/�/ | #334155 | #f1f5f9 | 9.45:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| span | /I/D/ | #334155 | #f1f5f9 | 9.45:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| div.w-14.h-14 | /�/�/ | #ffffff | #0d9488 | 3.74:1 | Gagal (3.74:1 < 7:1) | Target AAA (>= 7:1, Solid) |
| h2.text-2xl.font-black | /G/e/r/b/a/n/g/ /M/a/s/u/k/ /O/S/C/ | #0f172a | #ffffff | 17.85:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| p.text-xs.text-slate-500 | /S/i/m/u/l/a/s/i/ /U/j/i/a/n/ /K/o/ | #64748b | #ffffff | 4.76:1 | Gagal (4.76:1 < 7:1) | Target AAA (>= 7:1, Solid) |
| label.block.text-xs | /P/i/l/i/h/ /P/e/r/a/n/ /P/e/n/g/g/ | #334155 | #ffffff | 10.35:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| select#login-select-role | /a/s/s/e/s/s/o/r/ | #1e293b | #f8fafc | 13.98:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| input#login-input-assessor-user | /C/o/n/t/o/h/:/ /a/s/e/s/o/r/1/ /a/ | #000000 | #ffffff | 21:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| input#login-input-assessor-pass | /M/a/s/u/k/k/a/n/ /p/a/s/s/w/o/r/d/ | #000000 | #ffffff | 21:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| div.bg-amber-50.border | /�/�/‍/�/�/ /L/o/g/i/n/ /u/n/t/u/k/ | #78350f | #fffbeb | 8.75:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| strong | /A/k/s/e/s/ /D/o/s/e/n/ /// /P/e/n/ | #78350f | #fffbeb | 8.75:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| button#btn-login-submit | /M/a/s/u/k/ /k/e/ /S/i/m/u/l/a/s/i/ | #ffffff | #0f766e | 5.47:1 | Gagal (5.47:1 < 7:1) | Target AAA (>= 7:1, Solid) |
| span.font-black.tracking-wider | /M/I/N/I/M/A/P/ /2/ /K/O/R/I/D/O/R/ | #5eead4 | #090d17 | 13.13:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span#minimap-pos-label | /S/T/-/0/1/ | #cbd5e1 | #090d17 | 13.08:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |

### State: HUD KORIDOR 3RD

| Selector | Teks Singkat | Warna Teks | Warna Latar | Rasio Kontras | Status Baseline | Status Target |
|---|---|---|---|---|---|---|
| div#chair-marker-station | /S/T/A/T/I/O/N/ /0/1/ | #99f6e4 | #0f766e | 4.34:1 | Gagal (4.34:1 < 7:1) | Target AAA (>= 7:1, Solid) |
| div#chair-marker-label | /D/u/d/u/k/ /d/i/ /k/u/r/s/i/ /t/u/ | #ffffff | #0f766e | 5.47:1 | Gagal (5.47:1 < 7:1) | Target AAA (>= 7:1, Solid) |
| span.px-1.5.py-0.5 | /E/ | #1e1b4b | #ffffff | 15.99:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| span#door-marker-text | /B/a/c/a/ /P/e/t/u/n/j/u/k/ /P/e/s/ | #ffffff | #2e2c78 | 12.02:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span#hud-phase-label | /W/a/k/t/u/ /p/e/r/s/i/a/p/a/n/ | #0f5132 | #f3f5f8 | 8.57:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span#hud-mode-badge | /K/a/n/d/i/d/a/t/ /P/e/s/e/r/t/a/ | #0f5132 | #f3f5f8 | 8.57:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| h2#hud-station-title | /S/t/a/t/i/o/n/ /0/1/ | #1e293b | #f3f5f8 | 13.39:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| div#hud-timer | /0/0/:/3/0/ | #0f5132 | #f3f5f8 | 8.57:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| div#hud-station-subtitle | /P/e/m/b/u/a/t/a/n/ /1/:/ /P/e/r/a/ | #1e293b | #f3f5f8 | 13.39:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span#btn-skip-label | /L/e/w/a/t/i/ /s/i/s/a/ /w/a/k/t/u/ | #1e293b | #f1f5f9 | 13.35:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| span | /→/ | #1e293b | #f1f5f9 | 13.35:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| span.inline-flex.items-center | /B/e/r/g/e/r/a/k/ | #334155 | #f3f5f8 | 9.48:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| kbd.px-1.5.py-0.5 | /W/A/S/D/ | #334155 | #f1f5f9 | 9.45:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| span.text-slate-300 | /|/ | #cbd5e1 | #f3f5f8 | 1.36:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span.text-slate-300.hidden | /|/ | #cbd5e1 | #f3f5f8 | 1.36:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| kbd.px-1.5.py-0.5 | /V/ | #0f5132 | #f1f5f9 | 8.54:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| span#cam-hint-label | /K/a/m/e/r/a/ /O/r/a/n/g/ /k/e/-/3/ | #0f5132 | #f3f5f8 | 8.57:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span | /�/�/ /M/a/h/a/s/i/s/w/a/ /(/1/0/)/ | #4338ca | #f3f5f8 | 7.24:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| button#btn-open-map | /P/e/t/a/ /1/0/ /S/t/a/t/i/o/n/ | #0f5132 | #f3f5f8 | 8.57:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span#telemetry-users | /2/./0/0/0/ /P/e/s/e/r/t/a/ /O/n/l/ | #34d399 | #090d17 | 10.1:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span.text-slate-500 | /•/ | #64748b | #090d17 | 4.08:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span#telemetry-cluster | /I/n/s/t/a/n/c/e/ /#/0/1/4///2/0/0/ | #e2e8f0 | #090d17 | 15.75:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span.text-slate-500.hidden | /•/ | #64748b | #090d17 | 4.08:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span#telemetry-assessor-mode | /S/h/a/r/d/i/n/g/:/ /R/o/o/m/ /P/a/ | #fcd34d | #090d17 | 13.47:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span | /�/�/ | #115e59 | #f3f5f8 | 6.94:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span#label-corridor-wing | /K/o/r/i/d/o/r/ /A/ /(/0/1/-/1/0/)/ | #115e59 | #f3f5f8 | 6.94:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span | /�/�/ | #ffffff | #059669 | 3.77:1 | Gagal (3.77:1 < 7:1) | Target AAA (>= 7:1, Solid) |
| span#voice-icon | /�/�/ | #334155 | #f3f5f8 | 9.48:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span#voice-label | /S/u/a/r/a/ | #334155 | #f3f5f8 | 9.48:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span | /�/�/ | #ffffff | #4f46e5 | 6.29:1 | Gagal (6.29:1 < 7:1) | Target AAA (>= 7:1, Solid) |
| span.hidden | /B/l/u/e/p/r/i/n/t/ | #ffffff | #4f46e5 | 6.29:1 | Gagal (6.29:1 < 7:1) | Target AAA (>= 7:1, Solid) |
| button#btn-hud-lang | /�/�/�/�/ | #334155 | #f3f5f8 | 9.48:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span | /I/D/ | #334155 | #f3f5f8 | 9.48:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| kbd.hidden.px-1 | /E/s/c/ | #334155 | #f1f5f9 | 9.45:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| span.text-slate-500.font-medium | /R/o/t/a/s/i/:/ | #1e293b | #f3f5f8 | 13.39:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| select#select-movement-mode | /h/y/b/r/i/d/ | #1e293b | #f1f5f9 | 13.35:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| button#btn-move-forward | /▲/ /W/ | #1e293b | #f1f5f9 | 13.35:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| button#btn-move-back | /▼/ /S/ | #1e293b | #f1f5f9 | 13.35:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| button#btn-turn-left | /◀/ /A/ | #1e293b | #f1f5f9 | 13.35:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| button#btn-turn-right | /D/ /▶/ | #1e293b | #f1f5f9 | 13.35:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| kbd.px-2.py-0.5 | /E/ | #ffffff | #0f766e | 5.47:1 | Gagal (5.47:1 < 7:1) | Target AAA (>= 7:1, Solid) |
| span#context-action-label | /D/u/d/u/k/ /—/ /S/t/a/t/i/o/n/ /0/ | #1e293b | #f3f5f8 | 13.39:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| div#hud-subtitle-banner | /S/e/l/a/m/a/t/ /d/a/t/a/n/g/ /d/i/ | #334155 | #f3f5f8 | 9.48:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span#hud-progress-count | /0///1/0/ /s/e/l/e/s/a/i/ | #1e293b | #f3f5f8 | 13.39:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span.text-slate-400 | /▼/ | #94a3b8 | #f3f5f8 | 2.35:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| button.btn-lang-switch.absolute | /�/�/�/�/ | #334155 | #f1f5f9 | 9.45:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| span | /I/D/ | #334155 | #f1f5f9 | 9.45:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| div.w-14.h-14 | /�/�/ | #ffffff | #0d9488 | 3.74:1 | Gagal (3.74:1 < 7:1) | Target AAA (>= 7:1, Solid) |
| h2.text-2xl.font-black | /G/e/r/b/a/n/g/ /M/a/s/u/k/ /O/S/C/ | #0f172a | #ffffff | 17.85:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| p.text-xs.text-slate-500 | /S/i/m/u/l/a/s/i/ /U/j/i/a/n/ /K/o/ | #64748b | #ffffff | 4.76:1 | Gagal (4.76:1 < 7:1) | Target AAA (>= 7:1, Solid) |
| label.block.text-xs | /P/i/l/i/h/ /P/e/r/a/n/ /P/e/n/g/g/ | #334155 | #ffffff | 10.35:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| select#login-select-role | /s/t/u/d/e/n/t/ | #1e293b | #f8fafc | 13.98:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| input#login-input-nim | /C/o/n/t/o/h/:/ /2/0/2/4/-/0/8/1/9/ | #000000 | #ffffff | 21:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| input#login-input-token | /M/a/s/u/k/k/a/n/ /t/o/k/e/n/ /u/j/ | #000000 | #f9fefd | 20.62:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| div.bg-teal-50.border | /✨/ /N/a/m/a/,/ /J/e/n/i/s/ /K/e/l/ | #134e4a | #f0fdfa | 9.09:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| strong | /O/t/o/r/i/t/a/s/ /R/o/s/t/e/r/ /S/ | #134e4a | #f0fdfa | 9.09:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| div#login-error | /N/I/M/ /a/t/a/u/ /t/o/k/e/n/ /u/j/ | #9f1239 | #fff1f2 | 7.3:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| button#btn-login-submit | /M/a/s/u/k/ /k/e/ /S/i/m/u/l/a/s/i/ | #ffffff | #0f766e | 5.47:1 | Gagal (5.47:1 < 7:1) | Target AAA (>= 7:1, Solid) |
| span.font-black.tracking-wider | /M/I/N/I/M/A/P/ /2/ /K/O/R/I/D/O/R/ | #5eead4 | #090d17 | 13.13:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span#minimap-pos-label | /S/T/-/0/1/ | #cbd5e1 | #090d17 | 13.08:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span.text-base.leading-none | /⚠/️/ | #fff1f2 | #821336 | 9.12:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| div.flex-1.leading-relaxed | /N/I/M/ /a/t/a/u/ /t/o/k/e/n/ /u/j/ | #fff1f2 | #821336 | 9.12:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| button.font-bold.px-1 | /✕/ | #ffffff | #821336 | 10.02:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |

### State: HUD KORIDOR 1ST

| Selector | Teks Singkat | Warna Teks | Warna Latar | Rasio Kontras | Status Baseline | Status Target |
|---|---|---|---|---|---|---|
| div#chair-marker-station | /S/T/A/T/I/O/N/ /0/1/ | #99f6e4 | #0f766e | 4.34:1 | Gagal (4.34:1 < 7:1) | Target AAA (>= 7:1, Solid) |
| div#chair-marker-label | /D/u/d/u/k/ /d/i/ /k/u/r/s/i/ /t/u/ | #ffffff | #0f766e | 5.47:1 | Gagal (5.47:1 < 7:1) | Target AAA (>= 7:1, Solid) |
| span.px-1.5.py-0.5 | /E/ | #1e1b4b | #ffffff | 15.99:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| span#door-marker-text | /B/a/c/a/ /P/e/t/u/n/j/u/k/ /P/e/s/ | #ffffff | #2e2c78 | 12.02:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span#hud-phase-label | /W/a/k/t/u/ /p/e/r/s/i/a/p/a/n/ | #0f5132 | #f3f5f8 | 8.57:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span#hud-mode-badge | /K/a/n/d/i/d/a/t/ /P/e/s/e/r/t/a/ | #0f5132 | #f3f5f8 | 8.57:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| h2#hud-station-title | /S/t/a/t/i/o/n/ /0/1/ | #1e293b | #f3f5f8 | 13.39:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| div#hud-timer | /0/0/:/3/0/ | #0f5132 | #f3f5f8 | 8.57:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| div#hud-station-subtitle | /P/e/m/b/u/a/t/a/n/ /1/:/ /P/e/r/a/ | #1e293b | #f3f5f8 | 13.39:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span#btn-skip-label | /L/e/w/a/t/i/ /s/i/s/a/ /w/a/k/t/u/ | #1e293b | #f1f5f9 | 13.35:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| span | /→/ | #1e293b | #f1f5f9 | 13.35:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| span.inline-flex.items-center | /B/e/r/g/e/r/a/k/ | #334155 | #f3f5f8 | 9.48:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| kbd.px-1.5.py-0.5 | /W/A/S/D/ | #334155 | #f1f5f9 | 9.45:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| span.text-slate-300 | /|/ | #cbd5e1 | #f3f5f8 | 1.36:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span.text-slate-300.hidden | /|/ | #cbd5e1 | #f3f5f8 | 1.36:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| kbd.px-1.5.py-0.5 | /V/ | #0f5132 | #f1f5f9 | 8.54:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| span#cam-hint-label | /K/a/m/e/r/a/ /O/r/a/n/g/ /k/e/-/1/ | #0f5132 | #f3f5f8 | 8.57:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span | /�/�/ /M/a/h/a/s/i/s/w/a/ /(/1/0/)/ | #4338ca | #f3f5f8 | 7.24:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| button#btn-open-map | /P/e/t/a/ /1/0/ /S/t/a/t/i/o/n/ | #0f5132 | #f3f5f8 | 8.57:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span#telemetry-users | /2/./0/0/0/ /P/e/s/e/r/t/a/ /O/n/l/ | #34d399 | #090d17 | 10.1:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span.text-slate-500 | /•/ | #64748b | #090d17 | 4.08:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span#telemetry-cluster | /I/n/s/t/a/n/c/e/ /#/0/1/4///2/0/0/ | #e2e8f0 | #090d17 | 15.75:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span.text-slate-500.hidden | /•/ | #64748b | #090d17 | 4.08:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span#telemetry-assessor-mode | /S/h/a/r/d/i/n/g/:/ /R/o/o/m/ /P/a/ | #fcd34d | #090d17 | 13.47:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span | /�/�/ | #115e59 | #f3f5f8 | 6.94:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span#label-corridor-wing | /K/o/r/i/d/o/r/ /A/ /(/0/1/-/1/0/)/ | #115e59 | #f3f5f8 | 6.94:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span | /�/�/ | #ffffff | #059669 | 3.77:1 | Gagal (3.77:1 < 7:1) | Target AAA (>= 7:1, Solid) |
| span#voice-icon | /�/�/ | #334155 | #f3f5f8 | 9.48:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span#voice-label | /S/u/a/r/a/ | #334155 | #f3f5f8 | 9.48:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span | /�/�/ | #ffffff | #4f46e5 | 6.29:1 | Gagal (6.29:1 < 7:1) | Target AAA (>= 7:1, Solid) |
| span.hidden | /B/l/u/e/p/r/i/n/t/ | #ffffff | #4f46e5 | 6.29:1 | Gagal (6.29:1 < 7:1) | Target AAA (>= 7:1, Solid) |
| button#btn-hud-lang | /�/�/�/�/ | #334155 | #f3f5f8 | 9.48:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span | /I/D/ | #334155 | #f3f5f8 | 9.48:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| kbd.hidden.px-1 | /E/s/c/ | #334155 | #f1f5f9 | 9.45:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| span.text-slate-500.font-medium | /R/o/t/a/s/i/:/ | #1e293b | #f3f5f8 | 13.39:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| select#select-movement-mode | /h/y/b/r/i/d/ | #1e293b | #f1f5f9 | 13.35:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| button#btn-move-forward | /▲/ /W/ | #1e293b | #f1f5f9 | 13.35:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| button#btn-move-back | /▼/ /S/ | #1e293b | #f1f5f9 | 13.35:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| button#btn-turn-left | /◀/ /A/ | #1e293b | #f1f5f9 | 13.35:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| button#btn-turn-right | /D/ /▶/ | #1e293b | #f1f5f9 | 13.35:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| kbd.px-2.py-0.5 | /E/ | #ffffff | #0f766e | 5.47:1 | Gagal (5.47:1 < 7:1) | Target AAA (>= 7:1, Solid) |
| span#context-action-label | /D/u/d/u/k/ /—/ /S/t/a/t/i/o/n/ /0/ | #1e293b | #f3f5f8 | 13.39:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| div#hud-subtitle-banner | /S/e/l/a/m/a/t/ /d/a/t/a/n/g/ /d/i/ | #334155 | #f3f5f8 | 9.48:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span#hud-progress-count | /0///1/0/ /s/e/l/e/s/a/i/ | #1e293b | #f3f5f8 | 13.39:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span.text-slate-400 | /▼/ | #94a3b8 | #f3f5f8 | 2.35:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| button.btn-lang-switch.absolute | /�/�/�/�/ | #334155 | #f1f5f9 | 9.45:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| span | /I/D/ | #334155 | #f1f5f9 | 9.45:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| div.w-14.h-14 | /�/�/ | #ffffff | #0d9488 | 3.74:1 | Gagal (3.74:1 < 7:1) | Target AAA (>= 7:1, Solid) |
| h2.text-2xl.font-black | /G/e/r/b/a/n/g/ /M/a/s/u/k/ /O/S/C/ | #0f172a | #ffffff | 17.85:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| p.text-xs.text-slate-500 | /S/i/m/u/l/a/s/i/ /U/j/i/a/n/ /K/o/ | #64748b | #ffffff | 4.76:1 | Gagal (4.76:1 < 7:1) | Target AAA (>= 7:1, Solid) |
| label.block.text-xs | /P/i/l/i/h/ /P/e/r/a/n/ /P/e/n/g/g/ | #334155 | #ffffff | 10.35:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| select#login-select-role | /s/t/u/d/e/n/t/ | #1e293b | #f8fafc | 13.98:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| input#login-input-nim | /C/o/n/t/o/h/:/ /2/0/2/4/-/0/8/1/9/ | #000000 | #ffffff | 21:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| input#login-input-token | /M/a/s/u/k/k/a/n/ /t/o/k/e/n/ /u/j/ | #000000 | #f9fefd | 20.62:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| div.bg-teal-50.border | /✨/ /N/a/m/a/,/ /J/e/n/i/s/ /K/e/l/ | #134e4a | #f0fdfa | 9.09:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| strong | /O/t/o/r/i/t/a/s/ /R/o/s/t/e/r/ /S/ | #134e4a | #f0fdfa | 9.09:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| div#login-error | /N/I/M/ /a/t/a/u/ /t/o/k/e/n/ /u/j/ | #9f1239 | #fff1f2 | 7.3:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| button#btn-login-submit | /M/a/s/u/k/ /k/e/ /S/i/m/u/l/a/s/i/ | #ffffff | #0f766e | 5.47:1 | Gagal (5.47:1 < 7:1) | Target AAA (>= 7:1, Solid) |
| span.font-black.tracking-wider | /M/I/N/I/M/A/P/ /2/ /K/O/R/I/D/O/R/ | #5eead4 | #090d17 | 13.13:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span#minimap-pos-label | /S/T/-/0/1/ | #cbd5e1 | #090d17 | 13.08:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span.text-base.leading-none | /⚠/️/ | #fff1f2 | #821336 | 9.12:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| div.flex-1.leading-relaxed | /N/I/M/ /a/t/a/u/ /t/o/k/e/n/ /u/j/ | #fff1f2 | #821336 | 9.12:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| button.font-bold.px-1 | /✕/ | #ffffff | #821336 | 10.02:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |

### State: TOAST

| Selector | Teks Singkat | Warna Teks | Warna Latar | Rasio Kontras | Status Baseline | Status Target |
|---|---|---|---|---|---|---|
| div#chair-marker-station | /S/T/A/T/I/O/N/ /0/1/ | #99f6e4 | #0f766e | 4.34:1 | Gagal (4.34:1 < 7:1) | Target AAA (>= 7:1, Solid) |
| div#chair-marker-label | /D/u/d/u/k/ /d/i/ /k/u/r/s/i/ /t/u/ | #ffffff | #0f766e | 5.47:1 | Gagal (5.47:1 < 7:1) | Target AAA (>= 7:1, Solid) |
| span.px-1.5.py-0.5 | /E/ | #1e1b4b | #ffffff | 15.99:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| span#door-marker-text | /B/a/c/a/ /P/e/t/u/n/j/u/k/ /P/e/s/ | #ffffff | #2e2c78 | 12.02:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span#hud-phase-label | /W/a/k/t/u/ /p/e/r/s/i/a/p/a/n/ | #0f5132 | #f3f5f8 | 8.57:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span#hud-mode-badge | /K/a/n/d/i/d/a/t/ /P/e/s/e/r/t/a/ | #0f5132 | #f3f5f8 | 8.57:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| h2#hud-station-title | /S/t/a/t/i/o/n/ /0/1/ | #1e293b | #f3f5f8 | 13.39:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| div#hud-timer | /0/0/:/3/0/ | #0f5132 | #f3f5f8 | 8.57:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| div#hud-station-subtitle | /P/e/m/b/u/a/t/a/n/ /1/:/ /P/e/r/a/ | #1e293b | #f3f5f8 | 13.39:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span#btn-skip-label | /L/e/w/a/t/i/ /s/i/s/a/ /w/a/k/t/u/ | #1e293b | #f1f5f9 | 13.35:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| span | /→/ | #1e293b | #f1f5f9 | 13.35:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| span.inline-flex.items-center | /B/e/r/g/e/r/a/k/ | #334155 | #f3f5f8 | 9.48:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| kbd.px-1.5.py-0.5 | /W/A/S/D/ | #334155 | #f1f5f9 | 9.45:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| span.text-slate-300 | /|/ | #cbd5e1 | #f3f5f8 | 1.36:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span.text-slate-300.hidden | /|/ | #cbd5e1 | #f3f5f8 | 1.36:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| kbd.px-1.5.py-0.5 | /V/ | #0f5132 | #f1f5f9 | 8.54:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| span#cam-hint-label | /K/a/m/e/r/a/ /O/r/a/n/g/ /k/e/-/3/ | #0f5132 | #f3f5f8 | 8.57:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span | /�/�/ /M/a/h/a/s/i/s/w/a/ /(/1/0/)/ | #4338ca | #f3f5f8 | 7.24:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| button#btn-open-map | /P/e/t/a/ /1/0/ /S/t/a/t/i/o/n/ | #0f5132 | #f3f5f8 | 8.57:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span#telemetry-users | /2/./0/0/0/ /P/e/s/e/r/t/a/ /O/n/l/ | #34d399 | #090d17 | 10.1:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span.text-slate-500 | /•/ | #64748b | #090d17 | 4.08:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span#telemetry-cluster | /I/n/s/t/a/n/c/e/ /#/0/1/4///2/0/0/ | #e2e8f0 | #090d17 | 15.75:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span.text-slate-500.hidden | /•/ | #64748b | #090d17 | 4.08:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span#telemetry-assessor-mode | /S/h/a/r/d/i/n/g/:/ /R/o/o/m/ /P/a/ | #fcd34d | #090d17 | 13.47:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span | /�/�/ | #115e59 | #f3f5f8 | 6.94:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span#label-corridor-wing | /K/o/r/i/d/o/r/ /A/ /(/0/1/-/1/0/)/ | #115e59 | #f3f5f8 | 6.94:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span | /�/�/ | #ffffff | #059669 | 3.77:1 | Gagal (3.77:1 < 7:1) | Target AAA (>= 7:1, Solid) |
| span#voice-icon | /�/�/ | #334155 | #f3f5f8 | 9.48:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span#voice-label | /S/u/a/r/a/ | #334155 | #f3f5f8 | 9.48:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span | /�/�/ | #ffffff | #4f46e5 | 6.29:1 | Gagal (6.29:1 < 7:1) | Target AAA (>= 7:1, Solid) |
| span.hidden | /B/l/u/e/p/r/i/n/t/ | #ffffff | #4f46e5 | 6.29:1 | Gagal (6.29:1 < 7:1) | Target AAA (>= 7:1, Solid) |
| button#btn-hud-lang | /�/�/�/�/ | #334155 | #f3f5f8 | 9.48:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span | /I/D/ | #334155 | #f3f5f8 | 9.48:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| kbd.hidden.px-1 | /E/s/c/ | #334155 | #f1f5f9 | 9.45:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| span.text-slate-500.font-medium | /R/o/t/a/s/i/:/ | #1e293b | #f3f5f8 | 13.39:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| select#select-movement-mode | /h/y/b/r/i/d/ | #1e293b | #f1f5f9 | 13.35:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| button#btn-move-forward | /▲/ /W/ | #1e293b | #f1f5f9 | 13.35:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| button#btn-move-back | /▼/ /S/ | #1e293b | #f1f5f9 | 13.35:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| button#btn-turn-left | /◀/ /A/ | #1e293b | #f1f5f9 | 13.35:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| button#btn-turn-right | /D/ /▶/ | #1e293b | #f1f5f9 | 13.35:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| kbd.px-2.py-0.5 | /E/ | #ffffff | #0f766e | 5.47:1 | Gagal (5.47:1 < 7:1) | Target AAA (>= 7:1, Solid) |
| span#context-action-label | /D/u/d/u/k/ /—/ /S/t/a/t/i/o/n/ /0/ | #1e293b | #f3f5f8 | 13.39:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| div#hud-subtitle-banner | /S/e/l/a/m/a/t/ /d/a/t/a/n/g/ /d/i/ | #334155 | #f3f5f8 | 9.48:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span#hud-progress-count | /0///1/0/ /s/e/l/e/s/a/i/ | #1e293b | #f3f5f8 | 13.39:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span.text-slate-400 | /▼/ | #94a3b8 | #f3f5f8 | 2.35:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| button.btn-lang-switch.absolute | /�/�/�/�/ | #334155 | #f1f5f9 | 9.45:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| span | /I/D/ | #334155 | #f1f5f9 | 9.45:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| div.w-14.h-14 | /�/�/ | #ffffff | #0d9488 | 3.74:1 | Gagal (3.74:1 < 7:1) | Target AAA (>= 7:1, Solid) |
| h2.text-2xl.font-black | /G/e/r/b/a/n/g/ /M/a/s/u/k/ /O/S/C/ | #0f172a | #ffffff | 17.85:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| p.text-xs.text-slate-500 | /S/i/m/u/l/a/s/i/ /U/j/i/a/n/ /K/o/ | #64748b | #ffffff | 4.76:1 | Gagal (4.76:1 < 7:1) | Target AAA (>= 7:1, Solid) |
| label.block.text-xs | /P/i/l/i/h/ /P/e/r/a/n/ /P/e/n/g/g/ | #334155 | #ffffff | 10.35:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| select#login-select-role | /s/t/u/d/e/n/t/ | #1e293b | #f8fafc | 13.98:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| input#login-input-nim | /C/o/n/t/o/h/:/ /2/0/2/4/-/0/8/1/9/ | #000000 | #ffffff | 21:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| input#login-input-token | /M/a/s/u/k/k/a/n/ /t/o/k/e/n/ /u/j/ | #000000 | #f9fefd | 20.62:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| div.bg-teal-50.border | /✨/ /N/a/m/a/,/ /J/e/n/i/s/ /K/e/l/ | #134e4a | #f0fdfa | 9.09:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| strong | /O/t/o/r/i/t/a/s/ /R/o/s/t/e/r/ /S/ | #134e4a | #f0fdfa | 9.09:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| div#login-error | /N/I/M/ /a/t/a/u/ /t/o/k/e/n/ /u/j/ | #9f1239 | #fff1f2 | 7.3:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| button#btn-login-submit | /M/a/s/u/k/ /k/e/ /S/i/m/u/l/a/s/i/ | #ffffff | #0f766e | 5.47:1 | Gagal (5.47:1 < 7:1) | Target AAA (>= 7:1, Solid) |
| span.font-black.tracking-wider | /M/I/N/I/M/A/P/ /2/ /K/O/R/I/D/O/R/ | #5eead4 | #090d17 | 13.13:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span#minimap-pos-label | /S/T/-/0/1/ | #cbd5e1 | #090d17 | 13.08:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span.text-base.leading-none | /⚠/️/ | #fff1f2 | #821336 | 9.12:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| div.flex-1.leading-relaxed | /N/I/M/ /a/t/a/u/ /t/o/k/e/n/ /u/j/ | #fff1f2 | #821336 | 9.12:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| button.font-bold.px-1 | /✕/ | #ffffff | #821336 | 10.02:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span.text-base.leading-none | /�/�/ | #f8fafc | #0f172a | 17.06:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| div.flex-1.leading-relaxed | /C/o/n/t/o/h/ /P/e/s/a/n/ /N/o/t/i/ | #f8fafc | #0f172a | 17.06:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| button.font-bold.px-1 | /✕/ | #ffffff | #0f172a | 17.85:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |

### State: MODAL INSTRUKSI

| Selector | Teks Singkat | Warna Teks | Warna Latar | Rasio Kontras | Status Baseline | Status Target |
|---|---|---|---|---|---|---|
| div#chair-marker-station | /S/T/A/T/I/O/N/ /0/1/ | #99f6e4 | #0f766e | 4.34:1 | Gagal (4.34:1 < 7:1) | Target AAA (>= 7:1, Solid) |
| div#chair-marker-label | /D/u/d/u/k/ /d/i/ /k/u/r/s/i/ /t/u/ | #ffffff | #0f766e | 5.47:1 | Gagal (5.47:1 < 7:1) | Target AAA (>= 7:1, Solid) |
| span.px-1.5.py-0.5 | /E/ | #1e1b4b | #ffffff | 15.99:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| span#door-marker-text | /B/a/c/a/ /P/e/t/u/n/j/u/k/ /P/e/s/ | #ffffff | #2e2c78 | 12.02:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span#hud-phase-label | /W/a/k/t/u/ /p/e/r/s/i/a/p/a/n/ | #0f5132 | #f3f5f8 | 8.57:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span#hud-mode-badge | /K/a/n/d/i/d/a/t/ /P/e/s/e/r/t/a/ | #0f5132 | #f3f5f8 | 8.57:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| h2#hud-station-title | /S/t/a/t/i/o/n/ /0/1/ | #1e293b | #f3f5f8 | 13.39:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| div#hud-timer | /0/0/:/3/0/ | #0f5132 | #f3f5f8 | 8.57:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| div#hud-station-subtitle | /P/e/m/b/u/a/t/a/n/ /1/:/ /P/e/r/a/ | #1e293b | #f3f5f8 | 13.39:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span#btn-skip-label | /L/e/w/a/t/i/ /s/i/s/a/ /w/a/k/t/u/ | #1e293b | #f1f5f9 | 13.35:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| span | /→/ | #1e293b | #f1f5f9 | 13.35:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| span.inline-flex.items-center | /B/e/r/g/e/r/a/k/ | #334155 | #f3f5f8 | 9.48:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| kbd.px-1.5.py-0.5 | /W/A/S/D/ | #334155 | #f1f5f9 | 9.45:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| span.text-slate-300 | /|/ | #cbd5e1 | #f3f5f8 | 1.36:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span.text-slate-300.hidden | /|/ | #cbd5e1 | #f3f5f8 | 1.36:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| kbd.px-1.5.py-0.5 | /V/ | #0f5132 | #f1f5f9 | 8.54:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| span#cam-hint-label | /K/a/m/e/r/a/ /O/r/a/n/g/ /k/e/-/3/ | #0f5132 | #f3f5f8 | 8.57:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span | /�/�/ /M/a/h/a/s/i/s/w/a/ /(/1/0/)/ | #4338ca | #f3f5f8 | 7.24:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| button#btn-open-map | /P/e/t/a/ /1/0/ /S/t/a/t/i/o/n/ | #0f5132 | #f3f5f8 | 8.57:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span#telemetry-users | /2/./0/0/0/ /P/e/s/e/r/t/a/ /O/n/l/ | #34d399 | #090d17 | 10.1:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span.text-slate-500 | /•/ | #64748b | #090d17 | 4.08:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span#telemetry-cluster | /I/n/s/t/a/n/c/e/ /#/0/1/4///2/0/0/ | #e2e8f0 | #090d17 | 15.75:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span.text-slate-500.hidden | /•/ | #64748b | #090d17 | 4.08:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span#telemetry-assessor-mode | /S/h/a/r/d/i/n/g/:/ /R/o/o/m/ /P/a/ | #fcd34d | #090d17 | 13.47:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span | /�/�/ | #115e59 | #f3f5f8 | 6.94:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span#label-corridor-wing | /K/o/r/i/d/o/r/ /A/ /(/0/1/-/1/0/)/ | #115e59 | #f3f5f8 | 6.94:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span | /�/�/ | #ffffff | #059669 | 3.77:1 | Gagal (3.77:1 < 7:1) | Target AAA (>= 7:1, Solid) |
| span#voice-icon | /�/�/ | #334155 | #f3f5f8 | 9.48:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span#voice-label | /S/u/a/r/a/ | #334155 | #f3f5f8 | 9.48:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span | /�/�/ | #ffffff | #4f46e5 | 6.29:1 | Gagal (6.29:1 < 7:1) | Target AAA (>= 7:1, Solid) |
| span.hidden | /B/l/u/e/p/r/i/n/t/ | #ffffff | #4f46e5 | 6.29:1 | Gagal (6.29:1 < 7:1) | Target AAA (>= 7:1, Solid) |
| button#btn-hud-lang | /�/�/�/�/ | #334155 | #f3f5f8 | 9.48:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span | /I/D/ | #334155 | #f3f5f8 | 9.48:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| kbd.hidden.px-1 | /E/s/c/ | #334155 | #f1f5f9 | 9.45:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| span.text-slate-500.font-medium | /R/o/t/a/s/i/:/ | #1e293b | #f3f5f8 | 13.39:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| select#select-movement-mode | /h/y/b/r/i/d/ | #1e293b | #f1f5f9 | 13.35:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| button#btn-move-forward | /▲/ /W/ | #1e293b | #f1f5f9 | 13.35:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| button#btn-move-back | /▼/ /S/ | #1e293b | #f1f5f9 | 13.35:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| button#btn-turn-left | /◀/ /A/ | #1e293b | #f1f5f9 | 13.35:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| button#btn-turn-right | /D/ /▶/ | #1e293b | #f1f5f9 | 13.35:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| kbd.px-2.py-0.5 | /E/ | #ffffff | #0f766e | 5.47:1 | Gagal (5.47:1 < 7:1) | Target AAA (>= 7:1, Solid) |
| span#context-action-label | /D/u/d/u/k/ /—/ /S/t/a/t/i/o/n/ /0/ | #1e293b | #f3f5f8 | 13.39:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| div#hud-subtitle-banner | /S/e/l/a/m/a/t/ /d/a/t/a/n/g/ /d/i/ | #334155 | #f3f5f8 | 9.48:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span#hud-progress-count | /0///1/0/ /s/e/l/e/s/a/i/ | #1e293b | #f3f5f8 | 13.39:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span.text-slate-400 | /▼/ | #94a3b8 | #f3f5f8 | 2.35:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| button.btn-lang-switch.absolute | /�/�/�/�/ | #334155 | #f1f5f9 | 9.45:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| span | /I/D/ | #334155 | #f1f5f9 | 9.45:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| div.w-14.h-14 | /�/�/ | #ffffff | #0d9488 | 3.74:1 | Gagal (3.74:1 < 7:1) | Target AAA (>= 7:1, Solid) |
| h2.text-2xl.font-black | /G/e/r/b/a/n/g/ /M/a/s/u/k/ /O/S/C/ | #0f172a | #ffffff | 17.85:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| p.text-xs.text-slate-500 | /S/i/m/u/l/a/s/i/ /U/j/i/a/n/ /K/o/ | #64748b | #ffffff | 4.76:1 | Gagal (4.76:1 < 7:1) | Target AAA (>= 7:1, Solid) |
| label.block.text-xs | /P/i/l/i/h/ /P/e/r/a/n/ /P/e/n/g/g/ | #334155 | #ffffff | 10.35:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| select#login-select-role | /s/t/u/d/e/n/t/ | #1e293b | #f8fafc | 13.98:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| input#login-input-nim | /C/o/n/t/o/h/:/ /2/0/2/4/-/0/8/1/9/ | #000000 | #ffffff | 21:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| input#login-input-token | /M/a/s/u/k/k/a/n/ /t/o/k/e/n/ /u/j/ | #000000 | #f9fefd | 20.62:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| div.bg-teal-50.border | /✨/ /N/a/m/a/,/ /J/e/n/i/s/ /K/e/l/ | #134e4a | #f0fdfa | 9.09:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| strong | /O/t/o/r/i/t/a/s/ /R/o/s/t/e/r/ /S/ | #134e4a | #f0fdfa | 9.09:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| div#login-error | /N/I/M/ /a/t/a/u/ /t/o/k/e/n/ /u/j/ | #9f1239 | #fff1f2 | 7.3:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| button#btn-login-submit | /M/a/s/u/k/ /k/e/ /S/i/m/u/l/a/s/i/ | #ffffff | #0f766e | 5.47:1 | Gagal (5.47:1 < 7:1) | Target AAA (>= 7:1, Solid) |
| span#inst-badge | /S/T/A/T/I/O/N/ /0/1/ /•/ /P/E/M/B/ | #3730a3 | #e0e7ff | 8.06:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| h3#inst-title | /P/e/r/a/n/c/a/n/g/a/n/ /S/e/d/i/a/ | #0f172a | #ffffff | 17.85:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| button#btn-close-instruction | /✕/ | #94a3b8 | #ffffff | 2.56:1 | Gagal (2.56:1 < 7:1) | Target AAA (>= 7:1, Solid) |
| div.font-bold.text-amber-900 | /S/k/e/n/a/r/i/o/ /K/a/s/u/s/:/ | #78350f | #fffbeb | 8.75:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| p#inst-scenario | /A/n/d/a/ /a/d/a/l/a/h/ /A/p/o/t/e/ | #451a03 | #fffbeb | 14.44:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| div.font-bold.text-slate-900 | /T/u/g/a/s/ /K/a/n/d/i/d/a/t/:/ | #0f172a | #f8fafc | 17.06:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| li | /P/e/l/a/j/a/r/i/ /k/o/m/p/o/s/i/s/ | #334155 | #f8fafc | 9.9:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| div.font-bold.text-teal-900 | /K/o/m/p/e/t/e/n/s/i/ /U/t/a/m/a/:/ | #134e4a | #f0fdfa | 9.09:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| div#inst-competencies | /P/e/n/e/t/a/p/a/n/ /M/a/s/a/l/a/h/ | #115e59 | #f0fdfa | 7.27:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| span#inst-door-status | /P/i/n/t/u/ /T/e/r/k/u/n/c/i/ /(/W/ | #78350f | #fde68a | 7.28:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| button#btn-inst-sit | /D/u/d/u/k/ /d/i/ /K/u/r/s/i/ /T/u/ | #334155 | #f1f5f9 | 9.45:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| button#btn-inst-enter | /B/u/k/a/ /P/i/n/t/u/ /&/ /M/a/s/u/ | #ffffff | #0f766e | 5.47:1 | Gagal (5.47:1 < 7:1) | Target AAA (>= 7:1, Solid) |
| span.font-black.tracking-wider | /M/I/N/I/M/A/P/ /2/ /K/O/R/I/D/O/R/ | #5eead4 | #090d17 | 13.13:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span#minimap-pos-label | /S/T/-/0/1/ | #cbd5e1 | #090d17 | 13.08:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span.text-base.leading-none | /�/�/ | #f8fafc | #0f172a | 17.06:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| div.flex-1.leading-relaxed | /C/o/n/t/o/h/ /P/e/s/a/n/ /N/o/t/i/ | #f8fafc | #0f172a | 17.06:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| button.font-bold.px-1 | /✕/ | #ffffff | #0f172a | 17.85:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span.text-base.leading-none | /⚠/️/ | #fff1f2 | #821336 | 9.12:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| div.flex-1.leading-relaxed | /S/e/s/i/ /t/e/l/a/h/ /b/e/r/a/k/h/ | #fff1f2 | #821336 | 9.12:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| button.font-bold.px-1 | /✕/ | #ffffff | #821336 | 10.02:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |

### State: MODAL WORKSTATION

| Selector | Teks Singkat | Warna Teks | Warna Latar | Rasio Kontras | Status Baseline | Status Target |
|---|---|---|---|---|---|---|
| div#chair-marker-station | /S/T/A/T/I/O/N/ /0/1/ | #99f6e4 | #0f766e | 4.34:1 | Gagal (4.34:1 < 7:1) | Target AAA (>= 7:1, Solid) |
| div#chair-marker-label | /D/u/d/u/k/ /d/i/ /k/u/r/s/i/ /t/u/ | #ffffff | #0f766e | 5.47:1 | Gagal (5.47:1 < 7:1) | Target AAA (>= 7:1, Solid) |
| span.px-1.5.py-0.5 | /E/ | #1e1b4b | #ffffff | 15.99:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| span#door-marker-text | /M/a/s/u/k/ /R/u/a/n/g/a/n/ /S/t/a/ | #ffffff | #2e2c78 | 12.02:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span#hud-phase-label | /W/a/k/t/u/ /k/e/r/j/a/ | #0f5132 | #f3f5f8 | 8.57:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span#hud-mode-badge | /K/a/n/d/i/d/a/t/ /P/e/s/e/r/t/a/ | #0f5132 | #f3f5f8 | 8.57:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| h2#hud-station-title | /S/T/A/T/I/O/N/ /0/1/ | #1e293b | #f3f5f8 | 13.39:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| div#hud-timer | /0/0/:/3/0/ | #0f5132 | #f3f5f8 | 8.57:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| div#hud-station-subtitle | /P/e/m/b/u/a/t/a/n/ /1/ /(/R/&/D/)/ | #1e293b | #f3f5f8 | 13.39:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span#btn-skip-label | /L/e/w/a/t/i/ /s/i/s/a/ /w/a/k/t/u/ | #1e293b | #f1f5f9 | 13.35:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| span | /→/ | #1e293b | #f1f5f9 | 13.35:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| span.inline-flex.items-center | /B/e/r/g/e/r/a/k/ | #334155 | #f3f5f8 | 9.48:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| kbd.px-1.5.py-0.5 | /W/A/S/D/ | #334155 | #f1f5f9 | 9.45:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| span.text-slate-300 | /|/ | #cbd5e1 | #f3f5f8 | 1.36:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span.text-slate-300.hidden | /|/ | #cbd5e1 | #f3f5f8 | 1.36:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| kbd.px-1.5.py-0.5 | /V/ | #0f5132 | #f1f5f9 | 8.54:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| span#cam-hint-label | /K/a/m/e/r/a/ /O/r/a/n/g/ /k/e/-/3/ | #0f5132 | #f3f5f8 | 8.57:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span | /�/�/ /M/a/h/a/s/i/s/w/a/ /(/1/0/)/ | #4338ca | #f3f5f8 | 7.24:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| button#btn-open-map | /P/e/t/a/ /1/0/ /S/t/a/t/i/o/n/ | #0f5132 | #f3f5f8 | 8.57:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span#telemetry-users | /2/./0/0/0/ /P/e/s/e/r/t/a/ /O/n/l/ | #34d399 | #090d17 | 10.1:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span.text-slate-500 | /•/ | #64748b | #090d17 | 4.08:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span#telemetry-cluster | /I/n/s/t/a/n/c/e/ /#/0/1/4///2/0/0/ | #e2e8f0 | #090d17 | 15.75:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span.text-slate-500.hidden | /•/ | #64748b | #090d17 | 4.08:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span#telemetry-assessor-mode | /S/h/a/r/d/i/n/g/:/ /R/o/o/m/ /P/a/ | #fcd34d | #090d17 | 13.47:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span | /�/�/ | #115e59 | #f3f5f8 | 6.94:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span#label-corridor-wing | /K/o/r/i/d/o/r/ /A/ /(/0/1/-/1/0/)/ | #115e59 | #f3f5f8 | 6.94:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span | /�/�/ | #ffffff | #059669 | 3.77:1 | Gagal (3.77:1 < 7:1) | Target AAA (>= 7:1, Solid) |
| span#voice-icon | /�/�/ | #334155 | #f3f5f8 | 9.48:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span#voice-label | /S/u/a/r/a/ | #334155 | #f3f5f8 | 9.48:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span | /�/�/ | #ffffff | #4f46e5 | 6.29:1 | Gagal (6.29:1 < 7:1) | Target AAA (>= 7:1, Solid) |
| span.hidden | /B/l/u/e/p/r/i/n/t/ | #ffffff | #4f46e5 | 6.29:1 | Gagal (6.29:1 < 7:1) | Target AAA (>= 7:1, Solid) |
| button#btn-hud-lang | /�/�/�/�/ | #334155 | #f3f5f8 | 9.48:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span | /I/D/ | #334155 | #f3f5f8 | 9.48:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| kbd.hidden.px-1 | /E/s/c/ | #334155 | #f1f5f9 | 9.45:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| span.text-slate-500.font-medium | /R/o/t/a/s/i/:/ | #1e293b | #f3f5f8 | 13.39:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| select#select-movement-mode | /h/y/b/r/i/d/ | #1e293b | #f1f5f9 | 13.35:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| button#btn-move-forward | /▲/ /W/ | #1e293b | #f1f5f9 | 13.35:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| button#btn-move-back | /▼/ /S/ | #1e293b | #f1f5f9 | 13.35:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| button#btn-turn-left | /◀/ /A/ | #1e293b | #f1f5f9 | 13.35:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| button#btn-turn-right | /D/ /▶/ | #1e293b | #f1f5f9 | 13.35:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| kbd.px-2.py-0.5 | /E/ | #ffffff | #0f766e | 5.47:1 | Gagal (5.47:1 < 7:1) | Target AAA (>= 7:1, Solid) |
| span#context-action-label | /M/a/s/u/k/ /R/u/a/n/g/a/n/ /—/ /S/ | #1e293b | #f3f5f8 | 13.39:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| div#hud-subtitle-banner | /P/i/n/t/u/ /i/n/i/ /t/e/r/k/u/n/c/ | #334155 | #f3f5f8 | 9.48:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span#hud-progress-count | /0///1/0/ /s/e/l/e/s/a/i/ | #1e293b | #f3f5f8 | 13.39:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span.text-slate-400 | /▼/ | #94a3b8 | #f3f5f8 | 2.35:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| button.btn-lang-switch.absolute | /�/�/�/�/ | #334155 | #f1f5f9 | 9.45:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| span | /I/D/ | #334155 | #f1f5f9 | 9.45:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| div.w-14.h-14 | /�/�/ | #ffffff | #0d9488 | 3.74:1 | Gagal (3.74:1 < 7:1) | Target AAA (>= 7:1, Solid) |
| h2.text-2xl.font-black | /G/e/r/b/a/n/g/ /M/a/s/u/k/ /O/S/C/ | #0f172a | #ffffff | 17.85:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| p.text-xs.text-slate-500 | /S/i/m/u/l/a/s/i/ /U/j/i/a/n/ /K/o/ | #64748b | #ffffff | 4.76:1 | Gagal (4.76:1 < 7:1) | Target AAA (>= 7:1, Solid) |
| label.block.text-xs | /P/i/l/i/h/ /P/e/r/a/n/ /P/e/n/g/g/ | #334155 | #ffffff | 10.35:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| select#login-select-role | /s/t/u/d/e/n/t/ | #1e293b | #f8fafc | 13.98:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| input#login-input-nim | /C/o/n/t/o/h/:/ /2/0/2/4/-/0/8/1/9/ | #000000 | #ffffff | 21:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| input#login-input-token | /M/a/s/u/k/k/a/n/ /t/o/k/e/n/ /u/j/ | #000000 | #f9fefd | 20.62:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| div.bg-teal-50.border | /✨/ /N/a/m/a/,/ /J/e/n/i/s/ /K/e/l/ | #134e4a | #f0fdfa | 9.09:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| strong | /O/t/o/r/i/t/a/s/ /R/o/s/t/e/r/ /S/ | #134e4a | #f0fdfa | 9.09:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| div#login-error | /N/I/M/ /a/t/a/u/ /t/o/k/e/n/ /u/j/ | #9f1239 | #fff1f2 | 7.3:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| button#btn-login-submit | /M/a/s/u/k/ /k/e/ /S/i/m/u/l/a/s/i/ | #ffffff | #0f766e | 5.47:1 | Gagal (5.47:1 < 7:1) | Target AAA (>= 7:1, Solid) |
| span.font-black.tracking-wider | /M/I/N/I/M/A/P/ /2/ /K/O/R/I/D/O/R/ | #5eead4 | #090d17 | 13.13:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span#minimap-pos-label | /S/T/-/0/1/ | #cbd5e1 | #090d17 | 13.08:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |

### State: MODAL BLUEPRINT

| Selector | Teks Singkat | Warna Teks | Warna Latar | Rasio Kontras | Status Baseline | Status Target |
|---|---|---|---|---|---|---|
| div#chair-marker-station | /S/T/A/T/I/O/N/ /0/1/ | #99f6e4 | #0f766e | 4.34:1 | Gagal (4.34:1 < 7:1) | Target AAA (>= 7:1, Solid) |
| div#chair-marker-label | /D/u/d/u/k/ /d/i/ /k/u/r/s/i/ /t/u/ | #ffffff | #0f766e | 5.47:1 | Gagal (5.47:1 < 7:1) | Target AAA (>= 7:1, Solid) |
| span.px-1.5.py-0.5 | /E/ | #1e1b4b | #ffffff | 15.99:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| span#door-marker-text | /M/a/s/u/k/ /R/u/a/n/g/a/n/ /S/t/a/ | #ffffff | #2e2c78 | 12.02:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span#hud-phase-label | /W/a/k/t/u/ /k/e/r/j/a/ | #0f5132 | #f3f5f8 | 8.57:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span#hud-mode-badge | /K/a/n/d/i/d/a/t/ /P/e/s/e/r/t/a/ | #0f5132 | #f3f5f8 | 8.57:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| h2#hud-station-title | /S/T/A/T/I/O/N/ /0/1/ | #1e293b | #f3f5f8 | 13.39:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| div#hud-timer | /0/0/:/3/0/ | #0f5132 | #f3f5f8 | 8.57:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| div#hud-station-subtitle | /P/e/m/b/u/a/t/a/n/ /1/ /(/R/&/D/)/ | #1e293b | #f3f5f8 | 13.39:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span#btn-skip-label | /L/e/w/a/t/i/ /s/i/s/a/ /w/a/k/t/u/ | #1e293b | #f1f5f9 | 13.35:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| span | /→/ | #1e293b | #f1f5f9 | 13.35:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| span.inline-flex.items-center | /B/e/r/g/e/r/a/k/ | #334155 | #f3f5f8 | 9.48:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| kbd.px-1.5.py-0.5 | /W/A/S/D/ | #334155 | #f1f5f9 | 9.45:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| span.text-slate-300 | /|/ | #cbd5e1 | #f3f5f8 | 1.36:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span.text-slate-300.hidden | /|/ | #cbd5e1 | #f3f5f8 | 1.36:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| kbd.px-1.5.py-0.5 | /V/ | #0f5132 | #f1f5f9 | 8.54:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| span#cam-hint-label | /K/a/m/e/r/a/ /O/r/a/n/g/ /k/e/-/3/ | #0f5132 | #f3f5f8 | 8.57:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span | /�/�/ /M/a/h/a/s/i/s/w/a/ /(/1/0/)/ | #4338ca | #f3f5f8 | 7.24:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| button#btn-open-map | /P/e/t/a/ /1/0/ /S/t/a/t/i/o/n/ | #0f5132 | #f3f5f8 | 8.57:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span#telemetry-users | /2/./0/0/0/ /P/e/s/e/r/t/a/ /O/n/l/ | #34d399 | #090d17 | 10.1:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span.text-slate-500 | /•/ | #64748b | #090d17 | 4.08:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span#telemetry-cluster | /I/n/s/t/a/n/c/e/ /#/0/1/4///2/0/0/ | #e2e8f0 | #090d17 | 15.75:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span.text-slate-500.hidden | /•/ | #64748b | #090d17 | 4.08:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span#telemetry-assessor-mode | /S/h/a/r/d/i/n/g/:/ /R/o/o/m/ /P/a/ | #fcd34d | #090d17 | 13.47:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span | /�/�/ | #115e59 | #f3f5f8 | 6.94:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span#label-corridor-wing | /K/o/r/i/d/o/r/ /A/ /(/0/1/-/1/0/)/ | #115e59 | #f3f5f8 | 6.94:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span | /�/�/ | #ffffff | #059669 | 3.77:1 | Gagal (3.77:1 < 7:1) | Target AAA (>= 7:1, Solid) |
| span#voice-icon | /�/�/ | #334155 | #f3f5f8 | 9.48:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span#voice-label | /S/u/a/r/a/ | #334155 | #f3f5f8 | 9.48:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span | /�/�/ | #ffffff | #4f46e5 | 6.29:1 | Gagal (6.29:1 < 7:1) | Target AAA (>= 7:1, Solid) |
| span.hidden | /B/l/u/e/p/r/i/n/t/ | #ffffff | #4f46e5 | 6.29:1 | Gagal (6.29:1 < 7:1) | Target AAA (>= 7:1, Solid) |
| button#btn-hud-lang | /�/�/�/�/ | #334155 | #f3f5f8 | 9.48:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span | /I/D/ | #334155 | #f3f5f8 | 9.48:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| kbd.hidden.px-1 | /E/s/c/ | #334155 | #f1f5f9 | 9.45:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| span.text-slate-500.font-medium | /R/o/t/a/s/i/:/ | #1e293b | #f3f5f8 | 13.39:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| select#select-movement-mode | /h/y/b/r/i/d/ | #1e293b | #f1f5f9 | 13.35:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| button#btn-move-forward | /▲/ /W/ | #1e293b | #f1f5f9 | 13.35:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| button#btn-move-back | /▼/ /S/ | #1e293b | #f1f5f9 | 13.35:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| button#btn-turn-left | /◀/ /A/ | #1e293b | #f1f5f9 | 13.35:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| button#btn-turn-right | /D/ /▶/ | #1e293b | #f1f5f9 | 13.35:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| kbd.px-2.py-0.5 | /E/ | #ffffff | #0f766e | 5.47:1 | Gagal (5.47:1 < 7:1) | Target AAA (>= 7:1, Solid) |
| span#context-action-label | /M/a/s/u/k/ /R/u/a/n/g/a/n/ /—/ /S/ | #1e293b | #f3f5f8 | 13.39:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| div#hud-subtitle-banner | /A/n/d/a/ /k/e/m/b/a/l/i/ /k/e/ /k/ | #334155 | #f3f5f8 | 9.48:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span#hud-progress-count | /1///1/0/ /s/e/l/e/s/a/i/ | #1e293b | #f3f5f8 | 13.39:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span.text-slate-400 | /▼/ | #94a3b8 | #f3f5f8 | 2.35:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| button.btn-lang-switch.absolute | /�/�/�/�/ | #334155 | #f1f5f9 | 9.45:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| span | /I/D/ | #334155 | #f1f5f9 | 9.45:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| div.w-14.h-14 | /�/�/ | #ffffff | #0d9488 | 3.74:1 | Gagal (3.74:1 < 7:1) | Target AAA (>= 7:1, Solid) |
| h2.text-2xl.font-black | /G/e/r/b/a/n/g/ /M/a/s/u/k/ /O/S/C/ | #0f172a | #ffffff | 17.85:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| p.text-xs.text-slate-500 | /S/i/m/u/l/a/s/i/ /U/j/i/a/n/ /K/o/ | #64748b | #ffffff | 4.76:1 | Gagal (4.76:1 < 7:1) | Target AAA (>= 7:1, Solid) |
| label.block.text-xs | /P/i/l/i/h/ /P/e/r/a/n/ /P/e/n/g/g/ | #334155 | #ffffff | 10.35:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| select#login-select-role | /s/t/u/d/e/n/t/ | #1e293b | #f8fafc | 13.98:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| input#login-input-nim | /C/o/n/t/o/h/:/ /2/0/2/4/-/0/8/1/9/ | #000000 | #ffffff | 21:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| input#login-input-token | /M/a/s/u/k/k/a/n/ /t/o/k/e/n/ /u/j/ | #000000 | #f9fefd | 20.62:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| div.bg-teal-50.border | /✨/ /N/a/m/a/,/ /J/e/n/i/s/ /K/e/l/ | #134e4a | #f0fdfa | 9.09:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| strong | /O/t/o/r/i/t/a/s/ /R/o/s/t/e/r/ /S/ | #134e4a | #f0fdfa | 9.09:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| div#login-error | /N/I/M/ /a/t/a/u/ /t/o/k/e/n/ /u/j/ | #9f1239 | #fff1f2 | 7.3:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| button#btn-login-submit | /M/a/s/u/k/ /k/e/ /S/i/m/u/l/a/s/i/ | #ffffff | #0f766e | 5.47:1 | Gagal (5.47:1 < 7:1) | Target AAA (>= 7:1, Solid) |
| span.px-2.5.py-0.5 | /D/O/K/U/M/E/N/ /T/E/K/N/I/S/ /&/ / | #3730a3 | #e0e7ff | 8.06:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| h3.text-xl.font-extrabold | /B/l/u/e/p/r/i/n/t/ /&/ /A/r/s/i/t/ | #0f172a | #ffffff | 17.85:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| button#btn-close-blueprint | /✕/ | #94a3b8 | #ffffff | 2.56:1 | Gagal (2.56:1 < 7:1) | Target AAA (>= 7:1, Solid) |
| button#btn-bp-tab-algo | /1/./ /A/l/g/o/r/i/t/m/a/ /R/o/t/a/ | #ffffff | #4338ca | 7.9:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| button#btn-bp-tab-stations | /2/./ /M/a/t/r/i/k/s/ /1/0/ /S/t/a/ | #334155 | #f1f5f9 | 9.45:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| button#btn-bp-tab-arch | /3/./ /A/r/s/i/t/e/k/t/u/r/ /2/./0/ | #334155 | #f1f5f9 | 9.45:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| button#btn-bp-tab-score | /4/./ /R/e/k/a/p/ /S/k/o/r/ | #334155 | #f1f5f9 | 9.45:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| div.font-extrabold.text-teal-700 | /T/a/h/a/p/ /1/:/ /P/e/m/b/a/g/i/a/ | #0f766e | #f8fafc | 5.23:1 | Gagal (5.23:1 < 7:1) | Target AAA (>= 7:1, Solid) |
| p.text-xs.leading-relaxed | /2/./0/0/0/ /p/e/s/e/r/t/a/ /l/o/g/ | #334155 | #f8fafc | 9.9:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| strong | /2/0/0/ /I/n/s/t/a/n/c/e/ /K/o/r/i/ | #334155 | #f8fafc | 9.9:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| div.text-xs.text-slate-500 | /S/t/a/n/d/a/r/ /C/e/t/a/k/ /B/i/r/ | #64748b | #ffffff | 4.76:1 | Gagal (4.76:1 < 7:1) | Target AAA (>= 7:1, Solid) |
| button#btn-close-blueprint-bottom | /K/e/m/b/a/l/i/ /k/e/ /S/i/m/u/l/a/ | #ffffff | #0f172a | 17.85:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| span.font-black.tracking-wider | /M/I/N/I/M/A/P/ /2/ /K/O/R/I/D/O/R/ | #5eead4 | #090d17 | 13.13:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span#minimap-pos-label | /S/T/-/0/1/ | #cbd5e1 | #090d17 | 13.08:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |

### State: MODAL ASESOR SCORES

| Selector | Teks Singkat | Warna Teks | Warna Latar | Rasio Kontras | Status Baseline | Status Target |
|---|---|---|---|---|---|---|
| div#chair-marker-station | /S/T/A/T/I/O/N/ /0/1/ | #99f6e4 | #0f766e | 4.34:1 | Gagal (4.34:1 < 7:1) | Target AAA (>= 7:1, Solid) |
| div#chair-marker-label | /D/u/d/u/k/ /d/i/ /k/u/r/s/i/ /t/u/ | #ffffff | #0f766e | 5.47:1 | Gagal (5.47:1 < 7:1) | Target AAA (>= 7:1, Solid) |
| span.px-1.5.py-0.5 | /E/ | #1e1b4b | #ffffff | 15.99:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| span#door-marker-text | /M/a/s/u/k/ /R/u/a/n/g/a/n/ /S/t/a/ | #ffffff | #2e2c78 | 12.02:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span#hud-phase-label | /W/a/k/t/u/ /k/e/r/j/a/ | #0f5132 | #f3f5f8 | 8.57:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span#hud-mode-badge | /K/a/n/d/i/d/a/t/ /P/e/s/e/r/t/a/ | #0f5132 | #f3f5f8 | 8.57:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| h2#hud-station-title | /S/T/A/T/I/O/N/ /0/1/ | #1e293b | #f3f5f8 | 13.39:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| div#hud-timer | /0/0/:/3/0/ | #0f5132 | #f3f5f8 | 8.57:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| div#hud-station-subtitle | /P/e/m/b/u/a/t/a/n/ /1/ /(/R/&/D/)/ | #1e293b | #f3f5f8 | 13.39:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span#btn-skip-label | /L/e/w/a/t/i/ /s/i/s/a/ /w/a/k/t/u/ | #1e293b | #f1f5f9 | 13.35:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| span | /→/ | #1e293b | #f1f5f9 | 13.35:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| span.inline-flex.items-center | /B/e/r/g/e/r/a/k/ | #334155 | #f3f5f8 | 9.48:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| kbd.px-1.5.py-0.5 | /W/A/S/D/ | #334155 | #f1f5f9 | 9.45:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| span.text-slate-300 | /|/ | #cbd5e1 | #f3f5f8 | 1.36:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span.text-slate-300.hidden | /|/ | #cbd5e1 | #f3f5f8 | 1.36:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| kbd.px-1.5.py-0.5 | /V/ | #0f5132 | #f1f5f9 | 8.54:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| span#cam-hint-label | /K/a/m/e/r/a/ /O/r/a/n/g/ /k/e/-/3/ | #0f5132 | #f3f5f8 | 8.57:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span | /�/�/ /M/a/h/a/s/i/s/w/a/ /(/1/0/)/ | #4338ca | #f3f5f8 | 7.24:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| button#btn-open-map | /P/e/t/a/ /1/0/ /S/t/a/t/i/o/n/ | #0f5132 | #f3f5f8 | 8.57:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span#telemetry-users | /2/./0/0/0/ /P/e/s/e/r/t/a/ /O/n/l/ | #34d399 | #090d17 | 10.1:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span.text-slate-500 | /•/ | #64748b | #090d17 | 4.08:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span#telemetry-cluster | /I/n/s/t/a/n/c/e/ /#/0/1/4///2/0/0/ | #e2e8f0 | #090d17 | 15.75:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span.text-slate-500.hidden | /•/ | #64748b | #090d17 | 4.08:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span#telemetry-assessor-mode | /S/h/a/r/d/i/n/g/:/ /R/o/o/m/ /P/a/ | #fcd34d | #090d17 | 13.47:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span | /�/�/ | #115e59 | #f3f5f8 | 6.94:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span#label-corridor-wing | /K/o/r/i/d/o/r/ /A/ /(/0/1/-/1/0/)/ | #115e59 | #f3f5f8 | 6.94:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span | /�/�/ | #ffffff | #059669 | 3.77:1 | Gagal (3.77:1 < 7:1) | Target AAA (>= 7:1, Solid) |
| span#voice-icon | /�/�/ | #334155 | #f3f5f8 | 9.48:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span#voice-label | /S/u/a/r/a/ | #334155 | #f3f5f8 | 9.48:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span | /�/�/ | #ffffff | #4f46e5 | 6.29:1 | Gagal (6.29:1 < 7:1) | Target AAA (>= 7:1, Solid) |
| span.hidden | /B/l/u/e/p/r/i/n/t/ | #ffffff | #4f46e5 | 6.29:1 | Gagal (6.29:1 < 7:1) | Target AAA (>= 7:1, Solid) |
| button#btn-hud-lang | /�/�/�/�/ | #334155 | #f3f5f8 | 9.48:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span | /I/D/ | #334155 | #f3f5f8 | 9.48:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| kbd.hidden.px-1 | /E/s/c/ | #334155 | #f1f5f9 | 9.45:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| span.text-slate-500.font-medium | /R/o/t/a/s/i/:/ | #1e293b | #f3f5f8 | 13.39:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| select#select-movement-mode | /h/y/b/r/i/d/ | #1e293b | #f1f5f9 | 13.35:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| button#btn-move-forward | /▲/ /W/ | #1e293b | #f1f5f9 | 13.35:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| button#btn-move-back | /▼/ /S/ | #1e293b | #f1f5f9 | 13.35:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| button#btn-turn-left | /◀/ /A/ | #1e293b | #f1f5f9 | 13.35:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| button#btn-turn-right | /D/ /▶/ | #1e293b | #f1f5f9 | 13.35:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| kbd.px-2.py-0.5 | /E/ | #ffffff | #0f766e | 5.47:1 | Gagal (5.47:1 < 7:1) | Target AAA (>= 7:1, Solid) |
| span#context-action-label | /M/a/s/u/k/ /R/u/a/n/g/a/n/ /—/ /S/ | #1e293b | #f3f5f8 | 13.39:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| div#hud-subtitle-banner | /A/n/d/a/ /k/e/m/b/a/l/i/ /k/e/ /k/ | #334155 | #f3f5f8 | 9.48:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span#hud-progress-count | /1///1/0/ /s/e/l/e/s/a/i/ | #1e293b | #f3f5f8 | 13.39:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span.text-slate-400 | /▼/ | #94a3b8 | #f3f5f8 | 2.35:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| button.btn-lang-switch.absolute | /�/�/�/�/ | #334155 | #f1f5f9 | 9.45:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| span | /I/D/ | #334155 | #f1f5f9 | 9.45:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| div.w-14.h-14 | /�/�/ | #ffffff | #0d9488 | 3.74:1 | Gagal (3.74:1 < 7:1) | Target AAA (>= 7:1, Solid) |
| h2.text-2xl.font-black | /G/e/r/b/a/n/g/ /M/a/s/u/k/ /O/S/C/ | #0f172a | #ffffff | 17.85:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| p.text-xs.text-slate-500 | /S/i/m/u/l/a/s/i/ /U/j/i/a/n/ /K/o/ | #64748b | #ffffff | 4.76:1 | Gagal (4.76:1 < 7:1) | Target AAA (>= 7:1, Solid) |
| label.block.text-xs | /P/i/l/i/h/ /P/e/r/a/n/ /P/e/n/g/g/ | #334155 | #ffffff | 10.35:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| select#login-select-role | /s/t/u/d/e/n/t/ | #1e293b | #f8fafc | 13.98:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| input#login-input-nim | /C/o/n/t/o/h/:/ /2/0/2/4/-/0/8/1/9/ | #000000 | #ffffff | 21:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| input#login-input-token | /M/a/s/u/k/k/a/n/ /t/o/k/e/n/ /u/j/ | #000000 | #f9fefd | 20.62:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| div.bg-teal-50.border | /✨/ /N/a/m/a/,/ /J/e/n/i/s/ /K/e/l/ | #134e4a | #f0fdfa | 9.09:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| strong | /O/t/o/r/i/t/a/s/ /R/o/s/t/e/r/ /S/ | #134e4a | #f0fdfa | 9.09:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| div#login-error | /N/I/M/ /a/t/a/u/ /t/o/k/e/n/ /u/j/ | #9f1239 | #fff1f2 | 7.3:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| button#btn-login-submit | /M/a/s/u/k/ /k/e/ /S/i/m/u/l/a/s/i/ | #ffffff | #0f766e | 5.47:1 | Gagal (5.47:1 < 7:1) | Target AAA (>= 7:1, Solid) |
| span.px-2.5.py-0.5 | /K/H/U/S/U/S/ /D/O/S/E/N/ /&/ /A/S/ | #78350f | #fef3c7 | 8.15:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| h3.text-lg.font-black | /H/a/s/i/l/ /B/e/n/a/r/ /// /S/a/l/ | #0f172a | #ffffff | 17.85:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| button#btn-close-assessor-scores | /✕/ | #94a3b8 | #ffffff | 2.56:1 | Gagal (2.56:1 < 7:1) | Target AAA (>= 7:1, Solid) |
| th.p-2 | /N/I/M/ | #000000 | #f1f5f9 | 19.17:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| th.p-2.text-center | /R/o/o/m/ | #000000 | #f1f5f9 | 19.17:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| td.p-2.font-mono | /2/0/2/4/-/0/8/0/0/1/ | #000000 | #fff7f7 | 19.9:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| td.p-2.font-semibold | /K/a/n/d/i/d/a/t/ /M/a/h/a/s/i/s/w/ | #000000 | #fff7f7 | 19.9:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| td.p-2.text-center | /1/ | #000000 | #fff7f7 | 19.9:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| td.p-2.text-center | /B/O/R/D/E/R/L/I/N/E/ | #e11d48 | #fff7f7 | 4.45:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| button.asr-save.px-2 | /S/i/m/p/a/n/ | #ffffff | #4f46e5 | 6.29:1 | Gagal (6.29:1 < 7:1) | Target AAA (>= 7:1, Solid) |
| button#btn-assessor-refresh | /�/�/ /M/u/a/t/ /U/l/a/n/g/ | #ffffff | #1e293b | 14.63:1 | Lolos (>= 7:1) | Target AAA (>= 7:1, Solid) |
| button#btn-assessor-csv | /�/�/ /D/o/w/n/l/o/a/d/ /S/e/m/u/a/ | #ffffff | #047857 | 5.48:1 | Gagal (5.48:1 < 7:1) | Target AAA (>= 7:1, Solid) |
| span.font-black.tracking-wider | /M/I/N/I/M/A/P/ /2/ /K/O/R/I/D/O/R/ | #5eead4 | #090d17 | 13.13:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |
| span#minimap-pos-label | /S/T/-/0/1/ | #cbd5e1 | #090d17 | 13.08:1 | Tidak Terjamin (Translucent / Canvas) | Target AAA (>= 7:1, Solid) |


## 2. Ringkasan Pasca-Perbaikan & Verifikasi Runtime Lengkap

Verifikasi dilakukan menggunakan browser Microsoft Edge Headless via Chrome DevTools Protocol (CDP) pada lingkungan runtime aplikasi sesungguhnya.
Semua elemen DOM dihitung warnanya berdasarkan computed styles (`getComputedStyle`) dan penelusuran latar belakang efektif (background tree climbing) dengan formula kontras WCAG 2.2:
$$\text{Contrast Ratio} = \frac{L_1 + 0.05}{L_2 + 0.05} \ge 7.0:1$$

### 2.1 Perbaikan Dua Elemen HUD yang Dilaporkan

1. **Badge Mode Asesor Penguji (`#hud-mode-badge`)**:
   - **Sumber**: `js/app.js` baris 469 (diatur dinamis via JavaScript saat login).
   - **Baseline / Sebelum**: `text-amber-600` (`#d97706`) di atas kartu `#f8fafc` -> **3.30:1** (Gagal AAA).
   - **Pasca-Perbaikan**: Diperbarui menjadi `text-amber-900 font-black` (`#78350f`).
   - **Hasil Terhitung Runtime**: Teks `#78350f` di atas `#f8fafc` = **8.67:1** (Lolos WCAG AAA >= 7.0:1).
   - *(Pada mode mahasiswa, badge bertuliskan Kandidat Peserta dengan `text-teal-950 font-black` (`#042f2e` di atas `#f8fafc` = **13.83:1**).*

2. **Tombol Blueprint (`#btn-open-blueprint`)**:
   - **Sumber**: `blueprint.html` baris 177 (elemen navigasi bar atas).
   - **Baseline / Sebelum**: `bg-indigo-600` (`#4f46e5`) dengan teks putih (`#ffffff`) -> **6.29:1** (Gagal AAA).
   - **Pasca-Perbaikan**: Diperbarui menjadi `bg-indigo-800 hover:bg-indigo-900 text-white` (`#3730a3`).
   - **Hasil Terhitung Runtime**: Teks `#ffffff` di atas latar `#3730a3` = **9.93:1** (Lolos WCAG AAA >= 7.0:1).

---

### 2.2 Hasil Audit Extended Runtime (5 State UI)

Audit memeriksa seluruh elemen teks aktif pada 5 kondisi UI setelah proses login nyata:

| Kondisi UI / State | Total Elemen Teks Diperiksa | Lolos (>= 7.0:1) | Gagal (< 7.0:1) | Tingkat Kepatuhan |
|---|---|---|---|---|
| **HUD Koridor Mahasiswa** | 68 | 68 | 0 | **100%** |
| **Modal Blueprint** | 87 | 87 | 0 | **100%** |
| **Modal Scoring / Nilai Ujian** | 83 | 83 | 0 | **100%** |
| **Modal Menu / Bantuan** | 80 | 80 | 0 | **100%** |
| **HUD Koridor Asesor** | 62 | 62 | 0 | **100%** |
| **TOTAL KESELURUHAN** | **380** | **380** | **0** | **100%** |

### Contoh Pengukuran Elemen Kunci:
- **Header Tab Blueprint (`#btn-bp-tab-algo`)**: `#ffffff` pada `#3730a3` = **9.93:1**
- **Badge Nilai Ujian (`#score-status-badge`)**: `#ffffff` pada `#065f46` = **7.68:1**
- **Tombol Lanjutkan (`#btn-resume-sim`)**: `#ffffff` pada `#115e59` = **7.58:1**
- **HUD Mode Badge (Asesor)**: `#78350f` pada `#f8fafc` = **8.67:1**
- **HUD Mode Badge (Mahasiswa)**: `#042f2e` pada `#f8fafc` = **13.83:1**

---

### 2.3 Pengecualian & Batasan yang Diakui (Exceptions & Scope)
1. **Kanvas 3D WebGL**:
   - Berdasarkan spesifikasi WCAG 2.2 SC 1.4.6, objek visual 3D (mesh avatar, pencahayaan 3D) tidak termasuk dalam cakupan teks DOM. Namun pencahayaan koridor telah diturunkan dari `intensity 1.3` menjadi `0.68`, dan warna lantai digelapkan dari `#e2e8f0` menjadi `#475569` untuk mencegah silau dan memisahkan avatar jas putih secara terukur.
2. **Ikon SVG / Dekorasi Non-Teks**:
   - Ikon murni dekoratif memenuhi kriteria WCAG SC 1.4.11 (Non-text Contrast >= 3.0:1).

---

## 3. Pintu Ruang Stasiun Koridor 3D (Tampilan Rumah Sakit Modern & Geometri)

### 3.1 Verifikasi Geometri Kusen vs Wainscot (Pengukuran Box3)

| Parameter | Sebelum (Baseline) | Sesudah (Perbaikan) | Status / Target |
|---|---|---|---|
| **Posisi doorGroup (X)** | ±3.50 m (sebidang dinding) | ±3.43 m (geser 0.07 m ke tengah) | Optimal |
| **Muka Depan Kusen vs Wainscot** | -0.50 cm (terbenam di dalam wainscot) | **+7.00 cm** (menonjol ke koridor) | **Lolos (>= 3 cm)** |
| **Muka Depan Daun Pintu** | Sebidang (x = ±3.455 m, z-fighting) | **+6.00 cm** di depan wainscot | **Bebas Z-Fighting** |
| **Ketinggian Daun Pintu** | Terpotong wainscot pada y < 1.08 m | Menjangkau lantai (y: 0.00 s/d 2.37 m) | **Lantai Penuh** |
| **Integritas station3DAnchors** | 10 stasiun terdaftar | 10 stasiun (nilai identik persis) | **100% Konsisten** |

### 3.2 Rasio Kontras Material Pintu Rumah Sakit Modern

| Komponen Elemen | Warna / Heksadesimal | Luminansi Relatif ($L$) | Bidang Pembanding | Rasio Kontras | Kepatuhan |
|---|---|---|---|---|---|
| **Daun Pintu** | Abu-es kehijauan (`#cfe3e0`) | 0.7359 | Wainscot (`#164e63`) | **6.82:1** | **Lolos** (Syarat: $L \le 0.78$ & $\ge 3:1$) |
| **Kusen Pintu** | Charcoal (`#253243`) | 0.0326 | Dinding Atas (`#7c8c9e`) | **3.78:1** | **Lolos** (Syarat: $\ge 3:1$) |
| **Kusen Pintu** | Charcoal (`#253243`) | 0.0326 | Daun Pintu (`#cfe3e0`) | **9.73:1** | **Lolos** (Syarat: $\ge 3:1$) |
| **Aksen Teal** | Deep Teal (`#0f766e`) | 0.1550 | Daun Pintu (`#cfe3e0`) | **4.10:1** | **Lolos** (Syarat: $\ge 3:1$) |
| **Logam Satin** (Kick Plate, Lever) | Satin Steel (`#64748b`) | 0.1680 | Daun Pintu (`#cfe3e0`) | **3.56:1** | **Lolos** (Syarat: $\ge 3:1$) |

### 3.3 Detail Konstruksi & Optimasi Memori
- **Geometri & Material Bersama**: Seluruh geometri daun pintu, kusen, pelat bawah (kick plate), pelat dorong, dan gagang tuas dibuat sebagai singleton di luar perulangan, digunakan bersama oleh seluruh 20 stasiun (Koridor A & B) tanpa duplikasi memori.
- **Bentuk Jendela**: Jendela vertikal tinggi berdimensi $0.22 \times 1.10$ m dengan bingkai tipis menggantikan jendela kecil lama.
- **Papan Petunjuk & Lampu Status**: Papan akrilik di samping pintu tetap terpisah dengan jarak aman (gap 18 cm) tanpa tumpang tindih; sistem lampu indikator pintu (`stationDoorLamps`) mempertahankan 100% logika aslinya.
