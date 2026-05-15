type BulkPasteModalProps = {
  open: boolean;
  value: string;
  onChange: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
};

export function BulkPasteModal({
  open,
  value,
  onChange,
  onClose,
  onConfirm,
}: BulkPasteModalProps) {
  if (!open) return null;
  const detectedCount = value
    .split(/[\n,]+/)
    .map((item) => item.trim())
    .filter(Boolean).length;

  return (
    <div className="modal-scrim" onClick={onClose}>
      <div className="modal" onClick={(event) => event.stopPropagation()}>
        <header className="modal-head">
          <span className="eyebrow">Bulk paste</span>
          <h3 className="modal-title">
            One <em>name</em> per line
          </h3>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </header>
        <textarea
          className="bulk-textarea"
          autoFocus
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={"Aragorn\nLegolas\nGimli\nFrodo"}
        />
        <footer className="modal-foot">
          <span className="modal-meta">{detectedCount} names detected</span>
          <div>
            <button type="button" className="ghost-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="button" className="ink-btn" onClick={onConfirm}>
              Add to wheel
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
