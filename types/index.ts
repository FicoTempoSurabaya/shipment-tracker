// Sesuai Tabel 1: users_data
export interface UserData {
  user_id: string;
  username: string;
  password?: string; // Optional karena kita seringkali tidak me-return password ke frontend
  user_role_as: 'admin' | 'regular';
  nama_lengkap: string;
  tempat_lahir?: string;
  tanggal_lahir: Date;
  alamat?: string;
  no_telp?: string;
  email?: string;
  license_type?: 'A' | 'B1' | 'B1 Umum' | 'B2' | 'B2 Umum' | 'C';
  license_id: string;
  masa_berlaku: string;
  jenis_unit?: 'R2' | 'L300' | 'CDE' | 'CDD';
  nopol?: string;
}

// Sesuai Tabel 2: shipment_data
export interface ShipmentData {
  submit_id: number;
  shipment_id: number;
  user_id: string;
  nama_freelance?: string | null;
  tanggal: Date | string; // Bisa date obj atau string dari DB
  jumlah_toko: number;
  terkirim: number;
  gagal: number;
  alasan?: string | null;
  // Field tambahan hasil JOIN untuk tampilan (misal nama driver)
  driver_name?: string; 
}

export interface FreelanceCostData {
  id: number;
  submit_id: number;
  user_id: string;
  nama_freelance: string;
  tanggal: Date | string;
  shipment_id: number;
  status_cost: 'lunas' | 'pending';
  bbm: number;
  dp_awal: number;
  fee_harian: number;
  grand_total: number;
  lain_lain: number;
  parkir: number;
  perdinas: number; // Uang Makan
  sub_total: number;
  tkbm: number; // Koli/Karton
  tol: number;
}

export interface DriverOption {
  user_id: string;
  nama_lengkap: string;
}


//export type QuestionType = 'image_choice' | 'likert' | 'multiple_choice' | 'yes_no';

export interface QuestionCategory {
  category_id: string;
  category_label: string; // driving_skill, hukum, komunikasi, etc.
}

export interface QuestionAnswer {
  answer_id: string;
  question_id: string;
  answer_text: string;
  is_correct: boolean;
  score_value: number;
  sort_order: number;
}

export interface Question {
  question_id: string;
  question_text: string;
  question_image_url?: string | null;
  type_id: string;
  is_scored: boolean;
  // Opsional: Untuk keperluan frontend saat fetching data gabungan
  answers?: QuestionAnswer[]; 
  categories?: QuestionCategory[];
}

export interface UserTest {
  user_test_id: string;
  user_id: string;
  test_status: 'START' | 'COMPLETE';
  started_at: Date;
  completed_at?: Date;
  reset_by_admin: boolean;
  // Opsional: Hasil kalkulasi nilai
  final_score?: number;
}