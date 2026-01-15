import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Room, Team, Question, Trade, LeaderboardEntry, AdminStats } from '@/types/admin';

interface GameContextType {
  rooms: Room[];
  currentRoom: Room | null;
  teams: Team[];
  questions: Question[];
  trades: Trade[];
  leaderboard: LeaderboardEntry[];
  stats: AdminStats;
  tradingEnabled: boolean;
  leaderboardFrozen: boolean;
  
  // Room actions
  createRoom: (config: Omit<Room, 'id' | 'code' | 'status' | 'createdAt'>) => Room;
  selectRoom: (roomId: string) => void;
  startGame: () => void;
  pauseGame: () => void;
  endGame: () => void;
  resetRoom: () => void;
  
  // Team actions
  banTeam: (teamId: string, reason: string) => void;
  unbanTeam: (teamId: string) => void;
  
  // Question actions
  addQuestion: (question: Omit<Question, 'id' | 'locked'>) => void;
  updateQuestion: (questionId: string, updates: Partial<Question>) => void;
  deleteQuestion: (questionId: string) => void;
  forceUnlockQuestion: (questionId: string, teamId: string) => void;
  
  // Trade actions
  cancelTrade: (tradeId: string) => void;
  toggleTrading: () => void;
  
  // Leaderboard actions
  toggleLeaderboardFreeze: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

// Generate a 6-digit room code
function generateRoomCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Mock initial data
const mockTeams: Team[] = [
  { id: '1', name: 'ByteBlasters', points: 450, solvedQuestions: 3, status: 'active', banHistory: [], joinedAt: new Date() },
  { id: '2', name: 'CodeCrusaders', points: 520, solvedQuestions: 4, status: 'active', banHistory: [], joinedAt: new Date() },
  { id: '3', name: 'AlgoAces', points: 380, solvedQuestions: 2, status: 'active', banHistory: [], joinedAt: new Date() },
  { id: '4', name: 'DebugDynamos', points: 290, solvedQuestions: 2, status: 'banned', banReason: 'Suspicious activity', banHistory: [{ reason: 'Suspicious activity', bannedAt: new Date() }], joinedAt: new Date() },
  { id: '5', name: 'SyntaxSurfers', points: 610, solvedQuestions: 5, status: 'active', banHistory: [], joinedAt: new Date() },
];

const mockQuestions: Question[] = [
  { id: '1', order: 1, title: 'Two Sum', description: 'Find two numbers that add up to target', inputFormat: 'Array of integers, target', expectedOutput: 'Indices of two numbers', points: 100, locked: false },
  { id: '2', order: 2, title: 'Reverse String', description: 'Reverse a given string', inputFormat: 'String', expectedOutput: 'Reversed string', points: 50, locked: false },
  { id: '3', order: 3, title: 'Binary Search', description: 'Implement binary search algorithm', inputFormat: 'Sorted array, target', expectedOutput: 'Index or -1', points: 150, locked: false },
];

const mockTrades: Trade[] = [
  { id: '1', sellerId: '1', sellerName: 'ByteBlasters', buyerId: '3', buyerName: 'AlgoAces', questionId: '1', questionTitle: 'Two Sum', price: 50, status: 'completed', timestamp: new Date(Date.now() - 3600000) },
  { id: '2', sellerId: '2', sellerName: 'CodeCrusaders', buyerId: '5', buyerName: 'SyntaxSurfers', questionId: '2', questionTitle: 'Reverse String', price: 30, status: 'pending', timestamp: new Date() },
];

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [rooms, setRooms] = useState<Room[]>([
    { id: '1', code: 'ABC123', startingPoints: 500, maxTeams: 10, totalQuestions: 5, tradingEnabled: true, penaltiesEnabled: true, status: 'live', createdAt: new Date() },
  ]);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(rooms[0]);
  const [teams, setTeams] = useState<Team[]>(mockTeams);
  const [questions, setQuestions] = useState<Question[]>(mockQuestions);
  const [trades, setTrades] = useState<Trade[]>(mockTrades);
  const [tradingEnabled, setTradingEnabled] = useState(true);
  const [leaderboardFrozen, setLeaderboardFrozen] = useState(false);

  const leaderboard: LeaderboardEntry[] = [...teams]
    .filter((t) => t.status === 'active')
    .sort((a, b) => b.points - a.points)
    .map((team, index) => ({
      rank: index + 1,
      teamId: team.id,
      teamName: team.name,
      points: team.points,
      questionsSolved: team.solvedQuestions,
    }));

  const stats: AdminStats = {
    totalActiveRooms: rooms.filter((r) => r.status === 'live').length,
    totalTeamsJoined: teams.length,
    liveGames: rooms.filter((r) => r.status === 'live').length,
  };

