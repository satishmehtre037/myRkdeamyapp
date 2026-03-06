import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import { resolve } from 'path';

// Parse .env.local
const envContent = fs.readFileSync(resolve(__dirname, '.env.local'), 'utf-8');
let supabaseUrl = '';
let supabaseKey = '';
for (const line of envContent.split('\n')) {
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) supabaseUrl = line.split('=')[1].trim();
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=')) supabaseKey = line.split('=')[1].trim();
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) supabaseKey = line.split('=')[1].trim();
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fix() {
  console.log('Fetching students missing fee assignments...');
  
  // Get all students
  const { data: students, error: studentError } = await supabase.from('students').select('id, batch_id');
  if (studentError) { console.error('Error fetching students:', studentError); return; }

  // Get all fee assignments
  const { data: fees, error: feeError } = await supabase.from('fee_assignments').select('student_id');
  if (feeError) { console.error('Error fetching fees:', feeError); return; }

  const feeStudentIds = new Set(fees.map((f: any) => f.student_id));
  
  const missing = students.filter((s: any) => !feeStudentIds.has(s.id));
  console.log(`Found ${missing.length} students missing fee assignments.`);

  if (missing.length === 0) return;

  // Get all batches for prices
  const { data: batches } = await supabase.from('batches').select('id, total_fee');
  const batchMap = new Map();
  if (batches) {
    for (const b of batches) batchMap.set(b.id, b.total_fee);
  }

  for (const student of missing) {
    if (!student.batch_id) continue;
    const totalFee = batchMap.get(student.batch_id) || 0;
    if (totalFee === 0) continue;

    console.log(`Creating fee assignment for student ${student.id} with fee ${totalFee}...`);
    
    const { data: feeAssignment, error: insertError } = await supabase
      .from('fee_assignments')
      .insert({
        student_id: student.id,
        batch_id: student.batch_id,
        total_fee: totalFee,
        installment_count: 1,
        paid_amount: 0,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Failed to create fee:', insertError);
      continue;
    }

    if (feeAssignment) {
      const dueDate = new Date();
      dueDate.setMonth(dueDate.getMonth() + 1);
      
      await supabase.from('installments').insert({
        fee_assignment_id: feeAssignment.id,
        student_id: student.id,
        installment_number: 1,
        amount: totalFee,
        due_date: dueDate.toISOString().split('T')[0],
        status: 'upcoming'
      });
      console.log(`Created installment for student ${student.id}`);
    }
  }
}

fix().catch(console.error);
