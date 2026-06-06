import { useRef, useState } from "react";
import { usePointerWobble } from "../hooks/usePointerWobble";
import { useWheelDrag } from "../hooks/useWheelDrag";
import { spinEaseCss } from "../lib/easing";
import {
  INK,
  PALETTES,
  SURFACE,
  labelArcPath,
  labelColorsForSegment,
  labelFontSize,
  wedgePath,
  wheelSegmentColor,
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
  spinFromRotation: number;
  spinning: boolean;
  spinDurationMs: number;
  ready: boolean;
  canSpin?: boolean;
  onSpin?: () => void;
  onFlickSpin?: (velocityDegPerSec: number) => void;
  setRotation?: (rotation: number) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  onDraggingChange?: (dragging: boolean) => void;
  onTransitionEnd: () => void;
};

export function Wheel({
  names,
  palette = "carnival",
  rotation,
  spinFromRotation,
  spinning,
  spinDurationMs,
  ready,
  canSpin = false,
  onSpin,
  onFlickSpin,
  setRotation,
  onDragStart,
  onDragEnd,
  onDraggingChange,
  onTransitionEnd,
}: WheelProps & { palette?: keyof typeof PALETTES }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const flapperRef = useRef<SVGGElement>(null);
  const radius = 320;
  const labelRadius = radius * 0.66;
  const count = names.length;
  const slice = count > 0 ? 360 / count : 360;
  const paletteColors = PALETTES[palette];
  const longest = names.reduce((max, name) => Math.max(max, name.length), 1);
  const arcLen = (slice * Math.PI * labelRadius) / 180;
  const fontByArc = (arcLen * 0.78) / Math.max(longest * 0.55, 1);
  const baseFontSize = Math.max(11, Math.min(28, Math.floor(fontByArc)));
  const useNumbers = count > 24 || (count > 20 && baseFontSize < 12) || slice < 13;
  const maxChars = Math.max(
    4,
    Math.floor((arcLen * 0.84) / Math.max(6, baseFontSize * 0.58))
  );
  const tickCount = Math.min(60, Math.max(24, count * 4));
  const pointerY = -radius;
  usePointerWobble(
    flapperRef,
    spinning,
    rotation,
    spinFromRotation,
    spinDurationMs,
    count
  );

  const dragEnabled =
    canSpin &&
    !spinning &&
    Boolean(onFlickSpin && setRotation && onDragStart && onDragEnd);

  const { dragging, dragHandlers } = useWheelDrag({
    stageRef,
    enabled: dragEnabled,
    rotation,
    setRotation: setRotation ?? (() => undefined),
    onDragStart: onDragStart ?? (() => undefined),
    onDragEnd: onDragEnd ?? (() => undefined),
    onFlickSpin: onFlickSpin ?? (() => undefined),
    onDraggingChange,
  });

  const displayFor = (name: string, index: number) =>
    useNumbers ? String(index + 1) : truncateWordAware(name, maxChars);

  const renderLabel = (
    key: string,
    name: string,
    index: number,
    arcPath: string,
    arcId: string,
    segmentFill: string
  ) => {
    const display = displayFor(name, index);
    const colors = labelColorsForSegment(segmentFill);
    const size = labelFontSize(display, slice, labelRadius, baseFontSize);
    return (
      <g key={key}>
        <path id={arcId} d={arcPath} fill="none" stroke="none" />
        <text
          fontSize={size}
          fontWeight={700}
          fontFamily="var(--font-ui)"
          fill={colors.fill}
          stroke={colors.stroke}
          strokeWidth={3.5}
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
  };

  return (
    <div
      ref={stageRef}
      className="wheel-stage"
      data-spinning={spinning}
      data-ready={ready}
      data-can-spin={canSpin}
      data-dragging={dragging}
      {...dragHandlers}
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

        {count > 0 ? (
          <g className="tick-ring">
            {Array.from({ length: tickCount }).map((_, i) => {
              const angle = (((i / tickCount) * 360 - 90) * Math.PI) / 180;
              const r1 = radius + 18;
              const r2 = radius + 26;
              const isMajor = i % 4 === 0;
              return (
                <line
                  key={`tick-${i}`}
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
        ) : null}

        <g
          className="wheel-rotor"
          style={{
            transform: `rotate(${rotation}deg)`,
            transformOrigin: "0px 0px",
            transition: spinning
              ? `transform ${spinDurationMs}ms ${spinEaseCss}`
              : "none",
          }}
          onTransitionEnd={(event) => {
            if (event.target !== event.currentTarget) return;
            if (event.propertyName !== "transform") return;
            onTransitionEnd();
          }}
        >
          <circle r={radius} fill="url(#wheel-rim-grad)" />
          <circle r={radius - 8} fill={INK} />

          {names.map((name, i) => {
            const segmentFill = wheelSegmentColor(i, paletteColors);
            const isHovered = !spinning && !dragging && hoveredIndex === i;
            return (
              <path
                key={`wedge-${name}-${i}`}
                className="wheel-wedge"
                d={wedgePath(i, slice, radius - 5)}
                fill={segmentFill}
                stroke={INK}
                strokeWidth="2"
                strokeLinejoin="round"
                data-hovered={isHovered}
                onMouseEnter={() => !spinning && !dragging && setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                style={{
                  transition: "filter 400ms ease",
                  filter: isHovered ? "brightness(1.06) saturate(1.05)" : "none",
                }}
              />
            );
          })}

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

          {spinning &&
            count > 0 &&
            names.map((name, i) => {
              const center = ((i * slice) % 360 + 360) % 360;
              const pad = Math.min(8, slice * 0.08);
              const halfSpan = Math.max(0.5, slice / 2 - pad);
              const arcPath = labelArcPath(center, labelRadius, halfSpan, false);
              const arcId = `spin-arc-${i}`;
              const segmentFill = wheelSegmentColor(i, paletteColors);
              return renderLabel(
                `spin-label-${name}-${i}`,
                name,
                i,
                arcPath,
                arcId,
                segmentFill
              );
            })}
        </g>

        {count === 0 ? (
          <g className="wheel-empty">
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
            <text
              textAnchor="middle"
              fontFamily="var(--font-ui)"
              fontSize="14"
              fill="rgb(18 17 23 / 58%)"
              y="78"
            >
              → use the panel on the right
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
            const segmentFill = wheelSegmentColor(i, paletteColors);
            return renderLabel(
              `label-${name}-${i}`,
              name,
              i,
              arcPath,
              arcId,
              segmentFill
            );
          })}

        {count > 0 ? (
          <g className="wheel-landing-notch" aria-hidden="true">
            <path
              d={`M -10 ${pointerY - 2} L 0 ${pointerY + 10} L 10 ${pointerY - 2} Z`}
              fill={INK}
              opacity="0.85"
            />
          </g>
        ) : null}

        <g className="wheel-pointer">
          <rect
            x="-20"
            y={pointerY - 46}
            width="40"
            height="18"
            rx="5"
            fill={INK}
          />
          <g transform={`translate(0 ${pointerY - 30})`}>
            <g ref={flapperRef} className="wheel-pointer-flapper">
              <path
                d="M -14 -2 L 14 -2 L 0 46 Z"
                fill={INK}
              />
            </g>
          </g>
        </g>

        {count > 0 ? (
          <g className="wheel-hub" aria-hidden="true">
            <circle r={52} fill="none" stroke="url(#wheel-inner-rim)" strokeWidth="4" opacity="0.55" />
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
        ) : null}
      </svg>

      {count > 0 && onSpin ? (
        <button
          type="button"
          className="wheel-hub-btn"
          onClick={onSpin}
          disabled={!canSpin}
          aria-label={
            canSpin ? "Spin the wheel from the center" : "Add at least two names to spin"
          }
        />
      ) : null}
    </div>
  );
}
