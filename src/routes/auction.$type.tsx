import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { AUCTION_META, SHEETS, type AuctionType } from "@/config/sheets";
import { TEAMS } from "@/config/teams";
import { loadPlayers } from "@/lib/auction/players.fn";
import { useAuctionState } from "@/lib/auction/useAuctionState";
import { downloadAuctionResults } from "@/lib/auction/excel";
import { PlayerCard } from "@/components/auction/PlayerCard";
import { LiveBar } from "@/components/auction/LiveBar";
import { TeamCard } from "@/components/auction/TeamCard";
import { TeamModal } from "@/components/auction/TeamModal";
import { FloatingParticles } from "@/components/auction/FloatingParticles";
import type { Player, Team } from "@/lib/auction/types";

const VALID: AuctionType[] = ["open", "veteran", "female"];

export const Route = createFileRoute("/auction/$type")({
  beforeLoad: ({ params }) => {
    if (!VALID.includes(params.type as AuctionType)) throw notFound();
  },
  loader: async ({ context, params }) => {
    const type = params.type as AuctionType;
    const meta = AUCTION_META[type];
    const playersUrl = SHEETS[meta.sheetKey];
    if (!playersUrl) return;
    await context.queryClient.ensureQueryData({
      queryKey: ["players", type, "v2"],
      queryFn: () => loadPlayers({ data: { url: playersUrl } }),
      staleTime: 5 * 60_000,
    });
  },
  head: ({ params }) => {
    const meta = AUCTION_META[params.type as AuctionType];
    const title = `${meta?.title ?? "Auction"} — Live Draft`;
    return {
      meta: [
        { title },
        { name: "description", content: `${meta?.title} live draft floor.` },
        { property: "og:title", content: title },
      ],
    };
  },
  component: AuctionPage,
  errorComponent: ({ error }) => (
    <div className="grid min-h-screen place-items-center stadium-bg p-6">
      <div className="glass-strong max-w-md rounded-2xl p-8 text-center">
        <h1 className="text-xl font-bold">Couldn't load auction</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <Link to="/" className="mt-4 inline-block rounded bg-primary px-4 py-2 text-primary-foreground">Home</Link>
      </div>
    </div>
  ),
  notFoundComponent: () => (
    <div className="grid min-h-screen place-items-center stadium-bg">
      <div className="glass-strong rounded-2xl p-8 text-center">
        <h1 className="text-xl font-bold">Unknown auction type</h1>
        <Link to="/" className="mt-4 inline-block rounded bg-primary px-4 py-2 text-primary-foreground">Home</Link>
      </div>
    </div>
  ),
});

function AuctionPage() {
  const { type } = Route.useParams() as { type: AuctionType };
  const meta = AUCTION_META[type];

  const playersUrl = SHEETS[meta.sheetKey];

  const playersQ = useQuery({
    queryKey: ["players", type, "v2"],
    queryFn: () => loadPlayers({ data: { url: playersUrl } }),
    enabled: !!playersUrl,
    staleTime: 5 * 60_000,
  });

  if (!playersUrl) return <SetupNotice missing={meta.sheetKey} />;
  if (playersQ.isLoading) return <LoadingScreen />;
  if (playersQ.error)
    return <ErrorScreen message={playersQ.error?.message ?? "Failed to load sheet"} />;

  const players = playersQ.data ?? [];
  if (players.length === 0) {
    return <EmptyPlayersScreen auctionType={type} />;
  }

  return (
    <AuctionFloor
      auctionKey={type}
      label={meta.title}
      players={players}
      teams={TEAMS}
    />
  );
}

