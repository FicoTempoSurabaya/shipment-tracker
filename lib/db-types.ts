// User-defined types dari PostgreSQL - DIKOREKSI sesuai database Anda
export enum UserRole {
  ADMIN = 'admin',
  REGULAR = 'regular'
}

export enum LicenseType {
  A = 'A',
  B1 = 'B1',
  B1_UMUM = 'B1 UMUM',
  B2 = 'B2',
  B2_UMUM = 'B2 UMUM',
  C = 'C'
}

export enum VehicleType {
  R2 = 'R2',
  L300 = 'L300',
  CDE = 'CDE',
  CDD = 'CDD'
}

export enum TestStatus {
  START = 'START',
  PROCESS = 'PROCESS',
  COMPLETED = 'COMPLETE'
}

export enum QuestionType {
  IC = 'image_choice',
  LKT = 'likert',
  MC = 'multiple_choice',
  TC = 'table_choice',
  YNC = 'yes_no'
}

// Interfaces untuk tabel quiz
export interface QuestionTypeRecord {
  type_id: string
  type_name: string
}

export interface QuestionCategory {
  category_id: string
  category_label: string
  created_at?: Date
  updated_at?: Date
}

export interface QuestionList {
  question_id: string
  question_text: string
  question_image_url?: string
  type_id: string
  is_scored: boolean
  created_at?: Date
  updated_at?: Date
}

export interface QuestionAnswer {
  answer_id: string
  question_id: string
  answer_text: string
  is_correct: boolean
  score_value: number
  sort_order: number
  created_at?: Date
  updated_at?: Date
}

export interface QuestionCategoryMap {
  question_id: string
  category_id: string
  created_at?: Date
  updated_at?: Date
}

export interface UserTest {
  user_test_id: string
  user_id?: string
  nama_lengkap?: string
  test_id?: string
  test_status: TestStatus
  started_at?: Date
  completed_at?: Date
  reset_by_admin: boolean
  created_at?: Date
  updated_at?: Date
}

export interface UserAnswers {
  test_id: string
  user_id: string
  nama_lengkap?: string
  question_id: string
  answer_id?: string
  score_value?: number
  created_at?: Date
  updated_at?: Date
}

// Interface untuk User Profile
export interface UserProfile {
  user_id: string
  username: string
  password: string
  user_role_as: UserRole
  nama_lengkap: string
  tempat_lahir?: string
  tanggal_lahir: string
  alamat?: string
  no_telp?: string
  email?: string
  license_type: LicenseType
  license_id: string
  masa_berlaku: string
  jenis_unit?: VehicleType
  nopol?: string
  created_at?: string
  updated_at?: string
}

export interface PerformanceData {
  total_shipments: number
  total_hk: number
  total_hke: number
  total_hkne: number
}

// Helper functions untuk enum
export function getLicenseTypeLabel(licenseType: LicenseType): string {
  const labels: Record<LicenseType, string> = {
    [LicenseType.A]: 'A',
    [LicenseType.B1]: 'B1',
    [LicenseType.B1_UMUM]: 'B1 UMUM',
    [LicenseType.B2]: 'B2',
    [LicenseType.B2_UMUM]: 'B2 UMUM',
    [LicenseType.C]: 'C'
  }
  return labels[licenseType] || licenseType
}

export function getVehicleTypeLabel(vehicleType: VehicleType): string {
  const labels: Record<VehicleType, string> = {
    [VehicleType.R2]: 'R2 (Motor)',
    [VehicleType.L300]: 'L300',
    [VehicleType.CDE]: 'CDE',
    [VehicleType.CDD]: 'CDD'
  }
  return labels[vehicleType] || vehicleType
}

export function getQuestionTypeLabel(questionType: QuestionType): string {
  const labels: Record<QuestionType, string> = {
    [QuestionType.IC]: 'Pilihan Gambar',
    [QuestionType.LKT]: 'Skala Likert',
    [QuestionType.MC]: 'Pilihan Ganda',
    [QuestionType.TC]: 'Pilihan Tabel',
    [QuestionType.YNC]: 'Ya/Tidak'
  }
  return labels[questionType] || questionType
}