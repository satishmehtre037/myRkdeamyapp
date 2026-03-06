'use client';

import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Printer } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

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
        <title>Fee Receipt - ${data.receiptNumber}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Inter', sans-serif;
            background: #fff;
            color: #1a1a2e;
            padding: 40px;
          }
          .receipt {
            max-width: 600px;
            margin: 0 auto;
            border: 2px solid #e5e7eb;
            border-radius: 12px;
            padding: 40px;
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
            width: 48px;
            height: 48px;
            border-radius: 12px;
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
            color: white;
            font-weight: 800;
            font-size: 18px;
            margin-bottom: 12px;
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
            <div class="logo-box">RK</div>
            <h1>RKDeamy Classes</h1>
            <p>Fee Payment Receipt</p>
            <div class="receipt-number">${data.receiptNumber}</div>
          </div>

          <div class="info-grid">
            <div class="info-item">
              <label>Student Name</label>
              <span>${data.studentName}</span>
            </div>
            <div class="info-item">
              <label>Batch</label>
              <span>${data.batchName}</span>
            </div>
            <div class="info-item">
              <label>Payment Date</label>
              <span>${formatDate(data.paymentDate)}</span>
            </div>
            <div class="info-item">
              <label>Payment Method</label>
              <span style="text-transform: capitalize">${data.paymentMethod.replace('_', ' ')}</span>
            </div>
            <div class="info-item">
              <label>Email</label>
              <span>${data.studentEmail}</span>
            </div>
            <div class="info-item">
              <label>Installment</label>
              <span>#${data.installmentNumber}</span>
            </div>
          </div>

          <div class="amount-box">
            <label>Amount Paid</label>
            <div class="amount">${formatCurrency(data.amount)}</div>
          </div>

          <div class="receipt-footer">
            <div class="status">✓ Payment Confirmed</div>
            <p>This is a computer-generated receipt. No signature required.</p>
            <p style="margin-top: 4px;">RKDeamy Classes • admin@rkdeamy.com</p>
          </div>

          <div class="signature-line">
            Authorized Signatory
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
                      width: '44px', height: '44px', borderRadius: '12px',
                      background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 800, fontSize: '16px', color: 'white', marginBottom: '10px',
                    }}>
                      RK
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
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
                    {[
                      { label: 'Student Name', value: data.studentName },
                      { label: 'Batch', value: data.batchName },
                      { label: 'Payment Date', value: formatDate(data.paymentDate) },
                      { label: 'Payment Method', value: data.paymentMethod.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) },
                      { label: 'Email', value: data.studentEmail },
                      { label: 'Installment', value: `#${data.installmentNumber}` },
                    ].map((item) => (
                      <div key={item.label}>
                        <div style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', marginBottom: '3px' }}>
                          {item.label}
                        </div>
                        <div style={{ fontSize: '13px', fontWeight: 500, color: '#e2e8f0' }}>
                          {item.value}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Amount */}
                  <div style={{
                    textAlign: 'center', padding: '20px',
                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.08))',
                    borderRadius: '12px', border: '1px solid rgba(99, 102, 241, 0.1)',
                    marginBottom: '20px',
                  }}>
                    <div style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#94a3b8' }}>
                      Amount Paid
                    </div>
                    <div style={{ fontSize: '28px', fontWeight: 800, color: '#818cf8', marginTop: '4px' }}>
                      {formatCurrency(data.amount)}
                    </div>
                  </div>

                  {/* Footer */}
                  <div style={{ textAlign: 'center', paddingTop: '16px', borderTop: '1px dashed rgba(99, 102, 241, 0.1)' }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '6px',
                      padding: '4px 14px', background: 'rgba(16, 185, 129, 0.1)',
                      borderRadius: '14px', fontSize: '12px', fontWeight: 600, color: '#34d399',
                      marginBottom: '8px',
                    }}>
                      ✓ Payment Confirmed
                    </span>
                    <p style={{ fontSize: '11px', color: '#475569', marginTop: '8px' }}>
                      This is a computer-generated receipt. No signature required.
                    </p>
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
