type WinnerOverlayProps = {
  open: boolean;
  winnerName: string | null;
  winnerSerial: number;
  onDismiss: () => void;
};

export function WinnerOverlay({
  open,
  winnerName,
  winnerSerial,
  onDismiss,
}: WinnerOverlayProps) {
  if (!open || !winnerName) return null;

  return (
    <div className="winner-overlay" onClick={onDismiss}>
      <div className="winner-card" onClick={(event) => event.stopPropagation()}>
        <div className="winner-corner tl" />
        <div className="winner-corner tr" />
        <div className="winner-corner bl" />
        <div className="winner-corner br" />
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
        <span className="winner-stamp mono">№ {winnerSerial.toString().padStart(3, "0")}</span>
      </div>
    </div>
  );
}
