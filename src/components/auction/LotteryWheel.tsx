import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import type { Player, Team, TeamStats } from "@/lib/auction/types";

interface Props {
  players: Player[];
  teams: Team[];
  teamStats: Map<string, TeamStats>;
  onAssign: (playerId: string, teamName: string) => string | null;
}

const SEGMENT_COLORS = [
  "from-[oklch(0.65_0.24_25)] to-[oklch(0.55_0.22_15)]",
  "from-[oklch(0.7_0.2_150)] to-[oklch(0.55_0.2_170)]",
  "from-[oklch(0.65_0.2_240)] to-[oklch(0.5_0.2_260)]",
  "from-[oklch(0.78_0.18_90)] to-[oklch(0.65_0.2_70)]",
  "from-[oklch(0.72_0.18_340)] to-[oklch(0.62_0.22_310)]",
  "from-[oklch(0.75_0.18_200)] to-[oklch(0.65_0.22_220)]",
];

export function LotteryWheel({ players, teams, teamStats, onAssign }: Props) {
  const remaining = useMemo(() => players.filter((p) => p.status === "AVAILABLE"), [players]);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<{ player: Player; team: Team } | null>(null);

  const eligibleTeams = useMemo(
    () => teams.filter((t) => (teamStats.get(t.name)?.bought ?? 0) < t.maxPlayers),
    [teams, teamStats],
  );

  const currentPlayer = remaining[0] ?? null;

  const spin = () => {
    if (!currentPlayer || spinning || eligibleTeams.length === 0) return;
    setSpinning(true);
    setResult(null);

    const teamIndex = Math.floor(Math.random() * eligibleTeams.length);
    const team = eligibleTeams[teamIndex];
    const segment = 360 / teams.length;
    const fullIndex = teams.findIndex((t) => t.id === team.id);
    const target = 360 * 5 + fullIndex * segment + segment / 2;

    setRotation((r) => r + target);

    setTimeout(() => {
      setSpinning(false);
      const err = onAssign(currentPlayer.id, team.name);
      if (err) {
        alert(err);
        return;
      }
      setResult({ player: currentPlayer, team });
    }, 4200);
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
      <div className="glass-strong rounded-2xl p-4 text-center">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Next draw</div>
        <div className="font-display text-2xl font-bold">{currentPlayer.name}</div>
        <div className="text-sm text-muted-foreground">{remaining.length} players remaining</div>
      </div>

      <div className="relative mx-auto flex max-w-md flex-col items-center">
        <div className="absolute -top-2 z-10 text-2xl">▼</div>
        <motion.div
          animate={{ rotate: rotation }}
          transition={{ duration: spinning ? 4 : 0, ease: [0.2, 0.8, 0.2, 1] }}
          className="relative h-72 w-72 rounded-full border-4 border-white/20 shadow-2xl"
          style={{ background: "conic-gradient(from 0deg, oklch(0.5 0.2 150), oklch(0.5 0.2 240), oklch(0.5 0.2 25), oklch(0.5 0.2 90))" }}
        >
          {teams.map((t, i) => {
            const angle = (360 / teams.length) * i;
            const full = (teamStats.get(t.name)?.bought ?? 0) >= t.maxPlayers;
            return (
              <div
                key={t.id}
                className="absolute inset-0 flex items-start justify-center pt-6"
                style={{ transform: `rotate(${angle}deg)` }}
              >
                <span
                  className={`rounded-full bg-gradient-to-r ${SEGMENT_COLORS[i % SEGMENT_COLORS.length]} px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow ${full ? "opacity-40" : ""}`}
                  style={{ transform: `rotate(${-angle - rotation}deg)` }}
                >
                  {t.name.split(" ")[0]}
                </span>
              </div>
            );
          })}
          <div className="absolute inset-0 m-auto h-16 w-16 rounded-full glass-strong grid place-items-center font-display text-xs font-bold">
            SPIN
          </div>
        </motion.div>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          disabled={spinning || eligibleTeams.length === 0}
          onClick={spin}
          className="mt-8 rounded-xl bg-gradient-to-r from-[oklch(0.8_0.16_85)] to-[oklch(0.7_0.18_70)] px-8 py-3 font-display font-bold uppercase tracking-wider text-black disabled:opacity-50"
        >
          {spinning ? "Spinning…" : eligibleTeams.length === 0 ? "All teams full" : "Spin the Wheel"}
        </motion.button>
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
