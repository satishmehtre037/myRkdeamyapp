// Mock Data for RKDeamy Classes Dashboard

export interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  batch_id: string;
  batch_name: string;
  joined_at: string;
  status: 'active' | 'inactive' | 'graduated';
  avatar_url?: string;
  total_fee: number;
  paid_amount: number;
  pending_amount: number;
  payment_status: 'paid' | 'partial' | 'due';
}

export interface Batch {
  id: string;
  name: string;
  course_name: string;
  start_date: string;
  end_date: string;
  total_fee: number;
  student_count: number;
  status: 'active' | 'upcoming' | 'completed';
}

export interface Payment {
  id: string;
  student_id: string;
  student_name: string;
  batch_name: string;
  amount: number;
  payment_date: string;
  payment_method: 'cash' | 'upi' | 'bank_transfer' | 'card';
  receipt_number: string;
  installment_number: number;
  status: 'completed' | 'pending' | 'failed';
}

export interface Installment {
  id: string;
  student_id: string;
  student_name: string;
  batch_name: string;
  installment_number: number;
  amount: number;
  due_date: string;
  paid_date?: string;
  status: 'paid' | 'due' | 'overdue' | 'upcoming';
}

export interface FeeAssignment {
  id: string;
  student_id: string;
  student_name: string;
  batch_id: string;
  batch_name: string;
  total_fee: number;
  installment_count: number;
  paid_amount: number;
  pending_amount: number;
  status: 'paid' | 'partial' | 'due';
}

export interface MonthlyRevenue {
  month: string;
  collected: number;
  pending: number;
}

// ─── BATCHES ─────────────────────────────────────
export const batches: Batch[] = [
  {
    id: 'batch-001',
    name: 'Batch A - 2026',
    course_name: 'Full Stack Web Development',
    start_date: '2026-01-15',
    end_date: '2026-07-15',
    total_fee: 45000,
    student_count: 28,
    status: 'active',
  },
  {
    id: 'batch-002',
    name: 'Batch B - 2026',
    course_name: 'Data Science & ML',
    start_date: '2026-02-01',
    end_date: '2026-08-01',
    total_fee: 55000,
    student_count: 22,
    status: 'active',
  },
  {
    id: 'batch-003',
    name: 'Batch C - 2026',
    course_name: 'UI/UX Design Masterclass',
    start_date: '2026-03-01',
    end_date: '2026-06-30',
    total_fee: 30000,
    student_count: 18,
    status: 'active',
  },
  {
    id: 'batch-004',
    name: 'Batch D - 2026',
    course_name: 'React & Next.js Advanced',
    start_date: '2026-04-01',
    end_date: '2026-09-30',
    total_fee: 40000,
    student_count: 15,
    status: 'upcoming',
  },
  {
    id: 'batch-005',
    name: 'Batch E - 2025',
    course_name: 'Python Programming',
    start_date: '2025-08-01',
    end_date: '2026-02-01',
    total_fee: 35000,
    student_count: 32,
    status: 'completed',
  },
];

