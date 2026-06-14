import { motion, AnimatePresence } from "framer-motion";
import { GROUP_LABELS } from "@/config/auctionRules";
import type { Player } from "@/lib/auction/types";

interface Props {
  player: Player | null;
  currentBid: number | null;
  lotteryMode?: boolean;
}

export function LiveBar({ player, currentBid, lotteryMode }: Props) {
  return (
    <div className="rounded-2xl glass-strong overflow-hidden">
      <div className="bg-gradient-to-r from-[oklch(0.3_0.15_150)]/40 via-[oklch(0.25_0.1_250)]/40 to-[oklch(0.3_0.15_280)]/40 px-4 py-2 text-center text-[10px] font-bold uppercase tracking-[0.3em] text-[oklch(0.85_0.18_150)]">
        ● Live · Current Player
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={player?.id ?? "none"}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.35 }}
          className={`grid gap-3 p-4 ${lotteryMode ? "grid-cols-2 md:grid-cols-3" : "grid-cols-2 md:grid-cols-5"}`}
        >
          <Cell label="Player" value={player?.name ?? "—"} highlight />
          <Cell label="Role" value={player?.role ?? "—"} />
          {player?.group && (
            <Cell label="Group" value={GROUP_LABELS[player.group]?.replace("Group ", "") ?? player.group} />
          )}
          {!lotteryMode && (
            <>
              <Cell label="Base Price" value={player ? `₹${player.basePrice.toLocaleString()}` : "—"} />
              <Cell label="Current Bid" value={currentBid ? `₹${currentBid.toLocaleString()}` : "—"} />
            </>
          )}
          {lotteryMode && player && (
            <Cell label="Status" value={player.status === "AVAILABLE" ? "Up Next" : player.status} />
          )}
          {!lotteryMode && <Cell label="Sold To" value={player?.team ?? "—"} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function Cell({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="min-w-0">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className={`truncate font-display text-base font-bold ${highlight ? "neon-text text-[oklch(0.9_0.15_150)]" : ""}`}>
        {value}
      </div>
    </div>
  );
}
