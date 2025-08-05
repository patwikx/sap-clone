'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Clock, User, MapPin, Utensils, CheckCircle, AlertCircle } from 'lucide-react'
import { KitchenOrderData } from '@/lib/types'

interface KitchenOrderCardProps {
  order: KitchenOrderData
  status: 'Pending' | 'Preparing' | 'Ready'
  statusColor: 'red' | 'yellow' | 'green'
}

export function KitchenOrderCard({ order, status, statusColor }: KitchenOrderCardProps) {
  const getStatusIcon = () => {
    switch (status) {
      case 'Pending':
        return <AlertCircle className="h-5 w-5 text-red-500" />
      case 'Preparing':
        return <Clock className="h-5 w-5 text-yellow-500" />
      case 'Ready':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusBadgeVariant = () => {
    switch (status) {
      case 'Pending':
        return 'destructive'
      case 'Preparing':
        return 'secondary'
      case 'Ready':
        return 'default'
      default:
        return 'outline'
    }
  }

  const getBorderColor = () => {
    switch (statusColor) {
      case 'red':
        return 'border-l-red-500'
      case 'yellow':
        return 'border-l-yellow-500'
      case 'green':
        return 'border-l-green-500'
      default:
        return 'border-l-gray-500'
    }
  }

  const getTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d ago`
  }

  return (
    <Card className={`border-l-4 ${getBorderColor()} shadow-md hover:shadow-lg transition-all duration-200 bg-white`}>
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            {getStatusIcon()}
            <div>
              <h3 className="font-bold text-lg text-gray-800">Order #{order.number}</h3>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Clock className="h-3 w-3" />
                <span>{getTimeAgo(order.createdAt)}</span>
              </div>
            </div>
          </div>
          <Badge variant={getStatusBadgeVariant()} className="text-xs font-semibold">
            {status}
          </Badge>
        </div>

        {/* Customer & Table Info */}
        <div className="flex items-center justify-between mb-4 text-sm">
          <div className="flex items-center space-x-2 text-gray-600">
            <User className="h-4 w-4" />
            <span className="font-medium">
              {order.customer?.name || 'Walk-in Customer'}
            </span>
          </div>
          {order.table && (
            <div className="flex items-center space-x-2 text-gray-600">
              <MapPin className="h-4 w-4" />
              <span className="font-medium">Table {order.table.number}</span>
            </div>
          )}
        </div>

        {/* Order Type */}
        <div className="mb-4">
          <Badge variant="outline" className="text-xs">
            {order.orderType}
          </Badge>
        </div>

        {/* Order Items */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center space-x-2 text-sm font-medium text-gray-700">
            <Utensils className="h-4 w-4" />
            <span>Order Items</span>
          </div>
          <div className="space-y-1">
            {order.lines.map((line) => (
              <div key={line.id} className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded">
                <div className="flex-1">
                  <span className="font-medium text-gray-800">{line.description}</span>
                  <span className="text-xs text-gray-500 ml-2">({line.code})</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs font-bold bg-white">
                    x{line.quantity}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          {status === 'Pending' && (
            <>
              <Button 
                size="sm" 
                className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white"
              >
                Start Preparing
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="px-3 border-red-300 text-red-600 hover:bg-red-50"
              >
                Reject
              </Button>
            </>
          )}
          {status === 'Preparing' && (
            <>
              <Button 
                size="sm" 
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                Mark Ready
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="px-3 border-gray-300 hover:bg-gray-50"
              >
                Pause
              </Button>
            </>
          )}
          {status === 'Ready' && (
            <>
              <Button 
                size="sm" 
                variant="outline" 
                className="flex-1 border-green-500 text-green-600 hover:bg-green-50"
              >
                Served
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="px-3 border-blue-300 text-blue-600 hover:bg-blue-50"
              >
                Print
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 