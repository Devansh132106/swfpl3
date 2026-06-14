import type { AuctionType } from "@/config/sheets";
import { getAuctionRules } from "@/config/auctionRules";
import type { Team } from "@/lib/auction/types";

function flagUrl(countryCode: string): string {
  return `https://flagcdn.com/w80/${countryCode}.png`;
}

function countryTeam(
  id: string,
  name: string,
  captain: string,
  mentor: string,
  countryCode: string,
  extra?: Partial<Team>,
): Team {
  const rules = getAuctionRules("open");
  return {
    id,
    name,
    captain,
    mentor,
    minPlayers: rules.minPlayers,
    maxPlayers: rules.maxPlayers,
    logoUrl: flagUrl(countryCode),
    budget: rules.budget,
    maxSeniorPlayers: 1,
    ...extra,
  };
}

function captainTeam(id: string, captain: string, type: AuctionType): Team {
  const rules = getAuctionRules(type);
  return {
    id,
    name: captain,
    captain,
    mentor: "",
    minPlayers: rules.minPlayers,
    maxPlayers: rules.maxPlayers,
    logoUrl: "",
    budget: rules.budget,
  };
}

export const TEAMS_BY_AUCTION: Partial<Record<AuctionType, Team[]>> = {
  open: [
    countryTeam("spain", "Spain", "Ishayu Bose", "Abhinav Mangrati", "es"),
    countryTeam("brazil", "Brazil", "Siddhant Singh", "Siddhartha Ghosh", "br"),
    countryTeam("france", "France", "Priyangshu Karmakar", "Krishnendu hazra", "fr"),
    countryTeam("argentina", "Argentina", "Subham saroj", "Shourya Shikhar Singh", "ar"),
    countryTeam("portugal", "Portugal", "Praadyun dasgupta", "Krish", "pt"),
    countryTeam("netherlands", "Netherlands", "Ronit Das", "Abir Roy", "nl", {
      cannotBidGoalkeepers: true,
    }),
    countryTeam("germany", "Germany", "Piyush Kumar", "Jonty", "de"),
    countryTeam("england", "England", "Ojas Tiwari", "Aniruddha", "gb-eng"),
  ],
  veteran: [
    captainTeam("swarup", "SWARUP MOZUMDER", "veteran"),
    captainTeam("nimish", "Nimish Mishra", "veteran"),
    captainTeam("chiradip", "Chiradip", "veteran"),
  ],
  "kids-u14": [
    captainTeam("priyanshu", "Priyanshu", "kids-u14"),
    captainTeam("adarsh", "Adarsh", "kids-u14"),
    captainTeam("bhaswar", "Bhaswar Bhowmik", "kids-u14"),
  ],
  "kids-u11": [
    captainTeam("aritro", "Aritro Chowdhury", "kids-u11"),
    captainTeam("aarav", "Aarav Banerjee", "kids-u11"),
    captainTeam("atiksh", "ATIKSH SAHA", "kids-u11"),
  ],
};

export function getTeamsForAuction(type: AuctionType): Team[] {
  return TEAMS_BY_AUCTION[type] ?? [];
}
