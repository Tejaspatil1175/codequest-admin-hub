import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { Room, Team, Question, Trade, LeaderboardEntry, AdminStats } from '@/types/admin';
import { apiService } from '@/lib/apiService';
import { useToast } from '@/hooks/use-toast';

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
  isLoading: boolean;

  // Room actions
  createRoom: (config: { roomName: string; initialPoints: number }) => Promise<Room | null>;
  loadMyRooms: () => Promise<void>;
  selectRoom: (roomId: string) => void;
  closeRoom: (roomId: string) => Promise<void>;
  reopenRoom: (roomId: string) => Promise<void>;
  deleteRoom: (roomId: string) => Promise<void>;

  // Team actions
  banTeam: (teamId: string, reason: string) => Promise<void>;
  unbanTeam: (teamId: string) => Promise<void>;
  loadParticipants: (roomId: string) => Promise<void>;
  loadLeaderboard: (roomId: string) => Promise<void>;

  // Question actions
  addQuestion: (roomId: string, question: any) => Promise<void>;

  // Trade actions
  loadTransactions: (roomId: string) => Promise<void>;

  // Legacy actions (kept for compatibility)
  startGame: () => void;
  pauseGame: () => void;
  endGame: () => void;
  resetRoom: () => void;
  updateQuestion: (questionId: string, updates: Partial<Question>) => void;
  deleteQuestion: (questionId: string) => void;
  forceUnlockQuestion: (questionId: string, teamId: string) => void;
  cancelTrade: (tradeId: string) => void;
  toggleTrading: () => void;
  toggleLeaderboardFreeze: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [tradingEnabled, setTradingEnabled] = useState(true);
  const [leaderboardFrozen, setLeaderboardFrozen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const stats: AdminStats = {
    totalActiveRooms: rooms.filter((r) => r.status === 'live').length,
    totalTeamsJoined: teams.length,
    liveGames: rooms.filter((r) => r.status === 'live').length,
  };

  // Load rooms on mount
  useEffect(() => {
    loadMyRooms();
  }, []);

  const loadMyRooms = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getMyRooms();

      if (response.success && response.data) {
        const mappedRooms: Room[] = response.data.map((room: any) => ({
          id: room.roomId || room._id,
          code: room.roomCode,
          startingPoints: room.initialPoints,
          maxTeams: 10, // Default value
          totalQuestions: room.questions?.length || 0,
          tradingEnabled: true,
          penaltiesEnabled: true,
          status: room.status === 'active' ? 'live' : room.status === 'closed' ? 'ended' : 'not_started',
          createdAt: new Date(room.createdAt),
        }));

        setRooms(mappedRooms);

        // Set first room as current if none selected
        if (!currentRoom && mappedRooms.length > 0) {
          setCurrentRoom(mappedRooms[0]);
        }
      }
    } catch (error) {
      toast({
        title: 'Error Loading Rooms',
        description: error instanceof Error ? error.message : 'Could not load rooms',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentRoom, toast]);

  const createRoom = useCallback(async (config: { roomName: string; initialPoints: number }): Promise<Room | null> => {
    try {
      setIsLoading(true);
      const response = await apiService.createRoom(config);

      if (response.success && response.data) {
        const newRoom: Room = {
          id: response.data._id,
          code: response.data.roomCode,
          startingPoints: response.data.initialPoints,
          maxTeams: 10,
          totalQuestions: 0,
          tradingEnabled: true,
          penaltiesEnabled: true,
          status: 'not_started',
          createdAt: new Date(response.data.createdAt),
        };

        setRooms((prev) => [...prev, newRoom]);
        setCurrentRoom(newRoom);

        toast({
          title: 'Room Created',
          description: `Room code: ${newRoom.code}`,
        });

        return newRoom;
      }
      return null;
    } catch (error) {
      toast({
        title: 'Error Creating Room',
        description: error instanceof Error ? error.message : 'Could not create room',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const selectRoom = useCallback((roomId: string) => {
    const room = rooms.find((r) => r.id === roomId);
    if (room) {
      setCurrentRoom(room);
      // Load room data
      loadParticipants(roomId);
      loadLeaderboard(roomId);
    }
  }, [rooms]);

  const closeRoom = useCallback(async (roomId: string) => {
    try {
      setIsLoading(true);
      await apiService.closeRoom(roomId);

      setRooms((prev) =>
        prev.map((r) => (r.id === roomId ? { ...r, status: 'ended' as const } : r))
      );

      if (currentRoom?.id === roomId) {
        setCurrentRoom((prev) => (prev ? { ...prev, status: 'ended' } : null));
      }

      toast({
        title: 'Room Closed',
        description: 'The room has been closed successfully',
      });
    } catch (error) {
      toast({
        title: 'Error Closing Room',
        description: error instanceof Error ? error.message : 'Could not close room',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentRoom, toast]);

  const reopenRoom = useCallback(async (roomId: string) => {
    try {
      setIsLoading(true);
      await apiService.reopenRoom(roomId);

      setRooms((prev) =>
        prev.map((r) => (r.id === roomId ? { ...r, status: 'live' as const } : r))
      );

      if (currentRoom?.id === roomId) {
        setCurrentRoom((prev) => (prev ? { ...prev, status: 'live' } : null));
      }

      toast({
        title: 'Room Reopened',
        description: 'The room has been reopened successfully',
      });
    } catch (error) {
      toast({
        title: 'Error Reopening Room',
        description: error instanceof Error ? error.message : 'Could not reopen room',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentRoom, toast]);

  const deleteRoom = useCallback(async (roomId: string) => {
    try {
      setIsLoading(true);
      await apiService.deleteRoom(roomId);

      setRooms((prev) => prev.filter((r) => r.id !== roomId));

      if (currentRoom?.id === roomId) {
        setCurrentRoom(null);
      }

      toast({
        title: 'Room Deleted',
        description: 'The room has been deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error Deleting Room',
        description: error instanceof Error ? error.message : 'Could not delete room',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentRoom, toast]);

  const loadParticipants = useCallback(async (roomId: string) => {
    try {
      const response = await apiService.getRoomParticipants(roomId);

      if (response.success && response.data) {
        // Backend returns { roomInfo, participants } or just an array
        const participantsList = Array.isArray(response.data)
          ? response.data
          : (response.data as any).participants || [];

        const mappedTeams: Team[] = participantsList.map((participant: any) => ({
          id: participant.userId || participant._id,
          name: participant.teamName || participant.username,
          points: participant.currentPoints || 0,
          solvedQuestions: participant.solvedQuestions || 0,
          status: participant.isBanned ? 'banned' : 'active',
          banReason: participant.banReason,
          banHistory: [],
          joinedAt: new Date(participant.joinedAt),
        }));

        setTeams(mappedTeams);
      }
    } catch (error) {
      console.error('Error loading participants:', error);
    }
  }, []);

  const loadLeaderboard = useCallback(async (roomId: string) => {
    try {
      console.log('🔄 Loading leaderboard for room:', roomId);
      const response = await apiService.getLeaderboard(roomId);

      console.log('📊 Leaderboard response:', response);

      if (response.success && response.data) {
        // Map backend response to frontend LeaderboardEntry format
        const mappedLeaderboard: LeaderboardEntry[] = response.data.map((entry: any) => ({
          teamId: entry.userId || entry.teamId,
          teamName: entry.teamName || entry.username,
          points: entry.currentPoints || entry.points,
          questionsSolved: entry.questionsSolved || 0,
          rank: entry.rank || 0
        }));

        console.log('✅ Mapped leaderboard:', mappedLeaderboard);
        setLeaderboard(mappedLeaderboard);
      }
    } catch (error) {
      console.error('❌ Error loading leaderboard:', error);
    }
  }, []);

  const banTeam = useCallback(async (teamId: string, reason: string) => {
    if (!currentRoom) return;

    try {
      setIsLoading(true);
      await apiService.banUser(currentRoom.id, teamId);

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

      toast({
        title: 'User Banned',
        description: 'The user has been banned from the room',
      });
    } catch (error) {
      toast({
        title: 'Error Banning User',
        description: error instanceof Error ? error.message : 'Could not ban user',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentRoom, toast]);

  const unbanTeam = useCallback(async (teamId: string) => {
    if (!currentRoom) return;

    try {
      setIsLoading(true);
      await apiService.unbanUser(currentRoom.id, teamId);

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

      toast({
        title: 'User Unbanned',
        description: 'The user has been unbanned from the room',
      });
    } catch (error) {
      toast({
        title: 'Error Unbanning User',
        description: error instanceof Error ? error.message : 'Could not unban user',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentRoom, toast]);

  const addQuestion = useCallback(async (roomId: string, questionData: any) => {
    try {
      setIsLoading(true);
      const response = await apiService.addQuestion(roomId, questionData);

      if (response.success && response.data) {
        const newQuestion: Question = {
          id: response.data._id,
          order: questions.length + 1,
          title: response.data.title,
          description: response.data.description,
          inputFormat: questionData.inputFormat,
          expectedOutput: questionData.outputFormat,
          points: response.data.points,
          locked: false,
          accessCode: response.data.accessCode,
        };

        setQuestions((prev) => [...prev, newQuestion]);

        toast({
          title: 'Question Added',
          description: `${newQuestion.title} has been added to the room`,
        });
      }
    } catch (error) {
      toast({
        title: 'Error Adding Question',
        description: error instanceof Error ? error.message : 'Could not add question',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [questions.length, toast]);

  const loadTransactions = useCallback(async (roomId: string) => {
    try {
      const response = await apiService.getRoomTransactions(roomId);

      if (response.success && response.data) {
        // Map transactions to Trade type
        const mappedTrades: Trade[] = response.data.map((transaction: any) => ({
          id: transaction._id,
          sellerId: transaction.sellerId,
          sellerName: transaction.sellerName || 'Unknown',
          buyerId: transaction.buyerId,
          buyerName: transaction.buyerName || 'Unknown',
          questionId: transaction.questionId,
          questionTitle: transaction.questionTitle || 'Unknown',
          price: transaction.amount || transaction.points,
          status: transaction.status || 'completed',
          timestamp: new Date(transaction.createdAt || transaction.timestamp),
        }));

        setTrades(mappedTrades);
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
    }
  }, []);

  // Legacy actions (kept for compatibility with existing UI)
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
    closeRoom(currentRoom.id);
  }, [currentRoom, closeRoom]);

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

  const updateQuestion = useCallback((questionId: string, updates: Partial<Question>) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === questionId ? { ...q, ...updates } : q))
    );
  }, []);

  const deleteQuestion = useCallback((questionId: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== questionId));
  }, []);

  const forceUnlockQuestion = useCallback((questionId: string, teamId: string) => {
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
        isLoading,
        createRoom,
        loadMyRooms,
        selectRoom,
        closeRoom,
        reopenRoom,
        deleteRoom,
        startGame,
        pauseGame,
        endGame,
        resetRoom,
        banTeam,
        unbanTeam,
        loadParticipants,
        loadLeaderboard,
        addQuestion,
        updateQuestion,
        deleteQuestion,
        forceUnlockQuestion,
        cancelTrade,
        loadTransactions,
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
