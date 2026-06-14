import { useCallback, useEffect, useMemo, useState } from "react";
import type { AuctionRules } from "@/config/auctionRules";
import {
  countAvailableInGroup,
  countUnsold,
  findFirstAvailable,
  findFirstInGroup,
  findNextAvailable,
  findNextInGroup,
  validateBid,
} from "./preparePlayers";
import type { Player, PlayerGroup, SaleRecord, Team, TeamStats } from "./types";

const KEY = (auction: string) => `auction-state-v2:${auction}`;

interface PersistedState {
  players: Player[];
  history: SaleRecord[];
  currentIndex: number;
  paused: boolean;
  activeGroup: PlayerGroup | null;
  auctionRound: number;
  auctionComplete: boolean;
}

function initialGroup(rules: AuctionRules): PlayerGroup | null {
  return rules.groups?.[0] ?? null;
}

function computeTeamStats(players: Player[], teams: Team[]): Map<string, TeamStats> {
  const stats = new Map<string, TeamStats>();
  for (const t of teams) stats.set(t.name, { bought: 0, spent: 0, seniorCount: 0, players: [] });
  for (const p of players) {
    if (p.status === "SOLD" && p.team) {
      const s = stats.get(p.team) ?? { bought: 0, spent: 0, seniorCount: 0, players: [] };
      s.bought += 1;
      s.spent += p.soldPrice ?? 0;
      if (p.group === "senior") s.seniorCount += 1;
      s.players.push(p);
      stats.set(p.team, s);
    }
  }
  return stats;
}

