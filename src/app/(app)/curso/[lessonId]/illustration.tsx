/**
 * Ilustrações SVG temáticas das aulas — inline, leves, sem dependências.
 * Paleta alinhada ao design (laranja solar #f97316, azul profundo #061233).
 * Cada chave mapeia para um desenho; o leitor de aula escolhe pela aula.
 */

export type IllustrationKey =
  | "sun"
  | "panel"
  | "generation"
  | "shield"
  | "company"
  | "warranty"
  | "module"
  | "inverter"
  | "payback"
  | "price"
  | "matrix"
  | "deal";

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-br from-[#020719] via-[#061233] to-[#0a1e4d]">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "26px 26px",
          maskImage: "radial-gradient(120% 100% at 70% 10%, black 30%, transparent 80%)",
          WebkitMaskImage: "radial-gradient(120% 100% at 70% 10%, black 30%, transparent 80%)",
        }}
      />
      <svg viewBox="0 0 400 150" className="relative w-full" role="img" aria-hidden="true">
        {children}
      </svg>
    </div>
  );
}

const O = "#f97316"; // solar orange
const Od = "#ea580c";
const W = "#e2e8f0";
const Wm = "#64748b";

export function LessonIllustration({ kind }: { kind: IllustrationKey }) {
  switch (kind) {
    case "sun":
      return (
        <Frame>
          <circle cx="200" cy="75" r="32" fill={O} />
          {Array.from({ length: 12 }).map((_, i) => {
            const a = (i * Math.PI) / 6;
            return (
              <line
                key={i}
                x1={200 + Math.cos(a) * 44}
                y1={75 + Math.sin(a) * 44}
                x2={200 + Math.cos(a) * 58}
                y2={75 + Math.sin(a) * 58}
                stroke={O}
                strokeWidth="4"
                strokeLinecap="round"
              />
            );
          })}
          <path d="M120 120 L280 120" stroke={Wm} strokeWidth="3" strokeLinecap="round" />
        </Frame>
      );
    case "panel":
    case "module":
      return (
        <Frame>
          <g transform="rotate(-12 200 75)">
            {Array.from({ length: 3 }).map((_, r) =>
              Array.from({ length: 5 }).map((__, c) => (
                <rect
                  key={`${r}-${c}`}
                  x={130 + c * 30}
                  y={45 + r * 24}
                  width="26"
                  height="20"
                  rx="2"
                  fill={r === 1 && c === 2 ? O : "#0b2a5e"}
                  stroke={W}
                  strokeWidth="1.5"
                />
              )),
            )}
          </g>
          <circle cx="320" cy="40" r="16" fill={O} opacity="0.9" />
        </Frame>
      );
    case "generation":
      return (
        <Frame>
          <circle cx="90" cy="55" r="20" fill={O} />
          <rect x="150" y="40" width="60" height="40" rx="3" fill="#0b2a5e" stroke={W} strokeWidth="1.5" />
          <path d="M165 60 h30 M180 50 v20" stroke={O} strokeWidth="3" strokeLinecap="round" />
          <path d="M120 60 H148" stroke={O} strokeWidth="3" markerEnd="url(#a)" />
          <path d="M212 60 H300" stroke={O} strokeWidth="3" markerEnd="url(#a)" />
          <polyline points="300,90 320,70 340,80 360,55" fill="none" stroke={O} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <defs>
            <marker id="a" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
              <path d="M0 0 L8 4 L0 8 z" fill={O} />
            </marker>
          </defs>
        </Frame>
      );
    case "shield":
    case "company":
      return (
        <Frame>
          <path
            d="M200 28 L240 44 V80 C240 104 222 118 200 124 C178 118 160 104 160 80 V44 Z"
            fill="#0b2a5e"
            stroke={O}
            strokeWidth="2.5"
          />
          <path d="M185 76 l10 10 l22 -24" fill="none" stroke={O} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        </Frame>
      );
    case "warranty":
      return (
        <Frame>
          <circle cx="200" cy="70" r="34" fill="none" stroke={O} strokeWidth="3" />
          <path d="M188 70 l8 8 l18 -20" fill="none" stroke={O} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M186 104 l-8 22 l22 -10 l22 10 l-8 -22" fill={Od} />
        </Frame>
      );
    case "inverter":
      return (
        <Frame>
          <rect x="160" y="36" width="80" height="78" rx="6" fill="#0b2a5e" stroke={W} strokeWidth="2" />
          <circle cx="200" cy="62" r="14" fill="none" stroke={O} strokeWidth="3" />
          <path d="M190 62 q5 -10 10 0 t10 0" fill="none" stroke={O} strokeWidth="3" />
          <rect x="176" y="90" width="48" height="5" rx="2" fill={Wm} />
          <rect x="176" y="100" width="30" height="5" rx="2" fill={Wm} />
        </Frame>
      );
    case "payback":
      return (
        <Frame>
          <line x1="80" y1="120" x2="340" y2="120" stroke={Wm} strokeWidth="2" />
          <line x1="80" y1="30" x2="80" y2="120" stroke={Wm} strokeWidth="2" />
          <polyline points="80,118 140,110 200,90 260,55 330,30" fill="none" stroke={O} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="200" y1="120" x2="200" y2="90" stroke={O} strokeDasharray="4 4" strokeWidth="2" />
          <circle cx="200" cy="90" r="5" fill={O} />
        </Frame>
      );
    case "price":
      return (
        <Frame>
          <circle cx="150" cy="75" r="34" fill="#0b2a5e" stroke={O} strokeWidth="2.5" />
          <text x="150" y="86" textAnchor="middle" fontSize="34" fontWeight="bold" fill={O}>$</text>
          <circle cx="250" cy="75" r="26" fill="none" stroke={Wm} strokeWidth="2.5" />
          <text x="250" y="84" textAnchor="middle" fontSize="26" fontWeight="bold" fill={Wm}>$</text>
          <path d="M196 75 H214" stroke={W} strokeWidth="2.5" />
        </Frame>
      );
    case "matrix":
      return (
        <Frame>
          {Array.from({ length: 3 }).map((_, r) =>
            Array.from({ length: 4 }).map((__, c) => (
              <rect
                key={`${r}-${c}`}
                x={120 + c * 44}
                y={45 + r * 24}
                width="38"
                height="18"
                rx="3"
                fill={c === 0 ? "#0b2a5e" : r === 0 && c === 1 ? O : "#0b2a5e"}
                stroke={W}
                strokeWidth="1"
                opacity={c === 0 ? 0.6 : 1}
              />
            )),
          )}
        </Frame>
      );
    case "deal":
      return (
        <Frame>
          <circle cx="160" cy="70" r="22" fill={O} />
          <circle cx="240" cy="70" r="22" fill="#0b2a5e" stroke={O} strokeWidth="2.5" />
          <path d="M185 95 q15 14 30 0" fill="none" stroke={W} strokeWidth="3" strokeLinecap="round" />
          <path d="M200 38 l6 10 l-12 0 z" fill={O} />
        </Frame>
      );
    default:
      return null;
  }
}
