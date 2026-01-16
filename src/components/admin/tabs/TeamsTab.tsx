import { useState, useEffect } from 'react';
import { Ban, CheckCircle, AlertCircle, History, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useGame } from '@/contexts/GameContext';
import { ConfirmDialog } from '../ConfirmDialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { Team } from '@/types/admin';

export function TeamsTab() {
  const { teams, currentRoom, banTeam, unbanTeam, loadParticipants } = useGame();
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [banReason, setBanReason] = useState('');
  const [showBanDialog, setShowBanDialog] = useState(false);
  const [showUnbanDialog, setShowUnbanDialog] = useState(false);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load participants when component mounts or room changes
  useEffect(() => {
    if (currentRoom?.id) {
      loadParticipants(currentRoom.id);
    }
  }, [currentRoom?.id, loadParticipants]);

  const handleRefresh = async () => {
    if (!currentRoom?.id) return;
    setIsRefreshing(true);
    await loadParticipants(currentRoom.id);
    setIsRefreshing(false);
    toast.success('Teams list refreshed');
  };

  const handleBan = () => {
    if (!selectedTeam || !banReason.trim()) return;
    banTeam(selectedTeam.id, banReason);
    toast.error(`${selectedTeam.name} has been banned`, {
      description: banReason,
    });
    setShowBanDialog(false);
    setBanReason('');
    setSelectedTeam(null);
  };

  const handleUnban = () => {
    if (!selectedTeam) return;
    unbanTeam(selectedTeam.id);
    toast.success(`${selectedTeam.name} has been unbanned`);
    setShowUnbanDialog(false);
    setSelectedTeam(null);
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Teams Management</h3>
          <p className="text-sm text-muted-foreground">
            Manage all teams in the current room
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-green-400" />
              Active: {teams.filter((t) => t.status === 'active').length}
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-red-400" />
              Banned: {teams.filter((t) => t.status === 'banned').length}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing || !currentRoom}
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        <table className="admin-table">
          <thead className="bg-muted/30">
            <tr>
              <th>Team Name</th>
              <th>Points</th>
              <th>Solved</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {teams.map((team) => (
              <tr key={team.id}>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 font-mono text-sm font-bold text-primary">
                      {team.name.substring(0, 2).toUpperCase()}
                    </div>
                    <span className="font-medium">{team.name}</span>
                  </div>
                </td>
                <td>
                  <span className="font-mono font-semibold">{team.points}</span>
                </td>
                <td>
                  <span className="font-mono">{team.solvedQuestions}</span>
                </td>
                <td>
                  <span
                    className={cn(
                      'status-badge',
                      team.status === 'active' ? 'status-badge-live' : 'status-badge-banned'
                    )}
                  >
                    {team.status === 'active' ? (
                      <>
                        <CheckCircle className="h-3 w-3" />
                        Active
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-3 w-3" />
                        Banned
                      </>
                    )}
                  </span>
                </td>
                <td>
                  <div className="flex items-center justify-end gap-2">
                    {team.banHistory.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedTeam(team);
                          setShowHistoryDialog(true);
                        }}
                      >
                        <History className="h-4 w-4" />
                      </Button>
                    )}
                    {team.status === 'active' ? (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setSelectedTeam(team);
                          setShowBanDialog(true);
                        }}
                      >
                        <Ban className="mr-1 h-4 w-4" />
                        Ban
                      </Button>
                    ) : (
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => {
                          setSelectedTeam(team);
                          setShowUnbanDialog(true);
                        }}
                      >
                        <CheckCircle className="mr-1 h-4 w-4" />
                        Unban
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Ban Dialog */}
      <Dialog open={showBanDialog} onOpenChange={setShowBanDialog}>
        <DialogContent className="border-border bg-card">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Ban className="h-5 w-5" />
              Ban {selectedTeam?.name}
            </DialogTitle>
            <DialogDescription>
              This will immediately disconnect the team and prevent them from
              interacting further. Enter a reason for the ban.
            </DialogDescription>
          </DialogHeader>
          <Input
            placeholder="Enter ban reason..."
            value={banReason}
            onChange={(e) => setBanReason(e.target.value)}
            className="bg-muted"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBanDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleBan}
              disabled={!banReason.trim()}
            >
              Confirm Ban
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unban Dialog */}
      <ConfirmDialog
        open={showUnbanDialog}
        onOpenChange={setShowUnbanDialog}
        title={`Unban ${selectedTeam?.name}?`}
        description="This will allow the team to rejoin and participate in the game."
        confirmText="Unban Team"
        onConfirm={handleUnban}
      />

      {/* Ban History Dialog */}
      <Dialog open={showHistoryDialog} onOpenChange={setShowHistoryDialog}>
        <DialogContent className="border-border bg-card">
          <DialogHeader>
            <DialogTitle>Ban History - {selectedTeam?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {selectedTeam?.banHistory.map((record, index) => (
              <div
                key={index}
                className="rounded-lg border border-border bg-muted/30 p-3"
              >
                <p className="text-sm font-medium">{record.reason}</p>
                <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                  <span>Banned: {record.bannedAt.toLocaleString()}</span>
                  {record.unbannedAt && (
                    <span>Unbanned: {record.unbannedAt.toLocaleString()}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
