'use server'

import pool from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export type ActionState = {
  success?: boolean;
  message?: string;
  error?: string;
} | null;

// Helper validasi 10 digit angka
const isValidShipmentId = (id: string) => /^\d{10}$/.test(id);

// --- FUNGSI LOGOUT (WAJIB ADA UNTUK TOMBOL SIDEBAR) ---
export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('user_id');
  cookieStore.delete('user_role');
  cookieStore.delete('user_name');
  redirect('/');
}

// --- 1. ACTION: ADMIN INPUT ---
export async function createShipmentAdmin(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const userId = formData.get('user_id') as string;
    const tanggal = formData.get('tanggal') as string;
    const shipmentIdRaw = formData.get('shipment_id') as string;
    const jumlahToko = Number(formData.get('jumlah_toko'));
    const terkirim = Number(formData.get('terkirim'));
    const alasan = formData.get('alasan') as string;

    if (!isValidShipmentId(shipmentIdRaw)) return { error: 'ID Shipment wajib 10 digit angka.' };
    if (terkirim > jumlahToko) return { error: 'Terkirim melebihi total toko.' };

    const gagal = jumlahToko - terkirim;
    if (gagal > 0 && !alasan) return { error: 'Alasan wajib diisi jika gagal.' };

    await pool.query(
      `INSERT INTO shipment_data (user_id, shipment_id, tanggal, jumlah_toko, terkirim, gagal, alasan)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [userId, shipmentIdRaw, tanggal, jumlahToko, terkirim, gagal, alasan]
    );

    revalidatePath('/dashboard');
    return { success: true, message: 'Data berhasil disimpan oleh Admin.' };
  } catch (err) {
    console.error('Admin Input Error:', err);
    return { error: 'Gagal menyimpan data ke database.' };
  }
}

// --- 2. ACTION: REGULAR INPUT ---
export async function createShipmentRegular(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const cookieStore = await cookies();
    const currentUserId = cookieStore.get('user_id')?.value;
    if (!currentUserId) return { error: 'Sesi habis, silakan login kembali.' };

    const tanggal = formData.get('tanggal') as string;
    const shipmentIdRaw = formData.get('shipment_id') as string;
    const jumlahToko = Number(formData.get('jumlah_toko'));
    const terkirim = Number(formData.get('terkirim'));
    const alasan = formData.get('alasan') as string;

    if (!isValidShipmentId(shipmentIdRaw)) return { error: 'ID Shipment wajib 10 digit.' };
    
    const gagal = jumlahToko - terkirim;
    await pool.query(
      `INSERT INTO shipment_data (user_id, shipment_id, tanggal, jumlah_toko, terkirim, gagal, alasan)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [currentUserId, shipmentIdRaw, tanggal, jumlahToko, terkirim, gagal, alasan]
    );

    revalidatePath('/dashboard');
    return { success: true, message: 'Laporan berhasil dikirim.' };
  } catch (err) {
    console.error('Regular Input Error:', err);
    return { error: 'Terjadi kesalahan sistem saat mengirim laporan.' };
  }
}

