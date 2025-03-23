import { useState } from "react";
import { useWheelAnimation } from "./useWheelAnimation";

export function useWheel() {
  const searchParams = new URLSearchParams(window.location.search);
  const initialParticipants = searchParams.get("names")?.split(",") || [
    "Frodo",
    "Gandalf",
    "Aragorn",
    "Gimli",
    "Legolas",
  ];

  const [participants, setParticipants] =
    useState<string[]>(initialParticipants);
  const [selectedParticipant, setSelectedParticipant] = useState<string | null>(
    null
  );

  const { rotation, isSpinning, spin } = useWheelAnimation({
    names: participants,
    onComplete: (name) => setSelectedParticipant(name),
  });

  const handleAddParticipant = (name: string) => {
    if (!participants.includes(name)) {
      setParticipants((prev) => [...prev, name]);
    }
  };

  const handleRemoveParticipant = (nameToRemove: string) => {
    setParticipants((prev) => prev.filter((name) => name !== nameToRemove));
    if (selectedParticipant === nameToRemove) {
      setSelectedParticipant(null);
    }
  };

  return {
    participants,
    selectedParticipant,
    rotation,
    isSpinning,
    spin,
    handleAddParticipant,
    handleRemoveParticipant,
  };
}
