import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { L as Link } from "../_libs/tanstack__react-router.mjs";
import { u as useQuery } from "../_libs/tanstack__react-query.mjs";
import { R as Route$1, S as SHEETS, A as AUCTION_META, l as loadPlayers } from "./router-gBAoY8fN.mjs";
import { e as eligibleTeams, G as GROUP_LABELS, g as getAuctionRules, a as getTeamsForAuction, f as findNextInGroup, b as findNextAvailable, c as countAvailableInGroup, d as findFirstInGroup, h as countUnsold, i as findFirstAvailable, v as validateBid } from "./preparePlayers-BEU7JsqS.mjs";
import { u as utils, w as writeFileSync } from "../_libs/xlsx.mjs";
import { e as extractDriveFileId, a as driveImageProxyUrl, d as driveImageDirectUrls } from "./drivePhoto-BlqciLZ2.mjs";
import { F as FloatingParticles } from "./FloatingParticles-BsaonRbR.mjs";
import "../_libs/seroval.mjs";
import { m as motion, A as AnimatePresence } from "../_libs/framer-motion.mjs";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "node:stream";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
import "../_libs/tanstack__query-core.mjs";
import "./server-Bge7SKfi.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "../_libs/zod.mjs";
import "../_libs/motion-dom.mjs";
import "../_libs/motion-utils.mjs";
const KEY = (auction) => `auction-state-v2:${auction}`;
function initialGroup(rules) {
  return rules.groups?.[0] ?? null;
}
function computeTeamStats(players, teams) {
  const stats = /* @__PURE__ */ new Map();
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
function useAuctionState(auction, initialPlayers, teams, rules) {
  const [players, setPlayers] = reactExports.useState(initialPlayers);
  const [history, setHistory] = reactExports.useState([]);
  const [currentIndex, setCurrentIndex] = reactExports.useState(0);
  const [paused, setPaused] = reactExports.useState(false);
  const [activeGroup, setActiveGroup] = reactExports.useState(() => initialGroup(rules));
  const [auctionRound, setAuctionRound] = reactExports.useState(1);
  const [auctionComplete, setAuctionComplete] = reactExports.useState(false);
  const [hydrated, setHydrated] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (typeof window === "undefined") return;
    if (!initialPlayers.length) {
      setHydrated(true);
      return;
    }
    try {
      const raw = localStorage.getItem(KEY(auction));
      if (raw) {
        const s = JSON.parse(raw);
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
  reactExports.useEffect(() => {
    if (!hydrated || typeof window === "undefined") return;
    const data = {
      players,
      history,
      currentIndex,
      paused,
      activeGroup,
      auctionRound,
      auctionComplete
    };
    localStorage.setItem(KEY(auction), JSON.stringify(data));
  }, [auction, players, history, currentIndex, paused, activeGroup, auctionRound, auctionComplete, hydrated]);
  const currentPlayer = players[currentIndex] ?? null;
  const teamStats = reactExports.useMemo(() => computeTeamStats(players, teams), [players, teams]);
  const advanceWithinPhase = reactExports.useCallback(
    (ps, idx, group) => {
      if (group && rules.groups?.includes(group)) {
        const next2 = findNextInGroup(ps, group, idx);
        if (next2 >= 0) return next2;
        return idx;
      }
      const next = findNextAvailable(ps, idx);
      return next >= 0 ? next : idx;
    },
    [rules.groups]
  );
  const tryAdvanceGroupOrReopen = reactExports.useCallback(
    (ps) => {
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
        const reopened = ps.map(
          (p) => p.status === "UNSOLD" ? { ...p, status: "AVAILABLE", soldPrice: null, team: null } : p
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
    [activeGroup, rules]
  );
  const sellPlayer = reactExports.useCallback(
    (opts) => {
      if (!currentPlayer) return "No player selected";
      const team = teams.find((t) => t.name === opts.teamName);
      if (!team) return "Select a team";
      const stats = teamStats.get(team.name) ?? { bought: 0, spent: 0, seniorCount: 0 };
      const err = validateBid(currentPlayer, team, opts.soldPrice, rules, stats);
      if (err) return err;
      const prev = currentPlayer;
      const record = {
        playerId: prev.id,
        prevStatus: prev.status,
        prevSoldPrice: prev.soldPrice,
        prevTeam: prev.team,
        prevJerseyName: prev.jerseyName,
        prevJerseyNumber: prev.jerseyNumber,
        prevJerseySize: prev.jerseySize,
        newStatus: "SOLD",
        newSoldPrice: opts.soldPrice,
        newTeam: opts.teamName,
        timestamp: Date.now()
      };
      setPlayers((ps) => {
        const updated = ps.map((p) => p.id === prev.id ? {
          ...p,
          status: "SOLD",
          soldPrice: opts.soldPrice,
          team: opts.teamName,
          jerseyName: opts.jerseyName || p.jerseyName,
          jerseyNumber: opts.jerseyNumber || p.jerseyNumber,
          jerseySize: opts.jerseySize || p.jerseySize
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
    [currentPlayer, teams, teamStats, rules, activeGroup, advanceWithinPhase, tryAdvanceGroupOrReopen]
  );
  const markUnsold = reactExports.useCallback(() => {
    if (!currentPlayer) return;
    const prev = currentPlayer;
    setHistory((h) => [...h, {
      playerId: prev.id,
      prevStatus: prev.status,
      prevSoldPrice: prev.soldPrice,
      prevTeam: prev.team,
      prevJerseyName: prev.jerseyName,
      prevJerseyNumber: prev.jerseyNumber,
      prevJerseySize: prev.jerseySize,
      newStatus: "UNSOLD",
      newSoldPrice: null,
      newTeam: null,
      timestamp: Date.now()
    }]);
    setPlayers((ps) => {
      const updated = ps.map((p) => p.id === prev.id ? { ...p, status: "UNSOLD", soldPrice: null, team: null } : p);
      const idx = updated.findIndex((p) => p.id === prev.id);
      const nextIdx = advanceWithinPhase(updated, idx, activeGroup);
      setCurrentIndex(nextIdx);
      setTimeout(() => tryAdvanceGroupOrReopen(updated), 0);
      return updated;
    });
  }, [currentPlayer, activeGroup, advanceWithinPhase, tryAdvanceGroupOrReopen]);
  const undo = reactExports.useCallback(() => {
    setHistory((h) => {
      if (!h.length) return h;
      const last = h[h.length - 1];
      setPlayers((ps) => ps.map((p) => p.id === last.playerId ? {
        ...p,
        status: last.prevStatus,
        soldPrice: last.prevSoldPrice,
        team: last.prevTeam,
        jerseyName: last.prevJerseyName,
        jerseyNumber: last.prevJerseyNumber,
        jerseySize: last.prevJerseySize
      } : p));
      const idx = players.findIndex((p) => p.id === last.playerId);
      if (idx >= 0) setCurrentIndex(idx);
      setAuctionComplete(false);
      return h.slice(0, -1);
    });
  }, [players]);
  const nextPlayer = reactExports.useCallback(() => {
    setCurrentIndex((i) => advanceWithinPhase(players, i, activeGroup));
  }, [players, activeGroup, advanceWithinPhase]);
  const goToPlayer = reactExports.useCallback((id) => {
    const idx = players.findIndex((p) => p.id === id);
    if (idx >= 0) setCurrentIndex(idx);
  }, [players]);
  const reset = reactExports.useCallback(() => {
    const fresh = initialPlayers.map((p) => ({ ...p, status: "AVAILABLE", soldPrice: null, team: null }));
    setPlayers(fresh);
    setHistory([]);
    setActiveGroup(initialGroup(rules));
    setAuctionRound(1);
    setAuctionComplete(false);
    setCurrentIndex(findStartIndex(fresh, initialGroup(rules)));
  }, [initialPlayers, rules]);
  const assignLottery = reactExports.useCallback((playerId, teamName) => {
    setPlayers((ps) => ps.map(
      (p) => p.id === playerId ? { ...p, status: "SOLD", soldPrice: 0, team: teamName } : p
    ));
    const remaining = players.filter((p) => p.id !== playerId && p.status === "AVAILABLE");
    if (remaining.length === 0) setAuctionComplete(true);
  }, [players]);
  return {
    players,
    history,
    currentIndex,
    currentPlayer,
    paused,
    setPaused,
    teamStats,
    activeGroup,
    auctionRound,
    auctionComplete,
    sellPlayer,
    markUnsold,
    undo,
    nextPlayer,
    goToPlayer,
    reset,
    assignLottery,
    exportBackup: () => JSON.stringify({
      players,
      history,
      currentIndex,
      paused,
      activeGroup,
      auctionRound,
      auctionComplete
    }, null, 2),
    importBackup: (json) => {
      try {
        const s = JSON.parse(json);
        setPlayers(s.players);
        setHistory(s.history ?? []);
        setCurrentIndex(s.currentIndex ?? 0);
        setPaused(!!s.paused);
        setActiveGroup(s.activeGroup ?? initialGroup(rules));
        setAuctionRound(s.auctionRound ?? 1);
        setAuctionComplete(!!s.auctionComplete);
      } catch {
        alert("Invalid backup JSON");
      }
    }
  };
}
function findStartIndex(players, group) {
  if (group) {
    const idx2 = findFirstInGroup(players, group);
    if (idx2 >= 0) return idx2;
  }
  const idx = findFirstAvailable(players);
  return idx >= 0 ? idx : 0;
}
function downloadAuctionResults(auctionLabel, teams, players) {
  const wb = utils.book_new();
  for (const team of teams) {
    const teamPlayers = players.filter((p) => p.status === "SOLD" && p.team === team.name);
    const aoa = [
      [`TEAM ${team.name.toUpperCase()}`],
      [`Captain : ${team.captain}`],
      [`Mentor : ${team.mentor}`],
      [],
      ["Player", "Role", "Jersey Name", "Jersey No", "Jersey Size", "Price"],
      ...teamPlayers.map((p) => [
        p.name,
        p.role,
        p.jerseyName,
        p.jerseyNumber,
        p.jerseySize,
        p.soldPrice ?? 0
      ]),
      [],
      [`Total Players : ${teamPlayers.length}`],
      [`Total Amount Spent : ${teamPlayers.reduce((s, p) => s + (p.soldPrice ?? 0), 0)}`]
    ];
    const ws = utils.aoa_to_sheet(aoa);
    ws["!cols"] = [{ wch: 24 }, { wch: 14 }, { wch: 18 }, { wch: 10 }, { wch: 12 }, { wch: 12 }];
    const safe = team.name.replace(/[\\/?*[\]:]/g, "").slice(0, 28) || "Team";
    utils.book_append_sheet(wb, ws, safe);
  }
  const unsold = players.filter((p) => p.status === "UNSOLD");
  if (unsold.length) {
    const ws = utils.aoa_to_sheet([
      ["UNSOLD PLAYERS"],
      [],
      ["Player", "Role", "Base Price"],
      ...unsold.map((p) => [p.name, p.role, p.basePrice])
    ]);
    utils.book_append_sheet(wb, ws, "Unsold");
  }
  writeFileSync(wb, `${auctionLabel}-auction-results.xlsx`);
}
function PlayerPhoto({ photoUrl, name, className = "h-full w-full object-cover" }) {
  const fileId = extractDriveFileId(photoUrl);
  const candidates = fileId ? [driveImageProxyUrl(fileId), ...driveImageDirectUrls(fileId)] : photoUrl ? [photoUrl] : [];
  const [index, setIndex] = reactExports.useState(0);
  const src = candidates[index];
  if (!src) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-full w-full place-items-center bg-gradient-to-b from-white/10 to-white/5 text-7xl", children: "⚽" });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "img",
    {
      src,
      alt: name,
      className,
      referrerPolicy: "no-referrer",
      loading: "lazy",
      onError: () => {
        if (index < candidates.length - 1) setIndex((i) => i + 1);
      }
    }
  );
}
const roleColor = {
  Attack: "from-[oklch(0.65_0.24_25)] to-[oklch(0.55_0.22_15)]",
  Midfield: "from-[oklch(0.7_0.2_150)] to-[oklch(0.55_0.2_170)]",
  Defense: "from-[oklch(0.65_0.2_240)] to-[oklch(0.5_0.2_260)]",
  Defence: "from-[oklch(0.65_0.2_240)] to-[oklch(0.5_0.2_260)]",
  Goalkeeper: "from-[oklch(0.78_0.18_90)] to-[oklch(0.65_0.2_70)]"
};
function PlayerPortrait({ player }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative h-full min-h-[320px] lg:min-h-[calc(100vh-12rem)]", children: /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { mode: "wait", children: player ? /* @__PURE__ */ jsxRuntimeExports.jsx(
    motion.div,
    {
      initial: { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.98 },
      transition: { duration: 0.4, type: "spring" },
      className: "flex h-full flex-col overflow-hidden rounded-3xl glass-strong animate-border-glow",
      children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
        motion.div,
        {
          animate: { y: [0, -5, 0] },
          transition: { duration: 4, repeat: Infinity, ease: "easeInOut" },
          className: "relative min-h-0 flex-1 overflow-hidden bg-gradient-to-b from-white/10 to-white/5",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(PlayerPhoto, { photoUrl: player.photoUrl, name: player.name }, player.id),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              "span",
              {
                className: `inline-flex rounded-full bg-gradient-to-r ${roleColor[player.role] ?? roleColor.Midfield} px-3 py-1 text-xs font-bold uppercase tracking-wider shadow-lg`,
                children: player.role
              }
            ) })
          ]
        }
      )
    },
    player.id
  ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-full min-h-[320px] place-items-center rounded-3xl glass-strong p-8 text-center text-muted-foreground", children: "No player to display." }) }) });
}
function PlayerDetailsHeader({ player }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { mode: "wait", children: player ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
    motion.div,
    {
      initial: { opacity: 0, y: 12 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -8 },
      className: "glass-strong rounded-2xl p-5 text-center",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-3xl font-black tracking-wide", children: player.name }),
        player.group && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 inline-block rounded-full bg-[oklch(0.7_0.2_150)]/20 px-3 py-0.5 text-xs font-semibold uppercase tracking-wider text-[oklch(0.85_0.18_150)]", children: GROUP_LABELS[player.group] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 inline-flex items-center gap-4 rounded-full glass px-5 py-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs uppercase tracking-widest text-muted-foreground", children: "Base Price" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-display text-xl font-bold text-[oklch(0.85_0.17_85)]", children: [
            "₹",
            player.basePrice.toLocaleString()
          ] })
        ] }),
        player.status === "SOLD" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded bg-[oklch(0.7_0.2_150)]/20 px-2 py-0.5 text-[oklch(0.85_0.18_150)]", children: "SOLD" }),
          " ",
          "to ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: player.team }),
          " · ₹",
          player.soldPrice?.toLocaleString()
        ] }),
        player.status === "UNSOLD" && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 text-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "rounded bg-destructive/20 px-2 py-0.5 text-destructive", children: "UNSOLD" }) })
      ]
    },
    player.id
  ) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-2xl glass p-6 text-center text-muted-foreground", children: "Select a player" }) });
}
function GroupPhaseBar({
  activeGroup,
  auctionRound,
  auctionComplete,
  remainingInGroup,
  unsoldCount
}) {
  if (!activeGroup) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-strong rounded-2xl px-4 py-3", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase tracking-[0.25em] text-muted-foreground", children: "Current Phase" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-display text-lg font-bold text-[oklch(0.85_0.18_150)]", children: GROUP_LABELS[activeGroup] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-3 text-xs text-muted-foreground", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          "Round ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-foreground", children: auctionRound })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          "Left in group: ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-foreground", children: remainingInGroup })
        ] }),
        unsoldCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
          "Unsold total: ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-destructive", children: unsoldCount })
        ] })
      ] })
    ] }),
    auctionComplete && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 rounded-lg bg-[oklch(0.7_0.2_150)]/20 px-3 py-1.5 text-center text-sm font-semibold text-[oklch(0.85_0.18_150)]", children: "All players sold — auction complete" }),
    !auctionComplete && unsoldCount > 0 && remainingInGroup === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-2 text-xs text-muted-foreground", children: "Unsold players will return in the next round until everyone is sold." })
  ] });
}
const SEGMENT_COLORS = [
  "from-[oklch(0.65_0.24_25)] to-[oklch(0.55_0.22_15)]",
  "from-[oklch(0.7_0.2_150)] to-[oklch(0.55_0.2_170)]",
  "from-[oklch(0.65_0.2_240)] to-[oklch(0.5_0.2_260)]",
  "from-[oklch(0.78_0.18_90)] to-[oklch(0.65_0.2_70)]",
  "from-[oklch(0.72_0.18_340)] to-[oklch(0.62_0.22_310)]",
  "from-[oklch(0.75_0.18_200)] to-[oklch(0.65_0.22_220)]"
];
function LotteryWheel({ players, teams, onAssign }) {
  const remaining = reactExports.useMemo(() => players.filter((p) => p.status === "AVAILABLE"), [players]);
  const [spinning, setSpinning] = reactExports.useState(false);
  const [rotation, setRotation] = reactExports.useState(0);
  const [result, setResult] = reactExports.useState(null);
  const currentPlayer = remaining[0] ?? null;
  const spin = () => {
    if (!currentPlayer || spinning || teams.length === 0) return;
    setSpinning(true);
    setResult(null);
    const teamIndex = Math.floor(Math.random() * teams.length);
    const team = teams[teamIndex];
    const segment = 360 / teams.length;
    const target = 360 * 5 + teamIndex * segment + segment / 2;
    setRotation((r) => r + target);
    setTimeout(() => {
      setSpinning(false);
      setResult({ player: currentPlayer, team });
      onAssign(currentPlayer.id, team.name);
    }, 4200);
  };
  if (!remaining.length) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-strong rounded-3xl p-10 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-2xl font-bold text-[oklch(0.85_0.18_150)]", children: "Lottery Complete" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-muted-foreground", children: "Every player has been assigned to a team." })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-strong rounded-2xl p-4 text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase tracking-widest text-muted-foreground", children: "Next draw" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-display text-2xl font-bold", children: currentPlayer.name }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-sm text-muted-foreground", children: [
        remaining.length,
        " players remaining"
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mx-auto flex max-w-md flex-col items-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -top-2 z-10 text-2xl", children: "▼" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        motion.div,
        {
          animate: { rotate: rotation },
          transition: { duration: spinning ? 4 : 0, ease: [0.2, 0.8, 0.2, 1] },
          className: "relative h-72 w-72 rounded-full border-4 border-white/20 shadow-2xl",
          style: { background: "conic-gradient(from 0deg, oklch(0.5 0.2 150), oklch(0.5 0.2 240), oklch(0.5 0.2 25), oklch(0.5 0.2 90))" },
          children: [
            teams.map((t, i) => {
              const angle = 360 / teams.length * i;
              return /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                {
                  className: "absolute inset-0 flex items-start justify-center pt-6",
                  style: { transform: `rotate(${angle}deg)` },
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "span",
                    {
                      className: `rounded-full bg-gradient-to-r ${SEGMENT_COLORS[i % SEGMENT_COLORS.length]} px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow`,
                      style: { transform: `rotate(${-angle - rotation}deg)` },
                      children: t.name.split(" ")[0]
                    }
                  )
                },
                t.id
              );
            }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 m-auto h-16 w-16 rounded-full glass-strong grid place-items-center font-display text-xs font-bold", children: "SPIN" })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        motion.button,
        {
          whileHover: { scale: 1.03 },
          whileTap: { scale: 0.97 },
          disabled: spinning,
          onClick: spin,
          className: "mt-8 rounded-xl bg-gradient-to-r from-[oklch(0.8_0.16_85)] to-[oklch(0.7_0.18_70)] px-8 py-3 font-display font-bold uppercase tracking-wider text-black disabled:opacity-50",
          children: spinning ? "Spinning…" : "Spin the Wheel"
        }
      )
    ] }),
    result && !spinning && /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.div,
      {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        className: "glass-strong rounded-2xl p-4 text-center",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-display text-lg font-bold", children: result.player.name }),
          " → ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[oklch(0.85_0.18_150)]", children: result.team.name })
        ]
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass rounded-2xl p-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mb-2 text-xs uppercase tracking-widest text-muted-foreground", children: "Assignments" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "max-h-48 space-y-1 overflow-y-auto text-sm", children: players.filter((p) => p.status === "SOLD").map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between rounded-lg bg-white/5 px-3 py-1.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: p.name }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-muted-foreground", children: p.team })
      ] }, p.id)) })
    ] })
  ] });
}
function LiveBar({ player, currentBid }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl glass-strong overflow-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-gradient-to-r from-[oklch(0.3_0.15_150)]/40 via-[oklch(0.25_0.1_250)]/40 to-[oklch(0.3_0.15_280)]/40 px-4 py-2 text-center text-[10px] font-bold uppercase tracking-[0.3em] text-[oklch(0.85_0.18_150)]", children: "● Live · Current Player" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { mode: "wait", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.div,
      {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -10 },
        transition: { duration: 0.35 },
        className: "grid grid-cols-2 gap-3 p-4 md:grid-cols-5",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Cell, { label: "Player", value: player?.name ?? "—", highlight: true }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Cell, { label: "Role", value: player?.role ?? "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Cell, { label: "Base Price", value: player ? `₹${player.basePrice.toLocaleString()}` : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Cell, { label: "Current Bid", value: currentBid ? `₹${currentBid.toLocaleString()}` : "—" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Cell, { label: "Sold To", value: player?.team ?? "—" })
        ]
      },
      player?.id ?? "none"
    ) })
  ] });
}
function Cell({ label, value, highlight }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase tracking-widest text-muted-foreground", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `truncate font-display text-base font-bold ${highlight ? "neon-text text-[oklch(0.9_0.15_150)]" : ""}`, children: value })
  ] });
}
function formatPurse(amount) {
  if (amount >= 1e3) {
    const k = Math.round(amount / 1e3 * 10) / 10;
    const text = Number.isInteger(k) ? String(k) : k.toFixed(1);
    return `₹${text}k`;
  }
  return `₹${amount.toLocaleString()}`;
}
function TeamCard({ team, bought, spent, onClick }) {
  const needMore = Math.max(team.minPlayers - bought, 0);
  const purseLeft = Math.max(team.budget - spent, 0);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    motion.button,
    {
      onClick,
      whileHover: { y: -4, rotateX: 4, rotateY: -2, scale: 1.02 },
      whileTap: { scale: 0.98 },
      style: { transformStyle: "preserve-3d" },
      className: "group relative w-full overflow-hidden rounded-2xl glass p-4 text-left transition-shadow hover:neon-glow",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-br from-[oklch(0.7_0.2_150)]/0 via-transparent to-[oklch(0.5_0.2_280)]/0 opacity-0 transition-opacity group-hover:opacity-30" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex items-start gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-xl border border-white/10 bg-white/5 shadow-inner", children: team.logoUrl ? /* @__PURE__ */ jsxRuntimeExports.jsx(
            "img",
            {
              src: team.logoUrl,
              alt: `${team.name} flag`,
              className: "h-full w-full object-cover",
              loading: "lazy"
            }
          ) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xl", children: "🛡️" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "font-display text-sm font-bold truncate", children: team.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-[11px] text-muted-foreground truncate", children: [
              "C: ",
              team.captain || "—",
              " · M: ",
              team.mentor || "—"
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative mt-3 grid grid-cols-3 gap-1.5 text-center", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Pill, { label: "Slots", value: `${bought}/${team.maxPlayers}` }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Pill, { label: "Need", value: needMore > 0 ? needMore : "✓" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Pill, { label: "Purse", value: formatPurse(purseLeft) })
        ] })
      ]
    }
  );
}
function Pill({ label, value }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-lg bg-white/5 px-1.5 py-1.5", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[9px] uppercase tracking-wider text-muted-foreground", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-xs font-semibold", children: value })
  ] });
}
function TeamModal({ open, team, players, spent, onClose }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: open && team && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.div,
      {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        onClick: onClose,
        className: "fixed inset-0 z-40 bg-black/60 backdrop-blur-md"
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.aside,
      {
        initial: { x: "100%" },
        animate: { x: 0 },
        exit: { x: "100%" },
        transition: { type: "spring", damping: 30, stiffness: 240 },
        className: "fixed right-0 top-0 z-50 flex h-full w-full max-w-xl flex-col glass-strong",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex items-center gap-4 border-b border-white/10 p-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid h-16 w-16 place-items-center overflow-hidden rounded-xl border border-white/10 bg-white/5", children: team.logoUrl ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: team.logoUrl, alt: `${team.name} flag`, className: "h-full w-full object-cover" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-2xl", children: "🛡️" }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-2xl font-bold", children: team.name }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
                "Captain: ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground", children: team.captain }),
                " · Mentor:",
                " ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-foreground", children: team.mentor })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: onClose,
                className: "rounded-md border border-white/10 px-3 py-1.5 text-sm hover:bg-white/10",
                children: "Close"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 overflow-y-auto p-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "mb-3 text-xs uppercase tracking-widest text-muted-foreground", children: "Players Purchased" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-hidden rounded-xl border border-white/10", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-sm", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { className: "bg-white/5 text-xs uppercase tracking-wider text-muted-foreground", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-left", children: "Player" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-left", children: "Role" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-left", children: "Jersey" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-left", children: "No" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-left", children: "Size" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-3 py-2 text-right", children: "Price" })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("tbody", { children: [
                players.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("tr", { children: /* @__PURE__ */ jsxRuntimeExports.jsx("td", { colSpan: 6, className: "px-3 py-6 text-center text-muted-foreground", children: "No players yet." }) }),
                players.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "border-t border-white/5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2 font-medium", children: p.name }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: p.role }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: p.jerseyName }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: p.jerseyNumber }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-3 py-2", children: p.jerseySize }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("td", { className: "px-3 py-2 text-right font-semibold text-[oklch(0.85_0.17_85)]", children: [
                    "₹",
                    (p.soldPrice ?? 0).toLocaleString()
                  ] })
                ] }, p.id))
              ] })
            ] }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("footer", { className: "grid grid-cols-3 gap-2 border-t border-white/10 p-6", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "Total Players", value: players.length }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "Spent", value: `₹${spent.toLocaleString()}` }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Stat, { label: "Purse Left", value: formatPurse(Math.max(team.budget - spent, 0)) })
          ] })
        ]
      }
    )
  ] }) });
}
function Stat({ label, value }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-xl glass p-3 text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase tracking-widest text-muted-foreground", children: label }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-1 font-display text-lg font-bold", children: value })
  ] });
}
function AuctionPage() {
  const {
    type
  } = Route$1.useParams();
  const meta = AUCTION_META[type];
  const playersUrl = SHEETS[meta.sheetKey];
  const teams = getTeamsForAuction(type);
  const rules = getAuctionRules(type);
  const playersQ = useQuery({
    queryKey: ["players", type, "v4"],
    queryFn: () => loadPlayers({
      data: {
        url: playersUrl,
        auctionType: type
      }
    }),
    enabled: !!playersUrl,
    staleTime: 5 * 6e4
  });
  if (!playersUrl) return /* @__PURE__ */ jsxRuntimeExports.jsx(SetupNotice, { missing: meta.sheetKey });
  if (playersQ.isLoading) return /* @__PURE__ */ jsxRuntimeExports.jsx(LoadingScreen, {});
  if (playersQ.error) return /* @__PURE__ */ jsxRuntimeExports.jsx(ErrorScreen, { message: playersQ.error?.message ?? "Failed to load sheet" });
  const players = playersQ.data ?? [];
  if (players.length === 0) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx(EmptyPlayersScreen, { auctionType: type });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(AuctionFloor, { auctionKey: type, label: meta.title, players, teams, rules });
}
function AuctionFloor({
  auctionKey,
  label,
  players: initialPlayers,
  teams,
  rules
}) {
  const state = useAuctionState(auctionKey, initialPlayers, teams, rules);
  const {
    currentPlayer,
    players,
    teamStats,
    paused,
    setPaused,
    activeGroup,
    auctionRound,
    auctionComplete,
    assignLottery
  } = state;
  const [soldPrice, setSoldPrice] = reactExports.useState("");
  const [teamName, setTeamName] = reactExports.useState("");
  const [jName, setJName] = reactExports.useState("");
  const [jNum, setJNum] = reactExports.useState("");
  const [jSize, setJSize] = reactExports.useState("");
  reactExports.useEffect(() => {
    if (!currentPlayer) return;
    setSoldPrice(String(currentPlayer.soldPrice ?? currentPlayer.basePrice ?? rules.basePrice));
    setTeamName(currentPlayer.team ?? "");
    setJName(currentPlayer.jerseyName ?? "");
    setJNum(currentPlayer.jerseyNumber ?? "");
    setJSize(currentPlayer.jerseySize ?? "");
  }, [currentPlayer?.id, rules.basePrice]);
  const [search, setSearch] = reactExports.useState("");
  const [roleFilter, setRoleFilter] = reactExports.useState("All");
  const [statusFilter, setStatusFilter] = reactExports.useState("All");
  const remainingInGroup = reactExports.useMemo(() => {
    if (!activeGroup) return 0;
    return players.filter((p) => p.group === activeGroup && p.status === "AVAILABLE").length;
  }, [players, activeGroup]);
  const unsoldCount = reactExports.useMemo(() => players.filter((p) => p.status === "UNSOLD").length, [players]);
  const bidPrice = Number(soldPrice) || rules.basePrice;
  const eligible = reactExports.useMemo(() => {
    if (!currentPlayer || rules.lotteryMode) return teams;
    return eligibleTeams(currentPlayer, teams, teamStats, rules, bidPrice);
  }, [currentPlayer, teams, teamStats, rules, bidPrice]);
  reactExports.useEffect(() => {
    if (teamName && !eligible.some((t) => t.name === teamName)) setTeamName("");
  }, [eligible, teamName]);
  const filteredPlayers = reactExports.useMemo(() => {
    return players.filter((p) => {
      if (activeGroup && p.group !== activeGroup && statusFilter === "Remaining") return false;
      if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (roleFilter !== "All" && p.role !== roleFilter) return false;
      if (statusFilter === "Remaining" && p.status !== "AVAILABLE") return false;
      if (statusFilter === "Sold" && p.status !== "SOLD") return false;
      if (statusFilter === "Unsold" && p.status !== "UNSOLD") return false;
      return true;
    });
  }, [players, search, roleFilter, statusFilter, activeGroup]);
  const [modalTeam, setModalTeam] = reactExports.useState(null);
  const fileInputRef = reactExports.useRef(null);
  const handleSell = () => {
    if (paused) return alert("Auction is paused");
    const price = Number(soldPrice);
    if (!price || !teamName) return alert("Enter sold price and team");
    const err = state.sellPlayer({
      soldPrice: price,
      teamName,
      jerseyName: jName,
      jerseyNumber: jNum,
      jerseySize: jSize
    });
    if (err) alert(err);
  };
  const handleImport = (file) => {
    const reader = new FileReader();
    reader.onload = () => state.importBackup(String(reader.result));
    reader.readAsText(file);
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "relative min-h-screen overflow-x-hidden stadium-bg", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(FloatingParticles, { count: 12 }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative z-10 mx-auto max-w-[1600px] px-4 py-4 lg:px-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "mb-4 flex flex-wrap items-center justify-between gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", className: "grid h-10 w-10 place-items-center rounded-full glass hover:bg-white/10", children: "←" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] uppercase tracking-[0.3em] text-muted-foreground", children: "Live Auction Floor" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-xl font-black", children: label })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(NeonButton, { onClick: () => setPaused((p) => !p), children: paused ? "▶ Resume" : "⏸ Pause" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(NeonButton, { onClick: () => downloadAuctionResults(auctionKey, teams, players), variant: "gold", children: "⬇ Results" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(NeonButton, { onClick: () => {
            const blob = new Blob([state.exportBackup()], {
              type: "application/json"
            });
            const a = document.createElement("a");
            a.href = URL.createObjectURL(blob);
            a.download = `${auctionKey}-backup-${Date.now()}.json`;
            a.click();
          }, children: "Backup" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(NeonButton, { onClick: () => fileInputRef.current?.click(), children: "Import" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { ref: fileInputRef, type: "file", accept: "application/json", className: "hidden", onChange: (e) => e.target.files?.[0] && handleImport(e.target.files[0]) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(NeonButton, { variant: "danger", onClick: () => {
            if (confirm("Reset entire auction?")) state.reset();
          }, children: "Reset" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(RulesBanner, { rules }),
      activeGroup && !rules.lotteryMode && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(GroupPhaseBar, { activeGroup, auctionRound, auctionComplete, remainingInGroup, unsoldCount }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 grid grid-cols-1 gap-4 xl:grid-cols-3 xl:items-start", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("section", { className: "xl:sticky xl:top-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(PlayerPortrait, { player: currentPlayer }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "space-y-4", children: [
          rules.lotteryMode ? /* @__PURE__ */ jsxRuntimeExports.jsx(LotteryWheel, { players, teams, onAssign: assignLottery }) : /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(PlayerDetailsHeader, { player: currentPlayer }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(LiveBar, { player: currentPlayer, currentBid: Number(soldPrice) || null }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-strong rounded-2xl p-5", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-3 md:grid-cols-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: `Sold Price (min ₹${rules.basePrice.toLocaleString()})`, children: /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "number", value: soldPrice, onChange: (e) => setSoldPrice(e.target.value), placeholder: String(rules.basePrice), min: rules.basePrice, className: "w-full rounded-lg bg-white/5 px-3 py-2 outline-none focus:ring-2 focus:ring-[oklch(0.78_0.22_150)]" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(Field, { label: "Team", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: teamName, onChange: (e) => setTeamName(e.target.value), className: "w-full rounded-lg bg-white/5 px-3 py-2 outline-none focus:ring-2 focus:ring-[oklch(0.78_0.22_150)]", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "Select team…" }),
                    eligible.map((t) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: t.name, children: t.name }, t.id))
                  ] }),
                  currentPlayer && eligible.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-1 text-xs text-destructive", children: "No team can bid on this player at this price." })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Jersey Name", children: /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: jName, onChange: (e) => setJName(e.target.value), className: "w-full rounded-lg bg-white/5 px-3 py-2 outline-none focus:ring-2 focus:ring-[oklch(0.78_0.22_150)]" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Jersey No", children: /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: jNum, onChange: (e) => setJNum(e.target.value), className: "w-full rounded-lg bg-white/5 px-3 py-2 outline-none focus:ring-2 focus:ring-[oklch(0.78_0.22_150)]" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Field, { label: "Jersey Size", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("select", { value: jSize, onChange: (e) => setJSize(e.target.value), className: "w-full rounded-lg bg-white/5 px-3 py-2 outline-none focus:ring-2 focus:ring-[oklch(0.78_0.22_150)]", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "", children: "—" }),
                    ["XS", "S", "M", "L", "XL", "XXL", "XXXL"].map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: s, children: s }, s))
                  ] }) })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-5 grid grid-cols-2 gap-2 md:grid-cols-4", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(NeonButton, { onClick: handleSell, variant: "success", big: true, disabled: auctionComplete, children: "Sell Player" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(NeonButton, { onClick: state.markUnsold, variant: "danger", big: true, disabled: auctionComplete, children: "Unsold" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(NeonButton, { onClick: state.nextPlayer, big: true, children: "Next Player" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(NeonButton, { onClick: state.undo, variant: "ghost", big: true, children: "↺ Undo" })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass rounded-2xl p-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("input", { value: search, onChange: (e) => setSearch(e.target.value), placeholder: "Search player…", className: "flex-1 min-w-[160px] rounded-lg bg-white/5 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[oklch(0.78_0.22_150)]" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("select", { value: roleFilter, onChange: (e) => setRoleFilter(e.target.value), className: "rounded-lg bg-white/5 px-3 py-2 text-sm outline-none", children: ["All", "Attack", "Midfield", "Defense", "Defence", "Goalkeeper", "Goal Keeper"].map((r) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: r, children: r }, r)) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("select", { value: statusFilter, onChange: (e) => setStatusFilter(e.target.value), className: "rounded-lg bg-white/5 px-3 py-2 text-sm outline-none", children: ["All", "Remaining", "Sold", "Unsold"].map((s) => /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: s, children: s }, s)) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 max-h-64 overflow-y-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 gap-1.5 md:grid-cols-2", children: [
              filteredPlayers.map((p) => /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => state.goToPlayer(p.id), className: `flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${p.id === currentPlayer?.id ? "bg-[oklch(0.78_0.22_150)]/20 ring-1 ring-[oklch(0.78_0.22_150)]" : "bg-white/5 hover:bg-white/10"}`, children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "truncate", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-medium", children: p.name }),
                  " ",
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
                    "· ",
                    p.role
                  ] }),
                  p.group && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "ml-1 text-[9px] uppercase text-[oklch(0.75_0.15_150)]", children: GROUP_LABELS[p.group]?.replace("Group ", "") ?? p.group })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(StatusChip, { status: p.status })
              ] }, p.id)),
              filteredPlayers.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "col-span-full py-6 text-center text-sm text-muted-foreground", children: "No players match." })
            ] }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "xl:sticky xl:top-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-3 flex items-center justify-between", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "font-display text-lg font-bold", children: "Teams" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-muted-foreground", children: [
              teams.length,
              " squads"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { layout: true, className: "grid max-h-[calc(100vh-10rem)] grid-cols-1 gap-3 overflow-y-auto pr-1 sm:grid-cols-2 xl:grid-cols-1", children: teams.map((t) => {
            const s = teamStats.get(t.name) ?? {
              bought: 0,
              spent: 0
            };
            return /* @__PURE__ */ jsxRuntimeExports.jsx(TeamCard, { team: t, bought: s.bought, spent: s.spent, onClick: () => setModalTeam(t) }, t.id);
          }) })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(TeamModal, { open: !!modalTeam, team: modalTeam, players: modalTeam ? teamStats.get(modalTeam.name)?.players ?? [] : [], spent: modalTeam ? teamStats.get(modalTeam.name)?.spent ?? 0 : 0, onClose: () => setModalTeam(null) }),
    paused && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pointer-events-none fixed inset-x-0 top-4 z-30 flex justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "rounded-full bg-destructive/80 px-4 py-1.5 text-xs font-bold uppercase tracking-widest backdrop-blur", children: "⏸ Auction Paused" }) })
  ] });
}
function RulesBanner({
  rules
}) {
  if (rules.lotteryMode) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass rounded-xl px-4 py-2 text-xs text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-foreground", children: "Lottery mode" }),
      " — players are randomly assigned to teams via the wheel."
    ] });
  }
  const playerRange = rules.minPlayers === rules.maxPlayers ? `${rules.maxPlayers} players` : `${rules.minPlayers}–${rules.maxPlayers} players`;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass rounded-xl px-4 py-2 text-xs text-muted-foreground", children: [
    "Min bid ",
    /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { className: "text-foreground", children: [
      "₹",
      rules.basePrice.toLocaleString()
    ] }),
    " · ",
    "Budget ",
    /* @__PURE__ */ jsxRuntimeExports.jsxs("strong", { className: "text-foreground", children: [
      "₹",
      rules.budget.toLocaleString()
    ] }),
    " · ",
    "Pick ",
    /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { className: "text-foreground", children: playerRange }),
    rules.reopenUnsold && " · Unsold players re-auctioned until all sold"
  ] });
}
function Field({
  label,
  children
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "block", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "mb-1 block text-[10px] uppercase tracking-widest text-muted-foreground", children: label }),
    children
  ] });
}
function StatusChip({
  status
}) {
  const map = {
    SOLD: "bg-[oklch(0.7_0.2_150)]/20 text-[oklch(0.85_0.18_150)]",
    UNSOLD: "bg-destructive/20 text-destructive",
    AVAILABLE: "bg-white/10 text-muted-foreground"
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold ${map[status] ?? map.AVAILABLE}`, children: status });
}
function NeonButton({
  children,
  onClick,
  variant = "primary",
  big,
  disabled
}) {
  const styles = {
    primary: "bg-gradient-to-r from-[oklch(0.5_0.15_220)] to-[oklch(0.45_0.15_260)] text-white hover:shadow-[0_0_24px_oklch(0.6_0.2_240/0.6)]",
    success: "bg-gradient-to-r from-[oklch(0.65_0.2_150)] to-[oklch(0.55_0.22_165)] text-white hover:shadow-[0_0_24px_oklch(0.7_0.22_150/0.7)]",
    danger: "bg-gradient-to-r from-[oklch(0.6_0.22_25)] to-[oklch(0.5_0.22_15)] text-white hover:shadow-[0_0_24px_oklch(0.65_0.24_25/0.6)]",
    gold: "bg-gradient-to-r from-[oklch(0.8_0.16_85)] to-[oklch(0.7_0.18_70)] text-black hover:shadow-[0_0_24px_oklch(0.85_0.17_85/0.7)]",
    ghost: "bg-white/5 hover:bg-white/10 text-foreground border border-white/10"
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(motion.button, { whileHover: disabled ? void 0 : {
    y: -2
  }, whileTap: disabled ? void 0 : {
    scale: 0.96
  }, onClick, disabled, className: `rounded-xl font-semibold uppercase tracking-wider transition-shadow disabled:opacity-40 disabled:cursor-not-allowed ${styles[variant]} ${big ? "px-4 py-3 text-sm" : "px-3 py-2 text-xs"}`, children });
}
function LoadingScreen() {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid min-h-screen place-items-center stadium-bg", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-strong rounded-2xl p-10 text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-[oklch(0.78_0.22_150)]" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-display uppercase tracking-widest", children: "Loading draft floor…" })
  ] }) });
}
function ErrorScreen({
  message
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid min-h-screen place-items-center stadium-bg p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-strong max-w-md rounded-2xl p-8 text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-bold", children: "Couldn't load data" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: message }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-3 text-xs text-muted-foreground", children: 'Make sure your Google Sheets are shared as "Anyone with link · Viewer" or published to web.' }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", className: "mt-4 inline-block rounded bg-primary px-4 py-2 text-primary-foreground", children: "Home" })
  ] }) });
}
function EmptyPlayersScreen({
  auctionType
}) {
  const clearCache = () => {
    localStorage.removeItem(`auction-state-v2:${auctionType}`);
    window.location.reload();
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid min-h-screen place-items-center stadium-bg p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-strong max-w-md rounded-2xl p-8 text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl font-bold", children: "No players found" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-2 text-sm text-muted-foreground", children: [
      "The Google Sheet loaded but no player rows were parsed. Check that row 1 uses",
      /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "mx-1 rounded bg-white/10 px-1", children: "Player Name" }),
      " as the name column, and the sheet is shared publicly."
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: clearCache, className: "mt-4 rounded bg-primary px-4 py-2 text-primary-foreground", children: "Clear cache & reload" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", className: "mt-3 block text-sm text-muted-foreground underline", children: "Back home" })
  ] }) });
}
function SetupNotice({
  missing
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid min-h-screen place-items-center stadium-bg p-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-strong max-w-xl rounded-2xl p-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "font-display text-2xl font-bold", children: "Configure Google Sheets" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-3 text-sm text-muted-foreground", children: [
      "The ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "rounded bg-white/10 px-1.5 py-0.5", children: missing }),
      " sheet URL is empty. Open ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("code", { className: "rounded bg-white/10 px-1.5 py-0.5", children: "src/config/sheets.ts" }),
      " and paste the Google Sheet links there. Use either the normal sheet URL (with ",
      /* @__PURE__ */ jsxRuntimeExports.jsx("code", { children: "?gid=" }),
      ') or a "Publish to web → CSV" link.'
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("pre", { className: "mt-4 overflow-x-auto rounded-lg bg-black/40 p-3 text-xs", children: `export const SHEETS = {
  openPlayers:    "https://docs.google.com/...gid=0",
  veteranPlayers: "https://docs.google.com/...gid=1",
  femalePlayers:  "https://docs.google.com/...gid=2",
}` }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", className: "mt-5 inline-block rounded bg-primary px-4 py-2 text-primary-foreground", children: "Back home" })
  ] }) });
}
export {
  AuctionPage as component
};
