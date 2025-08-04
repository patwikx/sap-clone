'use client'

import { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { businessPartnerSchema } from '@/lib/validations'
import { BusinessPartnerFormData, BusinessPartnerWithAddresses } from '@/lib/types'
import { createBusinessPartner, updateBusinessPartner } from '@/lib/business-partners'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface BusinessPartnerFormProps {
  children?: React.ReactNode
  initialData?: BusinessPartnerWithAddresses
}

export function BusinessPartnerForm({ children, initialData }: BusinessPartnerFormProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const form = useForm<BusinessPartnerFormData>({
    resolver: zodResolver(businessPartnerSchema),
    defaultValues: initialData ? {
      cardCode: initialData.cardCode,
      cardName: initialData.cardName,
      cardType: initialData.cardType as 'C' | 'S' | 'L',
      groupCode: initialData.groupCode,
      phone1: initialData.phone1 || '',
      phone2: initialData.phone2 || '',
      email: initialData.email || '',
      website: initialData.website || '',
      notes: initialData.notes || '',
      addresses: initialData.addresses.map(addr => ({
        addressName: addr.addressName,
        street: addr.street || '',
        city: addr.city || '',
        zipCode: addr.zipCode || '',
        state: addr.state || '',
        country: addr.country,
        addressType: addr.addressType as 'bo_BillTo' | 'bo_ShipTo'
      }))
    } : {
      cardCode: '',
      cardName: '',
      cardType: 'C',
      groupCode: 1,
      phone1: '',
      phone2: '',
      email: '',
      website: '',
      notes: '',
      addresses: [
        {
          addressName: 'Main Office',
          street: '',
          city: '',
          zipCode: '',
          state: '',
          country: 'USA',
          addressType: 'bo_BillTo'
        }
      ]
    }
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'addresses'
  })

  const onSubmit = async (data: BusinessPartnerFormData) => {
    setIsSubmitting(true)
    try {
      let result
      if (initialData) {
        result = await updateBusinessPartner(initialData.id, data)
      } else {
        result = await createBusinessPartner(data)
      }

      if (result.success) {
        toast.success(`Business partner ${initialData ? 'updated' : 'created'} successfully`)
        if (!initialData) {
          form.reset()
          setOpen(false)
        } else {
          router.push(`/dashboard/business-partners/${initialData.id}`)
        }
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      toast.error(`Failed to ${initialData ? 'update' : 'create'} business partner: ${error}`)
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
            name="cardCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Card Code *</FormLabel>
                <FormControl>
                  <Input placeholder="C00001" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="cardName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Card Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Company Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="cardType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="C">Customer</SelectItem>
                    <SelectItem value="S">Supplier</SelectItem>
                    <SelectItem value="L">Lead</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="groupCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Group Code *</FormLabel>
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

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="phone1"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone 1</FormLabel>
                <FormControl>
                  <Input placeholder="+1 (555) 123-4567" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone2"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone 2</FormLabel>
                <FormControl>
                  <Input placeholder="+1 (555) 123-4568" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="contact@company.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="website"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Website</FormLabel>
                <FormControl>
                  <Input placeholder="https://www.company.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea placeholder="Additional notes..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Addresses</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({
                addressName: '',
                street: '',
                city: '',
                zipCode: '',
                state: '',
                country: 'USA',
                addressType: 'bo_ShipTo'
              })}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Address
            </Button>
          </div>

          {fields.map((field, index) => (
            <div key={field.id} className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Address {index + 1}</h4>
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name={`addresses.${index}.addressName`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Main Office" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`addresses.${index}.addressType`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address Type *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="bo_BillTo">Bill To</SelectItem>
                          <SelectItem value="bo_ShipTo">Ship To</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name={`addresses.${index}.street`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Street</FormLabel>
                    <FormControl>
                      <Input placeholder="123 Main Street" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name={`addresses.${index}.city`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="New York" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`addresses.${index}.state`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input placeholder="NY" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`addresses.${index}.zipCode`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ZIP Code</FormLabel>
                      <FormControl>
                        <Input placeholder="10001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name={`addresses.${index}.country`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country *</FormLabel>
                    <FormControl>
                      <Input placeholder="USA" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          ))}
        </div>

        <div className="flex justify-end space-x-2">
          {!initialData && (
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (initialData ? 'Updating...' : 'Creating...') : (initialData ? 'Update Business Partner' : 'Create Business Partner')}
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Business Partner</DialogTitle>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  )
}