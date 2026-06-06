import { type RefObject, useEffect } from "react";
import { spinEaseProgress } from "../lib/easing";

const MAX_DEFLECTION = 12;

function tickAngle(
  currentRotation: number,
  slice: number,
  angularVel: number,
  progress: number
): number {
  const pegPhase = ((currentRotation + slice / 2) % slice + slice) % slice;
  const phase = pegPhase / slice;

  let wave: number;
  if (phase < 0.15) {
    wave = phase / 0.15;
  } else {
    wave = Math.max(0, 1 - (phase - 0.15) / 0.2);
  }

  const speed = Math.min(1, Math.abs(angularVel) / 100);
  const tailFade =
    progress > 0.8 ? Math.max(0, 1 - (progress - 0.8) / 0.14) : 1;
  const intensity = speed * tailFade;
  if (intensity < 0.1) return 0;

  return Math.min(
    MAX_DEFLECTION,
    wave * wave * (4 + intensity * 8)
  );
}

export function usePointerWobble(
  flapperRef: RefObject<SVGGElement | null>,
  spinning: boolean,
  rotation: number,
  spinFromRotation: number,
  spinDurationMs: number,
  segmentCount: number
) {
  useEffect(() => {
    const flapper = flapperRef.current;
    if (!flapper) return;

    const apply = (angle: number) => {
      flapper.setAttribute("transform", `rotate(${(-angle).toFixed(2)})`);
    };

    const reset = () => apply(0);

    if (!spinning || segmentCount < 1) {
      reset();
      return;
    }

    const slice = 360 / segmentCount;
    const from = spinFromRotation;
    const to = rotation;
    const start = performance.now();
    let frame = 0;
    let lastTime = start;
    let prevRotation = from;

    const tick = (now: number) => {
      const dt = Math.max(0.001, Math.min(0.032, (now - lastTime) / 1000));
      lastTime = now;

      const progress = Math.min(1, (now - start) / spinDurationMs);
      const eased = spinEaseProgress(progress);
      const currentRotation = from + (to - from) * eased;
      const angularVel = (currentRotation - prevRotation) / dt;
      prevRotation = currentRotation;

      apply(tickAngle(currentRotation, slice, angularVel, progress));

      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      } else {
        reset();
      }
    };

    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      reset();
    };
  }, [
    flapperRef,
    rotation,
    segmentCount,
    spinDurationMs,
    spinFromRotation,
    spinning,
  ]);
}
