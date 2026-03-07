'use client';

import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Printer } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

interface PaymentHistoryItem {
  dueDate: string;
  paymentDate: string;
  amount: number;
  paymentMethod: string;
  receiptNumber: string;
  status?: string;
}

interface ReceiptData {
  receiptNumber: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  batchName: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  installmentNumber: number;

  branch?: string;
  address?: string;
  attendanceId?: string;
  enrollmentDate?: string;
  academicSession?: string;

  baseAmount?: number;
  taxAmount?: number;
  totalAmount?: number;

  totalPayable?: number;
  totalPaid?: number;
  pendingAmount?: number;

  paymentHistory?: PaymentHistoryItem[];
}

interface FeeReceiptProps {
  isOpen: boolean;
  onClose: () => void;
  data: ReceiptData;
}

export default function FeeReceipt({ isOpen, onClose, data }: FeeReceiptProps) {
  const receiptRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printContent = receiptRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${data.studentName} - ${data.receiptNumber || data.batchName}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
          * { 
            margin: 0; 
            padding: 0; 
            box-sizing: border-box; 
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          @page {
            size: A4 portrait;
            margin: 10mm;
          }
          html, body {
            height: 100%;
            overflow: hidden; /* Force single page */
          }
          body {
            font-family: 'Inter', sans-serif;
            background: #fff;
            color: #1a1a2e;
            padding: 0;
          }
          .receipt {
            width: 100%;
            max-width: 800px;
            max-height: 100%;
            margin: 0 auto;
            border: 2px solid #e5e7eb;
            border-radius: 12px;
            padding: 30px;
          }
          .receipt-header {
            text-align: center;
            border-bottom: 2px dashed #e5e7eb;
            padding-bottom: 24px;
            margin-bottom: 24px;
          }
          .logo-box {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 180px;
            height: 54px;
            border-radius: 8px;
            background: #111827;
            margin-bottom: 12px;
            padding: 8px 16px;
          }
          .receipt-header h1 {
            font-size: 20px;
            font-weight: 800;
            color: #1a1a2e;
          }
          .receipt-header p {
            font-size: 13px;
            color: #6b7280;
            margin-top: 4px;
          }
          .receipt-number {
            display: inline-block;
            margin-top: 12px;
            padding: 6px 16px;
            background: #f3f4f6;
            border-radius: 8px;
            font-family: monospace;
            font-size: 14px;
            font-weight: 600;
            color: #4f46e5;
          }
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            margin-bottom: 24px;
          }
          .info-item label {
            display: block;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #9ca3af;
            margin-bottom: 4px;
          }
          .info-item span {
            font-size: 14px;
            font-weight: 500;
            color: #1f2937;
          }
          .amount-box {
            text-align: center;
            padding: 24px;
            background: linear-gradient(135deg, #f0f0ff, #faf5ff);
            border-radius: 12px;
            border: 1px solid #e0e7ff;
            margin-bottom: 24px;
          }
          .amount-box label {
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #6b7280;
          }
          .amount-box .amount {
            font-size: 32px;
            font-weight: 800;
            color: #4f46e5;
            margin-top: 4px;
          }
          .receipt-footer {
            border-top: 2px dashed #e5e7eb;
            padding-top: 20px;
            text-align: center;
          }
          .receipt-footer .status {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 6px 16px;
            background: #ecfdf5;
            color: #059669;
            border-radius: 20px;
            font-size: 13px;
            font-weight: 600;
            margin-bottom: 12px;
          }
          .receipt-footer p {
            font-size: 11px;
            color: #9ca3af;
          }
          .signature-line {
            margin-top: 40px;
            padding-top: 12px;
            border-top: 1px solid #d1d5db;
            text-align: right;
            font-size: 12px;
            color: #6b7280;
          }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="receipt-header">
            <div class="logo-box">
              <img src="https://rkdemy.com/wp-content/uploads/2019/02/rkdemy-logo-white-1.png" style="height: 100%; width: 100%; object-fit: contain;" alt="RKDeamy Logo" />
            </div>
            <h1>RKDeamy Classes</h1>
            <p>Fee Payment Receipt</p>
            <div class="receipt-number">${data.receiptNumber}</div>
          </div>

          <div class="info-grid">
            <div class="info-item"><label>Reference No</label><span>${data.receiptNumber}</span></div>
            <div class="info-item"><label>Date</label><span>${formatDate(data.paymentDate)}</span></div>
            <div class="info-item"><label>Name</label><span>${data.studentName}</span></div>
            <div class="info-item"><label>Course</label><span>${data.batchName}</span></div>
            <div class="info-item"><label>Branch</label><span>${data.branch || 'Thane'}</span></div>
            <div class="info-item"><label>Email Id</label><span>${data.studentEmail}</span></div>
            <div class="info-item"><label>Contact No.</label><span>${data.studentPhone}</span></div>
            <div class="info-item"><label>Payment Method</label><span style="text-transform: capitalize;">${data.paymentMethod.replace('_', ' ')}</span></div>
            <div class="info-item"><label>Enrollment Date</label><span>${data.enrollmentDate ? formatDate(data.enrollmentDate) : '-'}</span></div>
            <div class="info-item" style="grid-column: span 2;"><label>Permanent Address</label><span>${data.address || '-'}</span></div>
            <div class="info-item"><label>Attendance ID</label><span>${data.attendanceId || '-'}</span></div>
            <div class="info-item"><label>Academic Session</label><span>${data.academicSession || '2025-2026'}</span></div>
          </div>

          <div style="margin-bottom: 24px;">
            <h3 style="font-size: 14px; margin-bottom: 8px;">Proposed Fee Details</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 13px; text-align: left;">
              <thead>
                <tr style="border-top: 2px solid #000; border-bottom: 1px solid #000;">
                  <th style="padding: 6px;">Srno</th>
                  <th style="padding: 6px;">Particulars</th>
                  <th style="padding: 6px; text-align: right;">Base Amount</th>
                  <th style="padding: 6px; text-align: right;">Tax</th>
                  <th style="padding: 6px; text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr style="border-bottom: 2px solid #000;">
                  <td style="padding: 6px;">1</td>
                  <td style="padding: 6px;">${data.batchName}</td>
                  <td style="padding: 6px; text-align: right;">${formatCurrency(data.baseAmount || data.amount)}</td>
                  <td style="padding: 6px; text-align: right;">${formatCurrency(data.taxAmount || 0)}</td>
                  <td style="padding: 6px; text-align: right;">${formatCurrency(data.totalAmount || data.amount)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style="margin-bottom: 24px;">
            <h3 style="font-size: 14px; margin-bottom: 8px;">Payment Details</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 13px; text-align: left; border-top: 2px solid #000; border-bottom: 2px solid #000;">
              <thead>
                <tr style="border-bottom: 1px solid #000;">
                  <th style="padding: 6px;">Due Date</th>
                  <th style="padding: 6px;">Payment Date</th>
                  <th style="padding: 6px; text-align: right;">Amount</th>
                  <th style="padding: 6px;">Cheque/DD No.</th>
                  <th style="padding: 6px;">Receipt No</th>
                </tr>
              </thead>
              <tbody>
                ${(data.paymentHistory || [{ dueDate: data.paymentDate, paymentDate: data.paymentDate, amount: data.amount, paymentMethod: data.paymentMethod, receiptNumber: data.receiptNumber, status: 'completed' }]).map(p => `
                  <tr>
                    <td style="padding: 6px; border-bottom: 1px solid #e5e7eb;">${formatDate(p.dueDate || p.paymentDate)}</td>
                    <td style="padding: 6px; border-bottom: 1px solid #e5e7eb;">${p.paymentDate ? formatDate(p.paymentDate) : ''}</td>
                    <td style="padding: 6px; border-bottom: 1px solid #e5e7eb; text-align: right;">${formatCurrency(p.amount)}</td>
                    <td style="padding: 6px; border-bottom: 1px solid #e5e7eb;">${p.paymentMethod !== 'cash' && p.paymentMethod !== 'upi' ? p.paymentMethod : ''}</td>
                    <td style="padding: 6px; border-bottom: 1px solid #e5e7eb;">${p.receiptNumber || ''}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 30px; padding-bottom: 10px; border-bottom: 1px solid #000;">
            <div style="text-align: center;"><strong>Total Payable Fees :</strong><br/>${formatCurrency(data.totalPayable || data.amount)}</div>
            <div style="text-align: center;"><strong>Total Paid Fees :</strong><br/>${formatCurrency((data.paymentHistory || []).filter(p => {
              const s = (p.status || '').toLowerCase();
              const m = (p.paymentMethod || '').toLowerCase();
              return s === 'completed' || s === 'successful' || (!s && m !== 'bank_transfer' && m !== 'cheque');
            }).reduce((sum, p) => sum + (p.amount || 0), 0) || (data.paymentHistory?.length ? 0 : (data.totalPaid || 0)))}</div>
            <div style="text-align: center;"><strong>Unclear Fees :</strong><br/>${formatCurrency((data.paymentHistory || []).filter(p => {
              const s = (p.status || '').toLowerCase();
              const m = (p.paymentMethod || '').toLowerCase();
              return s === 'pending' || s === 'uncleared' || (!s && (m === 'bank_transfer' || m === 'cheque'));
            }).reduce((sum, p) => sum + (p.amount || 0), 0))}</div>
            <div style="text-align: center;"><strong>Balance Fees :</strong><br/>${formatCurrency((data.totalPayable || data.amount || 0) - (data.paymentHistory || []).filter(p => {
              const s = (p.status || '').toLowerCase();
              const m = (p.paymentMethod || '').toLowerCase();
              return s === 'completed' || s === 'successful' || (!s && m !== 'bank_transfer' && m !== 'cheque');
            }).reduce((sum, p) => sum + (p.amount || 0), 0) || (data.totalPaid || 0))}</div>
          </div>

          <div style="display: flex; justify-content: space-between; margin-top: 60px; font-size: 12px; color: #1f2937;">
            <div style="border-top: 1px solid #000; padding-top: 4px; width: 200px; text-align: center;">Student/Parent Signature</div>
            <div style="border-top: 1px solid #000; padding-top: 4px; width: 200px; text-align: center;">Authorised Signatory</div>
          </div>
        </div>
      </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(4px)',
              zIndex: 100,
            }}
          />
          {/* Receipt Preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'fixed',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 101,
              padding: '20px',
            }}
          >
            <div style={{
              background: '#111827',
              borderRadius: '16px',
              border: '1px solid rgba(99, 102, 241, 0.1)',
              width: '100%',
              maxWidth: '540px',
              maxHeight: '85vh',
              overflow: 'auto',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.4)',
            }}>
              {/* Header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '20px 24px',
                borderBottom: '1px solid rgba(99, 102, 241, 0.08)',
              }}>
                <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#e2e8f0' }}>Fee Receipt Preview</h2>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handlePrint}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '6px',
                      padding: '8px 14px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                      borderRadius: '8px', border: 'none', color: 'white',
                      fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                    }}
                  >
                    <Printer size={14} /> Print / Download
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onClose}
                    style={{
                      background: 'rgba(30, 41, 59, 0.5)',
                      border: '1px solid rgba(99, 102, 241, 0.1)',
                      borderRadius: '8px', padding: '8px',
                      cursor: 'pointer', color: '#94a3b8',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <X size={16} />
                  </motion.button>
                </div>
              </div>

              {/* Receipt Content Preview */}
              <div ref={receiptRef} style={{ padding: '24px' }}>
                {/* Receipt Card */}
                <div style={{
                  background: 'rgba(30, 41, 59, 0.3)',
                  border: '1px solid rgba(99, 102, 241, 0.08)',
                  borderRadius: '14px',
                  padding: '28px',
                }}>
                  {/* Logo + Title */}
                  <div style={{ textAlign: 'center', marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px dashed rgba(99, 102, 241, 0.1)' }}>
                    <div style={{
                      width: '180px', height: '54px', borderRadius: '8px',
                      background: '#111827',
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      marginBottom: '10px', overflow: 'hidden', padding: '8px 16px'
                    }}>
                      <img src="https://rkdemy.com/wp-content/uploads/2019/02/rkdemy-logo-white-1.png" alt="RKDeamy Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>
                    <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#e2e8f0' }}>RKDeamy Classes</h3>
                    <p style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>Fee Payment Receipt</p>
                    <div style={{
                      display: 'inline-block', marginTop: '10px',
                      padding: '4px 14px', background: 'rgba(99, 102, 241, 0.1)',
                      borderRadius: '6px', fontFamily: 'monospace', fontSize: '13px',
                      fontWeight: 600, color: '#818cf8',
                    }}>
                      {data.receiptNumber}
                    </div>
                  </div>

                  {/* Info Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '24px' }}>
                    {[
                      { label: 'Reference No', value: data.receiptNumber },
                      { label: 'Date', value: formatDate(data.paymentDate) },
                      { label: 'Name', value: data.studentName },
                      { label: 'Course', value: data.batchName },
                      { label: 'Branch', value: data.branch || 'Thane' },
                      { label: 'Email Id', value: data.studentEmail },
                      { label: 'Contact No', value: data.studentPhone },
                      { label: 'Method', value: data.paymentMethod, capitalize: true },
                      { label: 'Enrollment Date', value: data.enrollmentDate ? formatDate(data.enrollmentDate) : '-' },
                      { label: 'Address', value: data.address || '-', fullW: true },
                      { label: 'Attendance ID', value: data.attendanceId || '-' },
                      { label: 'Academic Session', value: data.academicSession || '2025-2026' }
                    ].map((item: { label: string; value: string | number | undefined; capitalize?: boolean; fullW?: boolean }, i) => (
                      <div key={i} style={item.fullW ? { gridColumn: 'span 2' } : {}}>
                        <div style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', marginBottom: '3px' }}>
                          {item.label}
                        </div>
                        <div style={{ fontSize: '13px', fontWeight: 500, color: '#e2e8f0', textTransform: item.capitalize ? 'capitalize' : 'none' }}>
                          {item.value?.toString().replace('_', ' ')}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Proposed Fee Details Preview */}
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8', marginBottom: '8px' }}>Proposed Fee Details</div>
                    <div style={{ background: 'rgba(15, 23, 42, 0.4)', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(99, 102, 241, 0.1)' }}>
                      <table style={{ width: '100%', fontSize: '12px', textAlign: 'left', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ background: 'rgba(30, 41, 59, 0.6)'}}>
                            <th style={{ padding: '8px 12px', color: '#cbd5e1', fontWeight: 600 }}>Srno</th>
                            <th style={{ padding: '8px 12px', color: '#cbd5e1', fontWeight: 600 }}>Particulars</th>
                            <th style={{ padding: '8px 12px', color: '#cbd5e1', fontWeight: 600, textAlign: 'right' }}>Base Amount</th>
                            <th style={{ padding: '8px 12px', color: '#cbd5e1', fontWeight: 600, textAlign: 'right' }}>Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td style={{ padding: '8px 12px', color: '#94a3b8' }}>1</td>
                            <td style={{ padding: '8px 12px', color: '#e2e8f0' }}>{data.batchName}</td>
                            <td style={{ padding: '8px 12px', color: '#e2e8f0', textAlign: 'right' }}>{formatCurrency(data.baseAmount || data.amount)}</td>
                            <td style={{ padding: '8px 12px', color: '#e2e8f0', textAlign: 'right' }}>{formatCurrency(data.totalAmount || data.amount)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Payment Details Preview */}
                  <div style={{ marginBottom: '24px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8', marginBottom: '8px' }}>Payment Details</div>
                    <div style={{ background: 'rgba(15, 23, 42, 0.4)', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(99, 102, 241, 0.1)' }}>
                      <table style={{ width: '100%', fontSize: '12px', textAlign: 'left', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ background: 'rgba(30, 41, 59, 0.6)'}}>
                            <th style={{ padding: '8px 12px', color: '#cbd5e1', fontWeight: 600 }}>Due Date</th>
                            <th style={{ padding: '8px 12px', color: '#cbd5e1', fontWeight: 600 }}>Date</th>
                            <th style={{ padding: '8px 12px', color: '#cbd5e1', fontWeight: 600, textAlign: 'right' }}>Amount</th>
                            <th style={{ padding: '8px 12px', color: '#cbd5e1', fontWeight: 600 }}>Receipt</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(data.paymentHistory || [{ dueDate: data.paymentDate, paymentDate: data.paymentDate, amount: data.amount, paymentMethod: data.paymentMethod, receiptNumber: data.receiptNumber, status: 'completed' }]).map((p, i) => (
                             <tr key={i} style={{ borderTop: i > 0 ? '1px solid rgba(99, 102, 241, 0.1)' : 'none' }}>
                               <td style={{ padding: '8px 12px', color: '#94a3b8' }}>{formatDate(p.dueDate || p.paymentDate)}</td>
                               <td style={{ padding: '8px 12px', color: '#e2e8f0' }}>{p.paymentDate ? formatDate(p.paymentDate) : ''}</td>
                               <td style={{ padding: '8px 12px', color: p.status === 'pending' ? '#fbbf24' : '#34d399', textAlign: 'right', fontWeight: 600 }}>{formatCurrency(p.amount || 0)}</td>
                               <td style={{ padding: '8px 12px', color: '#818cf8', fontFamily: 'monospace' }}>{p.receiptNumber}</td>
                             </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Summary Footer */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', padding: '16px', background: 'rgba(30, 41, 59, 0.5)', borderRadius: '12px', border: '1px solid rgba(99, 102, 241, 0.08)' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '4px' }}>Payable</div>
                      <div style={{ fontSize: '13px', color: '#e2e8f0', fontWeight: 600 }}>{formatCurrency(data.totalPayable || data.amount)}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '4px' }}>Paid</div>
                      <div style={{ fontSize: '13px', color: '#34d399', fontWeight: 600 }}>
                        {formatCurrency((data.paymentHistory || []).filter(p => {
                          const s = (p.status || '').toLowerCase();
                          const m = (p.paymentMethod || '').toLowerCase();
                          return s === 'completed' || s === 'successful' || (!s && m !== 'bank_transfer' && m !== 'cheque');
                        }).reduce((sum, p) => sum + (p.amount || 0), 0) || (data.paymentHistory?.length ? 0 : (data.totalPaid || 0)))}
                      </div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '4px' }}>Unclear</div>
                      <div style={{ fontSize: '13px', color: '#fbbf24', fontWeight: 600 }}>
                        {formatCurrency((data.paymentHistory || []).filter(p => {
                          const s = (p.status || '').toLowerCase();
                          const m = (p.paymentMethod || '').toLowerCase();
                          return s === 'pending' || s === 'uncleared' || (!s && (m === 'bank_transfer' || m === 'cheque'));
                        }).reduce((sum, p) => sum + (p.amount || 0), 0))}
                      </div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '4px' }}>Balance</div>
                      <div style={{ fontSize: '13px', color: '#f87171', fontWeight: 600 }}>
                        {formatCurrency((data.totalPayable || data.amount || 0) - ((data.paymentHistory || []).filter(p => {
                          const s = (p.status || '').toLowerCase();
                          const m = (p.paymentMethod || '').toLowerCase();
                          return s === 'completed' || s === 'successful' || (!s && m !== 'bank_transfer' && m !== 'cheque');
                        }).reduce((sum, p) => sum + (p.amount || 0), 0) || (data.totalPaid || 0)))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