  const createRoom = useCallback((config: Omit<Room, 'id' | 'code' | 'status' | 'createdAt'>) => {
    const newRoom: Room = {
      ...config,
      id: Date.now().toString(),
      code: generateRoomCode(),
      status: 'not_started',
      createdAt: new Date(),
    };
    setRooms((prev) => [...prev, newRoom]);
    setCurrentRoom(newRoom);
    return newRoom;
  }, []);

  const selectRoom = useCallback((roomId: string) => {
    const room = rooms.find((r) => r.id === roomId);
    if (room) setCurrentRoom(room);
  }, [rooms]);

  const startGame = useCallback(() => {
    if (!currentRoom) return;
    setRooms((prev) =>
      prev.map((r) => (r.id === currentRoom.id ? { ...r, status: 'live' as const } : r))
    );
    setCurrentRoom((prev) => (prev ? { ...prev, status: 'live' } : null));
    setQuestions((prev) => prev.map((q) => ({ ...q, locked: true })));
  }, [currentRoom]);

  const pauseGame = useCallback(() => {
    if (!currentRoom) return;
    setRooms((prev) =>
      prev.map((r) => (r.id === currentRoom.id ? { ...r, status: 'paused' as const } : r))
    );
    setCurrentRoom((prev) => (prev ? { ...prev, status: 'paused' } : null));
  }, [currentRoom]);

  const endGame = useCallback(() => {
    if (!currentRoom) return;
    setRooms((prev) =>
      prev.map((r) => (r.id === currentRoom.id ? { ...r, status: 'ended' as const } : r))
    );
    setCurrentRoom((prev) => (prev ? { ...prev, status: 'ended' } : null));
  }, [currentRoom]);

  const resetRoom = useCallback(() => {
    if (!currentRoom) return;
    setRooms((prev) =>
      prev.map((r) => (r.id === currentRoom.id ? { ...r, status: 'not_started' as const } : r))
    );
    setCurrentRoom((prev) => (prev ? { ...prev, status: 'not_started' } : null));
    setQuestions((prev) => prev.map((q) => ({ ...q, locked: false })));
    setTeams((prev) =>
      prev.map((t) => ({
        ...t,
        points: currentRoom.startingPoints,
        solvedQuestions: 0,
        status: 'active' as const,
        banReason: undefined,
      }))
    );
  }, [currentRoom]);

  const banTeam = useCallback((teamId: string, reason: string) => {
    setTeams((prev) =>
      prev.map((t) =>
        t.id === teamId
          ? {
              ...t,
              status: 'banned' as const,
              banReason: reason,
              banHistory: [...t.banHistory, { reason, bannedAt: new Date() }],
            }
          : t
      )
    );
  }, []);

  const unbanTeam = useCallback((teamId: string) => {
    setTeams((prev) =>
      prev.map((t) =>
        t.id === teamId
          ? {
              ...t,
              status: 'active' as const,
              banReason: undefined,
              banHistory: t.banHistory.map((h, i) =>
                i === t.banHistory.length - 1 ? { ...h, unbannedAt: new Date() } : h
              ),
            }
          : t
      )
    );
  }, []);

  const addQuestion = useCallback((question: Omit<Question, 'id' | 'locked'>) => {
    const newQuestion: Question = {
      ...question,
      id: Date.now().toString(),
      locked: currentRoom?.status !== 'not_started',
    };
    setQuestions((prev) => [...prev, newQuestion]);
  }, [currentRoom]);

  const updateQuestion = useCallback((questionId: string, updates: Partial<Question>) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === questionId ? { ...q, ...updates } : q))
    );
  }, []);

  const deleteQuestion = useCallback((questionId: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== questionId));
  }, []);

  const forceUnlockQuestion = useCallback((questionId: string, teamId: string) => {
    // In a real app, this would unlock the question for a specific team
    console.log(`Force unlocking question ${questionId} for team ${teamId}`);
  }, []);

  const cancelTrade = useCallback((tradeId: string) => {
    setTrades((prev) =>
      prev.map((t) => (t.id === tradeId ? { ...t, status: 'cancelled' as const } : t))
    );
  }, []);

  const toggleTrading = useCallback(() => {
    setTradingEnabled((prev) => !prev);
  }, []);

  const toggleLeaderboardFreeze = useCallback(() => {
    setLeaderboardFrozen((prev) => !prev);
  }, []);

  return (
    <GameContext.Provider
      value={{
        rooms,
        currentRoom,
        teams,
        questions,
        trades,
        leaderboard,
        stats,
        tradingEnabled,
        leaderboardFrozen,
        createRoom,
        selectRoom,
        startGame,
        pauseGame,
        endGame,
        resetRoom,
        banTeam,
        unbanTeam,
        addQuestion,
        updateQuestion,
        deleteQuestion,
        forceUnlockQuestion,
        cancelTrade,
        toggleTrading,
        toggleLeaderboardFreeze,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
