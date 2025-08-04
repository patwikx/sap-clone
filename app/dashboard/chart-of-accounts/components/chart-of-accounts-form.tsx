'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { accountSchema } from '@/lib/validations'


type AccountFormData = {
  acctCode: string
  acctName: string
  acctType: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense'
  isControlAccount?: boolean
}
import { createAccount, updateAccount } from '@/lib/actions/chart-of-accounts'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface AccountFormProps {
  children?: React.ReactNode
  initialData?: {
    id: string
    acctCode: string
    acctName: string
    acctType: string
    isControlAccount: boolean
  }
}

export function AccountForm({ children, initialData }: AccountFormProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const form = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
    defaultValues: initialData ? {
      acctCode: initialData.acctCode,
      acctName: initialData.acctName,
      acctType: initialData.acctType as 'asset' | 'liability' | 'equity' | 'revenue' | 'expense',
      isControlAccount: initialData.isControlAccount
    } : {
      acctCode: '',
      acctName: '',
      acctType: 'asset',
      isControlAccount: false
    }
  })

  const onSubmit = async (data: AccountFormData) => {
    setIsSubmitting(true)
    try {
      let result
      if (initialData) {
        result = await updateAccount(initialData.id, {
          ...data,
          isControlAccount: data.isControlAccount ?? false
        })
      } else {
        result = await createAccount({
          ...data,
          isControlAccount: data.isControlAccount ?? false
        })
      }

      if (result.success) {
        toast.success(`Account ${initialData ? 'updated' : 'created'} successfully`)
        if (!initialData) {
          form.reset()
          setOpen(false)
        } else {
          router.push(`/dashboard/chart-of-accounts/${initialData.id}`)
        }
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      toast.error(`Failed to ${initialData ? 'update' : 'create'} account: ${error}`)
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
            name="acctCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Account Code *</FormLabel>
                <FormControl>
                  <Input placeholder="101000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="acctName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Account Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Cash" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="acctType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Account Type *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="asset">Asset</SelectItem>
                  <SelectItem value="liability">Liability</SelectItem>
                  <SelectItem value="equity">Equity</SelectItem>
                  <SelectItem value="revenue">Revenue</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isControlAccount"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Control Account
                </FormLabel>
                <p className="text-sm text-muted-foreground">
                  This account is used to control subsidiary ledgers
                </p>
              </div>
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          {!initialData && (
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (initialData ? 'Updating...' : 'Creating...') : (initialData ? 'Update Account' : 'Create Account')}
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
          <DialogTitle>Add Account</DialogTitle>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  )
}