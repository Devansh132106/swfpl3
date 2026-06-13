import * as XLSX from "xlsx";
import type { Player, Team } from "./types";

export function downloadAuctionResults(
  auctionLabel: string,
  teams: Team[],
  players: Player[],
) {
  const wb = XLSX.utils.book_new();

  for (const team of teams) {
    const teamPlayers = players.filter((p) => p.status === "SOLD" && p.team === team.name);
    const aoa: (string | number)[][] = [
      [`TEAM ${team.name.toUpperCase()}`],
      [`Captain : ${team.captain}`],
      [`Mentor : ${team.mentor}`],
      [],
      ["Player", "Role", "Jersey Name", "Jersey No", "Jersey Size", "Price"],
      ...teamPlayers.map((p) => [
        p.name, p.role, p.jerseyName, p.jerseyNumber, p.jerseySize, p.soldPrice ?? 0,
      ]),
      [],
      [`Total Players : ${teamPlayers.length}`],
      [`Total Amount Spent : ${teamPlayers.reduce((s, p) => s + (p.soldPrice ?? 0), 0)}`],
    ];
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    ws["!cols"] = [{ wch: 24 }, { wch: 14 }, { wch: 18 }, { wch: 10 }, { wch: 12 }, { wch: 12 }];
    const safe = team.name.replace(/[\\/?*[\]:]/g, "").slice(0, 28) || "Team";
    XLSX.utils.book_append_sheet(wb, ws, safe);
  }

  // Unsold sheet
  const unsold = players.filter((p) => p.status === "UNSOLD");
  if (unsold.length) {
    const ws = XLSX.utils.aoa_to_sheet([
      ["UNSOLD PLAYERS"],
      [],
      ["Player", "Role", "Base Price"],
      ...unsold.map((p) => [p.name, p.role, p.basePrice]),
    ]);
    XLSX.utils.book_append_sheet(wb, ws, "Unsold");
  }

  XLSX.writeFile(wb, `${auctionLabel}-auction-results.xlsx`);
}
