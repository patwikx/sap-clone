import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Monitor,
  ShoppingCart, 
  DollarSign,
  ChefHat,
  Receipt,
  Settings,
  TrendingUp,
  Clock
} from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { POSTerminalWithShifts, POSOrderWithDetails } from '@/lib/types'
import { getPOSOrders, getPOSTerminals } from '@/lib/actions/pos'

export default async function POSPage() {
  const terminals: POSTerminalWithShifts[] = await getPOSTerminals()
  const recentOrdersData = await getPOSOrders()
  
  // Transform to POSOrderWithDetails type
  const recentOrders: POSOrderWithDetails[] = recentOrdersData

  const todayOrders = recentOrders.filter(order => {
    const today = new Date()
    const orderDate = new Date(order.orderDate)
    return orderDate.toDateString() === today.toDateString()
  })

  const todaySales = todayOrders.reduce((sum, order) => sum + Number(order.totalAmount), 0)
  const activeTerminals = terminals.filter(terminal => terminal.shifts.length > 0)

  return (
    <div className="space-y-8 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Point of Sale System</h1>
          <p className="text-gray-600 mt-2 text-lg">
            Manage restaurant orders, payments, and operations
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/pos/kitchen">
            <Button variant="outline" className="h-12 px-6 border-2 hover:border-orange-500 hover:bg-orange-50">
              <ChefHat className="mr-2 h-4 w-4" />
              Kitchen Display
            </Button>
          </Link>
          <Link href="/pos/reports">
            <Button variant="outline" className="h-12 px-6 border-2 hover:border-blue-500 hover:bg-blue-50">
              <Receipt className="mr-2 h-4 w-4" />
              Reports
            </Button>
          </Link>
          <Link href="/pos/settings">
            <Button variant="outline" className="h-12 px-6 border-2 hover:border-gray-500 hover:bg-gray-50">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-emerald-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-100">Today&apos;s Sales</CardTitle>
            <DollarSign className="h-5 w-5 text-green-200" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₱{todaySales.toFixed(2)}</div>
            <p className="text-xs text-green-200">
              {todayOrders.length} orders
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-100">Active Terminals</CardTitle>
            <Monitor className="h-5 w-5 text-blue-200" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activeTerminals.length}</div>
            <p className="text-xs text-blue-200">
              of {terminals.length} total
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-100">Average Order</CardTitle>
            <TrendingUp className="h-5 w-5 text-purple-200" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ₱{todayOrders.length > 0 ? (todaySales / todayOrders.length).toFixed(2) : '0.00'}
            </div>
            <p className="text-xs text-purple-200">
              per transaction
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-500 to-red-500 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-100">Orders Today</CardTitle>
            <ShoppingCart className="h-5 w-5 text-orange-200" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{todayOrders.length}</div>
            <p className="text-xs text-orange-200">
              transactions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* POS Terminals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-xl bg-white">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-800 flex items-center">
              <Monitor className="mr-3 h-6 w-6 text-blue-600" />
              POS Terminals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {terminals.map((terminal) => (
                <div key={terminal.id} className="flex items-center justify-between p-4 border-2 rounded-lg hover:border-blue-300 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-full ${terminal.shifts.length > 0 ? 'bg-green-100' : 'bg-gray-100'}`}>
                      <Monitor className={`h-6 w-6 ${terminal.shifts.length > 0 ? 'text-green-600' : 'text-gray-400'}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{terminal.name}</h3>
                      <p className="text-sm text-gray-500">{terminal.businessUnit.name}</p>
                      {terminal.shifts.length > 0 && terminal.shifts[0].user.employee && (
                        <div className="flex items-center mt-1">
                          <Clock className="h-3 w-3 text-green-600 mr-1" />
                          <p className="text-xs text-green-600 font-medium">
                            {terminal.shifts[0].user.employee.firstName} {terminal.shifts[0].user.employee.lastName}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant={terminal.shifts.length > 0 ? 'default' : 'secondary'}
                      className={terminal.shifts.length > 0 ? 'bg-green-600' : ''}
                    >
                      {terminal.shifts.length > 0 ? 'Active' : 'Inactive'}
                    </Badge>
                    <Link href={`/pos/terminal/${terminal.id}`}>
                      <Button 
                        size="sm" 
                        className="bg-blue-600 hover:bg-blue-700 px-4 py-2"
                      >
                        Open POS
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
              {terminals.length === 0 && (
                <div className="text-center py-8">
                  <Monitor className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No POS terminals configured</p>
                  <Link href="/pos/settings">
                    <Button variant="outline" className="mt-2">
                      <Settings className="mr-2 h-4 w-4" />
                      Configure Terminals
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card className="border-0 shadow-xl bg-white">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-800 flex items-center">
              <Receipt className="mr-3 h-6 w-6 text-green-600" />
              Recent Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentOrders.slice(0, 5).map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                  <div>
                    <p className="font-semibold text-gray-800">Order #{order.number}</p>
                    <p className="text-sm text-gray-500">
                      {order.customer?.name || 'Walk-in Customer'}
                    </p>
                    <p className="text-xs text-gray-400">
                      {format(new Date(order.createdAt), 'HH:mm')} - {order.orderType}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600 text-lg">₱{Number(order.totalAmount).toFixed(2)}</p>
                    <Badge variant={
                      order.status === 'Served' ? 'default' :
                      order.status === 'Preparing' ? 'secondary' :
                      order.status === 'Ready' ? 'outline' : 'destructive'
                    } className="mt-1">
                      {order.status}
                    </Badge>
                  </div>
                </div>
              ))}
              {recentOrders.length === 0 && (
                <div className="text-center py-8">
                  <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No recent orders</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}