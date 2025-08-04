'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createPOSTerminal } from '@/lib/actions/pos'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from 'sonner'

const terminalSchema = z.object({
  name: z.string().min(1, 'Terminal name is required'),
  businessUnitId: z.string().min(1, 'Business unit is required')
})

type TerminalFormData = z.infer<typeof terminalSchema>

interface TerminalFormProps {
  children: React.ReactNode
}

export function TerminalForm({ children }: TerminalFormProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [businessUnits, setBusinessUnits] = useState<any[]>([])

  const form = useForm<TerminalFormData>({
    resolver: zodResolver(terminalSchema),
    defaultValues: {
      name: '',
      businessUnitId: ''
    }
  })

  useEffect(() => {
    // In a real app, you'd fetch business units
    // For now, we'll use mock data
    setBusinessUnits([
      { id: '1', name: 'Main Restaurant' },
      { id: '2', name: 'Bar & Lounge' },
      { id: '3', name: 'Room Service' }
    ])
  }, [])

  const onSubmit = async (data: TerminalFormData) => {
    setIsSubmitting(true)
    try {
      const result = await createPOSTerminal(data.name, data.businessUnitId)
      if (result.success) {
        toast.success('Terminal created successfully')
        form.reset()
        setOpen(false)
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      toast.error('Failed to create terminal')
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
          <DialogTitle>Add POS Terminal</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Terminal Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Main POS Terminal" {...field} />
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
                {isSubmitting ? 'Creating...' : 'Create Terminal'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}