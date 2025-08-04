'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  DollarSign, 
  ShoppingCart, 
  TrendingUp, 
  Users,
  Calendar,
  Download,
  Printer
} from 'lucide-react'
import { getDailySalesReport, getPOSShiftReport, getPOSTerminals } from '@/lib/actions/pos'
import { format } from 'date-fns'

export default function POSReportsPage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedTerminal, setSelectedTerminal] = useState<string>('all')
  const [reportData, setReportData] = useState<any>(null)
  const [terminals, setTerminals] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadTerminals()
    generateReport()
  }, [])

  useEffect(() => {
    generateReport()
  }, [selectedDate, selectedTerminal])

  const loadTerminals = async () => {
    const terminalList = await getPOSTerminals()
    setTerminals(terminalList)
  }

  const generateReport = async () => {
    setIsLoading(true)
    try {
      const date = new Date(selectedDate)
      const businessUnitId = selectedTerminal !== 'all' ? 
        terminals.find(t => t.id === selectedTerminal)?.businessUnitId : 
        undefined

      const report = await getDailySalesReport(date, businessUnitId)
      setReportData(report)
    } catch (error) {
      console.error('Error generating report:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Loading report...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">POS Reports</h1>
          <p className="text-gray-600 mt-2">
            Sales analytics and performance metrics
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="outline">
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
        </div>
      </div>

      {/* Report Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Report Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Date</label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Terminal</label>
              <Select value={selectedTerminal} onValueChange={setSelectedTerminal}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Terminals</SelectItem>
                  {terminals.map((terminal) => (
                    <SelectItem key={terminal.id} value={terminal.id}>
                      {terminal.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={generateReport} className="w-full">
                Generate Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {reportData && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${reportData.totalSales.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(selectedDate), 'MMM dd, yyyy')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reportData.totalOrders}</div>
                <p className="text-xs text-muted-foreground">
                  transactions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Order</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${reportData.averageOrderValue.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  per transaction
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Payment Methods</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Object.keys(reportData.paymentBreakdown).length}</div>
                <p className="text-xs text-muted-foreground">
                  methods used
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Payment Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment Method Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(reportData.paymentBreakdown).map(([method, amount]: [string, any]) => (
                    <div key={method} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{method}</span>
                      <span className="text-sm">${amount.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Selling Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {reportData.topItems.slice(0, 5).map((item: any, index: number) => (
                    <div key={item.itemCode} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold text-gray-400">#{index + 1}</span>
                        <div>
                          <p className="text-sm font-medium">{item.description}</p>
                          <p className="text-xs text-gray-600">{item.itemCode}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">${item.revenue.toFixed(2)}</p>
                        <p className="text-xs text-gray-600">{item.quantity} sold</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {reportData.orders.slice(0, 10).map((order: any) => (
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
                      <p className="text-xs text-gray-600">{order.lines.length} items</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}