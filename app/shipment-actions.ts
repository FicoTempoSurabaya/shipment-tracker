'use server'

import pool from '@/lib/db';
import { revalidatePath } from 'next/cache';

// --- DEFINISI TIPE (Agar tidak menggunakan 'any') ---

interface ShipmentPayload {
  submit_id?: number;
  shipment_id: string;
  user_id?: string | number | null;
  nama_freelance?: string | null;
  tanggal: string;
  jumlah_toko: number;
  terkirim: number;
  gagal: number;
  alasan?: string | null;
}

type ActionState = {
  success?: boolean;
  error?: string;
  message?: string;
} | null;

// --- UTILS: Ambil Daftar Driver ---
export async function getDriversList() {
  const res = await pool.query(
    "SELECT user_id, nama_lengkap FROM users_data WHERE user_role_as = 'regular' ORDER BY nama_lengkap ASC"
  );
  return res.rows;
}

// --- 1. NEW ACTION: Create Shipment (Object Payload) ---
export async function createShipment(data: ShipmentPayload) {
  try {
    const {
      shipment_id,
      user_id,
      nama_freelance,
      tanggal,
      jumlah_toko,
      terkirim,
      gagal,
      alasan
    } = data;

    // Validasi Sederhana
    if (terkirim > jumlah_toko) {
      return { success: false, message: 'Jumlah terkirim tidak boleh melebihi total toko' };
    }

    const query = `
      INSERT INTO shipment_data (
        shipment_id, user_id, nama_freelance, tanggal, 
        jumlah_toko, terkirim, gagal, alasan
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `;

    await pool.query(query, [
      shipment_id,
      user_id || null,
      nama_freelance || null,
      tanggal,
      jumlah_toko,
      terkirim,
      gagal,
      alasan || null
    ]);

    revalidatePath('/dashboard/rekap');
    revalidatePath('/dashboard/shipment');
    revalidatePath('/dashboard'); 
    return { success: true, message: 'Data berhasil disimpan' };

  } catch (error: unknown) {
    console.error('Create Error:', error);
    
    // Type checking aman untuk error database
    if (typeof error === 'object' && error !== null && 'code' in error) {
      if ((error as { code: string }).code === '23505') {
        return { success: false, message: 'ID Shipment sudah terdaftar!' };
      }
    }
    return { success: false, message: 'Gagal menyimpan data ke database' };
  }
}

// --- 2. NEW ACTION: Update Shipment ---
export async function updateShipment(data: ShipmentPayload) {
  try {
    const {
      submit_id,
      shipment_id,
      user_id,
      nama_freelance,
      tanggal,
      jumlah_toko,
      terkirim,
      gagal,
      alasan
    } = data;

    const query = `
      UPDATE shipment_data SET
        shipment_id = $1,
        user_id = $2,
        nama_freelance = $3,
        tanggal = $4,
        jumlah_toko = $5,
        terkirim = $6,
        gagal = $7,
        alasan = $8
      WHERE submit_id = $9
    `;

    await pool.query(query, [
      shipment_id,
      user_id || null,
      nama_freelance || null,
      tanggal,
      jumlah_toko,
      terkirim,
      gagal,
      alasan || null,
      submit_id
    ]);

    revalidatePath('/dashboard/rekap');
    revalidatePath('/dashboard/shipment');
    revalidatePath('/dashboard');
    return { success: true, message: 'Data berhasil diperbarui' };

  } catch (error) {
    console.error('Update Error:', error);
    return { success: false, message: 'Gagal update data' };
  }
}

// --- 3. NEW ACTION: Delete Shipment ---
export async function deleteShipment(submit_id: number) {
  try {
    await pool.query('DELETE FROM freelance_cost WHERE submit_id = $1', [submit_id]);
    await pool.query('DELETE FROM shipment_data WHERE submit_id = $1', [submit_id]);
    
    revalidatePath('/dashboard/rekap');
    revalidatePath('/dashboard/shipment');
    revalidatePath('/dashboard');
    return { success: true, message: 'Data berhasil dihapus' };
  } catch (error) {
    console.error('Delete Error:', error);
    return { success: false, message: 'Gagal menghapus data' };
  }
}

