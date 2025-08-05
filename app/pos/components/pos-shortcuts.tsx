'use client'

import { useEffect } from 'react'
import { toast } from 'sonner'

interface POSShortcutsProps {
  onPayment: () => void
  onClearCart: () => void
  onHoldOrder: () => void
  onRecallOrder: () => void
  onSearch: () => void
  disabled?: boolean
}

export function POSShortcuts({
  onPayment,
  onClearCart,
  onHoldOrder,
  onRecallOrder,
  onSearch,
  disabled = false
}: POSShortcutsProps) {
  useEffect(() => {
    if (disabled) return

    const handleKeyDown = (event: KeyboardEvent) => {
      // Prevent shortcuts when typing in inputs
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return
      }

      // Check for modifier keys
      const isCtrl = event.ctrlKey || event.metaKey
      const isShift = event.shiftKey

      switch (event.key.toLowerCase()) {
        case 'f2':
          event.preventDefault()
          onPayment()
          toast.success('Payment shortcut: F2')
          break
        
        case 'f3':
          event.preventDefault()
          onHoldOrder()
          toast.success('Hold order shortcut: F3')
          break
        
        case 'f4':
          event.preventDefault()
          onRecallOrder()
          toast.success('Recall order shortcut: F4')
          break
        
        case 'f5':
          event.preventDefault()
          onClearCart()
          toast.success('Clear cart shortcut: F5')
          break
        
        case 'f':
          if (isCtrl) {
            event.preventDefault()
            onSearch()
            toast.success('Search shortcut: Ctrl+F')
          }
          break
        
        case 'escape':
          event.preventDefault()
          // Could be used to close dialogs or cancel operations
          break
        
        default:
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onPayment, onClearCart, onHoldOrder, onRecallOrder, onSearch, disabled])

  return null // This component doesn't render anything
}