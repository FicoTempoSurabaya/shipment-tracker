'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { BarChart3, Award, Clock, User, CheckCircle, XCircle } from 'lucide-react'
import RadarChart from '@/components/charts/RadarChart'

interface QuizResult {
  user_test_id: string
  test_id: string
  user_id: string
  nama_lengkap: string
  test_status: string
  started_at: string
  completed_at: string
  reset_by_admin: boolean
  answers?: Array<{
    question_id: string
    answer_id: string
    question_text: string
    answer_text: string
    is_correct: boolean
    score_value: number
  }>
  total_score: number
  jenis_unit?: string
  nopol?: string
  total_answered?: number
}

export default function QuizResultsPage() {
  const searchParams = useSearchParams()
  const userId = searchParams.get('userId')
  
  const [results, setResults] = useState<QuizResult[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedResult, setSelectedResult] = useState<QuizResult | null>(null)

  useEffect(() => {
    fetchResults()
  }, [userId])

  const fetchResults = async () => {
    try {
      setLoading(true)
      const url = userId 
        ? `/api/quiz/results?userId=${userId}`
        : '/api/quiz/results'
      
      const response = await fetch(url)
      const data = await response.json()
      
      if (response.ok) {
        setResults(data.results || [])
        if (data.results.length > 0) {
          setSelectedResult(data.results[0])
        }
      }
    } catch (error) {
      console.error('Error fetching results:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const calculatePercentage = (result: QuizResult) => {
    if (!result.answers) return 0
    const totalPossibleScore = result.answers.reduce((sum, ans) => sum + ans.score_value, 0)
    return totalPossibleScore > 0 ? Math.round((result.total_score / totalPossibleScore) * 100) : 0
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-accent-primary"></div>
        <p className="mt-2 text-text-secondary">Memuat hasil quiz...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            Hasil Quiz {userId ? `- User ID: ${userId}` : ''}
          </h1>
          <p className="text-text-secondary">
            Total {results.length} hasil quiz ditemukan
          </p>
        </div>
      </div>

      {results.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-text-secondary">Belum ada hasil quiz</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Results List */}
          <div className="lg:col-span-1 space-y-4">
            {results.map((result) => {
              const percentage = calculatePercentage(result)
              const isSelected = selectedResult?.test_id === result.test_id
              
              return (
                <div
                  key={result.test_id}
                  onClick={() => setSelectedResult(result)}
                  className={`neumorphic p-4 cursor-pointer transition-all hover:shadow-lg ${
                    isSelected ? 'ring-2 ring-accent-primary' : ''
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-semibold text-text-primary">
                        {result.nama_lengkap}
                      </h4>
                      <p className="text-sm text-text-secondary">
                        {result.user_id} • {result.jenis_unit || '-'} {result.nopol ? `(${result.nopol})` : ''}
                      </p>
                    </div>
                    <div className={`px-2 py-1 rounded text-sm ${
                      percentage >= 80 ? 'bg-green-100 text-green-800' :
                      percentage >= 60 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {percentage}%
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-text-secondary">
                    <div className="flex items-center">
                      <Clock size={14} className="mr-1" />
                      {formatDate(result.completed_at || result.started_at)}
                    </div>
                    <div>
                      {result.total_score} poin
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Selected Result Details */}
          {selectedResult && (
            <div className="lg:col-span-2 space-y-6">
              {/* Result Header */}
              <div className="neumorphic p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-text-primary mb-2">
                      {selectedResult.nama_lengkap}
                    </h2>
                    <div className="flex items-center space-x-4 text-sm text-text-secondary">
                      <div className="flex items-center">
                        <User size={16} className="mr-1" />
                        {selectedResult.user_id}
                      </div>
                      <div className="flex items-center">
                        <Clock size={16} className="mr-1" />
                        {formatDate(selectedResult.completed_at || selectedResult.started_at)}
                      </div>
                      {selectedResult.jenis_unit && (
                        <div>
                          {selectedResult.jenis_unit} {selectedResult.nopol && `(${selectedResult.nopol})`}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl font-bold text-accent-primary mb-1">
                      {calculatePercentage(selectedResult)}%
                    </div>
                    <div className="text-sm text-text-secondary">
                      {selectedResult.total_score} poin
                    </div>
                  </div>
                </div>
                
                {/* Score Breakdown */}
                {selectedResult.answers && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard
                      icon={<Award size={20} />}
                      label="Total Soal"
                      value={selectedResult.answers.length}
                      color="text-blue-600"
                    />
                    <StatCard
                      icon={<CheckCircle size={20} />}
                      label="Benar"
                      value={selectedResult.answers.filter(a => a.is_correct).length}
                      color="text-green-600"
                    />
                    <StatCard
                      icon={<XCircle size={20} />}
                      label="Salah"
                      value={selectedResult.answers.filter(a => !a.is_correct).length}
                      color="text-red-600"
                    />
                    <StatCard
                      icon={<BarChart3 size={20} />}
                      label="Rata-rata"
                      value={`${Math.round(selectedResult.total_score / selectedResult.answers.length)} poin`}
                      color="text-purple-600"
                    />
                  </div>
                )}
              </div>

              {/* Answers Review */}
              {selectedResult.answers && selectedResult.answers.length > 0 && (
                <div className="neumorphic p-6">
                  <h3 className="text-lg font-semibold text-text-primary mb-4">
                    Review Jawaban
                  </h3>
                  
                  <div className="space-y-4">
                    {selectedResult.answers.map((answer, index) => (
                      <div
                        key={answer.question_id}
                        className={`p-4 rounded-lg border ${
                          answer.is_correct
                            ? 'border-green-200 bg-green-50'
                            : 'border-red-200 bg-red-50'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center">
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 text-sm ${
                              answer.is_correct
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {index + 1}
                            </span>
                            <span className="font-medium text-text-primary">
                              {answer.question_text}
                            </span>
                          </div>
                          <span className={`px-2 py-1 rounded text-sm ${
                            answer.is_correct
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {answer.score_value} poin
                          </span>
                        </div>
                        
                        <div className="ml-8">
                          <p className="text-text-secondary">
                            <span className="font-medium">Jawaban Anda:</span>{' '}
                            <span className={answer.is_correct ? 'text-green-700' : 'text-red-700'}>
                              {answer.answer_text}
                            </span>
                          </p>
                          {!answer.is_correct && (
                            <p className="text-sm text-text-secondary mt-1">
                              <span className="font-medium">Status:</span>{' '}
                              <span className="text-red-700">Salah</span>
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Performance Chart */}
              {selectedResult.answers && (
                <div className="neumorphic p-6">
                  <h3 className="text-lg font-semibold text-text-primary mb-4">
                    Analisis Performa
                  </h3>
                  <div className="h-64">
                    <RadarChart
                      data={[
                        { name: 'Ketepatan', value: calculatePercentage(selectedResult) },
                        { name: 'Kecepatan', value: 75 },
                        { name: 'Konsistensi', value: 60 },
                        { name: 'Pengetahuan', value: 85 },
                        { name: 'Aplikasi', value: 70 }
                      ]}
                      title=""
                      height={250}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function StatCard({ icon, label, value, color }: { 
  icon: React.ReactNode
  label: string
  value: string | number
  color: string
}) {
  return (
    <div className="neumorphic-flat p-4 text-center">
      <div className={`inline-flex p-2 rounded-full mb-2 ${color}`}>
        {icon}
      </div>
      <div className="text-2xl font-bold text-text-primary mb-1">
        {value}
      </div>
      <div className="text-sm text-text-secondary">
        {label}
      </div>
    </div>
  )
}