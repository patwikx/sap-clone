'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  MoreHorizontal, 
  Search, 
  Calendar,
  User,
  Wrench,
  AlertCircle,
  Clock,
  CheckCircle,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { deleteServiceCall, getServiceCalls, updateServiceCallStatus } from '@/lib/actions/service-call'

interface ServiceCallsListProps {
  serviceCalls: Awaited<ReturnType<typeof getServiceCalls>>
}

export function ServiceCallsList({ serviceCalls }: ServiceCallsListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [isUpdating, setIsUpdating] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState<number | null>(null)

  const filteredCalls = serviceCalls.filter(call => {
    const matchesSearch = 
      call.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      call.customer.cardName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      call.id.toString().includes(searchTerm)
    
    const matchesStatus = statusFilter === 'all' || call.status.toString() === statusFilter
    const matchesPriority = priorityFilter === 'all' || call.priority === priorityFilter

    return matchesSearch && matchesStatus && matchesPriority
  })

  const handleStatusUpdate = async (id: number, status: number) => {
    setIsUpdating(id)
    try {
      const result = await updateServiceCallStatus(id, status)
      if (result.success) {
        toast.success('Service call status updated successfully')
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      toast.error(`Failed to update service call status ${error}`)
    } finally {
      setIsUpdating(null)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm(`Are you sure you want to delete Service Call #${id}?`)) return

    setIsDeleting(id)
    try {
      const result = await deleteServiceCall(id)
      if (result.success) {
        toast.success('Service call deleted successfully')
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      toast.error(`Failed to delete service call ${error}`)
    } finally {
      setIsDeleting(null)
    }
  }

  const getStatusBadgeVariant = (status: number) => {
    switch (status) {
      case -3: return 'default'
      case -1: return 'secondary'
      case -2: return 'outline'
      default: return 'default'
    }
  }

  const getStatusLabel = (status: number) => {
    switch (status) {
      case -3: return 'Open'
      case -1: return 'Pending'
      case -2: return 'Closed'
      default: return 'Unknown'
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

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'H': return 'destructive'
      case 'M': return 'default'
      case 'L': return 'secondary'
      default: return 'default'
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

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'H': return ArrowUp
      case 'M': return Minus
      case 'L': return ArrowDown
      default: return Minus
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search service calls..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="-3">Open</SelectItem>
            <SelectItem value="-1">Pending</SelectItem>
            <SelectItem value="-2">Closed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="H">High</SelectItem>
            <SelectItem value="M">Medium</SelectItem>
            <SelectItem value="L">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredCalls.map((call) => {
          const StatusIcon = getStatusIcon(call.status)
          const PriorityIcon = getPriorityIcon(call.priority)

          return (
            <Card key={call.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">Service Call #{call.id}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{call.subject}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusBadgeVariant(call.status)}>
                      <StatusIcon className="mr-1 h-3 w-3" />
                      {getStatusLabel(call.status)}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/service-calls/${call.id}`}>
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        {call.status === -3 && (
                          <>
                            <DropdownMenuItem
                              onClick={() => handleStatusUpdate(call.id, -1)}
                              disabled={isUpdating === call.id}
                            >
                              Set to Pending
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleStatusUpdate(call.id, -2)}
                              disabled={isUpdating === call.id}
                            >
                              Close Call
                            </DropdownMenuItem>
                          </>
                        )}
                        {call.status === -1 && (
                          <>
                            <DropdownMenuItem
                              onClick={() => handleStatusUpdate(call.id, -3)}
                              disabled={isUpdating === call.id}
                            >
                              Reopen Call
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleStatusUpdate(call.id, -2)}
                              disabled={isUpdating === call.id}
                            >
                              Close Call
                            </DropdownMenuItem>
                          </>
                        )}
                        {call.status === -2 && (
                          <DropdownMenuItem
                            onClick={() => handleStatusUpdate(call.id, -3)}
                            disabled={isUpdating === call.id}
                          >
                            Reopen Call
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDelete(call.id)}
                          disabled={isDeleting === call.id}
                        >
                          {isDeleting === call.id ? 'Deleting...' : 'Delete'}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant={getPriorityBadgeVariant(call.priority)}>
                      <PriorityIcon className="mr-1 h-3 w-3" />
                      {getPriorityLabel(call.priority)} Priority
                    </Badge>
                  </div>

                  <div className="flex items-center text-sm text-gray-600">
                    <User className="mr-2 h-4 w-4" />
                    Customer: {call.customer.cardName}
                  </div>

                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="mr-2 h-4 w-4" />
                    Created: {format(new Date(call.createdOn), 'MMM dd, yyyy HH:mm')}
                  </div>

                  {call.closedOn && (
                    <div className="flex items-center text-sm text-gray-600">
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Closed: {format(new Date(call.closedOn), 'MMM dd, yyyy HH:mm')}
                    </div>
                  )}

                  {call.equipmentCard && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Wrench className="mr-2 h-4 w-4" />
                      Equipment: {call.equipmentCard.itemName}
                    </div>
                  )}

                  {call.serialNumber && (
                    <div className="text-sm text-gray-600">
                      <p className="font-medium">Serial Number:</p>
                      <p className="text-xs mt-1 p-2 bg-gray-50 rounded font-mono">{call.serialNumber}</p>
                    </div>
                  )}

                  {call.contract && (
                    <div className="pt-2 border-t">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Contract:</span>
                        <span className="font-medium">{call.contract.contractName}</span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredCalls.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-gray-500">No service calls found</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}