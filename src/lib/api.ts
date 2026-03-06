import { supabase } from './supabase';
import type { Student, Batch, Payment, Installment, FeeAssignment, MonthlyRevenue } from './mock-data';

// ─── STUDENTS ────────────────────────────────────

export async function getStudents(): Promise<Student[]> {
  const { data, error } = await supabase
    .from('students')
    .select(`
      id, name, email, phone, batch_id, joined_at, status, avatar_url,
      batches ( name ),
      fee_assignments ( total_fee, paid_amount, pending_amount, status )
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data || []).map((s: any) => ({
    id: s.id,
    name: s.name,
    email: s.email || '',
    phone: s.phone || '',
    batch_id: s.batch_id || '',
    batch_name: s.batches?.name || 'Unassigned',
    joined_at: s.joined_at,
    status: s.status,
    avatar_url: s.avatar_url,
    total_fee: s.fee_assignments?.[0]?.total_fee || 0,
    paid_amount: s.fee_assignments?.[0]?.paid_amount || 0,
    pending_amount: s.fee_assignments?.[0]?.pending_amount || 0,
    payment_status: s.fee_assignments?.[0]?.status || 'due',
  }));
}

export async function getStudentById(id: string): Promise<Student | null> {
  const { data, error } = await supabase
    .from('students')
    .select(`
      id, name, email, phone, batch_id, joined_at, status, avatar_url,
      batches ( name ),
      fee_assignments ( total_fee, paid_amount, pending_amount, status )
    `)
    .eq('id', id)
    .single();

  if (error) return null;

  return {
    id: data.id,
    name: data.name,
    email: data.email || '',
    phone: data.phone || '',
    batch_id: data.batch_id || '',
    batch_name: (data as any).batches?.name || 'Unassigned',
    joined_at: data.joined_at,
    status: data.status,
    avatar_url: data.avatar_url,
    total_fee: (data as any).fee_assignments?.[0]?.total_fee || 0,
    paid_amount: (data as any).fee_assignments?.[0]?.paid_amount || 0,
    pending_amount: (data as any).fee_assignments?.[0]?.pending_amount || 0,
    payment_status: (data as any).fee_assignments?.[0]?.status || 'due',
  };
}

export async function addStudent(student: {
  name: string;
  email: string;
  phone: string;
  batch_id: string;
}) {
  const { data: createdStudent, error } = await supabase
    .from('students')
    .insert({
      name: student.name,
      email: student.email,
      phone: student.phone,
      batch_id: student.batch_id,
    })
    .select()
    .single();

  if (error) throw error;

  // Assign fees automatically based on the batch's total fee
  if (student.batch_id && createdStudent) {
    const { data: batchData } = await supabase.from('batches').select('total_fee').eq('id', student.batch_id).single();
    if (batchData && batchData.total_fee > 0) {
      // Create Fee Assignment
      const { data: feeAssignment } = await supabase
        .from('fee_assignments')
        .insert({
          student_id: createdStudent.id,
          batch_id: student.batch_id,
          total_fee: batchData.total_fee,
          installment_count: 1, // Defaulting to 1 installment for simplicity
          paid_amount: 0,
        })
        .select()
        .single();
        
      if (feeAssignment) {
        // Create 1 initial installment due immediately
        const dueDate = new Date();
        
        await supabase.from('installments').insert({
          fee_assignment_id: feeAssignment.id,
          student_id: createdStudent.id,
          installment_number: 1,
          amount: batchData.total_fee,
          due_date: dueDate.toISOString().split('T')[0],
          status: 'due'
        });
      }
    }
  }

  return createdStudent;
}

export async function updateStudent(id: string, updates: Partial<{
  name: string;
  email: string;
  phone: string;
  batch_id: string;
  status: string;
}>) {
  const { error } = await supabase
    .from('students')
    .update(updates)
    .eq('id', id);

  if (error) throw error;
}

export async function deleteStudent(id: string) {
  const { error } = await supabase
    .from('students')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ─── BATCHES ─────────────────────────────────────

export async function getBatches(): Promise<Batch[]> {
  const { data: batchesData, error } = await supabase
    .from('batches')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;

  // Dynamically calculate student counts to guarantee accuracy
  const { data: studentsData } = await supabase.from('students').select('batch_id');
  const batchCounts: Record<string, number> = {};
  
  if (studentsData) {
    studentsData.forEach((s: any) => {
      if (s.batch_id) {
        batchCounts[s.batch_id] = (batchCounts[s.batch_id] || 0) + 1;
      }
    });
  }

  return (batchesData || []).map((b: any) => ({
    id: b.id,
    name: b.name,
    course_name: b.course_name,
    start_date: b.start_date,
    end_date: b.end_date,
    total_fee: Number(b.total_fee),
    student_count: batchCounts[b.id] || 0,
    status: b.status,
  }));
}

export async function addBatch(batch: {
  name: string;
  course_name: string;
  start_date: string;
  end_date: string;
  total_fee: number;
  status: string;
}) {
  const { data, error } = await supabase
    .from('batches')
    .insert(batch)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateBatch(id: string, updates: Partial<{
  name: string;
  course_name: string;
  start_date: string;
  end_date: string;
  total_fee: number;
  status: string;
}>) {
  const { error } = await supabase
    .from('batches')
    .update(updates)
    .eq('id', id);

  if (error) throw error;
}

export async function deleteBatch(id: string) {
  const { error } = await supabase
    .from('batches')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ─── PAYMENTS ────────────────────────────────────

export async function getPayments(): Promise<Payment[]> {
  const { data, error } = await supabase
    .from('payments')
    .select(`
      id, student_id, amount, payment_date, payment_method, receipt_number, status, notes,
      students ( name, batch_id, batches ( name ) ),
      installments ( installment_number )
    `)
    .order('payment_date', { ascending: false });

  if (error) throw error;

  return (data || []).map((p: any) => ({
    id: p.id,
    student_id: p.student_id,
    student_name: p.students?.name || 'Unknown',
    batch_name: p.students?.batches?.name || 'Unknown',
    amount: Number(p.amount),
    payment_date: p.payment_date,
    payment_method: p.payment_method,
    receipt_number: p.receipt_number,
    installment_number: p.installments?.installment_number || 0,
    status: p.status,
  }));
}

export async function addPayment(payment: {
  student_id: string;
  installment_id?: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  receipt_number: string;
  notes?: string;
}) {
  const { data, error } = await supabase
    .from('payments')
    .insert(payment)
    .select()
    .single();

  if (error) throw error;

  // If linked to an installment, mark it as paid
  if (payment.installment_id) {
    await supabase
      .from('installments')
      .update({ status: 'paid', paid_date: payment.payment_date })
      .eq('id', payment.installment_id);
  }

  // Update fee_assignment paid_amount
  const { data: feeData } = await supabase
    .from('fee_assignments')
    .select('id, paid_amount, total_fee')
    .eq('student_id', payment.student_id)
    .single();

  if (feeData) {
    const totalFee = Number(feeData.total_fee);
    const currentPaid = Number(feeData.paid_amount);
    
    // Ensure we don't exceed total fee (cap at total_fee)
    const newPaid = Math.min(currentPaid + payment.amount, totalFee);
    
    await supabase
      .from('fee_assignments')
      .update({
        paid_amount: newPaid,
        status: newPaid >= totalFee ? 'paid' : newPaid > 0 ? 'partial' : 'due',
      })
      .eq('id', feeData.id);
  }

  return data;
}

export async function deletePayment(id: string) {
  // First get the payment details to reverse it
  const { data: payment } = await supabase.from('payments').select('amount, student_id, installment_id').eq('id', id).single();
  
  if (payment) {
    // Revert fee assignment paid_amount
    const { data: feeData } = await supabase
      .from('fee_assignments')
      .select('id, paid_amount, total_fee')
      .eq('student_id', payment.student_id)
      .single();

    if (feeData) {
      const newPaid = Math.max(0, Number(feeData.paid_amount) - Number(payment.amount));
      await supabase
        .from('fee_assignments')
        .update({
          paid_amount: newPaid,
          status: newPaid >= Number(feeData.total_fee) ? 'paid' : newPaid > 0 ? 'partial' : 'due',
        })
        .eq('id', feeData.id);
    }

    // Revert installment status
    if (payment.installment_id) {
      await supabase
        .from('installments')
        .update({ status: 'due', paid_date: null }) // Reverting to due
        .eq('id', payment.installment_id);
    }
  }

  // Delete the payment record
  const { error } = await supabase
    .from('payments')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ─── FEE ASSIGNMENTS ─────────────────────────────

export async function getFeeAssignments(): Promise<FeeAssignment[]> {
  const { data, error } = await supabase
    .from('fee_assignments')
    .select(`
      id, student_id, batch_id, total_fee, installment_count, paid_amount, pending_amount, status,
      students ( name ),
      batches ( name )
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data || []).map((f: any) => ({
    id: f.id,
    student_id: f.student_id,
    student_name: f.students?.name || 'Unknown',
    batch_id: f.batch_id,
    batch_name: f.batches?.name || 'Unknown',
    total_fee: Number(f.total_fee),
    installment_count: f.installment_count,
    paid_amount: Number(f.paid_amount),
    pending_amount: Number(f.pending_amount),
    status: f.status,
  }));
}

