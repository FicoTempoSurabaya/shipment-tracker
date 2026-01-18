'use server'

import pool from '@/lib/db';
import { UserData, ShipmentData } from '@/types';
import { cookies } from 'next/headers';

interface RekapData {
  users: UserData[];
  freelancers: string[];
  shipments: ShipmentData[];
}

export async function getRekapShipmentData(startDate: string, endDate: string): Promise<RekapData> {
  try {
    const usersRes = await pool.query(
      "SELECT * FROM users_data WHERE user_role_as != 'admin' ORDER BY user_id ASC"
    );

    const freelanceRes = await pool.query(
      `SELECT DISTINCT nama_freelance 
       FROM shipment_data 
       WHERE nama_freelance IS NOT NULL 
       AND nama_freelance != '' 
       ORDER BY nama_freelance ASC`
    );

    // FIX TIMEZONE: Menggunakan ::DATE untuk memaksa perbandingan tanggal saja
    const shipmentRes = await pool.query(
      `SELECT 
        submit_id, shipment_id, user_id, nama_freelance, tanggal, 
        jumlah_toko, terkirim, gagal, alasan 
       FROM shipment_data 
       WHERE tanggal::DATE >= $1::DATE AND tanggal::DATE <= $2::DATE`,
      [startDate, endDate]
    );

    return {
      users: usersRes.rows,
      freelancers: freelanceRes.rows.map(r => r.nama_freelance),
      shipments: shipmentRes.rows,
    };
  } catch (error) {
    console.error('Error fetching rekap data:', error);
    return { users: [], freelancers: [], shipments: [] };
  }
}

export async function getCurrentUserSession() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('user_id')?.value;
  // FIX: Menghapus variabel userRole yang tidak digunakan

  if (!userId) return null;

  try {
    const res = await pool.query("SELECT user_id, nama_lengkap, user_role_as FROM users_data WHERE user_id = $1", [userId]);
    return res.rows[0] || null;
  } catch { // FIX: Menghapus variabel error yang tidak digunakan
    return null;
  }
}