import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Clock, ChefHat, CheckCircle, AlertCircle } from 'lucide-react'
import { getKitchenOrders } from '@/lib/actions/pos'
import { KitchenOrderCard } from '../components/kitchen-order-card'
import { format } from 'date-fns'

export default async function KitchenDisplayPage() {
  // For demo, we'll use the first business unit
  const orders = await getKitchenOrders('cm5aqhqhj0000yzqhqhqhqhqh') // Replace with actual business unit ID

  const pendingOrders = orders.filter(order => order.status === 'Pending')
  const preparingOrders = orders.filter(order => order.status === 'Preparing')
  const readyOrders = orders.filter(order => order.status === 'Ready')

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <ChefHat className="h-8 w-8 text-orange-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Kitchen Display System</h1>
              <p className="text-gray-600">
                {format(new Date(), 'EEEE, MMMM do, yyyy - HH:mm')}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <span className="text-sm font-medium">{pendingOrders.length} Pending</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              <span className="text-sm font-medium">{preparingOrders.length} Preparing</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium">{readyOrders.length} Ready</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Orders */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <h2 className="text-lg font-semibold">Pending ({pendingOrders.length})</h2>
          </div>
          {pendingOrders.map((order) => (
            <KitchenOrderCard 
              key={order.id} 
              order={order} 
              status="Pending"
              statusColor="red"
            />
          ))}
        </div>

        {/* Preparing Orders */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-yellow-500" />
            <h2 className="text-lg font-semibold">Preparing ({preparingOrders.length})</h2>
          </div>
          {preparingOrders.map((order) => (
            <KitchenOrderCard 
              key={order.id} 
              order={order} 
              status="Preparing"
              statusColor="yellow"
            />
          ))}
        </div>

        {/* Ready Orders */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <h2 className="text-lg font-semibold">Ready ({readyOrders.length})</h2>
          </div>
          {readyOrders.map((order) => (
            <KitchenOrderCard 
              key={order.id} 
              order={order} 
              status="Ready"
              statusColor="green"
            />
          ))}
        </div>
      </div>
    </div>
  )
}