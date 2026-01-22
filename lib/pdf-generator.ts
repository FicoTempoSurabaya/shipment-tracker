import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { UserStatusData } from '@/app/dashboard/quiz/admin/page';

/**
 * Fungsi untuk men-generate laporan hasil kuis dalam format PDF.
 * Menggunakan interface UserStatusData untuk memastikan Type Safety.
 */
export const generateUserResultPDF = (userData: UserStatusData): void => {
  const doc = new jsPDF();

  // --- HEADER DOKUMEN ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('LAPORAN HASIL QUIZ KOMPETENSI', 105, 20, { align: 'center' });
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('FICO TEMPO SURABAYA', 105, 27, { align: 'center' });
  
  // Garis Pemisah
  doc.setLineWidth(0.5);
  doc.line(20, 32, 190, 32);

  // --- INFORMASI PESERTA ---
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('INFORMASI PESERTA', 20, 42);
  
  doc.setFont('helvetica', 'normal');
  doc.text(`Nama Lengkap   : ${userData.nama_lengkap}`, 20, 50);
  doc.text(`Email / No.Telp : ${userData.email || userData.no_telp || '-'}`, 20, 57);
  doc.text(`Waktu Cetak    : ${new Date().toLocaleString('id-ID')}`, 20, 64);

  // --- KOTAK SKOR AKHIR ---
  doc.setDrawColor(79, 70, 229); // Indigo 600
  doc.setFillColor(249, 250, 251); // Slate 50
  doc.roundedRect(140, 42, 50, 25, 3, 3, 'FD');
  
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL SKOR', 165, 50, { align: 'center' });
  doc.setFontSize(22);
  doc.setTextColor(79, 70, 229);
  doc.text(`${userData.total_score || 0}`, 165, 62, { align: 'center' });
  
  // Reset warna teks ke hitam
  doc.setTextColor(0, 0, 0);

  // --- TABEL RINGKASAN HASIL ---
  autoTable(doc, {
    startY: 75,
    margin: { left: 20, right: 20 },
    head: [['Aspek Penilaian', 'Keterangan', 'Hasil']],
    body: [
      ['Kompetensi Dasar', 'Pemahaman operasional & prosedur', 'Tervalidasi'],
      ['Kedisiplinan', 'Kepatuhan pengisian data shipment', 'Tervalidasi'],
      ['Status Kelulusan', 'Berdasarkan standar perusahaan', (userData.total_score ?? 0) >= 70 ? 'KOMPETEN' : 'PERLU EVALUASI'],
    ],
    theme: 'grid',
    headStyles: { 
      fillColor: [79, 70, 229], // Indigo 600
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'center'
    },
    bodyStyles: {
      fontSize: 10,
      cellPadding: 5
    },
    columnStyles: {
      2: { halign: 'center', fontStyle: 'bold' }
    }
  });

  // --- FOOTER & NOMOR HALAMAN ---
  // Perbaikan: Gunakan method getNumberOfPages() langsung dari instance doc tanpa casting ke any
  const pageCount = doc.getNumberOfPages();
  
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(150);
    
    // Teks tengah
    doc.text(
      'Dokumen ini sah dihasilkan oleh Sistem Shipment Tracker Fico Tempo Surabaya secara digital.',
      105, 285, { align: 'center' }
    );
    
    // Nomor halaman di kanan
    doc.text(`Halaman ${i} dari ${pageCount}`, 190, 285, { align: 'right' });
  }

  // --- PROSES DOWNLOAD ---
  const safeFileName = userData.nama_lengkap.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  doc.save(`Hasil_Quiz_${safeFileName}.pdf`);
};