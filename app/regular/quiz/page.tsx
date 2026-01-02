'use client'

import { useState, useEffect } from 'react'
import { Clock, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import SuccessModal from '@/components/modals/SuccessModal'
import WarningModal from '@/components/modals/WarningModal'

interface Question {
  question_id: string
  question_text: string
  type_id: string
  type_name: string
  is_scored: boolean
  question_image_url?: string
  answers: Array<{
    answer_id: string
    answer_text: string
    sort_order: number
  }>
  user_answer_id?: string
}

export default function RegularQuizPage() {
  const router = useRouter()
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [timeLeft, setTimeLeft] = useState(1800) // 30 minutes in seconds
  const [testId, setTestId] = useState<string>('')
  const [startedAt, setStartedAt] = useState<string>('')
  
  // Modal states
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showWarningModal, setShowWarningModal] = useState(false)

  useEffect(() => {
    fetchQuiz()
    
    // Timer
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          handleTimeUp()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    // Auto-save answers every 30 seconds
    const autoSaveTimer = setInterval(() => {
      if (Object.keys(answers).length > 0 && testId) {
        saveAnswers(false)
      }
    }, 30000)
    
    return () => clearInterval(autoSaveTimer)
  }, [answers, testId])

  const fetchQuiz = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/quiz')
      const data = await response.json()
      
      if (response.ok) {
        setQuestions(data.questions || [])
        setTestId(data.test_id)
        setStartedAt(data.started_at)
        
        // Initialize answers from existing data
        const initialAnswers: Record<string, string> = {}
        data.questions?.forEach((q: Question) => {
          if (q.user_answer_id) {
            initialAnswers[q.question_id] = q.user_answer_id
          }
        })
        setAnswers(initialAnswers)
      }
    } catch (error) {
      console.error('Error fetching quiz:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAnswerSelect = (questionId: string, answerId: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answerId
    }))
  }

  const saveAnswers = async (showAlert = true) => {
    if (!testId || Object.keys(answers).length === 0) return
    
    try {
      const answerArray = Object.entries(answers).map(([question_id, answer_id]) => ({
        question_id,
        answer_id
      }))
      
      const response = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          test_id: testId,
          answers: answerArray
        })
      })
      
      if (response.ok && showAlert) {
        setShowSuccessModal(true)
      }
    } catch (error) {
      console.error('Error saving answers:', error)
      if (showAlert) {
        alert('Gagal menyimpan jawaban')
      }
    }
  }

  const handleSubmitQuiz = async () => {
    setSubmitting(true)
    
    try {
      // Save final answers
      await saveAnswers(false)
      
      // Submit for scoring
      const response = await fetch('/api/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test_id: testId })
      })
      
      if (response.ok) {
        const result = await response.json()
        router.push(`/regular/quiz/result?score=${result.score.percentage}`)
      } else {
        alert('Gagal mengirim jawaban')
      }
    } catch (error) {
      console.error('Error submitting quiz:', error)
      alert('Terjadi kesalahan')
    } finally {
      setSubmitting(false)
      setShowSubmitModal(false)
    }
  }

  const handleTimeUp = () => {
    setShowWarningModal(true)
    setTimeout(() => {
      handleSubmitQuiz()
    }, 5000)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const currentQuestion = questions[currentQuestionIndex]
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0
  const answeredCount = Object.keys(answers).length

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-accent-primary"></div>
        <p className="mt-2 text-text-secondary">Menyiapkan quiz...</p>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
        <h2 className="text-xl font-semibold text-text-primary mb-2">
          Tidak ada quiz tersedia
        </h2>
        <p className="text-text-secondary mb-4">
          Silakan hubungi admin untuk mengaktifkan quiz.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Quiz Header */}
      <div className="neumorphic p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text-primary mb-2">
              Quiz Pengetahuan Driver
            </h1>
            <p className="text-text-secondary">
              Test ID: {testId}
            </p>
          </div>
          
          <div className="flex flex-col items-end">
            <div className="flex items-center text-lg font-semibold text-text-primary mb-2">
              <Clock className="mr-2" size={20} />
              {formatTime(timeLeft)}
            </div>
            <div className="text-sm text-text-secondary">
              Dimulai: {new Date(startedAt).toLocaleTimeString('id-ID')}
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-6">
          <div className="flex justify-between text-sm text-text-primary mb-2">
            <span>Soal {currentQuestionIndex + 1} dari {questions.length}</span>
            <span>{answeredCount} terjawab</span>
          </div>
          <div className="w-full bg-azure-bg rounded-full h-2">
            <div 
              className="bg-accent-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Question Navigation */}
        <div className="lg:col-span-1">
          <div className="neumorphic p-6 sticky top-6">
            <h3 className="font-semibold text-text-primary mb-4">
              Navigasi Soal
            </h3>
            <div className="grid grid-cols-5 gap-2">
              {questions.map((_, index) => {
                const isAnswered = answers[questions[index].question_id]
                const isCurrent = index === currentQuestionIndex
                
                return (
                  <button
                    key={index}
                    onClick={() => setCurrentQuestionIndex(index)}
                    className={`
                      aspect-square rounded-lg flex items-center justify-center text-sm
                      ${isCurrent 
                        ? 'bg-accent-primary text-white' 
                        : isAnswered
                          ? 'bg-green-100 text-green-800'
                          : 'bg-azure-bg text-text-primary hover:bg-azure-shadow-dark'
                      }
                    `}
                  >
                    {index + 1}
                  </button>
                )
              })}
            </div>
            
            <div className="mt-6 pt-6 border-t border-azure-shadow-dark/30">
              <div className="flex items-center mb-2">
                <div className="w-3 h-3 rounded-full bg-green-100 mr-2"></div>
                <span className="text-sm text-text-secondary">Terjawab</span>
              </div>
              <div className="flex items-center mb-4">
                <div className="w-3 h-3 rounded-full bg-azure-bg mr-2 border border-azure-shadow-dark"></div>
                <span className="text-sm text-text-secondary">Belum dijawab</span>
              </div>
              
              <button
                onClick={() => setShowSubmitModal(true)}
                className="w-full py-3 bg-accent-primary text-white rounded-lg hover:bg-blue-600 flex items-center justify-center"
              >
                <CheckCircle className="mr-2" size={20} />
                Selesai & Kirim
              </button>
              
              <button
                onClick={() => saveAnswers(true)}
                className="w-full py-2 mt-2 border border-azure-shadow-dark text-text-primary rounded-lg hover:bg-azure-bg"
              >
                Simpan Jawaban
              </button>
            </div>
          </div>
        </div>

        {/* Question Content */}
        <div className="lg:col-span-2">
          <div className="neumorphic p-6">
            {/* Question Header */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="flex items-center mb-2">
                  <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
                    Soal {currentQuestionIndex + 1}
                  </span>
                  <span className="ml-2 px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-sm">
                    {currentQuestion.type_name}
                  </span>
                </div>
                <h2 className="text-xl font-semibold text-text-primary">
                  {currentQuestion.question_text}
                </h2>
              </div>
              
              {currentQuestion.question_image_url && (
                <div className="text-sm text-text-secondary">
                  <span className="font-medium">Ada gambar</span>
                </div>
              )}
            </div>
            
            {/* Image (if any) */}
            {currentQuestion.question_image_url && (
              <div className="mb-6">
                <div className="bg-azure-bg rounded-lg p-4 flex justify-center">
                  <img 
                    src={currentQuestion.question_image_url} 
                    alt="Question illustration"
                    className="max-h-64 rounded"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none'
                    }}
                  />
                </div>
              </div>
            )}
            
            {/* Answer Options */}
            <div className="space-y-3">
              {currentQuestion.answers.map((answer, index) => {
                const letter = String.fromCharCode(65 + index)
                const isSelected = answers[currentQuestion.question_id] === answer.answer_id
                
                return (
                  <div
                    key={answer.answer_id}
                    className={`
                      p-4 rounded-lg border-2 cursor-pointer transition-all
                      ${isSelected
                        ? 'border-accent-primary bg-blue-50'
                        : 'border-azure-shadow-dark hover:border-accent-primary/50'
                      }
                    `}
                    onClick={() => handleAnswerSelect(currentQuestion.question_id, answer.answer_id)}
                  >
                    <div className="flex items-center">
                      <div className={`
                        w-8 h-8 rounded-full flex items-center justify-center mr-3
                        ${isSelected
                          ? 'bg-accent-primary text-white'
                          : 'bg-azure-bg text-text-primary'
                        }
                      `}>
                        {letter}
                      </div>
                      <span className="text-text-primary">{answer.answer_text}</span>
                    </div>
                  </div>
                )
              })}
            </div>
            
            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-azure-shadow-dark/30">
              <button
                onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                disabled={currentQuestionIndex === 0}
                className="px-4 py-2 border border-azure-shadow-dark text-text-primary rounded-lg hover:bg-azure-bg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Sebelumnya
              </button>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => saveAnswers(true)}
                  className="px-4 py-2 border border-azure-shadow-dark text-text-primary rounded-lg hover:bg-azure-bg"
                >
                  Simpan
                </button>
                
                <button
                  onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
                  disabled={currentQuestionIndex === questions.length - 1}
                  className="px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {currentQuestionIndex === questions.length - 1 ? 'Selesai' : 'Selanjutnya →'}
                </button>
              </div>
            </div>
          </div>
          
          {/* Quiz Instructions */}
          <div className="mt-6 p-4 bg-azure-bg rounded-lg text-sm text-text-secondary">
            <h4 className="font-semibold text-text-primary mb-2">Petunjuk Quiz:</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>Quiz akan otomatis tersimpan setiap 30 detik</li>
              <li>Waktu pengerjaan: 30 menit</li>
              <li>Jawaban akan otomatis dikirim saat waktu habis</li>
              <li>Pastikan koneksi internet stabil selama mengerjakan</li>
              <li>Hasil quiz dapat dilihat di halaman profil</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Modals */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Jawaban Tersimpan"
        message="Jawaban Anda telah berhasil disimpan."
      />

      <WarningModal
        isOpen={showWarningModal}
        onClose={() => setShowWarningModal(false)}
        title="Waktu Habis!"
        message="Quiz akan otomatis dikirim dalam 5 detik..."
        buttonText="OK"
      />

      {/* Submit Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="neumorphic w-full max-w-md rounded-2xl p-6">
            <div className="text-center mb-6">
              <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
              <h3 className="text-xl font-semibold text-text-primary mb-2">
                Kirim Jawaban?
              </h3>
              <p className="text-text-secondary">
                Anda telah menjawab {answeredCount} dari {questions.length} soal.
                Pastikan semua jawaban sudah benar sebelum mengirim.
              </p>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowSubmitModal(false)}
                disabled={submitting}
                className="flex-1 px-4 py-2 border border-azure-shadow-dark text-text-primary rounded-lg hover:bg-azure-bg"
              >
                Kembali
              </button>
              <button
                onClick={handleSubmitQuiz}
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center"
              >
                {submitting ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={20} />
                    Mengirim...
                  </>
                ) : (
                  'Kirim Sekarang'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}