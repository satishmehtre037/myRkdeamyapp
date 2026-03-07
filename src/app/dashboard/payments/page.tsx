'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Download, Trash2, FileText } from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';
import Modal from '@/components/ui/Modal';
import FeeReceipt from '@/components/ui/FeeReceipt';
import type { Payment, Student, Batch } from '@/lib/mock-data';
import { getPayments, getStudents, getBatches, addPayment, deletePayment } from '@/lib/api';
import { formatCurrency, formatDate, getPaymentMethodLabel, getInitials } from '@/lib/utils';
import { downloadCSV } from '@/utils/export';

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const itemVariants = { hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterMethod, setFilterMethod] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [receiptPayment, setReceiptPayment] = useState<Payment | null>(null);
  const [saving, setSaving] = useState(false);
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showStudentResults, setShowStudentResults] = useState(false);

  const loadData = async () => {
    try {
      const [p, s, b] = await Promise.all([getPayments(), getStudents(), getBatches()]);
      setPayments(p); setStudents(s); setBatches(b);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };
  useEffect(() => { loadData(); }, []);

  const sorted = [...payments].sort((a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime());
  const filtered = sorted.filter(p => {
    const match = p.student_name.toLowerCase().includes(search.toLowerCase()) || p.receipt_number.toLowerCase().includes(search.toLowerCase());
    const matchMethod = filterMethod === 'all' || p.payment_method === filterMethod;
    return match && matchMethod;
  });

  const handleExport = () => {
    downloadCSV(filtered, 'payments_export.csv', [
      { header: 'Receipt No.', key: 'receipt_number' },
      { header: 'Student Name', key: 'student_name' },
      { header: 'Batch', key: 'batch_name' },
      { header: 'Amount', key: 'amount' },
      { header: 'Date', key: 'payment_date' },
      { header: 'Method', key: (row) => getPaymentMethodLabel(row.payment_method) },
      { header: 'Status', key: 'status' }
    ]);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const form = new FormData(e.currentTarget);
    try {
      await addPayment({
        student_id: form.get('student_id') as string,
        amount: Number(form.get('amount')),
        payment_date: form.get('payment_date') as string,
        payment_method: form.get('payment_method') as string,
        receipt_number: `RK-${Date.now().toString().slice(-6)}`,
        notes: form.get('notes') as string,
      });
      setShowModal(false);
      setSelectedStudent(null);
      setStudentSearch('');
      await loadData();
    } catch (err) { console.error(err); alert('Failed to record payment'); } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this payment record?')) return;
    try { await deletePayment(id); await loadData(); } catch (err) { console.error(err); alert('Failed to delete'); }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          style={{ width: '40px', height: '40px', border: '3px solid rgba(99, 102, 241, 0.15)', borderTop: '3px solid #6366f1', borderRadius: '50%' }} />
      </div>
    );
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <motion.div variants={itemVariants} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#e2e8f0', marginBottom: '4px' }}>Payments</h1>
          <p style={{ fontSize: '14px', color: '#64748b' }}>{payments.length} transactions recorded</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            onClick={handleExport}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: 'rgba(30, 41, 59, 0.5)', borderRadius: '12px', border: '1px solid rgba(99, 102, 241, 0.2)', color: '#e2e8f0', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
          >
            <Download size={16} /> Export CSV
          </motion.button>
          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            onClick={() => setShowModal(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: '12px', border: 'none', color: 'white', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
          >
            <Plus size={16} /> Record Payment
          </motion.button>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(30, 41, 59, 0.5)', borderRadius: '10px', padding: '10px 14px', border: '1px solid rgba(99, 102, 241, 0.08)', flex: 1, maxWidth: '300px' }}>
          <Search size={16} style={{ color: '#64748b' }} />
          <input type="text" aria-label="Search payments" placeholder="Search payments..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ background: 'none', border: 'none', outline: 'none', fontSize: '13px', color: '#e2e8f0', width: '100%', fontFamily: 'inherit' }} />
        </div>
        <select aria-label="Filter payment method" value={filterMethod} onChange={e => setFilterMethod(e.target.value)}
          style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(99, 102, 241, 0.08)', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', color: '#e2e8f0', cursor: 'pointer', fontFamily: 'inherit', outline: 'none' }}
        >
          <option value="all" style={{ background: '#1e293b' }}>All Methods</option>
          <option value="cash" style={{ background: '#1e293b' }}>Cash</option>
          <option value="upi" style={{ background: '#1e293b' }}>UPI</option>
          <option value="bank_transfer" style={{ background: '#1e293b' }}>Bank Transfer</option>
          <option value="cheque" style={{ background: '#1e293b' }}>Cheque</option>
          <option value="card" style={{ background: '#1e293b' }}>Card</option>
        </select>
      </motion.div>

      <motion.div variants={itemVariants} className="glass-3d responsive-table-container">
        <div className="table-header" style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 1fr 1fr 0.8fr 0.8fr 80px', padding: '14px 20px', borderBottom: '1px solid rgba(99, 102, 241, 0.08)', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>
          <span>Student</span><span>Receipt</span><span>Amount</span><span>Date</span><span>Method</span><span>Status</span><span>Actions</span>
        </div>
        
        <div className="table-body">
          {filtered.map((payment, i) => (
            <motion.div key={payment.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.02 }}
              className="table-row"
              style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 1fr 1fr 0.8fr 0.8fr 80px', padding: '14px 20px', alignItems: 'center', borderBottom: '1px solid rgba(99, 102, 241, 0.04)', transition: 'background 0.2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(30, 41, 59, 0.3)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.1))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '12px', color: '#818cf8', flexShrink: 0 }}>
                  {getInitials(payment.student_name)}
                </div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{payment.student_name}</div>
              </div>
              
              <div className="mobile-cell">
                <span className="mobile-label">Receipt:</span>
                <span style={{ fontFamily: 'monospace', fontSize: '12px', color: '#818cf8' }}>{payment.receipt_number}</span>
              </div>
              
              <div className="mobile-cell">
                <span className="mobile-label">Amount:</span>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#34d399' }}>{formatCurrency(payment.amount)}</span>
              </div>
              
              <div className="mobile-cell">
                <span className="mobile-label">Date:</span>
                <span style={{ fontSize: '13px', color: '#94a3b8' }}>{formatDate(payment.payment_date)}</span>
              </div>
              
              <div className="mobile-cell">
                <span className="mobile-label">Method:</span>
                <span style={{ fontSize: '11px', padding: '4px 8px', borderRadius: '6px', background: 'rgba(30, 41, 59, 0.5)', color: '#94a3b8', fontWeight: 500 }}>{getPaymentMethodLabel(payment.payment_method)}</span>
              </div>
              
              <div className="mobile-cell">
                <span className="mobile-label">Status:</span>
                <StatusBadge status={payment.status} size="sm" />
              </div>
              
              <div className="mobile-actions" style={{ display: 'flex', gap: '6px' }}>
                <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} onClick={() => setReceiptPayment(payment)} title="View Receipt"
                  style={{ background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.15)', borderRadius: '6px', padding: '5px', cursor: 'pointer', color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                ><FileText size={14} /></motion.button>
                <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} onClick={() => handleDelete(payment.id)} title="Delete"
                  style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.15)', borderRadius: '6px', padding: '5px', cursor: 'pointer', color: '#f87171', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                ><Trash2 size={14} /></motion.button>
              </div>
            </motion.div>
          ))}
          {filtered.length === 0 && (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>No payments found.</div>
          )}
        </div>
      </motion.div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Record New Payment">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ position: 'relative' }}>
            <label htmlFor="studentSearch" style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: '6px' }}>Student</label>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}>
                <Search size={16} />
              </div>
              <input 
                id="studentSearch"
                type="text" 
                placeholder="Search name or student ID..." 
                value={selectedStudent ? selectedStudent.name : studentSearch}
                onChange={(e) => {
                  setStudentSearch(e.target.value);
                  setSelectedStudent(null);
                  setShowStudentResults(true);
                }}
                onFocus={() => setShowStudentResults(true)}
                autoComplete="off"
                style={{ 
                  width: '100%', 
                  padding: '10px 14px 10px 38px', 
                  background: 'rgba(30, 41, 59, 0.5)', 
                  border: '1px solid rgba(99, 102, 241, 0.08)', 
                  borderRadius: '10px', 
                  fontSize: '13px', 
                  color: '#e2e8f0', 
                  outline: 'none', 
                  fontFamily: 'inherit' 
                }} 
              />
              <input type="hidden" name="student_id" value={selectedStudent?.id || ''} required />
            </div>

            <AnimatePresence>
              {showStudentResults && studentSearch && !selectedStudent && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    zIndex: 100,
                    background: '#1e293b',
                    border: '1px solid rgba(99, 102, 241, 0.15)',
                    borderRadius: '12px',
                    marginTop: '4px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
                    maxHeight: '200px',
                    overflowY: 'auto'
                  }}
                >
                  {students
                    .filter(s => 
                      s.name.toLowerCase().includes(studentSearch.toLowerCase()) || 
                      s.id.toLowerCase().includes(studentSearch.toLowerCase())
                    )
                    .map(s => (
                      <div
                        key={s.id}
                        onClick={() => {
                          setSelectedStudent(s);
                          setShowStudentResults(false);
                          setStudentSearch('');
                        }}
                        style={{
                          padding: '10px 14px',
                          cursor: 'pointer',
                          borderBottom: '1px solid rgba(255,255,255,0.05)',
                          transition: 'background 0.2s'
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#e2e8f0' }}>{s.name}</div>
                        <div style={{ fontSize: '10px', color: '#64748b' }}>ID: {s.id.slice(0, 8)}... • {s.batch_name}</div>
                      </div>
                    ))}
                  {students.filter(s => 
                      s.name.toLowerCase().includes(studentSearch.toLowerCase()) || 
                      s.id.toLowerCase().includes(studentSearch.toLowerCase())
                  ).length === 0 && (
                    <div style={{ padding: '14px', textAlign: 'center', color: '#64748b', fontSize: '12px' }}>No students found</div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div>
            <label htmlFor="amount" style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: '6px' }}>Amount (₹)</label>
            <input id="amount" name="amount" type="number" required placeholder="0.00"
              style={{ width: '100%', padding: '10px 14px', background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(99, 102, 241, 0.08)', borderRadius: '10px', fontSize: '13px', color: '#e2e8f0', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label htmlFor="payment_date" style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: '6px' }}>Payment Date</label>
            <input id="payment_date" name="payment_date" type="date" required defaultValue={new Date().toISOString().split('T')[0]}
              style={{ width: '100%', padding: '10px 14px', background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(99, 102, 241, 0.08)', borderRadius: '10px', fontSize: '13px', color: '#e2e8f0', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label htmlFor="payment_method" style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: '6px' }}>Payment Method</label>
            <select id="payment_method" name="payment_method" required
              style={{ width: '100%', padding: '10px 14px', background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(99, 102, 241, 0.08)', borderRadius: '10px', fontSize: '13px', color: '#e2e8f0', cursor: 'pointer', fontFamily: 'inherit', outline: 'none' }}
            >
              <option value="cash" style={{ background: '#1e293b' }}>Cash</option>
              <option value="upi" style={{ background: '#1e293b' }}>UPI</option>
              <option value="bank_transfer" style={{ background: '#1e293b' }}>Bank Transfer</option>
              <option value="cheque" style={{ background: '#1e293b' }}>Cheque</option>
              <option value="card" style={{ background: '#1e293b' }}>Card</option>
            </select>
          </div>
          <div>
            <label htmlFor="notes" style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: '6px' }}>Notes (optional)</label>
            <input id="notes" name="notes" type="text" placeholder="Add any notes..."
              style={{ width: '100%', padding: '10px 14px', background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(99, 102, 241, 0.08)', borderRadius: '10px', fontSize: '13px', color: '#e2e8f0', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
          </div>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={saving}
            style={{ padding: '12px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: '10px', border: 'none', color: 'white', fontSize: '14px', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: saving ? 0.7 : 1 }}
          >
            {saving ? 'Recording...' : 'Record Payment'}
          </motion.button>
        </form>
      </Modal>

      {receiptPayment && (() => {
        const student = students.find(s => s.id === receiptPayment.student_id);
        const studentPayments = payments.filter(p => p.student_id === receiptPayment.student_id).sort((a,b) => new Date(a.payment_date).getTime() - new Date(b.payment_date).getTime());
        const totalPaid = student?.paid_amount || receiptPayment.amount;
        const totalFee = student?.total_fee || receiptPayment.amount;
        const pendingAmount = student?.pending_amount || 0;

        const paymentHistory = studentPayments.map(p => ({
          dueDate: p.payment_date,
          paymentDate: p.payment_date,
          amount: p.amount,
          paymentMethod: p.payment_method,
          receiptNumber: p.receipt_number,
          status: p.status
        }));

        return (
          <FeeReceipt isOpen={true} onClose={() => setReceiptPayment(null)}
            data={{ 
              receiptNumber: receiptPayment.receipt_number, 
              studentName: receiptPayment.student_name, 
              studentEmail: student?.email || 'admin@rkdeamy.com', 
              studentPhone: student?.phone || '-', 
              batchName: receiptPayment.batch_name, 
              amount: receiptPayment.amount, 
              paymentDate: receiptPayment.payment_date, 
              paymentMethod: receiptPayment.payment_method, 
              installmentNumber: receiptPayment.installment_number,
              address: 'Sec-3, Koparkhairane, Navi Mumbai',
              attendanceId: `ATT-${student?.id.split('-')[1] || '101'}`,
              enrollmentDate: student?.joined_at,
              academicSession: '2025-2026',
              totalPayable: totalFee,
              totalPaid: totalPaid,
              pendingAmount: pendingAmount,
              baseAmount: totalFee,
              totalAmount: totalFee,
              paymentHistory
            }}
          />
        );
      })()}
    </motion.div>
  );
}