export function useAuctionState(
  auction: string,
  initialPlayers: Player[],
  teams: Team[],
  rules: AuctionRules,
) {
  const [players, setPlayers] = useState<Player[]>(initialPlayers);
  const [history, setHistory] = useState<SaleRecord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [activeGroup, setActiveGroup] = useState<PlayerGroup | null>(() => initialGroup(rules));
  const [auctionRound, setAuctionRound] = useState(1);
  const [auctionComplete, setAuctionComplete] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!initialPlayers.length) {
      setHydrated(true);
      return;
    }
    try {
      const raw = localStorage.getItem(KEY(auction));
      if (raw) {
        const s = JSON.parse(raw) as PersistedState;
        if (s.players.length === 0) {
          setPlayers(initialPlayers);
          setHistory([]);
          setCurrentIndex(findStartIndex(initialPlayers, initialGroup(rules)));
          setActiveGroup(initialGroup(rules));
          setAuctionRound(1);
          setAuctionComplete(false);
        } else {
          const byId = new Map(s.players.map((p) => [p.id, p]));
          const merged = initialPlayers.map((p) => byId.get(p.id) ?? p);
          setPlayers(merged);
          setHistory(s.history ?? []);
          setActiveGroup(s.activeGroup ?? initialGroup(rules));
          setAuctionRound(s.auctionRound ?? 1);
          setAuctionComplete(!!s.auctionComplete);
          setCurrentIndex(Math.min(s.currentIndex ?? 0, Math.max(merged.length - 1, 0)));
        }
      } else {
        setPlayers(initialPlayers);
        setCurrentIndex(findStartIndex(initialPlayers, initialGroup(rules)));
      }
    } catch {
      setPlayers(initialPlayers);
      setCurrentIndex(findStartIndex(initialPlayers, initialGroup(rules)));
    }
    setHydrated(true);
  }, [auction, initialPlayers, rules.groups]);

  useEffect(() => {
    if (!hydrated || typeof window === "undefined") return;
    const data: PersistedState = {
      players, history, currentIndex, paused, activeGroup, auctionRound, auctionComplete,
    };
    localStorage.setItem(KEY(auction), JSON.stringify(data));
  }, [auction, players, history, currentIndex, paused, activeGroup, auctionRound, auctionComplete, hydrated]);

  const currentPlayer = players[currentIndex] ?? null;

  const teamStats = useMemo(() => computeTeamStats(players, teams), [players, teams]);

  const advanceWithinPhase = useCallback(
    (ps: Player[], idx: number, group: PlayerGroup | null) => {
      if (group && rules.groups?.includes(group)) {
        const next = findNextInGroup(ps, group, idx);
        if (next >= 0) return next;
        return idx;
      }
      const next = findNextAvailable(ps, idx);
      return next >= 0 ? next : idx;
    },
    [rules.groups],
  );

  const tryAdvanceGroupOrReopen = useCallback(
    (ps: Player[]) => {
      if (rules.groups?.length && activeGroup) {
        const remaining = countAvailableInGroup(ps, activeGroup);
        if (remaining > 0) return;

        const groupIdx = rules.groups.indexOf(activeGroup);
        const nextGroup = rules.groups[groupIdx + 1];
        if (nextGroup) {
          setActiveGroup(nextGroup);
          const first = findFirstInGroup(ps, nextGroup);
          if (first >= 0) setCurrentIndex(first);
          return;
        }
      }

      const unsold = countUnsold(ps);
      if (unsold > 0 && rules.reopenUnsold) {
        const reopened = ps.map((p) =>
          p.status === "UNSOLD" ? { ...p, status: "AVAILABLE" as const, soldPrice: null, team: null } : p,
        );
        setPlayers(reopened);
        setAuctionRound((r) => r + 1);
        const firstGroup = rules.groups?.[0] ?? null;
        setActiveGroup(firstGroup);
        const first = firstGroup ? findFirstInGroup(reopened, firstGroup) : findFirstAvailable(reopened);
        if (first >= 0) setCurrentIndex(first);
        return;
      }

      if (countUnsold(ps) === 0 && !ps.some((p) => p.status === "AVAILABLE")) {
        setAuctionComplete(true);
      }
    },
    [activeGroup, rules],
  );

  const sellPlayer = useCallback(
    (opts: { soldPrice: number; teamName: string; jerseyName: string; jerseyNumber: string; jerseySize: string }) => {
      if (!currentPlayer) return "No player selected";
      const team = teams.find((t) => t.name === opts.teamName);
      if (!team) return "Select a team";
      const stats = teamStats.get(team.name) ?? { bought: 0, spent: 0, seniorCount: 0, players: [] };
      const err = validateBid(currentPlayer, team, opts.soldPrice, rules, stats);
      if (err) return err;

      const prev = currentPlayer;
      const record: SaleRecord = {
        playerId: prev.id,
        prevStatus: prev.status, prevSoldPrice: prev.soldPrice, prevTeam: prev.team,
        prevJerseyName: prev.jerseyName, prevJerseyNumber: prev.jerseyNumber, prevJerseySize: prev.jerseySize,
        newStatus: "SOLD", newSoldPrice: opts.soldPrice, newTeam: opts.teamName,
        timestamp: Date.now(),
      };

      setPlayers((ps) => {
        const updated = ps.map((p) => p.id === prev.id ? {
          ...p, status: "SOLD" as const, soldPrice: opts.soldPrice, team: opts.teamName,
          jerseyName: opts.jerseyName || p.jerseyName,
          jerseyNumber: opts.jerseyNumber || p.jerseyNumber,
          jerseySize: opts.jerseySize || p.jerseySize,
        } : p);
        const idx = updated.findIndex((p) => p.id === prev.id);
        const nextIdx = advanceWithinPhase(updated, idx, activeGroup);
        setCurrentIndex(nextIdx);
        setTimeout(() => tryAdvanceGroupOrReopen(updated), 0);
        return updated;
      });
      setHistory((h) => [...h, record]);
      return null;
    },
    [currentPlayer, teams, teamStats, rules, activeGroup, advanceWithinPhase, tryAdvanceGroupOrReopen],
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
    setPlayers((ps) => {
      const updated = ps.map((p) => p.id === prev.id ? { ...p, status: "UNSOLD" as const, soldPrice: null, team: null } : p);
      const idx = updated.findIndex((p) => p.id === prev.id);
      const nextIdx = advanceWithinPhase(updated, idx, activeGroup);
      setCurrentIndex(nextIdx);
      setTimeout(() => tryAdvanceGroupOrReopen(updated), 0);
      return updated;
    });
  }, [currentPlayer, activeGroup, advanceWithinPhase, tryAdvanceGroupOrReopen]);

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
      setAuctionComplete(false);
      return h.slice(0, -1);
    });
  }, [players]);

  const nextPlayer = useCallback(() => {
    setCurrentIndex((i) => advanceWithinPhase(players, i, activeGroup));
  }, [players, activeGroup, advanceWithinPhase]);

  const goToPlayer = useCallback((id: string) => {
    const idx = players.findIndex((p) => p.id === id);
    if (idx >= 0) setCurrentIndex(idx);
  }, [players]);

  const reset = useCallback(() => {
    const fresh = initialPlayers.map((p) => ({ ...p, status: "AVAILABLE" as const, soldPrice: null, team: null }));
    setPlayers(fresh);
    setHistory([]);
    setActiveGroup(initialGroup(rules));
    setAuctionRound(1);
    setAuctionComplete(false);
    setCurrentIndex(findStartIndex(fresh, initialGroup(rules)));
  }, [initialPlayers, rules]);

  const assignLottery = useCallback((playerId: string, teamName: string) => {
    setPlayers((ps) => ps.map((p) =>
      p.id === playerId ? { ...p, status: "SOLD" as const, soldPrice: 0, team: teamName } : p,
    ));
    const remaining = players.filter((p) => p.id !== playerId && p.status === "AVAILABLE");
    if (remaining.length === 0) setAuctionComplete(true);
  }, [players]);

  return {
    players, history, currentIndex, currentPlayer,
    paused, setPaused, teamStats,
    activeGroup, auctionRound, auctionComplete,
    sellPlayer, markUnsold, undo, nextPlayer, goToPlayer, reset, assignLottery,
    exportBackup: () => JSON.stringify({
      players, history, currentIndex, paused, activeGroup, auctionRound, auctionComplete,
    }, null, 2),
    importBackup: (json: string) => {
      try {
        const s = JSON.parse(json) as PersistedState;
        setPlayers(s.players); setHistory(s.history ?? []);
        setCurrentIndex(s.currentIndex ?? 0); setPaused(!!s.paused);
        setActiveGroup(s.activeGroup ?? initialGroup(rules));
        setAuctionRound(s.auctionRound ?? 1);
        setAuctionComplete(!!s.auctionComplete);
      } catch { alert("Invalid backup JSON"); }
    },
  };
}

function findStartIndex(players: Player[], group: PlayerGroup | null): number {
  if (group) {
    const idx = findFirstInGroup(players, group);
    if (idx >= 0) return idx;
  }
  const idx = findFirstAvailable(players);
  return idx >= 0 ? idx : 0;
}
