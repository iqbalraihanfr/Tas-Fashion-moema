import { createClient } from '@supabase/supabase-js';
import { hash } from 'bcryptjs';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function seedAdmin() {
  const email = 'admin@moema.com';
  const password = 'password123';
  
  console.log('🔐 Creating/resetting admin user...\n');
  
  // Hash the password
  const passwordHash = await hash(password, 10);
  
  // Check if AdminUser table exists, if not create it
  const { error: tableCheckError } = await supabase
    .from('AdminUser')
    .select('id')
    .limit(1);
  
  if (tableCheckError && tableCheckError.message.includes('does not exist')) {
    console.log('📋 Table AdminUser not found. Please create it first in Supabase SQL Editor:\n');
    console.log(`
CREATE TABLE IF NOT EXISTS "AdminUser" (
  "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  "email" TEXT UNIQUE NOT NULL,
  "name" TEXT,
  "passwordHash" TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ DEFAULT now(),
  "updatedAt" TIMESTAMPTZ DEFAULT now()
);
    `);
    console.log('Run the SQL above, then run this script again.');
    return;
  }

  // Upsert admin user (insert or update if exists)
  const { data, error } = await supabase
    .from('AdminUser')
    .upsert(
      {
        email,
        passwordHash,
      },
      { onConflict: 'email' }
    )
    .select();

  if (error) {
    console.error('❌ Error creating admin:', error.message);
    return;
  }

  console.log('✅ Admin user created/updated successfully!');
  console.log(`   Email:    ${email}`);
  console.log(`   Password: ${password}`);
  console.log(`   Data:`, data);
  console.log('\n⚠️  Please change the password after first login!');
}

seedAdmin().catch(console.error);
