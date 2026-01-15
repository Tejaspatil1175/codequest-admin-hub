import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { GameStatusBadge } from '@/components/admin/GameStatusBadge';
import { TeamsTab } from '@/components/admin/tabs/TeamsTab';
import { QuestionsTab } from '@/components/admin/tabs/QuestionsTab';
import { LeaderboardTab } from '@/components/admin/tabs/LeaderboardTab';
import { TradesTab } from '@/components/admin/tabs/TradesTab';
import { ControlsTab } from '@/components/admin/tabs/ControlsTab';
import { useGame } from '@/contexts/GameContext';
import { toast } from 'sonner';

export default function ManageRoom() {
  const navigate = useNavigate();
  const { currentRoom } = useGame();
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    if (currentRoom?.code) {
      navigator.clipboard.writeText(currentRoom.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Room code copied!');
    }
  };

  if (!currentRoom) {
    return (
      <div className="min-h-screen bg-background">
        <AdminHeader />
        <main className="container mx-auto flex flex-col items-center justify-center px-4 py-20">
          <p className="text-xl text-muted-foreground">No room selected</p>
          <Button variant="link" onClick={() => navigate('/dashboard')}>
            Go to Dashboard
          </Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />

      <main className="container mx-auto px-4 py-8">
        <Button variant="ghost" className="mb-6" onClick={() => navigate('/dashboard')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        {/* Room Header */}
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-4">
              <h2 className="text-3xl font-bold">Manage Room</h2>
              <GameStatusBadge status={currentRoom.status} />
            </div>
            <p className="mt-1 text-muted-foreground">
              Configure and monitor your game session
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
            <div>
              <p className="text-xs text-muted-foreground">Room Code</p>
              <p className="font-mono text-xl font-bold text-primary">
                {currentRoom.code}
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={copyCode}>
              {copied ? (
                <Check className="h-4 w-4 text-success" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="teams" className="space-y-6">
          <TabsList className="inline-flex h-auto gap-1 rounded-xl bg-muted/30 p-1">
            <TabsTrigger
              value="teams"
              className="rounded-lg px-4 py-2 text-sm font-medium data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm"
            >
              Teams
            </TabsTrigger>
            <TabsTrigger
              value="questions"
              className="rounded-lg px-4 py-2 text-sm font-medium data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm"
            >
              Questions
            </TabsTrigger>
            <TabsTrigger
              value="leaderboard"
              className="rounded-lg px-4 py-2 text-sm font-medium data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm"
            >
              Leaderboard
            </TabsTrigger>
            <TabsTrigger
              value="trades"
              className="rounded-lg px-4 py-2 text-sm font-medium data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm"
            >
              Trades
            </TabsTrigger>
            <TabsTrigger
              value="controls"
              className="rounded-lg px-4 py-2 text-sm font-medium data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm"
            >
              Controls
            </TabsTrigger>
          </TabsList>

          <div className="rounded-2xl border border-border bg-card p-6">
            <TabsContent value="teams" className="mt-0">
              <TeamsTab />
            </TabsContent>
            <TabsContent value="questions" className="mt-0">
              <QuestionsTab />
            </TabsContent>
            <TabsContent value="leaderboard" className="mt-0">
              <LeaderboardTab />
            </TabsContent>
            <TabsContent value="trades" className="mt-0">
              <TradesTab />
            </TabsContent>
            <TabsContent value="controls" className="mt-0">
              <ControlsTab />
            </TabsContent>
          </div>
        </Tabs>
      </main>
    </div>
  );
}
