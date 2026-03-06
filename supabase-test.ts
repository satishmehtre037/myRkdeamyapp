import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import { resolve } from 'path';

const envContent = fs.readFileSync(resolve(__dirname, '.env.local'), 'utf-8');
let supabaseUrl = '';
let supabaseKey = '';

for (const line of envContent.split('\n')) {
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) supabaseUrl = line.split('=')[1].trim();
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=')) supabaseKey = line.split('=')[1].trim();
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) supabaseKey = line.split('=')[1].trim();
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log('Testing Supabase query...');
  const { data, error } = await supabase.from('batches').select('*');
  console.log('Batches:', data?.length, 'Error:', error);
}

test().catch(console.error);