function AuctionFloor({
  auctionKey, label, players: initialPlayers, teams,
}: { auctionKey: string; label: string; players: Player[]; teams: Team[] }) {
  const state = useAuctionState(auctionKey, initialPlayers, teams);
  const { currentPlayer, players, teamStats, paused, setPaused } = state;

  const [soldPrice, setSoldPrice] = useState<string>("");
  const [teamName, setTeamName] = useState<string>("");
  const [jName, setJName] = useState("");
  const [jNum, setJNum] = useState("");
  const [jSize, setJSize] = useState("");

  // Sync form fields with current player
  useEffect(() => {
    if (!currentPlayer) return;
    setSoldPrice(String(currentPlayer.soldPrice ?? currentPlayer.basePrice ?? ""));
    setTeamName(currentPlayer.team ?? "");
    setJName(currentPlayer.jerseyName ?? "");
    setJNum(currentPlayer.jerseyNumber ?? "");
    setJSize(currentPlayer.jerseySize ?? "");
  }, [currentPlayer?.id]); // eslint-disable-line

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  const filteredPlayers = useMemo(() => {
    return players.filter((p) => {
      if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (roleFilter !== "All" && p.role !== roleFilter) return false;
      if (statusFilter === "Remaining" && p.status !== "AVAILABLE") return false;
      if (statusFilter === "Sold" && p.status !== "SOLD") return false;
      if (statusFilter === "Unsold" && p.status !== "UNSOLD") return false;
      return true;
    });
  }, [players, search, roleFilter, statusFilter]);

  const [modalTeam, setModalTeam] = useState<Team | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSell = () => {
    if (paused) return alert("Auction is paused");
    const price = Number(soldPrice);
    if (!price || !teamName) return alert("Enter sold price and team");
    state.sellPlayer({ soldPrice: price, teamName, jerseyName: jName, jerseyNumber: jNum, jerseySize: jSize });
  };

  const handleImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => state.importBackup(String(reader.result));
    reader.readAsText(file);
  };

  return (
    <main className="relative min-h-screen overflow-x-hidden stadium-bg">
      <FloatingParticles count={12} />

      <div className="relative z-10 mx-auto max-w-[1600px] px-4 py-4 lg:px-6">
        {/* Top bar */}
        <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link to="/" className="grid h-10 w-10 place-items-center rounded-full glass hover:bg-white/10">←</Link>
            <div>
              <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Live Auction Floor</div>
              <h1 className="font-display text-xl font-black">{label}</h1>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <NeonButton onClick={() => setPaused((p) => !p)}>{paused ? "▶ Resume" : "⏸ Pause"}</NeonButton>
            <NeonButton onClick={() => downloadAuctionResults(auctionKey, teams, players)} variant="gold">⬇ Results</NeonButton>
            <NeonButton onClick={() => {
              const blob = new Blob([state.exportBackup()], { type: "application/json" });
              const a = document.createElement("a");
              a.href = URL.createObjectURL(blob);
              a.download = `${auctionKey}-backup-${Date.now()}.json`;
              a.click();
            }}>Backup</NeonButton>
            <NeonButton onClick={() => fileInputRef.current?.click()}>Import</NeonButton>
            <input ref={fileInputRef} type="file" accept="application/json" className="hidden"
              onChange={(e) => e.target.files?.[0] && handleImport(e.target.files[0])} />
            <NeonButton variant="danger" onClick={() => { if (confirm("Reset entire auction?")) state.reset(); }}>Reset</NeonButton>
          </div>
        </header>

        <LiveBar player={currentPlayer} currentBid={Number(soldPrice) || null} />

        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[1.1fr_1fr]">
          {/* LEFT */}
          <section className="space-y-4">
            <PlayerCard player={currentPlayer} />

            {/* Controls */}
            <div className="glass-strong rounded-2xl p-5">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <Field label="Sold Price">
                  <input
                    type="number" value={soldPrice} onChange={(e) => setSoldPrice(e.target.value)}
                    placeholder="0"
                    className="w-full rounded-lg bg-white/5 px-3 py-2 outline-none focus:ring-2 focus:ring-[oklch(0.78_0.22_150)]"
                  />
                </Field>
                <Field label="Team">
                  <select
                    value={teamName} onChange={(e) => setTeamName(e.target.value)}
                    className="w-full rounded-lg bg-white/5 px-3 py-2 outline-none focus:ring-2 focus:ring-[oklch(0.78_0.22_150)]"
                  >
                    <option value="">Select team…</option>
                    {teams.map((t) => (
                      <option key={t.id} value={t.name}>{t.name}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Jersey Name">
                  <input value={jName} onChange={(e) => setJName(e.target.value)}
                    className="w-full rounded-lg bg-white/5 px-3 py-2 outline-none focus:ring-2 focus:ring-[oklch(0.78_0.22_150)]" />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Jersey No">
                    <input value={jNum} onChange={(e) => setJNum(e.target.value)}
                      className="w-full rounded-lg bg-white/5 px-3 py-2 outline-none focus:ring-2 focus:ring-[oklch(0.78_0.22_150)]" />
                  </Field>
                  <Field label="Jersey Size">
                    <select value={jSize} onChange={(e) => setJSize(e.target.value)}
                      className="w-full rounded-lg bg-white/5 px-3 py-2 outline-none focus:ring-2 focus:ring-[oklch(0.78_0.22_150)]">
                      <option value="">—</option>
                      {["XS","S","M","L","XL","XXL","XXXL"].map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </Field>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-2 md:grid-cols-4">
                <NeonButton onClick={handleSell} variant="success" big>Sell Player</NeonButton>
                <NeonButton onClick={state.markUnsold} variant="danger" big>Unsold</NeonButton>
                <NeonButton onClick={state.nextPlayer} big>Next Player</NeonButton>
                <NeonButton onClick={state.undo} variant="ghost" big>↺ Undo</NeonButton>
              </div>
            </div>

            {/* Player browser */}
            <div className="glass rounded-2xl p-4">
              <div className="flex flex-wrap items-center gap-2">
                <input
                  value={search} onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search player…"
                  className="flex-1 min-w-[160px] rounded-lg bg-white/5 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[oklch(0.78_0.22_150)]"
                />
                <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
                  className="rounded-lg bg-white/5 px-3 py-2 text-sm outline-none">
                  {["All","Attack","Midfield","Defense","Defence","Goalkeeper"].map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-lg bg-white/5 px-3 py-2 text-sm outline-none">
                  {["All","Remaining","Sold","Unsold"].map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="mt-3 max-h-64 overflow-y-auto">
                <div className="grid grid-cols-1 gap-1.5 md:grid-cols-2">
                  {filteredPlayers.map((p) => (
                    <button
                      key={p.id} onClick={() => state.goToPlayer(p.id)}
                      className={`flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                        p.id === currentPlayer?.id ? "bg-[oklch(0.78_0.22_150)]/20 ring-1 ring-[oklch(0.78_0.22_150)]" : "bg-white/5 hover:bg-white/10"
                      }`}
                    >
                      <span className="truncate">
                        <span className="font-medium">{p.name}</span>{" "}
                        <span className="text-xs text-muted-foreground">· {p.role}</span>
                      </span>
                      <StatusChip status={p.status} />
                    </button>
                  ))}
                  {filteredPlayers.length === 0 && (
                    <div className="col-span-full py-6 text-center text-sm text-muted-foreground">No players match.</div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* RIGHT */}
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-lg font-bold">Teams</h2>
              <span className="text-xs text-muted-foreground">{teams.length} squads</span>
            </div>
            <motion.div layout className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-2">
              {teams.map((t) => {
                const s = teamStats.get(t.name) ?? { bought: 0, spent: 0, players: [] };
                return (
                  <TeamCard key={t.id} team={t} bought={s.bought} spent={s.spent} onClick={() => setModalTeam(t)} />
                );
              })}
            </motion.div>
          </section>
        </div>
      </div>

      <TeamModal
        open={!!modalTeam}
        team={modalTeam}
        players={modalTeam ? teamStats.get(modalTeam.name)?.players ?? [] : []}
        spent={modalTeam ? teamStats.get(modalTeam.name)?.spent ?? 0 : 0}
        onClose={() => setModalTeam(null)}
      />

      {paused && (
        <div className="pointer-events-none fixed inset-x-0 top-4 z-30 flex justify-center">
          <div className="rounded-full bg-destructive/80 px-4 py-1.5 text-xs font-bold uppercase tracking-widest backdrop-blur">⏸ Auction Paused</div>
        </div>
      )}
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] uppercase tracking-widest text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function StatusChip({ status }: { status: string }) {
  const map: Record<string, string> = {
    SOLD: "bg-[oklch(0.7_0.2_150)]/20 text-[oklch(0.85_0.18_150)]",
    UNSOLD: "bg-destructive/20 text-destructive",
    AVAILABLE: "bg-white/10 text-muted-foreground",
  };
  return <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold ${map[status] ?? map.AVAILABLE}`}>{status}</span>;
}

function NeonButton({
  children, onClick, variant = "primary", big,
}: { children: React.ReactNode; onClick?: () => void; variant?: "primary" | "success" | "danger" | "ghost" | "gold"; big?: boolean }) {
  const styles: Record<string, string> = {
    primary: "bg-gradient-to-r from-[oklch(0.5_0.15_220)] to-[oklch(0.45_0.15_260)] text-white hover:shadow-[0_0_24px_oklch(0.6_0.2_240/0.6)]",
    success: "bg-gradient-to-r from-[oklch(0.65_0.2_150)] to-[oklch(0.55_0.22_165)] text-white hover:shadow-[0_0_24px_oklch(0.7_0.22_150/0.7)]",
    danger:  "bg-gradient-to-r from-[oklch(0.6_0.22_25)] to-[oklch(0.5_0.22_15)] text-white hover:shadow-[0_0_24px_oklch(0.65_0.24_25/0.6)]",
    gold:    "bg-gradient-to-r from-[oklch(0.8_0.16_85)] to-[oklch(0.7_0.18_70)] text-black hover:shadow-[0_0_24px_oklch(0.85_0.17_85/0.7)]",
    ghost:   "bg-white/5 hover:bg-white/10 text-foreground border border-white/10",
  };
  return (
    <motion.button
      whileHover={{ y: -2 }} whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className={`rounded-xl font-semibold uppercase tracking-wider transition-shadow ${styles[variant]} ${big ? "px-4 py-3 text-sm" : "px-3 py-2 text-xs"}`}
    >
      {children}
    </motion.button>
  );
}

function LoadingScreen() {
  return (
    <div className="grid min-h-screen place-items-center stadium-bg">
      <div className="glass-strong rounded-2xl p-10 text-center">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-[oklch(0.78_0.22_150)]" />
        <p className="font-display uppercase tracking-widest">Loading draft floor…</p>
      </div>
    </div>
  );
}

function ErrorScreen({ message }: { message: string }) {
  return (
    <div className="grid min-h-screen place-items-center stadium-bg p-6">
      <div className="glass-strong max-w-md rounded-2xl p-8 text-center">
        <h1 className="text-xl font-bold">Couldn't load data</h1>
        <p className="mt-2 text-sm text-muted-foreground">{message}</p>
        <p className="mt-3 text-xs text-muted-foreground">
          Make sure your Google Sheets are shared as "Anyone with link · Viewer" or published to web.
        </p>
        <Link to="/" className="mt-4 inline-block rounded bg-primary px-4 py-2 text-primary-foreground">Home</Link>
      </div>
    </div>
  );
}

function EmptyPlayersScreen({ auctionType }: { auctionType: string }) {
  const clearCache = () => {
    localStorage.removeItem(`auction-state-v1:${auctionType}`);
    window.location.reload();
  };
  return (
    <div className="grid min-h-screen place-items-center stadium-bg p-6">
      <div className="glass-strong max-w-md rounded-2xl p-8 text-center">
        <h1 className="text-xl font-bold">No players found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The Google Sheet loaded but no player rows were parsed. Check that row 1 uses
          <code className="mx-1 rounded bg-white/10 px-1">Player Name</code> as the name column,
          and the sheet is shared publicly.
        </p>
        <button
          onClick={clearCache}
          className="mt-4 rounded bg-primary px-4 py-2 text-primary-foreground"
        >
          Clear cache &amp; reload
        </button>
        <Link to="/" className="mt-3 block text-sm text-muted-foreground underline">Back home</Link>
      </div>
    </div>
  );
}

function SetupNotice({ missing }: { missing: string }) {
  return (
    <div className="grid min-h-screen place-items-center stadium-bg p-6">
      <div className="glass-strong max-w-xl rounded-2xl p-8">
        <h1 className="font-display text-2xl font-bold">Configure Google Sheets</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          The <code className="rounded bg-white/10 px-1.5 py-0.5">{missing}</code> sheet URL is empty.
          Open <code className="rounded bg-white/10 px-1.5 py-0.5">src/config/sheets.ts</code> and paste the Google Sheet
          links there. Use either the normal sheet URL (with <code>?gid=</code>) or a "Publish to web → CSV" link.
        </p>
        <pre className="mt-4 overflow-x-auto rounded-lg bg-black/40 p-3 text-xs">
{`export const SHEETS = {
  openPlayers:    "https://docs.google.com/...gid=0",
  veteranPlayers: "https://docs.google.com/...gid=1",
  femalePlayers:  "https://docs.google.com/...gid=2",
}`}
        </pre>
        <Link to="/" className="mt-5 inline-block rounded bg-primary px-4 py-2 text-primary-foreground">Back home</Link>
      </div>
    </div>
  );
}
