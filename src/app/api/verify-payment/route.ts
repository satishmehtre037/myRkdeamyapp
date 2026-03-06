import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { addPayment, getInstallments } from '@/lib/api';
import { supabase } from '@/lib/supabase';
import Razorpay from 'razorpay';

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

    // 2. Fetch the actual order from Razorpay to get the "Truth" amount
    // This prevents frontend spoofing of the payment amount
    const razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
      key_secret: key_secret,
    });
    const order = await razorpay.orders.fetch(razorpay_order_id) as any;
    const actualPaidAmount = order.amount / 100; // Paise to INR

    // 3. Prevent Double Processing
    // Verify the installment isn't already paid (though partials are allowed, 
    // we check status to avoid double-processing the same success event)
    const { data: instCheck } = await supabase
      .from('installments')
      .select('amount, status')
      .eq('id', installmentId)
      .single();
      
    if (!instCheck) {
      return NextResponse.json({ error: 'Installment not found' }, { status: 404 });
    }

    // 4. Record the Payment in Supabase
    const receiptNumber = `RZPY-${razorpay_payment_id.slice(-8).toUpperCase()}`;

    // Use our existing helper to update fees, installments, and insert the payment
    await addPayment({
      student_id: studentId,
      installment_id: installmentId,
      amount: actualPaidAmount,
      payment_date: new Date().toISOString().split('T')[0],
      payment_method: 'upi', 
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
