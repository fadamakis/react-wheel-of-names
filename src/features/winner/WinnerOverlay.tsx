type WinnerOverlayProps = {
  open: boolean;
  winnerName: string | null;
  onDismiss: () => void;
};

export function WinnerOverlay({
  open,
  winnerName,
  onDismiss,
}: WinnerOverlayProps) {
  if (!open || !winnerName) return null;

  return (
    <div className="winner-overlay" onClick={onDismiss}>
      <div className="winner-card" onClick={(event) => event.stopPropagation()}>
        <div className="winner-corner tl" />
        <div className="winner-corner bl" />
        <div className="winner-corner br" />
        <button
          type="button"
          className="winner-close"
          onClick={onDismiss}
          aria-label="Close"
        >
          ×
        </button>
        <span className="eyebrow winner-eyebrow">The wheel has spoken</span>
        <div className="winner-name-wrap">
          <h2 className="winner-name">{winnerName}</h2>
        </div>
        <p className="winner-sub">
          <em>chosen by chance</em>, blessed by the algorithm
        </p>
        <div className="winner-actions">
          <button type="button" className="ink-btn" onClick={onDismiss}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
