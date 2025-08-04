'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createWarehouse } from '@/lib/actions/warehouse'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from 'sonner'

const warehouseSchema = z.object({
  whsCode: z.string().min(1, 'Warehouse code is required'),
  whsName: z.string().min(1, 'Warehouse name is required')
})

type WarehouseFormData = z.infer<typeof warehouseSchema>

interface WarehouseFormProps {
  children: React.ReactNode
}

export function WarehouseForm({ children }: WarehouseFormProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<WarehouseFormData>({
    resolver: zodResolver(warehouseSchema),
    defaultValues: {
      whsCode: '',
      whsName: ''
    }
  })

  const onSubmit = async (data: WarehouseFormData) => {
    setIsSubmitting(true)
    try {
      const result = await createWarehouse(data)
      if (result.success) {
        toast.success('Warehouse created successfully')
        form.reset()
        setOpen(false)
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      toast.error(`Failed to create warehouse ${error}`)
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
          <DialogTitle>Add Warehouse</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="whsCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Warehouse Code *</FormLabel>
                  <FormControl>
                    <Input placeholder="WH01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="whsName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Warehouse Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Main Warehouse" {...field} />
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
                {isSubmitting ? 'Creating...' : 'Create Warehouse'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}