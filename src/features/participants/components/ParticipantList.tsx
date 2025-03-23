import { Card, CardTitle } from "../../../components/Card";
import { AppButton } from "../../../components/AppButton";

interface ParticipantListProps {
  participants: string[];
  onRemoveParticipant: (name: string) => void;
}

function EmptyState() {
  return (
    <Card className="text-center">
      <p className="text-gray-500">No participants added yet</p>
    </Card>
  );
}

export function ParticipantList({
  participants,
  onRemoveParticipant,
}: ParticipantListProps) {
  if (participants.length === 0) {
    return <EmptyState />;
  }

  const odds =
    participants.length > 0 ? (100 / participants.length).toFixed(0) : 0;

  return (
    <Card>
      <div className="flex items-center justify-between">
        <CardTitle>{participants.length} Participants </CardTitle>
        <span className="text-gray-500 mb-4"> {odds}% each</span>
      </div>
      <div className="divide-y divide-gray-800">
        {participants.map((name) => (
          <div key={name} className="flex items-center justify-between py-2">
            <span className="text-gray-300">{name}</span>
            <AppButton variant="icon" onClick={() => onRemoveParticipant(name)}>
              <span className="w-5 h-5 flex items-center justify-center">
                ×
              </span>
            </AppButton>
          </div>
        ))}
      </div>
    </Card>
  );
}
