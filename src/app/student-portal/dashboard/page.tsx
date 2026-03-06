'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { LogOut, GraduationCap, Calendar, Clock, CreditCard, Receipt, AlertCircle, CheckCircle2 } from 'lucide-react';
import { getStudentById, getStudentInstallments, getStudentPayments } from '@/lib/api';
import type { Student, Installment, Payment } from '@/lib/mock-data';
import { formatCurrency, formatDate } from '@/lib/utils';
import StatusBadge from '@/components/ui/StatusBadge';
import { useSearchParams } from 'next/navigation';
import { load } from '@cashfreepayments/cashfree-js';

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export default function StudentDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [student, setStudent] = useState<Student | null>(null);
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [cashfree, setCashfree] = useState<any>(null);

  // Initialize Cashfree SDK
  useEffect(() => {
    async function initCashfree() {
      try {
        const cf = await load({
          mode: process.env.NEXT_PUBLIC_CASHFREE_ENVIRONMENT === 'PRODUCTION' ? 'production' : 'sandbox',
        });
        setCashfree(cf);
      } catch (err) {
        console.error('Failed to load Cashfree SDK', err);
      }
    }
    initCashfree();
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
        
        // Also check if we just returned from a Cashfree checkout redirect
        const returnOrderId = searchParams.get('order_id');
        if (returnOrderId) {
          try {
            // Find which installment this order belonged to (it's embedded in the order_id: order_{inst_id}_{timestamp})
            const orderParts = returnOrderId.split('_');
            const partialInstId = orderParts[1];
            // Simple match to find full installment ID
            const matchedInst = iData.find((i: Installment) => i.id.startsWith(partialInstId));

            if (matchedInst) {
              const verifyRes = await fetch('/api/verify-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  order_id: returnOrderId,
                  studentId: studentId,
                  installmentId: matchedInst.id,
                })
              });
              
              const verifyData = await verifyRes.json();
              if (verifyData.success) {
                alert(`Payment successful! Receipt: ${verifyData.receipt}`);
                // Re-fetch to get fresh data immediately
                window.location.replace('/student-portal/dashboard');
                return;
              } else {
                alert(verifyData.error || 'Payment verification failed, or it was already processed.');
                window.location.replace('/student-portal/dashboard');
                return;
              }
            }
          } catch(e) {
            console.error(e);
          }
        }

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

  const handlePay = async (installment: Installment) => {
    if (!student) return;
    
    if (!cashfree) {
      alert('Payment gateway is still initializing. Please try again in a moment.');
      return;
    }

    try {
      // 1. Create Order via our Backend API
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          installmentId: installment.id,
          studentId: student.id,
        })
      });
      
      const orderConfig = await res.json();
      
      if (orderConfig.error || !orderConfig.payment_session_id) {
        alert(orderConfig.error || 'Failed to initialize payment gateway.');
        return;
      }

      // 2. Open Cashfree Checkout Modal
      const checkoutOptions = {
        paymentSessionId: orderConfig.payment_session_id,
        redirectTarget: '_modal', // Open within the same page
      };

      cashfree.checkout(checkoutOptions).then((result: any) => {
         // This block handles what happens when modal is closed
         if(result.error){
            console.error(result.error);
            alert(`Payment Failed: ${result.error.message || 'Unknown Error'}`);
         }
         if(result.redirect){
            // If redirecting to the returnUrl, our useEffect on mount will catch it (see above)
            console.log("Redirecting for verification...");
         }
         if(result.paymentDetails){
            console.log("Payment Details inside modal popup", result.paymentDetails);
         }
      });

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
      {/* Dynamic Top Bar */}
      <header style={{ 
        background: 'rgba(15, 23, 42, 0.8)', 
        backdropFilter: 'blur(16px)', 
        borderBottom: '1px solid rgba(148, 163, 184, 0.1)', 
        padding: '16px 24px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 40
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '12px',
            background: 'linear-gradient(135deg, #38bdf8, #818cf8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 15px rgba(56, 189, 248, 0.3)',
          }}>
            <GraduationCap size={20} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: 700, color: '#f8fafc', margin: 0 }}>RKDeamy Classes</h1>
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
          <motion.div variants={itemVariants} style={{
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px', '@media (min-width: 1024px)': { gridTemplateColumns: '1fr 1fr' } } as any}>
            
            {/* Installments & Action Card */}
            <motion.div variants={itemVariants} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CreditCard size={20} color="#38bdf8" /> Fee Payments
              </h3>

              {/* Pending Dues */}
              {pendingInstallments.length > 0 ? (
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
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <span style={{ fontSize: '20px', fontWeight: 800, color: '#f8fafc' }}>{formatCurrency(inst.amount)}</span>
                        <motion.button 
                          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                          onClick={() => handlePay(inst)}
                          style={{ 
                            background: 'linear-gradient(135deg, #38bdf8, #2563eb)', border: 'none', 
                            padding: '10px 20px', borderRadius: '10px', color: 'white', 
                            fontSize: '14px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 15px rgba(56, 189, 248, 0.3)' 
                          }}
                        >
                          Pay Now
                        </motion.button>
                      </div>
                    </div>
                  ))}
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <span style={{ fontSize: '15px', fontWeight: 600, color: '#e2e8f0' }}>{formatCurrency(inst.amount)}</span>
                          <motion.button 
                            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            onClick={() => handlePay(inst)} 
                            style={{ 
                              background: 'transparent', border: '1px solid #38bdf8', color: '#38bdf8', 
                              padding: '6px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' 
                            }}
                          >
                            Pay Early
                          </motion.button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Payment History Card */}
            <motion.div variants={itemVariants} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
                      <div key={payment.id} style={{ 
                        padding: '16px 20px', borderBottom: idx !== payments.length - 1 ? '1px solid rgba(148, 163, 184, 0.08)' : 'none',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'background 0.2s'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(15, 23, 42, 0.4)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 600, color: '#f8fafc', marginBottom: '2px' }}>{formatCurrency(payment.amount)}</div>
                          <div style={{ fontSize: '12px', color: '#94a3b8', fontFamily: 'monospace' }}>Receipt: {payment.receipt_number}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <StatusBadge status={payment.status} size="sm" />
                          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>{formatDate(payment.payment_date)}</div>
                        </div>
                      </div>
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
    </div>
  );
}
