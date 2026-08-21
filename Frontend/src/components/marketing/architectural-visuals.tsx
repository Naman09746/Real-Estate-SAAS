"use client";

import * as React from "react";
import { Building2, PhoneCall, Smartphone } from "lucide-react";

/* ═══════════════════════════════════════════════════════
   1. CSS-ONLY 3D ISOMETRIC CITYSCAPE — Hero Background
   Pure perspective transforms, zero dependencies.
   ═══════════════════════════════════════════════════════ */

const towerData = [
  // { left%, height (px), width (px), delay (s), z-offset, opacity, accent }
  { left: 5,   h: 220, w: 54,  delay: 0,   z: -80,  op: 0.3,  accent: false },
  { left: 12,  h: 280, w: 62,  delay: 0.4, z: -40,  op: 0.45, accent: false },
  { left: 22,  h: 340, w: 70,  delay: 0.8, z: 0,    op: 0.6,  accent: false },
  { left: 32,  h: 260, w: 56,  delay: 0.2, z: -60,  op: 0.4,  accent: false },
  { left: 42,  h: 400, w: 80,  delay: 1.0, z: 20,   op: 0.75, accent: true  }, // Main tower
  { left: 52,  h: 360, w: 72,  delay: 0.6, z: 10,   op: 0.65, accent: false },
  { left: 62,  h: 300, w: 64,  delay: 0.3, z: -30,  op: 0.5,  accent: false },
  { left: 72,  h: 250, w: 58,  delay: 0.7, z: -50,  op: 0.4,  accent: false },
  { left: 82,  h: 320, w: 68,  delay: 0.5, z: -20,  op: 0.55, accent: false },
  { left: 90,  h: 200, w: 50,  delay: 0.9, z: -70,  op: 0.35, accent: false },
];