// --- 3. ACTION: FREELANCE INPUT ---
export async function createShipmentFreelance(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const userId = formData.get('user_id') as string;
    const namaFreelance = formData.get('nama_freelance') as string;
    const shipmentIdRaw = formData.get('shipment_id') as string;
    const jumlahToko = Number(formData.get('jumlah_toko'));
    const terkirim = Number(formData.get('terkirim'));
    
    if (!isValidShipmentId(shipmentIdRaw)) return { error: 'ID Shipment wajib 10 digit.' };

    await pool.query(
      `INSERT INTO shipment_data (user_id, nama_freelance, shipment_id, tanggal, jumlah_toko, terkirim, gagal, alasan)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [userId, namaFreelance, shipmentIdRaw, formData.get('tanggal'), jumlahToko, terkirim, jumlahToko - terkirim, formData.get('alasan')]
    );

    revalidatePath('/dashboard');
    return { success: true, message: 'Data Freelance berhasil dikirim!' };
  } catch (err) {
    console.error('Freelance Input Error:', err);
    return { error: 'Gagal input data freelance.' };
  }
}

// --- 4. ACTION: UPDATE SHIPMENT (Admin & Regular) ---
export async function updateShipment(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const submitId = formData.get('submit_id');
    const userId = formData.get('user_id') as string;
    const namaFreelance = formData.get('nama_freelance') as string || null;
    const tanggal = formData.get('tanggal') as string;
    const shipmentIdRaw = formData.get('shipment_id') as string;
    const jumlahToko = Number(formData.get('jumlah_toko'));
    const terkirim = Number(formData.get('terkirim'));
    const alasan = formData.get('alasan') as string;

    if (!isValidShipmentId(shipmentIdRaw)) return { error: 'ID Shipment wajib 10 digit.' };
    const gagal = jumlahToko - terkirim;

    await pool.query(
      `UPDATE shipment_data 
       SET user_id = $1, nama_freelance = $2, tanggal = $3, shipment_id = $4, 
           jumlah_toko = $5, terkirim = $6, gagal = $7, alasan = $8
       WHERE submit_id = $9`,
      [userId, namaFreelance, tanggal, shipmentIdRaw, jumlahToko, terkirim, gagal, alasan, submitId]
    );

    revalidatePath('/dashboard');
    return { success: true, message: 'Data berhasil diperbarui.' };
  } catch (err) {
    console.error('Update Error:', err);
    return { error: 'Gagal memperbarui data.' };
  }
}

// --- 5. ACTION: DELETE SHIPMENT ---
export async function deleteShipment(submitId: number): Promise<ActionState> {
  try {
    await pool.query('DELETE FROM shipment_data WHERE submit_id = $1', [submitId]);
    revalidatePath('/dashboard');
    return { success: true, message: 'Data berhasil dihapus.' };
  } catch (err) {
    console.error('Delete Error:', err);
    return { error: 'Gagal menghapus data.' };
  }
}

// --- 6. ACTION: SAVE FREELANCE COST ---
export async function saveFreelanceCost(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const vals = [
      formData.get('user_id'), formData.get('nama_lengkap'), formData.get('nama_freelance'),
      formData.get('tanggal'), formData.get('shipment_id'), Number(formData.get('dp_awal')),
      Number(formData.get('fee_harian')), Number(formData.get('perdinas')), Number(formData.get('bbm')),
      Number(formData.get('tol')), Number(formData.get('parkir')), Number(formData.get('tkbm')),
      Number(formData.get('lain_lain')), Number(formData.get('sub_total')), Number(formData.get('grand_total')),
      formData.get('status_cost')
    ];

    await pool.query(
      `INSERT INTO freelance_cost (
        user_id, nama_lengkap, nama_freelance, tanggal, shipment_id, 
        dp_awal, fee_harian, perdinas, bbm, tol, parkir, tkbm, 
        lain_lain, sub_total, grand_total, status_cost
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      ON CONFLICT (shipment_id) DO UPDATE SET 
      dp_awal = EXCLUDED.dp_awal, sub_total = EXCLUDED.sub_total, 
      grand_total = EXCLUDED.grand_total, status_cost = EXCLUDED.status_cost`,
      vals
    );

    revalidatePath('/dashboard');
    return { success: true, message: 'Biaya Freelance berhasil disimpan.' };
  } catch (err) {
    console.error('Cost Save Error:', err);
    return { error: 'Gagal menyimpan rincian biaya.' };
  }
}

// --- 7. ACTION: USER MANAGEMENT (ADMIN) ---
export async function upsertUser(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const data = [
      formData.get('user_id'), formData.get('username'), formData.get('password'),
      formData.get('user_role_as'), formData.get('nama_lengkap'), formData.get('license_id')
    ];

    await pool.query(
      `INSERT INTO users_data (user_id, username, password, user_role_as, nama_lengkap, license_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (user_id) DO UPDATE SET 
       username = EXCLUDED.username, password = EXCLUDED.password, nama_lengkap = EXCLUDED.nama_lengkap`,
      data
    );

    revalidatePath('/dashboard/users');
    return { success: true, message: 'Data User berhasil diperbarui.' };
  } catch (err) {
    console.error('User Upsert Error:', err);
    return { error: 'Gagal memproses data user.' };
  }
}

export async function deleteUser(userId: string): Promise<ActionState> {
  try {
    await pool.query(`DELETE FROM users_data WHERE user_id = $1`, [userId]);
    revalidatePath('/dashboard/users');
    return { success: true, message: 'User dihapus.' };
  } catch (err) {
    console.error('User Delete Error:', err);
    return { error: 'Gagal menghapus user.' };
  }
}