const roster = [
  { name: "PrimeLexus", role: "Squad lead", detail: "Calls the shots. Also the insults." },
  { name: "Lonely", role: "Recon", detail: "You never saw him. Your corpse did." },
  { name: "Ukn0wnTP2, Kura", role: "Assault", detail: "Runs at you like the tutorial never loaded." },
  { name: "Unkn0wnTP, Lexus", role: "Support", detail: "Ammo for us. Therapy for you." },
  { name: "BarbaBaltrou", role: "Engineer", detail: "Your tank is a piñata. He’s got the stick." },
  { name: "Everyone", role: "Flex", detail: "Whatever role ruins your round the most." },
];

const root = document.getElementById("roster");
if (root) {
  root.innerHTML = roster
    .map(
      (p) => `
      <article class="player">
        <p class="role">${p.role}</p>
        <h3>${p.name}</h3>
        <p>${p.detail}</p>
      </article>`
    )
    .join("");
}

const nav = document.querySelector(".nav");
const toggle = document.querySelector(".nav-toggle");
if (toggle && nav) {
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
  });
  nav.querySelectorAll(".nav-links a").forEach((link) => {
    link.addEventListener("click", () => nav.classList.remove("open"));
  });
}

const reel = document.querySelector(".clip-reel");
const muteBtn = document.querySelector(".clip-mute");
const volumeSlider = document.querySelector(".clip-volume");
let preferMuted = true;

function syncMuteUi() {
  if (!reel || !muteBtn) return;
  const muted = reel.muted || reel.volume === 0;
  muteBtn.setAttribute("aria-pressed", String(muted));
  muteBtn.setAttribute("aria-label", muted ? "Unmute video" : "Mute video");
  muteBtn.textContent = muted ? "Muted" : "Sound on";
}

function applyVolume(value) {
  if (!reel) return;
  const volume = Math.min(1, Math.max(0, Number(value)));
  reel.volume = volume;
  if (volume === 0) {
    preferMuted = true;
    reel.muted = true;
  }
  if (volumeSlider && Number(volumeSlider.value) !== volume) {
    volumeSlider.value = String(volume);
  }
  syncMuteUi();
}

async function playReel() {
  if (!reel) return;
  reel.muted = preferMuted;
  try {
    await reel.play();
  } catch {
    if (preferMuted) {
      reel.muted = true;
      await reel.play().catch(() => {});
    }
  }
  syncMuteUi();
}

function pauseReel() {
  reel?.pause();
}

if (reel) {
  applyVolume(volumeSlider?.value || 0.7);

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.4) {
          playReel();
        } else {
          pauseReel();
        }
      });
    },
    { threshold: [0, 0.4, 0.75] }
  );
  observer.observe(reel);

  muteBtn?.addEventListener("click", () => {
    preferMuted = !preferMuted;
    if (!preferMuted && reel.volume === 0) applyVolume(0.7);
    reel.muted = preferMuted;
    playReel();
  });

  volumeSlider?.addEventListener("input", () => {
    const volume = Number(volumeSlider.value);
    applyVolume(volume);
    if (volume > 0) {
      preferMuted = false;
      reel.muted = false;
    }
    if (!reel.paused) playReel();
  });
}

const canvas = document.querySelector(".hero-film");

function startCinematic() {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const logo = new Image();
  logo.src = "public/logo.png";

  const sparks = Array.from({ length: 70 }, () => ({
    x: Math.random(),
    y: Math.random(),
    s: 0.4 + Math.random() * 1.8,
    a: 0.15 + Math.random() * 0.6,
  }));

  const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  resize();
  window.addEventListener("resize", resize);

  const tick = (t) => {
    const w = canvas.width;
    const h = canvas.height;
    ctx.fillStyle = "#050505";
    ctx.fillRect(0, 0, w, h);

    const pulse = 0.5 + 0.5 * Math.sin(t / 900);
    const grd = ctx.createRadialGradient(w / 2, h / 2, 40, w / 2, h / 2, Math.max(w, h) * 0.7);
    grd.addColorStop(0, `rgba(255, 26, 140, ${0.18 + pulse * 0.12})`);
    grd.addColorStop(1, "rgba(5,5,5,0)");
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, w, h);

    ctx.save();
    ctx.globalAlpha = 0.12;
    ctx.strokeStyle = "#ff1a8c";
    ctx.lineWidth = 1;
    const offset = (t / 40) % 48;
    for (let x = -48; x < w + 48; x += 48) {
      ctx.beginPath();
      ctx.moveTo(x + offset, 0);
      ctx.lineTo(x + offset - h * 0.35, h);
      ctx.stroke();
    }
    ctx.restore();

    sparks.forEach((p) => {
      p.y -= p.s * 0.00035;
      if (p.y < -0.05) p.y = 1.05;
      ctx.fillStyle = `rgba(255, 77, 178, ${p.a})`;
      ctx.fillRect(p.x * w, p.y * h, 2, 8 * p.s);
    });

    if (logo.complete && logo.naturalWidth) {
      const size = Math.min(w, h) * 1.35;
      ctx.save();
      ctx.globalAlpha = 0.09 + pulse * 0.04;
      ctx.filter = "blur(2px)";
      ctx.drawImage(logo, (w - size) / 2, (h - size) / 2 + 20, size, size);
      ctx.restore();
    }

    ctx.fillStyle = "rgba(0,0,0,0.18)";
    for (let y = 0; y < h; y += 4) ctx.fillRect(0, y, w, 1);

    requestAnimationFrame(tick);
  };

  requestAnimationFrame(tick);
}

startCinematic();
