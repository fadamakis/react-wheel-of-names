type SpinControlsProps = {
  canSpin: boolean;
  spinning: boolean;
  namesCount: number;
  soundOn: boolean;
  onSpin: () => void;
  onToggleSound: () => void;
  showButton?: boolean;
  showUtilityBar?: boolean;
  buttonClassName?: string;
};

export function SpinControls({
  canSpin,
  spinning,
  namesCount,
  soundOn,
  onSpin,
  onToggleSound,
  showButton = true,
  showUtilityBar = true,
  buttonClassName,
}: SpinControlsProps) {
  const buttonLabel = spinning
    ? "Spinning"
    : canSpin
      ? "Spin the wheel"
      : "Spin unavailable";

  return (
    <>
      {showButton ? (
        <button
          type="button"
          className={
            buttonClassName ? `spin-btn ${buttonClassName}` : "spin-btn"
          }
          onClick={onSpin}
          disabled={!canSpin}
          data-state={spinning ? "spinning" : canSpin ? "ready" : "blocked"}
          aria-label={
            spinning
              ? "Wheel is spinning"
              : canSpin
                ? "Spin the wheel to pick a winner"
                : "Add at least two names to enable spinning"
          }
        >
          <span className="spin-btn-inner">
            <span className="spin-btn-label">{buttonLabel}</span>
            <span className="spin-btn-meta">
              {spinning ? (
                <span className="spinning-pulse">
                  Spinning
                  <span className="dots">
                    <span>.</span>
                    <span>.</span>
                    <span>.</span>
                  </span>
                </span>
              ) : namesCount < 2 ? (
                <span>Add at least two names</span>
              ) : (
                <span>Pick a random winner</span>
              )}
            </span>
          </span>
          <span className="spin-btn-arrow" aria-hidden="true">
            <svg
              viewBox="0 0 24 24"
              width="36"
              height="36"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 12a9 9 0 1 1-3.2-6.9" />
              <path d="M21 4v5h-5" />
            </svg>
          </span>
        </button>
      ) : null}

      {showUtilityBar ? (
        <div className="utility-bar">
          <button
            type="button"
            className="util-pill"
            data-on={soundOn}
            onClick={onToggleSound}
            aria-label={soundOn ? "Mute sound" : "Unmute sound"}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M11 5 6 9H2v6h4l5 4z" />
              {soundOn ? (
                <>
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                </>
              ) : (
                <>
                  <line x1="23" y1="9" x2="17" y2="15" />
                  <line x1="17" y1="9" x2="23" y2="15" />
                </>
              )}
            </svg>
            <span>{soundOn ? "Sound on" : "Muted"}</span>
          </button>

          <span className="utility-hint">
            Press <kbd>Space</kbd> to spin
          </span>
        </div>
      ) : null}
    </>
  );
}
