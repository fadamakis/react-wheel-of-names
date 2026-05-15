import { useCallback, useEffect, useMemo, useState } from "react";
import { makeAudio } from "../../audio/makeAudio";
import { useWheelAnimation } from "./useWheelAnimation";

const STORAGE_KEY = "wheel-of-names:v1";
const DEFAULT_NAMES = ["Frodo", "Gandalf", "Aragorn", "Gimli", "Legolas", "Sam"];

type PersistedState = {
  names: string[];
  rotation: number;
  soundOn: boolean;
};

function loadState(): PersistedState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as PersistedState;
  } catch {
    return null;
  }
}

function getInitialNames(saved: PersistedState | null): string[] {
  if (saved?.names?.length) return saved.names;
  const searchParams = new URLSearchParams(window.location.search);
  const urlNames = searchParams
    .get("names")
    ?.split(",")
    .map((name) => name.trim())
    .filter(Boolean);
  if (urlNames?.length) return urlNames;
  return DEFAULT_NAMES;
}

export function useWheel() {
  const saved = loadState();
  const audio = useMemo(() => makeAudio(), []);
  const [participants, setParticipants] = useState<string[]>(() => getInitialNames(saved));
  const [soundOn, setSoundOn] = useState<boolean>(saved?.soundOn ?? false);
  const [recentlyAddedIdx, setRecentlyAddedIdx] = useState<number | null>(null);
  const [winnerSerial, setWinnerSerial] = useState(0);

  const { rotation, setRotation, spinning, winnerIndex, winnerName, spin, onTransitionEnd, clearWinner } =
    useWheelAnimation({
    names: participants,
    initialRotation: saved?.rotation ?? 0,
    spinDurationMs: 4000,
    soundOn,
    onTick: () => audio.tick(),
  });

  useEffect(() => {
    const payload: PersistedState = {
      names: participants,
      rotation,
      soundOn,
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // ignore storage issues
    }
  }, [participants, rotation, soundOn]);

  useEffect(() => {
    if (!winnerName) return;
    setWinnerSerial((prev) => prev + 1);
  }, [winnerName]);

  const handleAddParticipant = useCallback((name: string) => {
    const value = name.trim();
    if (!value) return;
    setParticipants((prev) => {
      if (prev.includes(value)) return prev;
      const next = [...prev, value];
      setRecentlyAddedIdx(next.length - 1);
      window.setTimeout(() => setRecentlyAddedIdx(null), 500);
      return next;
    });
  }, []);

  const handleRemoveByIndex = useCallback((index: number) => {
    setParticipants((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleBulkAdd = useCallback((input: string) => {
    const lines = input
      .split(/[\n,]+/)
      .map((value) => value.trim())
      .filter(Boolean);

    setParticipants((prev) => {
      const set = new Set(prev);
      const fresh: string[] = [];
      for (const line of lines) {
        if (!set.has(line)) {
          set.add(line);
          fresh.push(line);
        }
      }
      return [...prev, ...fresh];
    });
  }, []);

  const clearAll = useCallback(() => {
    setParticipants([]);
    clearWinner();
    setRotation(0);
  }, [clearWinner, setRotation]);

  return {
    participants,
    audio,
    rotation,
    spinning,
    winnerIndex,
    winnerName,
    soundOn,
    recentlyAddedIdx,
    winnerSerial,
    setSoundOn,
    spin,
    onTransitionEnd,
    clearWinner,
    clearAll,
    handleBulkAdd,
    handleAddParticipant,
    handleRemoveByIndex,
  };
}