// --- 4. LEGACY ACTION: Create Shipment (FormData) ---
export async function createShipmentAction(prevState: ActionState, formData: FormData) {
  try {
    const rawFormData = Object.fromEntries(formData.entries());
    
    const shipment_id = rawFormData.shipment_id as string;
    const jumlah_toko = parseInt(rawFormData.jumlah_toko as string);
    const terkirim = parseInt(rawFormData.terkirim as string);
    const gagal = jumlah_toko - terkirim; 
    const tanggal = rawFormData.tanggal;
    
    // Logic Role
    let user_id = rawFormData.user_id as string; 
    // FIX: Menggunakan const karena tidak pernah diubah
    const nama_freelance = (rawFormData.nama_freelance as string) || null;

    if (terkirim > jumlah_toko) {
      return { error: 'Jumlah terkirim tidak boleh melebihi jumlah toko.' };
    }
    if (gagal > 0 && !rawFormData.alasan) {
      return { error: 'Alasan wajib diisi jika ada pengiriman gagal.' };
    }
    
    // Logic Fallback ID
    if (!user_id && rawFormData.nama_lengkap) {
       user_id = rawFormData.nama_lengkap as string; 
    }

    const query = `
      INSERT INTO shipment_data (
        shipment_id, user_id, nama_freelance, tanggal, 
        jumlah_toko, terkirim, gagal, alasan
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `;

    await pool.query(query, [
      shipment_id, user_id, nama_freelance, tanggal,
      jumlah_toko, terkirim, gagal, rawFormData.alasan || null
    ]);

    revalidatePath('/dashboard');
    return { success: true, message: 'Data pengiriman berhasil disimpan!' };

  } catch (err) {
    console.error('Create Shipment Error:', err);
    return { error: 'Gagal menyimpan data. Pastikan ID Shipment unik.' };
  }
}

// --- 5. EXISTING ACTION: Upsert Freelance Cost (FormData) ---
export async function upsertFreelanceCost(prevState: ActionState, formData: FormData) {
  try {
    const data = Object.fromEntries(formData.entries());
    
    const fee_harian = Number(data.fee_harian) || 0;
    const perdinas = Number(data.perdinas) || 0;
    const bbm = Number(data.bbm) || 0;
    const tol = Number(data.tol) || 0;
    const parkir = Number(data.parkir) || 0;
    const tkbm = Number(data.tkbm) || 0;
    const lain_lain = Number(data.lain_lain) || 0;
    const dp_awal = Number(data.dp_awal) || 0;

    const sub_total = fee_harian + perdinas + bbm + tol + parkir + tkbm + lain_lain;
    const grand_total = dp_awal - sub_total;

    const checkQuery = "SELECT id FROM freelance_cost WHERE submit_id = $1";
    const checkRes = await pool.query(checkQuery, [data.submit_id]);

    if (checkRes.rows.length > 0) {
      // UPDATE
      const updateQuery = `
        UPDATE freelance_cost SET 
          dp_awal=$1, fee_harian=$2, perdinas=$3, bbm=$4, tol=$5, parkir=$6, 
          tkbm=$7, lain_lain=$8, sub_total=$9, grand_total=$10, status_cost=$11 
        WHERE submit_id=$12
      `;
      await pool.query(updateQuery, [
        dp_awal, fee_harian, perdinas, bbm, tol, parkir, tkbm, lain_lain, 
        sub_total, grand_total, data.status_cost, data.submit_id
      ]);
    } else {
      // INSERT
      const insertQuery = `
        INSERT INTO freelance_cost (
          submit_id, user_id, nama_freelance, tanggal, shipment_id,
          dp_awal, fee_harian, perdinas, bbm, tol, parkir, tkbm, lain_lain,
          sub_total, grand_total, status_cost
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      `;
      await pool.query(insertQuery, [
        data.submit_id, data.user_id, data.nama_freelance, data.tanggal, data.shipment_id,
        dp_awal, fee_harian, perdinas, bbm, tol, parkir, tkbm, lain_lain, 
        sub_total, grand_total, data.status_cost
      ]);
    }

    revalidatePath('/dashboard');
    return { success: true };

  } catch (err) {
    console.error("Cost Error:", err);
    return { error: "Gagal menyimpan data biaya." };
  }
}