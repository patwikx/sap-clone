import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, ChefHat, CheckCircle, AlertCircle } from 'lucide-react'
import { getKitchenOrders } from '@/lib/actions/pos'
import { format } from 'date-fns'
import { KitchenOrderData } from '@/lib/types'
import { KitchenOrderCard } from '../components/kitchen-order-card'

export default async function KitchenDisplayPage() {
  // For demo, we'll use the first business unit
  const ordersData = await getKitchenOrders() // Get all kitchen orders
  
  // Transform the data to match our KitchenOrderData type
  const orders: KitchenOrderData[] = ordersData.map(order => ({
    id: order.id,
    number: order.number,
    createdAt: order.createdAt,
    status: order.status,
    orderType: order.orderType,
    customer: order.customer ? {
      id: order.customer.id,
      code: order.customer.name,
      name: order.customer.name,
      type: 'CUSTOMER',
      email: undefined,
      phone: undefined
    } : null,
    table: order.table ? {
      id: order.table.id,
      number: order.table.number
    } : null,
    lines: order.lines.map(line => ({
      id: line.id,
      code: line.item.name,
      description: line.description,
      quantity: Number(line.quantity)
    }))
  }))

  const pendingOrders = orders.filter(order => order.status === 'Pending')
  const preparingOrders = orders.filter(order => order.status === 'Preparing')
  const readyOrders = orders.filter(order => order.status === 'Ready')

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-orange-100 p-3 rounded-full">
              <ChefHat className="h-8 w-8 text-orange-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Kitchen Display System</h1>
              <p className="text-gray-600 text-lg">
                {format(new Date(), 'EEEE, MMMM do, yyyy - HH:mm')}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="bg-red-100 p-2 rounded-full">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{pendingOrders.length}</div>
                <div className="text-xs text-gray-600">Pending</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="bg-yellow-100 p-2 rounded-full">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{preparingOrders.length}</div>
                <div className="text-xs text-gray-600">Preparing</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="bg-green-100 p-2 rounded-full">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{readyOrders.length}</div>
                <div className="text-xs text-gray-600">Ready</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Pending Orders */}
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-red-500">
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-6 w-6 text-red-500" />
              <h2 className="text-xl font-bold text-gray-800">Pending Orders</h2>
              <Badge variant="destructive" className="ml-auto">
                {pendingOrders.length}
              </Badge>
            </div>
          </div>
          {pendingOrders.map((order) => (
            <KitchenOrderCard
              key={order.id} 
              order={order} 
              status="Pending"
              statusColor="red"
            />
          ))}
          {pendingOrders.length === 0 && (
            <Card className="border-dashed border-2 border-gray-300">
              <CardContent className="p-8 text-center">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">No pending orders</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Preparing Orders */}
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-yellow-500">
            <div className="flex items-center space-x-3">
              <Clock className="h-6 w-6 text-yellow-500" />
              <h2 className="text-xl font-bold text-gray-800">Preparing Orders</h2>
              <Badge variant="secondary" className="ml-auto">
                {preparingOrders.length}
              </Badge>
            </div>
          </div>
          {preparingOrders.map((order) => (
            <KitchenOrderCard 
              key={order.id} 
              order={order} 
              status="Preparing"
              statusColor="yellow"
            />
          ))}
          {preparingOrders.length === 0 && (
            <Card className="border-dashed border-2 border-gray-300">
              <CardContent className="p-8 text-center">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">No orders in preparation</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Ready Orders */}
        <div className="space-y-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-green-500">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-6 w-6 text-green-500" />
              <h2 className="text-xl font-bold text-gray-800">Ready Orders</h2>
              <Badge variant="default" className="ml-auto bg-green-600">
                {readyOrders.length}
              </Badge>
            </div>
          </div>
          {readyOrders.map((order) => (
            <KitchenOrderCard 
              key={order.id} 
              order={order} 
              status="Ready"
              statusColor="green"
            />
          ))}
          {readyOrders.length === 0 && (
            <Card className="border-dashed border-2 border-gray-300">
              <CardContent className="p-8 text-center">
                <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">No orders ready</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}