import { Pool } from '@neondatabase/serverless';
import { cookies } from 'next/headers';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default pool;

// --- Helper Auth Sederhana ---
export async function getUserSession() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('user_id')?.value;
  const userRole = cookieStore.get('user_role')?.value;

  if (!userId) return null;

  return {
    id: userId,
    role: userRole as 'admin' | 'regular'
  };
}