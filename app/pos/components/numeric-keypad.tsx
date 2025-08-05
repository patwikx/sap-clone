'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Backpack as Backspace, Check, X } from 'lucide-react'

interface NumericKeypadProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (value: number) => void
  title?: string
  initialValue?: number
  maxValue?: number
  minValue?: number
}

export function NumericKeypad({
  isOpen,
  onClose,
  onConfirm,
  title = "Enter Value",
  initialValue = 1,
  maxValue = 999,
  minValue = 0
}: NumericKeypadProps) {
  const [value, setValue] = useState(initialValue.toString())

  const handleNumberClick = (num: string) => {
    if (value === '0' && num !== '.') {
      setValue(num)
    } else if (value.length < 6) { // Limit input length
      setValue(prev => prev + num)
    }
  }

  const handleBackspace = () => {
    setValue(prev => prev.length > 1 ? prev.slice(0, -1) : '0')
  }

  const handleClear = () => {
    setValue('0')
  }

  const handleConfirm = () => {
    const numValue = parseFloat(value)
    if (numValue >= minValue && numValue <= maxValue) {
      onConfirm(numValue)
      setValue(initialValue.toString())
    }
  }

  const handleCancel = () => {
    setValue(initialValue.toString())
    onClose()
  }

  const numbers = [
    ['7', '8', '9'],
    ['4', '5', '6'],
    ['1', '2', '3'],
    ['0', '.', '00']
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-center">{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Display */}
          <div className="text-center">
            <Input
              value={value}
              readOnly
              className="text-center text-2xl font-bold h-12 text-blue-600"
            />
          </div>

          {/* Keypad */}
          <div className="grid grid-cols-3 gap-2">
            {numbers.map((row, rowIndex) => 
              row.map((num, colIndex) => (
                <Button
                  key={`${rowIndex}-${colIndex}`}
                  variant="outline"
                  className="h-12 text-lg font-semibold hover:bg-blue-50"
                  onClick={() => handleNumberClick(num)}
                >
                  {num}
                </Button>
              ))
            )}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant="outline"
              onClick={handleClear}
              className="h-10 text-red-600 hover:bg-red-50"
            >
              Clear
            </Button>
            <Button
              variant="outline"
              onClick={handleBackspace}
              className="h-10 hover:bg-gray-50"
            >
              <Backspace className="h-4 w-4" />
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={parseFloat(value) < minValue || parseFloat(value) > maxValue}
              className="h-10 bg-green-600 hover:bg-green-700"
            >
              <Check className="h-4 w-4" />
            </Button>
          </div>

          {/* Cancel Button */}
          <Button
            variant="outline"
            onClick={handleCancel}
            className="w-full h-10 border-gray-300 hover:bg-gray-50"
          >
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}