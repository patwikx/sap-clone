'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { employeeSchema } from '@/lib/validations'
import { EmployeeFormData, EmployeeWithRelations } from '@/lib/types'
import { createEmployee, updateEmployee, getEmployees } from '@/lib/employees'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface EmployeeFormProps {
  children?: React.ReactNode
  initialData?: EmployeeWithRelations
}

export function EmployeeForm({ children, initialData }: EmployeeFormProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [managers, setManagers] = useState<EmployeeWithRelations[]>([])
  const router = useRouter()

  const form = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: initialData ? {
      firstName: initialData.firstName,
      lastName: initialData.lastName,
      jobTitle: initialData.jobTitle || '',
      department: initialData.department || '',
      managerId: initialData.managerId || '',
      officePhone: initialData.officePhone || '',
      mobilePhone: initialData.mobilePhone || '',
      email: initialData.email,
      userId: initialData.userId || ''
    } : {
      firstName: '',
      lastName: '',
      jobTitle: '',
      department: '',
      managerId: '',
      officePhone: '',
      mobilePhone: '',
      email: '',
      userId: ''
    }
  })

  useEffect(() => {
    const loadManagers = async () => {
      const employees = await getEmployees()
      // Filter out current employee from manager list
      const availableManagers = initialData 
        ? employees.filter(emp => emp.id !== initialData.id)
        : employees
      setManagers(availableManagers)
    }
    if (open || initialData) {
      loadManagers()
    }
  }, [open, initialData])

  const onSubmit = async (data: EmployeeFormData) => {
    setIsSubmitting(true)
    try {
      let result
      if (initialData) {
        result = await updateEmployee(initialData.id, data)
      } else {
        result = await createEmployee(data)
      }

      if (result.success) {
        toast.success(`Employee ${initialData ? 'updated' : 'created'} successfully`)
        if (!initialData) {
          form.reset()
          setOpen(false)
        } else {
          router.push(`/dashboard/employees/${initialData.id}`)
        }
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      toast.error(`Failed to ${initialData ? 'update' : 'create'} employee: ${error}`)
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
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name *</FormLabel>
                <FormControl>
                  <Input placeholder="John" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name *</FormLabel>
                <FormControl>
                  <Input placeholder="Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email *</FormLabel>
              <FormControl>
                <Input type="email" placeholder="john.doe@company.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="jobTitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Job Title</FormLabel>
                <FormControl>
                  <Input placeholder="Software Engineer" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="department"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Department</FormLabel>
                <FormControl>
                  <Input placeholder="Engineering" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="managerId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Manager</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select manager" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="">No Manager</SelectItem>
                  {managers.map((manager) => (
                    <SelectItem key={manager.id} value={manager.id}>
                      {manager.firstName} {manager.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="officePhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Office Phone</FormLabel>
                <FormControl>
                  <Input placeholder="+1 (555) 123-4567" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="mobilePhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mobile Phone</FormLabel>
                <FormControl>
                  <Input placeholder="+1 (555) 987-6543" {...field} />
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
            {isSubmitting ? (initialData ? 'Updating...' : 'Creating...') : (initialData ? 'Update Employee' : 'Create Employee')}
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
          <DialogTitle>Add Employee</DialogTitle>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  )
}