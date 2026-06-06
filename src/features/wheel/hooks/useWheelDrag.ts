import {
  RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";

const MIN_FLICK_VELOCITY = 120;
const SAMPLE_WINDOW_MS = 100;

type Sample = {
  rotation: number;
  time: number;
};

type UseWheelDragProps = {
  stageRef: RefObject<HTMLElement | null>;
  enabled: boolean;
  rotation: number;
  setRotation: (rotation: number) => void;
  onDragStart: () => void;
  onDragEnd: () => void;
  onFlickSpin: (velocityDegPerSec: number) => void;
  onDraggingChange?: (dragging: boolean) => void;
};

function pointerAngleDeg(
  clientX: number,
  clientY: number,
  rect: DOMRect
): number {
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  return (Math.atan2(clientY - cy, clientX - cx) * 180) / Math.PI;
}

function unwrapDelta(fromDeg: number, toDeg: number): number {
  let delta = toDeg - fromDeg;
  while (delta > 180) delta -= 360;
  while (delta < -180) delta += 360;
  return delta;
}

function isWheelSurfaceTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  if (target.closest(".wheel-hub-btn")) return false;
  return target.closest(".wheel-svg") !== null;
}

function velocityFromSamples(samples: Sample[]): number {
  if (samples.length < 2) return 0;
  const newest = samples[samples.length - 1];
  const cutoff = newest.time - SAMPLE_WINDOW_MS;
  const windowed = samples.filter((sample) => sample.time >= cutoff);
  if (windowed.length < 2) return 0;

  const oldest = windowed[0];
  const deltaSeconds = (newest.time - oldest.time) / 1000;
  if (deltaSeconds <= 0) return 0;

  return (newest.rotation - oldest.rotation) / deltaSeconds;
}

export function useWheelDrag({
  stageRef,
  enabled,
  rotation,
  setRotation,
  onDragStart,
  onDragEnd,
  onFlickSpin,
  onDraggingChange,
}: UseWheelDragProps) {
  const [dragging, setDragging] = useState(false);
  const activePointerRef = useRef<number | null>(null);
  const startPointerAngleRef = useRef(0);
  const startRotationRef = useRef(0);
  const samplesRef = useRef<Sample[]>([]);
  const draggingRef = useRef(false);

  const endDrag = useCallback(
    (velocity: number) => {
      if (!draggingRef.current) return;
      draggingRef.current = false;
      setDragging(false);
      onDraggingChange?.(false);
      activePointerRef.current = null;
      samplesRef.current = [];

      if (Math.abs(velocity) >= MIN_FLICK_VELOCITY) {
        onFlickSpin(velocity);
      } else {
        onDragEnd();
      }
    },
    [onDragEnd, onDraggingChange, onFlickSpin]
  );

  const onPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (!enabled || event.button !== 0 || !isWheelSurfaceTarget(event.target)) {
        return;
      }

      const stage = stageRef.current;
      if (!stage) return;

      event.preventDefault();
      stage.setPointerCapture(event.pointerId);
      activePointerRef.current = event.pointerId;

      const rect = stage.getBoundingClientRect();
      startPointerAngleRef.current = pointerAngleDeg(
        event.clientX,
        event.clientY,
        rect
      );
      startRotationRef.current = rotation;
      samplesRef.current = [{ rotation, time: event.timeStamp }];
      draggingRef.current = true;
      setDragging(true);
      onDraggingChange?.(true);
      onDragStart();
    },
    [enabled, onDragStart, onDraggingChange, rotation, stageRef]
  );

  const onPointerMove = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (
        !draggingRef.current ||
        activePointerRef.current !== event.pointerId ||
        !stageRef.current
      ) {
        return;
      }

      event.preventDefault();
      const rect = stageRef.current.getBoundingClientRect();
      const angle = pointerAngleDeg(event.clientX, event.clientY, rect);
      const delta = unwrapDelta(startPointerAngleRef.current, angle);
      const nextRotation = startRotationRef.current + delta;
      setRotation(nextRotation);
      samplesRef.current.push({ rotation: nextRotation, time: event.timeStamp });
    },
    [setRotation, stageRef]
  );

  const onPointerUp = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (
        !draggingRef.current ||
        activePointerRef.current !== event.pointerId
      ) {
        return;
      }

      event.preventDefault();
      if (stageRef.current?.hasPointerCapture(event.pointerId)) {
        stageRef.current.releasePointerCapture(event.pointerId);
      }

      const velocity = velocityFromSamples(samplesRef.current);
      endDrag(velocity);
    },
    [endDrag, stageRef]
  );

  const onPointerCancel = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (
        !draggingRef.current ||
        activePointerRef.current !== event.pointerId
      ) {
        return;
      }

      if (stageRef.current?.hasPointerCapture(event.pointerId)) {
        stageRef.current.releasePointerCapture(event.pointerId);
      }

      endDrag(0);
    },
    [endDrag, stageRef]
  );

  useEffect(() => {
    if (enabled) return;
    if (draggingRef.current) {
      endDrag(0);
    }
  }, [enabled, endDrag]);

  return {
    dragging,
    dragHandlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel,
    },
  };
}
