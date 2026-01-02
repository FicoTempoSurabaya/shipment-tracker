'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Search, Filter, Download, Upload } from 'lucide-react'
import InputQuizModal from '@/components/modals/InputQuizModal'
import EditQuizModal from '@/components/modals/EditQuizModal'
import ConfirmationModal from '@/components/modals/ConfirmationModal'
import SuccessModal from '@/components/modals/SuccessModal'

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
    is_correct: boolean
    score_value: number
    sort_order: number
  }>
  categories: Array<{
    category_id: string
    category_label: string
  }>
}

export default function QuizEditorPage() {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterScored, setFilterScored] = useState('all')
  
  // Modal states
  const [showInputModal, setShowInputModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null)
  const [questionTypes, setQuestionTypes] = useState<Array<{type_id: string, type_name: string}>>([])

  useEffect(() => {
    fetchQuestions()
    fetchQuestionTypes()
  }, [])

  const fetchQuestions = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/quiz')
      const data = await response.json()
      
      if (response.ok) {
        setQuestions(data.questions)
      }
    } catch (error) {
      console.error('Error fetching questions:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchQuestionTypes = async () => {
    try {
      const response = await fetch('/api/quiz/types')
      const data = await response.json()
      
      if (response.ok) {
        setQuestionTypes(data.types)
      }
    } catch (error) {
      console.error('Error fetching question types:', error)
    }
  }

  const handleEditClick = (question: Question) => {
    setSelectedQuestion(question)
    setShowEditModal(true)
  }

  const handleDeleteClick = (question: Question) => {
    setSelectedQuestion(question)
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedQuestion) return

    try {
      const response = await fetch(`/api/quiz/${selectedQuestion.question_id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setShowDeleteModal(false)
        setShowSuccessModal(true)
        fetchQuestions()
      } else {
        alert('Gagal menghapus soal')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Terjadi kesalahan')
    }
  }

  const handleQuestionUpdate = () => {
    fetchQuestions()
    setShowSuccessModal(true)
  }

  const filteredQuestions = questions.filter(question => {
    // Search filter
    if (searchTerm && !question.question_text.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }
    
    // Type filter
    if (filterType !== 'all' && question.type_id !== filterType) {
      return false
    }
    
    // Scored filter
    if (filterScored === 'scored' && !question.is_scored) {
      return false
    }
    if (filterScored === 'not_scored' && question.is_scored) {
      return false
    }
    
    return true
  })

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Quiz Editor</h1>
          <p className="text-text-secondary">Kelola soal-soal quiz untuk driver</p>
        </div>
        <button
          onClick={() => setShowInputModal(true)}
          className="flex items-center px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-blue-600"
        >
          <Plus size={20} className="mr-2" />
          Tambah Soal
        </button>
      </div>

      {/* Filters */}
      <div className="neumorphic p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" size={20} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari soal..."
                className="w-full pl-10 pr-4 py-2 border border-azure-shadow-dark rounded-lg focus:outline-none focus:border-accent-primary"
              />
            </div>
          </div>
          
          {/* Type Filter */}
          <div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-4 py-2 border border-azure-shadow-dark rounded-lg focus:outline-none focus:border-accent-primary"
            >
              <option value="all">Semua Tipe</option>
              {questionTypes.map(type => (
                <option key={type.type_id} value={type.type_id}>
                  {type.type_name}
                </option>
              ))}
            </select>
          </div>
          
          {/* Scored Filter */}
          <div>
            <select
              value={filterScored}
              onChange={(e) => setFilterScored(e.target.value)}
              className="w-full px-4 py-2 border border-azure-shadow-dark rounded-lg focus:outline-none focus:border-accent-primary"
            >
              <option value="all">Semua Status</option>
              <option value="scored">Dengan Nilai</option>
              <option value="not_scored">Tanpa Nilai</option>
            </select>
          </div>
        </div>
        
        {/* Filter Stats */}
        <div className="mt-4 flex items-center justify-between text-sm text-text-secondary">
          <div>
            <Filter size={16} className="inline mr-1" />
            Menampilkan {filteredQuestions.length} dari {questions.length} soal
          </div>
          <div className="flex space-x-2">
            <button className="flex items-center text-accent-primary hover:text-blue-600">
              <Download size={16} className="mr-1" />
              Export
            </button>
            <button className="flex items-center text-accent-secondary hover:text-cyan-600">
              <Upload size={16} className="mr-1" />
              Import
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-accent-primary"></div>
          <p className="mt-2 text-text-secondary">Memuat soal...</p>
        </div>
      ) : filteredQuestions.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-text-secondary">Tidak ada soal yang ditemukan</p>
          <button
            onClick={() => setShowInputModal(true)}
            className="mt-4 px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-blue-600"
          >
            Tambah Soal Pertama
          </button>
        </div>
      ) : (
        /* Questions List */
        <div className="space-y-4">
          {filteredQuestions.map((question) => (
            <QuestionCard
              key={question.question_id}
              question={question}
              onEdit={() => handleEditClick(question)}
              onDelete={() => handleDeleteClick(question)}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <InputQuizModal
        isOpen={showInputModal}
        onClose={() => setShowInputModal(false)}
        onSuccess={handleQuestionUpdate}
      />

      <EditQuizModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSuccess={handleQuestionUpdate}
        question={selectedQuestion}
      />

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        title="Hapus Soal"
        message={`Apakah Anda yakin ingin menghapus soal ini?`}
      />

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Berhasil!"
        message="Operasi berhasil disimpan."
      />
    </div>
  )
}

function QuestionCard({ 
  question, 
  onEdit, 
  onDelete 
}: { 
  question: Question
  onEdit: () => void
  onDelete: () => void
}) {
  const correctAnswer = question.answers.find(answer => answer.is_correct)
  
  return (
    <div className="neumorphic p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="font-semibold text-text-primary">
              {question.question_text.length > 100 
                ? `${question.question_text.substring(0, 100)}...` 
                : question.question_text}
            </h3>
            <span className={`px-2 py-1 rounded text-xs ${
              question.is_scored 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {question.is_scored ? 'Dengan Nilai' : 'Tanpa Nilai'}
            </span>
            <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
              {question.type_name}
            </span>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-3">
            {question.categories.map(category => (
              <span 
                key={category.category_id}
                className="px-2 py-1 rounded text-xs bg-purple-100 text-purple-800"
              >
                {category.category_label}
              </span>
            ))}
          </div>
          
          <div className="space-y-2">
            <p className="text-sm text-text-secondary">
              <span className="font-medium">Jawaban:</span>{' '}
              {question.answers.map((answer, idx) => (
                <span key={answer.answer_id} className={`mr-2 ${answer.is_correct ? 'text-green-600 font-semibold' : ''}`}>
                  {String.fromCharCode(65 + idx)}. {answer.answer_text}
                  {answer.is_correct && ` (${answer.score_value} poin)`}
                </span>
              ))}
            </p>
          </div>
        </div>
        
        <div className="flex space-x-2 ml-4">
          <button
            onClick={onEdit}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
            title="Edit"
          >
            <Edit size={18} />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
            title="Hapus"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
      
      <div className="flex justify-between items-center text-sm text-text-secondary pt-4 border-t border-azure-shadow-dark/30">
        <div>
          <span className="font-medium">Jumlah jawaban:</span> {question.answers.length}
          {correctAnswer && (
            <span className="ml-3">
              <span className="font-medium">Jawaban benar:</span>{' '}
              <span className="text-green-600">
                {String.fromCharCode(65 + question.answers.indexOf(correctAnswer))}
              </span>
            </span>
          )}
        </div>
        <div>
          Total poin: {question.answers.reduce((sum, ans) => sum + ans.score_value, 0)}
        </div>
      </div>
    </div>
  )
}