"use client";

import { useTheme } from "next-themes";

function RoadBackground() {
  const { theme } = useTheme();

  const isDark = theme === "dark";
  const lineColor = isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)";
  const carStroke = isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.12)";
  const carFill = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.04)";
  const carWindow = isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)";
  const lightGlow = isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.3)";
  const lightHalo = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.02)";

  return (
    <div className="pointer-events-none absolute inset-0 z-0">
      <svg
        viewBox="0 0 1200 800"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
        className="h-full w-full"
      >
        {/* Vertical lines */}
        <line x1="600" y1="0" x2="600" y2="350" stroke={lineColor} strokeWidth="2"/>
        <line x1="600" y1="510" x2="600" y2="800" stroke={lineColor} strokeWidth="2"/>
        {/* Horizontal line */}
        <line x1="200" y1="430" x2="1000" y2="430" stroke={lineColor} strokeWidth="2"/>

        {/* Small cars */}
        {[
          { x: 585, y: 50, flip: false },
          { x: 320, y: 417, flip: false },
          { x: 850, y: 417, flip: true },
          { x: 585, y: 600, flip: false },
          { x: 450, y: 417, flip: false },
          { x: 700, y: 417, flip: true },
        ].map((car, i) => (
          <g key={i} transform={`translate(${car.x}, ${car.y})${car.flip ? " scale(-1,1) translate(-30,0)" : ""}`}>
            <rect x="0" y="6" width="30" height="10" rx="3" fill={carFill} stroke={carStroke} strokeWidth="1"/>
            <path d="M6 6 L10 1 L20 1 L24 6" fill={carFill} stroke={carStroke} strokeWidth="1"/>
            <circle cx="7" cy="18" r="2.5" fill={carFill} stroke={carStroke} strokeWidth="0.8"/>
            <circle cx="23" cy="18" r="2.5" fill={carFill} stroke={carStroke} strokeWidth="0.8"/>
          </g>
        ))}

        {/* Main car above card */}
        <g transform="translate(578, 320)">
          <rect x="0" y="12" width="44" height="14" rx="3" fill={carFill} stroke={carStroke} strokeWidth="1"/>
          <path d="M10 12 L16 2 L32 2 L38 12" fill={carFill} stroke={carStroke} strokeWidth="1"/>
          <path d="M17 4 L14 11 L24 11 L24 4 Z" fill={carWindow}/>
          <path d="M26 4 L26 11 L35 11 L32 4 Z" fill={carWindow}/>
          <circle cx="11" cy="28" r="4" fill={carFill} stroke={carStroke} strokeWidth="1"/>
          <circle cx="11" cy="28" r="1.5" fill={isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)"}/>
          <circle cx="34" cy="28" r="4" fill={carFill} stroke={carStroke} strokeWidth="1"/>
          <circle cx="34" cy="28" r="1.5" fill={isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)"}/>
          <rect x="43" y="16" width="3" height="3" rx="1" fill={lightGlow}/>
        </g>

        {/* Street lights vertical */}
        {[
          { x: 560, y: 110, dir: 1 },
          { x: 630, y: 230, dir: -1 },
          { x: 560, y: 620, dir: 1 },
          { x: 630, y: 720, dir: -1 },
        ].map((l, i) => (
          <g key={`vl${i}`} transform={`translate(${l.x}, ${l.y})`}>
            <line x1="0" y1="0" x2="0" y2="30" stroke={lineColor} strokeWidth="1.5"/>
            <line x1="0" y1="0" x2={l.dir * 8} y2="4" stroke={lineColor} strokeWidth="1.5"/>
            <circle cx={l.dir * 8} cy="4" r="2.5" fill={lightGlow}/>
            <circle cx={l.dir * 8} cy="4" r="7" fill={lightHalo}/>
          </g>
        ))}

        {/* Street lights horizontal */}
        {[
          { x: 250, y: 418, arm: 6 },
          { x: 950, y: 418, arm: -6 },
        ].map((l, i) => (
          <g key={`hl${i}`} transform={`translate(${l.x}, ${l.y})`}>
            <line x1="0" y1="0" x2="0" y2="-25" stroke={lineColor} strokeWidth="1.5"/>
            <line x1="0" y1="-25" x2={l.arm} y2="-21" stroke={lineColor} strokeWidth="1.5"/>
            <circle cx={l.arm} cy="-21" r="2.5" fill={lightGlow}/>
            <circle cx={l.arm} cy="-21" r="7" fill={lightHalo}/>
          </g>
        ))}
      </svg>
    </div>
  );
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background relative flex min-h-screen items-center justify-center overflow-hidden">
      <RoadBackground />
      <div className="relative z-10 w-full px-4">{children}</div>
    </div>
  );
}
