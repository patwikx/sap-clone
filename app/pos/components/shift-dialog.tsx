'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { getBusinessPartners } from '@/lib/business-partners'

const shiftSchema = z.object({
  startAmount: z.number().min(0, 'Start amount must be positive'),
  userId: z.string().min(1, 'User is required')
})

const endShiftSchema = z.object({
  endAmount: z.number().min(0, 'End amount must be positive')
})

interface ShiftDialogProps {
  children: React.ReactNode
  currentShift?: any
  onStartShift?: (startAmount: number, userId: string) => void
  onEndShift?: (endAmount: number) => void
}

export function ShiftDialog({ children, currentShift, onStartShift, onEndShift }: ShiftDialogProps) {
  const [open, setOpen] = useState(false)
  const [users, setUsers] = useState<any[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const startForm = useForm({
    resolver: zodResolver(shiftSchema),
    defaultValues: {
      startAmount: 500,
      userId: ''
    }
  })

  const endForm = useForm({
    resolver: zodResolver(endShiftSchema),
    defaultValues: {
      endAmount: 0
    }
  })

  useEffect(() => {
    const loadUsers = async () => {
      // In a real app, you'd have a dedicated users endpoint
      // For now, we'll use business partners as a placeholder
      const partners = await getBusinessPartners()
      setUsers(partners.slice(0, 10)) // Limit for demo
    }
    if (open) {
      loadUsers()
    }
  }, [open])

  const handleStartShift = async (data: any) => {
    setIsSubmitting(true)
    try {
      if (onStartShift) {
        await onStartShift(data.startAmount, data.userId)
        setOpen(false)
        startForm.reset()
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEndShift = async (data: any) => {
    setIsSubmitting(true)
    try {
      if (onEndShift) {
        await onEndShift(data.endAmount)
        setOpen(false)
        endForm.reset()
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {currentShift ? 'End Shift' : 'Start Shift'}
          </DialogTitle>
        </DialogHeader>

        {!currentShift ? (
          <Form {...startForm}>
            <form onSubmit={startForm.handleSubmit(handleStartShift)} className="space-y-4">
              <FormField
                control={startForm.control}
                name="userId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cashier *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select cashier" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.cardName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={startForm.control}
                name="startAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Starting Cash Amount *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01"
                        placeholder="500.00" 
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Starting...' : 'Start Shift'}
                </Button>
              </div>
            </form>
          </Form>
        ) : (
          <Form {...endForm}>
            <form onSubmit={endForm.handleSubmit(handleEndShift)} className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  <strong>Shift Started:</strong> {new Date(currentShift.startTime).toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Starting Amount:</strong> ${currentShift.startAmount.toFixed(2)}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Cashier:</strong> {currentShift.user.name}
                </p>
              </div>

              <FormField
                control={endForm.control}
                name="endAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ending Cash Amount *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01"
                        placeholder="0.00" 
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Ending...' : 'End Shift'}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  )
}