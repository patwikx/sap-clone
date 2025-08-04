'use client'

import { useState } from 'react'
import { EmployeeWithRelations } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  MoreHorizontal, 
  Search,
  Mail,
  Phone,
  User,
  Building
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { deleteEmployee } from '@/lib/employees'

interface EmployeesListProps {
  employees: EmployeeWithRelations[]
}

export function EmployeesList({ employees }: EmployeesListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  const filteredEmployees = employees.filter(employee => {
    const fullName = `${employee.firstName} ${employee.lastName}`.toLowerCase()
    const searchLower = searchTerm.toLowerCase()
    
    return (
      fullName.includes(searchLower) ||
      employee.email.toLowerCase().includes(searchLower) ||
      employee.jobTitle?.toLowerCase().includes(searchLower) ||
      employee.department?.toLowerCase().includes(searchLower)
    )
  })

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return

    setIsDeleting(id)
    try {
      const result = await deleteEmployee(id)
      if (result.success) {
        toast.success('Employee deleted successfully')
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      toast.error(`Failed to delete employee ${error}`)
    } finally {
      setIsDeleting(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEmployees.map((employee) => (
          <Card key={employee.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">
                    {employee.firstName} {employee.lastName}
                  </CardTitle>
                  {employee.jobTitle && (
                    <p className="text-sm text-gray-600 mt-1">{employee.jobTitle}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {employee.user && (
                    <Badge variant="default">System User</Badge>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/employees/${employee.id}`}>
                          View Details
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/employees/${employee.id}/edit`}>
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => handleDelete(employee.id, `${employee.firstName} ${employee.lastName}`)}
                        disabled={isDeleting === employee.id}
                      >
                        {isDeleting === employee.id ? 'Deleting...' : 'Delete'}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="mr-2 h-4 w-4" />
                  {employee.email}
                </div>

                {employee.officePhone && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="mr-2 h-4 w-4" />
                    {employee.officePhone}
                  </div>
                )}

                {employee.department && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Building className="mr-2 h-4 w-4" />
                    {employee.department}
                  </div>
                )}

                {employee.manager && (
                  <div className="flex items-center text-sm text-gray-600">
                    <User className="mr-2 h-4 w-4" />
                    Manager: {employee.manager.firstName} {employee.manager.lastName}
                  </div>
                )}

                {employee.subordinates.length > 0 && (
                  <div className="pt-2 border-t">
                    <p className="text-xs text-gray-500 mb-1">Direct Reports:</p>
                    <div className="space-y-1">
                      {employee.subordinates.slice(0, 3).map((subordinate) => (
                        <p key={subordinate.id} className="text-xs text-gray-600">
                          {subordinate.firstName} {subordinate.lastName}
                        </p>
                      ))}
                      {employee.subordinates.length > 3 && (
                        <p className="text-xs text-gray-500">
                          +{employee.subordinates.length - 3} more
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {employee.mobilePhone && (
                  <div className="pt-2 border-t">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Mobile:</span>
                      <span className="font-medium">{employee.mobilePhone}</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredEmployees.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-gray-500">No employees found</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}