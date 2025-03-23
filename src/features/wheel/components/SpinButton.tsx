import { AppButton } from "@/components/AppButton";

interface SpinButtonProps {
  isSpinning: boolean;
  onSpin: () => void;
  disabled?: boolean;
}

export function SpinButton({ isSpinning, onSpin, disabled }: SpinButtonProps) {
  return (
    <AppButton
      onClick={onSpin}
      disabled={disabled}
      isLoading={isSpinning}
      variant="gradient"
      size="lg"
      className="w-full transform hover:scale-[1.02] active:scale-[0.98]"
    >
      Spin the Wheel
    </AppButton>
  );
}
