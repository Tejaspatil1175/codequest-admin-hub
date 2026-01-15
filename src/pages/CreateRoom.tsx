import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Copy,
  Check,
  Coins,
  Users,
  HelpCircle,
  ArrowRightLeft,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { useGame } from '@/contexts/GameContext';
import { toast } from 'sonner';

export default function CreateRoom() {
  const navigate = useNavigate();
  const { createRoom } = useGame();
  const [copied, setCopied] = useState(false);
  const [createdCode, setCreatedCode] = useState<string | null>(null);
  const [config, setConfig] = useState({
    startingPoints: 500,
    maxTeams: 10,
    totalQuestions: 5,
    tradingEnabled: true,
    penaltiesEnabled: true,
  });

  const handleCreate = () => {
    const room = createRoom(config);
    setCreatedCode(room.code);
    toast.success('Room created successfully!');
  };

  const copyCode = () => {
    if (createdCode) {
      navigator.clipboard.writeText(createdCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Room code copied!');
    }
  };

  if (createdCode) {
    return (
      <div className="min-h-screen bg-background">
        <AdminHeader />
        <main className="container mx-auto px-4 py-8">
          <div className="mx-auto max-w-lg">
            <div className="rounded-2xl border border-border bg-card p-8 text-center animate-slide-up">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-success/20">
                <Check className="h-10 w-10 text-success" />
              </div>
              <h2 className="text-2xl font-bold">Room Created!</h2>
              <p className="mt-2 text-muted-foreground">
                Share this code with participants to join
              </p>

              <div className="mt-8 flex items-center justify-center gap-4">
                <div className="rounded-xl border border-primary/30 bg-primary/10 px-8 py-4">
                  <p className="font-mono text-4xl font-bold tracking-widest text-primary">
                    {createdCode}
                  </p>
                </div>
                <Button variant="outline" size="icon" onClick={copyCode}>
                  {copied ? (
                    <Check className="h-5 w-5 text-success" />
                  ) : (
                    <Copy className="h-5 w-5" />
                  )}
                </Button>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-4 text-sm">
                <div className="rounded-lg bg-muted/30 p-3">
                  <p className="text-muted-foreground">Starting Points</p>
                  <p className="font-mono font-bold">{config.startingPoints}</p>
                </div>
                <div className="rounded-lg bg-muted/30 p-3">
                  <p className="text-muted-foreground">Max Teams</p>
                  <p className="font-mono font-bold">{config.maxTeams}</p>
                </div>
                <div className="rounded-lg bg-muted/30 p-3">
                  <p className="text-muted-foreground">Questions</p>
                  <p className="font-mono font-bold">{config.totalQuestions}</p>
                </div>
                <div className="rounded-lg bg-muted/30 p-3">
                  <p className="text-muted-foreground">Trading</p>
                  <p className="font-mono font-bold">
                    {config.tradingEnabled ? 'Enabled' : 'Disabled'}
                  </p>
                </div>
              </div>

              <div className="mt-8 flex gap-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => navigate('/dashboard')}
                >
                  Back to Dashboard
                </Button>
                <Button className="flex-1" onClick={() => navigate('/manage-room')}>
                  Manage Room
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />

      <main className="container mx-auto px-4 py-8">
        <Button variant="ghost" className="mb-6" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="mx-auto max-w-2xl">
          <div className="mb-8">
            <h2 className="text-3xl font-bold">Create New Room</h2>
            <p className="mt-1 text-muted-foreground">
              Configure your game room settings
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
            <div className="space-y-8">
              {/* Starting Points */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Coins className="h-5 w-5 text-primary" />
                  <Label className="text-base font-semibold">Starting Points</Label>
                </div>
                <Input
                  type="number"
                  value={config.startingPoints}
                  onChange={(e) =>
                    setConfig({ ...config, startingPoints: parseInt(e.target.value) || 0 })
                  }
                  className="bg-muted text-lg font-mono"
                />
                <p className="text-sm text-muted-foreground">
                  Points each team starts with
                </p>
              </div>

              {/* Max Teams */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  <Label className="text-base font-semibold">Maximum Teams</Label>
                </div>
                <Input
                  type="number"
                  value={config.maxTeams}
                  onChange={(e) =>
                    setConfig({ ...config, maxTeams: parseInt(e.target.value) || 1 })
                  }
                  className="bg-muted text-lg font-mono"
                />
                <p className="text-sm text-muted-foreground">
                  Maximum number of teams that can join
                </p>
              </div>

              {/* Total Questions */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-primary" />
                  <Label className="text-base font-semibold">Total Questions</Label>
                </div>
                <Input
                  type="number"
                  value={config.totalQuestions}
                  onChange={(e) =>
                    setConfig({ ...config, totalQuestions: parseInt(e.target.value) || 1 })
                  }
                  className="bg-muted text-lg font-mono"
                />
                <p className="text-sm text-muted-foreground">
                  Number of questions in the competition
                </p>
              </div>

              <div className="h-px bg-border" />

              {/* Trading Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <ArrowRightLeft className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <Label className="text-base font-semibold">Enable Trading</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow teams to trade unlock codes
                    </p>
                  </div>
                </div>
                <Switch
                  checked={config.tradingEnabled}
                  onCheckedChange={(checked) =>
                    setConfig({ ...config, tradingEnabled: checked })
                  }
                />
              </div>

              {/* Penalties Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-destructive/10 p-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                  </div>
                  <div>
                    <Label className="text-base font-semibold">Enable Penalties</Label>
                    <p className="text-sm text-muted-foreground">
                      Deduct points for wrong submissions
                    </p>
                  </div>
                </div>
                <Switch
                  checked={config.penaltiesEnabled}
                  onCheckedChange={(checked) =>
                    setConfig({ ...config, penaltiesEnabled: checked })
                  }
                />
              </div>

              <div className="h-px bg-border" />

              <Button size="lg" className="w-full" onClick={handleCreate}>
                Create Room
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
