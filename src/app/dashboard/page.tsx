'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  IndianRupee,
  Users,
  GraduationCap,
  AlertTriangle,
  ArrowUpRight,
  Calendar,
  CreditCard,
  TrendingUp,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import StatCard from '@/components/ui/StatCard';
import StatusBadge from '@/components/ui/StatusBadge';
import { formatCurrency, formatDate, getPaymentMethodLabel, getInitials } from '@/lib/utils';
import { getDashboardStats, getMonthlyRevenue, getRecentPayments, getUpcomingDues } from '@/lib/api';
import type { MonthlyRevenue } from '@/lib/mock-data';
import Link from 'next/link';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] } },
};

interface DashStats {
  totalStudents: number;
  activeBatches: number;
  totalCollected: number;
  totalPending: number;
  overdueCount: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashStats | null>(null);
  const [revenue, setRevenue] = useState<MonthlyRevenue[]>([]);
  const [recentPayments, setRecentPayments] = useState<any[]>([]);
  const [upcomingDues, setUpcomingDues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [s, r, p, d] = await Promise.all([
          getDashboardStats(),
          getMonthlyRevenue(),
          getRecentPayments(),
          getUpcomingDues(),
        ]);
        setStats(s);
        setRevenue(r);
        setRecentPayments(p);
        setUpcomingDues(d);
        setErrorMsg(null);
      } catch (err: any) {
        console.error('Failed to load dashboard data:', err);
        setErrorMsg(err.message || 'Failed to connect to Supabase. Please check your .env.local configuration.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          style={{
            width: '40px', height: '40px', border: '3px solid rgba(99, 102, 241, 0.15)',
            borderTop: '3px solid #6366f1', borderRadius: '50%',
          }}
        />
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '30px', borderRadius: '16px', textAlign: 'center', maxWidth: '400px' }}>
          <AlertTriangle size={48} style={{ color: '#ef4444', margin: '0 auto 16px' }} />
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#e2e8f0', marginBottom: '8px' }}>Connection Error</h2>
          <p style={{ fontSize: '14px', color: '#f87171', marginBottom: '16px' }}>{errorMsg}</p>
          <p style={{ fontSize: '12px', color: '#94a3b8' }}>Please verify your NEXT_PUBLIC_SUPABASE_URL in .env.local and make sure the project is active.</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Page Header */}
      <motion.div variants={itemVariants} style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#e2e8f0', marginBottom: '4px' }}>
          Dashboard Overview
        </h1>
        <p style={{ fontSize: '14px', color: '#64748b' }}>
          Financial summary for RKDeamy Classes.
        </p>
      </motion.div>

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
        marginBottom: '28px',
      }}>
        <StatCard title="Total Collected" value={stats?.totalCollected ?? 0} icon={IndianRupee} isCurrency color="success" trend={{ value: 12.5, label: 'vs last month' }} index={0} />
        <StatCard title="Pending Dues" value={stats?.totalPending ?? 0} icon={AlertTriangle} isCurrency color="warning" trend={{ value: 5.2, label: 'vs last month' }} index={1} />
        <StatCard title="Total Students" value={stats?.totalStudents ?? 0} icon={Users} color="primary" trend={{ value: 8, label: 'new this month' }} index={2} />
        <StatCard title="Active Batches" value={stats?.activeBatches ?? 0} icon={GraduationCap} color="danger" index={3} />
      </div>

      {/* Charts + Payment Status */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '20px', marginBottom: '28px' }}>
        {/* Revenue Chart */}
        <motion.div variants={itemVariants} className="glass-3d hover-3d" style={{
          borderRadius: '16px',
          padding: '24px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#e2e8f0' }}>Revenue Analytics</h3>
              <p style={{ fontSize: '12px', color: '#64748b' }}>Monthly collection overview</p>
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              background: 'rgba(16, 185, 129, 0.1)', padding: '6px 12px',
              borderRadius: '8px', color: '#34d399', fontSize: '12px', fontWeight: 600,
            }}>
              <TrendingUp size={14} /> +12.5%
            </div>
          </div>
          <div style={{ height: '260px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenue}>
                <defs>
                  <linearGradient id="gradientCollected" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#4f46e5" />
                  </linearGradient>
                  <linearGradient id="gradientPending" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#d97706" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(99, 102, 241, 0.06)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: 'rgba(99, 102, 241, 0.08)' }} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(99, 102, 241, 0.15)', borderRadius: '10px', boxShadow: '0 8px 30px rgba(0,0,0,0.3)', fontSize: '12px', color: '#e2e8f0' }} formatter={(value: number | undefined) => [formatCurrency(value ?? 0)]} />
                <Bar dataKey="collected" fill="url(#gradientCollected)" radius={[6, 6, 0, 0]} maxBarSize={40} />
                <Bar dataKey="pending" fill="url(#gradientPending)" radius={[6, 6, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', gap: '20px', marginTop: '12px', justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#6366f1' }} />
              <span style={{ fontSize: '12px', color: '#94a3b8' }}>Collected</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#f59e0b' }} />
              <span style={{ fontSize: '12px', color: '#94a3b8' }}>Pending</span>
            </div>
          </div>
        </motion.div>

        {/* Payment Status */}
        <motion.div variants={itemVariants} className="glass-3d" style={{
          borderRadius: '16px',
          padding: '24px',
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#e2e8f0', marginBottom: '20px' }}>Payment Status</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {[
              { label: 'Fully Paid', color: '#10b981', count: recentPayments.length > 0 ? stats?.totalStudents ? Math.round(stats.totalStudents * 0.33) : 0 : 0 },
              { label: 'Partially Paid', color: '#f59e0b', count: stats?.totalStudents ? Math.round(stats.totalStudents * 0.5) : 0 },
              { label: 'Due / Unpaid', count: stats?.totalStudents ? stats.totalStudents - Math.round(stats.totalStudents * 0.83) : 0, color: '#ef4444' },
            ].map((item) => (
              <div key={item.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '13px', color: '#e2e8f0', fontWeight: 500 }}>{item.label}</span>
                  <span style={{ fontSize: '13px', color: '#94a3b8' }}>{item.count} students</span>
                </div>
                <div style={{ height: '6px', borderRadius: '3px', background: 'rgba(30, 41, 59, 0.8)', overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${stats?.totalStudents ? ((item.count ?? 0) / stats.totalStudents) * 100 : 0}%` }}
                    transition={{ duration: 1, delay: 0.5, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }}
                    style={{ height: '100%', borderRadius: '3px', background: item.color }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div style={{
            marginTop: '24px', padding: '16px',
            background: 'rgba(239, 68, 68, 0.06)',
            borderRadius: '10px', border: '1px solid rgba(239, 68, 68, 0.1)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <AlertTriangle size={16} style={{ color: '#f87171' }} />
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#f87171' }}>
                {stats?.overdueCount ?? 0} Overdue
              </span>
            </div>
            <p style={{ fontSize: '11px', color: '#94a3b8' }}>Installments past their due date</p>
          </div>
        </motion.div>
      </div>

      {/* Recent Payments + Upcoming Dues */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Recent Payments */}
        <motion.div variants={itemVariants} className="glass-3d hover-3d" style={{
          borderRadius: '16px',
          padding: '24px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#e2e8f0' }}>Recent Payments</h3>
            <Link href="/dashboard/payments" style={{ fontSize: '12px', color: '#818cf8', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
              View All <ArrowUpRight size={14} />
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {recentPayments.map((p: any, i: number) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '12px', borderRadius: '10px',
                  background: 'rgba(30, 41, 59, 0.3)',
                  border: '1px solid rgba(99, 102, 241, 0.04)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '34px', height: '34px', borderRadius: '8px',
                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.1))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: '12px', color: '#818cf8',
                  }}>
                    {getInitials(p.student_name)}
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#e2e8f0' }}>{p.student_name}</div>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>{formatDate(p.payment_date)}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#34d399' }}>+{formatCurrency(p.amount)}</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>{getPaymentMethodLabel(p.payment_method)}</div>
                </div>
              </motion.div>
            ))}
            {recentPayments.length === 0 && (
              <p style={{ fontSize: '13px', color: '#64748b', textAlign: 'center', padding: '20px' }}>No payments yet</p>
            )}
          </div>
        </motion.div>

        {/* Upcoming & Overdue */}
        <motion.div variants={itemVariants} className="glass-3d hover-3d" style={{
          borderRadius: '16px',
          padding: '24px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#e2e8f0' }}>Upcoming & Overdue</h3>
            <span style={{
              fontSize: '11px', padding: '4px 10px', borderRadius: '10px',
              background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', fontWeight: 600,
            }}>{upcomingDues.length} pending</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {upcomingDues.map((d: any, i: number) => (
              <motion.div
                key={d.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '12px', borderRadius: '10px',
                  background: d.status === 'overdue' ? 'rgba(239, 68, 68, 0.06)' : 'rgba(30, 41, 59, 0.3)',
                  border: `1px solid ${d.status === 'overdue' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(99, 102, 241, 0.04)'}`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '34px', height: '34px', borderRadius: '8px',
                    background: d.status === 'overdue' ? 'rgba(239, 68, 68, 0.1)' : 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.1))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: '12px', color: d.status === 'overdue' ? '#f87171' : '#818cf8',
                  }}>
                    {getInitials(d.student_name)}
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#e2e8f0' }}>{d.student_name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#64748b' }}>
                      <Calendar size={10} /> {formatDate(d.due_date)}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#e2e8f0' }}>{formatCurrency(d.amount)}</div>
                  <StatusBadge status={d.status} size="sm" />
                </div>
              </motion.div>
            ))}
            {upcomingDues.length === 0 && (
              <p style={{ fontSize: '13px', color: '#34d399', textAlign: 'center', padding: '20px' }}>🎉 No pending dues!</p>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
