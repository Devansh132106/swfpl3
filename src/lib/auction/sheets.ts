import Papa from "papaparse";
import { normalizePhotoUrl } from "./drivePhoto";
import type { Player } from "./types";

function toCsvUrl(url: string): string {
  if (!url) return "";
  if (url.includes("output=csv") || url.includes("tqx=out:csv")) return url;
  const idMatch = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (!idMatch) return url;
  const id = idMatch[1];
  const gidMatch = url.match(/[#?&]gid=(\d+)/);
  const gid = gidMatch ? gidMatch[1] : "0";
  return `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:csv&gid=${gid}`;
}

async function fetchCsv(url: string): Promise<Record<string, string>[]> {
  if (!url) return [];
  const res = await fetch(toCsvUrl(url));
  if (!res.ok) throw new Error(`Failed to load sheet (${res.status})`);
  const text = await res.text();
  const parsed = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim().toLowerCase().replace(/\s+/g, " "),
  });
  return parsed.data;
}

const num = (v: string | undefined) => {
  if (!v) return 0;
  const n = Number(String(v).replace(/[^0-9.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
};
const str = (v: string | undefined) => (v ?? "").toString().trim();

/** Try multiple normalized header aliases (sheet columns vary by tab). */
function pick(row: Record<string, string>, ...keys: string[]): string {
  for (const key of keys) {
    const v = str(row[key]);
    if (v) return v;
  }
  return "";
}

function normalizeRole(role: string): string {
  const r = role.trim();
  if (!r) return "Midfield";
  if (/^goal\s*keeper$/i.test(r)) return "Goalkeeper";
  if (/^defence$/i.test(r)) return "Defence";
  if (/^defense$/i.test(r)) return "Defense";
  return r;
}

export async function fetchPlayers(url: string): Promise<Player[]> {
  const rows = await fetchCsv(url);
  return rows
    .map((r, i): Player => {
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
        "image",
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
        team: pick(r, "team", "sold to") || null,
      };
    })
    .filter((p) => p.name);
}
