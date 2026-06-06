import { FormEvent, useEffect, useRef, useState } from "react";
import { fireConfetti } from "./features/confetti/fireConfetti";
import { BulkPasteModal } from "./features/roster/BulkPasteModal";
import { RosterPanel } from "./features/roster/RosterPanel";
import { SpinControls } from "./features/wheel/components/SpinControls";
import { Wheel } from "./features/wheel/components/Wheel";
import { useWheel } from "./features/wheel/hooks/useWheel";
import { PALETTES } from "./features/wheel/lib/wheelGeometry";
import { WinnerOverlay } from "./features/winner/WinnerOverlay";

export default function WheelOfNames() {
  const {
    participants,
    audio,
    rotation,
    spinFromRotation,
    spinning,
    winnerIndex,
    winnerName,
    soundOn,
    recentlyAddedIdx,
    setSoundOn,
    spin,
    onTransitionEnd,
    clearWinner,
    clearAll,
    handleBulkAdd,
    handleAddParticipant,
    handleRemoveByIndex,
  } = useWheel();

  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [showWinnerOverlay, setShowWinnerOverlay] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!winnerName || spinning) return;
    const timeout = window.setTimeout(() => {
      setShowWinnerOverlay(true);
      const wheelEl = document.querySelector(".wheel-svg");
      if (wheelEl instanceof SVGElement) {
        const rect = wheelEl.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + 30;
        fireConfetti(x, y, [...PALETTES.carnival, "#121117"]);
      }
      if (soundOn) {
        audio.ding();
      }
    }, 220);
    return () => window.clearTimeout(timeout);
  }, [audio, soundOn, spinning, winnerName]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        document.querySelector<HTMLElement>(".winner-overlay")?.click();
        document.querySelector<HTMLElement>(".modal-scrim")?.click();
        return;
      }

      const target = event.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA)$/i.test(target.tagName)) return;

      if (event.code === "Space") {
        event.preventDefault();
        document.querySelector<HTMLButtonElement>(".spin-btn")?.click();
      } else if (event.key === "n" || event.key === "N") {
        inputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const canSpin = participants.length >= 2 && !spinning;
  const ready = !spinning && !showWinnerOverlay;

  const onSpinClick = () => {
    setShowWinnerOverlay(false);
    clearWinner();
    spin();
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = inputRef.current?.value ?? "";
    handleAddParticipant(value);
    if (inputRef.current) {
      inputRef.current.value = "";
      inputRef.current.focus();
    }
  };

  const onBulkConfirm = () => {
    handleBulkAdd(bulkText);
    setBulkText("");
    setShowBulkModal(false);
  };

  const onDismissWinner = () => {
    setShowWinnerOverlay(false);
    window.setTimeout(() => clearWinner(), 350);
  };

  const onClearAll = () => {
    if (participants.length === 0) return;
    if (window.confirm("Clear all names?")) {
      clearAll();
    }
  };

  return (
    <div className="app">
      <canvas id="confetti-canvas" aria-hidden="true" />

      <header className="masthead">
        <h1 className="masthead-title">
          <span className="mt-major">Wheel</span>
          <span className="mt-of" aria-hidden="true">
            <em>of</em>
          </span>
          <span className="mt-major">Names</span>
          <span className="mt-sr">of</span>
        </h1>
        <div className="masthead-meta">
          <div className="masthead-eyebrow">
            <span className="dot" />
            <span>A fair randomizer</span>
          </div>
          <p className="masthead-tagline">
            Add the names. Spin the wheel. Whoever lands under the claw{" "}
            presents, buys a coffee, or{" "}
            <strong>faciliates the next meeting</strong>.
          </p>
        </div>
      </header>

      <main className="stage">
        <section className="wheel-column">
          <Wheel
            names={participants}
            rotation={rotation}
            spinFromRotation={spinFromRotation}
            spinning={spinning}
            spinDurationMs={4000}
            winnerIndex={winnerIndex}
            ready={ready && participants.length >= 2}
            canSpin={canSpin}
            onSpin={onSpinClick}
            onTransitionEnd={onTransitionEnd}
          />
          <div className="wheel-spin-overlay" data-visible={!spinning}>
            <SpinControls
              canSpin={canSpin}
              spinning={spinning}
              namesCount={participants.length}
              soundOn={soundOn}
              onSpin={onSpinClick}
              onToggleSound={() => {
                const next = !soundOn;
                setSoundOn(next);
                if (next) audio.ensure();
              }}
              showUtilityBar={false}
              buttonClassName="spin-btn-overlay"
            />
          </div>
        </section>
        <RosterPanel
          names={participants}
          winnerIndex={winnerIndex}
          recentlyAddedIdx={recentlyAddedIdx}
          inputRef={inputRef}
          onSubmit={onSubmit}
          onRemove={handleRemoveByIndex}
          onBulkOpen={() => setShowBulkModal(true)}
          onClearAll={onClearAll}
          canSpin={canSpin}
          spinning={spinning}
          soundOn={soundOn}
          onSpin={onSpinClick}
          onToggleSound={() => {
            const next = !soundOn;
            setSoundOn(next);
            if (next) audio.ensure();
          }}
        />
      </main>

      <BulkPasteModal
        open={showBulkModal}
        value={bulkText}
        onChange={setBulkText}
        onClose={() => setShowBulkModal(false)}
        onConfirm={onBulkConfirm}
      />
      <WinnerOverlay
        open={showWinnerOverlay}
        winnerName={winnerName}
        onDismiss={onDismissWinner}
      />
    </div>
  );
}
