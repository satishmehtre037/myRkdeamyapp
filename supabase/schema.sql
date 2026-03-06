-- ============================================
-- RKDeamy Classes — Fee Management Schema
-- Run this in your Supabase SQL Editor
-- ============================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── BATCHES ─────────────────────────────────────

CREATE TABLE batches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  course_name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_fee NUMERIC(10, 2) NOT NULL DEFAULT 0,
  student_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('active', 'upcoming', 'completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── STUDENTS ────────────────────────────────────

CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  batch_id UUID REFERENCES batches(id) ON DELETE SET NULL,
  joined_at DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'graduated')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── FEE ASSIGNMENTS ─────────────────────────────

CREATE TABLE fee_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  batch_id UUID NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
  total_fee NUMERIC(10, 2) NOT NULL,
  installment_count INTEGER NOT NULL DEFAULT 1,
  paid_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  pending_amount NUMERIC(10, 2) GENERATED ALWAYS AS (total_fee - paid_amount) STORED,
  status TEXT NOT NULL DEFAULT 'due' CHECK (status IN ('paid', 'partial', 'due')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── INSTALLMENTS ────────────────────────────────

CREATE TABLE installments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fee_assignment_id UUID NOT NULL REFERENCES fee_assignments(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  installment_number INTEGER NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  due_date DATE NOT NULL,
  paid_date DATE,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('paid', 'due', 'overdue', 'upcoming')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── PAYMENTS ────────────────────────────────────

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  installment_id UUID REFERENCES installments(id) ON DELETE SET NULL,
  amount NUMERIC(10, 2) NOT NULL,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_method TEXT NOT NULL DEFAULT 'cash' CHECK (payment_method IN ('cash', 'upi', 'bank_transfer', 'card')),
  receipt_number TEXT UNIQUE NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'pending', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── INDEXES ─────────────────────────────────────

CREATE INDEX idx_students_batch ON students(batch_id);
CREATE INDEX idx_students_status ON students(status);
CREATE INDEX idx_fee_assignments_student ON fee_assignments(student_id);
CREATE INDEX idx_fee_assignments_batch ON fee_assignments(batch_id);
CREATE INDEX idx_installments_student ON installments(student_id);
CREATE INDEX idx_installments_fee_assignment ON installments(fee_assignment_id);
CREATE INDEX idx_installments_status ON installments(status);
CREATE INDEX idx_installments_due_date ON installments(due_date);
CREATE INDEX idx_payments_student ON payments(student_id);
CREATE INDEX idx_payments_date ON payments(payment_date);
CREATE INDEX idx_payments_receipt ON payments(receipt_number);

-- ─── ROW LEVEL SECURITY ─────────────────────────

ALTER TABLE batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE fee_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE installments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users full access (admin dashboard)
CREATE POLICY "Admin full access on batches" ON batches
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admin full access on students" ON students
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admin full access on fee_assignments" ON fee_assignments
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admin full access on installments" ON installments
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admin full access on payments" ON payments
  FOR ALL USING (auth.role() = 'authenticated');

-- ─── TRIGGER: Auto-update updated_at ─────────────

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_batches_updated_at
  BEFORE UPDATE ON batches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_students_updated_at
  BEFORE UPDATE ON students
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_fee_assignments_updated_at
  BEFORE UPDATE ON fee_assignments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_installments_updated_at
  BEFORE UPDATE ON installments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
