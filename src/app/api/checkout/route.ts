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
    const { data: installment, error } = await supabase
      .from('installments')
      .select('amount, status, students(id, name, email, phone)')
      .eq('id', installmentId)
      .single();

    if (error || !installment) {
      return NextResponse.json({ error: 'Installment not found' }, { status: 404 });
    }

    if (installment.status === 'paid') {
      return NextResponse.json({ error: 'Installment is already paid' }, { status: 400 });
    }

    // 2. Create Razorpay Order
    // Razorpay amount is in paise (1 INR = 100 paise)
    const amountInPaise = Math.round(Number(installment.amount) * 100);

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
      studentName: installment.students?.name,
      studentEmail: installment.students?.email,
      studentPhone: installment.students?.phone,
    });
  } catch (err: any) {
    console.error('Razorpay Order Creation Error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
