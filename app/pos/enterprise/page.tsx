'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { 
  Users, 
  Plus, 
  Minus, 
  Trash2, 
  Send, 
  Receipt, 
  CreditCard,
  DollarSign,
  Search,
  ChefHat,
  Clock,
  CheckCircle,
  AlertTriangle,
  X,
  Calculator,
  Split,
  LogOut
} from 'lucide-react'
import { toast } from 'sonner'
import { 
  getRestaurantTables,
  getMenuItems,
  getPaymentMethods,
  createPOSOrder,
  updateTableStatus,
  getCurrentShift,
  endPOSShift,
  voidPOSOrder
} from '@/lib/actions/pos'
import { 
  RestaurantTableWithDetails,
  MenuItemWithDetails,
  PaymentMethodData,
  CartItem,
  POSShiftWithDetails
} from '@/lib/types'

// Types
interface OrderItem extends CartItem {
  id?: string
  status: 'draft' | 'sent' | 'voided'
  sentAt?: Date
  voidReason?: string
}

interface TableData extends RestaurantTableWithDetails {
  currentOrder?: {
    items: OrderItem[]
    subtotal: number
    tax: number
    total: number
    status: 'active' | 'bill_out'
  }
}

type PaymentMethod = 'CASH' | 'CARD' | 'GCASH' | 'ROOM_CHARGE'

interface PaymentData {
  method: PaymentMethod
  amount: number
  tendered?: number
  change?: number
}

