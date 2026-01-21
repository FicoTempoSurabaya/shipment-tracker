'use client';

import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { RadarDataPoint } from '@/app/quiz-result-actions';
// Import tipe data yang diperlukan
import { ValueType } from 'recharts/types/component/DefaultTooltipContent';

export default function QuizRadarChart({ data }: { data: RadarDataPoint[] }) {
  if (!data || data.length === 0) {
    return <div className="text-center text-slate-400 py-10">Data tidak cukup untuk menampilkan grafik.</div>;
  }

  // PERBAIKAN:
  // 1. Parameter 'value' bisa undefined, jadi kita tambahkan tipe '| undefined'.
  // 2. Kita hapus parameter '_name' dan '_props' agar ESLint tidak marah (unused vars).
  const tooltipFormatter = (value: ValueType | undefined) => {
    if (typeof value === 'number') {
      return [`${value}/100`, 'Skor'];
    }
    return [value, 'Skor'];
  };

  return (
    <div className="w-full h-75 md:h-100">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="#e2e8f0" />
          <PolarAngleAxis 
            dataKey="category" 
            tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} 
          />
          <PolarRadiusAxis 
            angle={30} 
            domain={[0, 100]} 
            tick={false} 
            axisLine={false} 
          />
          <Radar
            name="Kompetensi"
            dataKey="score"
            stroke="#4f46e5"
            strokeWidth={3}
            fill="#6366f1"
            fillOpacity={0.4}
          />
          {/* Gunakan 'as any' untuk menghindari konflik tipe internal Recharts yang rumit */}
          <Tooltip 
            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            itemStyle={{ color: '#4338ca', fontWeight: 'bold' }}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={tooltipFormatter as any}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}