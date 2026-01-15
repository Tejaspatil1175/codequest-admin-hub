import { useNavigate } from 'react-router-dom';
import {
  Gamepad2,
  Users,
  Trophy,
  Clock,
  Plus,
  Settings,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { StatCard } from '@/components/admin/StatCard';
import { GameStatusBadge } from '@/components/admin/GameStatusBadge';
import { useGame } from '@/contexts/GameContext';

export default function Dashboard() {
  const navigate = useNavigate();
  const { rooms, stats, leaderboard, currentRoom } = useGame();

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />

      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold">Dashboard</h2>
          <p className="mt-1 text-muted-foreground">
            Monitor and control your CodeQuest arena
          </p>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Active Rooms"
            value={stats.totalActiveRooms}
            icon={Gamepad2}
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard
            title="Total Teams"
            value={stats.totalTeamsJoined}
            icon={Users}
            trend={{ value: 8, isPositive: true }}
          />
          <StatCard
            title="Live Games"
            value={stats.liveGames}
            icon={Clock}
          />
          <StatCard
            title="Top Score"
            value={leaderboard[0]?.points || 0}
            icon={Trophy}
          />
        </div>

        {/* Quick Actions */}
        <div className="mb-8 flex flex-wrap gap-4">
          <Button size="lg" onClick={() => navigate('/create-room')}>
            <Plus className="mr-2 h-5 w-5" />
            Create New Room
          </Button>
          {currentRoom && (
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/manage-room')}
            >
              <Settings className="mr-2 h-5 w-5" />
              Manage Room: {currentRoom.code}
            </Button>
          )}
        </div>

        {/* Rooms List */}
        <div className="rounded-xl border border-border bg-card">
          <div className="border-b border-border p-4">
            <h3 className="text-lg font-semibold">Active Rooms</h3>
          </div>
          <div className="divide-y divide-border">
            {rooms.map((room) => (
              <div
                key={room.id}
                className="flex items-center justify-between p-4 transition-colors hover:bg-muted/30"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-20 items-center justify-center rounded-lg bg-primary/10">
                    <span className="font-mono text-lg font-bold text-primary">
                      {room.code}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">Room {room.code}</p>
                    <p className="text-sm text-muted-foreground">
                      {room.maxTeams} max teams • {room.totalQuestions} questions
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <GameStatusBadge status={room.status} />
                  <Button
                    variant="ghost"
                    onClick={() => navigate('/manage-room')}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            {rooms.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Gamepad2 className="mb-4 h-12 w-12 opacity-20" />
                <p>No rooms created yet</p>
                <Button
                  variant="link"
                  className="mt-2"
                  onClick={() => navigate('/create-room')}
                >
                  Create your first room
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Live Leaderboard Snapshot */}
        {leaderboard.length > 0 && (
          <div className="mt-8 rounded-xl border border-border bg-card">
            <div className="border-b border-border p-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Leaderboard Snapshot
              </h3>
            </div>
            <div className="p-4">
              <div className="space-y-2">
                {leaderboard.slice(0, 5).map((entry) => (
                  <div
                    key={entry.teamId}
                    className="flex items-center justify-between rounded-lg bg-muted/30 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 font-mono text-sm font-bold">
                        #{entry.rank}
                      </span>
                      <span className="font-medium">{entry.teamName}</span>
                    </div>
                    <span className="font-mono font-bold text-primary">
                      {entry.points} pts
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
