import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'http://127.0.0.1:55432';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createAdminUser() {
  try {
    console.log('Creating admin user...');

    // Sign up the user
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: 'admin@test.com',
      password: 'password123'
    });

    if (signUpError) {
      console.error('Signup error:', signUpError);
      return;
    }

    console.log('User created:', signUpData.user?.id);

    // Wait a moment for the profile to be created by the trigger
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Update the profile to make them admin
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ is_admin: true })
      .eq('user_id', signUpData.user?.id);

    if (updateError) {
      console.error('Update error:', updateError);
      return;
    }

    console.log('Admin user created successfully!');
    console.log('Email: admin@test.com');
    console.log('Password: password123');

  } catch (error) {
    console.error('Error:', error);
  }
}

createAdminUser();