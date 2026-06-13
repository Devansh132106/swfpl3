import { motion, AnimatePresence } from "framer-motion";
import type { Player } from "@/lib/auction/types";
import { PlayerPhoto } from "@/components/auction/PlayerPhoto";

const roleColor: Record<string, string> = {
  Attack: "from-[oklch(0.65_0.24_25)] to-[oklch(0.55_0.22_15)]",
  Midfield: "from-[oklch(0.7_0.2_150)] to-[oklch(0.55_0.2_170)]",
  Defense: "from-[oklch(0.65_0.2_240)] to-[oklch(0.5_0.2_260)]",
  Defence: "from-[oklch(0.65_0.2_240)] to-[oklch(0.5_0.2_260)]",
  Goalkeeper: "from-[oklch(0.78_0.18_90)] to-[oklch(0.65_0.2_70)]",
};

export function PlayerPortrait({ player }: { player: Player | null }) {
  return (
    <div className="relative h-full min-h-[320px] lg:min-h-[calc(100vh-12rem)]">
      <AnimatePresence mode="wait">
        {player ? (
          <motion.div
            key={player.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.4, type: "spring" }}
            className="flex h-full flex-col overflow-hidden rounded-3xl glass-strong animate-border-glow"
          >
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="relative min-h-0 flex-1 overflow-hidden bg-gradient-to-b from-white/10 to-white/5"
            >
              <PlayerPhoto key={player.id} photoUrl={player.photoUrl} name={player.name} />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
                <span
                  className={`inline-flex rounded-full bg-gradient-to-r ${roleColor[player.role] ?? roleColor.Midfield} px-3 py-1 text-xs font-bold uppercase tracking-wider shadow-lg`}
                >
                  {player.role}
                </span>
              </div>
            </motion.div>
          </motion.div>
        ) : (
          <div className="grid h-full min-h-[320px] place-items-center rounded-3xl glass-strong p-8 text-center text-muted-foreground">
            No player to display.
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