export default function EnterprisePOSPage() {
  // State Management
  const [currentView, setCurrentView] = useState<'tables' | 'order'>('tables')
  const [tables, setTables] = useState<TableData[]>([])
  const [selectedTable, setSelectedTable] = useState<TableData | null>(null)
  const [menuItems, setMenuItems] = useState<MenuItemWithDetails[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodData[]>([])
  const [currentShift, setCurrentShift] = useState<POSShiftWithDetails | null>(null)
  
  // Order Management
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  
  // Dialog States
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [showVoidDialog, setShowVoidDialog] = useState(false)
  const [showSplitDialog, setShowSplitDialog] = useState(false)
  const [showEndShiftDialog, setShowEndShiftDialog] = useState(false)
  
  // Payment State
  const [paymentData, setPaymentData] = useState<PaymentData>({
    method: 'CASH',
    amount: 0
  })
  
  // Void State
  const [voidingItem, setVoidingItem] = useState<OrderItem | null>(null)
  const [voidReason, setVoidReason] = useState('')

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [tablesData, menuData, paymentData] = await Promise.all([
          getRestaurantTables(),
          getMenuItems(),
          getPaymentMethods()
        ])
        
        // Transform tables data
        const transformedTables: TableData[] = tablesData.map(table => ({
          ...table,
          currentOrder: undefined // Will be loaded separately if needed
        }))
        
        setTables(transformedTables)
        setMenuItems(menuData)
        setPaymentMethods(paymentData)
      } catch (error) {
        console.error('Error loading POS data:', error)
        toast.error('Failed to load POS data')
      }
    }

    loadData()
  }, [])

  // Get unique categories
  const categories = ['All', ...new Set(menuItems.map(item => item.type))]

  // Filter menu items
  const filteredMenuItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.code.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || item.type === selectedCategory
    return matchesSearch && matchesCategory && item.isActive
  })

  // Calculate order totals
  const calculateTotals = useCallback((items: OrderItem[]) => {
    const activeItems = items.filter(item => item.status !== 'voided')
    const subtotal = activeItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const tax = subtotal * 0.12 // 12% VAT
    const total = subtotal + tax
    
    return { subtotal, tax, total }
  }, [])

  const { subtotal, tax, total } = calculateTotals(orderItems)

  // Table Management
  const handleTableSelect = (table: TableData) => {
    setSelectedTable(table)
    setOrderItems(table.currentOrder?.items || [])
    setCurrentView('order')
  }

  const getTableStatusColor = (status: string, hasOrder: boolean) => {
    if (status === 'OCCUPIED' || hasOrder) return 'bg-orange-100 border-orange-500 text-orange-800'
    if (status === 'BILL_OUT') return 'bg-red-100 border-red-500 text-red-800'
    return 'bg-green-100 border-green-500 text-green-800'
  }

  const getTableStatusText = (status: string, hasOrder: boolean) => {
    if (status === 'BILL_OUT') return 'Bill Out'
    if (status === 'OCCUPIED' || hasOrder) return 'Occupied'
    return 'Available'
  }

  // Order Management
  const addItemToOrder = (menuItem: MenuItemWithDetails) => {
    setOrderItems(prev => {
      const existingItem = prev.find(item => 
        item.itemCode === menuItem.code && item.status === 'draft'
      )
      
      if (existingItem) {
        return prev.map(item =>
          item === existingItem
            ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price }
            : item
        )
      } else {
        const newItem: OrderItem = {
          itemCode: menuItem.code,
          description: menuItem.name,
          price: Number(menuItem.price),
          quantity: 1,
          total: Number(menuItem.price),
          status: 'draft',
          tableId: selectedTable?.id
        }
        return [...prev, newItem]
      }
    })
  }

  const updateItemQuantity = (item: OrderItem, newQuantity: number) => {
    if (item.status === 'sent') {
      toast.error('Cannot modify sent items. Use void if necessary.')
      return
    }
    
    if (newQuantity <= 0) {
      removeItem(item)
    } else {
      setOrderItems(prev =>
        prev.map(orderItem =>
          orderItem === item
            ? { ...orderItem, quantity: newQuantity, total: newQuantity * orderItem.price }
            : orderItem
        )
      )
    }
  }

  const removeItem = (item: OrderItem) => {
    if (item.status === 'sent') {
      toast.error('Cannot remove sent items. Use void if necessary.')
      return
    }
    
    setOrderItems(prev => prev.filter(orderItem => orderItem !== item))
  }

  // Send Order to Kitchen
  const sendOrderToKitchen = async () => {
    const draftItems = orderItems.filter(item => item.status === 'draft')
    
    if (draftItems.length === 0) {
      toast.error('No new items to send to kitchen')
      return
    }

    try {
      // Mark items as sent
      setOrderItems(prev =>
        prev.map(item =>
          item.status === 'draft'
            ? { ...item, status: 'sent' as const, sentAt: new Date() }
            : item
        )
      )

      // Update table status to occupied
      if (selectedTable && selectedTable.status === 'AVAILABLE') {
        await updateTableStatus(selectedTable.id, 'OCCUPIED')
        setSelectedTable(prev => prev ? { ...prev, status: 'OCCUPIED' } : null)
      }

      toast.success(`${draftItems.length} items sent to kitchen`)
    } catch (error) {
      console.error('Error sending order:', error)
      toast.error('Failed to send order to kitchen')
    }
  }

  // Send Bill (Lock Order)
  const sendBill = async () => {
    if (!selectedTable) return

    const sentItems = orderItems.filter(item => item.status === 'sent')
    if (sentItems.length === 0) {
      toast.error('No items have been sent to kitchen')
      return
    }

    try {
      await updateTableStatus(selectedTable.id, 'BILL_OUT')
      setSelectedTable(prev => prev ? { ...prev, status: 'BILL_OUT' } : null)
      toast.success('Bill sent - table locked for payment')
    } catch (error) {
      console.error('Error sending bill:', error)
      toast.error('Failed to send bill')
    }
  }

  // Void Item
  const handleVoidItem = (item: OrderItem) => {
    if (item.status !== 'sent') {
      toast.error('Can only void sent items')
      return
    }
    
    setVoidingItem(item)
    setShowVoidDialog(true)
  }

  const confirmVoidItem = async () => {
    if (!voidingItem || !voidReason.trim()) {
      toast.error('Please provide a reason for voiding')
      return
    }

    try {
      setOrderItems(prev =>
        prev.map(item =>
          item === voidingItem
            ? { ...item, status: 'voided' as const, voidReason }
            : item
        )
      )

      setShowVoidDialog(false)
      setVoidingItem(null)
      setVoidReason('')
      toast.success('Item voided successfully')
    } catch (error) {
      console.error('Error voiding item:', error)
      toast.error('Failed to void item')
    }
  }

  // Payment Processing
  const handlePayment = async () => {
    if (!selectedTable) return

    const finalTotal = total
    setPaymentData(prev => ({ ...prev, amount: finalTotal }))
    setShowPaymentDialog(true)
  }

  const processPayment = async () => {
    if (!selectedTable || !currentShift) return

    try {
      const orderData = {
        terminalId: 'default-terminal', // You might want to get this from context
        shiftId: currentShift.id,
        customerId: undefined,
        tableId: selectedTable.id,
        orderType: 'Dine-in' as const,
        lines: orderItems
          .filter(item => item.status !== 'voided')
          .map(item => ({
            menuItemId: item.itemCode,
            quantity: item.quantity,
            unitPrice: item.price,
            notes: item.voidReason
          })),
        payments: [{
          paymentMethodId: paymentMethods.find(pm => pm.name === paymentData.method)?.id || '',
          amount: paymentData.amount
        }]
      }

      const result = await createPOSOrder(orderData)

      if (result.success) {
        // Reset table and order
        await updateTableStatus(selectedTable.id, 'AVAILABLE')
        setOrderItems([])
        setSelectedTable(null)
        setCurrentView('tables')
        setShowPaymentDialog(false)
        
        toast.success('Payment processed successfully')
      } else {
        toast.error(result.error || 'Payment failed')
      }
    } catch (error) {
      console.error('Error processing payment:', error)
      toast.error('Failed to process payment')
    }
  }

  const calculateChange = () => {
    if (paymentData.method === 'CASH' && paymentData.tendered) {
      return Math.max(0, paymentData.tendered - paymentData.amount)
    }
    return 0
  }

  // Render Functions
  const renderTableView = () => (
    <div className="h-full p-6 bg-gray-50">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Restaurant Tables</h1>
          <p className="text-gray-600">Select a table to start taking orders</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => setShowEndShiftDialog(true)}
            className="text-red-600 border-red-200 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4 mr-2" />
            End Shift
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
        {tables.map((table) => {
          const hasOrder = table.currentOrder && table.currentOrder.items.length > 0
          return (
            <Card
              key={table.id}
              className={`cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 border-2 ${getTableStatusColor(table.status, hasOrder)}`}
              onClick={() => handleTableSelect(table)}
            >
              <CardContent className="p-4 text-center">
                <div className="text-4xl mb-2">🪑</div>
                <h3 className="font-bold text-lg mb-1">Table {table.number}</h3>
                <div className="flex items-center justify-center space-x-1 mb-2">
                  <Users className="h-3 w-3" />
                  <span className="text-xs">{table.capacity}</span>
                </div>
                <Badge variant="outline" className="text-xs font-semibold">
                  {getTableStatusText(table.status, hasOrder)}
                </Badge>
                {hasOrder && (
                  <div className="mt-2 text-xs text-gray-600">
                    {table.currentOrder!.items.length} items
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )

  const renderOrderView = () => (
    <div className="h-full flex bg-gray-50">
      {/* Left Panel - Order Ticket */}
      <div className="w-96 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <Button
              variant="ghost"
              onClick={() => setCurrentView('tables')}
              className="text-gray-600 hover:text-gray-900"
            >
              ← Back to Tables
            </Button>
            <Badge variant="outline" className="text-xs">
              Table {selectedTable?.number}
            </Badge>
          </div>
          <h2 className="text-xl font-bold text-gray-900">Order Ticket</h2>
        </div>

        {/* Order Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {orderItems.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <ChefHat className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No items in order</p>
            </div>
          ) : (
            <div className="space-y-2">
              {orderItems.map((item, index) => (
                <div
                  key={`${item.itemCode}-${index}`}
                  className={`p-3 rounded-lg border ${
                    item.status === 'sent' 
                      ? 'bg-blue-50 border-blue-200' 
                      : item.status === 'voided'
                      ? 'bg-red-50 border-red-200 opacity-60'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{item.description}</h4>
                      <p className="text-xs text-gray-500">₱{item.price.toFixed(2)} each</p>
                      {item.status === 'sent' && item.sentAt && (
                        <p className="text-xs text-blue-600">
                          <Clock className="h-3 w-3 inline mr-1" />
                          Sent {item.sentAt.toLocaleTimeString()}
                        </p>
                      )}
                      {item.status === 'voided' && (
                        <p className="text-xs text-red-600">
                          <AlertTriangle className="h-3 w-3 inline mr-1" />
                          Voided: {item.voidReason}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {item.status === 'draft' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateItemQuantity(item, item.quantity - 1)}
                            className="h-6 w-6 p-0"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="text-sm font-medium min-w-[2rem] text-center">
                            {item.quantity}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateItemQuantity(item, item.quantity + 1)}
                            className="h-6 w-6 p-0"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeItem(item)}
                            className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </>
                      )}
                      
                      {item.status === 'sent' && (
                        <>
                          <span className="text-sm font-medium min-w-[2rem] text-center">
                            {item.quantity}
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleVoidItem(item)}
                            className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </>
                      )}
                      
                      {item.status === 'voided' && (
                        <span className="text-sm font-medium text-red-600">
                          Qty: {item.quantity}
                        </span>
                      )}
                    </div>
                    
                    <div className="text-right ml-2">
                      <p className={`font-bold text-sm ${
                        item.status === 'voided' ? 'line-through text-red-600' : ''
                      }`}>
                        ₱{item.total.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Order Summary */}
        {orderItems.length > 0 && (
          <div className="border-t border-gray-200 p-4">
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>₱{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax (12%):</span>
                <span>₱{tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Total:</span>
                <span className="text-green-600">₱{total.toFixed(2)}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              {orderItems.some(item => item.status === 'draft') && (
                <Button
                  onClick={sendOrderToKitchen}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={selectedTable?.status === 'BILL_OUT'}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send to Kitchen
                </Button>
              )}
              
              {orderItems.some(item => item.status === 'sent') && selectedTable?.status !== 'BILL_OUT' && (
                <Button
                  onClick={sendBill}
                  className="w-full bg-orange-600 hover:bg-orange-700"
                >
                  <Receipt className="h-4 w-4 mr-2" />
                  Send Bill
                </Button>
              )}
              
              {selectedTable?.status === 'BILL_OUT' && (
                <div className="space-y-2">
                  <Button
                    onClick={handlePayment}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Process Payment
                  </Button>
                  <Button
                    onClick={() => setShowSplitDialog(true)}
                    variant="outline"
                    className="w-full"
                  >
                    <Split className="h-4 w-4 mr-2" />
                    Split Bill
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Right Panel - Menu */}
      <div className="flex-1 p-4 overflow-y-auto">
        {/* Menu Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Menu</h2>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search menu items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex space-x-2 mb-4 overflow-x-auto">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="whitespace-nowrap"
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Menu Items Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredMenuItems.map((item) => (
            <Card
              key={item.id}
              className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 border-0 shadow-md bg-white"
              onClick={() => addItemToOrder(item)}
            >
              <CardContent className="p-4 text-center">
                <div className="h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mb-3 flex items-center justify-center">
                  <span className="text-2xl">🍽️</span>
                </div>
                <h3 className="font-semibold text-sm mb-1 text-gray-800 line-clamp-2">
                  {item.name}
                </h3>
                <p className="text-xs text-gray-500 mb-2">{item.code}</p>
                <p className="text-lg font-bold text-green-600">
                  ₱{Number(item.price).toFixed(2)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredMenuItems.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🍽️</span>
            </div>
            <p className="text-lg font-medium text-gray-600">No menu items found</p>
            <p className="text-sm text-gray-400">Try adjusting your search or category filter</p>
          </div>
        )}
      </div>
    </div>
  )

  // Payment Dialog
  const renderPaymentDialog = () => (
    <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Process Payment
            <div className="text-3xl font-bold text-green-600 mt-2">
              ₱{paymentData.amount.toFixed(2)}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Payment Method Selection */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Payment Method
            </label>
            <div className="grid grid-cols-2 gap-3">
              {paymentMethods.map((method) => (
                <Button
                  key={method.id}
                  variant={paymentData.method === method.name ? 'default' : 'outline'}
                  onClick={() => setPaymentData(prev => ({ 
                    ...prev, 
                    method: method.name as PaymentMethod 
                  }))}
                  className="h-16 flex flex-col"
                >
                  {method.name === 'CASH' ? (
                    <DollarSign className="h-6 w-6 mb-1" />
                  ) : (
                    <CreditCard className="h-6 w-6 mb-1" />
                  )}
                  <span className="text-sm">{method.name}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Cash Payment Details */}
          {paymentData.method === 'CASH' && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Amount Tendered
                </label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Enter amount received"
                  value={paymentData.tendered || ''}
                  onChange={(e) => setPaymentData(prev => ({
                    ...prev,
                    tendered: parseFloat(e.target.value) || 0
                  }))}
                  className="text-lg h-12"
                />
              </div>
              
              {paymentData.tendered && paymentData.tendered >= paymentData.amount && (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-medium text-green-800">Change Due:</span>
                    <span className="text-2xl font-bold text-green-600">
                      ₱{calculateChange().toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowPaymentDialog(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={processPayment}
              disabled={
                paymentData.method === 'CASH' 
                  ? !paymentData.tendered || paymentData.tendered < paymentData.amount
                  : false
              }
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Complete Payment
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )

  // Void Dialog
  const renderVoidDialog = () => (
    <Dialog open={showVoidDialog} onOpenChange={setShowVoidDialog}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-red-600">
            Void Item
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {voidingItem && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <h4 className="font-medium">{voidingItem.description}</h4>
              <p className="text-sm text-gray-600">
                Qty: {voidingItem.quantity} × ₱{voidingItem.price.toFixed(2)} = ₱{voidingItem.total.toFixed(2)}
              </p>
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Reason for Void *
            </label>
            <Textarea
              placeholder="Enter reason for voiding this item..."
              value={voidReason}
              onChange={(e) => setVoidReason(e.target.value)}
              className="min-h-[80px]"
            />
          </div>

          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowVoidDialog(false)
                setVoidingItem(null)
                setVoidReason('')
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmVoidItem}
              disabled={!voidReason.trim()}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Void Item
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )

  return (
    <div className="h-screen w-full overflow-hidden bg-gray-50">
      {currentView === 'tables' ? renderTableView() : renderOrderView()}
      
      {/* Dialogs */}
      {renderPaymentDialog()}
      {renderVoidDialog()}
      
      {/* Split Bill Dialog - Placeholder */}
      <Dialog open={showSplitDialog} onOpenChange={setShowSplitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Split Bill</DialogTitle>
          </DialogHeader>
          <div className="p-4 text-center">
            <p>Split bill functionality coming soon...</p>
            <Button onClick={() => setShowSplitDialog(false)} className="mt-4">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* End Shift Dialog - Placeholder */}
      <Dialog open={showEndShiftDialog} onOpenChange={setShowEndShiftDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>End Shift</DialogTitle>
          </DialogHeader>
          <div className="p-4 text-center">
            <p>End shift functionality coming soon...</p>
            <Button onClick={() => setShowEndShiftDialog(false)} className="mt-4">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}