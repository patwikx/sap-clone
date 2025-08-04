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
  DollarSign,
  Package
} from 'lucide-react'
import Link from 'next/link'

import { toast } from 'sonner'
import { format } from 'date-fns'
import { DocStatus } from '@prisma/client'
import { deletePurchaseOrder, getPurchaseOrders, updatePurchaseOrderStatus } from '@/lib/actions/purchase-order'

interface PurchaseOrdersListProps {
  purchaseOrders: Awaited<ReturnType<typeof getPurchaseOrders>>
}

export function PurchaseOrdersList({ purchaseOrders }: PurchaseOrdersListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isUpdating, setIsUpdating] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState<number | null>(null)

  const filteredOrders = purchaseOrders.filter(order => {
    const matchesSearch = 
      order.businessPartner.cardName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.docNum.toString().includes(searchTerm)
    
    const matchesStatus = statusFilter === 'all' || order.docStatus === statusFilter

    return matchesSearch && matchesStatus
  })

  const handleStatusUpdate = async (id: number, status: DocStatus) => {
    setIsUpdating(id)
    try {
      const result = await updatePurchaseOrderStatus(id, status)
      if (result.success) {
        toast.success('Purchase order status updated successfully')
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      toast.error(`Failed to update purchase order status ${error}`)
    } finally {
      setIsUpdating(null)
    }
  }

  const handleDelete = async (id: number, docNum: number) => {
    if (!confirm(`Are you sure you want to delete Purchase Order PO-${docNum}?`)) return

    setIsDeleting(id)
    try {
      const result = await deletePurchaseOrder(id)
      if (result.success) {
        toast.success('Purchase order deleted successfully')
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      toast.error(`Failed to delete purchase order ${error}`)
    } finally {
      setIsDeleting(null)
    }
  }

  const getStatusBadgeVariant = (status: DocStatus) => {
    switch (status) {
      case 'O': return 'default'
      case 'C': return 'secondary'
      case 'L': return 'destructive'
      default: return 'default'
    }
  }

  const getStatusLabel = (status: DocStatus) => {
    switch (status) {
      case 'O': return 'Open'
      case 'C': return 'Closed'
      case 'L': return 'Cancelled'
      default: return status
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search purchase orders..."
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
            <SelectItem value="O">Open</SelectItem>
            <SelectItem value="C">Closed</SelectItem>
            <SelectItem value="L">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredOrders.map((order) => (
          <Card key={order.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">PO-{order.docNum}</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">{order.businessPartner.cardName}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={getStatusBadgeVariant(order.docStatus)}>
                    {getStatusLabel(order.docStatus)}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/purchase-orders/${order.id}`}>
                          View Details
                        </Link>
                      </DropdownMenuItem>
                      {order.docStatus === 'O' && (
                        <>
                          <DropdownMenuItem
                            onClick={() => handleStatusUpdate(order.id, 'C')}
                            disabled={isUpdating === order.id}
                          >
                            Close Order
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleStatusUpdate(order.id, 'L')}
                            disabled={isUpdating === order.id}
                          >
                            Cancel Order
                          </DropdownMenuItem>
                        </>
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
                  Order Date: {format(new Date(order.docDate), 'MMM dd, yyyy')}
                </div>
                
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="mr-2 h-4 w-4" />
                  Due Date: {format(new Date(order.docDueDate), 'MMM dd, yyyy')}
                </div>

                <div className="flex items-center text-sm text-gray-600">
                  <Package className="mr-2 h-4 w-4" />
                  {order.lines.length} line item{order.lines.length !== 1 ? 's' : ''}
                </div>

                {order.comments && (
                  <div className="text-sm text-gray-600">
                    <p className="font-medium">Comments:</p>
                    <p className="text-xs mt-1 p-2 bg-gray-50 rounded">{order.comments}</p>
                  </div>
                )}

                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Amount:</span>
                    <div className="flex items-center text-lg font-semibold text-blue-600">
                      <DollarSign className="h-4 w-4" />
                      {order.docTotal.toFixed(2)}
                    </div>
                  </div>
                </div>

                {order.lines.length > 0 && (
                  <div className="pt-2 border-t">
                    <p className="text-xs text-gray-500 mb-2">Order Lines:</p>
                    <div className="space-y-1">
                      {order.lines.slice(0, 3).map((line) => (
                        <div key={line.id} className="flex justify-between text-xs">
                          <span className="truncate flex-1 mr-2">{line.description}</span>
                          <span className="flex-shrink-0">{line.quantity} × ${line.price.toFixed(2)}</span>
                        </div>
                      ))}
                      {order.lines.length > 3 && (
                        <p className="text-xs text-gray-500">
                          +{order.lines.length - 3} more item{order.lines.length - 3 !== 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-gray-500">No purchase orders found</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}