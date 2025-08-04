import { notFound } from 'next/navigation'
import { getEmployeeById } from '@/lib/employees'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Mail, Phone, User, Building } from 'lucide-react'
import Link from 'next/link'

interface EmployeeDetailPageProps {
  params: {
    id: string
  }
}

export default async function EmployeeDetailPage({ params }: EmployeeDetailPageProps) {
  const employee = await getEmployeeById(params.id)

  if (!employee) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/employees">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Employees
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {employee.firstName} {employee.lastName}
          </h1>
          {employee.jobTitle && (
            <p className="text-gray-600 mt-2">{employee.jobTitle}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Employee Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Personal Information</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">First Name</p>
                      <p className="font-medium">{employee.firstName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Last Name</p>
                      <p className="font-medium">{employee.lastName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 text-gray-400 mr-2" />
                        <a href={`mailto:${employee.email}`} className="text-blue-600 hover:underline">
                          {employee.email}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Work Information</h3>
                  <div className="space-y-3">
                    {employee.jobTitle && (
                      <div>
                        <p className="text-sm text-gray-600">Job Title</p>
                        <p className="font-medium">{employee.jobTitle}</p>
                      </div>
                    )}
                    {employee.department && (
                      <div>
                        <p className="text-sm text-gray-600">Department</p>
                        <div className="flex items-center">
                          <Building className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="font-medium">{employee.department}</span>
                        </div>
                      </div>
                    )}
                    {employee.user && (
                      <div>
                        <p className="text-sm text-gray-600">System Access</p>
                        <Badge variant="default">System User</Badge>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Contact Information</h3>
                  <div className="space-y-3">
                    {employee.officePhone && (
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 text-gray-400 mr-2" />
                        <div>
                          <p className="text-sm text-gray-600">Office Phone</p>
                          <a href={`tel:${employee.officePhone}`} className="text-blue-600 hover:underline">
                            {employee.officePhone}
                          </a>
                        </div>
                      </div>
                    )}
                    {employee.mobilePhone && (
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 text-gray-400 mr-2" />
                        <div>
                          <p className="text-sm text-gray-600">Mobile Phone</p>
                          <a href={`tel:${employee.mobilePhone}`} className="text-blue-600 hover:underline">
                            {employee.mobilePhone}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Reporting Structure</h3>
                  <div className="space-y-3">
                    {employee.manager && (
                      <div className="flex items-center">
                        <User className="h-4 w-4 text-gray-400 mr-2" />
                        <div>
                          <p className="text-sm text-gray-600">Reports To</p>
                          <Link 
                            href={`/dashboard/employees/${employee.manager.id}`}
                            className="text-blue-600 hover:underline font-medium"
                          >
                            {employee.manager.firstName} {employee.manager.lastName}
                          </Link>
                        </div>
                      </div>
                    )}
                    {employee.subordinates.length > 0 && (
                      <div>
                        <p className="text-sm text-gray-600 mb-2">Direct Reports ({employee.subordinates.length})</p>
                        <div className="space-y-1">
                          {employee.subordinates.map((subordinate) => (
                            <Link
                              key={subordinate.id}
                              href={`/dashboard/employees/${subordinate.id}`}
                              className="block text-blue-600 hover:underline text-sm"
                            >
                              {subordinate.firstName} {subordinate.lastName}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href={`/dashboard/employees/${employee.id}/edit`}>
                <Button variant="outline" className="w-full">
                  Edit Employee
                </Button>
              </Link>
              <Button variant="outline" className="w-full">
                <Mail className="mr-2 h-4 w-4" />
                Send Email
              </Button>
              {employee.officePhone && (
                <Button variant="outline" className="w-full">
                  <Phone className="mr-2 h-4 w-4" />
                  Call Office
                </Button>
              )}
              {employee.mobilePhone && (
                <Button variant="outline" className="w-full">
                  <Phone className="mr-2 h-4 w-4" />
                  Call Mobile
                </Button>
              )}
            </CardContent>
          </Card>

          {employee.user && (
            <Card>
              <CardHeader>
                <CardTitle>System User</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">User Name</p>
                    <p className="font-medium">{employee.user.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium">{employee.user.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <Badge variant={employee.user.isActive ? 'default' : 'destructive'}>
                      {employee.user.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}