// ─── STUDENTS ─────────────────────────────────────
export const students: Student[] = [
  {
    id: 'stu-001', name: 'Aarav Sharma', email: 'aarav.s@email.com', phone: '+91 98765 43210',
    batch_id: 'batch-001', batch_name: 'Batch A - 2026', joined_at: '2026-01-15', status: 'active',
    total_fee: 45000, paid_amount: 45000, pending_amount: 0, payment_status: 'paid',
  },
  {
    id: 'stu-002', name: 'Priya Patel', email: 'priya.p@email.com', phone: '+91 98765 43211',
    batch_id: 'batch-001', batch_name: 'Batch A - 2026', joined_at: '2026-01-15', status: 'active',
    total_fee: 45000, paid_amount: 30000, pending_amount: 15000, payment_status: 'partial',
  },
  {
    id: 'stu-003', name: 'Rohit Kumar', email: 'rohit.k@email.com', phone: '+91 98765 43212',
    batch_id: 'batch-002', batch_name: 'Batch B - 2026', joined_at: '2026-02-01', status: 'active',
    total_fee: 55000, paid_amount: 18000, pending_amount: 37000, payment_status: 'partial',
  },
  {
    id: 'stu-004', name: 'Sneha Reddy', email: 'sneha.r@email.com', phone: '+91 98765 43213',
    batch_id: 'batch-002', batch_name: 'Batch B - 2026', joined_at: '2026-02-01', status: 'active',
    total_fee: 55000, paid_amount: 0, pending_amount: 55000, payment_status: 'due',
  },
  {
    id: 'stu-005', name: 'Vikram Singh', email: 'vikram.s@email.com', phone: '+91 98765 43214',
    batch_id: 'batch-001', batch_name: 'Batch A - 2026', joined_at: '2026-01-20', status: 'active',
    total_fee: 45000, paid_amount: 45000, pending_amount: 0, payment_status: 'paid',
  },
  {
    id: 'stu-006', name: 'Ananya Gupta', email: 'ananya.g@email.com', phone: '+91 98765 43215',
    batch_id: 'batch-003', batch_name: 'Batch C - 2026', joined_at: '2026-03-01', status: 'active',
    total_fee: 30000, paid_amount: 10000, pending_amount: 20000, payment_status: 'partial',
  },
  {
    id: 'stu-007', name: 'Arjun Mehta', email: 'arjun.m@email.com', phone: '+91 98765 43216',
    batch_id: 'batch-003', batch_name: 'Batch C - 2026', joined_at: '2026-03-01', status: 'active',
    total_fee: 30000, paid_amount: 30000, pending_amount: 0, payment_status: 'paid',
  },
  {
    id: 'stu-008', name: 'Kavya Nair', email: 'kavya.n@email.com', phone: '+91 98765 43217',
    batch_id: 'batch-002', batch_name: 'Batch B - 2026', joined_at: '2026-02-05', status: 'active',
    total_fee: 55000, paid_amount: 36000, pending_amount: 19000, payment_status: 'partial',
  },
  {
    id: 'stu-009', name: 'Rahul Joshi', email: 'rahul.j@email.com', phone: '+91 98765 43218',
    batch_id: 'batch-001', batch_name: 'Batch A - 2026', joined_at: '2026-01-18', status: 'active',
    total_fee: 45000, paid_amount: 15000, pending_amount: 30000, payment_status: 'partial',
  },
  {
    id: 'stu-010', name: 'Divya Iyer', email: 'divya.i@email.com', phone: '+91 98765 43219',
    batch_id: 'batch-005', batch_name: 'Batch E - 2025', joined_at: '2025-08-01', status: 'graduated',
    total_fee: 35000, paid_amount: 35000, pending_amount: 0, payment_status: 'paid',
  },
  {
    id: 'stu-011', name: 'Manish Tiwari', email: 'manish.t@email.com', phone: '+91 98765 43220',
    batch_id: 'batch-005', batch_name: 'Batch E - 2025', joined_at: '2025-08-01', status: 'graduated',
    total_fee: 35000, paid_amount: 25000, pending_amount: 10000, payment_status: 'partial',
  },
  {
    id: 'stu-012', name: 'Neha Kapoor', email: 'neha.k@email.com', phone: '+91 98765 43221',
    batch_id: 'batch-003', batch_name: 'Batch C - 2026', joined_at: '2026-03-05', status: 'active',
    total_fee: 30000, paid_amount: 0, pending_amount: 30000, payment_status: 'due',
  },
];

