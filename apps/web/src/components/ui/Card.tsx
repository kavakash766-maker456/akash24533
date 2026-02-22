import { ReactNode } from 'react';

// ── Badge ─────────────────────────────────────────────────────────────────────
const badgeVariants: Record<string, string> = {
  green:  'bg-green-900/30 text-green-400 border-green-800/50',
  red:    'bg-red-900/30 text-red-400 border-red-800/50',
  yellow: 'bg-yellow-900/30 text-yellow-400 border-yellow-800/50',
  blue:   'bg-blue-900/30 text-blue-400 border-blue-800/50',
  gray:   'bg-gray-800 text-gray-400 border-gray-700',
  purple: 'bg-purple-900/30 text-purple-400 border-purple-800/50',
};

export function Badge({ children, color = 'gray' }: { children: ReactNode; color?: string }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${badgeVariants[color] || badgeVariants.gray}`}>
      {children}
    </span>
  );
}

// ── Status Badge (maps job/submission status to color) ────────────────────────
const statusMap: Record<string, { color: string; label: string }> = {
  ACTIVE:           { color: 'green',  label: 'Active'         },
  PENDING_REVIEW:   { color: 'yellow', label: 'Pending Review' },
  PENDING:          { color: 'yellow', label: 'Pending'        },
  APPROVED:         { color: 'green',  label: 'Approved'       },
  REJECTED:         { color: 'red',    label: 'Rejected'       },
  PAUSED:           { color: 'gray',   label: 'Paused'         },
  COMPLETED:        { color: 'blue',   label: 'Completed'      },
  CANCELLED:        { color: 'red',    label: 'Cancelled'      },
  DRAFT:            { color: 'gray',   label: 'Draft'          },
  UNDER_REVIEW:     { color: 'purple', label: 'Under Review'   },
  PAID:             { color: 'green',  label: 'Paid'           },
};

export function StatusBadge({ status }: { status: string }) {
  const s = statusMap[status] || { color: 'gray', label: status };
  return <Badge color={s.color}>{s.label}</Badge>;
}

// ── Card ──────────────────────────────────────────────────────────────────────
export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-gray-900 border border-gray-800 rounded-xl ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`p-6 border-b border-gray-800 ${className}`}>{children}</div>;
}

export function CardBody({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`p-6 ${className}`}>{children}</div>;
}

// ── Empty State ───────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, description, action }: {
  icon: string; title: string; description?: string; action?: ReactNode;
}) {
  return (
    <div className="text-center py-16">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      {description && <p className="text-gray-400 text-sm mb-6">{description}</p>}
      {action}
    </div>
  );
}

// ── Skeleton loader ───────────────────────────────────────────────────────────
export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`bg-gray-800 rounded animate-pulse ${className}`}/>;
}
