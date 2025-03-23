import { useState, useRef } from "react";

interface UseWheelAnimationProps {
  names: string[];
  onComplete: (name: string) => void;
}

export function useWheelAnimation({
  names,
  onComplete,
}: UseWheelAnimationProps) {
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  const spin = () => {
    if (names.length < 2 || isSpinning) return;

    setIsSpinning(true);
    startTimeRef.current = 0;

    const spinCount = 5 + Math.random() * 5;
    const totalRotation = spinCount * 2 * Math.PI;
    const duration = 4000;

    const animate = (currentTime: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = currentTime;
      }

      const elapsed = currentTime - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
      const currentRotation = totalRotation * easeOut(progress);

      setRotation(currentRotation);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
        const finalRotation = currentRotation % (2 * Math.PI);
        const segmentAngle = (2 * Math.PI) / names.length;
        const selectedIndex =
          Math.floor((2 * Math.PI - finalRotation) / segmentAngle) %
          names.length;
        onComplete(names[selectedIndex]);
      }
    };

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    animationRef.current = requestAnimationFrame(animate);
  };

  return {
    rotation,
    isSpinning,
    spin,
  };
}
