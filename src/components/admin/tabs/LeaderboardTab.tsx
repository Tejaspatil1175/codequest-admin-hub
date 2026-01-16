import { useState, useEffect } from 'react';
import { Trophy, Pause, Play, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGame } from '@/contexts/GameContext';
import { ConfirmDialog } from '../ConfirmDialog';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export function LeaderboardTab() {
  const { leaderboard, leaderboardFrozen, toggleLeaderboardFreeze, loadLeaderboard, currentRoom } = useGame();
  const [showFreezeDialog, setShowFreezeDialog] = useState(false);

  // Load leaderboard when component mounts or room changes
  useEffect(() => {
    if (currentRoom) {
      console.log('🔄 LeaderboardTab: Loading leaderboard for room:', currentRoom.id);
      loadLeaderboard(currentRoom.id);
    }
  }, [currentRoom, loadLeaderboard]);

  const handleToggleFreeze = () => {
    toggleLeaderboardFreeze();
    toast.success(
      leaderboardFrozen ? 'Leaderboard unfrozen' : 'Leaderboard frozen'
    );
    setShowFreezeDialog(false);
  };

  const exportCSV = () => {
    const headers = ['Rank', 'Team Name', 'Points', 'Questions Solved'];
    const rows = leaderboard.map((entry) => [
      entry.rank,
      entry.teamName,
      entry.points,
      entry.questionsSolved,
    ]);

    const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leaderboard-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Leaderboard exported');
  };

  const getRankStyle = (rank: number) => {
    if (rank === 1) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    if (rank === 2) return 'bg-gray-400/20 text-gray-300 border-gray-400/30';
    if (rank === 3) return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    return 'bg-muted text-muted-foreground';
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            Live Leaderboard
            {leaderboardFrozen && (
              <span className="status-badge status-badge-pending">
                <Pause className="h-3 w-3" />
                Frozen
              </span>
            )}
          </h3>
          <p className="text-sm text-muted-foreground">
            Real-time rankings • Auto-updates every second
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={exportCSV}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button
            variant={leaderboardFrozen ? 'default' : 'secondary'}
            onClick={() => setShowFreezeDialog(true)}
          >
            {leaderboardFrozen ? (
              <>
                <Play className="mr-2 h-4 w-4" />
                Unfreeze
              </>
            ) : (
              <>
                <Pause className="mr-2 h-4 w-4" />
                Freeze
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        <table className="admin-table">
          <thead className="bg-muted/30">
            <tr>
              <th className="w-20">Rank</th>
              <th>Team</th>
              <th className="text-right">Points</th>
              <th className="text-right">Solved</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((entry, index) => (
              <tr
                key={entry.teamId}
                className={cn(
                  'transition-all',
                  index < 3 && 'bg-muted/20'
                )}
              >
                <td>
                  <div
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-lg border font-mono text-sm font-bold',
                      getRankStyle(entry.rank)
                    )}
                  >
                    {entry.rank === 1 ? (
                      <Trophy className="h-5 w-5" />
                    ) : (
                      `#${entry.rank}`
                    )}
                  </div>
                </td>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 font-mono text-sm font-bold text-primary">
                      {entry.teamName.substring(0, 2).toUpperCase()}
                    </div>
                    <span className="font-medium">{entry.teamName}</span>
                  </div>
                </td>
                <td className="text-right">
                  <span className="font-mono text-lg font-bold text-primary">
                    {entry.points}
                  </span>
                </td>
                <td className="text-right">
                  <span className="font-mono">{entry.questionsSolved}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {leaderboard.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <Trophy className="mb-4 h-12 w-12 opacity-20" />
          <p>No active teams yet</p>
        </div>
      )}

      <ConfirmDialog
        open={showFreezeDialog}
        onOpenChange={setShowFreezeDialog}
        title={leaderboardFrozen ? 'Unfreeze Leaderboard?' : 'Freeze Leaderboard?'}
        description={
          leaderboardFrozen
            ? 'This will resume real-time updates to the public leaderboard.'
            : 'This will pause public leaderboard updates. Useful for dramatic finishes!'
        }
        confirmText={leaderboardFrozen ? 'Unfreeze' : 'Freeze'}
        onConfirm={handleToggleFreeze}
      />
    </div>
  );
}
