import pool from './db';
import { DriverOption } from '@/types';

/**
 * SESUAI ATURAN BISNIS: 
 * Cut-off periode (16–15)
 * FIX TIMEZONE: Menggunakan Intl.DateTimeFormat untuk mendapatkan tanggal WIB yang pasti
 */
export function getCutOffDates() {
  // Ambil waktu sekarang dalam zona Jakarta
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  
  // Format: YYYY-MM-DD
  const parts = formatter.formatToParts(now);
  const year = parseInt(parts.find(p => p.type === 'year')?.value || '');
  const month = parseInt(parts.find(p => p.type === 'month')?.value || '') - 1; // 0-indexed
  const day = parseInt(parts.find(p => p.type === 'day')?.value || '');

  let startDate: Date;
  let endDate: Date;

  if (day <= 15) {
    // Tanggal hari ini ≤15: 16 bulan lalu s/d 15 bulan ini
    startDate = new Date(year, month - 1, 16, 0, 0, 0, 0);
    endDate = new Date(year, month, 15, 23, 59, 59, 999);
  } else {
    // Tanggal hari ini ≥16: 16 bulan ini s/d 15 bulan depan
    startDate = new Date(year, month, 16, 0, 0, 0, 0);
    endDate = new Date(year, month + 1, 15, 23, 59, 59, 999);
  }

  return { startDate, endDate };
}

export async function getRegularDrivers(): Promise<DriverOption[]> {
  const res = await pool.query(
    `SELECT user_id, nama_lengkap FROM users_data WHERE user_role_as = 'regular' ORDER BY nama_lengkap ASC`
  );
  return res.rows;
}