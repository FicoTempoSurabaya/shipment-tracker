import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Helper untuk format tanggal sesuai SSoT (cut off 16-15)
export function getDefaultDateRange(): { startDate: Date; endDate: Date } {
  const today = new Date()
  const currentDate = today.getDate()
  const currentMonth = today.getMonth()
  const currentYear = today.getFullYear()
  
  if (currentDate <= 15) {
    // Jika tanggal < 16, mulai dari 16 bulan sebelumnya sampai 15 bulan ini
    const startDate = new Date(currentYear, currentMonth - 1, 16, 12)
    const endDate = new Date(currentYear, currentMonth, 15,12)
    return { startDate, endDate }
  } else {
    // Jika tanggal > 15, mulai dari 16 bulan ini sampai 15 bulan depan
    const startDate = new Date(currentYear, currentMonth, 16, 12)
    const endDate = new Date(currentYear, currentMonth + 1, 15, 12)
    return { startDate, endDate }
  }
}

// Question Type utilities
export function getQuestionTypeLabel(typeId: string): string {
  const labels: Record<string, string> = {
    'MC': 'Pilihan Ganda',
    'IC': 'Pilihan Gambar',
    'LKT': 'Skala Likert',
    'TC': 'Pilihan Tabel',
    'YNC': 'Ya/Tidak',
    'multiple_choice': 'Pilihan Ganda',
    'image_choice': 'Pilihan Gambar',
    'likert': 'Skala Likert',
    'table_choice': 'Pilihan Tabel',
    'yes_no': 'Ya/Tidak'
  }
  return labels[typeId] || typeId
}

export const reverseQuestionTypeMapping: Record<string, string> = {
  'MC': 'multiple_choice',
  'IC': 'image_choice', 
  'LKT': 'likert',
  'TC': 'table_choice',
  'YNC': 'yes_no',
  'multiple_choice': 'multiple_choice',
  'image_choice': 'image_choice',
  'likert': 'likert',
  'table_choice': 'table_choice',
  'yes_no': 'yes_no'
}

export const questionTypeMapping: Record<string, string> = {
  'multiple_choice': 'MC',
  'image_choice': 'IC', 
  'likert': 'LKT',
  'table_choice': 'TC',
  'yes_no': 'YNC',
  'MC': 'MC',
  'IC': 'IC',
  'LKT': 'LKT',
  'TC': 'TC',
  'YNC': 'YNC'
}

// Format currency Indonesian Rupiah
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

// Format date Indonesian
export function formatIndonesianDate(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Format date short
export function formatDateShort(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString('id-ID')
}

// Format date with time
export function formatDateTime(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString('id-ID') + ' ' + d.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Format time
export function formatTime(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// Get initials from name
export function getInitials(name: string): string {
  if (!name) return ''
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

// Truncate text with ellipsis
export function truncateText(text: string, maxLength: number): string {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

// Validate email
export function isValidEmail(email: string): boolean {
  if (!email) return false
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Validate phone number (Indonesian format)
export function isValidPhone(phone: string): boolean {
  if (!phone) return false
  const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,9}$/
  return phoneRegex.test(phone.replace(/\s+/g, ''))
}

// Calculate age from birth date
export function calculateAge(birthDate: Date | string): number {
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  
  return age
}

// Get day name in Indonesian
export function getDayName(date: Date | string): string {
  const d = new Date(date)
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
  return days[d.getDay()]
}

// Format number with thousand separator
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('id-ID').format(num)
}

// Calculate percentage
export function calculatePercentage(part: number, total: number): number {
  if (total === 0) return 0
  return Math.round((part / total) * 100)
}

// Generate random ID
export function generateRandomId(prefix: string = ''): string {
  return `${prefix}${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Debounce function
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Deep clone object
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}

// Check if object is empty
export function isEmpty(obj: any): boolean {
  if (!obj) return true
  if (Array.isArray(obj)) return obj.length === 0
  return Object.keys(obj).length === 0
}

// Sleep function
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Get file extension
export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || ''
}

// Format file size
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}