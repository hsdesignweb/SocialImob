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

async function verify() {
  console.log('🔍 Verifying Supabase setup...');
  console.log(`   URL: ${supabaseUrl}`);

  // 1. Check if we can connect (list tables/health check essentially)
  // We'll try to select from the 'profiles' table. If it fails with 404/PGRST204/etc it might mean table doesn't exist
  // If it fails with 401 it means auth is wrong.
  
  console.log('\n1. Testing connection and table existence...');
  const { data, error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });

  if (error) {
    console.error('❌ Connection/Table Error:', error.message, error.code);
    if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
        console.error('   CAUSE: The "profiles" table does not exist.');
        console.error('   SOLUTION: You still need to run the SQL migration in Supabase SQL Editor.');
    } else if (error.code === '401' || error.message.includes('JWT')) {
         console.error('   CAUSE: Authentication failed. The API Key might still be incorrect.');
    }
  } else {
    console.log('✅ Connection successful!');
    console.log('✅ Table "profiles" exists (or at least is accessible).');
  }

  // 2. Test Auth Signup (Dry run if possible, or just real signup)
  const testEmail = `verify_${Date.now()}@example.com`;
  const testPassword = 'Password123!';

  console.log(`\n2. Attempting to register test user: ${testEmail}`);
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: testEmail,
    password: testPassword,
    options: {
      data: {
        name: 'Verification User',
      },
    },
  });

  if (authError) {
    console.error('❌ Auth Error:', authError.message);
    return;
  }

  if (!authData.user) {
    console.error('❌ No user returned after signup (Check if email confirmation is enabled/required).');
    return;
  }

  console.log('✅ User registered successfully.');
  const userId = authData.user.id;

  console.log('\n3. Waiting for database trigger to create profile...');
  await new Promise(resolve => setTimeout(resolve, 2000));

  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (profileError) {
    console.error('❌ Profile Fetch Error:', profileError.message);
    console.error('   CAUSE: The SQL Trigger "handle_new_user" likely did not run.');
    console.error('   SOLUTION: Make sure you ran the FULL SQL migration code.');
  } else if (profileData) {
    console.log('✅ Profile found!');
    console.log(`   Credits: ${profileData.credits} (Expected: 3)`);
    console.log(`   Status: ${profileData.status} (Expected: trial)`);
    
    if (profileData.credits === 3) {
        console.log('\n🎉 SUCCESS! Full integration verified.');
    }
  }
}

verify();
