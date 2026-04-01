import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function fixAllTrials() {
  const { data, error } = await supabase
    .from('profiles')
    .update({ status: 'pending_payment', credits: 0 })
    .eq('status', 'trial')
    .eq('is_paid', false);
  
  if (error) {
    console.error('Error fixing users:', error);
  } else {
    console.log('Users fixed successfully:', data);
  }
}
fixAllTrials();
