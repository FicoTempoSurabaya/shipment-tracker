'use client'

import { useState, useEffect } from 'react'
import { Plus, X, Loader2, Image as ImageIcon } from 'lucide-react'
import Modal from '@/components/ui/Modal'

interface InputQuizModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

interface QuestionType {
  type_id: string
  type_name: string
}

interface Category {
  category_id: string
  category_label: string
}

export default function InputQuizModal({
  isOpen,
  onClose,
  onSuccess
}: InputQuizModalProps) {
  const [loading, setLoading] = useState(false)
  const [types, setTypes] = useState<QuestionType[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [newCategory, setNewCategory] = useState('')
  
  const [formData, setFormData] = useState({
    question_text: '',
    type_id: 'multiple_choice',
    is_scored: true,
    question_image_url: '',
    answers: [
      { answer_text: '', is_correct: true, score_value: 10 },
      { answer_text: '', is_correct: false, score_value: 0 },
      { answer_text: '', is_correct: false, score_value: 0 },
      { answer_text: '', is_correct: false, score_value: 0 }
    ],
    selectedCategories: [] as string[]
  })

  useEffect(() => {
    if (isOpen) {
      fetchTypesAndCategories()
    }
  }, [isOpen])

  const fetchTypesAndCategories = async () => {
    try {
      const [typesRes, categoriesRes] = await Promise.all([
        fetch('/api/quiz/types'),
        fetch('/api/quiz/categories')
      ])
      
      const typesData = await typesRes.json()
      const categoriesData = await categoriesRes.json()
      
      if (typesRes.ok) {
        // Helper functions untuk mapping
        const getQuestionTypeLabel = (typeId: string): string => {
          const labels: Record<string, string> = {
            'MC': 'Pilihan Ganda',
            'IC': 'Pilihan Gambar',
            'LKT': 'Skala Likert',
            'TC': 'Pilihan Tabel',
            'YNC': 'Ya/Tidak'
          }
          return labels[typeId] || typeId
        }

        const reverseQuestionTypeMapping: Record<string, string> = {
          'MC': 'multiple_choice',
          'IC': 'image_choice', 
          'LKT': 'likert',
          'TC': 'table_choice',
          'YNC': 'yes_no'
        }
        
        // Map database types ke frontend types
        const mappedTypes = typesData.types.map((type: any) => ({
          ...type,
          type_id: reverseQuestionTypeMapping[type.type_id] || type.type_id,
          type_name: getQuestionTypeLabel(type.type_id) || type.type_name
        }))
        setTypes(mappedTypes)
      }
      if (categoriesRes.ok) {
        setCategories(categoriesData.categories)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return
    
    try {
      const response = await fetch('/api/quiz/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category_label: newCategory.trim() })
      })
      
      if (response.ok) {
        const data = await response.json()
        setCategories([...categories, data.category])
        setNewCategory('')
      }
    } catch (error) {
      console.error('Error adding category:', error)
    }
  }

  const handleAddAnswer = () => {
    setFormData({
      ...formData,
      answers: [...formData.answers, { answer_text: '', is_correct: false, score_value: 0 }]
    })
  }

  const handleRemoveAnswer = (index: number) => {
    if (formData.answers.length <= 2) return
    
    const newAnswers = [...formData.answers]
    newAnswers.splice(index, 1)
    setFormData({ ...formData, answers: newAnswers })
  }

  const handleAnswerChange = (index: number, field: string, value: any) => {
    const newAnswers = [...formData.answers]
    
    if (field === 'is_correct' && value === true) {
      // Uncheck all other answers
      newAnswers.forEach((answer, i) => {
        if (i !== index) answer.is_correct = false
      })
    }
    
    newAnswers[index] = { ...newAnswers[index], [field]: value }
    setFormData({ ...formData, answers: newAnswers })
  }

  const handleCategoryToggle = (categoryId: string) => {
    const newCategories = formData.selectedCategories.includes(categoryId)
      ? formData.selectedCategories.filter(id => id !== categoryId)
      : [...formData.selectedCategories, categoryId]
    
    setFormData({ ...formData, selectedCategories: newCategories })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          categories: formData.selectedCategories.map(category_id => ({ category_id }))
        })
      })

      if (response.ok) {
        onSuccess()
        onClose()
        resetForm()
      } else {
        const error = await response.json()
        alert(error.error || 'Gagal menyimpan soal')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      question_text: '',
      type_id: 'multiple_choice',
      is_scored: true,
      question_image_url: '',
      answers: [
        { answer_text: '', is_correct: true, score_value: 10 },
        { answer_text: '', is_correct: false, score_value: 0 },
        { answer_text: '', is_correct: false, score_value: 0 },
        { answer_text: '', is_correct: false, score_value: 0 }
      ],
      selectedCategories: []
    })
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Tambah Soal Quiz Baru"
      size="xl"
    >
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Question Text */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Pertanyaan *
            </label>
            <textarea
              value={formData.question_text}
              onChange={(e) => setFormData({...formData, question_text: e.target.value})}
              required
              rows={3}
              className="w-full px-4 py-2 border border-azure-shadow-dark rounded-lg focus:outline-none focus:border-accent-primary"
              placeholder="Masukkan pertanyaan..."
            />
          </div>

          {/* Question Type & Scoring */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Tipe Pertanyaan *
              </label>
              <select
                value={formData.type_id}
                onChange={(e) => setFormData({...formData, type_id: e.target.value})}
                required
                className="w-full px-4 py-2 border border-azure-shadow-dark rounded-lg focus:outline-none focus:border-accent-primary"
              >
                {types.map(type => (
                  <option key={type.type_id} value={type.type_id}>
                    {type.type_name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-end">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_scored}
                  onChange={(e) => setFormData({...formData, is_scored: e.target.checked})}
                  className="mr-2 h-4 w-4 text-accent-primary rounded focus:ring-accent-primary"
                />
                <span className="text-sm text-text-primary">Termasuk Penilaian</span>
              </label>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                URL Gambar (Opsional)
              </label>
              <div className="flex">
                <div className="relative flex-1">
                  <ImageIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" size={18} />
                  <input
                    type="text"
                    value={formData.question_image_url}
                    onChange={(e) => setFormData({...formData, question_image_url: e.target.value})}
                    className="w-full pl-10 pr-4 py-2 border border-azure-shadow-dark rounded-lg focus:outline-none focus:border-accent-primary"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Categories */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Kategori
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {categories.map(category => (
                <button
                  key={category.category_id}
                  type="button"
                  onClick={() => handleCategoryToggle(category.category_id)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    formData.selectedCategories.includes(category.category_id)
                      ? 'bg-accent-primary text-white'
                      : 'bg-azure-bg text-text-primary hover:bg-azure-shadow-dark'
                  }`}
                >
                  {category.category_label}
                </button>
              ))}
            </div>
            <div className="flex">
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="flex-1 px-4 py-2 border border-azure-shadow-dark rounded-l-lg focus:outline-none focus:border-accent-primary"
                placeholder="Tambah kategori baru"
              />
              <button
                type="button"
                onClick={handleAddCategory}
                className="px-4 py-2 bg-accent-secondary text-white rounded-r-lg hover:bg-cyan-600"
              >
                Tambah
              </button>
            </div>
          </div>

          {/* Answers Section */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold text-text-primary">
                Jawaban *
              </h4>
              <button
                type="button"
                onClick={handleAddAnswer}
                className="flex items-center text-sm text-accent-primary hover:text-blue-600"
              >
                <Plus size={16} className="mr-1" />
                Tambah Jawaban
              </button>
            </div>
            
            <div className="space-y-3">
              {formData.answers.map((answer, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-azure-bg rounded-lg">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={answer.answer_text}
                      onChange={(e) => handleAnswerChange(index, 'answer_text', e.target.value)}
                      required
                      className="w-full px-4 py-2 border border-azure-shadow-dark rounded-lg focus:outline-none focus:border-accent-primary"
                      placeholder={`Jawaban ${index + 1}`}
                    />
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={answer.is_correct}
                        onChange={(e) => handleAnswerChange(index, 'is_correct', e.target.checked)}
                        className="mr-1 h-4 w-4 text-green-600 rounded focus:ring-green-600"
                      />
                      <span className="text-sm text-text-primary">Benar</span>
                    </label>
                    
                    <input
                      type="number"
                      value={answer.score_value}
                      onChange={(e) => handleAnswerChange(index, 'score_value', parseInt(e.target.value) || 0)}
                      className="w-20 px-3 py-1 border border-azure-shadow-dark rounded-lg focus:outline-none focus:border-accent-primary"
                      placeholder="Nilai"
                    />
                    
                    {formData.answers.length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveAnswer(index)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <X size={18} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <p className="text-sm text-text-secondary mt-2">
              * Centang jawaban yang benar. Minimal 2 jawaban diperlukan.
            </p>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-azure-shadow-dark">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 border border-azure-shadow-dark text-text-primary rounded-lg hover:bg-azure-bg disabled:opacity-50"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center px-4 py-2 bg-accent-primary text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin mr-2" size={20} />
                Menyimpan...
              </>
            ) : (
              <>
                <Plus className="mr-2" size={20} />
                Simpan Soal
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  )
}