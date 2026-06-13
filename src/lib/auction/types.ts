export type Role = "Attack" | "Midfield" | "Defense" | "Goalkeeper" | string;
export type PlayerStatus = "AVAILABLE" | "SOLD" | "UNSOLD" | string;

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
}

export interface Team {
  id: string;
  name: string;
  captain: string;
  mentor: string;
  maxPlayers: number;
  logoUrl: string;
  /** Total points budget for the squad (e.g. 50000). */
  budget: number;
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