function GlassTower({
  left,
  h,
  w,
  delay,
  z,
  op,
  accent,
}: (typeof towerData)[0]) {
  const floors = Math.floor(h / 18);
  const windowCols = Math.max(2, Math.floor(w / 16));

  return (
    <div
      className="absolute bottom-0"
      style={{
        left: `${left}%`,
        transform: `translateX(-50%) translateZ(${z}px)`,
        width: w,
        height: h,
        opacity: op,
        animation: `tower-rise 1.2s ease-out ${delay}s both`,
      }}
    >
      {/* Tower body */}
      <div
        className="absolute inset-0 rounded-t-sm overflow-hidden"
        style={{
          background: accent
            ? "linear-gradient(180deg, rgba(169,129,46,0.12) 0%, rgba(19,22,28,0.08) 40%, rgba(19,22,28,0.04) 100%)"
            : "linear-gradient(180deg, rgba(19,22,28,0.10) 0%, rgba(19,22,28,0.04) 60%, rgba(19,22,28,0.02) 100%)",
          border: accent ? "1px solid rgba(169,129,46,0.25)" : "1px solid rgba(19,22,28,0.08)",
          backdropFilter: "blur(1px)",
        }}
      >
        {/* Glass reflection stripe */}
        <div
          className="absolute top-0 right-[20%] w-[1px] h-full"
          style={{
            background: "linear-gradient(180deg, rgba(255,255,255,0.4) 0%, transparent 70%)",
          }}
        />
        <div
          className="absolute top-0 right-[60%] w-[2px] h-full"
          style={{
            background: "linear-gradient(180deg, rgba(255,255,255,0.2) 0%, transparent 50%)",
          }}
        />

        {/* Floor lines */}
        {Array.from({ length: floors }).map((_, i) => (
          <div
            key={i}
            className="absolute w-full"
            style={{
              bottom: i * 18,
              height: 1,
              background: accent
                ? "rgba(169,129,46,0.15)"
                : "rgba(19,22,28,0.06)",
            }}
          />
        ))}

        {/* Window grid — tiny lit rectangles */}
        <div
          className="absolute inset-0 p-[3px]"
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${windowCols}, 1fr)`,
            gridTemplateRows: `repeat(${floors}, 1fr)`,
            gap: "2px 3px",
          }}
        >
          {Array.from({ length: floors * windowCols }).map((_, i) => {
            // Deterministic hash based on window index and tower position to avoid SSR hydration mismatch
            const lit = ((i * 37 + left * 19 + h) % 10) > 4;
            return (
              <div
                key={i}
                style={{
                  background: lit
                    ? accent
                      ? "rgba(169,129,46,0.25)"
                      : "rgba(45,90,76,0.15)"
                    : "rgba(19,22,28,0.03)",
                  borderRadius: 1,
                  transition: "background 3s ease",
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Antenna / spire on accent tower */}
      {accent && (
        <div
          className="absolute -top-8 left-1/2 -translate-x-1/2 w-[2px] h-8"
          style={{
            background: "linear-gradient(180deg, rgba(169,129,46,0.7), rgba(169,129,46,0.1))",
          }}
        >
          <div
            className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full"
            style={{
              background: "#a9812e",
              animation: "pulse-light 2s ease-in-out infinite",
            }}
          />
        </div>
      )}

      {/* Tower label for accent */}
      {accent && (
        <div
          className="absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded text-[8px] font-mono font-bold tracking-widest uppercase"
          style={{
            background: "rgba(19,22,28,0.85)",
            color: "#a9812e",
            border: "1px solid rgba(169,129,46,0.3)",
          }}
        >
          SOVEREIGN TOWER
        </div>
      )}
    </div>
  );
}

export function IsometricCityscape({ className = "" }: { className?: string }) {
  return (
    <div className={`relative w-full overflow-hidden select-none ${className}`}>
      {/* Keyframe animations — scoped inline */}
      <style>{`
        @keyframes tower-rise {
          from { transform: translateX(-50%) translateZ(var(--z, 0px)) translateY(40px); opacity: 0; }
          to   { transform: translateX(-50%) translateZ(var(--z, 0px)) translateY(0); opacity: var(--op, 1); }
        }
        @keyframes pulse-light {
          0%, 100% { box-shadow: 0 0 4px 1px rgba(169,129,46,0.6); }
          50%      { box-shadow: 0 0 10px 3px rgba(169,129,46,0.9); }
        }
        @keyframes float-particle {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.4; }
          50%      { transform: translateY(-20px) translateX(10px); opacity: 0.7; }
        }
        @keyframes grid-pulse {
          0%, 100% { opacity: 0.3; }
          50%      { opacity: 0.5; }
        }
      `}</style>

      {/* 3D perspective container */}
      <div
        className="relative w-full"
        style={{
          height: 340,
          perspective: "1200px",
          perspectiveOrigin: "50% 80%",
        }}
      >
        {/* Ground plane with isometric grid */}
        <div
          className="absolute bottom-0 left-0 w-full"
          style={{
            height: 120,
            transform: "rotateX(65deg)",
            transformOrigin: "bottom center",
            background: `
              linear-gradient(90deg, rgba(19,22,28,0.04) 1px, transparent 1px),
              linear-gradient(0deg, rgba(19,22,28,0.04) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
            animation: "grid-pulse 6s ease-in-out infinite",
          }}
        />

        {/* Ambient gradient glow behind towers */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] pointer-events-none"
          style={{
            height: 200,
            background: "radial-gradient(ellipse at 50% 100%, rgba(169,129,46,0.06) 0%, transparent 70%)",
          }}
        />

        {/* Tower group — 3D transformed */}
        <div
          className="absolute bottom-0 left-0 w-full h-full"
          style={{
            transformStyle: "preserve-3d",
            transform: "rotateX(4deg) rotateY(0deg)",
          }}
        >
          {towerData.map((t, i) => (
            <GlassTower key={i} {...t} />
          ))}
        </div>

        {/* Floating ambient particles */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full pointer-events-none"
            style={{
              width: 3,
              height: 3,
              background: i % 3 === 0 ? "rgba(169,129,46,0.5)" : "rgba(45,90,76,0.4)",
              left: `${10 + i * 11}%`,
              bottom: `${20 + (i * 7) % 40}%`,
              animation: `float-particle ${4 + i * 0.7}s ease-in-out ${i * 0.5}s infinite`,
            }}
          />
        ))}

        {/* CAD-style dimension callout */}
        <div
          className="absolute bottom-4 right-4 sm:right-8 px-2.5 py-1 rounded-md text-[9px] font-mono font-semibold tracking-wider"
          style={{
            background: "rgba(255,255,255,0.85)",
            border: "1px solid rgba(169,129,46,0.25)",
            color: "#64748b",
            backdropFilter: "blur(4px)",
          }}
        >
          <span style={{ color: "#a9812e" }}>28°27′N 77°04′E</span>
          <span className="mx-1.5 text-slate-300">·</span>
          <span>SECTOR 54 · GOLF COURSE RD</span>
        </div>

        {/* Horizon line */}
        <div
          className="absolute bottom-0 left-0 w-full"
          style={{
            height: 1,
            background: "linear-gradient(90deg, transparent, rgba(19,22,28,0.1), transparent)",
          }}
        />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   Legacy export aliases — keep page.tsx imports stable
   ═══════════════════════════════════════════════════════ */
