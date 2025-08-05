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
import { POSShiftWithDetails, ShiftFormData, EndShiftFormData, BusinessPartnerForPOS } from '@/lib/types'
import { getBusinessPartners } from '@/lib/actions/pos'

const shiftSchema = z.object({
  startAmount: z.number().min(0, 'Start amount must be positive'),
  userId: z.string().min(1, 'User is required')
})

const endShiftSchema = z.object({
  endAmount: z.number().min(0, 'End amount must be positive')
})

interface ShiftDialogProps {
  children: React.ReactNode
  currentShift?: POSShiftWithDetails | null
  onStartShift?: (startAmount: number, userId: string) => void
  onEndShift?: (endAmount: number) => void
}

export function ShiftDialog({ children, currentShift, onStartShift, onEndShift }: ShiftDialogProps) {
  const [open, setOpen] = useState(false)
  const [users, setUsers] = useState<BusinessPartnerForPOS[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const startForm = useForm<ShiftFormData>({
    resolver: zodResolver(shiftSchema),
    defaultValues: {
      startAmount: 500,
      userId: ''
    }
  })

  const endForm = useForm<EndShiftFormData>({
    resolver: zodResolver(endShiftSchema),
    defaultValues: {
      endAmount: 0
    }
  })

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const partners = await getBusinessPartners()
        setUsers(partners)
      } catch (error) {
        console.error('Error loading users:', error)
      }
    }
    if (open) {
      loadUsers()
    }
  }, [open])

  const handleStartShift = async (data: ShiftFormData) => {
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

  const handleEndShift = async (data: EndShiftFormData) => {
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
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">
            {currentShift ? 'End Shift' : 'Start Shift'}
          </DialogTitle>
        </DialogHeader>

        {!currentShift ? (
          <Form {...startForm}>
            <form onSubmit={startForm.handleSubmit(handleStartShift)} className="space-y-6">
              <FormField
                control={startForm.control}
                name="userId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-gray-700">Select Cashier *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-12">
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
                    <FormLabel className="text-sm font-semibold text-gray-700">Starting Cash Amount *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01"
                        placeholder="500.00"
                        className="h-12 text-base"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setOpen(false)}
                  className="px-6"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="px-6 bg-blue-600 hover:bg-blue-700"
                >
                  {isSubmitting ? 'Starting...' : 'Start Shift'}
                </Button>
              </div>
            </form>
          </Form>
        ) : (
          <Form {...endForm}>
            <form onSubmit={endForm.handleSubmit(handleEndShift)} className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <h4 className="font-semibold text-gray-800">Shift Information</h4>
                <p className="text-sm text-gray-600">
                  <strong>Shift Started:</strong> {new Date(currentShift.startTime).toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Starting Amount:</strong> ₱{Number(currentShift.startAmount).toFixed(2)}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Cashier:</strong> {currentShift.user.employee?.firstName} {currentShift.user.employee?.lastName}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Orders Processed:</strong> {currentShift.posOrders?.length || 0}
                </p>
              </div>

              <FormField
                control={endForm.control}
                name="endAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-semibold text-gray-700">Ending Cash Amount *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01"
                        placeholder="0.00"
                        className="h-12 text-base"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setOpen(false)}
                  className="px-6"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="px-6 bg-red-600 hover:bg-red-700"
                >
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