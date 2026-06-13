import { motion } from "framer-motion";
import type { Team } from "@/lib/auction/types";

interface Props {
  team: Team;
  bought: number;
  spent: number;
  onClick: () => void;
}

export function TeamCard({ team, bought, spent, onClick }: Props) {
  const remaining = Math.max(team.maxPlayers - bought, 0);
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -4, rotateX: 4, rotateY: -2, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      style={{ transformStyle: "preserve-3d" }}
      className="group relative w-full overflow-hidden rounded-2xl glass p-4 text-left transition-shadow hover:neon-glow"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[oklch(0.7_0.2_150)]/0 via-transparent to-[oklch(0.5_0.2_280)]/0 opacity-0 transition-opacity group-hover:opacity-30" />
      <div className="relative flex items-start gap-3">
        <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-gradient-to-br from-[oklch(0.7_0.2_150)] to-[oklch(0.5_0.2_200)]">
          {team.logoUrl ? (
            <img src={team.logoUrl} alt={team.name} className="h-full w-full object-cover" />
          ) : (
            <span className="text-xl">🛡️</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-display text-sm font-bold truncate">{team.name}</div>
          <div className="text-[11px] text-muted-foreground truncate">
            C: {team.captain || "—"} · M: {team.mentor || "—"}
          </div>
        </div>
      </div>
      <div className="relative mt-3 grid grid-cols-3 gap-1.5 text-center">
        <Pill label="Slots" value={remaining} />
        <Pill label="Bought" value={bought} />
        <Pill label="Spent" value={`₹${(spent / 1000).toFixed(0)}k`} />
      </div>
    </motion.button>
  );
}

function Pill({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg bg-white/5 px-1.5 py-1.5">
      <div className="text-[9px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-xs font-semibold">{value}</div>
    </div>
  );
}
