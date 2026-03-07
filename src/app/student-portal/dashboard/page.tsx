'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { LogOut, Calendar, Clock, CreditCard, Receipt, AlertCircle, CheckCircle2 } from 'lucide-react';
import { getStudentById, getStudentInstallments, getStudentPayments } from '@/lib/api';
import type { Student, Installment, Payment } from '@/lib/mock-data';
import { formatCurrency, formatDate } from '@/lib/utils';
import StatusBadge from '@/components/ui/StatusBadge';
import FeeReceipt from '@/components/ui/FeeReceipt';
import { useSearchParams } from 'next/navigation';
import Script from 'next/script';

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export default function StudentDashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Loading...</div>}>
      <StudentDashboard />
    </Suspense>
  );
}

function StudentDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [student, setStudent] = useState<Student | null>(null);
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [customAmounts, setCustomAmounts] = useState<Record<string, string>>({});
  const [receiptPayment, setReceiptPayment] = useState<Payment | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle Return Messages strictly via URL redirects/errors if needed
  useEffect(() => {
    const errorMsg = searchParams.get('error');
    if (errorMsg) {
      alert(`Notice: ${errorMsg}`);
      router.replace('/student-portal/dashboard');
    }
  }, [searchParams, router]);

  useEffect(() => {
    const studentId = localStorage.getItem('student_id');
    if (!studentId) {
      router.push('/student-portal');
      return;
    }

    async function fetchData() {
      try {
        const [sData, iData, pData] = await Promise.all([
          getStudentById(studentId!),
          getStudentInstallments(studentId!),
          getStudentPayments(studentId!)
        ]);
        
        if (!sData) {
          localStorage.removeItem('student_id');
          router.push('/student-portal');
          return;
        }

        setStudent(sData);
        setInstallments(iData);
        setPayments(pData);
      } catch (err) {
        console.error('Failed to load student data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('student_id');
    router.push('/student-portal');
  };

  const handlePay = async (installment: Installment | null, amountOverride?: number) => {
    if (!student) return;

    if (student.pending_amount <= 0) {
      alert('You have no pending balance to pay!');
      return;
    }
    
    // Check if script is loaded
    if (!('Razorpay' in window)) {
      alert('Payment gateway is still loading. Please try again in a moment.');
      return;
    }

    try {
      // 1. Create Order via our Backend API
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          installmentId: installment?.id || null,
          studentId: student.id,
          amount: amountOverride
        })
      });
      
      const orderConfig = await res.json();
      
      if (orderConfig.error) {
        alert(orderConfig.error || 'Failed to initialize payment gateway.');
        return;
      }

      // 2. Open Razorpay Checktout Modal
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderConfig.amount,
        currency: orderConfig.currency,
        name: 'RKDeamy Classes',
        description: installment ? `Installment #${installment.installment_number}` : 'Remaining Course Balance',
        image: 'https://rkdemy.com/wp-content/uploads/2019/02/rkdemy-logo-white-1.png',
        order_id: orderConfig.id,
        prefill: {
          name: orderConfig.studentName || '',
          email: orderConfig.studentEmail || '',
          contact: orderConfig.studentPhone || '',
        },
        theme: {
          color: '#38bdf8',
        },
        handler: async function (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) {
          try {
            // 3. Verify Payment Signature Backend Route
            const verifyRes = await fetch('/api/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                studentId: student.id,
                installmentId: installment?.id || null,
              })
            });

            const verifyData = await verifyRes.json();
            
            if (verifyData.success) {
              alert(`Payment successful! Receipt: ${verifyData.receipt}`);
              window.location.reload(); // Reload dashboard to fetch fresh data
            } else {
              alert(verifyData.error || 'Payment verification failed.');
            }
          } catch (err) {
            console.error('Verification Error:', err);
            alert('An error occurred while verifying the payment.');
          }
        },
      };

      const Razorpay = (window as unknown as { Razorpay: new (options: unknown) => { on: (event: string, handler: (response: { error: { description: string } }) => void) => void; open: () => void } }).Razorpay;
      const rzp = new Razorpay(options);
      
      rzp.on('payment.failed', function (response: { error: { description: string } }){
        alert(`Payment Failed: ${response.error.description}`);
      });

      rzp.open();

    } catch (err) {
      console.error(err);
      alert('An error occurred while connecting to the payment gateway.');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0f172a' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          style={{ width: '40px', height: '40px', border: '3px solid rgba(56, 189, 248, 0.15)', borderTop: '3px solid #38bdf8', borderRadius: '50%' }} />
      </div>
    );
  }

  if (!student) return null;

  const pendingInstallments = installments.filter(i => i.status === 'due' || i.status === 'overdue');
  const upcomingInstallments = installments.filter(i => i.status === 'upcoming');

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', flexDirection: 'column' }}>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      {/* Dynamic Top Bar */}
      <header style={{ 
        background: scrolled ? 'rgba(15, 23, 42, 0.95)' : 'rgba(15, 23, 42, 0.8)', 
        backdropFilter: 'blur(16px)', 
        borderBottom: `1px solid ${scrolled ? 'rgba(56, 189, 248, 0.2)' : 'rgba(148, 163, 184, 0.1)'}`, 
        padding: scrolled ? '12px 24px' : '16px 24px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        transition: 'all 0.3s ease'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            height: '40px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <img src="https://rkdemy.com/wp-content/uploads/2019/02/rkdemy-logo-white-1.png" alt="RKDeamy" style={{ height: '32px', width: 'auto', objectFit: 'contain' }} />
          </div>
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: 700, color: '#f8fafc', margin: 0, display: 'none' }}>RKDeamy Classes</h1>
            <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>Student Portal</p>
          </div>
        </div>

        <motion.button 
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={handleLogout}
          style={{ 
            display: 'flex', alignItems: 'center', gap: '8px', 
            background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', 
            padding: '8px 16px', borderRadius: '8px', color: '#fca5a5', 
            fontSize: '13px', fontWeight: 600, cursor: 'pointer' 
          }}
        >
          <LogOut size={16} /> <span className="hide-on-mobile">Logout</span>
        </motion.button>
      </header>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '32px 24px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <motion.div variants={containerVariants} initial="hidden" animate="visible" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Welcome & Overview Card */}
          <motion.div variants={itemVariants} className="glass-3d hover-3d" style={{
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9))',
            border: '1px solid rgba(56, 189, 248, 0.15)',
            borderRadius: '20px',
            padding: '32px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(56, 189, 248, 0.1), transparent 70%)', borderRadius: '50%', filter: 'blur(30px)' }} />
            
            <h2 style={{ fontSize: '28px', fontWeight: 800, color: '#f8fafc', marginBottom: '8px' }}>Welcome back, {student.name.split(' ')[0]}!</h2>
            <p style={{ fontSize: '15px', color: '#cbd5e1', marginBottom: '24px' }}>You are enrolled in the <strong style={{ color: '#f8fafc' }}>{student.batch_name}</strong> batch.</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(148, 163, 184, 0.08)' }}>
                <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '4px' }}>Total Course Fee</p>
                <p style={{ fontSize: '20px', fontWeight: 700, color: '#f8fafc' }}>{formatCurrency(student.total_fee)}</p>
              </div>
              <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(148, 163, 184, 0.08)' }}>
                <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '4px' }}>Amount Paid</p>
                <p style={{ fontSize: '20px', fontWeight: 700, color: '#34d399' }}>{formatCurrency(student.paid_amount)}</p>
              </div>
              <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(148, 163, 184, 0.08)' }}>
                <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '4px' }}>Pending Balance</p>
                <p style={{ fontSize: '20px', fontWeight: 700, color: student.pending_amount > 0 ? '#f87171' : '#34d399' }}>{formatCurrency(student.pending_amount)}</p>
              </div>
            </div>
          </motion.div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} className="w-full">
            
            {/* Installments & Action Card */}
            <motion.div variants={itemVariants} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CreditCard size={20} color="#38bdf8" /> Fee Payments
              </h3>

              {/* Pending Dues */}
              {(pendingInstallments.length > 0 || Number(student.pending_amount) > 0) ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {pendingInstallments.map(inst => (
                    <div key={inst.id} style={{ 
                      background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9))', 
                      border: `1px solid ${inst.status === 'overdue' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`, 
                      borderRadius: '16px', padding: '20px', display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'space-between', alignItems: 'center' 
                    }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span style={{ fontSize: '14px', fontWeight: 600, color: '#f8fafc' }}>Installment #{inst.installment_number}</span>
                          <StatusBadge status={inst.status} size="sm" />
                        </div>
                        <div style={{ fontSize: '13px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Calendar size={14} /> Due by {formatDate(inst.due_date)}
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '240px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ position: 'relative', flex: 1 }}>
                            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '14px' }}>₹</span>
                            <input 
                              type="number"
                              placeholder="Custom amount"
                              value={customAmounts[inst.id] || ''}
                              onChange={(e) => setCustomAmounts({ ...customAmounts, [inst.id]: e.target.value })}
                              style={{
                                width: '100%',
                                background: 'rgba(15, 23, 42, 0.4)',
                                border: '1px solid rgba(148, 163, 184, 0.1)',
                                borderRadius: '10px',
                                padding: '10px 12px 10px 24px',
                                color: '#f8fafc',
                                fontSize: '13px',
                                outline: 'none'
                              }}
                            />
                          </div>
                          <motion.button 
                            whileHover={Number(student.pending_amount) > 0 ? { scale: 1.05 } : {}} whileTap={Number(student.pending_amount) > 0 ? { scale: 0.95 } : {}}
                            onClick={() => Number(student.pending_amount) > 0 && handlePay(inst, customAmounts[inst.id] ? Number(customAmounts[inst.id]) : undefined)}
                            disabled={Number(student.pending_amount) <= 0}
                            style={{ 
                              background: Number(student.pending_amount) > 0 ? 'linear-gradient(135deg, #38bdf8, #2563eb)' : 'rgba(148, 163, 184, 0.1)', 
                              border: 'none', 
                              padding: '10px 20px', borderRadius: '10px', color: Number(student.pending_amount) > 0 ? 'white' : '#64748b', 
                              fontSize: '14px', fontWeight: 600, cursor: Number(student.pending_amount) > 0 ? 'pointer' : 'not-allowed', 
                              boxShadow: Number(student.pending_amount) > 0 ? '0 4px 15px rgba(56, 189, 248, 0.3)' : 'none' 
                            }}
                          >
                            {Number(student.pending_amount) <= 0 ? 'Paid' : customAmounts[inst.id] ? `Pay Custom` : 'Pay Full'}
                          </motion.button>
                        </div>
                        <p style={{ fontSize: '11px', color: '#64748b', margin: 0, textAlign: 'right' }}>
                          Full: {formatCurrency(inst.amount)}
                        </p>
                      </div>
                    </div>
                  ))}

                  {/* Fallback for general balance if no installments are pending OR if force showing is needed */}
                  {Number(student.pending_amount) > 0 && (
                    <div style={{ 
                      background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9))', 
                      border: '1px solid rgba(56, 189, 248, 0.3)', 
                      borderRadius: '16px', padding: '20px', display: 'flex', flexWrap: 'wrap', gap: '16px', justifyContent: 'space-between', alignItems: 'center',
                      marginTop: pendingInstallments.length > 0 ? '12px' : 0
                    }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span style={{ fontSize: '14px', fontWeight: 600, color: '#f8fafc' }}>Remaining Course Balance</span>
                          <StatusBadge status="due" size="sm" />
                        </div>
                        <div style={{ fontSize: '13px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <AlertCircle size={14} /> Final outstanding amount to be cleared
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '240px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ position: 'relative', flex: 1 }}>
                            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '14px' }}>₹</span>
                            <input 
                              type="number"
                              placeholder="Amount to pay"
                              value={customAmounts['general'] || ''}
                              onChange={(e) => setCustomAmounts({ ...customAmounts, general: e.target.value })}
                              style={{
                                width: '100%',
                                background: 'rgba(15, 23, 42, 0.4)',
                                border: '1px solid rgba(148, 163, 184, 0.1)',
                                borderRadius: '10px',
                                padding: '10px 12px 10px 24px',
                                color: '#f8fafc',
                                fontSize: '13px',
                                outline: 'none'
                              }}
                            />
                          </div>
                          <motion.button 
                            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            onClick={() => handlePay(null, customAmounts['general'] ? Number(customAmounts['general']) : student.pending_amount)}
                            style={{ 
                              background: 'linear-gradient(135deg, #38bdf8, #2563eb)', 
                              border: 'none', 
                              padding: '10px 20px', borderRadius: '10px', color: 'white', 
                              fontSize: '14px', fontWeight: 600, cursor: 'pointer', 
                              boxShadow: '0 4px 15px rgba(56, 189, 248, 0.3)' 
                            }}
                          >
                            {customAmounts['general'] ? `Pay Custom` : 'Pay Balance'}
                          </motion.button>
                        </div>
                        <p style={{ fontSize: '11px', color: '#64748b', margin: 0, textAlign: 'right' }}>
                          Total Remaining: {formatCurrency(student.pending_amount)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ background: 'rgba(30, 41, 59, 0.6)', border: '1px solid rgba(52, 211, 153, 0.2)', borderRadius: '16px', padding: '24px', textAlign: 'center' }}>
                  <CheckCircle2 size={32} color="#34d399" style={{ margin: '0 auto 12px' }} />
                  <h4 style={{ fontSize: '16px', color: '#f8fafc', marginBottom: '4px' }}>All caught up!</h4>
                  <p style={{ fontSize: '13px', color: '#94a3b8' }}>You have no pending fee dues.</p>
                </div>
              )}


              {/* Upcoming */}
              {upcomingInstallments.length > 0 && (
                <div style={{ marginTop: '16px' }}>
                  <h4 style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '12px' }}>Upcoming Schedule</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {upcomingInstallments.map(inst => (
                      <div key={inst.id} style={{ 
                        background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(148, 163, 184, 0.1)', 
                        borderRadius: '12px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' 
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ fontSize: '14px', fontWeight: 500, color: '#cbd5e1' }}>Installment #{inst.installment_number}</span>
                          <span style={{ fontSize: '13px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /> {formatDate(inst.due_date)}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ position: 'relative', width: '140px' }}>
                            <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '12px' }}>₹</span>
                            <input 
                              type="number"
                              placeholder="Partial"
                              value={customAmounts[inst.id] || ''}
                              onChange={(e) => setCustomAmounts({ ...customAmounts, [inst.id]: e.target.value })}
                              style={{
                                width: '100%',
                                background: 'rgba(15, 23, 42, 0.4)',
                                border: '1px solid rgba(148, 163, 184, 0.1)',
                                borderRadius: '8px',
                                padding: '6px 10px 6px 20px',
                                color: '#f8fafc',
                                fontSize: '12px',
                                outline: 'none'
                              }}
                            />
                          </div>
                          <motion.button 
                            whileHover={student.pending_amount > 0 ? { scale: 1.05 } : {}} whileTap={student.pending_amount > 0 ? { scale: 0.95 } : {}}
                            onClick={() => student.pending_amount > 0 && handlePay(inst, customAmounts[inst.id] ? Number(customAmounts[inst.id]) : undefined)} 
                            disabled={student.pending_amount <= 0}
                            style={{ 
                              background: student.pending_amount > 0 ? 'transparent' : 'rgba(148, 163, 184, 0.1)', 
                              border: student.pending_amount > 0 ? '1px solid #38bdf8' : '1px solid rgba(148, 163, 184, 0.2)', 
                              color: student.pending_amount > 0 ? '#38bdf8' : '#64748b', 
                              padding: '6px 12px', borderRadius: '6px', fontSize: '12px', 
                              cursor: student.pending_amount > 0 ? 'pointer' : 'not-allowed'
                            }}
                          >
                            {student.pending_amount <= 0 ? 'Settled' : customAmounts[inst.id] ? 'Pay Custom' : 'Pay Early'}
                          </motion.button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Payment History Card */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
            >
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Receipt size={20} color="#818cf8" /> Payment History
              </h3>
              
              <div style={{ 
                background: 'rgba(30, 41, 59, 0.6)', border: '1px solid rgba(148, 163, 184, 0.1)', 
                borderRadius: '16px', overflow: 'hidden', height: '100%', minHeight: '300px'
              }}>
                {payments.length > 0 ? (
                  <div>
                    {payments.map((payment, idx) => (
                      <motion.div 
                        key={payment.id} 
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.05 }}
                        style={{ 
                          padding: '16px 20px', borderBottom: idx !== payments.length - 1 ? '1px solid rgba(148, 163, 184, 0.08)' : 'none',
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(15, 23, 42, 0.4)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '14px', fontWeight: 600, color: '#f8fafc', marginBottom: '2px' }}>{formatCurrency(payment.amount)}</div>
                          <div style={{ fontSize: '12px', color: '#94a3b8', fontFamily: 'monospace' }}>Receipt: {payment.receipt_number}</div>
                        </div>
                        <div style={{ flex: 1, textAlign: 'center' }}>
                          <motion.button 
                            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            onClick={() => setReceiptPayment(payment)}
                            style={{ 
                              background: 'rgba(129, 140, 248, 0.1)', border: '1px solid rgba(129, 140, 248, 0.2)', 
                              padding: '6px 12px', borderRadius: '8px', color: '#818cf8', 
                              fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px'
                            }}
                          >
                            <Receipt size={14} /> View Receipt
                          </motion.button>
                        </div>
                        <div style={{ flex: 1, textAlign: 'right' }}>
                          <StatusBadge status={payment.status} size="sm" />
                          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>{formatDate(payment.payment_date)}</div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: '300px', color: '#64748b' }}>
                    <Receipt size={40} style={{ marginBottom: '16px', opacity: 0.5 }} />
                    <p style={{ fontSize: '14px' }}>No payments recorded yet.</p>
                  </div>
                )}
              </div>
            </motion.div>

          </div>
        </motion.div>
      </main>

      {receiptPayment && (() => {
        const studentPayments = payments.filter(p => p.student_id === student.id).sort((a,b) => new Date(a.payment_date).getTime() - new Date(b.payment_date).getTime());
        const paymentHistory = studentPayments.map(p => ({
          dueDate: p.payment_date,
          paymentDate: p.payment_date,
          amount: p.amount,
          paymentMethod: p.payment_method,
          receiptNumber: p.receipt_number,
          status: p.status
        }));

        return (
          <FeeReceipt 
            isOpen={true} 
            onClose={() => setReceiptPayment(null)}
            data={{ 
              receiptNumber: receiptPayment.receipt_number, 
              studentName: student.name, 
              studentEmail: student.email || 'admin@rkdeamy.com', 
              studentPhone: student.phone || '-', 
              batchName: student.batch_name, 
              amount: receiptPayment.amount, 
              paymentDate: receiptPayment.payment_date, 
              paymentMethod: receiptPayment.payment_method, 
              installmentNumber: receiptPayment.installment_number,
              address: 'Sec-3, Koparkhairane, Navi Mumbai',
              attendanceId: `ATT-${student.id.split('-')[1] || '101'}`,
              enrollmentDate: student.joined_at,
              academicSession: '2025-2026',
              totalPayable: student.total_fee,
              totalPaid: student.paid_amount,
              pendingAmount: student.pending_amount,
              baseAmount: student.total_fee,
              totalAmount: student.total_fee,
              paymentHistory
            }}
          />
        );
      })()}
    </div>
  );
}
