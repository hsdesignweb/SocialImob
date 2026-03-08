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

async function manageAdmin() {
  console.log('🔍 Checking Admin User: hebert.ss@gmail.com');

  const email = 'hebert.ss@gmail.com';
  const password = 'Zmd18kve';

  // 1. Try to Login
  console.log('1. Attempting to Log In...');
  const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  let userId = loginData.user?.id;

  if (loginError) {
    console.log('   Login failed:', loginError.message);
    
    if (loginError.message.includes('Invalid login credentials')) {
        console.log('   User might not exist or password wrong. Attempting to Sign Up...');
        
        // 2. Try to Sign Up
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { name: 'Admin User' }
            }
        });

        if (signUpError) {
            console.error('❌ Sign Up Error:', signUpError.message);
            return;
        }
        
        if (signUpData.user) {
            console.log('✅ Sign Up Successful!');
            userId = signUpData.user.id;
            
            // Wait for trigger
            console.log('   Waiting for profile creation...');
            await new Promise(r => setTimeout(r, 2000));
        } else {
             console.log('⚠️ Sign up initiated, check email for confirmation if required.');
             return;
        }
    } else {
        return;
    }
  } else {
      console.log('✅ Login Successful!');
  }

  if (!userId) return;

  // 3. Check Profile
  console.log('2. Verifying Profile...');
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (profileError) {
      console.error('❌ Profile Error:', profileError.message);
  } else {
      console.log('✅ Profile Found:');
      console.log(`   - Email: ${profile.email}`);
      console.log(`   - Is Admin: ${profile.is_admin}`);
      console.log(`   - Credits: ${profile.credits}`);
      
      if (profile.is_admin) {
          console.log('🎉 Admin privileges verified!');
      } else {
          console.warn('⚠️ User exists but is_admin is FALSE. The trigger logic might need adjustment or manual update.');
      }
  }
}

manageAdmin();
