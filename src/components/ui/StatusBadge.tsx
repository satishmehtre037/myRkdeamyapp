'use client';

import React from 'react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

const statusStyles: Record<string, { bg: string; color: string; dotColor: string }> = {
  paid: { bg: 'rgba(16, 185, 129, 0.1)', color: '#34d399', dotColor: '#10b981' },
  completed: { bg: 'rgba(16, 185, 129, 0.1)', color: '#34d399', dotColor: '#10b981' },
  active: { bg: 'rgba(99, 102, 241, 0.1)', color: '#818cf8', dotColor: '#6366f1' },
  partial: { bg: 'rgba(245, 158, 11, 0.1)', color: '#fbbf24', dotColor: '#f59e0b' },
  due: { bg: 'rgba(239, 68, 68, 0.1)', color: '#f87171', dotColor: '#ef4444' },
  overdue: { bg: 'rgba(239, 68, 68, 0.15)', color: '#f87171', dotColor: '#ef4444' },
  upcoming: { bg: 'rgba(59, 130, 246, 0.1)', color: '#93c5fd', dotColor: '#3b82f6' },
  inactive: { bg: 'rgba(100, 116, 139, 0.1)', color: '#94a3b8', dotColor: '#64748b' },
  graduated: { bg: 'rgba(139, 92, 246, 0.1)', color: '#a78bfa', dotColor: '#8b5cf6' },
  pending: { bg: 'rgba(245, 158, 11, 0.1)', color: '#fbbf24', dotColor: '#f59e0b' },
  failed: { bg: 'rgba(239, 68, 68, 0.1)', color: '#f87171', dotColor: '#ef4444' },
};

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const styles = statusStyles[status] || statusStyles.inactive;
  const padding = size === 'sm' ? '3px 8px' : '4px 12px';
  const fontSize = size === 'sm' ? '11px' : '12px';

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding,
      borderRadius: '20px',
      background: styles.bg,
      color: styles.color,
      fontSize,
      fontWeight: 600,
      textTransform: 'capitalize',
      letterSpacing: '0.01em',
    }}>
      <span style={{
        width: '6px',
        height: '6px',
        borderRadius: '50%',
        background: styles.dotColor,
        display: 'inline-block',
      }} />
      {status}
    </span>
  );
}
