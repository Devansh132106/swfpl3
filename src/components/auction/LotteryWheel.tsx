import { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { AuctionRules } from "@/config/auctionRules";
import type { Player, Team, TeamStats } from "@/lib/auction/types";
import { eligibleLotteryTeams, effectiveMaxPlayers } from "@/lib/auction/preparePlayers";

interface Props {
  currentPlayer: Player | null;
  players: Player[];
  teams: Team[];
  teamStats: Map<string, TeamStats>;
  rules: AuctionRules;
  onAssign: (playerId: string, teamName: string) => string | null;
}

const WHEEL_COLORS = [
  "oklch(0.55 0.22 25)",
  "oklch(0.55 0.2 150)",
  "oklch(0.55 0.2 240)",
  "oklch(0.6 0.18 90)",
  "oklch(0.55 0.18 340)",
  "oklch(0.55 0.18 200)",
  "oklch(0.58 0.2 55)",
  "oklch(0.52 0.2 280)",
];

const SIZE = 320;
const CX = SIZE / 2;
const CY = SIZE / 2;
const R = SIZE / 2 - 8;

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function slicePath(index: number, total: number): string {
  const seg = 360 / total;
  const start = index * seg;
  const end = start + seg;
  const p1 = polarToCartesian(CX, CY, R, start);
  const p2 = polarToCartesian(CX, CY, R, end);
  const large = seg > 180 ? 1 : 0;
  return `M ${CX} ${CY} L ${p1.x} ${p1.y} A ${R} ${R} 0 ${large} 1 ${p2.x} ${p2.y} Z`;
}

function labelPos(index: number, total: number) {
  const seg = 360 / total;
  const mid = index * seg + seg / 2;
  const p = polarToCartesian(CX, CY, R * 0.62, mid);
  return { x: p.x, y: p.y, rotate: mid };
}

/** Rotation (deg, clockwise) so segment `index` center lands under the top pointer. */
function rotationForSegment(index: number, total: number): number {
  const seg = 360 / total;
  const center = index * seg + seg / 2;
  return (360 - center) % 360;
}

export function LotteryWheel({ currentPlayer, players, teams, teamStats, rules, onAssign }: Props) {
  const remaining = useMemo(() => players.filter((p) => p.status === "AVAILABLE"), [players]);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<{ player: Player; team: Team } | null>(null);
  const pendingRef = useRef<{ player: Player; team: Team } | null>(null);

  const eligibleTeams = useMemo(
    () => eligibleLotteryTeams(teams, teamStats, rules),
    [teams, teamStats, rules],
  );

  const spin = () => {
    const player = currentPlayer ?? remaining[0];
    if (!player || spinning || eligibleTeams.length === 0) return;
    setSpinning(true);
    setResult(null);

    const picked = eligibleTeams[Math.floor(Math.random() * eligibleTeams.length)];
    const teamIndex = teams.findIndex((t) => t.id === picked.id);
    if (teamIndex < 0) return;

    pendingRef.current = { player, team: picked };

    const targetMod = rotationForSegment(teamIndex, teams.length);
    const currentMod = ((rotation % 360) + 360) % 360;
    let delta = targetMod - currentMod;
    if (delta <= 0) delta += 360;
    const nextRotation = rotation + 360 * 6 + delta;

    setRotation(nextRotation);
  };

  const onSpinComplete = () => {
    if (!spinning || !pendingRef.current) return;
    setSpinning(false);
    const { player, team } = pendingRef.current;
    pendingRef.current = null;
    const err = onAssign(player.id, team.name);
    if (err) {
      alert(err);
      return;
    }
    setResult({ player, team });
  };

  if (!remaining.length) {
    return (
      <div className="glass-strong rounded-3xl p-10 text-center">
        <h2 className="font-display text-2xl font-bold text-[oklch(0.85_0.18_150)]">Lottery Complete</h2>
        <p className="mt-2 text-muted-foreground">Every player has been assigned to a team.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="relative mx-auto flex max-w-lg flex-col items-center">
        {/* Fixed pointer at top */}
        <div className="relative z-20 -mb-3">
          <div className="mx-auto h-0 w-0 border-x-[14px] border-x-transparent border-t-[22px] border-t-[oklch(0.85_0.18_85)] drop-shadow-lg" />
        </div>

        <div className="relative rounded-full p-1 shadow-2xl ring-4 ring-white/20">
          <motion.div
            animate={{ rotate: rotation }}
            transition={{ duration: spinning ? 5 : 0, ease: [0.15, 0.85, 0.25, 1] }}
            onAnimationComplete={() => spinning && onSpinComplete()}
            className="relative"
            style={{ width: SIZE, height: SIZE }}
          >
            <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="block">
              {teams.map((t, i) => {
                const full = (teamStats.get(t.name)?.bought ?? 0) >= (rules.maxTeamsAtMaxSize
                  ? effectiveMaxPlayers(t, teams, teamStats, rules)
                  : t.maxPlayers);
                const { x, y, rotate } = labelPos(i, teams.length);
                return (
                  <g key={t.id}>
                    <path
                      d={slicePath(i, teams.length)}
                      fill={WHEEL_COLORS[i % WHEEL_COLORS.length]}
                      stroke="white"
                      strokeWidth={3}
                      opacity={full ? 0.35 : 1}
                    />
                    <text
                      x={x}
                      y={y}
                      fill="white"
                      fontSize={teams.length > 4 ? 11 : 13}
                      fontWeight="bold"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      transform={`rotate(${rotate}, ${x}, ${y})`}
                      opacity={full ? 0.5 : 1}
                    >
                      {t.name.length > 12 ? t.name.split(" ")[0] : t.name}
                    </text>
                  </g>
                );
              })}
              <circle cx={CX} cy={CY} r={28} fill="oklch(0.15 0.02 260)" stroke="white" strokeWidth={3} />
              <text x={CX} y={CY} fill="white" fontSize={11} fontWeight="bold" textAnchor="middle" dominantBaseline="middle">
                SPIN
              </text>
            </svg>
          </motion.div>
        </div>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          disabled={spinning || eligibleTeams.length === 0 || !currentPlayer}
          onClick={spin}
          className="mt-8 rounded-xl bg-gradient-to-r from-[oklch(0.8_0.16_85)] to-[oklch(0.7_0.18_70)] px-8 py-3 font-display font-bold uppercase tracking-wider text-black disabled:opacity-50"
        >
          {spinning ? "Spinning…" : eligibleTeams.length === 0 ? "All teams full" : "Spin the Wheel"}
        </motion.button>

        <p className="mt-3 text-center text-xs text-muted-foreground">
          {remaining.length} players remaining · pointer selects the team
        </p>
      </div>

      {result && !spinning && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-strong rounded-2xl p-4 text-center"
        >
          <span className="font-display text-lg font-bold">{result.player.name}</span>
          {" → "}
          <span className="text-[oklch(0.85_0.18_150)]">{result.team.name}</span>
        </motion.div>
      )}

      <div className="glass rounded-2xl p-4">
        <h3 className="mb-2 text-xs uppercase tracking-widest text-muted-foreground">Assignments</h3>
        <div className="max-h-48 space-y-1 overflow-y-auto text-sm">
          {players.filter((p) => p.status === "SOLD").map((p) => (
            <div key={p.id} className="flex justify-between rounded-lg bg-white/5 px-3 py-1.5">
              <span>{p.name}</span>
              <span className="text-muted-foreground">{p.team}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
