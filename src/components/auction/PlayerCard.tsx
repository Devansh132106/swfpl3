import { motion, AnimatePresence } from "framer-motion";
import type { Player } from "@/lib/auction/types";

const roleColor: Record<string, string> = {
  Attack: "from-[oklch(0.65_0.24_25)] to-[oklch(0.55_0.22_15)]",
  Midfield: "from-[oklch(0.7_0.2_150)] to-[oklch(0.55_0.2_170)]",
  Defense: "from-[oklch(0.65_0.2_240)] to-[oklch(0.5_0.2_260)]",
  Defence: "from-[oklch(0.65_0.2_240)] to-[oklch(0.5_0.2_260)]",
  Goalkeeper: "from-[oklch(0.78_0.18_90)] to-[oklch(0.65_0.2_70)]",
};

interface Props {
  player: Player | null;
  currentBid?: number | null;
  soldTo?: string | null;
}

export function PlayerCard({ player }: Props) {
  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        {player ? (
          <motion.div
            key={player.id}
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.45, type: "spring" }}
            className="relative overflow-hidden rounded-3xl glass-strong p-6 animate-border-glow"
          >
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="relative mx-auto aspect-[3/4] max-w-sm overflow-hidden rounded-2xl bg-gradient-to-b from-white/10 to-white/5"
            >
              {player.photoUrl ? (
                <img
                  src={player.photoUrl}
                  alt={player.name}
                  className="h-full w-full object-cover"
                  onError={(e) => ((e.currentTarget.style.display = "none"))}
                />
              ) : (
                <div className="grid h-full w-full place-items-center text-7xl">⚽</div>
              )}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
                <span className={`inline-flex rounded-full bg-gradient-to-r ${roleColor[player.role] ?? roleColor.Midfield} px-3 py-1 text-xs font-bold uppercase tracking-wider shadow-lg`}>
                  {player.role}
                </span>
              </div>
            </motion.div>

            <div className="mt-5 text-center">
              <h2 className="font-display text-3xl font-black tracking-wide">{player.name}</h2>
              <div className="mt-3 inline-flex items-center gap-4 rounded-full glass px-5 py-2">
                <span className="text-xs uppercase tracking-widest text-muted-foreground">Base Price</span>
                <span className="font-display text-xl font-bold text-[oklch(0.85_0.17_85)]">
                  ₹{player.basePrice.toLocaleString()}
                </span>
              </div>
              {player.status === "SOLD" && (
                <div className="mt-3 text-sm">
                  <span className="rounded bg-[oklch(0.7_0.2_150)]/20 px-2 py-0.5 text-[oklch(0.85_0.18_150)]">SOLD</span>{" "}
                  to <strong>{player.team}</strong> · ₹{player.soldPrice?.toLocaleString()}
                </div>
              )}
              {player.status === "UNSOLD" && (
                <div className="mt-3 text-sm">
                  <span className="rounded bg-destructive/20 px-2 py-0.5 text-destructive">UNSOLD</span>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <div className="grid place-items-center rounded-3xl glass-strong p-16 text-center text-muted-foreground">
            No player to display.
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
