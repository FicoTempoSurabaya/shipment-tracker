'use server'

import pool from '@/lib/db';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { UserData } from '@/types';

// Definisi tipe untuk return value dari action
type ActionState = {
  error?: string;
} | null;

export async function loginAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;

  if (!username || !password) {
    return { error: 'Username dan password wajib diisi.' };
  }

  try {
    // Kita lakukan casting manual karena raw SQL returnnya 'any'
    const query = `
      SELECT user_id, username, password, nama_lengkap, user_role_as 
      FROM users_data 
      WHERE username = $1
    `;
    
    const result = await pool.query(query, [username]);

    if (result.rows.length === 0) {
      return { error: 'Username tidak ditemukan.' };
    }

    const user = result.rows[0] as UserData;

    // Cek password (Plain text)
    if (user.password !== password) {
      return { error: 'Password salah.' };
    }

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set('user_id', user.user_id, { httpOnly: true, path: '/' });
    cookieStore.set('user_role', user.user_role_as, { httpOnly: true, path: '/' });

  } catch (err) {
    console.error('Database Error:', err);
    return { error: 'Terjadi kesalahan sistem.' };
  }

  redirect('/dashboard');
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('user_id');
  cookieStore.delete('user_role');
  redirect('/');
}