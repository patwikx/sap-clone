'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { itemSchema } from '@/lib/validations'
import { ItemFormData, ItemWithRelations } from '@/lib/types'
import { createItem, updateItem, getItemGroups } from '@/lib/items'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface ItemFormProps {
  children?: React.ReactNode
  initialData?: ItemWithRelations
}

interface ItemGroup {
  id: string
  groupName: string
}

export function ItemForm({ children, initialData }: ItemFormProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [itemGroups, setItemGroups] = useState<ItemGroup[]>([])
  const router = useRouter()

  const form = useForm<ItemFormData>({
    resolver: zodResolver(itemSchema),
    defaultValues: initialData ? {
      itemCode: initialData.itemCode,
      itemName: initialData.itemName,
      itemType: initialData.itemType as 'I' | 'S' | 'P',
      price: initialData.price,
      currency: initialData.currency,
      itemGroupId: initialData.itemGroupId,
      procurementMethod: initialData.procurementMethod as 'B' | 'M',
      leadTime: initialData.leadTime
    } : {
      itemCode: '',
      itemName: '',
      itemType: 'I',
      price: 0,
      currency: 'USD',
      itemGroupId: '',
      procurementMethod: 'B',
      leadTime: 1
    }
  })

  useEffect(() => {
    const loadItemGroups = async () => {
      const groups = await getItemGroups()
      setItemGroups(groups)
    }
    if (open || initialData) {
      loadItemGroups()
    }
  }, [open, initialData])

  const onSubmit = async (data: ItemFormData) => {
    setIsSubmitting(true)
    try {
      let result
      if (initialData) {
        result = await updateItem(initialData.id, data)
      } else {
        result = await createItem(data)
      }

      if (result.success) {
        toast.success(`Item ${initialData ? 'updated' : 'created'} successfully`)
        if (!initialData) {
          form.reset()
          setOpen(false)
        } else {
          router.push(`/dashboard/items/${initialData.id}`)
        }
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      toast.error(`Failed to ${initialData ? 'update' : 'create'} item: ${error}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const formContent = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="itemCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Item Code *</FormLabel>
                <FormControl>
                  <Input placeholder="ITM00001" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="itemName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Item Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Product Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="itemType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Item Type *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="I">Inventory Item</SelectItem>
                    <SelectItem value="S">Sales Item</SelectItem>
                    <SelectItem value="P">Purchase Item</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="itemGroupId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Item Group *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select item group" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {itemGroups.map((group) => (
                      <SelectItem key={group.id} value={group.id}>
                        {group.groupName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price *</FormLabel>
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
          <FormField
            control={form.control}
            name="currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Currency *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="procurementMethod"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Procurement Method *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="B">Buy</SelectItem>
                    <SelectItem value="M">Make</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="leadTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lead Time (days) *</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="1" 
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end space-x-2">
          {!initialData && (
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (initialData ? 'Updating...' : 'Creating...') : (initialData ? 'Update Item' : 'Create Item')}
          </Button>
        </div>
      </form>
    </Form>
  )

  if (initialData) {
    return formContent
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Item</DialogTitle>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  )
}