// ─── PAYMENTS ─────────────────────────────────────
export const payments: Payment[] = [
  {
    id: 'pay-001', student_id: 'stu-001', student_name: 'Aarav Sharma', batch_name: 'Batch A - 2026',
    amount: 15000, payment_date: '2026-01-15', payment_method: 'upi', receipt_number: 'RKD-2026-001',
    installment_number: 1, status: 'completed',
  },
  {
    id: 'pay-002', student_id: 'stu-001', student_name: 'Aarav Sharma', batch_name: 'Batch A - 2026',
    amount: 15000, payment_date: '2026-02-15', payment_method: 'upi', receipt_number: 'RKD-2026-002',
    installment_number: 2, status: 'completed',
  },
  {
    id: 'pay-003', student_id: 'stu-001', student_name: 'Aarav Sharma', batch_name: 'Batch A - 2026',
    amount: 15000, payment_date: '2026-03-01', payment_method: 'bank_transfer', receipt_number: 'RKD-2026-003',
    installment_number: 3, status: 'completed',
  },
  {
    id: 'pay-004', student_id: 'stu-002', student_name: 'Priya Patel', batch_name: 'Batch A - 2026',
    amount: 15000, payment_date: '2026-01-20', payment_method: 'cash', receipt_number: 'RKD-2026-004',
    installment_number: 1, status: 'completed',
  },
  {
    id: 'pay-005', student_id: 'stu-002', student_name: 'Priya Patel', batch_name: 'Batch A - 2026',
    amount: 15000, payment_date: '2026-02-20', payment_method: 'upi', receipt_number: 'RKD-2026-005',
    installment_number: 2, status: 'completed',
  },
  {
    id: 'pay-006', student_id: 'stu-003', student_name: 'Rohit Kumar', batch_name: 'Batch B - 2026',
    amount: 18000, payment_date: '2026-02-05', payment_method: 'card', receipt_number: 'RKD-2026-006',
    installment_number: 1, status: 'completed',
  },
  {
    id: 'pay-007', student_id: 'stu-005', student_name: 'Vikram Singh', batch_name: 'Batch A - 2026',
    amount: 22500, payment_date: '2026-01-22', payment_method: 'bank_transfer', receipt_number: 'RKD-2026-007',
    installment_number: 1, status: 'completed',
  },
  {
    id: 'pay-008', student_id: 'stu-005', student_name: 'Vikram Singh', batch_name: 'Batch A - 2026',
    amount: 22500, payment_date: '2026-02-22', payment_method: 'bank_transfer', receipt_number: 'RKD-2026-008',
    installment_number: 2, status: 'completed',
  },
  {
    id: 'pay-009', student_id: 'stu-006', student_name: 'Ananya Gupta', batch_name: 'Batch C - 2026',
    amount: 10000, payment_date: '2026-03-01', payment_method: 'upi', receipt_number: 'RKD-2026-009',
    installment_number: 1, status: 'completed',
  },
  {
    id: 'pay-010', student_id: 'stu-007', student_name: 'Arjun Mehta', batch_name: 'Batch C - 2026',
    amount: 30000, payment_date: '2026-03-01', payment_method: 'bank_transfer', receipt_number: 'RKD-2026-010',
    installment_number: 1, status: 'completed',
  },
  {
    id: 'pay-011', student_id: 'stu-008', student_name: 'Kavya Nair', batch_name: 'Batch B - 2026',
    amount: 18000, payment_date: '2026-02-10', payment_method: 'upi', receipt_number: 'RKD-2026-011',
    installment_number: 1, status: 'completed',
  },
  {
    id: 'pay-012', student_id: 'stu-008', student_name: 'Kavya Nair', batch_name: 'Batch B - 2026',
    amount: 18000, payment_date: '2026-03-05', payment_method: 'cash', receipt_number: 'RKD-2026-012',
    installment_number: 2, status: 'completed',
  },
  {
    id: 'pay-013', student_id: 'stu-009', student_name: 'Rahul Joshi', batch_name: 'Batch A - 2026',
    amount: 15000, payment_date: '2026-01-25', payment_method: 'upi', receipt_number: 'RKD-2026-013',
    installment_number: 1, status: 'completed',
  },
  {
    id: 'pay-014', student_id: 'stu-010', student_name: 'Divya Iyer', batch_name: 'Batch E - 2025',
    amount: 35000, payment_date: '2025-08-10', payment_method: 'bank_transfer', receipt_number: 'RKD-2025-001',
    installment_number: 1, status: 'completed',
  },
  {
    id: 'pay-015', student_id: 'stu-011', student_name: 'Manish Tiwari', batch_name: 'Batch E - 2025',
    amount: 25000, payment_date: '2025-09-01', payment_method: 'cash', receipt_number: 'RKD-2025-002',
    installment_number: 1, status: 'completed',
  },
];

