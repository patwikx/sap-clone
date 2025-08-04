import { notFound } from 'next/navigation'
import { getEmployeeById } from '@/lib/employees'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { EmployeeForm } from '../../components/employee-form'

interface EditEmployeePageProps {
  params: {
    id: string
  }
}

export default async function EditEmployeePage({ params }: EditEmployeePageProps) {
  const employee = await getEmployeeById(params.id)

  if (!employee) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/employees/${employee.id}`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Details
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Employee</h1>
          <p className="text-gray-600 mt-2">{employee.firstName} {employee.lastName}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Employee Information</CardTitle>
        </CardHeader>
        <CardContent>
          <EmployeeForm initialData={employee} />
        </CardContent>
      </Card>
    </div>
  )
}