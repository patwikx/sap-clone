'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { restaurantTableSchema } from '@/lib/validations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from 'sonner'

type TableFormData = {
  tableNumber: string
  businessUnitId: string
  status?: 'Available' | 'Occupied' | 'Reserved'
}

interface TableFormProps {
  children: React.ReactNode
}

export function TableForm({ children }: TableFormProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [businessUnits, setBusinessUnits] = useState<any[]>([])

  const form = useForm<TableFormData>({
    resolver: zodResolver(restaurantTableSchema),
    defaultValues: {
      tableNumber: '',
      businessUnitId: '',
      status: 'Available'
    }
  })

  useEffect(() => {
    // In a real app, you'd fetch business units
    setBusinessUnits([
      { id: '1', name: 'Main Restaurant' },
      { id: '2', name: 'Bar & Lounge' },
      { id: '3', name: 'Outdoor Dining' }
    ])
  }, [])

  const onSubmit = async (data: TableFormData) => {
    setIsSubmitting(true)
    try {
      // In a real app, you'd have a createRestaurantTable action
      toast.success('Table created successfully')
      form.reset()
      setOpen(false)
    } catch (error) {
      toast.error('Failed to create table')
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
          <DialogTitle>Add Restaurant Table</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="tableNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Table Number *</FormLabel>
                  <FormControl>
                    <Input placeholder="T01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="businessUnitId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Unit *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select business unit" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {businessUnits.map((unit) => (
                        <SelectItem key={unit.id} value={unit.id}>
                          {unit.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Table'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}