export type Role = "Attack" | "Midfield" | "Defense" | "Goalkeeper" | string;
export type PlayerStatus = "AVAILABLE" | "SOLD" | "UNSOLD" | string;
export type PlayerGroup = "goalkeeper" | "player" | "senior";

export interface Player {
  id: string;
  name: string;
  role: Role;
  basePrice: number;
  photoUrl: string;
  jerseyName: string;
  jerseyNumber: string;
  jerseySize: string;
  status: PlayerStatus;
  soldPrice: number | null;
  team: string | null;
  /** Open auction phase group. */
  group?: PlayerGroup;
}

export interface Team {
  id: string;
  name: string;
  captain: string;
  mentor: string;
  minPlayers: number;
  maxPlayers: number;
  logoUrl: string;
  budget: number;
  /** e.g. Netherlands — captain is the GK. */
  cannotBidGoalkeepers?: boolean;
  maxSeniorPlayers?: number;
}

export interface TeamStats {
  bought: number;
  spent: number;
  seniorCount: number;
  goalkeeperCount: number;
  players: Player[];
}

export interface SaleRecord {
  playerId: string;
  prevStatus: PlayerStatus;
  prevSoldPrice: number | null;
  prevTeam: string | null;
  prevJerseyName: string;
  prevJerseyNumber: string;
  prevJerseySize: string;
  newStatus: PlayerStatus;
  newSoldPrice: number | null;
  newTeam: string | null;
  timestamp: number;
}
