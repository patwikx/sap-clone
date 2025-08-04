import { notFound } from 'next/navigation'
import { getServiceCallById } from '@/lib/actions/service-call'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Calendar, User, Wrench, AlertCircle, Clock, CheckCircle, ArrowUp, ArrowDown, Minus } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'

interface ServiceCallDetailPageProps {
  params: {
    id: string
  }
}

export default async function ServiceCallDetailPage({ params }: ServiceCallDetailPageProps) {
  const serviceCall = await getServiceCallById(parseInt(params.id))

  if (!serviceCall) {
    notFound()
  }

  const getStatusLabel = (status: number) => {
    switch (status) {
      case -3: return 'Open'
      case -1: return 'Pending'
      case -2: return 'Closed'
      default: return 'Unknown'
    }
  }

  const getStatusBadgeVariant = (status: number) => {
    switch (status) {
      case -3: return 'default' as const
      case -1: return 'secondary' as const
      case -2: return 'outline' as const
      default: return 'default' as const
    }
  }

  const getStatusIcon = (status: number) => {
    switch (status) {
      case -3: return AlertCircle
      case -1: return Clock
      case -2: return CheckCircle
      default: return AlertCircle
    }
  }

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'H': return 'High'
      case 'M': return 'Medium'
      case 'L': return 'Low'
      default: return priority
    }
  }

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'H': return 'destructive' as const
      case 'M': return 'default' as const
      case 'L': return 'secondary' as const
      default: return 'default' as const
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'H': return ArrowUp
      case 'M': return Minus
      case 'L': return ArrowDown
      default: return Minus
    }
  }

  const StatusIcon = getStatusIcon(serviceCall.status)
  const PriorityIcon = getPriorityIcon(serviceCall.priority)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/service-call">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Service Calls
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Service Call #{serviceCall.id}</h1>
          <p className="text-gray-600 mt-2">View service call details and information</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Service Call Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Subject</h3>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{serviceCall.subject}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Customer Information</h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <User className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">Customer:</span>
                      <span className="ml-2 font-medium">{serviceCall.customer.cardName}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Priority & Status</h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Badge variant={getPriorityBadgeVariant(serviceCall.priority)}>
                        <PriorityIcon className="mr-1 h-3 w-3" />
                        {getPriorityLabel(serviceCall.priority)} Priority
                      </Badge>
                    </div>
                    <div className="flex items-center">
                      <Badge variant={getStatusBadgeVariant(serviceCall.status)}>
                        <StatusIcon className="mr-1 h-3 w-3" />
                        {getStatusLabel(serviceCall.status)}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {serviceCall.equipmentCard && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Equipment Information</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Wrench className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="font-medium">{serviceCall.equipmentCard.itemName}</span>
                    </div>
                    <p className="text-sm text-gray-600">Item Code: {serviceCall.equipmentCard.itemCode}</p>
                    {serviceCall.serialNumber && (
                      <p className="text-sm text-gray-600">Serial Number: {serviceCall.serialNumber}</p>
                    )}
                  </div>
                </div>
              )}

              {serviceCall.contract && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Service Contract</h3>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="font-medium text-blue-900">{serviceCall.contract.contractName}</p>
                    <p className="text-sm text-blue-700">
                      Valid from {format(new Date(serviceCall.contract.startDate), 'PPP')} to {format(new Date(serviceCall.contract.endDate), 'PPP')}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Call Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center text-sm">
                <Calendar className="mr-2 h-4 w-4 text-gray-400" />
                <div>
                  <p className="font-medium">Created On</p>
                  <p className="text-gray-600">{format(new Date(serviceCall.createdOn), 'PPP HH:mm')}</p>
                </div>
              </div>

              {serviceCall.closedOn && (
                <div className="flex items-center text-sm">
                  <CheckCircle className="mr-2 h-4 w-4 text-gray-400" />
                  <div>
                    <p className="font-medium">Closed On</p>
                    <p className="text-gray-600">{format(new Date(serviceCall.closedOn), 'PPP HH:mm')}</p>
                  </div>
                </div>
              )}

              <div className="pt-2 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Call ID:</span>
                  <span className="font-medium">#{serviceCall.id}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {serviceCall.status === -3 && (
                <>
                  <Button variant="outline" className="w-full">
                    Set to Pending
                  </Button>
                  <Button variant="outline" className="w-full">
                    Close Call
                  </Button>
                </>
              )}
              {serviceCall.status === -1 && (
                <>
                  <Button variant="outline" className="w-full">
                    Reopen Call
                  </Button>
                  <Button variant="outline" className="w-full">
                    Close Call
                  </Button>
                </>
              )}
              {serviceCall.status === -2 && (
                <Button variant="outline" className="w-full">
                  Reopen Call
                </Button>
              )}
              <Button variant="outline" className="w-full">
                Add Activity
              </Button>
              <Button variant="outline" className="w-full">
                Schedule Visit
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}