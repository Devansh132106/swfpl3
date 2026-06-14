import { motion, AnimatePresence } from "framer-motion";
import { GROUP_LABELS } from "@/config/auctionRules";
import type { Player } from "@/lib/auction/types";

export function PlayerDetailsHeader({ player }: { player: Player | null }) {
  return (
    <AnimatePresence mode="wait">
      {player ? (
        <motion.div
          key={player.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="glass-strong rounded-2xl p-5 text-center"
        >
          <h2 className="font-display text-3xl font-black tracking-wide">{player.name}</h2>
          {player.group && (
            <div className="mt-2 inline-block rounded-full bg-[oklch(0.7_0.2_150)]/20 px-3 py-0.5 text-xs font-semibold uppercase tracking-wider text-[oklch(0.85_0.18_150)]">
              {GROUP_LABELS[player.group]}
            </div>
          )}
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
        </motion.div>
      ) : (
        <div className="rounded-2xl glass p-6 text-center text-muted-foreground">Select a player</div>
      )}
    </AnimatePresence>
  );
}
