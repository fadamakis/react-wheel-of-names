import { useCallback, useEffect, useRef, useState } from "react";
import { inverseBezierTime } from "../lib/easing";

const EASE = [0.16, 1, 0.25, 1] as const;

type PendingWinner = {
  index: number;
  name: string;
  rotation: number;
};

type UseWheelAnimationProps = {
  names: string[];
  initialRotation?: number;
  spinDurationMs: number;
  soundOn: boolean;
  onTick?: () => void;
};

export function useWheelAnimation({
  names,
  initialRotation = 0,
  spinDurationMs,
  soundOn,
  onTick,
}: UseWheelAnimationProps) {
  const [rotation, setRotation] = useState(initialRotation);
  const [spinning, setSpinning] = useState(false);
  const [winnerIndex, setWinnerIndex] = useState<number | null>(null);
  const [winnerName, setWinnerName] = useState<string | null>(null);
  const pendingWinnerRef = useRef<PendingWinner | null>(null);
  const tickTimeoutsRef = useRef<number[]>([]);

  useEffect(() => {
    setRotation(initialRotation);
  }, [initialRotation]);

  useEffect(
    () => () => {
      for (const timeout of tickTimeoutsRef.current) {
        window.clearTimeout(timeout);
      }
    },
    []
  );

  const spin = useCallback(() => {
    if (spinning || names.length < 2) return;
    setWinnerIndex(null);
    setWinnerName(null);

    const winner = Math.floor(Math.random() * names.length);
    const count = names.length;
    const slice = 360 / count;
    const baseExtra = (360 - winner * slice) % 360;
    const jitter = (Math.random() - 0.5) * slice * 0.7;
    const target = ((baseExtra + jitter) % 360 + 360) % 360;
    const currentMod = ((rotation % 360) + 360) % 360;
    let delta = target - currentMod;
    if (delta <= 0) delta += 360;
    delta += 360 * (5 + Math.floor(Math.random() * 2));

    const newRotation = rotation + delta;
    setSpinning(true);

    tickTimeoutsRef.current.forEach((timeout) => window.clearTimeout(timeout));
    tickTimeoutsRef.current = [];
    if (soundOn && onTick) {
      const crossings = Math.floor(delta / slice);
      const startK = Math.max(1, crossings - 28);
      for (let k = startK; k <= crossings; k += 1) {
        const yTarget = (k * slice) / delta;
        const t = inverseBezierTime(yTarget, EASE[0], EASE[1], EASE[2], EASE[3]) * spinDurationMs;
        const timeout = window.setTimeout(() => onTick(), t);
        tickTimeoutsRef.current.push(timeout);
      }
    }

    pendingWinnerRef.current = { index: winner, name: names[winner], rotation: newRotation };
    setRotation(newRotation);
  }, [names, onTick, rotation, soundOn, spinDurationMs, spinning]);

  const onTransitionEnd = useCallback(() => {
    if (!spinning) return;
    const pending = pendingWinnerRef.current;
    if (!pending) return;
    setSpinning(false);
    setWinnerIndex(pending.index);
    setWinnerName(pending.name);
  }, [spinning]);

  const clearWinner = useCallback(() => {
    setWinnerIndex(null);
    setWinnerName(null);
  }, []);

  return {
    rotation,
    setRotation,
    spinning,
    winnerIndex,
    winnerName,
    spin,
    onTransitionEnd,
    clearWinner,
  };
}
