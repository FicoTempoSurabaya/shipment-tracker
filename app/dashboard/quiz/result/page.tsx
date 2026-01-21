import React from 'react';
import { getUserSession } from '@/lib/db';
import { getQuizResultData } from '@/app/quiz-result-actions';
import { redirect } from 'next/navigation';
import QuizRadarChart from '@/components/quiz/QuizRadarChart';
import { Download, CheckCircle2, AlertTriangle, Home } from 'lucide-react';
import Link from 'next/link';

export default async function QuizResultPage() {
  const user = await getUserSession();
  if (!user) redirect('/');

  const result = await getQuizResultData(user.id);

  // Jika belum ada hasil, lempar balik ke dashboard
  if (!result) {
    redirect('/dashboard');
  }

  const isPassed = result.finalScore >= 70; // Standar kelulusan misal 70

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      
      {/* HEADER: KESIMPULAN */}
      <div className={`p-8 rounded-3xl text-center border-b-4 ${
        isPassed 
          ? 'bg-linear-to-br from-indigo-600 to-indigo-800 text-white border-indigo-900' 
          : 'bg-linear-to-br from-amber-500 to-orange-600 text-white border-orange-800'
      }`}>
        <div className="mb-4 flex justify-center">
          {isPassed ? <CheckCircle2 size={64} className="text-indigo-200" /> : <AlertTriangle size={64} className="text-orange-200" />}
        </div>
        <h1 className="text-3xl font-black mb-2">
          {isPassed ? 'KOMPETEN' : 'PERLU PERBAIKAN'}
        </h1>
        <p className="text-white/90 text-lg max-w-xl mx-auto">
          {result.summary}
        </p>
        <div className="mt-6 inline-block bg-white/20 backdrop-blur-md px-6 py-2 rounded-full border border-white/30">
          <span className="text-sm font-medium uppercase tracking-widest text-white/80 mr-2">Total Score</span>
          <span className="text-2xl font-black">{result.finalScore}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* KIRI: RADAR CHART */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <span className="w-1 h-6 bg-indigo-500 rounded-full"></span>
            Peta Kompetensi
          </h3>
          <div className="flex-1 flex items-center justify-center bg-slate-50/50 rounded-xl">
             <QuizRadarChart data={result.radarData} />
          </div>
        </div>

        {/* KANAN: DETAIL NILAI */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <span className="w-1 h-6 bg-pink-500 rounded-full"></span>
            Rincian Kategori
          </h3>
          <div className="space-y-4">
            {result.radarData.map((item) => (
              <div key={item.category} className="group">
                <div className="flex justify-between items-end mb-1">
                  <span className="text-sm font-semibold text-slate-600">{item.category}</span>
                  <span className={`font-bold ${
                    item.score >= 70 ? 'text-green-600' : 'text-amber-500'
                  }`}>
                    {item.score}/100
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${
                      item.score >= 70 ? 'bg-green-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${item.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100">
            <button 
              disabled // Fitur PDF menyusul
              className="w-full py-3 bg-slate-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-700 transition-colors opacity-50 cursor-not-allowed"
            >
              <Download size={18} />
              Unduh Laporan PDF (Soon)
            </button>
            <Link 
              href="/dashboard"
              className="w-full mt-3 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold flex items-center justify-center gap-2 hover:border-indigo-500 hover:text-indigo-600 transition-colors"
            >
              <Home size={18} />
              Kembali ke Dashboard
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}