'use client'

import { CheckCircle } from 'lucide-react'
import Modal from '@/components/ui/Modal'

interface SuccessModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  message: string
  buttonText?: string
}

export default function SuccessModal({
  isOpen,
  onClose,
  title,
  message,
  buttonText = 'Tutup'
}: SuccessModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
    >
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
          <CheckCircle className="h-6 w-6 text-green-600" />
        </div>
        
        <p className="text-text-secondary mb-6">{message}</p>
        
        <button
          onClick={onClose}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          {buttonText}
        </button>
      </div>
    </Modal>
  )
}