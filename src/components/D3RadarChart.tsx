import React, { useMemo, useState } from "react";
import { scaleLinear } from "d3";

interface RadarDataPoint {
  subject: string;
  value: number;
}

interface D3RadarChartProps {
  province1: {
    name: string;
    color: string;
    data: RadarDataPoint[];
  };
  province2: {
    name: string;
    color: string;
    data: RadarDataPoint[];
  };
  theme?: "dark" | "light";
  language?: "id" | "en";
}

export default function D3RadarChart({
  province1,
  province2,
  theme = "dark",
  language = "id",
}: D3RadarChartProps) {
  const isDark = theme === "dark";
  const isEn = language === "en";

  const [hoveredAxis, setHoveredAxis] = useState<number | null>(null);

  // Chart layout parameters
  const width = 340;
  const height = 300;
  const margin = { top: 50, right: 60, bottom: 50, left: 60 };
  
  const radius = Math.min(width - margin.left - margin.right, height - margin.top - margin.bottom) / 2;
  const cx = width / 2;
  const cy = height / 2;

  const rScale = useMemo(() => {
    return scaleLinear()
      .domain([0, 100])
      .range([0, radius]);
  }, [radius]);

  const numAxes = province1.data.length;
  const angleSlice = (Math.PI * 2) / numAxes;

  // Pre-calculate positions for concentric rings (hexagons)
  const levels = [20, 40, 60, 80, 100];

  const getCoordinates = (value: number, axisIndex: number) => {
    const r = rScale(value);
    const angle = angleSlice * axisIndex - Math.PI / 2; // -Math.PI / 2 to start at top
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    };
  };

  // Generate SVG path points for each province
  const pointsP1 = useMemo(() => {
    return province1.data.map((d, i) => getCoordinates(d.value, i));
  }, [province1.data, rScale]);

  const pointsP2 = useMemo(() => {
    return province2.data.map((d, i) => getCoordinates(d.value, i));
  }, [province2.data, rScale]);

  const pathD1 = useMemo(() => {
    if (pointsP1.length === 0) return "";
    return pointsP1.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ") + " Z";
  }, [pointsP1]);

  const pathD2 = useMemo(() => {
    if (pointsP2.length === 0) return "";
    return pointsP2.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ") + " Z";
  }, [pointsP2]);

  return (
    <div className="flex flex-col items-center w-full">
      <div className="relative w-full max-w-[340px] aspect-square flex items-center justify-center">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          width="100%"
          height="100%"
          className="overflow-visible select-none"
        >
          {/* Hexagonal Concentric Rings Grid */}
          {levels.map((level, levelIdx) => {
            const levelPoints = Array.from({ length: numAxes }).map((_, i) => {
              const r = rScale(level);
              const angle = angleSlice * i - Math.PI / 2;
              return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
            }).join(" ");

            return (
              <g key={`level-${levelIdx}`}>
                <polygon
                  points={levelPoints}
                  fill="none"
                  stroke={isDark ? "rgba(255,255,255,0.06)" : "rgba(15,23,42,0.06)"}
                  strokeWidth={1}
                />
                {/* Scale helper text */}
                <text
                  x={cx + 4}
                  y={cy - rScale(level) + 3}
                  fontSize="7"
                  className={isDark ? "fill-gray-600" : "fill-slate-400"}
                  fontFamily="monospace"
                >
                  {level}
                </text>
              </g>
            );
          })}

          {/* Radial Axis Lines */}
          {province1.data.map((axis, i) => {
            const angle = angleSlice * i - Math.PI / 2;
            const endX = cx + radius * Math.cos(angle);
            const endY = cy + radius * Math.sin(angle);
            const labelX = cx + (radius + 22) * Math.cos(angle);
            const labelY = cy + (radius + 15) * Math.sin(angle);

            // Calculate anchor based on text position for perfect alignment
            let textAnchor = "middle";
            if (Math.cos(angle) > 0.1) textAnchor = "start";
            else if (Math.cos(angle) < -0.1) textAnchor = "end";

            return (
              <g key={`axis-${i}`}>
                <line
                  x1={cx}
                  y1={cy}
                  x2={endX}
                  y2={endY}
                  stroke={isDark ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.08)"}
                  strokeWidth={1.2}
                  strokeDasharray="2,2"
                />
                {/* Dynamic highlight guide on hover */}
                {hoveredAxis === i && (
                  <line
                    x1={cx}
                    y1={cy}
                    x2={endX}
                    y2={endY}
                    stroke={isDark ? "rgba(59,130,246,0.3)" : "rgba(37,99,235,0.2)"}
                    strokeWidth={4}
                    strokeLinecap="round"
                  />
                )}
                {/* Axis Labels */}
                <text
                  x={labelX}
                  y={labelY}
                  textAnchor={textAnchor}
                  dominantBaseline="middle"
                  fontSize="8.5"
                  fontWeight="600"
                  className={`transition-colors duration-200 cursor-pointer ${
                    hoveredAxis === i
                      ? "fill-blue-500 font-extrabold"
                      : isDark
                      ? "fill-gray-400 hover:fill-gray-200"
                      : "fill-slate-600 hover:fill-slate-900"
                  }`}
                  onMouseEnter={() => setHoveredAxis(i)}
                  onMouseLeave={() => setHoveredAxis(null)}
                >
                  {axis.subject}
                </text>
              </g>
            );
          })}

          {/* Area 1: Selected Province 1 */}
          <polygon
            points={pointsP1.map(p => `${p.x},${p.y}`).join(" ")}
            fill={province1.color}
            fillOpacity={0.18}
            stroke={province1.color}
            strokeWidth={2.5}
            className="transition-all duration-300"
          />

          {/* Area 2: Compared Province 2 */}
          <polygon
            points={pointsP2.map(p => `${p.x},${p.y}`).join(" ")}
            fill={province2.color}
            fillOpacity={0.18}
            stroke={province2.color}
            strokeWidth={2.5}
            strokeDasharray="1,1" // subtle pattern difference
            className="transition-all duration-300"
          />

          {/* Hover areas for interactive tooltips */}
          {province1.data.map((_, i) => {
            const angle = angleSlice * i - Math.PI / 2;
            const hitX = cx + (radius + 5) * Math.cos(angle);
            const hitY = cy + (radius + 5) * Math.sin(angle);

            return (
              <circle
                key={`hit-${i}`}
                cx={hitX}
                cy={hitY}
                r={16}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHoveredAxis(i)}
                onMouseLeave={() => setHoveredAxis(null)}
              />
            );
          })}

          {/* Data Dots for Province 1 */}
          {pointsP1.map((p, i) => (
            <circle
              key={`dot1-${i}`}
              cx={p.x}
              cy={p.y}
              r={hoveredAxis === i ? 5 : 3.5}
              fill={province1.color}
              stroke={isDark ? "#121214" : "#ffffff"}
              strokeWidth={1.5}
              className="transition-all duration-200"
            />
          ))}

          {/* Data Dots for Province 2 */}
          {pointsP2.map((p, i) => (
            <circle
              key={`dot2-${i}`}
              cx={p.x}
              cy={p.y}
              r={hoveredAxis === i ? 5 : 3.5}
              fill={province2.color}
              stroke={isDark ? "#121214" : "#ffffff"}
              strokeWidth={1.5}
              className="transition-all duration-200"
            />
          ))}
        </svg>

        {/* Hover Index Info Overlay */}
        {hoveredAxis !== null && (
          <div className={`absolute bottom-1 px-3 py-1.5 backdrop-blur-md rounded-xl shadow-xl text-[10px] border flex flex-col gap-1 transition-all pointer-events-none ${
            isDark ? "bg-black/95 border-white/10 text-white" : "bg-white border-slate-200 text-slate-800"
          }`}>
            <p className="font-bold text-center border-b pb-1 border-white/5 uppercase tracking-wider text-[8px] opacity-70">
              {province1.data[hoveredAxis].subject}
            </p>
            <div className="flex gap-4 justify-between">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: province1.color }} />
                {province1.name}:
              </span>
              <span className="font-mono font-bold" style={{ color: province1.color }}>
                {province1.data[hoveredAxis].value}/100
              </span>
            </div>
            <div className="flex gap-4 justify-between">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: province2.color }} />
                {province2.name}:
              </span>
              <span className="font-mono font-bold" style={{ color: province2.color }}>
                {province2.data[hoveredAxis].value}/100
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Side-by-Side Horizontal Bar Chart Comparison details */}
      <div className="w-full flex flex-col gap-2.5 mt-3 select-none">
        <h5 className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? "text-gray-400" : "text-slate-500"}`}>
          {isEn ? "Detailed Index Score Comparison" : "Perbandingan Rincian Skor Indeks"}
        </h5>
        <div className="flex flex-col gap-2">
          {province1.data.map((item, i) => {
            const val1 = item.value;
            const val2 = province2.data[i].value;
            const diff = val1 - val2;
            const isP1Higher = diff > 0;

            return (
              <div
                key={`bar-comp-${i}`}
                className={`p-2 rounded-xl border flex flex-col gap-1.5 transition-all duration-300 ${
                  hoveredAxis === i
                    ? isDark
                      ? "bg-blue-500/10 border-blue-500/20 shadow-md"
                      : "bg-blue-50 border-blue-100 shadow-sm"
                    : isDark
                    ? "bg-white/[0.01] border-white/5"
                    : "bg-white border-slate-200/60"
                }`}
                onMouseEnter={() => setHoveredAxis(i)}
                onMouseLeave={() => setHoveredAxis(null)}
              >
                {/* Metric Title and stats */}
                <div className="flex items-center justify-between text-[10.5px]">
                  <span className={`font-semibold ${isDark ? "text-gray-200" : "text-slate-700"}`}>
                    {item.subject}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold" style={{ color: province1.color }}>{val1}</span>
                    <span className={`text-[9px] font-semibold px-1 rounded ${
                      diff === 0 
                        ? "bg-gray-500/10 text-gray-500" 
                        : isP1Higher 
                        ? "bg-emerald-500/10 text-emerald-500" 
                        : "bg-amber-500/10 text-amber-500"
                    }`}>
                      {diff === 0 ? "—" : isP1Higher ? `+${diff}` : `${diff}`}
                    </span>
                    <span className="font-mono font-bold" style={{ color: province2.color }}>{val2}</span>
                  </div>
                </div>

                {/* Double Progress Bar */}
                <div className="w-full flex items-center gap-1.5">
                  {/* Province 1 Bar (grows right-to-left or sits side-by-side) */}
                  <div className={`h-2 flex-1 rounded-full overflow-hidden flex justify-end ${isDark ? "bg-white/[0.04]" : "bg-slate-100"}`}>
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${val1}%`,
                        backgroundColor: province1.color,
                      }}
                    />
                  </div>
                  
                  {/* Middle divider */}
                  <div className={`w-[1px] h-3 ${isDark ? "bg-white/10" : "bg-slate-300"}`} />

                  {/* Province 2 Bar (grows left-to-right) */}
                  <div className={`h-2 flex-1 rounded-full overflow-hidden ${isDark ? "bg-white/[0.04]" : "bg-slate-100"}`}>
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${val2}%`,
                        backgroundColor: province2.color,
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
