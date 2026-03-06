import { NextResponse } from 'next/server';
import axios from 'axios';
import { addPayment } from '@/lib/api';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      order_id,
      studentId,
      installmentId
    } = body;

    if (!order_id || !studentId || !installmentId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const appId = process.env.CASHFREE_APP_ID;
    const secretKey = process.env.CASHFREE_SECRET_KEY;
    const environment = process.env.CASHFREE_ENVIRONMENT || 'SANDBOX'; 

    if (!appId || !secretKey) {
      return NextResponse.json({ error: 'Cashfree secret keys not configured' }, { status: 500 });
    }

    // 1. Verify Payment via Cashfree Get Order API securely
    const baseUrl = environment === 'PRODUCTION' 
      ? `https://api.cashfree.com/pg/orders/${order_id}` 
      : `https://sandbox.cashfree.com/pg/orders/${order_id}`;

    const orderRes = await axios.get(baseUrl, {
      headers: {
        'x-client-id': appId,
        'x-client-secret': secretKey,
        'x-api-version': '2023-08-01',
      }
    });

    const orderData = orderRes.data;

    // Check if payment was marked as SUCCESS by Cashfree
    if (orderData.order_status !== 'PAID') {
       return NextResponse.json({ error: `Payment status is ${orderData.order_status}` }, { status: 400 });
    }

    // 2. Prevent Double Processing
    const { data: instCheck } = await supabase
      .from('installments')
      .select('amount, status')
      .eq('id', installmentId)
      .single();
      
    if (!instCheck || instCheck.status === 'paid') {
      return NextResponse.json({ error: 'Installment already paid or not found' }, { status: 400 });
    }

    // 3. Record the Payment in Supabase
    // Using Cashfree's CF order ID or your own order ID as receipt
    const receiptNumber = `CF-${order_id.slice(-8).toUpperCase()}`;

    // Update fees, installments, and insert the payment leveraging our helper
    await addPayment({
      student_id: studentId,
      installment_id: installmentId,
      amount: Number(instCheck.amount),
      payment_date: new Date().toISOString().split('T')[0],
      payment_method: 'online', // Defaulting to online
      receipt_number: receiptNumber,
      notes: `Cashfree Payment (Order: ${order_id})`,
    });

    return NextResponse.json({ success: true, receipt: receiptNumber });

  } catch (err: any) {
    console.error('Cashfree Verification Error:', err.response?.data || err.message);
    return NextResponse.json(
      { error: err.response?.data?.message || err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