export async function addFeeAssignment(fee: {
  student_id: string;
  batch_id: string;
  total_fee: number;
  installment_count: number;
}) {
  const { data, error } = await supabase
    .from('fee_assignments')
    .insert({
      student_id: fee.student_id,
      batch_id: fee.batch_id,
      total_fee: fee.total_fee,
      installment_count: fee.installment_count,
    })
    .select()
    .single();

  if (error) throw error;

  // Create installments
  const installmentAmount = fee.total_fee / fee.installment_count;
  const installments = [];
  for (let i = 0; i < fee.installment_count; i++) {
    const dueDate = new Date();
    dueDate.setMonth(dueDate.getMonth() + i + 1);
    installments.push({
      fee_assignment_id: data.id,
      student_id: fee.student_id,
      installment_number: i + 1,
      amount: installmentAmount,
      due_date: dueDate.toISOString().split('T')[0],
      status: 'upcoming',
    });
  }

  await supabase.from('installments').insert(installments);

  return data;
}

// ─── INSTALLMENTS ────────────────────────────────

export async function getInstallments(): Promise<Installment[]> {
  const { data, error } = await supabase
    .from('installments')
    .select(`
      id, student_id, installment_number, amount, due_date, paid_date, status,
      students ( name, batches ( name ) )
    `)
    .order('due_date', { ascending: true });

  if (error) throw error;

  return (data || []).map((i: any) => ({
    id: i.id,
    student_id: i.student_id,
    student_name: i.students?.name || 'Unknown',
    batch_name: i.students?.batches?.name || 'Unknown',
    installment_number: i.installment_number,
    amount: Number(i.amount),
    due_date: i.due_date,
    paid_date: i.paid_date,
    status: i.status,
  }));
}

