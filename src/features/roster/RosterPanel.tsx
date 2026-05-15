import { FormEvent, RefObject } from "react";
import { SpinControls } from "../wheel/components/SpinControls";

type RosterPanelProps = {
  names: string[];
  winnerIndex: number | null;
  recentlyAddedIdx: number | null;
  inputRef: RefObject<HTMLInputElement | null>;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onRemove: (index: number) => void;
  onBulkOpen: () => void;
  onClearAll: () => void;
  canSpin: boolean;
  spinning: boolean;
  soundOn: boolean;
  onSpin: () => void;
  onToggleSound: () => void;
};

export function RosterPanel({
  names,
  winnerIndex,
  recentlyAddedIdx,
  inputRef,
  onSubmit,
  onRemove,
  onBulkOpen,
  onClearAll,
  canSpin,
  spinning,
  soundOn,
  onSpin,
  onToggleSound,
}: RosterPanelProps) {
  return (
    <aside className="rail">
      <SpinControls
        canSpin={canSpin}
        spinning={spinning}
        namesCount={names.length}
        soundOn={soundOn}
        onSpin={onSpin}
        onToggleSound={onToggleSound}
      />
      <section className="panel panel-add">
        <header className="panel-head">
          <span className="eyebrow">Roster</span>
          <h2 className="panel-title">
            <span className="big-num">{String(names.length).padStart(2, "0")}</span>
            <span className="panel-title-text">in the draw</span>
          </h2>
        </header>

        <form className="add-form" onSubmit={onSubmit}>
          <input
            ref={inputRef}
            type="text"
            className="add-input"
            placeholder="Type a name, hit return"
            maxLength={32}
            autoComplete="off"
          />
          <button type="submit" className="add-btn" aria-label="Add name">
            +
          </button>
        </form>

        <div className="add-tools">
          <button type="button" className="link-btn" onClick={onBulkOpen}>
            <span>Bulk paste</span>
          </button>
          <span className="sep">·</span>
          <button
            type="button"
            className="link-btn"
            onClick={onClearAll}
            disabled={names.length === 0}
          >
            <span>Clear all</span>
          </button>
        </div>

        <ul className="name-list">
          {names.length === 0 ? <li className="name-empty">No one's in the wheel yet.</li> : null}
          {names.map((name, i) => (
            <li
              key={`${name}-${i}`}
              className="name-row"
              data-recent={recentlyAddedIdx === i}
              data-winner={winnerIndex === i}
            >
              <span className="name-num">{String(i + 1).padStart(2, "0")}</span>
              <span className="name-text">{name}</span>
              <button
                type="button"
                className="name-x"
                onClick={() => onRemove(i)}
                aria-label={`Remove ${name}`}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      </section>
    </aside>
  );
}
