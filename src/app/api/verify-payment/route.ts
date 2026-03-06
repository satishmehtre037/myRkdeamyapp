import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { addPayment, getInstallments } from '@/lib/api';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      razorpay_payment_id, 
      razorpay_order_id, 
      razorpay_signature,
      studentId,
      installmentId
    } = body;

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !studentId || !installmentId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key_secret) {
      return NextResponse.json({ error: 'Razorpay secret key not configured' }, { status: 500 });
    }

    // 1. Verify the signature securely using HMAC-SHA256
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const generated_signature = crypto
      .createHmac('sha256', key_secret)
      .update(text)
      .digest('hex');

    if (generated_signature !== razorpay_signature) {
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
    }

    // 2. Prevent Double Processing
    // Verify the installment isn't already paid
    const { data: instCheck } = await supabase
      .from('installments')
      .select('amount, status')
      .eq('id', installmentId)
      .single();
      
    if (!instCheck || instCheck.status === 'paid') {
      return NextResponse.json({ error: 'Installment already paid or not found' }, { status: 400 });
    }

    // 3. Record the Payment in Supabase
    const receiptNumber = `RZPY-${razorpay_payment_id.slice(-8).toUpperCase()}`;

    // Use our existing helper to update fees, installments, and insert the payment
    await addPayment({
      student_id: studentId,
      installment_id: installmentId,
      amount: Number(instCheck.amount),
      payment_date: new Date().toISOString().split('T')[0],
      payment_method: 'upi', // We can default or pass it if extended
      receipt_number: receiptNumber,
      notes: `Online Payment via Razorpay (Order: ${razorpay_order_id})`,
    });

    return NextResponse.json({ success: true, receipt: receiptNumber });

  } catch (err: any) {
    console.error('Razorpay Verification Error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
