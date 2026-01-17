'use server'

import pool from '@/lib/db';
import { revalidatePath } from 'next/cache';

// --- UTILS: Ambil Daftar Driver (Untuk Dropdown) ---
export async function getDriversList() {
  const res = await pool.query(
    "SELECT user_id, nama_lengkap FROM users_data WHERE user_role_as = 'regular' ORDER BY nama_lengkap ASC"
  );
  return res.rows;
}

// --- ACTION: Create Shipment (Admin, Regular, & Freelance) ---
export async function createShipmentAction(prevState: any, formData: FormData) {
  try {
    const rawFormData = Object.fromEntries(formData.entries());
    
    // 1. Parsing Data & Validasi Dasar
    const shipment_id = parseFloat(rawFormData.shipment_id as string);
    const jumlah_toko = parseInt(rawFormData.jumlah_toko as string);
    const terkirim = parseInt(rawFormData.terkirim as string);
    const gagal = jumlah_toko - terkirim; // Auto-calc
    const tanggal = rawFormData.tanggal;
    
    // Logika Role & User ID
    // Jika dari Modal Admin/Freelance, user_id diambil berdasarkan nama_lengkap (driver) yang dipilih
    let user_id = rawFormData.user_id as string; 
    let nama_freelance = rawFormData.nama_freelance as string || null;

    // Validasi Logic
    if (terkirim > jumlah_toko) {
      return { error: 'Jumlah terkirim tidak boleh melebihi jumlah toko.' };
    }
    if (gagal > 0 && !rawFormData.alasan) {
      return { error: 'Alasan wajib diisi jika ada pengiriman gagal.' };
    }
    
    // Jika Admin/Freelance memilih driver dari dropdown, kita perlu pastikan user_id-nya benar
    if (!user_id && rawFormData.nama_lengkap) {
       // Logic tambahan jika perlu lookup user_id by nama_lengkap (biasanya dikirim via hidden input value)
       // Di sini kita asumsikan value dropdown adalah user_id
       user_id = rawFormData.nama_lengkap as string; 
    }

    // Query Insert
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
    return { error: 'Gagal menyimpan data. Pastikan ID Shipment unik atau koneksi aman.' };
  }
}

// --- ACTION: Update Cost (Admin Only) ---
export async function upsertFreelanceCost(prevState: any, formData: FormData) {
  try {
    const data = Object.fromEntries(formData.entries());
    
    // Kalkulasi Server Side (Double Check)
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

    // Cek apakah data cost sudah ada untuk shipment ini?
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