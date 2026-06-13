import type { AuctionType } from "./sheets";

export interface AuctionRules {
  /** Override base price for every player in this auction. */
  basePrice?: number;
}

export const AUCTION_RULES: Partial<Record<AuctionType, AuctionRules>> = {
  open: { basePrice: 500 },
};

export function getAuctionRules(type: AuctionType): AuctionRules {
  return AUCTION_RULES[type] ?? {};
}
