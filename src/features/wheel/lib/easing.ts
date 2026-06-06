export const SPIN_EASE = [0.22, 0.82, 0.34, 1] as const;

export const spinEaseCss = `cubic-bezier(${SPIN_EASE.join(", ")})`;

export function cubicBezierEase(
  t: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  if (t <= 0) return 0;
  if (t >= 1) return 1;

  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 32; i += 1) {
    const mid = (lo + hi) / 2;
    if (bezierX(mid, x1, x2) < t) lo = mid;
    else hi = mid;
  }

  return bezierY((lo + hi) / 2, y1, y2);
}

export function spinEaseProgress(t: number): number {
  const [x1, y1, x2, y2] = SPIN_EASE;
  return cubicBezierEase(t, x1, y1, x2, y2);
}

export function bezierY(u: number, y1: number, y2: number): number {
  return (
    3 * (1 - u) * (1 - u) * u * y1 +
    3 * (1 - u) * u * u * y2 +
    u * u * u
  );
}

export function bezierX(u: number, x1: number, x2: number): number {
  return (
    3 * (1 - u) * (1 - u) * u * x1 +
    3 * (1 - u) * u * u * x2 +
    u * u * u
  );
}

export function inverseBezierTime(
  yTarget: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  let lo = 0;
  let hi = 1;

  for (let i = 0; i < 32; i += 1) {
    const mid = (lo + hi) / 2;
    let u = mid;

    for (let j = 0; j < 8; j += 1) {
      const xu = bezierX(u, x1, x2);
      const dx =
        3 * (1 - u) * (1 - u) * x1 +
        6 * (1 - u) * u * (x2 - x1) +
        3 * u * u * (1 - x2);
      if (Math.abs(dx) < 1e-6) break;
      u -= (xu - mid) / dx;
      u = Math.max(0, Math.min(1, u));
    }

    const y = bezierY(u, y1, y2);
    if (y < yTarget) lo = mid;
    else hi = mid;
  }

  return (lo + hi) / 2;
}
