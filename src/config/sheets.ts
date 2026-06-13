// Permanent Google Sheet URLs. Admin fills these once.
// Use the "Publish to web" CSV URL for each sheet/tab, e.g.:
//   https://docs.google.com/spreadsheets/d/<ID>/gviz/tq?tqx=out:csv&sheet=<TAB_NAME>
// or the published CSV link from File → Share → Publish to web.
export const SHEETS = {
  openPlayers: "https://docs.google.com/spreadsheets/d/1w2MCrv-xbqrme26CZh1kKBjRnYRLKQI-26UVBg6a0xA/edit?gid=1475985538#gid=1475985538",
  veteranPlayers: "https://docs.google.com/spreadsheets/d/1w2MCrv-xbqrme26CZh1kKBjRnYRLKQI-26UVBg6a0xA/edit?gid=997517097#gid=997517097",
  femalePlayers: "https://docs.google.com/spreadsheets/d/1w2MCrv-xbqrme26CZh1kKBjRnYRLKQI-26UVBg6a0xA/edit?gid=232303448#gid=232303448",
} as const;

export type AuctionType = "open" | "veteran" | "female";

export const AUCTION_META: Record<
  AuctionType,
  { title: string; subtitle: string; accent: string; sheetKey: keyof typeof SHEETS }
> = {
  open: {
    title: "Open Auction",
    subtitle: "Main league draft",
    accent: "from-[oklch(0.72_0.18_145)] to-[oklch(0.62_0.22_165)]",
    sheetKey: "openPlayers",
  },
  veteran: {
    title: "Veteran Auction",
    subtitle: "Legends of the game",
    accent: "from-[oklch(0.72_0.18_55)] to-[oklch(0.62_0.22_35)]",
    sheetKey: "veteranPlayers",
  },
  female: {
    title: "Female Auction",
    subtitle: "Women's championship draft",
    accent: "from-[oklch(0.72_0.18_340)] to-[oklch(0.62_0.22_310)]",
    sheetKey: "femalePlayers",
  },
};
