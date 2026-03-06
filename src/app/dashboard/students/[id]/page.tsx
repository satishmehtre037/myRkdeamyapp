'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, Phone, Calendar, IndianRupee, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';
import type { Student, Payment, Installment } from '@/lib/mock-data';
import { getStudentById, getStudentPayments, getStudentInstallments } from '@/lib/api';
import { formatCurrency, formatDate, getInitials, getPaymentMethodLabel } from '@/lib/utils';
import Link from 'next/link';
import { useParams } from 'next/navigation';

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const itemVariants = { hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export default function StudentDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [student, setStudent] = useState<Student | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [s, p, i] = await Promise.all([
          getStudentById(id),
          getStudentPayments(id),
          getStudentInstallments(id),
        ]);
        setStudent(s);
        setPayments(p);
        setInstallments(i);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          style={{ width: '40px', height: '40px', border: '3px solid rgba(99, 102, 241, 0.15)', borderTop: '3px solid #6366f1', borderRadius: '50%' }} />
      </div>
    );
  }

  if (!student) {
    return (
      <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
        <h2 style={{ color: '#e2e8f0', marginBottom: '8px' }}>Student Not Found</h2>
        <Link href="/dashboard/students" style={{ color: '#818cf8', textDecoration: 'none' }}>← Back to Students</Link>
      </div>
    );
  }

  const progress = student.total_fee > 0 ? (student.paid_amount / student.total_fee) * 100 : 0;

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      {/* Header */}
      <motion.div variants={itemVariants} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <Link href="/dashboard/students" style={{ textDecoration: 'none' }}>
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(99, 102, 241, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#94a3b8' }}>
            <ArrowLeft size={18} />
          </motion.div>
        </Link>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#e2e8f0' }}>{student.name}</h1>
          <p style={{ fontSize: '13px', color: '#64748b' }}>{student.batch_name}</p>
        </div>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '20px', marginBottom: '24px' }}>
        {/* Profile Card */}
        <motion.div variants={itemVariants} style={{ background: 'rgba(17, 24, 39, 0.6)', backdropFilter: 'blur(16px)', border: '1px solid rgba(99, 102, 241, 0.08)', borderRadius: '16px', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '20px', color: 'white' }}>
              {getInitials(student.name)}
            </div>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#e2e8f0' }}>{student.name}</div>
              <StatusBadge status={student.status} size="sm" />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { icon: Mail, label: student.email },
              { icon: Phone, label: student.phone },
              { icon: Calendar, label: `Joined ${formatDate(student.joined_at)}` },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <item.icon size={16} style={{ color: '#64748b' }} />
                <span style={{ fontSize: '13px', color: '#94a3b8' }}>{item.label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Fee Summary */}
        <motion.div variants={itemVariants} style={{ background: 'rgba(17, 24, 39, 0.6)', backdropFilter: 'blur(16px)', border: '1px solid rgba(99, 102, 241, 0.08)', borderRadius: '16px', padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#e2e8f0', marginBottom: '20px' }}>Fee Summary</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            {[
              { label: 'Total Fee', value: student.total_fee, color: '#818cf8', icon: IndianRupee },
              { label: 'Paid', value: student.paid_amount, color: '#34d399', icon: CheckCircle2 },
              { label: 'Pending', value: student.pending_amount, color: student.pending_amount > 0 ? '#f87171' : '#34d399', icon: Clock },
            ].map(item => (
              <div key={item.label} style={{ background: 'rgba(30, 41, 59, 0.3)', borderRadius: '12px', padding: '14px', textAlign: 'center' }}>
                <item.icon size={18} style={{ color: item.color, marginBottom: '6px' }} />
                <div style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', marginBottom: '4px' }}>{item.label}</div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: item.color }}>{formatCurrency(item.value)}</div>
              </div>
            ))}
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '12px', color: '#94a3b8' }}>Payment Progress</span>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#e2e8f0' }}>{progress.toFixed(0)}%</span>
            </div>
            <div style={{ height: '8px', borderRadius: '4px', background: 'rgba(30, 41, 59, 0.8)', overflow: 'hidden' }}>
              <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }}
                transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }}
                style={{ height: '100%', borderRadius: '4px', background: progress >= 100 ? 'linear-gradient(90deg, #10b981, #34d399)' : 'linear-gradient(90deg, #6366f1, #8b5cf6)' }} />
            </div>
          </div>
        </motion.div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Payment History */}
        <motion.div variants={itemVariants} style={{ background: 'rgba(17, 24, 39, 0.6)', backdropFilter: 'blur(16px)', border: '1px solid rgba(99, 102, 241, 0.08)', borderRadius: '16px', padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#e2e8f0', marginBottom: '16px' }}>Payment History</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {payments.map(p => (
              <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', borderRadius: '8px', background: 'rgba(30, 41, 59, 0.3)' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#34d399' }}>+{formatCurrency(p.amount)}</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>{formatDate(p.payment_date)} • {getPaymentMethodLabel(p.payment_method)}</div>
                </div>
                <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#818cf8' }}>{p.receipt_number}</span>
              </div>
            ))}
            {payments.length === 0 && <p style={{ fontSize: '13px', color: '#64748b', textAlign: 'center', padding: '20px' }}>No payments recorded</p>}
          </div>
        </motion.div>

        {/* Installment Schedule */}
        <motion.div variants={itemVariants} style={{ background: 'rgba(17, 24, 39, 0.6)', backdropFilter: 'blur(16px)', border: '1px solid rgba(99, 102, 241, 0.08)', borderRadius: '16px', padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#e2e8f0', marginBottom: '16px' }}>Installment Schedule</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {installments.map(inst => (
              <div key={inst.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', borderRadius: '8px',
                background: inst.status === 'overdue' ? 'rgba(239, 68, 68, 0.06)' : 'rgba(30, 41, 59, 0.3)',
                border: `1px solid ${inst.status === 'overdue' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(99, 102, 241, 0.04)'}`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#e2e8f0' }}>#{inst.installment_number}</span>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>{formatDate(inst.due_date)}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#e2e8f0' }}>{formatCurrency(inst.amount)}</span>
                  <StatusBadge status={inst.status} size="sm" />
                </div>
              </div>
            ))}
            {installments.length === 0 && <p style={{ fontSize: '13px', color: '#64748b', textAlign: 'center', padding: '20px' }}>No installments assigned</p>}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
