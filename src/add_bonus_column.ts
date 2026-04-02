import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function addBonusColumn() {
  const { error } = await supabase.rpc('exec_sql', {
    sql: 'ALTER TABLE planner_posts ADD COLUMN IF NOT EXISTS bonus TEXT;'
  });

  if (error) {
    console.error('Error adding column:', error);
  } else {
    console.log('Column added successfully');
  }
}

addBonusColumn();
