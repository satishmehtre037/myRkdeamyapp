import { NextResponse } from 'next/server';
import axios from 'axios';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { installmentId, studentId } = body;

    if (!installmentId || !studentId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const appId = process.env.CASHFREE_APP_ID;
    const secretKey = process.env.CASHFREE_SECRET_KEY;
    const environment = process.env.CASHFREE_ENVIRONMENT || 'SANDBOX'; // PRODUCTION or SANDBOX

    if (!appId || !secretKey) {
      return NextResponse.json({ error: 'Cashfree keys are not configured in .env.local' }, { status: 500 });
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

    // 2. Create Cashfree Order
    const orderId = `order_${installmentId.slice(0, 8)}_${Date.now()}`;
    const amount = Number(installment.amount);
    
    // Fallbacks if student data is missing
    const customerId = studentId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 50); // Cashfree requires alphanumeric customer_id <= 50 chars
    const customerPhone = installment.students?.phone?.replace(/\D/g, '').slice(-10) || '9999999999';
    const customerEmail = installment.students?.email || 'student@rkdeamy.com';
    const customerName = installment.students?.name || 'Student';

    const baseUrl = environment === 'PRODUCTION' 
      ? 'https://api.cashfree.com/pg/orders' 
      : 'https://sandbox.cashfree.com/pg/orders';

    const response = await axios.post(baseUrl, {
      order_id: orderId,
      order_amount: amount,
      order_currency: 'INR',
      customer_details: {
        customer_id: customerId,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
      },
      order_meta: {
        return_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/student-portal/dashboard?order_id={order_id}`,
      },
      order_note: `Installment Payment - ${installmentId}`
    }, {
      headers: {
        'x-client-id': appId,
        'x-client-secret': secretKey,
        'x-api-version': '2023-08-01',
        'Content-Type': 'application/json',
      }
    });

    // Return the required session ID to the frontend to launch modal
    return NextResponse.json({ 
      payment_session_id: response.data.payment_session_id,
      order_id: orderId,
    });
    
  } catch (err: any) {
    console.error('Cashfree Order Creation Error:', err.response?.data || err.message);
    return NextResponse.json(
      { error: err.response?.data?.message || err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
