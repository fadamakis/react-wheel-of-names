interface WheelProps {
  names: string[];
  rotation: number;
  isSpinning: boolean;
  selectedName: string | null;
  onSpin: () => void;
}
import { WheelCanvas } from "./WheelCanvas";
import { SpinButton } from "./SpinButton";
import { Card } from "../../../components/Card";

export function Wheel({
  names,
  rotation,
  isSpinning,
  selectedName,
  onSpin,
}: WheelProps) {
  return (
    <Card>
      <div className="relative flex justify-center">
        <WheelCanvas
          names={names}
          rotation={rotation}
          width={400}
          height={400}
        />
        <WheelOverlay isSpinning={isSpinning} selectedName={selectedName} />
      </div>
      <div className="mt-6">
        <SpinButton
          isSpinning={isSpinning}
          onSpin={onSpin}
          disabled={names.length < 2}
        />
      </div>
    </Card>
  );
}

interface WheelOverlayProps {
  isSpinning: boolean;
  selectedName: string | null;
}

function WheelOverlay({ isSpinning, selectedName }: WheelOverlayProps) {
  if (!selectedName || isSpinning) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="bg-black/80 backdrop-blur-sm px-6 py-4 rounded-lg">
        <p className="text-cyan-400 text-sm font-medium uppercase tracking-wide">
          Selected
        </p>
        <h3 className="text-2xl font-bold mt-1">{selectedName}</h3>
      </div>
    </div>
  );
}
