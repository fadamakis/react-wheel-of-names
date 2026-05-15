type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  gravity: number;
  drag: number;
  rot: number;
  vrot: number;
  w: number;
  h: number;
  color: string;
  shape: "rect" | "strip";
  life: number;
};

export function fireConfetti(originX: number, originY: number, colors: string[]): void {
  const canvas = document.getElementById("confetti-canvas");
  if (!(canvas instanceof HTMLCanvasElement)) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(dpr, dpr);

  const particles: Particle[] = [];
  for (let i = 0; i < 180; i += 1) {
    const ang = -Math.PI / 2 + (Math.random() - 0.5) * (Math.PI * 0.85);
    const speed = 8 + Math.random() * 14;
    particles.push({
      x: originX + (Math.random() - 0.5) * 60,
      y: originY + (Math.random() - 0.5) * 20,
      vx: Math.cos(ang) * speed,
      vy: Math.sin(ang) * speed,
      gravity: 0.35 + Math.random() * 0.1,
      drag: 0.985,
      rot: Math.random() * Math.PI * 2,
      vrot: (Math.random() - 0.5) * 0.45,
      w: 6 + Math.random() * 8,
      h: 10 + Math.random() * 14,
      color: colors[Math.floor(Math.random() * colors.length)],
      shape: Math.random() < 0.5 ? "rect" : "strip",
      life: 1,
    });
  }

  let frame = 0;
  const tick = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = 0;
    for (const p of particles) {
      if (!p.life) continue;
      p.vx *= p.drag;
      p.vy = p.vy * p.drag + p.gravity;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vrot;
      if (p.y > window.innerHeight + 60) {
        p.life = 0;
        continue;
      }
      alive += 1;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      if (p.shape === "rect") {
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      } else {
        ctx.fillRect(-p.w / 2, -2, p.w, 4);
      }
      ctx.restore();
    }
    frame += 1;
    if (alive > 0 && frame < 600) requestAnimationFrame(tick);
    else ctx.clearRect(0, 0, canvas.width, canvas.height);
  };
  requestAnimationFrame(tick);
}
