
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Building2,
  Package,
  Users,
  ShoppingCart,
  FileText,
  Wrench,
  AlertTriangle,
  TrendingUp,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { StatsCard } from '@/components/stats-card'
import { getDashboardStats } from '@/lib/dashboard'

export default async function DashboardPage() {
  const { stats, recentActivity, alerts } = await getDashboardStats()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome to your business management dashboard</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <StatsCard
          title="Business Partners"
          value={stats.businessPartners}
          description="Total registered partners"
          icon={Building2}
        />
        <StatsCard
          title="Items"
          value={stats.items}
          description="Items in inventory"
          icon={Package}
        />
        <StatsCard
          title="Employees"
          value={stats.employees}
          description="Active employees"
          icon={Users}
        />
        <StatsCard
          title="Open Sales Orders"
          value={stats.openSalesOrders}
          description="Pending orders"
          icon={TrendingUp}
        />
        <StatsCard
          title="Open Purchase Orders"
          value={stats.openPurchaseOrders}
          description="Pending purchases"
          icon={ShoppingCart}
        />
        <StatsCard
          title="Open Service Calls"
          value={stats.openServiceCalls}
          description="Active service requests"
          icon={Wrench}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Sales Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Recent Sales Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.salesOrders.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No recent sales orders</p>
              ) : (
                recentActivity.salesOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">SO-{order.docNum}</p>
                      <p className="text-sm text-gray-600">{order.businessPartner.cardName}</p>
                      <p className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${order.docTotal.toFixed(2)}</p>
                      <Badge variant={order.docStatus === 'O' ? 'default' : 'secondary'}>
                        {order.docStatus === 'O' ? 'Open' : order.docStatus === 'C' ? 'Closed' : 'Cancelled'}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Purchase Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ShoppingCart className="mr-2 h-5 w-5" />
              Recent Purchase Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.purchaseOrders.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No recent purchase orders</p>
              ) : (
                recentActivity.purchaseOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">PO-{order.docNum}</p>
                      <p className="text-sm text-gray-600">{order.businessPartner.cardName}</p>
                      <p className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(order.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${order.docTotal.toFixed(2)}</p>
                      <Badge variant={order.docStatus === 'O' ? 'default' : 'secondary'}>
                        {order.docStatus === 'O' ? 'Open' : order.docStatus === 'C' ? 'Closed' : 'Cancelled'}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {alerts.lowStockItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-orange-600">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Low Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {alerts.lowStockItems.map((item) => (
                <div key={item.id} className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="font-medium text-orange-900">{item.itemName}</p>
                  <p className="text-sm text-orange-700">Code: {item.itemCode}</p>
                  <p className="text-sm text-orange-700">Stock: {item.onHand} units</p>
                  <p className="text-xs text-orange-600">Group: {item.itemGroup.groupName}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}