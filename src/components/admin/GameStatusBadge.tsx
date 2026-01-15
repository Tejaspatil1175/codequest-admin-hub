import { cn } from '@/lib/utils';
import type { Room } from '@/types/admin';

interface GameStatusBadgeProps {
  status: Room['status'];
  className?: string;
}

const statusConfig = {
  not_started: {
    label: 'Not Started',
    className: 'status-badge-pending',
  },
  live: {
    label: 'Live',
    className: 'status-badge-live',
  },
  paused: {
    label: 'Paused',
    className: 'status-badge-pending',
  },
  ended: {
    label: 'Ended',
    className: 'status-badge-ended',
  },
};

export function GameStatusBadge({ status, className }: GameStatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <span className={cn('status-badge', config.className, className)}>
      {status === 'live' && (
        <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
      )}
      {config.label}
    </span>
  );
}
