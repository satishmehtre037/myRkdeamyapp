'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  trend?: { value: number; label: string };
  isCurrency?: boolean;
  color: 'primary' | 'success' | 'warning' | 'danger';
  index?: number;
}

const colorMap = {
  primary: {
    gradient: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(139, 92, 246, 0.08))',
    iconBg: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    glow: '0 0 30px rgba(99, 102, 241, 0.1)',
    trendColor: '#818cf8',
  },
  success: {
    gradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(52, 211, 153, 0.08))',
    iconBg: 'linear-gradient(135deg, #10b981, #34d399)',
    glow: '0 0 30px rgba(16, 185, 129, 0.1)',
    trendColor: '#34d399',
  },
  warning: {
    gradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(251, 191, 36, 0.08))',
    iconBg: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
    glow: '0 0 30px rgba(245, 158, 11, 0.1)',
    trendColor: '#fbbf24',
  },
  danger: {
    gradient: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(248, 113, 113, 0.08))',
    iconBg: 'linear-gradient(135deg, #ef4444, #f87171)',
    glow: '0 0 30px rgba(239, 68, 68, 0.1)',
    trendColor: '#f87171',
  },
};

export default function StatCard({ title, value, icon: Icon, trend, isCurrency, color, index = 0 }: StatCardProps) {
  const colors = colorMap[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.4, 0, 0.2, 1] }}
      className="hover-3d"
      style={{
        background: colors.gradient,
        borderRadius: '16px',
        padding: '24px',
        border: '1px solid rgba(99, 102, 241, 0.08)',
        cursor: 'default',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background decoration */}
      <div style={{
        position: 'absolute',
        top: '-20px',
        right: '-20px',
        width: '100px',
        height: '100px',
        borderRadius: '50%',
        background: colors.gradient,
        opacity: 0.3,
        filter: 'blur(20px)',
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative' }}>
        <div>
          <p style={{ fontSize: '13px', fontWeight: 500, color: '#94a3b8', marginBottom: '8px', letterSpacing: '0.01em' }}>
            {title}
          </p>
          <h3 style={{ fontSize: '28px', fontWeight: 800, color: '#e2e8f0', letterSpacing: '-0.02em' }}>
            {isCurrency ? formatCurrency(value as number) : value}
          </h3>
          {trend && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              marginTop: '8px',
              fontSize: '12px',
              color: colors.trendColor,
              fontWeight: 500,
            }}>
              <span>{trend.value > 0 ? '↑' : '↓'} {Math.abs(trend.value)}%</span>
              <span style={{ color: '#64748b' }}>{trend.label}</span>
            </div>
          )}
        </div>
        <div style={{
          width: '44px',
          height: '44px',
          borderRadius: '12px',
          background: colors.iconBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        }}>
          <Icon size={22} />
        </div>
      </div>
    </motion.div>
  );
}
