import { useState } from "react";
import { Card, CardTitle } from "@/components/Card";
import { AppInput } from "@/components/AppInput";
import { AppButton } from "@/components/AppButton";

interface ParticipantInputProps {
  onAddParticipant: (name: string) => void;
}

export function ParticipantInput({ onAddParticipant }: ParticipantInputProps) {
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const newName = name.trim();

    if (newName) {
      onAddParticipant(newName);
      setName("");
    }
  };

  return (
    <Card>
      <CardTitle>Add Participant</CardTitle>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <AppInput
            name="name"
            placeholder="Enter participant name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
          <AppButton
            disabled={name.length < 3}
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2"
          >
            Add
          </AppButton>
        </div>
      </form>
    </Card>
  );
}
