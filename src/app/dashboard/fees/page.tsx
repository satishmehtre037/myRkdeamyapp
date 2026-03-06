'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  IndianRupee, AlertTriangle, Clock, CheckCircle2, Search,
  Download, Calendar, TrendingUp, ChevronRight, Eye,
} from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import StatusBadge from '@/components/ui/StatusBadge';
import StatCard from '@/components/ui/StatCard';
import type { FeeAssignment, Installment, Batch } from '@/lib/mock-data';
import { getFeeAssignments, getInstallments, getBatches } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';
import Link from 'next/link';
import { downloadCSV } from '@/utils/export';

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const itemVariants = { hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export default function FeeManagementPage() {
  const [feeAssignments, setFeeAssignments] = useState<FeeAssignment[]>([]);
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterBatch, setFilterBatch] = useState('all');
  const [activeTab, setActiveTab] = useState<'overview' | 'dues' | 'installments'>('overview');
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [f, i, b] = await Promise.all([getFeeAssignments(), getInstallments(), getBatches()]);
        setFeeAssignments(f); setInstallments(i); setBatches(b);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          style={{ width: '40px', height: '40px', border: '3px solid rgba(99, 102, 241, 0.15)', borderTop: '3px solid #6366f1', borderRadius: '50%' }} />
      </div>
    );
  }

  // Derived stats
  const totalFees = feeAssignments.reduce((sum, f) => sum + f.total_fee, 0);
  const totalCollected = feeAssignments.reduce((sum, f) => sum + f.paid_amount, 0);
  const totalPending = feeAssignments.reduce((sum, f) => sum + f.pending_amount, 0);
  const overdueCount = installments.filter(i => i.status === 'overdue').length;
  const dueCount = installments.filter(i => i.status === 'due').length;
  const upcomingCount = installments.filter(i => i.status === 'upcoming').length;

  const pieData = [
    { name: 'Collected', value: totalCollected, color: '#10b981' },
    { name: 'Pending', value: totalPending, color: '#f59e0b' },
  ].filter(d => d.value > 0);

  const installmentPieData = [
    { name: 'Paid', value: installments.filter(i => i.status === 'paid').length, color: '#10b981' },
    { name: 'Due', value: dueCount, color: '#f59e0b' },
    { name: 'Overdue', value: overdueCount, color: '#ef4444' },
    { name: 'Upcoming', value: upcomingCount, color: '#3b82f6' },
  ].filter(d => d.value > 0);

  const filteredFees = feeAssignments.filter(f => {
    const matchesSearch = f.student_name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'all' || f.status === filterStatus;
    const matchesBatch = filterBatch === 'all' || f.batch_id === filterBatch;
    return matchesSearch && matchesStatus && matchesBatch;
  });

  const handleExport = () => {
    downloadCSV(filteredFees, 'fee_assignments_export.csv', [
      { header: 'Student Name', key: 'student_name' },
      { header: 'Batch', key: 'batch_name' },
      { header: 'Total Fee', key: 'total_fee' },
      { header: 'Paid Amount', key: 'paid_amount' },
      { header: 'Pending Amount', key: 'pending_amount' },
      { header: 'Installment Count', key: 'installment_count' },
      { header: 'Status', key: 'status' }
    ]);
  };

  const pendingInstallments = installments.filter(i => i.status === 'due' || i.status === 'overdue')
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());

  const allInstallments = installments.filter(i => i.student_name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#e2e8f0', marginBottom: '4px' }}>Fee Management</h1>
          <p style={{ fontSize: '14px', color: '#64748b' }}>Track fees, installments, and due payments</p>
        </div>
        <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
          onClick={handleExport}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: 'rgba(30, 41, 59, 0.5)', borderRadius: '12px', border: '1px solid rgba(99, 102, 241, 0.2)', color: '#e2e8f0', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
        >
          <Download size={16} /> Export CSV
        </motion.button>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <StatCard title="Total Fees Assigned" value={totalFees} icon={IndianRupee} isCurrency color="primary" index={0} />
        <StatCard title="Total Collected" value={totalCollected} icon={CheckCircle2} isCurrency color="success" index={1} />
        <StatCard title="Pending Dues" value={totalPending} icon={Clock} isCurrency color="warning" index={2} />
        <StatCard title="Overdue Installments" value={overdueCount} icon={AlertTriangle} color="danger" index={3} />
      </div>

      {/* Tab Buttons */}
      <motion.div variants={itemVariants} style={{ display: 'flex', gap: '4px', marginBottom: '20px', background: 'rgba(17, 24, 39, 0.6)', borderRadius: '12px', padding: '4px', border: '1px solid rgba(99, 102, 241, 0.08)', width: 'fit-content' }}>
        {[
          { key: 'overview' as const, label: 'Overview', icon: TrendingUp },
          { key: 'dues' as const, label: 'Pending Dues', icon: AlertTriangle },
          { key: 'installments' as const, label: 'All Installments', icon: Calendar },
        ].map(tab => (
          <motion.button key={tab.key} whileTap={{ scale: 0.97 }} onClick={() => setActiveTab(tab.key)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px', border: 'none',
              background: activeTab === tab.key ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.15))' : 'transparent',
              color: activeTab === tab.key ? '#e2e8f0' : '#64748b', fontSize: '13px', fontWeight: activeTab === tab.key ? 600 : 400,
              cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s',
            }}
          >
            <tab.icon size={15} />{tab.label}
          </motion.button>
        ))}
      </motion.div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          {/* Pie Chart */}
          <motion.div variants={itemVariants} style={{ background: 'rgba(17, 24, 39, 0.6)', backdropFilter: 'blur(16px)', border: '1px solid rgba(99, 102, 241, 0.08)', borderRadius: '16px', padding: '24px', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#e2e8f0', marginBottom: '16px' }}>Fee Collection Breakdown</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'center' }}>
              <div style={{ height: '200px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value" strokeWidth={0}>
                      {pieData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(99, 102, 241, 0.15)', borderRadius: '10px', fontSize: '12px', color: '#e2e8f0' }}
                      formatter={(value: number | undefined) => [formatCurrency(value ?? 0)]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {pieData.map(item => (
                  <div key={item.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: item.color, display: 'inline-block' }} />
                      <span style={{ fontSize: '13px', color: '#94a3b8' }}>{item.name}</span>
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: '#e2e8f0' }}>{formatCurrency(item.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Filters */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(30, 41, 59, 0.5)', borderRadius: '10px', padding: '10px 14px', border: '1px solid rgba(99, 102, 241, 0.08)', flex: 1, maxWidth: '300px' }}>
              <Search size={16} style={{ color: '#64748b' }} />
              <input type="text" placeholder="Search students..." value={search} onChange={e => setSearch(e.target.value)}
                style={{ background: 'none', border: 'none', outline: 'none', fontSize: '13px', color: '#e2e8f0', width: '100%', fontFamily: 'inherit' }} />
            </div>
            <select value={filterBatch} onChange={e => setFilterBatch(e.target.value)}
              style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(99, 102, 241, 0.08)', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', color: '#e2e8f0', cursor: 'pointer', fontFamily: 'inherit', outline: 'none' }}>
              <option value="all" style={{ background: '#1e293b' }}>All Batches</option>
              {batches.map(b => <option key={b.id} value={b.id} style={{ background: '#1e293b' }}>{b.name}</option>)}
            </select>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(99, 102, 241, 0.08)', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', color: '#e2e8f0', cursor: 'pointer', fontFamily: 'inherit', outline: 'none' }}>
              <option value="all" style={{ background: '#1e293b' }}>All Status</option>
              <option value="paid" style={{ background: '#1e293b' }}>Paid</option>
              <option value="partial" style={{ background: '#1e293b' }}>Partial</option>
              <option value="due" style={{ background: '#1e293b' }}>Due</option>
            </select>
          </div>

          {/* Fee Table */}
          <motion.div variants={itemVariants} className="glass-3d responsive-table-container">
            <div className="table-header" style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 1fr 1fr 1fr 0.7fr 40px', padding: '14px 20px', borderBottom: '1px solid rgba(99, 102, 241, 0.08)', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>
              <span>Student</span><span>Batch</span><span>Total Fee</span><span>Paid</span><span>Pending</span><span>Status</span><span></span>
            </div>
            
            <div className="table-body">
              {filteredFees.map(fee => {
                const progress = fee.total_fee > 0 ? (fee.paid_amount / fee.total_fee) * 100 : 0;
                const studentInstallments = installments.filter(inst => inst.student_id === fee.student_id);
                const isExpanded = expandedStudent === fee.id;

                return (
                  <motion.div key={fee.id} className="table-row">
                    <div onClick={() => setExpandedStudent(isExpanded ? null : fee.id)}
                      style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 1fr 1fr 1fr 0.7fr 40px', padding: '14px 20px', alignItems: 'center', borderBottom: '1px solid rgba(99, 102, 241, 0.04)', cursor: 'pointer', background: isExpanded ? 'rgba(99, 102, 241, 0.04)' : 'transparent', transition: 'background 0.2s' }}
                      onMouseEnter={e => { if (!isExpanded) (e.currentTarget as HTMLDivElement).style.background = 'rgba(30, 41, 59, 0.3)'; }}
                      onMouseLeave={e => { if (!isExpanded) (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.1))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '12px', color: '#818cf8', flexShrink: 0 }}>
                          {fee.student_name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div style={{ overflow: 'hidden' }}>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: '#e2e8f0', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{fee.student_name}</div>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>{fee.installment_count} installments</div>
                        </div>
                      </div>
                      
                      <div className="mobile-cell">
                        <span className="mobile-label">Batch:</span>
                        <span style={{ fontSize: '13px', color: '#94a3b8' }}>{fee.batch_name}</span>
                      </div>
                      
                      <div className="mobile-cell">
                        <span className="mobile-label">Total Fee:</span>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#e2e8f0' }}>{formatCurrency(fee.total_fee)}</span>
                      </div>
                      
                      <div className="mobile-cell">
                        <span className="mobile-label">Paid:</span>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: '#34d399' }}>{formatCurrency(fee.paid_amount)}</div>
                          <div style={{ height: '3px', width: '60px', background: 'rgba(30, 41, 59, 0.8)', borderRadius: '2px', marginTop: '4px', overflow: 'hidden', marginLeft: 'auto' }}>
                            <div style={{ height: '100%', width: `${progress}%`, borderRadius: '2px', background: progress >= 100 ? '#10b981' : '#6366f1', transition: 'width 0.5s ease' }} />
                          </div>
                        </div>
                      </div>
                      
                      <div className="mobile-cell">
                        <span className="mobile-label">Pending:</span>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: fee.pending_amount > 0 ? '#f87171' : '#34d399' }}>{formatCurrency(fee.pending_amount)}</span>
                      </div>
                      
                      <div className="mobile-cell">
                        <span className="mobile-label">Status:</span>
                        <StatusBadge status={fee.status} size="sm" />
                      </div>
                      
                      <div className="mobile-cell" style={{ borderBottom: 'none' }}>
                        <span className="mobile-label">Details:</span>
                        <motion.div animate={{ rotate: isExpanded ? 90 : 0 }} transition={{ duration: 0.2 }}>
                          <ChevronRight size={16} style={{ color: '#475569' }} />
                        </motion.div>
                      </div>
                    </div>

                    {isExpanded && studentInstallments.length > 0 && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} style={{ background: 'rgba(99, 102, 241, 0.03)', borderBottom: '1px solid rgba(99, 102, 241, 0.06)', padding: '16px 20px 16px 68px' }}>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: '#818cf8', marginBottom: '10px' }}>Installment Schedule</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {studentInstallments.map(inst => (
                          <div key={inst.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderRadius: '8px', background: inst.status === 'overdue' ? 'rgba(239, 68, 68, 0.06)' : 'rgba(30, 41, 59, 0.3)', border: `1px solid ${inst.status === 'overdue' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(99, 102, 241, 0.04)'}` }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <span style={{ fontSize: '12px', fontWeight: 600, color: '#e2e8f0' }}>#{inst.installment_number}</span>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#64748b' }}><Calendar size={12} /> {formatDate(inst.due_date)}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <span style={{ fontSize: '13px', fontWeight: 700, color: '#e2e8f0' }}>{formatCurrency(inst.amount)}</span>
                              <StatusBadge status={inst.status} size="sm" />
                            </div>
                          </div>
                        ))}
                      </div>
                      <Link href={`/dashboard/students/${fee.student_id}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '12px', fontSize: '12px', color: '#818cf8', textDecoration: 'none', fontWeight: 500 }}>
                        <Eye size={14} /> View Full Student Profile
                      </Link>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
            {filteredFees.length === 0 && <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>No fee assignments found.</div>}
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* PENDING DUES TAB */}
      {activeTab === 'dues' && (
        <motion.div key="dues" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
            {[
              { label: 'Overdue', value: overdueCount, color: '#ef4444', bg: 'rgba(239, 68, 68, 0.08)', border: 'rgba(239, 68, 68, 0.1)', icon: AlertTriangle },
              { label: 'Due (On Time)', value: dueCount, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.08)', border: 'rgba(245, 158, 11, 0.1)', icon: Clock },
              { label: 'Upcoming', value: upcomingCount, color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.08)', border: 'rgba(59, 130, 246, 0.1)', icon: Calendar },
            ].map(card => (
              <motion.div key={card.label} variants={itemVariants} whileHover={{ y: -2 }}
                style={{ background: card.bg, borderRadius: '14px', padding: '20px', border: `1px solid ${card.border}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <card.icon size={18} style={{ color: card.color }} />
                  <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 500 }}>{card.label}</span>
                </div>
                <p style={{ fontSize: '28px', fontWeight: 800, color: card.color }}>{card.value}</p>
              </motion.div>
            ))}
          </div>

          <motion.div variants={itemVariants} style={{ background: 'rgba(17, 24, 39, 0.6)', backdropFilter: 'blur(16px)', border: '1px solid rgba(99, 102, 241, 0.08)', borderRadius: '16px', overflow: 'hidden' }}>
            <div style={{ padding: '20px', borderBottom: '1px solid rgba(99, 102, 241, 0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#e2e8f0' }}>Overdue & Due Installments</h3>
              <span style={{ fontSize: '12px', padding: '4px 12px', borderRadius: '14px', background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', fontWeight: 600 }}>{pendingInstallments.length} pending</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 0.7fr 1fr 0.8fr 0.8fr', padding: '12px 20px', borderBottom: '1px solid rgba(99, 102, 241, 0.06)', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>
              <span>Student</span><span>Batch</span><span>Inst. #</span><span>Due Date</span><span>Amount</span><span>Status</span>
            </div>
            {pendingInstallments.map((inst, i) => (
              <div key={inst.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 0.7fr 1fr 0.8fr 0.8fr', padding: '14px 20px', alignItems: 'center', borderBottom: '1px solid rgba(99, 102, 241, 0.04)', background: inst.status === 'overdue' ? 'rgba(239, 68, 68, 0.03)' : 'transparent' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: inst.status === 'overdue' ? 'rgba(239, 68, 68, 0.1)' : 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.1))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '12px', color: inst.status === 'overdue' ? '#f87171' : '#818cf8' }}>
                    {inst.student_name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#e2e8f0' }}>{inst.student_name}</span>
                </div>
                <span style={{ fontSize: '13px', color: '#94a3b8' }}>{inst.batch_name}</span>
                <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 500 }}>#{inst.installment_number}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#94a3b8' }}><Calendar size={13} />{formatDate(inst.due_date)}</div>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#e2e8f0' }}>{formatCurrency(inst.amount)}</span>
                <StatusBadge status={inst.status} size="sm" />
              </div>
            ))}
            {pendingInstallments.length === 0 && <div style={{ padding: '40px', textAlign: 'center', color: '#34d399', fontSize: '14px' }}>🎉 No pending dues!</div>}
          </motion.div>
        </motion.div>
      )}

      {/* ALL INSTALLMENTS TAB */}
      {activeTab === 'installments' && (
        <motion.div key="installments" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
            <motion.div variants={itemVariants} style={{ background: 'rgba(17, 24, 39, 0.6)', backdropFilter: 'blur(16px)', border: '1px solid rgba(99, 102, 241, 0.08)', borderRadius: '16px', padding: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#e2e8f0', marginBottom: '16px' }}>Installment Status</h3>
              <div style={{ height: '160px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={installmentPieData} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={3} dataKey="value" strokeWidth={0}>
                      {installmentPieData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(99, 102, 241, 0.15)', borderRadius: '10px', fontSize: '12px', color: '#e2e8f0' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                {installmentPieData.map(item => (
                  <div key={item.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: item.color, display: 'inline-block' }} />
                      <span style={{ fontSize: '12px', color: '#94a3b8' }}>{item.name}</span>
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#e2e8f0' }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div variants={itemVariants} style={{ background: 'rgba(17, 24, 39, 0.6)', backdropFilter: 'blur(16px)', border: '1px solid rgba(99, 102, 241, 0.08)', borderRadius: '16px', overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(99, 102, 241, 0.08)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Search size={16} style={{ color: '#64748b' }} />
                <input type="text" placeholder="Search by student name..." value={search} onChange={e => setSearch(e.target.value)}
                  style={{ background: 'none', border: 'none', outline: 'none', fontSize: '13px', color: '#e2e8f0', width: '100%', fontFamily: 'inherit' }} />
              </div>
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {allInstallments.map(inst => (
                  <div key={inst.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', borderBottom: '1px solid rgba(99, 102, 241, 0.04)', background: inst.status === 'overdue' ? 'rgba(239, 68, 68, 0.03)' : 'transparent' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#e2e8f0' }}>{inst.student_name}</span>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>#{inst.installment_number} • {formatDate(inst.due_date)}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#e2e8f0' }}>{formatCurrency(inst.amount)}</span>
                      <StatusBadge status={inst.status} size="sm" />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
