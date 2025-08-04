import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Monitor, 
  Users, 
  ShoppingCart, 
  DollarSign,
  ChefHat,
  Receipt,
  Settings
} from 'lucide-react'
import Link from 'next/link'
import { getPOSTerminals, getPOSOrders } from '@/lib/actions/pos'
import { format } from 'date-fns'

export default async function POSPage() {
  const terminals = await getPOSTerminals()
  const recentOrders = await getPOSOrders()

  const todayOrders = recentOrders.filter(order => {
    const today = new Date()
    const orderDate = new Date(order.docDate)
    return orderDate.toDateString() === today.toDateString()
  })

  const todaySales = todayOrders.reduce((sum, order) => sum + order.docTotal, 0)
  const activeTerminals = terminals.filter(terminal => terminal.shifts.length > 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Point of Sale</h1>
          <p className="text-gray-600 mt-2">
            Manage restaurant orders, payments, and operations
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/pos/kitchen">
            <Button variant="outline">
              <ChefHat className="mr-2 h-4 w-4" />
              Kitchen Display
            </Button>
          </Link>
          <Link href="/dashboard/pos/reports">
            <Button variant="outline">
              <Receipt className="mr-2 h-4 w-4" />
              Reports
            </Button>
          </Link>
          <Link href="/dashboard/pos/settings">
            <Button variant="outline">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today&apos;s Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${todaySales.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {todayOrders.length} orders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Terminals</CardTitle>
            <Monitor className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeTerminals.length}</div>
            <p className="text-xs text-muted-foreground">
              of {terminals.length} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Order</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${todayOrders.length > 0 ? (todaySales / todayOrders.length).toFixed(2) : '0.00'}
            </div>
            <p className="text-xs text-muted-foreground">
              per transaction
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders Today</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayOrders.length}</div>
            <p className="text-xs text-muted-foreground">
              transactions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* POS Terminals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>POS Terminals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {terminals.map((terminal) => (
                <div key={terminal.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <Monitor className="h-8 w-8 text-gray-400" />
                    <div>
                      <h3 className="font-medium">{terminal.name}</h3>
                      <p className="text-sm text-gray-600">{terminal.businessUnit.name}</p>
                      {terminal.shifts.length > 0 && (
                        <p className="text-xs text-green-600">
                          Active: {terminal.shifts[0].user.name}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={terminal.shifts.length > 0 ? 'default' : 'secondary'}>
                      {terminal.shifts.length > 0 ? 'Active' : 'Inactive'}
                    </Badge>
                    <Link href={`/dashboard/pos/terminal/${terminal.id}`}>
                      <Button size="sm">
                        Open POS
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.slice(0, 5).map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Order #{order.docNum}</p>
                    <p className="text-sm text-gray-600">
                      {order.customer?.cardName || 'Walk-in Customer'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(order.createdAt), 'HH:mm')} - {order.orderType}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${order.docTotal.toFixed(2)}</p>
                    <Badge variant={
                      order.status === 'Served' ? 'default' :
                      order.status === 'Preparing' ? 'secondary' :
                      order.status === 'Ready' ? 'outline' : 'destructive'
                    }>
                      {order.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}