import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { getAuctionRules } from "@/config/auctionRules";
import { getTeamsForAuction } from "@/config/teams";
import type { AuctionType } from "@/config/sheets";

import { preparePlayers } from "./preparePlayers";
import { fetchPlayers } from "./sheets";

/** Fetch players on the server, then filter/sort per auction rules. */
export const loadPlayers = createServerFn({ method: "GET" })
  .validator(z.object({ url: z.string().min(1), auctionType: z.string().min(1) }))
  .handler(async ({ data }) => {
    const auctionType = data.auctionType as AuctionType;
    const raw = await fetchPlayers(data.url);
    const teams = getTeamsForAuction(auctionType);
    const rules = getAuctionRules(auctionType);
    return preparePlayers(raw, teams, rules);
  });
