export interface Room {
  id: string;
  code: string;
  startingPoints: number;
  maxTeams: number;
  totalQuestions: number;
  tradingEnabled: boolean;
  penaltiesEnabled: boolean;
  status: 'not_started' | 'live' | 'paused' | 'ended';
  createdAt: Date;
}

export interface Team {
  id: string;
  name: string;
  points: number;
  solvedQuestions: number;
  status: 'active' | 'banned';
  banReason?: string;
  banHistory: BanRecord[];
  joinedAt: Date;
}

export interface BanRecord {
  reason: string;
  bannedAt: Date;
  unbannedAt?: Date;
}

export interface Question {
  id: string;
  order: number;
  title: string;
  description: string;
  inputFormat: string;
  expectedOutput: string;
  points: number;
  locked: boolean;
  accessCode?: string;
}

export interface Trade {
  id: string;
  sellerId: string;
  sellerName: string;
  buyerId: string;
  buyerName: string;
  questionId: string;
  questionTitle: string;
  price: number;
  status: 'pending' | 'completed' | 'cancelled';
  timestamp: Date;
}

export interface LeaderboardEntry {
  rank: number;
  teamId: string;
  teamName: string;
  points: number;
  questionsSolved: number;
}

export interface AdminStats {
  totalActiveRooms: number;
  totalTeamsJoined: number;
  liveGames: number;
}
