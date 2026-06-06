export const INK = "#121117";
export const SURFACE = "#FFFFFF";

export const PALETTES = {
  carnival: ["#FF7AAC", "#FFDF3D", "#FF914D", "#3DDABE", "#2885FD"],
} as const;

export type PaletteName = keyof typeof PALETTES;

export function wheelSegmentColor(index: number, palette: readonly string[]): string {
  const lap = Math.floor(index / palette.length);
  return palette[(index + lap) % palette.length];
}

export function relativeLuminance(hex: string): number {
  const normalized = hex.replace("#", "");
  const r = Number.parseInt(normalized.slice(0, 2), 16) / 255;
  const g = Number.parseInt(normalized.slice(2, 4), 16) / 255;
  const b = Number.parseInt(normalized.slice(4, 6), 16) / 255;
  const linear = (channel: number) =>
    channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
}

export function labelColorsForSegment(segmentFill: string): {
  fill: string;
  stroke: string;
} {
  return relativeLuminance(segmentFill) > 0.55
    ? { fill: INK, stroke: SURFACE }
    : { fill: SURFACE, stroke: INK };
}

export function labelFontSize(
  display: string,
  slice: number,
  labelRadius: number,
  rosterLongestFontSize: number
): number {
  const arcLen = (slice * Math.PI * labelRadius) / 180;
  const byLabel = (arcLen * 0.78) / Math.max(display.length * 0.55, 1);
  const sized = Math.max(11, Math.min(28, Math.floor(byLabel)));
  const shortBoost = display.length <= 2 ? 1.22 : display.length <= 4 ? 1.08 : 1;
  return Math.max(sized, Math.min(28, Math.floor(rosterLongestFontSize * shortBoost)));
}

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
