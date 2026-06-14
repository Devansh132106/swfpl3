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
  /** U11 uses lottery wheel instead of bidding. */
  lotteryMode?: boolean;
}

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
    basePrice: 5000,
    budget: LAKH,
    minPlayers: 5,
    maxPlayers: 8,
    reopenUnsold: true,
    groups: ["goalkeeper", "player", "senior"],
  },
  veteran: {
    basePrice: 5000,
    budget: LAKH,
    minPlayers: 6,
    maxPlayers: 6,
    reopenUnsold: true,
  },
  female: {
    basePrice: 5000,
    budget: LAKH,
    minPlayers: 5,
    maxPlayers: 15,
    reopenUnsold: true,
  },
  "kids-u14": {
    basePrice: 5000,
    budget: LAKH,
    minPlayers: 5,
    maxPlayers: 15,
    reopenUnsold: true,
  },
  "kids-u11": {
    basePrice: 0,
    budget: LAKH,
    minPlayers: 0,
    maxPlayers: 99,
    reopenUnsold: false,
    lotteryMode: true,
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
