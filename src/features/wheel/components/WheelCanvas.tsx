import { useEffect, useRef } from "react";

interface WheelCanvasProps {
  names: string[];
  rotation: number;
  width: number;
  height: number;
}

export function WheelCanvas({
  names,
  rotation,
  width,
  height,
}: WheelCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drawWheel = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) - 10;

    ctx.clearRect(0, 0, width, height);

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(rotation);

    const sliceAngle = (2 * Math.PI) / names.length;
    const colors = [
      "#FF6B6B",
      "#4ECDC4",
      "#45B7D1",
      "#96CEB4",
      "#FFEEAD",
      "#FFC06C",
      "#6699CC",
      "#C594C5",
    ];

    names.forEach((name, index) => {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, index * sliceAngle, (index + 1) * sliceAngle);
      ctx.fillStyle = colors[index % colors.length];
      ctx.fill();
      ctx.stroke();

      ctx.save();
      ctx.rotate(index * sliceAngle + sliceAngle / 2);
      ctx.textAlign = "center";
      ctx.fillStyle = "#000";
      ctx.font = "bold 16px Arial";

      ctx.translate(radius - 30, 0);
      ctx.rotate(Math.PI / 2);
      ctx.fillText(name, 0, 0);
      ctx.restore();
    });

    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, 2 * Math.PI);
    ctx.fillStyle = "#333";
    ctx.fill();

    ctx.restore();

    ctx.beginPath();
    ctx.moveTo(centerX + radius - 10, centerY);
    ctx.lineTo(centerX + radius + 10, centerY - 15);
    ctx.lineTo(centerX + radius + 10, centerY + 15);
    ctx.fillStyle = "#333";
    ctx.fill();
  };

  useEffect(() => {
    drawWheel();
  }, [names, rotation]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="bg-gray-100 rounded-full"
    />
  );
}
