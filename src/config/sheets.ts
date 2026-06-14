// Permanent Google Sheet URLs. Admin fills these once.
// Use the "Publish to web" CSV URL for each sheet/tab, e.g.:
//   https://docs.google.com/spreadsheets/d/<ID>/gviz/tq?tqx=out:csv&sheet=<TAB_NAME>
// or the published CSV link from File → Share → Publish to web.
export const SHEETS = {
  openPlayers: "https://docs.google.com/spreadsheets/d/1w2MCrv-xbqrme26CZh1kKBjRnYRLKQI-26UVBg6a0xA/edit?gid=1475985538#gid=1475985538",
  veteranPlayers: "https://docs.google.com/spreadsheets/d/1w2MCrv-xbqrme26CZh1kKBjRnYRLKQI-26UVBg6a0xA/edit?gid=997517097#gid=997517097",
  femalePlayers: "https://docs.google.com/spreadsheets/d/1w2MCrv-xbqrme26CZh1kKBjRnYRLKQI-26UVBg6a0xA/edit?gid=232303448#gid=232303448",
  kidsU11Players: "https://docs.google.com/spreadsheets/d/1w2MCrv-xbqrme26CZh1kKBjRnYRLKQI-26UVBg6a0xA/edit?gid=2085525280#gid=2085525280",
  kidsU14Players: "https://docs.google.com/spreadsheets/d/1w2MCrv-xbqrme26CZh1kKBjRnYRLKQI-26UVBg6a0xA/edit?gid=1162699620#gid=1162699620",
} as const;

export type AuctionType = "open" | "veteran" | "female" | "kids-u11" | "kids-u14";

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
    subtitle: "Women's lottery draft",
    accent: "from-[oklch(0.72_0.18_340)] to-[oklch(0.62_0.22_310)]",
    sheetKey: "femalePlayers",
  },
  "kids-u11": {
    title: "Kids (U11)",
    subtitle: "11 and under draft",
    accent: "from-[oklch(0.75_0.18_200)] to-[oklch(0.65_0.22_220)]",
    sheetKey: "kidsU11Players",
  },
  "kids-u14": {
    title: "Kids (U15)",
    subtitle: "15 and under draft",
    accent: "from-[oklch(0.78_0.2_130)] to-[oklch(0.68_0.22_110)]",
    sheetKey: "kidsU14Players",
  },
};

export const AUCTION_TYPES = Object.keys(AUCTION_META) as AuctionType[];
