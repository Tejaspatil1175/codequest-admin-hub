import { useState } from 'react';
import { ArrowRight, Ban, ToggleLeft, ToggleRight, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGame } from '@/contexts/GameContext';
import { ConfirmDialog } from '../ConfirmDialog';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export function TradesTab() {
  const { trades, tradingEnabled, cancelTrade, toggleTrading } = useGame();
  const [selectedTradeId, setSelectedTradeId] = useState<string | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showToggleDialog, setShowToggleDialog] = useState(false);

  const handleCancelTrade = () => {
    if (!selectedTradeId) return;
    cancelTrade(selectedTradeId);
    toast.success('Trade cancelled');
    setShowCancelDialog(false);
    setSelectedTradeId(null);
  };

  const handleToggleTrading = () => {
    toggleTrading();
    toast.success(tradingEnabled ? 'Trading disabled' : 'Trading enabled');
    setShowToggleDialog(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return 'status-badge-live';
      case 'pending':
        return 'status-badge-pending';
      case 'cancelled':
        return 'status-badge-banned';
      default:
        return '';
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            Trade Monitoring
            <span
              className={cn(
                'status-badge',
                tradingEnabled ? 'status-badge-live' : 'status-badge-banned'
              )}
            >
              {tradingEnabled ? 'Trading Enabled' : 'Trading Disabled'}
            </span>
          </h3>
          <p className="text-sm text-muted-foreground">
            Monitor and manage unlock-code trades between teams
          </p>
        </div>
        <Button
          variant={tradingEnabled ? 'destructive' : 'success'}
          onClick={() => setShowToggleDialog(true)}
        >
          {tradingEnabled ? (
            <>
              <ToggleLeft className="mr-2 h-4 w-4" />
              Disable Trading
            </>
          ) : (
            <>
              <ToggleRight className="mr-2 h-4 w-4" />
              Enable Trading
            </>
          )}
        </Button>
      </div>

      {!tradingEnabled && (
        <div className="mb-6 flex items-center gap-3 rounded-lg border border-warning/30 bg-warning/10 p-4 text-warning">
          <AlertTriangle className="h-5 w-5" />
          <p className="text-sm">
            Trading is currently disabled. Teams cannot trade unlock codes.
          </p>
        </div>
      )}

      <div className="rounded-xl border border-border overflow-hidden">
        <table className="admin-table">
          <thead className="bg-muted/30">
            <tr>
              <th>Seller</th>
              <th></th>
              <th>Buyer</th>
              <th>Question</th>
              <th>Price</th>
              <th>Status</th>
              <th>Time</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {trades.map((trade) => (
              <tr key={trade.id}>
                <td>
                  <span className="font-medium">{trade.sellerName}</span>
                </td>
                <td>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </td>
                <td>
                  <span className="font-medium">{trade.buyerName}</span>
                </td>
                <td>
                  <span className="code-badge">{trade.questionTitle}</span>
                </td>
                <td>
                  <span className="font-mono font-semibold text-primary">
                    {trade.price} pts
                  </span>
                </td>
                <td>
                  <span className={cn('status-badge', getStatusBadge(trade.status))}>
                    {trade.status}
                  </span>
                </td>
                <td className="text-sm text-muted-foreground">
                  {trade.timestamp.toLocaleTimeString()}
                </td>
                <td className="text-right">
                  {trade.status === 'pending' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => {
                        setSelectedTradeId(trade.id);
                        setShowCancelDialog(true);
                      }}
                    >
                      <Ban className="mr-1 h-4 w-4" />
                      Cancel
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {trades.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <p>No trades recorded yet</p>
        </div>
      )}

      <ConfirmDialog
        open={showCancelDialog}
        onOpenChange={setShowCancelDialog}
        title="Cancel Trade?"
        description="This will cancel the pending trade. Both parties will be notified."
        confirmText="Cancel Trade"
        variant="destructive"
        onConfirm={handleCancelTrade}
      />

      <ConfirmDialog
        open={showToggleDialog}
        onOpenChange={setShowToggleDialog}
        title={tradingEnabled ? 'Disable Trading?' : 'Enable Trading?'}
        description={
          tradingEnabled
            ? 'All pending trades will remain pending, but no new trades can be initiated.'
            : 'Teams will be able to trade unlock codes for questions.'
        }
        confirmText={tradingEnabled ? 'Disable' : 'Enable'}
        variant={tradingEnabled ? 'destructive' : 'default'}
        onConfirm={handleToggleTrading}
      />
    </div>
  );
}
