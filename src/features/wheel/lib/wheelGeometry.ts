export const INK = "#121117";
export const SURFACE = "#FFFFFF";

export const PALETTES = {
  carnival: ["#FF7AAC", "#FFDF3D", "#3DDABE", "#2885FD"],
} as const;

export type PaletteName = keyof typeof PALETTES;

export function toRad(wheelDeg: number): number {
  return ((wheelDeg - 90) * Math.PI) / 180;
}

export function wedgePath(index: number, slice: number, radius: number): string {
  const half = slice / 2;
  const a0 = toRad(index * slice - half);
  const a1 = toRad(index * slice + half);
  const x1 = radius * Math.cos(a0);
  const y1 = radius * Math.sin(a0);
  const x2 = radius * Math.cos(a1);
  const y2 = radius * Math.sin(a1);
  const largeArc = slice > 180 ? 1 : 0;
  return `M 0 0 L ${x1.toFixed(2)} ${y1.toFixed(2)} A ${radius} ${radius} 0 ${largeArc} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`;
}

export function labelArcPath(
  centerAngleDeg: number,
  radius: number,
  halfSpanDeg: number,
  flip: boolean
): string {
  const aS = toRad(centerAngleDeg - halfSpanDeg);
  const aE = toRad(centerAngleDeg + halfSpanDeg);
  const xS = radius * Math.cos(aS);
  const yS = radius * Math.sin(aS);
  const xE = radius * Math.cos(aE);
  const yE = radius * Math.sin(aE);

  if (flip) {
    return `M ${xE.toFixed(2)} ${yE.toFixed(2)} A ${radius} ${radius} 0 0 0 ${xS.toFixed(2)} ${yS.toFixed(2)}`;
  }

  return `M ${xS.toFixed(2)} ${yS.toFixed(2)} A ${radius} ${radius} 0 0 1 ${xE.toFixed(2)} ${yE.toFixed(2)}`;
}
