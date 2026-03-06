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
    const { installmentId, studentId, amount } = body;

    if (!studentId) {
      return NextResponse.json({ error: 'Missing student identifier' }, { status: 400 });
    }

    let razorpay;
    try {
      razorpay = getRazorpayInstance();
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 500 });
    }

    // 1. Fetch details. If installmentId is provided, use it. 
    // Otherwise, just get any installment to get student details.
    let installment_data = null;
    let students_data = null;

    if (installmentId) {
      const { data, error } = await supabase
        .from('installments')
        .select('amount, status, students(id, name, email, phone)')
        .eq('id', installmentId)
        .single();
      installment_data = data;
    }

    // Always fetch student details to ensure we have them
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('id, name, email, phone')
      .eq('id', studentId)
      .single();

    if (studentError || !student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }
    students_data = student;

    if (installmentId && installment_data?.status === 'paid' && !amount) {
      return NextResponse.json({ error: 'This specific installment is already paid.' }, { status: 400 });
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

    // Determine the final amount to charge
    // If a custom amount is passed, use it; otherwise use the installment amount.
    const requestedAmount = amount ? Number(amount) : (installment_data ? Number(installment_data.amount) : pendingAmount);
    
    if (requestedAmount <= 0) {
      return NextResponse.json({ error: 'Payment amount must be greater than zero' }, { status: 400 });
    }

    const payableAmount = Math.min(requestedAmount, pendingAmount);

    // 3. Create Razorpay Order
    // Razorpay amount is in paise (1 INR = 100 paise)
    const amountInPaise = Math.round(payableAmount * 100);

    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: `rcptid_${(installmentId || studentId).slice(0, 10)}`, // unique receipt id
      notes: {
        studentId: studentId,
        installmentId: installmentId || '',
      }
    };

    const order = await razorpay.orders.create(options);

    // Return the required order details to the frontend
    return NextResponse.json({ 
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      studentName: students_data.name,
      studentEmail: students_data.email,
      studentPhone: students_data.phone,
    });
  } catch (err: any) {
    console.error('Razorpay Order Creation Error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
