
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { EmployeesList } from './components/employee-list'
import { getEmployees } from '@/lib/employees'

export default async function EmployeesPage() {
  const employees = await getEmployees()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Employees</h1>
          <p className="text-gray-600 mt-2">
            Manage your workforce and organizational structure
          </p>
        </div>
        <Link href="/employees/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Employee
          </Button>
        </Link>
      </div>

      <EmployeesList employees={employees} />
    </div>
  )
}