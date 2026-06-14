import { useCallback, useEffect, useMemo, useState } from "react";
import type { AuctionRules } from "@/config/auctionRules";
import { PLAYER_BASE_PRICE } from "@/config/auctionRules";
import {
  effectiveMaxPlayers,
  findFirstAvailable,
  findFirstInGroup,
  resolveNextIndex,
  validateBid,
} from "./preparePlayers";
import type { Player, PlayerGroup, SaleRecord, Team, TeamStats } from "./types";

const KEY = (auction: string) => `auction-state-v3:${auction}`;

function applyBasePrice(players: Player[], basePrice: number): Player[] {
  return players.map((p) => ({ ...p, basePrice }));
}

function mergeWithCache(initialPlayers: Player[], cached: Player[]): Player[] {
  const byId = new Map(cached.map((p) => [p.id, p]));
  return initialPlayers.map((p) => {
    const saved = byId.get(p.id);
    if (!saved) return p;
    return {
      ...p,
      status: saved.status,
      soldPrice: saved.soldPrice,
      team: saved.team,
      jerseyName: saved.jerseyName || p.jerseyName,
      jerseyNumber: saved.jerseyNumber || p.jerseyNumber,
      jerseySize: saved.jerseySize || p.jerseySize,
    };
  });
}

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
  for (const t of teams) stats.set(t.name, { bought: 0, spent: 0, seniorCount: 0, goalkeeperCount: 0, players: [] });
  for (const p of players) {
    if (p.status === "SOLD" && p.team) {
      const s = stats.get(p.team) ?? { bought: 0, spent: 0, seniorCount: 0, goalkeeperCount: 0, players: [] };
      s.bought += 1;
      s.spent += p.soldPrice ?? 0;
      if (p.group === "senior") s.seniorCount += 1;
      if (p.group === "goalkeeper" || /^goal\s*keeper$/i.test(p.role.trim())) s.goalkeeperCount += 1;
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
  const basePrice = rules.basePrice || PLAYER_BASE_PRICE;
  const pricedInitial = useMemo(
    () => applyBasePrice(initialPlayers, basePrice),
    [initialPlayers, basePrice],
  );

  const [players, setPlayers] = useState<Player[]>(pricedInitial);
  const [history, setHistory] = useState<SaleRecord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [activeGroup, setActiveGroup] = useState<PlayerGroup | null>(() => initialGroup(rules));
  const [auctionRound, setAuctionRound] = useState(1);
  const [auctionComplete, setAuctionComplete] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!pricedInitial.length) {
      setHydrated(true);
      return;
    }
    try {
      const raw = localStorage.getItem(KEY(auction));
      if (raw) {
        const s = JSON.parse(raw) as PersistedState;
        if (s.players.length === 0) {
          setPlayers(pricedInitial);
          setHistory([]);
          setCurrentIndex(findStartIndex(pricedInitial, initialGroup(rules)));
          setActiveGroup(initialGroup(rules));
          setAuctionRound(1);
          setAuctionComplete(false);
        } else {
          const merged = applyBasePrice(mergeWithCache(pricedInitial, s.players), basePrice);
          setPlayers(merged);
          setHistory(s.history ?? []);
          setActiveGroup(s.activeGroup ?? initialGroup(rules));
          setAuctionRound(s.auctionRound ?? 1);
          setAuctionComplete(!!s.auctionComplete);
          setCurrentIndex(Math.min(s.currentIndex ?? 0, Math.max(merged.length - 1, 0)));
        }
      } else {
        setPlayers(pricedInitial);
        setCurrentIndex(findStartIndex(pricedInitial, initialGroup(rules)));
      }
    } catch {
      setPlayers(pricedInitial);
      setCurrentIndex(findStartIndex(pricedInitial, initialGroup(rules)));
    }
    setHydrated(true);
  }, [auction, pricedInitial, rules.groups, basePrice]);

  useEffect(() => {
    setPlayers((ps) => applyBasePrice(ps, basePrice));
  }, [basePrice]);

  useEffect(() => {
    if (!hydrated || typeof window === "undefined") return;
    const data: PersistedState = {
      players, history, currentIndex, paused, activeGroup, auctionRound, auctionComplete,
    };
    localStorage.setItem(KEY(auction), JSON.stringify(data));
  }, [auction, players, history, currentIndex, paused, activeGroup, auctionRound, auctionComplete, hydrated]);

  const currentPlayer = players[currentIndex] ?? null;

  const teamStats = useMemo(() => computeTeamStats(players, teams), [players, teams]);

  const applyAdvance = useCallback(
    (ps: Player[], afterIndex: number) => {
      const result = resolveNextIndex(ps, afterIndex, activeGroup, rules);
      if (result.reopen) {
        setPlayers(result.reopen);
        setAuctionRound((r) => r + 1);
        setActiveGroup(result.activeGroup);
        setCurrentIndex(result.index);
        setAuctionComplete(false);
        return;
      }
      if (result.activeGroup !== activeGroup) setActiveGroup(result.activeGroup);
      setCurrentIndex(result.index);
      if (result.complete) setAuctionComplete(true);
    },
    [activeGroup, rules],
  );

  const sellPlayer = useCallback(
    (opts: { soldPrice: number; teamName: string }) => {
      if (!currentPlayer) return "No player selected";
      const team = teams.find((t) => t.name === opts.teamName);
      if (!team) return "Select a team";
      const stats = teamStats.get(team.name) ?? { bought: 0, spent: 0, seniorCount: 0, goalkeeperCount: 0, players: [] };
      const err = validateBid(currentPlayer, team, opts.soldPrice, rules, stats, teams, teamStats);
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
        } : p);
        const idx = updated.findIndex((p) => p.id === prev.id);
        const result = resolveNextIndex(updated, idx, activeGroup, rules);
        if (result.reopen) {
          setAuctionRound((r) => r + 1);
          setActiveGroup(result.activeGroup);
          setCurrentIndex(result.index);
          setAuctionComplete(false);
          return result.reopen;
        }
        if (result.activeGroup !== activeGroup) setActiveGroup(result.activeGroup);
        setCurrentIndex(result.index);
        if (result.complete) setAuctionComplete(true);
        return updated;
      });
      setHistory((h) => [...h, record]);
      return null;
    },
    [currentPlayer, teams, teamStats, rules, activeGroup],
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
      const result = resolveNextIndex(updated, idx, activeGroup, rules);
      if (result.reopen) {
        setAuctionRound((r) => r + 1);
        setActiveGroup(result.activeGroup);
        setCurrentIndex(result.index);
        setAuctionComplete(false);
        return result.reopen;
      }
      if (result.activeGroup !== activeGroup) setActiveGroup(result.activeGroup);
      setCurrentIndex(result.index);
      if (result.complete) setAuctionComplete(true);
      return updated;
    });
  }, [currentPlayer, activeGroup, rules]);

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
    applyAdvance(players, currentIndex);
  }, [players, currentIndex, applyAdvance]);

  const goToPlayer = useCallback((id: string) => {
    const idx = players.findIndex((p) => p.id === id);
    if (idx >= 0) setCurrentIndex(idx);
  }, [players]);

  const reset = useCallback(() => {
    const fresh = pricedInitial.map((p) => ({ ...p, status: "AVAILABLE" as const, soldPrice: null, team: null }));
    setPlayers(fresh);
    setHistory([]);
    setActiveGroup(initialGroup(rules));
    setAuctionRound(1);
    setAuctionComplete(false);
    setCurrentIndex(findStartIndex(fresh, initialGroup(rules)));
  }, [pricedInitial, rules]);

  const assignLottery = useCallback((playerId: string, teamName: string) => {
    const team = teams.find((t) => t.name === teamName);
    if (!team) return "Invalid team";
    const stats = teamStats.get(team.name) ?? { bought: 0, spent: 0, seniorCount: 0, goalkeeperCount: 0, players: [] };
    const cap = effectiveMaxPlayers(team, teams, teamStats, rules);
    if (stats.bought >= cap) {
      if (cap < team.maxPlayers && rules.maxTeamsAtMaxSize) {
        return `${team.name} is capped at ${cap} players — only ${rules.maxTeamsAtMaxSize} team(s) can have ${team.maxPlayers}`;
      }
      return `${team.name} already has ${cap} players`;
    }

    setPlayers((ps) => {
      const updated = ps.map((p) =>
        p.id === playerId ? { ...p, status: "SOLD" as const, soldPrice: 0, team: teamName } : p,
      );
      const idx = updated.findIndex((p) => p.id === playerId);
      const result = resolveNextIndex(updated, idx, activeGroup, rules);
      if (result.reopen) {
        setAuctionRound((r) => r + 1);
        setActiveGroup(result.activeGroup);
        setCurrentIndex(result.index);
        setAuctionComplete(false);
        return result.reopen;
      }
      setCurrentIndex(result.index);
      if (result.complete) setAuctionComplete(true);
      return updated;
    });
    return null;
  }, [teams, teamStats, activeGroup, rules]);

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
