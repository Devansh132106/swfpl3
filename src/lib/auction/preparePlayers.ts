import type { Player, Team } from "./types";

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

function normalizePersonName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

function excludedNames(teams: Team[]): Set<string> {
  const out = new Set<string>();
  for (const t of teams) {
    if (t.captain) out.add(normalizePersonName(t.captain));
    if (t.mentor) out.add(normalizePersonName(t.mentor));
  }
  return out;
}

export interface PreparePlayersOptions {
  basePrice?: number;
}

/** Filter captains/mentors, apply base price, sort by role (GK → Attack → Midfield → Defense). */
export function preparePlayers(
  players: Player[],
  teams: Team[],
  options: PreparePlayersOptions = {},
): Player[] {
  const skip = excludedNames(teams);

  const filtered = players.filter((p) => !skip.has(normalizePersonName(p.name)));

  const withPricing = options.basePrice != null
    ? filtered.map((p) => ({ ...p, basePrice: options.basePrice! }))
    : filtered;

  return [...withPricing].sort((a, b) => {
    const byRole = roleSortKey(a.role) - roleSortKey(b.role);
    if (byRole !== 0) return byRole;
    return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
  });
}
