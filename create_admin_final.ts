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

async function createAdmin() {
  const email = 'hebert.ss@gmail.com';
  const password = 'Zmd18kve';

  console.log(`Attempting to create admin user: ${email}`);

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: 'Admin User',
      },
    },
  });

  if (error) {
    console.error('❌ Failed to create user:', error.message);
    if (error.message.includes('rate limit')) {
        console.log('\n⚠️  Supabase Rate Limit Reached.');
        console.log('   This prevents automated scripts from creating too many users quickly.');
        console.log('   Please wait a while or create the user manually in the dashboard.');
    } else if (error.message.includes('already registered')) {
        console.log('\n⚠️  User already exists.');
        console.log('   Try logging in with the existing password.');
    }
  } else {
    if (data.user) {
        console.log('✅ User created successfully!');
        console.log('   ID:', data.user.id);
        console.log('   Email:', data.user.email);
        
        if (data.session) {
            console.log('   Session active (Auto-login successful).');
        } else {
            console.log('   ⚠️  User created but no session returned.');
            console.log('   Check your email inbox for a confirmation link.');
        }
    } else {
        console.log('⚠️  Request sent, but no user data returned. Check email for confirmation.');
    }
  }
}

createAdmin();