export const ArchitecturalSkylineVector = IsometricCityscape;

/* ═══════════════════════════════════════════════════════
   2. ARCHITECTURAL FLOOR PLAN (unchanged SVG blueprint)
   ═══════════════════════════════════════════════════════ */
export function ArchitecturalFloorplanVector({ className = "" }: { className?: string }) {
  return (
    <div className={`relative w-full bg-paper rounded-2xl border border-architecturalLine p-4 sm:p-6 overflow-hidden ${className}`}>
      {/* Top Header Information */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-architecturalLine font-mono">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-brass bg-brass-light px-2 py-0.5 rounded border border-brass-border">
            [ARCHITECTURAL BLUEPRINT · CAD SPEC]
          </span>
          <span className="text-xs font-bold text-ink">4 BHK SKY VILLA (5,400 SQ.FT)</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-slate-500">
          <span className="text-verdigris font-bold">● VASTU COMPLIANT · NORTH-EAST FACING</span>
        </div>
      </div>

      {/* SVG Vector Floor Plan */}
      <svg viewBox="0 0 800 460" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto select-none">
        <defs>
          <pattern id="marbleHatch" width="8" height="8" patternUnits="userSpaceOnUse">
            <line x1="0" y1="8" x2="8" y2="0" stroke="#d8dcdd" strokeWidth="0.5" strokeOpacity="0.6" />
          </pattern>
          <pattern id="woodDeck" width="6" height="6" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="6" y2="0" stroke="#a9812e" strokeWidth="0.5" strokeOpacity="0.4" />
          </pattern>
        </defs>

        {/* Outer Walls */}
        <rect x="40" y="30" width="720" height="400" fill="#ffffff" stroke="#13161c" strokeWidth="3" rx="4" />

        {/* Living & Dining */}
        <rect x="250" y="30" width="310" height="240" fill="url(#marbleHatch)" stroke="#13161c" strokeWidth="2" />
        <text x="405" y="140" textAnchor="middle" fontFamily="var(--font-serif)" fontSize="14" fill="#13161c" fontWeight="bold">Grand Living &amp; Dining Pavilion</text>
        <text x="405" y="160" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="10" fill="#64748b">32&apos;-0&quot; x 24&apos;-6&quot; • Double Height (22&apos; Ceiling)</text>

        {/* Sky Deck */}
        <rect x="250" y="30" width="310" height="50" fill="url(#woodDeck)" stroke="#a9812e" strokeWidth="1.5" />
        <text x="405" y="60" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9" fill="#a9812e" fontWeight="700">SUNSET SKY DECK · 310 SQ.FT (PARK FACING)</text>

        {/* Master Suite */}
        <rect x="560" y="30" width="200" height="190" fill="#ffffff" stroke="#13161c" strokeWidth="2" />
        <text x="660" y="110" textAnchor="middle" fontFamily="var(--font-serif)" fontSize="12" fill="#13161c" fontWeight="bold">Master Suite</text>
        <text x="660" y="128" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9" fill="#64748b">20&apos;-0&quot; x 16&apos;-0&quot;</text>
        <rect x="560" y="160" width="200" height="60" fill="#f4f6f8" stroke="#d8dcdd" strokeWidth="1" />
        <text x="660" y="195" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="8.5" fill="#475569">Walk-In Wardrobe &amp; 5-Fixture Bath</text>

        {/* Suite II */}
        <rect x="560" y="220" width="200" height="210" fill="#ffffff" stroke="#13161c" strokeWidth="2" />
        <text x="660" y="315" textAnchor="middle" fontFamily="var(--font-serif)" fontSize="12" fill="#13161c" fontWeight="bold">Suite II (Guest)</text>
        <text x="660" y="333" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9" fill="#64748b">16&apos;-0&quot; x 15&apos;-0&quot; • Attached Bath</text>

        {/* Suite III */}
        <rect x="40" y="30" width="210" height="190" fill="#ffffff" stroke="#13161c" strokeWidth="2" />
        <text x="145" y="115" textAnchor="middle" fontFamily="var(--font-serif)" fontSize="12" fill="#13161c" fontWeight="bold">Suite III (Children)</text>
        <text x="145" y="133" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9" fill="#64748b">17&apos;-0&quot; x 14&apos;-6&quot;</text>

        {/* Suite IV */}
        <rect x="40" y="220" width="210" height="130" fill="#ffffff" stroke="#13161c" strokeWidth="2" />
        <text x="145" y="280" textAnchor="middle" fontFamily="var(--font-serif)" fontSize="12" fill="#13161c" fontWeight="bold">Suite IV / Private Study</text>
        <text x="145" y="298" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9" fill="#64748b">14&apos;-0&quot; x 12&apos;-6&quot;</text>

        {/* Kitchen */}
        <rect x="250" y="270" width="160" height="160" fill="#f8fafc" stroke="#13161c" strokeWidth="2" />
        <text x="330" y="345" textAnchor="middle" fontFamily="var(--font-serif)" fontSize="11" fill="#13161c" fontWeight="bold">Gourmet Kitchen</text>
        <text x="330" y="363" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="8.5" fill="#64748b">Island Counter &amp; Pantry</text>

        {/* Lift Lobby */}
        <rect x="410" y="270" width="150" height="90" fill="#13161c" stroke="#13161c" strokeWidth="2" />
        <text x="485" y="315" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="10" fill="#ffffff" fontWeight="bold">PRIVATE LIFT LOBBY</text>
        <text x="485" y="330" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="8" fill="#a9812e">Dual High-Speed Elevators</text>

        {/* Servant Suite */}
        <rect x="410" y="360" width="150" height="70" fill="#f1f5f9" stroke="#d8dcdd" strokeWidth="1.5" />
        <text x="485" y="395" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9" fill="#475569" fontWeight="600">Servant Suite + Bath</text>
        <text x="485" y="410" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="7.5" fill="#94a3b8">Dedicated Service Lift Access</text>

        {/* Vastu Compass */}
        <g transform="translate(60, 45)">
          <circle cx="20" cy="20" r="16" fill="#ffffff" stroke="#a9812e" strokeWidth="1.5" />
          <path d="M 20 6 L 24 20 L 20 17 L 16 20 Z" fill="#a9812e" />
          <path d="M 20 34 L 24 20 L 20 23 L 16 20 Z" fill="#94a3b8" />
          <text x="20" y="4" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="7" fill="#a9812e" fontWeight="bold">N</text>
          <text x="35" y="14" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="6" fill="#2d5a4c" fontWeight="bold">NE</text>
        </g>

        {/* Dimension Lines */}
        <line x1="40" y1="18" x2="760" y2="18" stroke="#94a3b8" strokeWidth="1" />
        <line x1="40" y1="12" x2="40" y2="24" stroke="#94a3b8" strokeWidth="1" />
        <line x1="760" y1="12" x2="760" y2="24" stroke="#94a3b8" strokeWidth="1" />
        <text x="400" y="14" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="8.5" fill="#64748b">TOTAL WIDTH: 88&apos;-0&quot; (26.82 M)</text>

        <line x1="24" y1="30" x2="24" y2="430" stroke="#94a3b8" strokeWidth="1" />
        <line x1="18" y1="30" x2="30" y2="30" stroke="#94a3b8" strokeWidth="1" />
        <line x1="18" y1="430" x2="30" y2="430" stroke="#94a3b8" strokeWidth="1" />
        <text x="-230" y="18" transform="rotate(-90)" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="8.5" fill="#64748b">TOTAL DEPTH: 58&apos;-6&quot; (17.83 M)</text>
      </svg>

      {/* Legend */}
      <div className="mt-3 pt-3 border-t border-architecturalLine flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-slate-500">
        <span>UNIT CODE: [UNIT-1401 · TOWER-SOVEREIGN]</span>
        <span>SUPER AREA: 5,400 SQ.FT · CARPET AREA: 4,120 SQ.FT</span>
        <span className="text-ink font-bold">ALLOTTED TO: SIDDHARTH OBEROI</span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   3. MOBILE COMPANION DEVICE FRAME (unchanged)
   ═══════════════════════════════════════════════════════ */
export function MobileCompanionDeviceFrame({ className = "" }: { className?: string }) {
  return (
    <div className={`relative mx-auto w-[280px] sm:w-[310px] select-none ${className}`}>
      <div className="relative rounded-[40px] bg-[#1a1d24] p-3 shadow-2xl border-[3px] border-[#2d323f]">
        <div className="absolute top-5 left-1/2 -translate-x-1/2 w-24 h-4 bg-[#0a0b0e] rounded-full z-20 flex items-center justify-end px-2">
          <div className="h-2 w-2 rounded-full bg-[#1e2330] border border-[#333b4f]" />
        </div>

        <div className="relative rounded-[32px] bg-paper-card overflow-hidden text-ink font-sans pt-8 pb-4 px-3 space-y-3 border border-architecturalLine">
          <div className="flex items-center justify-between pb-2 border-b border-architecturalLine">
            <div className="flex items-center gap-1.5">
              <div className="h-6 w-6 rounded-md bg-ink text-paper-card flex items-center justify-center">
                <Building2 className="h-3.5 w-3.5 text-brass" />
              </div>
              <span className="text-xs font-bold font-display">Apex Mobile</span>
            </div>
            <span className="text-[9px] font-mono font-bold text-verdigris bg-verdigris-light px-1.5 py-0.2 rounded border border-verdigris-border">
              ● SYNCED
            </span>
          </div>

          <div className="p-2.5 bg-ink text-paper-card rounded-xl space-y-1 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-mono text-brass font-bold uppercase">⚡ INBOUND HOT LEAD (98112)</span>
              <span className="text-[9px] font-mono text-slate-400">NOW</span>
            </div>
            <p className="text-[11px] font-bold">Siddharth Oberoi</p>
            <p className="text-[10px] text-slate-300 font-mono">Req: 4 BHK Sky Suite • Budget: ₹14.50 Cr</p>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            <button className="py-2 bg-ink hover:bg-ink-hover text-paper-card text-[10px] font-bold rounded-lg flex items-center justify-center gap-1">
              <PhoneCall className="h-3 w-3 text-brass" /> 1-Click Dial
            </button>
            <button className="py-2 bg-verdigris text-white text-[10px] font-bold rounded-lg flex items-center justify-center gap-1">
              WhatsApp Pitch
            </button>
          </div>

          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-500">
              <span>PRIORITY QUEUE</span>
              <span>3 REMAINING</span>
            </div>
            {[
              { name: "Dr. Meenakshi S.", budget: "₹9.80 Cr", time: "3:30 PM" },
              { name: "Rohit Khanna", budget: "₹12.0 Cr", time: "5:00 PM" },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-2 bg-paper rounded-lg border border-architecturalLine text-[10px]">
                <div>
                  <p className="font-bold text-ink">{item.name}</p>
                  <p className="font-mono text-slate-500">{item.budget}</p>
                </div>
                <span className="font-mono text-[9px] font-bold text-brass bg-brass-light px-1.5 py-0.5 rounded">
                  {item.time}
                </span>
              </div>
            ))}
          </div>

          <div className="p-2 bg-paper rounded-lg border border-architecturalLine flex items-center justify-between text-[9px] font-mono text-slate-600">
            <span>[UNIT-1401 · 5,400 SQ.FT]</span>
            <span className="text-verdigris font-bold">4/4 MATCH</span>
          </div>

          <div className="w-20 h-1 bg-slate-300 rounded-full mx-auto mt-2" />
        </div>
      </div>
    </div>
  );
}
