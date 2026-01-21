'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { saveQuestion } from '@/app/quiz-admin-actions';
import { QuestionCategory } from '@/types'; // QuestionType dihapus karena tidak dipakai langsung
import { 
  Save, X, UploadCloud, Trash2, Plus, 
  CheckCircle2, GripVertical, ImageIcon 
} from 'lucide-react';
import Image from 'next/image';

// --- DEFINISI TIPE LOKAL UNTUK FORM ---
interface AnswerForm {
  answer_text: string;
  is_correct: boolean;
  score_value: number;
  sort_order: number;
}

interface QuestionFormProps {
  types: { type_id: string; type_name: string }[];
  categories: QuestionCategory[];
  // Kita buat initialData lebih spesifik daripada 'any'
  initialData?: {
    question_id: string;
    question_text: string;
    question_image_url?: string | null;
    type_id: string;
    is_scored: boolean;
    categories?: { category_id: string }[];
    answers?: AnswerForm[];
  } | null;
}

export default function QuestionForm({ types, categories, initialData }: QuestionFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // --- STATE FORM ---
  const [questionText, setQuestionText] = useState(initialData?.question_text || '');
  // Default type ambil yang pertama jika ada
  const [typeId, setTypeId] = useState<string>(initialData?.type_id || (types.length > 0 ? types[0].type_id : ''));
  
  // Pastikan imageUrl string kosong jika null/undefined
  const [imageUrl, setImageUrl] = useState<string>(initialData?.question_image_url || '');
  
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialData?.categories?.map((c) => c.category_id) || []
  );
  
  // Default 4 jawaban kosong jika buat baru
  const [answers, setAnswers] = useState<AnswerForm[]>(
    initialData?.answers || [
      { answer_text: '', is_correct: false, score_value: 0, sort_order: 1 },
      { answer_text: '', is_correct: false, score_value: 0, sort_order: 2 },
      { answer_text: '', is_correct: false, score_value: 0, sort_order: 3 },
      { answer_text: '', is_correct: false, score_value: 0, sort_order: 4 },
    ]
  );

  // --- HANDLERS ---

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    
    setIsUploading(true);
    const file = e.target.files[0];

    try {
      const response = await fetch(`/api/upload?filename=${file.name}`, {
        method: 'POST',
        body: file,
      });

      const newBlob = await response.json();
      setImageUrl(newBlob.url);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Gagal mengupload gambar. Silakan coba lagi.');
    } finally {
      setIsUploading(false);
    }
  };

  const updateAnswer = (index: number, field: keyof AnswerForm, value: string | number | boolean) => {
    const newAnswers = [...answers];
    // Kita gunakan casting 'any' di sini sebentar karena TypeScript kadang bingung dengan dynamic key assign
    // Tapi secara logika aman karena kita sudah batasi tipe AnswerForm
    (newAnswers[index] as unknown as Record<string, string | number | boolean>)[field] = value;
    setAnswers(newAnswers);
  };

  const addAnswer = () => {
    setAnswers([
      ...answers, 
      { answer_text: '', is_correct: false, score_value: 0, sort_order: answers.length + 1 }
    ]);
  };

  const removeAnswer = (index: number) => {
    const newAnswers = answers.filter((_, i) => i !== index);
    setAnswers(newAnswers);
  };

  const toggleCategory = (catId: string) => {
    if (selectedCategories.includes(catId)) {
      setSelectedCategories(selectedCategories.filter(id => id !== catId));
    } else {
      setSelectedCategories([...selectedCategories, catId]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // PERBAIKAN: Pastikan image url dikirim sebagai undefined jika kosong, bukan null
      // Dan konversi tipe data sesuai yang diminta 'saveQuestion'
      const payload = {
        question_id: initialData?.question_id, 
        question_text: questionText,
        // Logika: Jika string kosong -> undefined. Jika ada -> string.
        question_image_url: imageUrl ? imageUrl : undefined, 
        type_id: typeId,
        is_scored: true,
        category_ids: selectedCategories,
        answers: answers.map((a, idx) => ({
          ...a,
          sort_order: idx + 1
        }))
      };

      const result = await saveQuestion(payload);

      if (result.success) {
        router.push('/dashboard/quiz/admin');
      } else {
        alert('Gagal menyimpan: ' + result.message);
      }
    } catch (error) {
      console.error(error);
      alert('Terjadi kesalahan sistem.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl mx-auto pb-20">
      
      {/* HEADER & ACTIONS */}
      <div className="flex items-center justify-between sticky top-0 bg-slate-50/80 backdrop-blur-sm p-4 z-10 -mx-4 rounded-xl border-b border-slate-200">
        <h2 className="text-xl font-bold text-slate-800">
          {initialData ? 'Edit Soal' : 'Buat Soal Baru'}
        </h2>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg font-medium transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isSubmitting || isUploading}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold flex items-center gap-2 transition-all disabled:opacity-50"
          >
            {isSubmitting ? 'Menyimpan...' : (
              <>
                <Save size={18} /> Simpan Soal
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* KOLOM KIRI: KONFIGURASI SOAL */}
        <div className="space-y-6 lg:col-span-2">
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <label className="block text-sm font-bold text-slate-700 mb-2">Narasi Pertanyaan</label>
            <textarea
              required
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              rows={4}
              className="w-full p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-800 text-lg"
              placeholder="Tulis pertanyaan lengkap di sini..."
            />
          </div>

          {/* UPLOAD GAMBAR */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <label className="block text-sm font-bold text-slate-700 mb-4">Gambar Pendukung (Opsional)</label>
            
            <input 
              type="file" 
              ref={fileInputRef}
              className="hidden" 
              accept="image/*"
              onChange={handleFileUpload}
            />

            {!imageUrl ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-all group"
              >
                <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  {isUploading ? <span className="animate-spin">⏳</span> : <UploadCloud size={24} />}
                </div>
                <p className="text-slate-600 font-medium">Klik untuk upload gambar soal</p>
                <p className="text-xs text-slate-400 mt-1">Format: JPG, PNG (Max 4MB)</p>
              </div>
            ) : (
              <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                <div className="aspect-video relative">
                  <Image 
                    src={imageUrl} 
                    alt="Preview Soal" 
                    fill 
                    className="object-contain"
                  />
                </div>
                <div className="absolute top-2 right-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 bg-white/90 text-slate-700 rounded-lg hover:text-indigo-600 shadow-sm"
                    title="Ganti Gambar"
                  >
                    <ImageIcon size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageUrl('')}
                    className="p-2 bg-white/90 text-red-600 rounded-lg hover:bg-red-50 shadow-sm"
                    title="Hapus Gambar"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* INPUT JAWABAN */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-bold text-slate-700">Opsi Jawaban</label>
              <button 
                type="button"
                onClick={addAnswer}
                className="text-indigo-600 text-sm font-bold hover:underline flex items-center gap-1"
              >
                <Plus size={16} /> Tambah Opsi
              </button>
            </div>

            <div className="space-y-3">
              {answers.map((ans, idx) => (
                <div key={idx} className="flex gap-3 items-start group">
                  <div className="mt-3 text-slate-300 cursor-move">
                    <GripVertical size={20} />
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => {
                        const reset = answers.map(a => ({ ...a, is_correct: false }));
                        reset[idx].is_correct = true;
                        if (reset[idx].score_value === 0) reset[idx].score_value = 5; 
                        setAnswers(reset);
                    }}
                    // Perbaikan class Tailwind (min-w-10 h-10)
                    className={`mt-1 min-w-10 h-10 rounded-lg flex items-center justify-center border-2 transition-all ${
                      ans.is_correct 
                        ? 'border-green-500 bg-green-50 text-green-600' 
                        : 'border-slate-200 text-slate-300 hover:border-slate-300'
                    }`}
                    title={ans.is_correct ? 'Jawaban Benar' : 'Tandai sebagai Benar'}
                  >
                    <CheckCircle2 size={20} />
                  </button>

                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      required
                      value={ans.answer_text}
                      onChange={(e) => updateAnswer(idx, 'answer_text', e.target.value)}
                      placeholder={`Opsi Jawaban ${String.fromCharCode(65 + idx)}`}
                      className={`w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800 ${
                        ans.is_correct ? 'border-green-500 bg-green-50/30' : 'border-slate-300'
                      }`}
                    />
                    <div className="flex items-center gap-4 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500">Poin:</span>
                        <input
                          type="number"
                          value={ans.score_value}
                          onChange={(e) => updateAnswer(idx, 'score_value', parseInt(e.target.value) || 0)}
                          className="w-16 p-1 border border-slate-300 rounded text-center text-slate-800"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeAnswer(idx)}
                    className="mt-2 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* KOLOM KANAN: SETTINGS */}
        <div className="space-y-6">
            
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
            <label className="block text-sm font-bold text-slate-700 mb-3">Tipe Pertanyaan</label>
            <select
              value={typeId}
              onChange={(e) => setTypeId(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-800"
            >
              {types.map(t => (
                <option key={t.type_id} value={t.type_id}>{t.type_name}</option>
              ))}
            </select>
          </div>

          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
            <label className="block text-sm font-bold text-slate-700 mb-3">
              Kategori Penilaian
              <span className="block text-xs font-normal text-slate-500 mt-1">
                Pilih aspek apa saja yang dinilai dari soal ini.
              </span>
            </label>
            
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
              {categories.map(cat => (
                <label 
                  key={cat.category_id}
                  className={`flex items-center p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedCategories.includes(cat.category_id)
                      ? 'bg-indigo-50 border-indigo-200'
                      : 'border-slate-100 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(cat.category_id)}
                    onChange={() => toggleCategory(cat.category_id)}
                    className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                  />
                  <div className="ml-3">
                    <span className={`block text-sm font-semibold ${
                      selectedCategories.includes(cat.category_id) ? 'text-indigo-700' : 'text-slate-600'
                    }`}>
                      {cat.category_label.toUpperCase()}
                    </span>
                    <span className="text-[10px] text-slate-400">{cat.category_id}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

        </div>
      </div>
    </form>
  );
}