// ─── INSTALLMENTS ─────────────────────────────────
export const installments: Installment[] = [
  { id: 'inst-001', student_id: 'stu-002', student_name: 'Priya Patel', batch_name: 'Batch A - 2026', installment_number: 3, amount: 15000, due_date: '2026-03-20', status: 'due' },
  { id: 'inst-002', student_id: 'stu-003', student_name: 'Rohit Kumar', batch_name: 'Batch B - 2026', installment_number: 2, amount: 18500, due_date: '2026-03-10', status: 'overdue' },
  { id: 'inst-003', student_id: 'stu-003', student_name: 'Rohit Kumar', batch_name: 'Batch B - 2026', installment_number: 3, amount: 18500, due_date: '2026-04-10', status: 'upcoming' },
  { id: 'inst-004', student_id: 'stu-004', student_name: 'Sneha Reddy', batch_name: 'Batch B - 2026', installment_number: 1, amount: 18000, due_date: '2026-02-15', status: 'overdue' },
  { id: 'inst-005', student_id: 'stu-004', student_name: 'Sneha Reddy', batch_name: 'Batch B - 2026', installment_number: 2, amount: 18500, due_date: '2026-03-15', status: 'overdue' },
  { id: 'inst-006', student_id: 'stu-004', student_name: 'Sneha Reddy', batch_name: 'Batch B - 2026', installment_number: 3, amount: 18500, due_date: '2026-04-15', status: 'upcoming' },
  { id: 'inst-007', student_id: 'stu-006', student_name: 'Ananya Gupta', batch_name: 'Batch C - 2026', installment_number: 2, amount: 10000, due_date: '2026-04-01', status: 'upcoming' },
  { id: 'inst-008', student_id: 'stu-006', student_name: 'Ananya Gupta', batch_name: 'Batch C - 2026', installment_number: 3, amount: 10000, due_date: '2026-05-01', status: 'upcoming' },
  { id: 'inst-009', student_id: 'stu-009', student_name: 'Rahul Joshi', batch_name: 'Batch A - 2026', installment_number: 2, amount: 15000, due_date: '2026-02-25', status: 'overdue' },
  { id: 'inst-010', student_id: 'stu-009', student_name: 'Rahul Joshi', batch_name: 'Batch A - 2026', installment_number: 3, amount: 15000, due_date: '2026-03-25', status: 'due' },
  { id: 'inst-011', student_id: 'stu-011', student_name: 'Manish Tiwari', batch_name: 'Batch E - 2025', installment_number: 2, amount: 10000, due_date: '2025-12-01', status: 'overdue' },
  { id: 'inst-012', student_id: 'stu-012', student_name: 'Neha Kapoor', batch_name: 'Batch C - 2026', installment_number: 1, amount: 10000, due_date: '2026-03-10', status: 'overdue' },
  { id: 'inst-013', student_id: 'stu-012', student_name: 'Neha Kapoor', batch_name: 'Batch C - 2026', installment_number: 2, amount: 10000, due_date: '2026-04-10', status: 'upcoming' },
  { id: 'inst-014', student_id: 'stu-012', student_name: 'Neha Kapoor', batch_name: 'Batch C - 2026', installment_number: 3, amount: 10000, due_date: '2026-05-10', status: 'upcoming' },
];

