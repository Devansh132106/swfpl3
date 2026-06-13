import Papa from "papaparse";
import type { Player } from "./types";

function toCsvUrl(url: string): string {
  if (!url) return "";
  // Already a CSV-export URL
  if (url.includes("output=csv") || url.includes("tqx=out:csv")) return url;
  // Convert /edit?...#gid=N or /edit?gid=N to gviz CSV
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

export async function fetchPlayers(url: string): Promise<Player[]> {
  const rows = await fetchCsv(url);
  return rows
    .map((r, i): Player => {
      const name = str(r["name"]);
      const sold = num(r["sold price"]);
      const statusRaw = str(r["status"]).toUpperCase();
      return {
        id: `${name}-${i}`,
        name,
        role: str(r["role"]) || "Midfield",
        basePrice: num(r["base price"]),
        photoUrl: str(r["photo url"]) || str(r["photo"]),
        jerseyName: str(r["jersey name"]),
        jerseyNumber: str(r["jersey number"]),
        jerseySize: str(r["jersey size"]),
        status: statusRaw || "AVAILABLE",
        soldPrice: sold || null,
        team: str(r["team"]) || null,
      };
    })
    .filter((p) => p.name);
}
