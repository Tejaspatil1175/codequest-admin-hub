import { useState } from 'react';
import { Play, Pause, Square, RotateCcw, Unlock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useGame } from '@/contexts/GameContext';
import { ConfirmDialog } from '../ConfirmDialog';
import { GameStatusBadge } from '../GameStatusBadge';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

export function ControlsTab() {
  const {
    currentRoom,
    teams,
    questions,
    startGame,
    pauseGame,
    endGame,
    resetRoom,
    forceUnlockQuestion,
  } = useGame();

  const [showStartDialog, setShowStartDialog] = useState(false);
  const [showPauseDialog, setShowPauseDialog] = useState(false);
  const [showEndDialog, setShowEndDialog] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showUnlockDialog, setShowUnlockDialog] = useState(false);
  const [unlockTeamId, setUnlockTeamId] = useState('');
  const [unlockQuestionId, setUnlockQuestionId] = useState('');

  const handleStart = () => {
    startGame();
    toast.success('Game started!', {
      description: 'All teams have been notified.',
    });
    setShowStartDialog(false);
  };

  const handlePause = () => {
    pauseGame();
    toast.info('Game paused');
    setShowPauseDialog(false);
  };

  const handleEnd = () => {
    endGame();
    toast.success('Game ended');
    setShowEndDialog(false);
  };

  const handleReset = () => {
    resetRoom();
    toast.success('Room reset to initial state');
    setShowResetDialog(false);
  };

  const handleForceUnlock = () => {
    if (!unlockTeamId || !unlockQuestionId) return;
    forceUnlockQuestion(unlockQuestionId, unlockTeamId);
    toast.success('Question unlocked for team');
    setShowUnlockDialog(false);
    setUnlockTeamId('');
    setUnlockQuestionId('');
  };

  const activeTeams = teams.filter((t) => t.status === 'active');

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h3 className="text-lg font-semibold">Game Controls</h3>
        <p className="text-sm text-muted-foreground">
          Master controls for the current game session
        </p>
      </div>

      {/* Current Status */}
      <div className="mb-8 rounded-xl border border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Current Status</p>
            <div className="mt-1 flex items-center gap-3">
              <GameStatusBadge status={currentRoom?.status || 'not_started'} />
              <span className="font-mono text-lg">Room: {currentRoom?.code}</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-2xl font-bold">{activeTeams.length}</p>
              <p className="text-xs text-muted-foreground">Active Teams</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{questions.length}</p>
              <p className="text-xs text-muted-foreground">Questions</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{currentRoom?.startingPoints}</p>
              <p className="text-xs text-muted-foreground">Starting Pts</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Controls */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Button
          size="lg"
          variant={currentRoom?.status === 'not_started' ? 'glow' : 'secondary'}
          className="h-24 flex-col"
          onClick={() => setShowStartDialog(true)}
          disabled={currentRoom?.status === 'live' || currentRoom?.status === 'ended'}
        >
          <Play className="mb-2 h-8 w-8" />
          Start Game
        </Button>

        <Button
          size="lg"
          variant="secondary"
          className="h-24 flex-col"
          onClick={() => setShowPauseDialog(true)}
          disabled={currentRoom?.status !== 'live'}
        >
          <Pause className="mb-2 h-8 w-8" />
          {currentRoom?.status === 'paused' ? 'Resume Game' : 'Pause Game'}
        </Button>

        <Button
          size="lg"
          variant="destructive"
          className="h-24 flex-col"
          onClick={() => setShowEndDialog(true)}
          disabled={currentRoom?.status === 'ended' || currentRoom?.status === 'not_started'}
        >
          <Square className="mb-2 h-8 w-8" />
          End Game
        </Button>

        <Button
          size="lg"
          variant="outline"
          className="h-24 flex-col"
          onClick={() => setShowResetDialog(true)}
        >
          <RotateCcw className="mb-2 h-8 w-8" />
          Reset Room
        </Button>
      </div>

      {/* Admin Override Section */}
      <div className="mt-8">
        <h4 className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Admin Overrides
        </h4>
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-warning/10 p-3">
              <Unlock className="h-6 w-6 text-warning" />
            </div>
            <div className="flex-1">
              <h5 className="font-semibold">Force Unlock Question</h5>
              <p className="mt-1 text-sm text-muted-foreground">
                Manually unlock a specific question for a team. Use with caution.
              </p>
            </div>
            <Button variant="outline" onClick={() => setShowUnlockDialog(true)}>
              <Unlock className="mr-2 h-4 w-4" />
              Unlock
            </Button>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <ConfirmDialog
        open={showStartDialog}
        onOpenChange={setShowStartDialog}
        title="Start Game?"
        description="This will notify all teams and begin the competition. Questions will be locked."
        confirmText="Start Game"
        onConfirm={handleStart}
      />

      <ConfirmDialog
        open={showPauseDialog}
        onOpenChange={setShowPauseDialog}
        title="Pause Game?"
        description="This will temporarily halt the game. Teams won't be able to submit answers."
        confirmText="Pause Game"
        onConfirm={handlePause}
      />

      <ConfirmDialog
        open={showEndDialog}
        onOpenChange={setShowEndDialog}
        title="End Game?"
        description="This will permanently end the game. Final results will be calculated."
        confirmText="End Game"
        variant="destructive"
        onConfirm={handleEnd}
      />

      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent className="border-border bg-card">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Reset Room?
            </DialogTitle>
            <DialogDescription>
              This will reset all team points, clear solved questions, and unban all
              teams. This action cannot be undone!
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResetDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReset}>
              Reset Everything
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showUnlockDialog} onOpenChange={setShowUnlockDialog}>
        <DialogContent className="border-border bg-card">
          <DialogHeader>
            <DialogTitle>Force Unlock Question</DialogTitle>
            <DialogDescription>
              Select a team and question to unlock manually.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Select Team</Label>
              <Select value={unlockTeamId} onValueChange={setUnlockTeamId}>
                <SelectTrigger className="bg-muted">
                  <SelectValue placeholder="Choose a team" />
                </SelectTrigger>
                <SelectContent>
                  {activeTeams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Select Question</Label>
              <Select value={unlockQuestionId} onValueChange={setUnlockQuestionId}>
                <SelectTrigger className="bg-muted">
                  <SelectValue placeholder="Choose a question" />
                </SelectTrigger>
                <SelectContent>
                  {questions.map((q) => (
                    <SelectItem key={q.id} value={q.id}>
                      #{q.order} - {q.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUnlockDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleForceUnlock}
              disabled={!unlockTeamId || !unlockQuestionId}
            >
              <Unlock className="mr-2 h-4 w-4" />
              Unlock
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
