'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { submitSingleAnswer, finalizeQuiz } from '@/app/quiz-play-actions';
import { CheckCircle2, ChevronRight, Timer } from 'lucide-react'; // Hapus AlertCircle
import Image from 'next/image';

// --- DEFINISI TIPE ---
interface QuizOption {
  answer_id: string;
  answer_text: string;
}

interface QuizQuestion {
  question_id: string;
  question_text: string;
  question_image_url?: string | null;
  type_id: string;
  options: QuizOption[];
}

interface QuizPlayerProps {
  userId: string;
  testId: string;
  questions: QuizQuestion[]; // Jangan pakai any[]
}

export default function QuizPlayerClient({ userId, testId, questions }: QuizPlayerProps) {
  const router = useRouter();
  
  // State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const progressPercent = ((currentIndex + 1) / questions.length) * 100;

  const handleNext = async () => {
    if (!selectedAnswer) return;

    setIsSubmitting(true);
    try {
      const result = await submitSingleAnswer(userId, currentQuestion.question_id, selectedAnswer);
      
      if (!result.success) {
        alert('Gagal menyimpan jawaban. Periksa koneksi internet Anda.');
        setIsSubmitting(false);
        return;
      }

      if (isLastQuestion) {
        await finalizeQuiz(userId, testId);
        router.push('/dashboard/quiz/result');
      } else {
        setSelectedAnswer(null); 
        setCurrentIndex(prev => prev + 1);
      }
    } catch (error) {
      console.error(error);
      alert('Terjadi kesalahan sistem.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER: PROGRESS & INFO */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Progress</span>
          <div className="text-lg font-black text-slate-800">
            Soal {currentIndex + 1} <span className="text-slate-400 text-sm font-normal">/ {questions.length}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg font-mono font-bold">
          <Timer size={18} />
          <span>--:--</span> 
        </div>
      </div>

      {/* PROGRESS BAR VISUAL */}
      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
        <div 
          className="bg-indigo-600 h-full transition-all duration-500 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* QUESTION CARD */}
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200">
        
        {/* Gambar Soal */}
        {currentQuestion.question_image_url && (
          <div className="mb-6 rounded-xl overflow-hidden border border-slate-100 bg-slate-50">
            {/* Perbaikan Class Tailwind (md:aspect-2/1) */}
            <div className="relative aspect-video md:aspect-2/1">
              <Image 
                src={currentQuestion.question_image_url} 
                alt="Soal" 
                fill 
                className="object-contain"
              />
            </div>
          </div>
        )}

        {/* Teks Soal */}
        <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-8 leading-relaxed">
          {currentQuestion.question_text}
        </h2>

        {/* Opsi Jawaban */}
        <div className="space-y-3">
          {/* Gunakan tipe QuizOption, bukan any */}
          {currentQuestion.options.map((opt: QuizOption) => (
            <button
              key={opt.answer_id}
              onClick={() => setSelectedAnswer(opt.answer_id)}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-4 group ${
                selectedAnswer === opt.answer_id
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-900 shadow-md'
                  : 'border-slate-100 hover:border-indigo-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                selectedAnswer === opt.answer_id ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'
              }`}>
                {selectedAnswer === opt.answer_id && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
              </div>
              <span className="font-medium text-lg">{opt.answer_text}</span>
            </button>
          ))}
        </div>

      </div>

      {/* ACTION BUTTON */}
      <div className="flex justify-end pt-4">
        <button
          onClick={handleNext}
          disabled={!selectedAnswer || isSubmitting}
          // Perbaikan Class Tailwind (min-w-40)
          className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white px-8 py-4 rounded-xl font-bold text-lg flex items-center gap-2 transition-all shadow-lg shadow-indigo-200 disabled:shadow-none min-w-40 justify-center"
        >
          {isSubmitting ? (
            <span className="animate-pulse">Menyimpan...</span>
          ) : isLastQuestion ? (
            <>Selesai & Lihat Hasil <CheckCircle2 /></>
          ) : (
            <>Lanjut <ChevronRight /></>
          )}
        </button>
      </div>

    </div>
  );
}