// ===== PERSISTENT BACKGROUND MUSIC =====
// Musik tidak berhenti saat pindah halaman
// File ini di-include di index.html, info.html, dan team.html

(function () {
  const SRC     = "Music/Music.m4a"; // ganti nama file musik di sini
  const VOLUME  = 0.4;
  const KEY_POS = "musicCurrentTime";
  const KEY_PLY = "musicPlaying";
  const KEY_UNL = "musicUnlocked";   // sudah pernah di-tap user belum

  const audio = document.getElementById("bgMusic");
  if (!audio) return;

  audio.src    = SRC;
  audio.loop   = true;
  audio.volume = VOLUME;

  // Ambil posisi & status dari sesi sebelumnya
  const savedTime  = parseFloat(sessionStorage.getItem(KEY_POS) || "0");
  const wasPlaying = sessionStorage.getItem(KEY_PLY) !== "false";
  const everTapped = sessionStorage.getItem(KEY_UNL) === "true";

  // Simpan posisi setiap detik
  audio.addEventListener("timeupdate", () => {
    sessionStorage.setItem(KEY_POS, audio.currentTime);
  });

  // Simpan status saat pindah halaman
  window.addEventListener("pagehide", () => {
    sessionStorage.setItem(KEY_POS, audio.currentTime);
    sessionStorage.setItem(KEY_PLY, !audio.paused);
  });
  window.addEventListener("beforeunload", () => {
    sessionStorage.setItem(KEY_POS, audio.currentTime);
    sessionStorage.setItem(KEY_PLY, !audio.paused);
  });

  function startAudio() {
    if (savedTime > 0) audio.currentTime = savedTime;
    if (wasPlaying) audio.play().catch(() => {});
  }

  // ── Buat banner "Tap to Play" ──────────────────────────────────────
  function createBanner() {
    if (document.getElementById("musicBanner")) return;

    const style = document.createElement("style");
    style.textContent = `
      @keyframes bannerPulse {
        0%, 100% { box-shadow: 0 6px 24px rgba(0,0,0,0.35); }
        50%       { box-shadow: 0 8px 32px rgba(212,148,10,0.4); }
      }
      #musicBanner:hover { background: rgba(122,59,16,0.95) !important; }
    `;
    document.head.appendChild(style);

    const banner = document.createElement("div");
    banner.id = "musicBanner";
    banner.innerHTML = `🎵 Tap untuk memutar musik`;
    banner.style.cssText = `
      position: fixed;
      bottom: 80px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(61,31,8,0.92);
      color: #e8c090;
      font-family: 'DM Sans', sans-serif;
      font-size: 0.82rem;
      font-weight: 600;
      padding: 12px 24px;
      border-radius: 50px;
      border: 1px solid rgba(232,192,144,0.25);
      cursor: pointer;
      z-index: 9999;
      white-space: nowrap;
      animation: bannerPulse 2s ease-in-out infinite;
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      letter-spacing: 0.3px;
    `;
    document.body.appendChild(banner);

    banner.addEventListener("click", () => {
      unlockAudio();
      hideBanner();
    });
  }

  function hideBanner() {
    const banner = document.getElementById("musicBanner");
    if (!banner) return;
    banner.style.transition = "opacity 0.4s, transform 0.4s";
    banner.style.opacity = "0";
    banner.style.transform = "translateX(-50%) translateY(10px)";
    setTimeout(() => banner.remove(), 400);
  }

  let unlocked = false;
  function unlockAudio() {
    if (unlocked) return;
    unlocked = true;
    sessionStorage.setItem(KEY_UNL, "true");
    startAudio();
    document.removeEventListener("click",      onFirstInteraction);
    document.removeEventListener("touchstart", onFirstInteraction);
  }

  function onFirstInteraction() {
    unlockAudio();
    hideBanner();
  }

  // ── Logika utama ───────────────────────────────────────────────────
  audio.play().then(() => {
    // Berhasil autoplay (desktop) — tidak perlu banner
    if (savedTime > 0) audio.currentTime = savedTime;
    sessionStorage.setItem(KEY_UNL, "true");
  }).catch(() => {
    // Gagal autoplay (HP) — tampilkan banner
    if (!everTapped) {
      createBanner();
    }
    document.addEventListener("click",      onFirstInteraction, { once: true });
    document.addEventListener("touchstart", onFirstInteraction, { once: true });
  });

})();
