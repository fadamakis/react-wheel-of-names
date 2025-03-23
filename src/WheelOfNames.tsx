import { Wheel } from "./features/wheel/components/Wheel";
import { ParticipantInput } from "./features/participants/components/ParticipantInput";
import { ParticipantList } from "./features/participants/components/ParticipantList";
import { Layout, TwoColumns } from "./components/Layout";
import { AppHeader } from "./components/AppHeader";
import { useWheel } from "./features/wheel/hooks/useWheel";

export default function WheelOfNames() {
  const {
    participants,
    selectedParticipant,
    rotation,
    isSpinning,
    spin,
    handleAddParticipant,
    handleRemoveParticipant,
  } = useWheel();

  return (
    <Layout>
      <AppHeader />
      <TwoColumns>
        <div className="space-y-8">
          <ParticipantInput onAddParticipant={handleAddParticipant} />
          <ParticipantList
            participants={participants}
            onRemoveParticipant={handleRemoveParticipant}
          />
        </div>
        <Wheel
          names={participants}
          rotation={rotation}
          isSpinning={isSpinning}
          selectedName={selectedParticipant}
          onSpin={spin}
        />
      </TwoColumns>
    </Layout>
  );
}
