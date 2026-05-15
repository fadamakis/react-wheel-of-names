import {
  INK,
  PALETTES,
  SURFACE,
  labelArcPath,
  wedgePath,
} from "../lib/wheelGeometry";

type WheelProps = {
  names: string[];
  rotation: number;
  spinning: boolean;
  spinDurationMs: number;
  winnerIndex: number | null;
  dimLosers: boolean;
  ready: boolean;
  onTransitionEnd: () => void;
};

export function Wheel({
  names,
  palette = "carnival",
  rotation,
  spinning,
  spinDurationMs,
  winnerIndex,
  dimLosers,
  ready,
  onTransitionEnd,
}: WheelProps & { palette?: keyof typeof PALETTES }) {
  const radius = 320;
  const labelRadius = radius * 0.66;
  const count = names.length;
  const slice = count > 0 ? 360 / count : 360;
  const colors = PALETTES[palette];
  const longest = names.reduce((max, name) => Math.max(max, name.length), 1);
  const arcLen = (slice * Math.PI * labelRadius) / 180;
  const fontByArc = (arcLen * 0.78) / Math.max(longest * 0.55, 1);
  const fontSize = Math.max(11, Math.min(28, Math.floor(fontByArc)));
  const useNumbers = count > 22 && fontSize < 12;
  const tickCount = Math.min(60, Math.max(24, count * 4));

  return (
    <div
      className="wheel-stage"
      data-spinning={spinning}
      data-ready={ready}
      data-winner={winnerIndex !== null}
    >
      <svg viewBox="-380 -380 760 760" className="wheel-svg" aria-label="Name wheel">
        <circle r={radius + 4} fill={INK} opacity="0.09" transform="translate(0 10)" />

        <g className="tick-ring">
          {Array.from({ length: tickCount }).map((_, i) => {
            const angle = (((i / tickCount) * 360 - 90) * Math.PI) / 180;
            const r1 = radius + 18;
            const r2 = radius + 26;
            const isMajor = i % 4 === 0;
            return (
              <line
                key={i}
                x1={r1 * Math.cos(angle)}
                y1={r1 * Math.sin(angle)}
                x2={(isMajor ? r2 + 4 : r2) * Math.cos(angle)}
                y2={(isMajor ? r2 + 4 : r2) * Math.sin(angle)}
                stroke={INK}
                strokeWidth={isMajor ? 2 : 1}
                strokeLinecap="round"
              />
            );
          })}
        </g>

        <g
          className="wheel-rotor"
          style={{
            transform: `rotate(${rotation}deg)`,
            transformOrigin: "0px 0px",
            transition: spinning
              ? `transform ${spinDurationMs}ms cubic-bezier(0.16, 1, 0.25, 1)`
              : "none",
          }}
          onTransitionEnd={onTransitionEnd}
        >
          <circle r={radius} fill={INK} />

          {names.map((name, i) => (
            <path
              key={`wedge-${name}-${i}`}
              d={wedgePath(i, slice, radius - 5)}
              fill={colors[i % colors.length]}
              stroke={INK}
              strokeWidth="2"
              strokeLinejoin="round"
              style={{
                opacity: dimLosers && winnerIndex !== null && i !== winnerIndex ? 0.18 : 1,
                transition: "opacity 600ms ease, filter 400ms ease",
                filter:
                  dimLosers && winnerIndex !== null && i !== winnerIndex
                    ? "grayscale(0.85) brightness(0.95)"
                    : "none",
              }}
            />
          ))}

          {spinning &&
            count > 0 &&
            names.map((name, i) => {
              const effective = (((i * slice) % 360) + 360) % 360;
              const flip = effective > 90 && effective < 270;
              const pad = Math.min(8, slice * 0.08);
              const halfSpan = Math.max(0.5, slice / 2 - pad);
              const arcPath = labelArcPath(effective, labelRadius, halfSpan, flip);
              const arcId = `spin-arc-${i}`;
              const maxChars = Math.max(4, Math.floor(28 / Math.max(1, fontSize / 14)));
              const display = useNumbers
                ? String(i + 1)
                : name.length > maxChars
                  ? `${name.slice(0, maxChars - 1)}…`
                  : name;
              return (
                <g key={`spin-label-${name}-${i}`}>
                  <path id={arcId} d={arcPath} fill="none" stroke="none" />
                  <text
                    fontSize={fontSize}
                    fontWeight={700}
                    fontFamily="var(--font-ui)"
                    fill={INK}
                    letterSpacing="0.01em"
                  >
                    <textPath href={`#${arcId}`} startOffset="50%" textAnchor="middle">
                      {display}
                    </textPath>
                  </text>
                </g>
              );
            })}

          {count > 0 ? (
            <circle r={radius * 0.34} fill="none" stroke={INK} strokeWidth="2" opacity="0.55" />
          ) : null}

          <g className="wheel-hub">
            <circle r={44} fill={INK} />
            <circle r={36} fill={SURFACE} />
            <circle r={28} fill={INK} />
            {(() => {
              const points: [number, number][] = [];
              for (let i = 0; i < 16; i += 1) {
                const isTip = i % 2 === 0;
                const armIdx = Math.floor(i / 2);
                let r = 4;
                if (isTip) {
                  r = armIdx % 2 === 0 ? 20 : 11;
                }
                const a = ((i * 22.5 - 90) * Math.PI) / 180;
                points.push([r * Math.cos(a), r * Math.sin(a)]);
              }
              const d = `M ${points.map((p) => `${p[0].toFixed(2)} ${p[1].toFixed(2)}`).join(" L ")} Z`;
              return <path d={d} fill={SURFACE} />;
            })()}
            <circle r={2.5} fill={INK} />
          </g>
        </g>

        {count === 0 ? (
          <g>
            <circle
              r={radius - 6}
              fill="#F4F4F8"
              stroke={INK}
              strokeWidth="2"
              strokeDasharray="8 8"
            />
            <text textAnchor="middle" fontFamily="var(--font-display)" fontSize="32" fill={INK} y="-4">
              add some
            </text>
            <text
              textAnchor="middle"
              fontFamily="var(--font-display)"
              fontSize="32"
              fill={INK}
              y="34"
              fontStyle="italic"
            >
              names
            </text>
          </g>
        ) : null}

        {!spinning &&
          count > 0 &&
          names.map((name, i) => {
            const effective = (((i * slice + rotation) % 360) + 360) % 360;
            const flip = effective > 90 && effective < 270;
            const pad = Math.min(8, slice * 0.08);
            const halfSpan = Math.max(0.5, slice / 2 - pad);
            const arcPath = labelArcPath(effective, labelRadius, halfSpan, flip);
            const arcId = `arc-${i}`;
            const maxChars = Math.max(4, Math.floor(28 / Math.max(1, fontSize / 14)));
            const display = useNumbers
              ? String(i + 1)
              : name.length > maxChars
                ? `${name.slice(0, maxChars - 1)}…`
                : name;
            const isWinner = winnerIndex === i;
            return (
              <g
                key={`label-${name}-${i}`}
                style={{
                  opacity: dimLosers && winnerIndex !== null && !isWinner ? 0.2 : 1,
                  transition: "opacity 500ms ease",
                }}
              >
                <path id={arcId} d={arcPath} fill="none" stroke="none" />
                <text
                  fontSize={fontSize}
                  fontWeight={isWinner ? 800 : 700}
                  fontFamily="var(--font-ui)"
                  fill={INK}
                  letterSpacing="0.01em"
                >
                  <textPath href={`#${arcId}`} startOffset="50%" textAnchor="middle">
                    {display}
                  </textPath>
                </text>
              </g>
            );
          })}

        {!spinning && winnerIndex !== null ? (
          <g
            className="winner-halo"
            transform={`rotate(${(((winnerIndex * slice + rotation) % 360) + 360) % 360})`}
          >
            <path
              d={wedgePath(0, slice, radius - 5)}
              fill="none"
              stroke={INK}
              strokeWidth="6"
              strokeLinejoin="round"
              style={{ animation: "winner-pulse 1200ms ease-in-out infinite" }}
            />
          </g>
        ) : null}

        <g className="wheel-pointer" data-spinning={spinning}>
          <circle cx="0" cy={-radius - 28} r="22" fill={INK} />
          <path
            d={`M -16 ${-radius - 16} L 16 ${-radius - 16} L 0 ${-radius + 18} Z`}
            fill={INK}
            stroke={INK}
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <circle cx="0" cy={-radius - 28} r="6" fill={SURFACE} />
        </g>
      </svg>
    </div>
  );
}
