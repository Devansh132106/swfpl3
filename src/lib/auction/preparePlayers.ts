import { SENIOR_PLAYER_NAMES } from "@/config/auctionRules";
import type { Player, PlayerGroup, Team, TeamStats } from "./types";
import type { AuctionRules } from "@/config/auctionRules";

export function normalizePersonName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

export function isGoalkeeperRole(role: string): boolean {
  return /^goal\s*keeper$/i.test(role.trim());
}

export function isSeniorPlayer(name: string): boolean {
  const n = normalizePersonName(name);
  return SENIOR_PLAYER_NAMES.some((s) => normalizePersonName(s) === n);
}

export function assignPlayerGroup(player: Pick<Player, "name" | "role">): PlayerGroup {
  if (isGoalkeeperRole(player.role)) return "goalkeeper";
  if (isSeniorPlayer(player.name)) return "senior";
  return "player";
}

export function isPlayerGoalkeeper(player: Pick<Player, "role" | "group">): boolean {
  return player.group === "goalkeeper" || isGoalkeeperRole(player.role);
}

export function validateBid(
  player: Player,
  team: Team,
  price: number,
  rules: AuctionRules,
  stats: TeamStats,
): string | null {
  if (price < rules.basePrice) {
    return `Minimum bid is ₹${rules.basePrice.toLocaleString()}`;
  }
  if (stats.spent + price > team.budget) {
    return `${team.name} only has ₹${(team.budget - stats.spent).toLocaleString()} left`;
  }
  if (stats.bought >= team.maxPlayers) {
    return `${team.name} already has ${team.maxPlayers} players (max)`;
  }
  if (isPlayerGoalkeeper(player)) {
    if (team.cannotBidGoalkeepers) {
      return `${team.name} cannot bid — captain is the goalkeeper`;
    }
    if (stats.goalkeeperCount >= 1) {
      return `${team.name} already has a goalkeeper (max 1)`;
    }
  }
  const maxSenior = team.maxSeniorPlayers ?? 1;
  if (player.group === "senior" && stats.seniorCount >= maxSenior) {
    return `${team.name} already picked a Group Senior player`;
  }
  return null;
}

function emptyStats(): TeamStats {
  return { bought: 0, spent: 0, seniorCount: 0, goalkeeperCount: 0, players: [] };
}

export function eligibleTeams(
  player: Player,
  teams: Team[],
  teamStats: Map<string, TeamStats>,
  rules: AuctionRules,
  price: number,
): Team[] {
  return teams.filter((t) => {
    const stats = teamStats.get(t.name) ?? emptyStats();
    return validateBid(player, t, price, rules, stats) === null;
  });
}

function excludedNames(teams: Team[]): Set<string> {
  const out = new Set<string>();
  for (const t of teams) {
    if (t.captain) out.add(normalizePersonName(t.captain));
    if (t.mentor) out.add(normalizePersonName(t.mentor));
  }
  return out;
}

const GROUP_ORDER: Record<PlayerGroup, number> = {
  goalkeeper: 0,
  player: 1,
  senior: 2,
};

const ROLE_ORDER: Record<string, number> = {
  goalkeeper: 0,
  attack: 1,
  midfield: 2,
  defense: 3,
  defence: 3,
};

function roleSortKey(role: string): number {
  return ROLE_ORDER[role.trim().toLowerCase()] ?? 99;
}

/** Filter captains/mentors, assign groups, apply pricing, sort for auction. */
export function preparePlayers(
  players: Player[],
  teams: Team[],
  rules: AuctionRules,
  assignGroups = !!rules.groups?.length,
): Player[] {
  const skip = excludedNames(teams);

  const filtered = players.filter((p) => !skip.has(normalizePersonName(p.name)));

  const withMeta = filtered.map((p) => ({
    ...p,
    basePrice: rules.basePrice,
    group: assignGroups ? assignPlayerGroup(p) : p.group,
  }));

  return [...withMeta].sort((a, b) => {
    if (a.group && b.group && a.group !== b.group) {
      return GROUP_ORDER[a.group] - GROUP_ORDER[b.group];
    }
    const byRole = roleSortKey(a.role) - roleSortKey(b.role);
    if (byRole !== 0) return byRole;
    return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
  });
}

export function countUnsold(players: Player[]): number {
  return players.filter((p) => p.status === "UNSOLD").length;
}

export function countAvailableInGroup(players: Player[], group: PlayerGroup): number {
  return players.filter((p) => p.group === group && p.status === "AVAILABLE").length;
}

export function findNextInGroup(players: Player[], group: PlayerGroup, afterIndex: number): number {
  for (let j = afterIndex + 1; j < players.length; j++) {
    const p = players[j];
    if (p.group === group && p.status === "AVAILABLE") return j;
  }
  for (let j = 0; j < players.length; j++) {
    const p = players[j];
    if (p.group === group && p.status === "AVAILABLE") return j;
  }
  return -1;
}

export function findFirstInGroup(players: Player[], group: PlayerGroup): number {
  return players.findIndex((p) => p.group === group && p.status === "AVAILABLE");
}

export function findNextAvailable(players: Player[], afterIndex: number): number {
  for (let j = afterIndex + 1; j < players.length; j++) {
    if (players[j].status === "AVAILABLE") return j;
  }
  for (let j = 0; j < players.length; j++) {
    if (players[j].status === "AVAILABLE") return j;
  }
  return -1;
}

export function findFirstAvailable(players: Player[]): number {
  return players.findIndex((p) => p.status === "AVAILABLE");
}

/** Next player index after a sale/unsold — respects group phases, then reopens unsold. */
export function resolveNextIndex(
  players: Player[],
  afterIndex: number,
  activeGroup: PlayerGroup | null,
  rules: AuctionRules,
): { index: number; activeGroup: PlayerGroup | null; reopen?: Player[]; complete?: boolean } {
  if (activeGroup && rules.groups?.includes(activeGroup)) {
    const nextInGroup = findNextInGroup(players, activeGroup, afterIndex);
    if (nextInGroup >= 0) return { index: nextInGroup, activeGroup };

    const groupIdx = rules.groups.indexOf(activeGroup);
    for (let g = groupIdx + 1; g < rules.groups.length; g++) {
      const first = findFirstInGroup(players, rules.groups[g]);
      if (first >= 0) return { index: first, activeGroup: rules.groups[g] };
    }
  } else {
    const next = findNextAvailable(players, afterIndex);
    if (next >= 0) return { index: next, activeGroup };
  }

  const unsold = countUnsold(players);
  if (unsold > 0 && rules.reopenUnsold) {
    const reopened = players.map((p) =>
      p.status === "UNSOLD" ? { ...p, status: "AVAILABLE" as const, soldPrice: null, team: null } : p,
    );
    const firstGroup = rules.groups?.[0] ?? null;
    const first = firstGroup ? findFirstInGroup(reopened, firstGroup) : findFirstAvailable(reopened);
    return { index: first >= 0 ? first : afterIndex, activeGroup: firstGroup, reopen: reopened };
  }

  const allDone = !players.some((p) => p.status === "AVAILABLE") && unsold === 0;
  return { index: afterIndex, activeGroup, complete: allDone };
}
