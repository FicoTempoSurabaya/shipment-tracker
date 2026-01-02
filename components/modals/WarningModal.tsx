'use client'

import { AlertTriangle } from 'lucide-react'
import Modal from '@/components/ui/Modal'

interface WarningModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  message: string
  buttonText?: string
}

export default function WarningModal({
  isOpen,
  onClose,
  title,
  message,
  buttonText = 'Mengerti'
}: WarningModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
    >
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
          <AlertTriangle className="h-6 w-6 text-yellow-600" />
        </div>
        
        <p className="text-text-secondary mb-6">{message}</p>
        
        <button
          onClick={onClose}
          className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
        >
          {buttonText}
        </button>
      </div>
    </Modal>
  )
}