export async function getStudentInstallments(studentId: string): Promise<Installment[]> {
  const { data, error } = await supabase
    .from('installments')
    .select(`
      id, student_id, installment_number, amount, due_date, paid_date, status,
      students ( name, batches ( name ) )
    `)
    .eq('student_id', studentId)
    .order('installment_number', { ascending: true });

  if (error) throw error;

  return (data || []).map((i: any) => ({
    id: i.id,
    student_id: i.student_id,
    student_name: i.students?.name || 'Unknown',
    batch_name: i.students?.batches?.name || 'Unknown',
    installment_number: i.installment_number,
    amount: Number(i.amount),
    due_date: i.due_date,
    paid_date: i.paid_date,
    status: i.status,
  }));
}

export async function getStudentPayments(studentId: string): Promise<Payment[]> {
  const { data, error } = await supabase
    .from('payments')
    .select(`
      id, student_id, amount, payment_date, payment_method, receipt_number, status,
      students ( name, batches ( name ) ),
      installments ( installment_number )
    `)
    .eq('student_id', studentId)
    .order('payment_date', { ascending: false });

  if (error) throw error;

  return (data || []).map((p: any) => ({
    id: p.id,
    student_id: p.student_id,
    student_name: p.students?.name || 'Unknown',
    batch_name: p.students?.batches?.name || 'Unknown',
    amount: Number(p.amount),
    payment_date: p.payment_date,
    payment_method: p.payment_method,
    receipt_number: p.receipt_number,
    installment_number: p.installments?.installment_number || 0,
    status: p.status,
  }));
}

