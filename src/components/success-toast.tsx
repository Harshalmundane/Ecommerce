"use client"
import { useEffect } from "react"
import { CheckCircle, X } from "lucide-react"

interface SuccessToastProps {
  message: string
  isVisible: boolean
  onClose: () => void
}

export default function SuccessToast({ message, isVisible, onClose }: SuccessToastProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose()
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [isVisible, onClose])

  if (!isVisible) return null

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 duration-300">
      <div className="bg-white border border-green-200 rounded-xl shadow-lg p-4 flex items-center gap-3 min-w-[300px]">
        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="w-5 h-5 text-green-600" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
        >
          <X className="w-4 h-4 text-gray-600" />
        </button>
      </div>
    </div>
  )
}
