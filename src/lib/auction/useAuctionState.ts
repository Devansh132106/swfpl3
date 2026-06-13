import { useCallback, useEffect, useMemo, useState } from "react";
import type { Player, SaleRecord, Team } from "./types";

const KEY = (auction: string) => `auction-state-v1:${auction}`;

interface PersistedState {
  players: Player[];
  history: SaleRecord[];
  currentIndex: number;
  paused: boolean;
}

export function useAuctionState(
  auction: string,
  initialPlayers: Player[],
  teams: Team[],
) {
  const [players, setPlayers] = useState<Player[]>(initialPlayers);
  const [history, setHistory] = useState<SaleRecord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(KEY(auction));
      if (raw) {
        const s = JSON.parse(raw) as PersistedState;
        // Merge: prefer persisted player rows, but only for IDs that exist in incoming list
        const byId = new Map(s.players.map((p) => [p.id, p]));
        setPlayers(initialPlayers.map((p) => byId.get(p.id) ?? p));
        setHistory(s.history ?? []);
        setCurrentIndex(Math.min(s.currentIndex ?? 0, initialPlayers.length - 1));
        setPaused(!!s.paused);
      }
    } catch {}
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auction, initialPlayers.length]);

  // Persist
  useEffect(() => {
    if (!hydrated || typeof window === "undefined") return;
    const data: PersistedState = { players, history, currentIndex, paused };
    localStorage.setItem(KEY(auction), JSON.stringify(data));
  }, [auction, players, history, currentIndex, paused, hydrated]);

  const currentPlayer = players[currentIndex] ?? null;

  const advance = useCallback(() => {
    setCurrentIndex((i) => {
      // find next AVAILABLE player after i
      for (let j = i + 1; j < players.length; j++) {
        if (players[j].status === "AVAILABLE") return j;
      }
      // wrap around to any remaining available
      for (let j = 0; j < players.length; j++) {
        if (players[j].status === "AVAILABLE") return j;
      }
      return Math.min(i + 1, players.length - 1);
    });
  }, [players]);

  const sellPlayer = useCallback(
    (opts: { soldPrice: number; teamName: string; jerseyName: string; jerseyNumber: string; jerseySize: string }) => {
      if (!currentPlayer) return;
      const prev = currentPlayer;
      const record: SaleRecord = {
        playerId: prev.id,
        prevStatus: prev.status, prevSoldPrice: prev.soldPrice, prevTeam: prev.team,
        prevJerseyName: prev.jerseyName, prevJerseyNumber: prev.jerseyNumber, prevJerseySize: prev.jerseySize,
        newStatus: "SOLD", newSoldPrice: opts.soldPrice, newTeam: opts.teamName,
        timestamp: Date.now(),
      };
      setPlayers((ps) => ps.map((p) => p.id === prev.id ? {
        ...p, status: "SOLD", soldPrice: opts.soldPrice, team: opts.teamName,
        jerseyName: opts.jerseyName || p.jerseyName,
        jerseyNumber: opts.jerseyNumber || p.jerseyNumber,
        jerseySize: opts.jerseySize || p.jerseySize,
      } : p));
      setHistory((h) => [...h, record]);
      setTimeout(advance, 0);
    },
    [currentPlayer, advance],
  );

  const markUnsold = useCallback(() => {
    if (!currentPlayer) return;
    const prev = currentPlayer;
    setHistory((h) => [...h, {
      playerId: prev.id,
      prevStatus: prev.status, prevSoldPrice: prev.soldPrice, prevTeam: prev.team,
      prevJerseyName: prev.jerseyName, prevJerseyNumber: prev.jerseyNumber, prevJerseySize: prev.jerseySize,
      newStatus: "UNSOLD", newSoldPrice: null, newTeam: null,
      timestamp: Date.now(),
    }]);
    setPlayers((ps) => ps.map((p) => p.id === prev.id ? { ...p, status: "UNSOLD", soldPrice: null, team: null } : p));
    setTimeout(advance, 0);
  }, [currentPlayer, advance]);

  const undo = useCallback(() => {
    setHistory((h) => {
      if (!h.length) return h;
      const last = h[h.length - 1];
      setPlayers((ps) => ps.map((p) => p.id === last.playerId ? {
        ...p, status: last.prevStatus, soldPrice: last.prevSoldPrice, team: last.prevTeam,
        jerseyName: last.prevJerseyName, jerseyNumber: last.prevJerseyNumber, jerseySize: last.prevJerseySize,
      } : p));
      const idx = players.findIndex((p) => p.id === last.playerId);
      if (idx >= 0) setCurrentIndex(idx);
      return h.slice(0, -1);
    });
  }, [players]);

  const nextPlayer = useCallback(() => advance(), [advance]);

  const goToPlayer = useCallback((id: string) => {
    const idx = players.findIndex((p) => p.id === id);
    if (idx >= 0) setCurrentIndex(idx);
  }, [players]);

  const reset = useCallback(() => {
    setPlayers(initialPlayers.map((p) => ({ ...p, status: "AVAILABLE", soldPrice: null, team: null })));
    setHistory([]);
    setCurrentIndex(0);
  }, [initialPlayers]);

  const teamStats = useMemo(() => {
    const stats = new Map<string, { bought: number; spent: number; players: Player[] }>();
    for (const t of teams) stats.set(t.name, { bought: 0, spent: 0, players: [] });
    for (const p of players) {
      if (p.status === "SOLD" && p.team) {
        const s = stats.get(p.team) ?? { bought: 0, spent: 0, players: [] };
        s.bought += 1; s.spent += p.soldPrice ?? 0; s.players.push(p);
        stats.set(p.team, s);
      }
    }
    return stats;
  }, [players, teams]);

  return {
    players, setPlayers, history, currentIndex, currentPlayer,
    paused, setPaused, teamStats,
    sellPlayer, markUnsold, undo, nextPlayer, goToPlayer, reset,
    exportBackup: () => JSON.stringify({ players, history, currentIndex, paused }, null, 2),
    importBackup: (json: string) => {
      try {
        const s = JSON.parse(json) as PersistedState;
        setPlayers(s.players); setHistory(s.history ?? []);
        setCurrentIndex(s.currentIndex ?? 0); setPaused(!!s.paused);
      } catch { alert("Invalid backup JSON"); }
    },
  };
}
