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
  Package,
  Factory,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { deleteProductionOrder, getProductionOrders, updateProductionOrderStatus } from '@/lib/actions/production-order'

interface ProductionOrdersListProps {
  productionOrders: Awaited<ReturnType<typeof getProductionOrders>>
}

export function ProductionOrdersList({ productionOrders }: ProductionOrdersListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isUpdating, setIsUpdating] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState<number | null>(null)

  const filteredOrders = productionOrders.filter(order => {
    const matchesSearch = 
      order.item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.docNum.toString().includes(searchTerm) ||
      order.item.itemCode.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const handleStatusUpdate = async (id: number, status: 'P' | 'R' | 'C' | 'L') => {
    setIsUpdating(id)
    try {
      const result = await updateProductionOrderStatus(id, status)
      if (result.success) {
        toast.success('Production order status updated successfully')
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      toast.error(`Failed to update production order status ${error}`)
    } finally {
      setIsUpdating(null)
    }
  }

  const handleDelete = async (id: number, docNum: number) => {
    if (!confirm(`Are you sure you want to delete Production Order PRO-${docNum}?`)) return

    setIsDeleting(id)
    try {
      const result = await deleteProductionOrder(id)
      if (result.success) {
        toast.success('Production order deleted successfully')
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      toast.error(`Failed to delete production order ${error}`)
    } finally {
      setIsDeleting(null)
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'P': return 'outline'
      case 'R': return 'default'
      case 'C': return 'secondary'
      case 'L': return 'destructive'
      default: return 'default'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'P': return 'Planned'
      case 'R': return 'Released'
      case 'C': return 'Closed'
      case 'L': return 'Cancelled'
      default: return status
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'P': return Clock
      case 'R': return Factory
      case 'C': return CheckCircle
      case 'L': return XCircle
      default: return Clock
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'S': return 'Standard'
      case 'P': return 'Special'
      case 'D': return 'Disassembly'
      default: return type
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search production orders..."
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
            <SelectItem value="P">Planned</SelectItem>
            <SelectItem value="R">Released</SelectItem>
            <SelectItem value="C">Closed</SelectItem>
            <SelectItem value="L">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredOrders.map((order) => {
          const StatusIcon = getStatusIcon(order.status)
          const completionPercentage = order.plannedQty > 0 ? (order.completedQty / order.plannedQty) * 100 : 0

          return (
            <Card key={order.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">PRO-{order.docNum}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{order.item.itemName}</p>
                    <p className="text-xs text-gray-500">{order.item.itemCode}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusBadgeVariant(order.status)}>
                      <StatusIcon className="mr-1 h-3 w-3" />
                      {getStatusLabel(order.status)}
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/production-orders/${order.id}`}>
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        {order.status === 'P' && (
                          <DropdownMenuItem
                            onClick={() => handleStatusUpdate(order.id, 'R')}
                            disabled={isUpdating === order.id}
                          >
                            Release Order
                          </DropdownMenuItem>
                        )}
                        {order.status === 'R' && (
                          <DropdownMenuItem
                            onClick={() => handleStatusUpdate(order.id, 'C')}
                            disabled={isUpdating === order.id}
                          >
                            Close Order
                          </DropdownMenuItem>
                        )}
                        {(order.status === 'P' || order.status === 'R') && (
                          <DropdownMenuItem
                            onClick={() => handleStatusUpdate(order.id, 'L')}
                            disabled={isUpdating === order.id}
                          >
                            Cancel Order
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDelete(order.id, order.docNum)}
                          disabled={isDeleting === order.id}
                        >
                          {isDeleting === order.id ? 'Deleting...' : 'Delete'}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="mr-2 h-4 w-4" />
                    Posting Date: {format(new Date(order.postingDate), 'MMM dd, yyyy')}
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="mr-2 h-4 w-4" />
                    Due Date: {format(new Date(order.dueDate), 'MMM dd, yyyy')}
                  </div>

                  <div className="flex items-center text-sm text-gray-600">
                    <Package className="mr-2 h-4 w-4" />
                    Type: {getTypeLabel(order.type)}
                  </div>

                  <div className="pt-2 border-t">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-xs text-gray-500">Planned</p>
                        <p className="font-medium">{order.plannedQty}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Completed</p>
                        <p className="font-medium text-green-600">{order.completedQty}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Rejected</p>
                        <p className="font-medium text-red-600">{order.rejectedQty}</p>
                      </div>
                    </div>
                  </div>

                  {order.status === 'R' && (
                    <div className="pt-2 border-t">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Progress:</span>
                        <span className="font-medium">{completionPercentage.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(completionPercentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {order.lines.length > 0 && (
                    <div className="pt-2 border-t">
                      <p className="text-xs text-gray-500 mb-2">Components ({order.lines.length}):</p>
                      <div className="space-y-1">
                        {order.lines.slice(0, 2).map((line) => (
                          <div key={line.id} className="flex justify-between text-xs">
                            <span className="truncate flex-1 mr-2">{line.itemCode}</span>
                            <span className="flex-shrink-0">{line.plannedQty} / {line.issuedQty}</span>
                          </div>
                        ))}
                        {order.lines.length > 2 && (
                          <p className="text-xs text-gray-500">
                            +{order.lines.length - 2} more component{order.lines.length - 2 !== 1 ? 's' : ''}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredOrders.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-gray-500">No production orders found</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}