import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkStatus() {
  console.log('🔍 Checking account status for: hebert.ss@gmail.com');

  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'hebert.ss@gmail.com',
    password: 'Zmd18kve',
  });

  if (authError) {
    console.error('❌ Login failed:', authError.message);
    return;
  }

  if (!authData.user) {
    console.error('❌ No user returned.');
    return;
  }

  console.log('✅ Login successful.');
  const userId = authData.user.id;

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (profileError) {
    console.error('❌ Could not fetch profile:', profileError.message);
  } else {
    console.log('\n📊 Account Status:');
    console.log(`   - User ID: ${profile.id}`);
    console.log(`   - Email: ${profile.email}`);
    console.log(`   - Admin Access: ${profile.is_admin ? '✅ YES' : '❌ NO'}`);
    console.log(`   - Credits: ${profile.credits}`);
    console.log(`   - Account Status: ${profile.status}`);
    
    if (profile.is_admin && profile.credits === 3) {
        console.log('\n✨ Everything looks perfect! You are ready to use the app.');
    } else {
        console.log('\n⚠️  Something is slightly off. Check the details above.');
    }
  }
}

checkStatus();
