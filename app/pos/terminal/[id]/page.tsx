'use client'

import { useState, useEffect, useCallback, use } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Monitor, 
  Clock, 
  DollarSign, 
  ShoppingCart, 
  User,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Plus
} from 'lucide-react'
import { toast } from 'sonner'
import { getPOSTerminalById, getRecentOrdersByTerminal, startPOSShift } from '@/lib/actions/pos'
import { getUsers } from '@/lib/actions/user'
import { POSTerminalWithShifts, POSOrderWithDetails } from '@/lib/types'
import { format } from 'date-fns'
import Link from 'next/link'

interface TerminalPageProps {
  params: Promise<{
    id: string
  }>
}

export default function TerminalPage({ params }: TerminalPageProps) {
  const resolvedParams = use(params) as { id: string }
  const [terminal, setTerminal] = useState<POSTerminalWithShifts | null>(null)
  const [recentOrders, setRecentOrders] = useState<POSOrderWithDetails[]>([])
  const [users, setUsers] = useState<Array<{ id: string; name: string; email: string }>>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isShiftDialogOpen, setIsShiftDialogOpen] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState('')
  const [startAmount, setStartAmount] = useState('0.00')
  const [isCreatingShift, setIsCreatingShift] = useState(false)

  const loadTerminalData = useCallback(async () => {
    try {
      const [terminalData, ordersData, usersData] = await Promise.all([
        getPOSTerminalById(resolvedParams.id),
        getRecentOrdersByTerminal(resolvedParams.id, 10),
        getUsers()
      ])
      
      setTerminal(terminalData)
      setRecentOrders(ordersData)
      setUsers(usersData)
    } catch (error) {
      console.error('Error loading terminal data:', error)
      toast.error('Failed to load terminal data')
    } finally {
      setIsLoading(false)
    }
  }, [resolvedParams.id])

  const refreshData = async () => {
    setIsRefreshing(true)
    await loadTerminalData()
    setIsRefreshing(false)
    toast.success('Data refreshed')
  }

  const handleCreateShift = async () => {
    if (!selectedUserId || !startAmount) {
      toast.error('Please select a user and enter start amount')
      return
    }

    setIsCreatingShift(true)
    try {
      const result = await startPOSShift(resolvedParams.id, selectedUserId, parseFloat(startAmount))
      
      if (result.success) {
        toast.success('Shift started successfully')
        setIsShiftDialogOpen(false)
        setSelectedUserId('')
        setStartAmount('0.00')
        await loadTerminalData() // Refresh data to show new shift
      } else {
        toast.error(result.error || 'Failed to start shift')
      }
    } catch (error) {
      console.error('Error creating shift:', error)
      toast.error('Failed to start shift')
    } finally {
      setIsCreatingShift(false)
    }
  }

  useEffect(() => {
    loadTerminalData()
  }, [loadTerminalData])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading terminal data...</p>
        </div>
      </div>
    )
  }

  if (!terminal) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Terminal Not Found</h2>
          <p className="text-gray-600">The requested terminal could not be found.</p>
        </div>
      </div>
    )
  }

  const currentShift = terminal.shifts.find((shift) => !shift.endTime)
  const todayOrders = recentOrders.filter(order => {
    const orderDate = new Date(order.orderDate)
    const today = new Date()
    return orderDate.toDateString() === today.toDateString()
  })

  const todaySales = todayOrders.reduce((sum, order) => sum + Number(order.totalAmount), 0)
  const averageOrderValue = todayOrders.length > 0 ? todaySales / todayOrders.length : 0

  return (
    <div className="space-y-8 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 flex items-center">
            <Monitor className="mr-3 h-8 w-8 text-blue-600" />
            {terminal.name}
          </h1>
          <p className="text-gray-600 mt-2 text-lg">
            {terminal.businessUnit.name} • Terminal Details
          </p>
        </div>
        <div className="flex gap-3">
          {currentShift ? (
            <Link href={`/pos/interface/${terminal.id}`}>
              <Button 
                className="h-12 px-6 bg-green-600 hover:bg-green-700"
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                Start POS Session
              </Button>
            </Link>
          ) : (
            <Dialog open={isShiftDialogOpen} onOpenChange={setIsShiftDialogOpen}>
              <DialogTrigger asChild>
                <Button className="h-12 px-6 bg-blue-600 hover:bg-blue-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Start New Shift
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Start New Shift</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="user">Select User</Label>
                    <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a user" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name} ({user.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="startAmount">Start Amount (₱)</Label>
                    <Input
                      id="startAmount"
                      type="number"
                      step="0.01"
                      value={startAmount}
                      onChange={(e) => setStartAmount(e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsShiftDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateShift}
                      disabled={isCreatingShift || !selectedUserId || !startAmount}
                    >
                      {isCreatingShift ? 'Starting...' : 'Start Shift'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
          <Button 
            onClick={refreshData} 
            disabled={isRefreshing}
            variant="outline"
            className="h-12 px-6"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Terminal Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-100">Terminal Status</CardTitle>
            <Monitor className="h-5 w-5 text-blue-200" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <CheckCircle className="mr-1 h-3 w-3" />
                Active
              </Badge>
            </div>
            <p className="text-xs text-blue-200 mt-2">
              Last updated: {format(new Date(), "HH:mm:ss")}
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-emerald-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-100">Today&apos;s Sales</CardTitle>
            <DollarSign className="h-5 w-5 text-green-200" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₱{todaySales.toFixed(2)}</div>
            <p className="text-xs text-green-200">
              {todayOrders.length} orders today
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-100">Average Order</CardTitle>
            <TrendingUp className="h-5 w-5 text-purple-200" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₱{averageOrderValue.toFixed(2)}</div>
            <p className="text-xs text-purple-200">
              per transaction
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-500 to-red-500 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-100">Current Shift</CardTitle>
            <Clock className="h-5 w-5 text-orange-200" />
          </CardHeader>
          <CardContent>
            {currentShift ? (
              <>
                <div className="text-2xl font-bold">
                  {currentShift.user.employee?.firstName} {currentShift.user.employee?.lastName}
                </div>
                <p className="text-xs text-orange-200">
                  Started: {format(new Date(currentShift.startTime), 'HH:mm')}
                </p>
              </>
            ) : (
              <>
                <div className="text-2xl font-bold">No Active Shift</div>
                <p className="text-xs text-orange-200">
                  Terminal is available
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Terminal Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-xl bg-white">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-800 flex items-center">
              <Monitor className="mr-3 h-6 w-6 text-blue-600" />
              Terminal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Terminal Name</label>
                <p className="text-lg font-semibold text-gray-800">{terminal.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Business Unit</label>
                <p className="text-lg font-semibold text-gray-800">{terminal.businessUnit.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Terminal ID</label>
                <p className="text-sm font-mono text-gray-600">{terminal.id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Active
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-white">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-800 flex items-center">
              <Clock className="mr-3 h-6 w-6 text-green-600" />
              Shift Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentShift ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center space-x-3">
                    <User className="h-8 w-8 text-green-600" />
                    <div>
                      <p className="font-semibold text-gray-800">
                        {currentShift.user.employee?.firstName} {currentShift.user.employee?.lastName}
                      </p>
                      <p className="text-sm text-gray-600">{currentShift.user.email}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                    Active
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="text-gray-500">Start Time</label>
                    <p className="font-semibold">{format(new Date(currentShift.startTime), 'MMM dd, yyyy HH:mm')}</p>
                  </div>
                  <div>
                    <label className="text-gray-500">Start Amount</label>
                    <p className="font-semibold">₱{Number(currentShift.startAmount).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">No active shift</p>
                <p className="text-sm text-gray-500 mt-1">Terminal is available for new shift</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card className="border-0 shadow-xl bg-white">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-800 flex items-center">
            <ShoppingCart className="mr-3 h-6 w-6 text-purple-600" />
            Recent Orders
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentOrders.length > 0 ? (
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <ShoppingCart className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">Order #{order.number}</p>
                      <p className="text-sm text-gray-600">
                        {format(new Date(order.orderDate), 'MMM dd, yyyy HH:mm')}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {order.orderType}
                        </Badge>
                        {order.customer && (
                          <Badge variant="outline" className="text-xs">
                            {order.customer.name}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-800">₱{Number(order.totalAmount).toFixed(2)}</p>
                    <p className="text-xs text-gray-500">{order.lines.length} items</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">No recent orders</p>
              <p className="text-sm text-gray-500 mt-1">Orders will appear here once created</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
