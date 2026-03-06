import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { supabase } from '@/lib/supabase';

// Helper to initialize Razorpay conditionally to prevent crashes if keys are missing
const getRazorpayInstance = () => {
  const key_id = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    throw new Error('Razorpay keys are not configured in .env.local');
  }

  return new Razorpay({
    key_id,
    key_secret,
  });
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { installmentId, studentId } = body;

    if (!installmentId || !studentId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    let razorpay;
    try {
      razorpay = getRazorpayInstance();
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 500 });
    }

    // 1. Fetch exact amount and details from DB to prevent tampering
    const { data: installment, error: instError } = await supabase
      .from('installments')
      .select('amount, status, students(id, name, email, phone)')
      .eq('id', installmentId)
      .single();

    if (instError || !installment) {
      return NextResponse.json({ error: 'Installment not found' }, { status: 404 });
    }

    if (installment.status === 'paid') {
      return NextResponse.json({ error: 'Installment is already paid' }, { status: 400 });
    }

    // 2. Fetch student's remaining balance to prevent overpayment
    const { data: feeAssignment, error: feeError } = await supabase
      .from('fee_assignments')
      .select('pending_amount')
      .eq('student_id', studentId)
      .single();

    if (feeError || !feeAssignment) {
      return NextResponse.json({ error: 'Fee assignment not found' }, { status: 404 });
    }

    const pendingAmount = Number(feeAssignment.pending_amount);
    if (pendingAmount <= 0) {
      return NextResponse.json({ error: 'Student has no pending balance' }, { status: 400 });
    }

    // Use the smaller of the installment amount or the actual pending balance
    const payableAmount = Math.min(Number(installment.amount), pendingAmount);

    // 3. Create Razorpay Order
    // Razorpay amount is in paise (1 INR = 100 paise)
    const amountInPaise = Math.round(payableAmount * 100);

    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: `rcptid_${installmentId.slice(0, 10)}`, // unique receipt id
      notes: {
        studentId: studentId,
        installmentId: installmentId,
      }
    };

    const order = await razorpay.orders.create(options);

    // Return the required order details to the frontend
    return NextResponse.json({ 
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      studentName: (installment.students as any)?.[0]?.name || (installment.students as any)?.name,
      studentEmail: (installment.students as any)?.[0]?.email || (installment.students as any)?.email,
      studentPhone: (installment.students as any)?.[0]?.phone || (installment.students as any)?.phone,
    });
  } catch (err: any) {
    console.error('Razorpay Order Creation Error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
