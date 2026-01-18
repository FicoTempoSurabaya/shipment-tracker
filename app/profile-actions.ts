'use server'

import pool from '@/lib/db';
import { revalidatePath } from 'next/cache';

// --- TIPE DATA USER ---
export interface UserPayload {
  user_id: string; // Text, Wajib Unik
  nama_lengkap: string;
  tanggal_lahir: string;
  tempat_lahir: string;
  alamat: string;
  no_telp: string;
  email: string;
  license_type: string;
  license_id: string; // Numeric string
  masa_berlaku: string;
  jenis_unit: string | null;
  nopol: string | null;
  username: string;
  password?: string; // Optional saat update jika tidak ingin ganti pass
  user_role_as: 'admin' | 'regular';
}

// --- CREATE USER (ADMIN ONLY) ---
export async function createUser(data: UserPayload) {
  try {
    const query = `
      INSERT INTO users_data (
        user_id, nama_lengkap, tanggal_lahir, tempat_lahir, alamat,
        no_telp, email, license_type, license_id, masa_berlaku,
        jenis_unit, nopol, username, password, user_role_as
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
    `;

    await pool.query(query, [
      data.user_id,
      data.nama_lengkap,
      data.tanggal_lahir,
      data.tempat_lahir,
      data.alamat,
      data.no_telp,
      data.email,
      data.license_type,
      data.license_id,
      data.masa_berlaku,
      data.jenis_unit || null,
      data.nopol || null,
      data.username,
      data.password, // Password wajib saat create
      data.user_role_as
    ]);

    revalidatePath('/dashboard/profile');
    revalidatePath('/dashboard/rekap'); // Update dropdown user di rekap
    return { success: true, message: 'User berhasil ditambahkan' };

  } catch (error: unknown) {
    console.error('Create User Error:', error);
    // Type checking aman
    if (typeof error === 'object' && error !== null && 'code' in error) {
      if ((error as { code: string }).code === '23505') {
        return { success: false, message: 'ID User atau Username sudah terdaftar' };
      }
    }
    return { success: false, message: 'Gagal menambahkan user' };
  }
}

// --- UPDATE USER (ADMIN & REGULAR) ---
// Menghapus parameter isRegularUpdate yang tidak terpakai
export async function updateUser(data: UserPayload) {
  try {
    let query = `
      UPDATE users_data SET
        nama_lengkap = $2,
        tanggal_lahir = $3,
        tempat_lahir = $4,
        alamat = $5,
        no_telp = $6,
        email = $7,
        license_type = $8,
        license_id = $9,
        masa_berlaku = $10,
        jenis_unit = $11,
        nopol = $12,
        username = $13,
        user_role_as = $14
    `;
    
    const params = [
      data.user_id, // $1 (WHERE clause)
      data.nama_lengkap, // $2
      data.tanggal_lahir, // $3
      data.tempat_lahir, // $4
      data.alamat, // $5
      data.no_telp, // $6
      data.email, // $7
      data.license_type, // $8
      data.license_id, // $9
      data.masa_berlaku, // $10
      data.jenis_unit || null, // $11
      data.nopol || null, // $12
      data.username, // $13
      data.user_role_as // $14
    ];

    // Jika password diisi, tambahkan ke query
    if (data.password && data.password.trim() !== '') {
      query += `, password = $15 WHERE user_id = $1`;
      params.push(data.password);
    } else {
      query += ` WHERE user_id = $1`;
    }

    await pool.query(query, params);

    revalidatePath('/dashboard/profile');
    return { success: true, message: 'Data profil berhasil diperbarui' };

  } catch (error: unknown) {
    console.error('Update User Error:', error);
    return { success: false, message: 'Gagal memperbarui data user' };
  }
}

// --- DELETE USER (ADMIN ONLY) ---
export async function deleteUser(userId: string) {
  try {
    await pool.query('DELETE FROM users_data WHERE user_id = $1', [userId]);
    
    revalidatePath('/dashboard/profile');
    revalidatePath('/dashboard/rekap');
    return { success: true, message: 'User berhasil dihapus' };
  } catch (error: unknown) {
    console.error('Delete User Error:', error);
    return { success: false, message: 'Gagal menghapus user (Mungkin masih memiliki data shipment terkait)' };
  }
}

// --- GET ALL USERS (Untuk Tabel Profile Admin) ---
export async function getAllUsers() {
    const res = await pool.query("SELECT * FROM users_data ORDER BY nama_lengkap ASC");
    return res.rows;
}