import { useState } from "react"

type ToastVariant = 'default' | 'success' | 'error' | 'warning'

interface ToastData {
  id: string
  title?: string
  description?: string
  variant?: ToastVariant
  duration?: number
}

let toastCount = 0
const listeners: Array<(toasts: ToastData[]) => void> = []
let toasts: ToastData[] = []

function notify(listeners: Array<(toasts: ToastData[]) => void>, state: ToastData[]) {
  listeners.forEach(listener => listener(state))
}

export function toast(props: Omit<ToastData, 'id'>) {
  const id = String(++toastCount)
  const newToast: ToastData = { id, ...props }
  toasts = [...toasts, newToast]
  notify(listeners, toasts)

  // Auto dismiss
  const duration = props.duration || 4000
  setTimeout(() => {
    toasts = toasts.filter(t => t.id !== id)
    notify(listeners, toasts)
  }, duration)
}

export function useToast() {
  const [state, setState] = useState<ToastData[]>(toasts)

  useState(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) listeners.splice(index, 1)
    }
  })

  return { toasts: state, toast }
}
