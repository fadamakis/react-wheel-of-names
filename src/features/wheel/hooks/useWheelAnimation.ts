import { useCallback, useEffect, useRef, useState } from "react";
import { inverseBezierTime, SPIN_EASE } from "../lib/easing";

const EASE = SPIN_EASE;
const WAITING_SPIN_DEGREES_PER_SECOND = 6;

type PendingWinner = {
  index: number;
  name: string;
  rotation: number;
};

type SpinOptions = {
  velocityDegPerSec?: number;
};

type UseWheelAnimationProps = {
  names: string[];
  initialRotation?: number;
  spinDurationMs: number;
  soundOn: boolean;
  onTick?: () => void;
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function useWheelAnimation({
  names,
  initialRotation = 0,
  spinDurationMs,
  soundOn,
  onTick,
}: UseWheelAnimationProps) {
  const [rotation, setRotationState] = useState(initialRotation);
  const [spinFromRotation, setSpinFromRotation] = useState(initialRotation);
  const [spinning, setSpinning] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [activeSpinDurationMs, setActiveSpinDurationMs] = useState(spinDurationMs);
  const [winnerIndex, setWinnerIndex] = useState<number | null>(null);
  const [winnerName, setWinnerName] = useState<string | null>(null);
  const rotationRef = useRef(initialRotation);
  const pendingWinnerRef = useRef<PendingWinner | null>(null);
  const spinFrameRef = useRef<number | null>(null);
  const tickTimeoutsRef = useRef<number[]>([]);
  const waitingAnimationFrameRef = useRef<number | null>(null);
  const lastWaitingFrameRef = useRef<number | null>(null);
  const waiting =
    names.length >= 2 && !spinning && !dragging && winnerIndex === null;

  const setRotation = useCallback((value: number) => {
    rotationRef.current = value;
    setRotationState(value);
  }, []);

  const onDragStart = useCallback(() => {
    setDragging(true);
  }, []);

  const onDragEnd = useCallback(() => {
    setDragging(false);
  }, []);

  useEffect(() => {
    rotationRef.current = rotation;
  }, [rotation]);

  useEffect(() => {
    setRotationState(initialRotation);
    rotationRef.current = initialRotation;
  }, [initialRotation]);

  useEffect(() => {
    if (!spinning) {
      setActiveSpinDurationMs(spinDurationMs);
    }
  }, [spinDurationMs, spinning]);

  useEffect(
    () => () => {
      for (const timeout of tickTimeoutsRef.current) {
        window.clearTimeout(timeout);
      }
      if (waitingAnimationFrameRef.current !== null) {
        window.cancelAnimationFrame(waitingAnimationFrameRef.current);
      }
      if (spinFrameRef.current !== null) {
        window.cancelAnimationFrame(spinFrameRef.current);
      }
    },
    []
  );

  useEffect(() => {
    if (!waiting) {
      if (waitingAnimationFrameRef.current !== null) {
        window.cancelAnimationFrame(waitingAnimationFrameRef.current);
        waitingAnimationFrameRef.current = null;
      }
      lastWaitingFrameRef.current = null;
      return;
    }

    const step = (timestamp: number) => {
      const last = lastWaitingFrameRef.current ?? timestamp;
      const deltaSeconds = (timestamp - last) / 1000;
      lastWaitingFrameRef.current = timestamp;
      setRotation(rotationRef.current + deltaSeconds * WAITING_SPIN_DEGREES_PER_SECOND);
      waitingAnimationFrameRef.current = window.requestAnimationFrame(step);
    };

    waitingAnimationFrameRef.current = window.requestAnimationFrame(step);

    return () => {
      if (waitingAnimationFrameRef.current !== null) {
        window.cancelAnimationFrame(waitingAnimationFrameRef.current);
        waitingAnimationFrameRef.current = null;
      }
      lastWaitingFrameRef.current = null;
    };
  }, [waiting]);

  const spin = useCallback(
    (options?: SpinOptions) => {
      if (spinning || names.length < 2) return;
      setDragging(false);
      setWinnerIndex(null);
      setWinnerName(null);

      const fromRotation = rotationRef.current;
      const absVelocity = Math.abs(options?.velocityDegPerSec ?? 0);
      const duration =
        absVelocity > 0
          ? clamp(spinDurationMs * (600 / absVelocity), 2500, 5500)
          : spinDurationMs;
      const extraRotations =
        absVelocity > 0
          ? clamp(5 + Math.floor(absVelocity / 400), 5, 8)
          : 5 + Math.floor(Math.random() * 2);

      const winner = Math.floor(Math.random() * names.length);
      const count = names.length;
      const slice = 360 / count;
      const baseExtra = (360 - winner * slice) % 360;
      const jitter = (Math.random() - 0.5) * slice * 0.7;
      const target = ((baseExtra + jitter) % 360 + 360) % 360;
      const currentMod = ((fromRotation % 360) + 360) % 360;
      let delta = target - currentMod;
      if (delta <= 0) delta += 360;
      delta += 360 * extraRotations;

      const newRotation = fromRotation + delta;
      setSpinFromRotation(fromRotation);
      setActiveSpinDurationMs(duration);
      setSpinning(true);

      tickTimeoutsRef.current.forEach((timeout) => window.clearTimeout(timeout));
      tickTimeoutsRef.current = [];
      if (soundOn && onTick) {
        const crossings = Math.floor(delta / slice);
        const startK = Math.max(1, crossings - 28);
        for (let k = startK; k <= crossings; k += 1) {
          const yTarget = (k * slice) / delta;
          const t =
            inverseBezierTime(yTarget, EASE[0], EASE[1], EASE[2], EASE[3]) *
            duration;
          const timeout = window.setTimeout(() => onTick(), t);
          tickTimeoutsRef.current.push(timeout);
        }
      }

      pendingWinnerRef.current = {
        index: winner,
        name: names[winner],
        rotation: newRotation,
      };

      if (spinFrameRef.current !== null) {
        window.cancelAnimationFrame(spinFrameRef.current);
      }
      // Enable the CSS transition on the current angle before applying the target.
      spinFrameRef.current = window.requestAnimationFrame(() => {
        spinFrameRef.current = window.requestAnimationFrame(() => {
          spinFrameRef.current = null;
          setRotation(newRotation);
        });
      });
    },
    [names, onTick, soundOn, spinDurationMs, spinning, setRotation]
  );

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
    spinFromRotation,
    setRotation,
    spinning,
    waiting,
    winnerIndex,
    winnerName,
    activeSpinDurationMs,
    onDragStart,
    onDragEnd,
    spin,
    onTransitionEnd,
    clearWinner,
  };
}
