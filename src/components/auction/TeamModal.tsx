import { motion, AnimatePresence } from "framer-motion";
import type { Player, Team } from "@/lib/auction/types";
import { formatPurse } from "@/lib/utils";

interface Props {
  open: boolean;
  team: Team | null;
  players: Player[];
  spent: number;
  onClose: () => void;
}

export function TeamModal({ open, team, players, spent, onClose }: Props) {
  return (
    <AnimatePresence>
      {open && team && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-md"
          />
          <motion.aside
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 240 }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-xl flex-col glass-strong"
          >
            <header className="flex items-center gap-4 border-b border-white/10 p-6">
              <div className="grid h-16 w-16 place-items-center overflow-hidden rounded-xl border border-white/10 bg-white/5">
                {team.logoUrl ? (
                  <img src={team.logoUrl} alt={`${team.name} flag`} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-2xl">🛡️</span>
                )}
              </div>
              <div className="flex-1">
                <h2 className="font-display text-2xl font-bold">{team.name}</h2>
                <p className="text-xs text-muted-foreground">
                  Captain: <span className="text-foreground">{team.captain}</span> · Mentor:{" "}
                  <span className="text-foreground">{team.mentor}</span>
                </p>
              </div>
              <button
                onClick={onClose}
                className="rounded-md border border-white/10 px-3 py-1.5 text-sm hover:bg-white/10"
              >Close</button>
            </header>

            <div className="flex-1 overflow-y-auto p-6">
              <h3 className="mb-3 text-xs uppercase tracking-widest text-muted-foreground">
                Players Purchased
              </h3>
              <div className="overflow-hidden rounded-xl border border-white/10">
                <table className="w-full text-sm">
                  <thead className="bg-white/5 text-xs uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2 text-left">Player</th>
                      <th className="px-3 py-2 text-left">Role</th>
                      <th className="px-3 py-2 text-left">Jersey</th>
                      <th className="px-3 py-2 text-left">No</th>
                      <th className="px-3 py-2 text-left">Size</th>
                      <th className="px-3 py-2 text-right">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {players.length === 0 && (
                      <tr><td colSpan={6} className="px-3 py-6 text-center text-muted-foreground">No players yet.</td></tr>
                    )}
                    {players.map((p) => (
                      <tr key={p.id} className="border-t border-white/5">
                        <td className="px-3 py-2 font-medium">{p.name}</td>
                        <td className="px-3 py-2">{p.role}</td>
                        <td className="px-3 py-2">{p.jerseyName}</td>
                        <td className="px-3 py-2">{p.jerseyNumber}</td>
                        <td className="px-3 py-2">{p.jerseySize}</td>
                        <td className="px-3 py-2 text-right font-semibold text-[oklch(0.85_0.17_85)]">
                          ₹{(p.soldPrice ?? 0).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <footer className="grid grid-cols-3 gap-2 border-t border-white/10 p-6">
              <Stat label="Total Players" value={players.length} />
              <Stat label="Spent" value={`₹${spent.toLocaleString()}`} />
              <Stat label="Purse Left" value={formatPurse(Math.max(team.budget - spent, 0))} />
            </footer>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl glass p-3 text-center">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-1 font-display text-lg font-bold">{value}</div>
    </div>
  );
}
