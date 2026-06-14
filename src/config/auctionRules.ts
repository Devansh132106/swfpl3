import type { AuctionType } from "./sheets";
import type { PlayerGroup } from "@/lib/auction/types";

export interface AuctionRules {
  basePrice: number;
  budget: number;
  minPlayers: number;
  maxPlayers: number;
  /** Re-auction unsold players until everyone is sold. */
  reopenUnsold: boolean;
  /** Open auction runs in these group phases (in order). */
  groups?: PlayerGroup[];
  /** Lottery wheel instead of bidding (U11, Female). */
  lotteryMode?: boolean;
  /** How many teams may reach maxPlayers (e.g. U11/U15: 2 teams of 5). */
  maxTeamsAtMaxSize?: number;
}

const BASE = 1000;

/** Minimum bid / base price for every player in every category. */
export const PLAYER_BASE_PRICE = BASE;

/** Only these players belong in Group Senior — everyone else (non-GK) is Group Player. */
export const SENIOR_PLAYER_NAMES = [
  "Subho",
  "Joydip Basak",
  "Rajroop Ghoshal",
  "Puspendu Karmakar",
  "Anandarup",
  "Prosenjit Saha",
  "SWARUP MOZUMDER",
  "Debopratim Das",
] as const;

const LAKH = 100_000;

export const AUCTION_RULES: Record<AuctionType, AuctionRules> = {
  open: {
    basePrice: BASE,
    budget: LAKH,
    minPlayers: 5,
    maxPlayers: 6,
    reopenUnsold: true,
    groups: ["goalkeeper", "player", "senior"],
  },
  veteran: {
    basePrice: BASE,
    budget: LAKH,
    minPlayers: 5,
    maxPlayers: 6,
    reopenUnsold: true,
  },
  female: {
    basePrice: BASE,
    budget: LAKH,
    minPlayers: 5,
    maxPlayers: 6,
    reopenUnsold: false,
    lotteryMode: true,
  },
  "kids-u14": {
    basePrice: BASE,
    budget: LAKH,
    minPlayers: 4,
    maxPlayers: 5,
    reopenUnsold: true,
    maxTeamsAtMaxSize: 2,
  },
  "kids-u11": {
    basePrice: BASE,
    budget: LAKH,
    minPlayers: 4,
    maxPlayers: 5,
    reopenUnsold: false,
    lotteryMode: true,
    maxTeamsAtMaxSize: 2,
  },
};

export function getAuctionRules(type: AuctionType): AuctionRules {
  return AUCTION_RULES[type];
}

export const GROUP_LABELS: Record<PlayerGroup, string> = {
  goalkeeper: "Group Goalkeeper",
  player: "Group Player",
  senior: "Group Senior",
};
