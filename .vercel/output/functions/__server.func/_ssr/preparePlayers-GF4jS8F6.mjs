const SENIOR_PLAYER_NAMES = [
  "Subho",
  "Joydip Basak",
  "Rajroop Ghoshal",
  "Puspendu Karmakar",
  "Anandarup",
  "Prosenjit Saha",
  "SWARUP MOZUMDER",
  "Debopratim Das"
];
const LAKH = 1e5;
const AUCTION_RULES = {
  open: {
    basePrice: 5e3,
    budget: LAKH,
    minPlayers: 5,
    maxPlayers: 6,
    reopenUnsold: true,
    groups: ["goalkeeper", "player", "senior"]
  },
  veteran: {
    basePrice: 5e3,
    budget: LAKH,
    minPlayers: 5,
    maxPlayers: 6,
    reopenUnsold: true
  },
  female: {
    basePrice: 0,
    budget: LAKH,
    minPlayers: 5,
    maxPlayers: 6,
    reopenUnsold: false,
    lotteryMode: true
  },
  "kids-u14": {
    basePrice: 5e3,
    budget: LAKH,
    minPlayers: 4,
    maxPlayers: 5,
    reopenUnsold: true,
    maxTeamsAtMaxSize: 2
  },
  "kids-u11": {
    basePrice: 0,
    budget: LAKH,
    minPlayers: 4,
    maxPlayers: 5,
    reopenUnsold: false,
    lotteryMode: true,
    maxTeamsAtMaxSize: 1
  }
};
function getAuctionRules(type) {
  return AUCTION_RULES[type];
}
const GROUP_LABELS = {
  goalkeeper: "Group Goalkeeper",
  player: "Group Player",
  senior: "Group Senior"
};
function flagUrl(countryCode) {
  return `https://flagcdn.com/w80/${countryCode}.png`;
}
function countryTeam(id, name, captain, mentor, countryCode, extra) {
  const rules = getAuctionRules("open");
  return {
    id,
    name,
    captain,
    mentor,
    minPlayers: rules.minPlayers,
    maxPlayers: rules.maxPlayers,
    logoUrl: flagUrl(countryCode),
    budget: rules.budget,
    maxSeniorPlayers: 1,
    ...extra
  };
}
function simpleTeam(id, name, type) {
  const rules = getAuctionRules(type);
  return {
    id,
    name,
    captain: "",
    mentor: "",
    minPlayers: rules.minPlayers,
    maxPlayers: rules.maxPlayers,
    logoUrl: "",
    budget: rules.budget
  };
}
function captainTeam(id, captain, type) {
  const rules = getAuctionRules(type);
  return {
    id,
    name: captain,
    captain,
    mentor: "",
    minPlayers: rules.minPlayers,
    maxPlayers: rules.maxPlayers,
    logoUrl: "",
    budget: rules.budget
  };
}
const TEAMS_BY_AUCTION = {
  open: [
    countryTeam("spain", "Spain", "Ishayu Bose", "Abhinav Mangrati", "es"),
    countryTeam("brazil", "Brazil", "Siddhant Singh", "Siddhartha Ghosh", "br"),
    countryTeam("france", "France", "Priyangshu Karmakar", "Krishnendu hazra", "fr"),
    countryTeam("argentina", "Argentina", "Subham saroj", "Shourya Shikhar Singh", "ar"),
    countryTeam("portugal", "Portugal", "Praadyun dasgupta", "Krish", "pt"),
    countryTeam("netherlands", "Netherlands", "Ronit Das", "Abir Roy", "nl", {
      cannotBidGoalkeepers: true
    }),
    countryTeam("germany", "Germany", "Piyush Kumar", "Jonty", "de"),
    countryTeam("england", "England", "Ojas Tiwari", "Aniruddha", "gb-eng")
  ],
  veteran: [
    captainTeam("swarup", "SWARUP MOZUMDER", "veteran"),
    captainTeam("nimish", "Nimish Mishra", "veteran"),
    captainTeam("chiradip", "Chiradip", "veteran")
  ],
  female: [
    simpleTeam("team1", "Team 1", "female"),
    simpleTeam("team2", "Team 2", "female")
  ],
  "kids-u14": [
    captainTeam("priyanshu", "Priyanshu", "kids-u14"),
    captainTeam("adarsh", "Adarsh", "kids-u14"),
    captainTeam("bhaswar", "Bhaswar Bhowmik", "kids-u14")
  ],
  "kids-u11": [
    captainTeam("aritro", "Aritro Chowdhury", "kids-u11"),
    captainTeam("aarav", "Aarav Banerjee", "kids-u11"),
    captainTeam("atiksh", "ATIKSH SAHA", "kids-u11")
  ]
};
function getTeamsForAuction(type) {
  return TEAMS_BY_AUCTION[type] ?? [];
}
function normalizePersonName(name) {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}
function isGoalkeeperRole(role) {
  return /^goal\s*keeper$/i.test(role.trim());
}
function isSeniorPlayer(name) {
  const n = normalizePersonName(name);
  return SENIOR_PLAYER_NAMES.some((s) => normalizePersonName(s) === n);
}
function assignPlayerGroup(player) {
  if (isGoalkeeperRole(player.role)) return "goalkeeper";
  if (isSeniorPlayer(player.name)) return "senior";
  return "player";
}
function isPlayerGoalkeeper(player) {
  return player.group === "goalkeeper" || isGoalkeeperRole(player.role);
}
function emptyStats() {
  return { bought: 0, spent: 0, seniorCount: 0, goalkeeperCount: 0, players: [] };
}
function effectiveMaxPlayers(team, teams, teamStats, rules) {
  if (!rules.maxTeamsAtMaxSize) return team.maxPlayers;
  const bought = teamStats.get(team.name)?.bought ?? 0;
  if (bought >= team.maxPlayers) return team.maxPlayers;
  const teamsAtFullMax = teams.filter(
    (t) => t.name !== team.name && (teamStats.get(t.name)?.bought ?? 0) >= team.maxPlayers
  ).length;
  if (teamsAtFullMax >= rules.maxTeamsAtMaxSize) return team.maxPlayers - 1;
  return team.maxPlayers;
}
function validateBid(player, team, price, rules, stats, allTeams = [team], allStats = /* @__PURE__ */ new Map([[team.name, stats]])) {
  if (price < rules.basePrice) {
    return `Minimum bid is ₹${rules.basePrice.toLocaleString()}`;
  }
  if (stats.spent + price > team.budget) {
    return `${team.name} only has ₹${(team.budget - stats.spent).toLocaleString()} left`;
  }
  const cap = effectiveMaxPlayers(team, allTeams, allStats, rules);
  if (stats.bought >= cap) {
    if (cap < team.maxPlayers && rules.maxTeamsAtMaxSize) {
      return `${team.name} is capped at ${cap} players — only ${rules.maxTeamsAtMaxSize} team(s) can have ${team.maxPlayers}`;
    }
    return `${team.name} already has ${cap} players (max)`;
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
function eligibleTeams(player, teams, teamStats, rules, price) {
  return teams.filter((t) => {
    const stats = teamStats.get(t.name) ?? emptyStats();
    return validateBid(player, t, price, rules, stats, teams, teamStats) === null;
  });
}
function eligibleLotteryTeams(teams, teamStats, rules) {
  return teams.filter((t) => {
    const stats = teamStats.get(t.name) ?? emptyStats();
    return stats.bought < effectiveMaxPlayers(t, teams, teamStats, rules);
  });
}
function excludedNames(teams) {
  const out = /* @__PURE__ */ new Set();
  for (const t of teams) {
    if (t.captain) out.add(normalizePersonName(t.captain));
    if (t.mentor) out.add(normalizePersonName(t.mentor));
  }
  return out;
}
const GROUP_ORDER = {
  goalkeeper: 0,
  player: 1,
  senior: 2
};
const ROLE_ORDER = {
  goalkeeper: 0,
  attack: 1,
  midfield: 2,
  defense: 3,
  defence: 3
};
function roleSortKey(role) {
  return ROLE_ORDER[role.trim().toLowerCase()] ?? 99;
}
function preparePlayers(players, teams, rules, assignGroups = !!rules.groups?.length) {
  const skip = excludedNames(teams);
  const filtered = players.filter((p) => !skip.has(normalizePersonName(p.name)));
  const withMeta = filtered.map((p) => ({
    ...p,
    basePrice: rules.basePrice,
    group: assignGroups ? assignPlayerGroup(p) : p.group
  }));
  return [...withMeta].sort((a, b) => {
    if (a.group && b.group && a.group !== b.group) {
      return GROUP_ORDER[a.group] - GROUP_ORDER[b.group];
    }
    const byRole = roleSortKey(a.role) - roleSortKey(b.role);
    if (byRole !== 0) return byRole;
    return a.name.localeCompare(b.name, void 0, { sensitivity: "base" });
  });
}
function countUnsold(players) {
  return players.filter((p) => p.status === "UNSOLD").length;
}
function findNextInGroup(players, group, afterIndex) {
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
function findFirstInGroup(players, group) {
  return players.findIndex((p) => p.group === group && p.status === "AVAILABLE");
}
function findNextAvailable(players, afterIndex) {
  for (let j = afterIndex + 1; j < players.length; j++) {
    if (players[j].status === "AVAILABLE") return j;
  }
  for (let j = 0; j < players.length; j++) {
    if (players[j].status === "AVAILABLE") return j;
  }
  return -1;
}
function findFirstAvailable(players) {
  return players.findIndex((p) => p.status === "AVAILABLE");
}
function resolveNextIndex(players, afterIndex, activeGroup, rules) {
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
    const reopened = players.map(
      (p) => p.status === "UNSOLD" ? { ...p, status: "AVAILABLE", soldPrice: null, team: null } : p
    );
    const firstGroup = rules.groups?.[0] ?? null;
    const first = firstGroup ? findFirstInGroup(reopened, firstGroup) : findFirstAvailable(reopened);
    return { index: first >= 0 ? first : afterIndex, activeGroup: firstGroup, reopen: reopened };
  }
  const allDone = !players.some((p) => p.status === "AVAILABLE") && unsold === 0;
  return { index: afterIndex, activeGroup, complete: allDone };
}
export {
  GROUP_LABELS as G,
  getTeamsForAuction as a,
  effectiveMaxPlayers as b,
  eligibleLotteryTeams as c,
  findFirstAvailable as d,
  eligibleTeams as e,
  findFirstInGroup as f,
  getAuctionRules as g,
  preparePlayers as p,
  resolveNextIndex as r,
  validateBid as v
};
