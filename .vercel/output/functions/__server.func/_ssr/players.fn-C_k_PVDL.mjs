import { T as TSS_SERVER_FUNCTION, c as createServerFn } from "./server-CzT3Q6f0.mjs";
import { g as getTeamsForAuction } from "./teams-BDuzl9NL.mjs";
import { P as Papa } from "../_libs/papaparse.mjs";
import { n as normalizePhotoUrl } from "./drivePhoto-BlqciLZ2.mjs";
import "../_libs/seroval.mjs";
import "../_libs/react.mjs";
import { o as objectType, s as stringType } from "../_libs/zod.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "node:stream";
import "../_libs/tanstack__router-core.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "../_libs/tanstack__react-router.mjs";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "../_libs/isbot.mjs";
var createServerRpc = (serverFnMeta, splitImportFn) => {
  const url = "/_serverFn/" + serverFnMeta.id;
  return Object.assign(splitImportFn, {
    url,
    serverFnMeta,
    [TSS_SERVER_FUNCTION]: true
  });
};
const AUCTION_RULES = {
  open: { basePrice: 500 }
};
function getAuctionRules(type) {
  return AUCTION_RULES[type] ?? {};
}
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
function normalizePersonName(name) {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}
function excludedNames(teams) {
  const out = /* @__PURE__ */ new Set();
  for (const t of teams) {
    if (t.captain) out.add(normalizePersonName(t.captain));
    if (t.mentor) out.add(normalizePersonName(t.mentor));
  }
  return out;
}
function preparePlayers(players, teams, options = {}) {
  const skip = excludedNames(teams);
  const filtered = players.filter((p) => !skip.has(normalizePersonName(p.name)));
  const withPricing = options.basePrice != null ? filtered.map((p) => ({ ...p, basePrice: options.basePrice })) : filtered;
  return [...withPricing].sort((a, b) => {
    const byRole = roleSortKey(a.role) - roleSortKey(b.role);
    if (byRole !== 0) return byRole;
    return a.name.localeCompare(b.name, void 0, { sensitivity: "base" });
  });
}
function toCsvUrl(url) {
  if (!url) return "";
  if (url.includes("output=csv") || url.includes("tqx=out:csv")) return url;
  const idMatch = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (!idMatch) return url;
  const id = idMatch[1];
  const gidMatch = url.match(/[#?&]gid=(\d+)/);
  const gid = gidMatch ? gidMatch[1] : "0";
  return `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:csv&gid=${gid}`;
}
async function fetchCsv(url) {
  if (!url) return [];
  const res = await fetch(toCsvUrl(url));
  if (!res.ok) throw new Error(`Failed to load sheet (${res.status})`);
  const text = await res.text();
  const parsed = Papa.parse(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim().toLowerCase().replace(/\s+/g, " ")
  });
  return parsed.data;
}
const num = (v) => {
  if (!v) return 0;
  const n = Number(String(v).replace(/[^0-9.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
};
const str = (v) => (v ?? "").toString().trim();
function pick(row, ...keys) {
  for (const key of keys) {
    const v = str(row[key]);
    if (v) return v;
  }
  return "";
}
function normalizeRole(role) {
  const r = role.trim();
  if (!r) return "Midfield";
  if (/^goal\s*keeper$/i.test(r)) return "Goalkeeper";
  if (/^defence$/i.test(r)) return "Defence";
  if (/^defense$/i.test(r)) return "Defense";
  return r;
}
async function fetchPlayers(url) {
  const rows = await fetchCsv(url);
  return rows.map((r, i) => {
    const name = pick(r, "name", "player name", "player");
    const sold = num(pick(r, "sold price", "sold price (₹)", "price sold"));
    const statusRaw = pick(r, "status").toUpperCase();
    const photoRaw = pick(
      r,
      "photo url",
      "photo",
      "player picture",
      "profile picture",
      "picture",
      "image"
    );
    return {
      id: `${name}-${i}`,
      name,
      role: normalizeRole(pick(r, "role", "position")),
      basePrice: num(pick(r, "base price", "base", "starting price", "min price")),
      photoUrl: normalizePhotoUrl(photoRaw),
      jerseyName: pick(r, "jersey name"),
      jerseyNumber: pick(r, "jersey number", "jersey no.", "jersey no", "jersey #"),
      jerseySize: pick(r, "jersey size", "size"),
      status: statusRaw || "AVAILABLE",
      soldPrice: sold || null,
      team: pick(r, "team", "sold to") || null
    };
  }).filter((p) => p.name);
}
const loadPlayers_createServerFn_handler = createServerRpc({
  id: "788cb3f044dc896b914af7d4d5649f1a6496e105be9fe6f6d2c466419caf549f",
  name: "loadPlayers",
  filename: "src/lib/auction/players.fn.ts"
}, (opts) => loadPlayers.__executeServer(opts));
const loadPlayers = createServerFn({
  method: "GET"
}).validator(objectType({
  url: stringType().min(1),
  auctionType: stringType().min(1)
})).handler(loadPlayers_createServerFn_handler, async ({
  data
}) => {
  const auctionType = data.auctionType;
  const raw = await fetchPlayers(data.url);
  const teams = getTeamsForAuction(auctionType);
  const rules = getAuctionRules(auctionType);
  return preparePlayers(raw, teams, rules);
});
export {
  loadPlayers_createServerFn_handler
};