// ─── FEE ASSIGNMENTS ─────────────────────────────
export const feeAssignments: FeeAssignment[] = [
  { id: 'fa-001', student_id: 'stu-001', student_name: 'Aarav Sharma', batch_id: 'batch-001', batch_name: 'Batch A - 2026', total_fee: 45000, installment_count: 3, paid_amount: 45000, pending_amount: 0, status: 'paid' },
  { id: 'fa-002', student_id: 'stu-002', student_name: 'Priya Patel', batch_id: 'batch-001', batch_name: 'Batch A - 2026', total_fee: 45000, installment_count: 3, paid_amount: 30000, pending_amount: 15000, status: 'partial' },
  { id: 'fa-003', student_id: 'stu-003', student_name: 'Rohit Kumar', batch_id: 'batch-002', batch_name: 'Batch B - 2026', total_fee: 55000, installment_count: 3, paid_amount: 18000, pending_amount: 37000, status: 'partial' },
  { id: 'fa-004', student_id: 'stu-004', student_name: 'Sneha Reddy', batch_id: 'batch-002', batch_name: 'Batch B - 2026', total_fee: 55000, installment_count: 3, paid_amount: 0, pending_amount: 55000, status: 'due' },
  { id: 'fa-005', student_id: 'stu-005', student_name: 'Vikram Singh', batch_id: 'batch-001', batch_name: 'Batch A - 2026', total_fee: 45000, installment_count: 2, paid_amount: 45000, pending_amount: 0, status: 'paid' },
  { id: 'fa-006', student_id: 'stu-006', student_name: 'Ananya Gupta', batch_id: 'batch-003', batch_name: 'Batch C - 2026', total_fee: 30000, installment_count: 3, paid_amount: 10000, pending_amount: 20000, status: 'partial' },
  { id: 'fa-007', student_id: 'stu-007', student_name: 'Arjun Mehta', batch_id: 'batch-003', batch_name: 'Batch C - 2026', total_fee: 30000, installment_count: 1, paid_amount: 30000, pending_amount: 0, status: 'paid' },
  { id: 'fa-008', student_id: 'stu-008', student_name: 'Kavya Nair', batch_id: 'batch-002', batch_name: 'Batch B - 2026', total_fee: 55000, installment_count: 3, paid_amount: 36000, pending_amount: 19000, status: 'partial' },
  { id: 'fa-009', student_id: 'stu-009', student_name: 'Rahul Joshi', batch_id: 'batch-001', batch_name: 'Batch A - 2026', total_fee: 45000, installment_count: 3, paid_amount: 15000, pending_amount: 30000, status: 'partial' },
  { id: 'fa-010', student_id: 'stu-010', student_name: 'Divya Iyer', batch_id: 'batch-005', batch_name: 'Batch E - 2025', total_fee: 35000, installment_count: 1, paid_amount: 35000, pending_amount: 0, status: 'paid' },
  { id: 'fa-011', student_id: 'stu-011', student_name: 'Manish Tiwari', batch_id: 'batch-005', batch_name: 'Batch E - 2025', total_fee: 35000, installment_count: 2, paid_amount: 25000, pending_amount: 10000, status: 'partial' },
  { id: 'fa-012', student_id: 'stu-012', student_name: 'Neha Kapoor', batch_id: 'batch-003', batch_name: 'Batch C - 2026', total_fee: 30000, installment_count: 3, paid_amount: 0, pending_amount: 30000, status: 'due' },
];

// ─── MONTHLY REVENUE ───────────────────────────────
export const monthlyRevenue: MonthlyRevenue[] = [
  { month: 'Aug 2025', collected: 60000, pending: 10000 },
  { month: 'Sep 2025', collected: 25000, pending: 10000 },
  { month: 'Oct 2025', collected: 18000, pending: 10000 },
  { month: 'Nov 2025', collected: 22000, pending: 10000 },
  { month: 'Dec 2025', collected: 15000, pending: 10000 },
  { month: 'Jan 2026', collected: 82500, pending: 85000 },
  { month: 'Feb 2026', collected: 69500, pending: 56500 },
  { month: 'Mar 2026', collected: 55000, pending: 146000 },
];

// ─── DASHBOARD STATS ──────────────────────────────
export const dashboardStats = {
  totalRevenue: payments.reduce((sum, p) => sum + (p.status === 'completed' ? p.amount : 0), 0),
  pendingDues: students.reduce((sum, s) => sum + s.pending_amount, 0),
  totalStudents: students.length,
  activeBatches: batches.filter(b => b.status === 'active').length,
  paidStudents: students.filter(s => s.payment_status === 'paid').length,
  partialStudents: students.filter(s => s.payment_status === 'partial').length,
  dueStudents: students.filter(s => s.payment_status === 'due').length,
  overdueInstallments: installments.filter(i => i.status === 'overdue').length,
};

// ─── UPCOMING DUES (next 30 days) ─────────────────
export const upcomingDues = installments
  .filter(i => i.status === 'due' || i.status === 'overdue')
  .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());

// ─── RECENT PAYMENTS ──────────────────────────────
export const recentPayments = [...payments]
  .sort((a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime())
  .slice(0, 8);
