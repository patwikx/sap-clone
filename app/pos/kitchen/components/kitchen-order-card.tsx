'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Clock, User, MapPin } from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import { updateOrderStatus } from '@/lib/actions/pos'
import { toast } from 'sonner'

interface KitchenOrderCardProps {
  order: any
  status: 'Pending' | 'Preparing' | 'Ready'
  statusColor: 'red' | 'yellow' | 'green'
}

export function KitchenOrderCard({ order, status, statusColor }: KitchenOrderCardProps) {
  const handleStatusUpdate = async (newStatus: 'Preparing' | 'Ready' | 'Served') => {
    try {
      const result = await updateOrderStatus(order.id, newStatus)
      if (result.success) {
        toast.success(`Order marked as ${newStatus.toLowerCase()}`)
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      toast.error('Failed to update order status')
    }
  }

  const getStatusBadgeVariant = () => {
    switch (statusColor) {
      case 'red': return 'destructive'
      case 'yellow': return 'secondary'
      case 'green': return 'default'
      default: return 'default'
    }
  }

  const getNextAction = () => {
    switch (status) {
      case 'Pending': return { label: 'Start Cooking', action: 'Preparing' as const }
      case 'Preparing': return { label: 'Mark Ready', action: 'Ready' as const }
      case 'Ready': return { label: 'Mark Served', action: 'Served' as const }
    }
  }

  const nextAction = getNextAction()
  const orderAge = formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })

  return (
    <Card className={`border-l-4 ${
      statusColor === 'red' ? 'border-l-red-500' :
      statusColor === 'yellow' ? 'border-l-yellow-500' :
      'border-l-green-500'
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Order #{order.docNum}</CardTitle>
          <Badge variant={getStatusBadgeVariant()}>
            {status}
          </Badge>
        </div>
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <div className="flex items-center">
            <Clock className="mr-1 h-3 w-3" />
            {orderAge}
          </div>
          <div className="flex items-center">
            <User className="mr-1 h-3 w-3" />
            {order.customer?.cardName || 'Walk-in'}
          </div>
          {order.table && (
            <div className="flex items-center">
              <MapPin className="mr-1 h-3 w-3" />
              {order.table.tableNumber}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Order Items */}
          <div className="space-y-2">
            {order.lines.map((line: any) => (
              <div key={line.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <div>
                  <p className="font-medium text-sm">{line.description}</p>
                  <p className="text-xs text-gray-600">{line.itemCode}</p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-lg">{line.quantity}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Order Type */}
          <div className="flex items-center justify-between pt-2 border-t">
            <span className="text-sm text-gray-600">Type:</span>
            <Badge variant="outline">{order.orderType}</Badge>
          </div>

          {/* Action Button */}
          <Button 
            className="w-full mt-4"
            onClick={() => handleStatusUpdate(nextAction.action)}
            variant={statusColor === 'green' ? 'default' : 'outline'}
          >
            {nextAction.label}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}