'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  DollarSign, 
  ShoppingCart, 
  TrendingUp,
  Calendar,
  Download,
  Printer,
  BarChart3,
  PieChart
} from 'lucide-react'
import { getDailySalesReport, getPOSTerminals } from '@/lib/actions/pos'
import { format } from 'date-fns'
import { DailySalesReport, POSTerminalWithShifts } from '@/lib/types'

export default function POSReportsPage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedTerminal, setSelectedTerminal] = useState<string>('all')
  const [reportData, setReportData] = useState<DailySalesReport | null>(null)
  const [terminals, setTerminals] = useState<POSTerminalWithShifts[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const loadTerminals = async () => {
    try {
      const terminalList = await getPOSTerminals()
      setTerminals(terminalList)
    } catch (error) {
      console.error('Error loading terminals:', error)
    }
  }

  const generateReport = useCallback(async () => {
    setIsLoading(true)
    try {
      const date = new Date(selectedDate)
      const businessUnitId = selectedTerminal !== 'all' ? 
        terminals.find(t => t.id === selectedTerminal)?.businessUnit.id : 
        undefined

      const report = await getDailySalesReport(date, businessUnitId)
      setReportData(report)
    } catch (error) {
      console.error('Error generating report:', error)
    } finally {
      setIsLoading(false)
    }
  }, [selectedDate, selectedTerminal, terminals])

  useEffect(() => {
    loadTerminals()
  }, [])

  useEffect(() => {
    generateReport()
  }, [generateReport])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Generating report...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">POS Reports & Analytics</h1>
          <p className="text-gray-600 mt-2 text-lg">
            Sales analytics and performance metrics
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" className="h-12 px-6 border-2 hover:border-green-500 hover:bg-green-50">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" className="h-12 px-6 border-2 hover:border-blue-500 hover:bg-blue-50">
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
        </div>
      </div>

      {/* Report Filters */}
      <Card className="border-0 shadow-lg bg-white">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-800 flex items-center">
            <Calendar className="mr-3 h-6 w-6 text-blue-600" />
            Report Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">Report Date</label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="h-12"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">Terminal Filter</label>
              <Select value={selectedTerminal} onValueChange={setSelectedTerminal}>
                <SelectTrigger className="h-12">
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
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">Report Type</label>
              <Select defaultValue="daily">
                <SelectTrigger className="h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily Sales</SelectItem>
                  <SelectItem value="weekly">Weekly Summary</SelectItem>
                  <SelectItem value="monthly">Monthly Report</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button 
                onClick={generateReport} 
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 font-semibold"
                disabled={isLoading}
              >
                <BarChart3 className="mr-2 h-4 w-4" />
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
             <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-emerald-600 text-white">
               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                 <CardTitle className="text-sm font-medium text-green-100">Total Sales</CardTitle>
                 <DollarSign className="h-5 w-5 text-green-200" />
               </CardHeader>
               <CardContent>
                 <div className="text-3xl font-bold">${reportData.totalSales.toFixed(2)}</div>
                 <p className="text-xs text-green-200">
                   {format(new Date(selectedDate), 'MMM dd, yyyy')}
                 </p>
               </CardContent>
             </Card>

             <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                 <CardTitle className="text-sm font-medium text-blue-100">Total Orders</CardTitle>
                 <ShoppingCart className="h-5 w-5 text-blue-200" />
               </CardHeader>
               <CardContent>
                 <div className="text-3xl font-bold">{reportData.totalOrders}</div>
                 <p className="text-xs text-blue-200">
                   transactions
                 </p>
               </CardContent>
             </Card>

             <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                 <CardTitle className="text-sm font-medium text-purple-100">Average Order</CardTitle>
                 <TrendingUp className="h-5 w-5 text-purple-200" />
               </CardHeader>
               <CardContent>
                 <div className="text-3xl font-bold">${reportData.averageOrderValue.toFixed(2)}</div>
                 <p className="text-xs text-purple-200">
                   per transaction
                 </p>
               </CardContent>
             </Card>

             <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-500 to-red-500 text-white">
               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                 <CardTitle className="text-sm font-medium text-orange-100">Payment Methods</CardTitle>
                 <PieChart className="h-5 w-5 text-orange-200" />
               </CardHeader>
               <CardContent>
                 <div className="text-3xl font-bold">{reportData.salesByPaymentMethod.length}</div>
                 <p className="text-xs text-orange-200">
                   methods used
                 </p>
               </CardContent>
             </Card>
           </div>

           {/* Payment Breakdown */}
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             <Card className="border-0 shadow-xl bg-white">
               <CardHeader>
                 <CardTitle className="text-xl font-bold text-gray-800 flex items-center">
                   <PieChart className="mr-3 h-6 w-6 text-blue-600" />
                   Payment Method Breakdown
                 </CardTitle>
               </CardHeader>
               <CardContent>
                 <div className="space-y-4">
                   {reportData.salesByPaymentMethod.map((payment) => (
                     <div key={payment.paymentMethod} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                       <div className="flex items-center space-x-3">
                         <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                         <span className="font-semibold text-gray-800">{payment.paymentMethod}</span>
                       </div>
                       <div className="text-right">
                         <div className="font-bold text-gray-800">${payment.amount.toFixed(2)}</div>
                         <div className="text-xs text-gray-500">
                           {((payment.amount / reportData.totalSales) * 100).toFixed(1)}%
                         </div>
                       </div>
                     </div>
                   ))}
                 </div>
               </CardContent>
             </Card>

             <Card className="border-0 shadow-xl bg-white">
               <CardHeader>
                 <CardTitle className="text-xl font-bold text-gray-800 flex items-center">
                   <TrendingUp className="mr-3 h-6 w-6 text-green-600" />
                   Sales by Category
                 </CardTitle>
               </CardHeader>
               <CardContent>
                 <div className="space-y-4">
                   {reportData.salesByCategory.slice(0, 5).map((category, index) => (
                     <div key={category.category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                       <div className="flex items-center space-x-2">
                         <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                           index === 0 ? 'bg-yellow-500' :
                           index === 1 ? 'bg-gray-400' :
                           index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                         }`}>
                           {index + 1}
                         </div>
                         <div>
                           <p className="font-semibold text-gray-800">{category.category}</p>
                           <p className="text-xs text-gray-500">{category.quantity} items</p>
                         </div>
                       </div>
                       <div className="text-right">
                         <p className="font-bold text-green-600">${category.amount.toFixed(2)}</p>
                         <p className="text-xs text-gray-500">{((category.amount / reportData.totalSales) * 100).toFixed(1)}%</p>
                       </div>
                     </div>
                   ))}
                 </div>
               </CardContent>
             </Card>
           </div>
         </>
       )}
    </div>
  )
}