// ─── DASHBOARD STATS ─────────────────────────────

export async function getDashboardStats() {
  const [studentsRes, batchesRes, feesRes, overdueRes] = await Promise.all([
    supabase.from('students').select('id', { count: 'exact', head: true }),
    supabase.from('batches').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('fee_assignments').select('total_fee, paid_amount, pending_amount'),
    supabase.from('installments').select('id', { count: 'exact', head: true }).eq('status', 'overdue'),
  ]);

  const fees = feesRes.data || [];
  const totalCollected = fees.reduce((sum, f) => sum + Number(f.paid_amount), 0);
  const totalPending = fees.reduce((sum, f) => sum + Number(f.pending_amount), 0);

  return {
    totalStudents: studentsRes.count || 0,
    activeBatches: batchesRes.count || 0,
    totalCollected,
    totalPending,
    overdueCount: overdueRes.count || 0,
  };
}

export async function getMonthlyRevenue(): Promise<MonthlyRevenue[]> {
  // Get payments grouped by month
  const { data, error } = await supabase
    .from('payments')
    .select('amount, payment_date, status')
    .eq('status', 'completed')
    .order('payment_date', { ascending: true });

  if (error) throw error;

  const monthMap = new Map<string, { collected: number; pending: number }>();

  (data || []).forEach((p: any) => {
    const date = new Date(p.payment_date);
    const key = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    const current = monthMap.get(key) || { collected: 0, pending: 0 };
    current.collected += Number(p.amount);
    monthMap.set(key, current);
  });

  // Get pending installments by month
  const { data: pendingData } = await supabase
    .from('installments')
    .select('amount, due_date')
    .in('status', ['due', 'overdue']);

  (pendingData || []).forEach((i: any) => {
    const date = new Date(i.due_date);
    const key = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    const current = monthMap.get(key) || { collected: 0, pending: 0 };
    current.pending += Number(i.amount);
    monthMap.set(key, current);
  });

  return Array.from(monthMap.entries())
    .map(([month, values]) => ({ month, ...values }))
    .slice(-7); // Last 7 months
}

export async function getUpcomingDues() {
  const { data, error } = await supabase
    .from('installments')
    .select(`
      id, amount, due_date, status, installment_number,
      students ( id, name, batches ( name ) )
    `)
    .in('status', ['due', 'overdue'])
    .order('due_date', { ascending: true })
    .limit(5);

  if (error) throw error;

  return (data || []).map((i: any) => ({
    id: i.id,
    student_id: i.students?.id,
    student_name: i.students?.name || 'Unknown',
    batch_name: i.students?.batches?.name || 'Unknown',
    amount: Number(i.amount),
    due_date: i.due_date,
    status: i.status,
    installment_number: i.installment_number,
  }));
}

export async function getRecentPayments() {
  const { data, error } = await supabase
    .from('payments')
    .select(`
      id, amount, payment_date, payment_method, status,
      students ( name )
    `)
    .order('payment_date', { ascending: false })
    .limit(5);

  if (error) throw error;

  return (data || []).map((p: any) => ({
    id: p.id,
    student_name: p.students?.name || 'Unknown',
    amount: Number(p.amount),
    payment_date: p.payment_date,
    payment_method: p.payment_method,
    status: p.status,
  }));
}
