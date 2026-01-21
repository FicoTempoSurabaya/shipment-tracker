import React from 'react';
import { getQuizReferenceData } from '@/app/quiz-admin-actions';
import QuestionForm from '@/components/quiz/QuestionForm';

export default async function CreateQuestionPage() {
  // Ambil data referensi (Tipe & Kategori) dari Server Action
  const { types, categories } = await getQuizReferenceData();

  return (
    <div className="max-w-6xl mx-auto">
      <QuestionForm types={types} categories={categories} />
    </div>
  );
}