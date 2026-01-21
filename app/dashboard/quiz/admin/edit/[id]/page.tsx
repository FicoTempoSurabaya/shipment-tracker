import React from 'react';
import { getQuizReferenceData, getQuestionDetail } from '@/app/quiz-admin-actions';
import QuestionForm from '@/components/quiz/QuestionForm';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditQuestionPage({ params }: PageProps) {
  // Await params terlebih dahulu
  const resolvedParams = await params;
  const questionId = resolvedParams.id;

  // Fetch data secara paralel agar cepat
  const [refData, questionData] = await Promise.all([
    getQuizReferenceData(),
    getQuestionDetail(questionId)
  ]);

  if (!questionData) {
    notFound();
  }

  return (
    <div className="max-w-6xl mx-auto">
      <QuestionForm 
        types={refData.types} 
        categories={refData.categories} 
        initialData={questionData} 
      />
    </div>
  );
}