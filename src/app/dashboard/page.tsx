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
import type { Payment, Installment, MonthlyRevenue } from '@/lib/mock-data';
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
  const [recentPayments, setRecentPayments] = useState<Payment[]>([]);
  const [upcomingDues, setUpcomingDues] = useState<Installment[]>([]);
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
      <div className="loading-container">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="loading-spinner"
        />
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="error-container">
        <div className="error-card">
          <AlertTriangle size={48} className="error-icon" />
          <h2 className="error-title">Connection Error</h2>
          <p className="error-message">{errorMsg}</p>
          <p className="error-hint">Please verify your NEXT_PUBLIC_SUPABASE_URL in .env.local and make sure the project is active.</p>
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
      <motion.div variants={itemVariants} className="dashboard-header">
        <h1 className="dashboard-title">
          Dashboard Overview
        </h1>
        <p className="dashboard-subtitle">
          Financial summary for RKDeamy Classes.
        </p>
      </motion.div>

      {/* Stats */}
      <div className="stats-grid">
        <StatCard title="Total Collected" value={stats?.totalCollected ?? 0} icon={IndianRupee} isCurrency color="success" trend={{ value: 12.5, label: 'vs last month' }} index={0} />
        <StatCard title="Pending Dues" value={stats?.totalPending ?? 0} icon={AlertTriangle} isCurrency color="warning" trend={{ value: 5.2, label: 'vs last month' }} index={1} />
        <StatCard title="Total Students" value={stats?.totalStudents ?? 0} icon={Users} color="primary" trend={{ value: 8, label: 'new this month' }} index={2} />
        <StatCard title="Active Batches" value={stats?.activeBatches ?? 0} icon={GraduationCap} color="danger" index={3} />
      </div>

      {/* Charts + Payment Status */}
      <div className="responsive-grid-main" style={{ marginBottom: '28px' }}>
        {/* Revenue Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="glass-3d hover-3d chart-card"
        >
          <div className="chart-header">
            <div>
              <h3 className="chart-title">Revenue Analytics</h3>
              <p className="chart-subtitle">Monthly collection overview</p>
            </div>
            <div className="trend-badge">
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
          <div className="chart-legend">
            <div className="legend-item">
              <span className="legend-color" style={{ background: '#6366f1' }} />
              <span className="progress-meta">Collected</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{ background: '#f59e0b' }} />
              <span className="progress-meta">Pending</span>
            </div>
          </div>
        </motion.div>

        {/* Payment Status */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="glass-3d status-card"
        >
          <h3 className="chart-title" style={{ marginBottom: '20px' }}>Payment Status</h3>
          <div className="progress-list">
            {[
              { label: 'Fully Paid', color: '#10b981', count: recentPayments.length > 0 ? stats?.totalStudents ? Math.round(stats.totalStudents * 0.33) : 0 : 0 },
              { label: 'Partially Paid', color: '#f59e0b', count: stats?.totalStudents ? Math.round(stats.totalStudents * 0.5) : 0 },
              { label: 'Due / Unpaid', count: stats?.totalStudents ? stats.totalStudents - Math.round(stats.totalStudents * 0.83) : 0, color: '#ef4444' },
            ].map((item) => (
              <div key={item.label} className="progress-item">
                <div className="progress-header">
                  <span className="progress-label">{item.label}</span>
                  <span className="progress-meta">{item.count} students</span>
                </div>
                <div className="progress-track">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${stats?.totalStudents ? ((item.count ?? 0) / stats.totalStudents) * 100 : 0}%` }}
                    transition={{ duration: 1, delay: 0.5, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }}
                    className="progress-fill"
                    style={{ background: item.color }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="overdue-alert">
            <div className="progress-header" style={{ marginBottom: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={16} style={{ color: '#f87171' }} />
                <span className="progress-label" style={{ color: '#f87171' }}>
                  {stats?.overdueCount ?? 0} Overdue
                </span>
              </div>
            </div>
            <p className="progress-meta" style={{ fontSize: '11px' }}>Installments past their due date</p>
          </div>
        </motion.div>
      </div>

      {/* Recent Payments + Upcoming Dues */}
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="responsive-grid-2"
      >
        {/* Recent Payments */}
        <motion.div variants={itemVariants} className="glass-3d hover-3d list-card">
          <div className="chart-header">
            <h3 className="chart-title">Recent Payments</h3>
            <Link href="/dashboard/payments" className="dashboard-subtitle" style={{ color: '#818cf8', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}>
              View All <ArrowUpRight size={14} />
            </Link>
          </div>
          <div className="list-items">
            {(recentPayments as any[]).map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="list-item"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div className="item-avatar">
                    {getInitials(p.student_name)}
                  </div>
                  <div>
                    <div className="progress-label">{p.student_name}</div>
                    <div className="progress-meta" style={{ fontSize: '11px' }}>{formatDate(p.payment_date)}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="chart-title" style={{ color: '#34d399' }}>+{formatCurrency(p.amount)}</div>
                  <div className="progress-meta" style={{ fontSize: '11px' }}>{getPaymentMethodLabel(p.payment_method)}</div>
                </div>
              </motion.div>
            ))}
            {recentPayments.length === 0 && (
              <p style={{ fontSize: '13px', color: '#64748b', textAlign: 'center', padding: '20px' }}>No payments yet</p>
            )}
          </div>
        </motion.div>

        {/* Upcoming & Overdue */}
        <motion.div variants={itemVariants} className="glass-3d hover-3d list-card">
          <div className="chart-header">
            <h3 className="chart-title">Upcoming & Overdue</h3>
            <span className="trend-badge" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#f87171' }}>
              {upcomingDues.length} pending
            </span>
          </div>
          <div className="list-items">
            {(upcomingDues as any[]).map((d, i) => (
              <motion.div
                key={d.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className={`list-item ${d.status === 'overdue' ? 'list-item-overdue' : ''}`}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div className={`item-avatar ${d.status === 'overdue' ? 'item-avatar-overdue' : ''}`}>
                    {getInitials(d.student_name)}
                  </div>
                  <div>
                    <div className="progress-label">{d.student_name}</div>
                    <div className="progress-meta" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px' }}>
                      <Calendar size={10} /> {formatDate(d.due_date)}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="chart-title">{formatCurrency(d.amount)}</div>
                  <StatusBadge status={d.status} size="sm" />
                </div>
              </motion.div>
            ))}
            {upcomingDues.length === 0 && (
              <p style={{ fontSize: '13px', color: '#34d399', textAlign: 'center', padding: '20px' }}>🎉 No pending dues!</p>
            )}
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
