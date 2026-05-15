import {
  INK,
  PALETTES,
  SURFACE,
  labelArcPath,
  wedgePath,
} from "../lib/wheelGeometry";

function normalizeAngle(angle: number): number {
  return ((angle % 360) + 360) % 360;
}

function truncateWordAware(label: string, maxChars: number): string {
  if (label.length <= maxChars) return label;
  const words = label.trim().split(/\s+/).filter(Boolean);
  if (words.length <= 1) {
    return `${label.slice(0, Math.max(1, maxChars - 1)).trimEnd()}…`;
  }

  let built = "";
  for (const word of words) {
    const candidate = built ? `${built} ${word}` : word;
    if (candidate.length > Math.max(1, maxChars - 1)) break;
    built = candidate;
  }

  if (!built) {
    return `${label.slice(0, Math.max(1, maxChars - 1)).trimEnd()}…`;
  }

  return `${built}…`;
}

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
  const useNumbers = count > 24 || (count > 20 && fontSize < 12) || slice < 13;
  const maxChars = Math.max(4, Math.floor((arcLen * 0.84) / Math.max(6, fontSize * 0.58)));
  const tickCount = Math.min(60, Math.max(24, count * 4));

  return (
    <div
      className="wheel-stage"
      data-spinning={spinning}
      data-ready={ready}
      data-winner={winnerIndex !== null}
    >
      <svg
        viewBox="-380 -380 760 760"
        className="wheel-svg"
        aria-label="Name wheel"
      >
        <defs>
          <linearGradient id="wheel-rim-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#2f2d38" />
            <stop offset="35%" stopColor={INK} />
            <stop offset="100%" stopColor="#09080d" />
          </linearGradient>
          <radialGradient id="wheel-sheen-grad" cx="28%" cy="20%" r="72%">
            <stop offset="0%" stopColor="rgb(255 255 255 / 38%)" />
            <stop offset="32%" stopColor="rgb(255 255 255 / 16%)" />
            <stop offset="70%" stopColor="rgb(255 255 255 / 0%)" />
            <stop offset="100%" stopColor="rgb(18 17 23 / 16%)" />
          </radialGradient>
          <linearGradient id="wheel-inner-rim" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgb(255 255 255 / 64%)" />
            <stop offset="60%" stopColor="rgb(255 255 255 / 8%)" />
            <stop offset="100%" stopColor="rgb(18 17 23 / 25%)" />
          </linearGradient>
          <radialGradient id="hub-grad" cx="32%" cy="24%" r="74%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="58%" stopColor="#e7e6ee" />
            <stop offset="100%" stopColor="#c8c6d4" />
          </radialGradient>
        </defs>

        <ellipse
          className="wheel-floor-shadow"
          cx="0"
          cy={radius + 34}
          rx={radius * 0.62}
          ry="34"
          fill="rgb(18 17 23 / 18%)"
        />

        <circle
          r={radius + 4}
          fill={INK}
          opacity="0.09"
          transform="translate(0 10)"
        />

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
          <circle r={radius} fill="url(#wheel-rim-grad)" />
          <circle r={radius - 8} fill={INK} />

          {names.map((name, i) => (
            <path
              key={`wedge-${name}-${i}`}
              d={wedgePath(i, slice, radius - 5)}
              fill={colors[i % colors.length]}
              stroke={INK}
              strokeWidth="2"
              strokeLinejoin="round"
              style={{
                opacity:
                  dimLosers && winnerIndex !== null && i !== winnerIndex
                    ? 0.18
                    : 1,
                transition: "opacity 600ms ease, filter 400ms ease",
                filter:
                  dimLosers && winnerIndex !== null && i !== winnerIndex
                    ? "grayscale(0.85) brightness(0.95)"
                    : "none",
              }}
            />
          ))}

          {count > 0 ? (
            <>
              <circle
                r={radius - 11}
                fill="none"
                stroke="url(#wheel-inner-rim)"
                strokeWidth="9"
                opacity="0.85"
              />
              <circle
                className="wheel-sheen"
                r={radius - 10}
                fill="url(#wheel-sheen-grad)"
              />
            </>
          ) : null}

          {count > 0 ? (
            <circle
              r={radius * 0.34}
              fill="none"
              stroke={INK}
              strokeWidth="2"
              opacity="0.55"
            />
          ) : null}

          {spinning &&
            count > 0 &&
            names.map((name, i) => {
              const center = ((i * slice) % 360 + 360) % 360;
              const pad = Math.min(8, slice * 0.08);
              const halfSpan = Math.max(0.5, slice / 2 - pad);
              const arcPath = labelArcPath(center, labelRadius, halfSpan, false);
              const arcId = `spin-arc-${i}`;
              const display = useNumbers
                ? String(i + 1)
                : truncateWordAware(name, maxChars);
              return (
                <g key={`spin-label-${name}-${i}`}>
                  <path id={arcId} d={arcPath} fill="none" stroke="none" />
                  <text
                    fontSize={fontSize}
                    fontWeight={700}
                    fontFamily="var(--font-ui)"
                    fill={INK}
                    stroke={SURFACE}
                    strokeWidth="3.5"
                    paintOrder="stroke"
                    letterSpacing="0.01em"
                  >
                    <textPath href={`#${arcId}`} startOffset="50%" textAnchor="middle">
                      {display}
                    </textPath>
                  </text>
                  <title>{name}</title>
                </g>
              );
            })}

          <g className="wheel-hub">
            <circle r={44} fill={INK} />
            <circle r={36} fill="url(#hub-grad)" />
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
            <text
              textAnchor="middle"
              fontFamily="var(--font-display)"
              fontSize="32"
              fill={INK}
              y="-4"
            >
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
            const effective = normalizeAngle(i * slice + rotation);
            const pad = Math.min(8, slice * 0.08);
            const halfSpan = Math.max(0.5, slice / 2 - pad);
            const arcPath = labelArcPath(effective, labelRadius, halfSpan, false);
            const arcId = `arc-${i}`;
            const display = useNumbers
              ? String(i + 1)
              : truncateWordAware(name, maxChars);
            const isWinner = winnerIndex === i;
            return (
              <g
                key={`label-${name}-${i}`}
                style={{
                  opacity:
                    dimLosers && winnerIndex !== null && !isWinner ? 0.2 : 1,
                  transition: "opacity 500ms ease",
                }}
              >
                <path id={arcId} d={arcPath} fill="none" stroke="none" />
                <text
                  fontSize={fontSize}
                  fontWeight={isWinner ? 800 : 700}
                  fontFamily="var(--font-ui)"
                  fill={INK}
                  stroke={SURFACE}
                  strokeWidth={isWinner ? 4 : 3.5}
                  paintOrder="stroke"
                  letterSpacing="0.01em"
                >
                  <textPath
                    href={`#${arcId}`}
                    startOffset="50%"
                    textAnchor="middle"
                  >
                    {display}
                  </textPath>
                </text>
                <title>{name}</title>
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
