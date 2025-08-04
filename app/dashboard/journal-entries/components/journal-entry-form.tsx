'use client'

import { useState, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createJournalEntry } from '@/lib/actions/journal-entry'
import { getAccounts } from '@/lib/actions/chart-of-accounts'
import { getBusinessPartners } from '@/lib/business-partners'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

const journalEntrySchema = z.object({
  memo: z.string().optional(),
  refDate: z.date(),
  dueDate: z.date().optional(),
  taxDate: z.date().optional(),
  lines: z.array(z.object({
    accountId: z.string().min(1, 'Account is required'),
    debit: z.number().min(0),
    credit: z.number().min(0),
    shortName: z.string().optional(),
    lineMemo: z.string().optional(),
    businessPartnerId: z.string().optional()
  })).min(2, 'At least two lines are required')
}).refine((data) => {
  const totalDebits = data.lines.reduce((sum, line) => sum + line.debit, 0)
  const totalCredits = data.lines.reduce((sum, line) => sum + line.credit, 0)
  return Math.abs(totalDebits - totalCredits) < 0.01
}, {
  message: 'Total debits must equal total credits'
})

type JournalEntryFormData = z.infer<typeof journalEntrySchema>

interface JournalEntryFormProps {
  children: React.ReactNode
}

interface Account {
  id: string
  acctCode: string
  acctName: string
  acctType: string
}

interface BusinessPartner {
  id: string
  cardCode: string
  cardName: string
}

export function JournalEntryForm({ children }: JournalEntryFormProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [businessPartners, setBusinessPartners] = useState<BusinessPartner[]>([])

  const form = useForm<JournalEntryFormData>({
    resolver: zodResolver(journalEntrySchema),
    defaultValues: {
      memo: '',
      refDate: new Date(),
      dueDate: new Date(),
      taxDate: new Date(),
      lines: [
        {
          accountId: '',
          debit: 0,
          credit: 0,
          shortName: '',
          lineMemo: '',
          businessPartnerId: ''
        },
        {
          accountId: '',
          debit: 0,
          credit: 0,
          shortName: '',
          lineMemo: '',
          businessPartnerId: ''
        }
      ]
    }
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'lines'
  })

  useEffect(() => {
    const loadData = async () => {
      const [accountsList, partnersList] = await Promise.all([
        getAccounts(),
        getBusinessPartners()
      ])
      setAccounts(accountsList)
      setBusinessPartners(partnersList)
    }
    if (open) {
      loadData()
    }
  }, [open])

  const onSubmit = async (data: JournalEntryFormData) => {
    setIsSubmitting(true)
    try {
      const result = await createJournalEntry(data)
      if (result.success) {
        toast.success('Journal entry created successfully')
        form.reset()
        setOpen(false)
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      toast.error(`Failed to create journal entry: ${error}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const totalDebits = form.watch('lines').reduce((sum, line) => sum + (line.debit || 0), 0)
  const totalCredits = form.watch('lines').reduce((sum, line) => sum + (line.credit || 0), 0)
  const isBalanced = Math.abs(totalDebits - totalCredits) < 0.01

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Journal Entry</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="memo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Memo</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Journal entry description..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="refDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reference Date *</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        {...field}
                        value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : field.value}
                        onChange={(e) => field.onChange(new Date(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        {...field}
                        value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : field.value}
                        onChange={(e) => field.onChange(new Date(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="taxDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tax Date</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        {...field}
                        value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : field.value}
                        onChange={(e) => field.onChange(new Date(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Journal Entry Lines</h3>
                <div className="flex items-center gap-4">
                  <div className={`text-sm ${isBalanced ? 'text-green-600' : 'text-red-600'}`}>
                    Debits: ${totalDebits.toFixed(2)} | Credits: ${totalCredits.toFixed(2)}
                    {isBalanced ? ' ✓' : ' ⚠️'}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({
                      accountId: '',
                      debit: 0,
                      credit: 0,
                      shortName: '',
                      lineMemo: '',
                      businessPartnerId: ''
                    })}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Line
                  </Button>
                </div>
              </div>

              {fields.map((field, index) => (
                <div key={field.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Line {index + 1}</h4>
                    {fields.length > 2 && (
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

                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name={`lines.${index}.accountId`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Account *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select account" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {accounts.map((account) => (
                                <SelectItem key={account.id} value={account.id}>
                                  {account.acctCode} - {account.acctName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`lines.${index}.debit`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Debit</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01"
                              placeholder="0.00" 
                              {...field}
                              onChange={(e) => {
                                const value = parseFloat(e.target.value) || 0
                                field.onChange(value)
                                if (value > 0) {
                                  form.setValue(`lines.${index}.credit`, 0)
                                }
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`lines.${index}.credit`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Credit</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01"
                              placeholder="0.00" 
                              {...field}
                              onChange={(e) => {
                                const value = parseFloat(e.target.value) || 0
                                field.onChange(value)
                                if (value > 0) {
                                  form.setValue(`lines.${index}.debit`, 0)
                                }
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name={`lines.${index}.shortName`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Short Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Reference..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`lines.${index}.businessPartnerId`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Partner</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select partner" />
                              </SelectTrigger>
                            </FormControl>
<SelectContent>
  {businessPartners.map((partner) => (
    <SelectItem key={partner.id} value={partner.id}>
      {partner.cardCode} - {partner.cardName}
    </SelectItem>
  ))}
</SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`lines.${index}.lineMemo`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Line Memo</FormLabel>
                          <FormControl>
                            <Input placeholder="Line description..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || !isBalanced}>
                {isSubmitting ? 'Creating...' : 'Create Journal Entry'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}