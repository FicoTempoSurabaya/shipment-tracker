import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import pool from '@/lib/db';
import DashboardClient from './DashboardClient';
import { getRegularDrivers, getCutOffDates } from '@/lib/data';
import { ShipmentData } from '@/types';

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('user_id')?.value;
  const userRole = cookieStore.get('user_role')?.value as 'admin' | 'regular';

  if (!userId) redirect('/');

  const { startDate, endDate } = getCutOffDates();

  // Ambil profil lengkap user
  const userRes = await pool.query(
    'SELECT user_id, nama_lengkap, user_role_as FROM users_data WHERE user_id = $1', 
    [userId]
  );
  const userProfile = userRes.rows[0];
  const drivers = await getRegularDrivers();

  const sDate = startDate.toLocaleDateString('en-CA');
  const eDate = endDate.toLocaleDateString('en-CA');

  // Query SQL: Admin melihat semua, Regular hanya melihat miliknya ($1)
  const tableRes = await pool.query(`
    SELECT s.*, u.nama_lengkap as driver_name 
    FROM shipment_data s
    LEFT JOIN users_data u ON s.user_id = u.user_id
    WHERE ($2 = 'admin' OR s.user_id = $1)
    ORDER BY s.tanggal DESC
  `, [userId, userRole]);

  const allData: ShipmentData[] = JSON.parse(JSON.stringify(tableRes.rows));

  const initialPeriod = {
    start: sDate,
    end: eDate
  };

  return (
    <DashboardClient 
      user={userProfile} 
      allData={allData} 
      drivers={drivers}
      initialPeriod={initialPeriod}
    />
  );
}