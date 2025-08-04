'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  CreditCard, 
  User,
  Clock,
  Search,
  X,
  StopCircle
} from 'lucide-react'
import { toast } from 'sonner'
import { 
  createPOSOrder, 
  getMenuItems, 
  getPaymentMethods, 
  getDiscounts,
  getRestaurantTables,
  startPOSShift,
  endPOSShift
} from '@/lib/actions/pos'
import { PaymentDialog } from './payment-dialog'
import { CustomerSearchDialog } from './customer-search-dialog'
import { ShiftDialog } from './shift-dialog'
import { TableDialog } from './table-dialog'
import { OrderConfirmationDialog } from './order-confirmation-dialog'
import { 
  POSTerminalWithShifts, 
  POSShiftWithDetails, 
  CartItem, 
  MenuItemWithDetails,
  PaymentMethodData,
  DiscountData,
  RestaurantTableWithDetails,
  BusinessPartnerForPOS,
  PaymentItem,
  AppliedDiscount
} from '@/lib/types'

interface POSInterfaceProps {
  terminal: POSTerminalWithShifts
  currentShift: POSShiftWithDetails | null
}

type OrderType = 'Dine-In' | 'Take-Out' | 'Delivery' | 'Room-Service'

export function POSInterface({ terminal, currentShift }: POSInterfaceProps) {
  const [shift, setShift] = useState<POSShiftWithDetails | null>(currentShift)
  const [cart, setCart] = useState<CartItem[]>([])
  const [menuItems, setMenuItems] = useState<MenuItemWithDetails[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodData[]>([])
  const [discounts, setDiscounts] = useState<DiscountData[]>([])
  const [tables, setTables] = useState<RestaurantTableWithDetails[]>([])
  const [selectedTable, setSelectedTable] = useState<RestaurantTableWithDetails | null>(null)
  const [selectedCustomer, setSelectedCustomer] = useState<BusinessPartnerForPOS | null>(null)
  const [orderType, setOrderType] = useState<OrderType>('Dine-In')
  const [searchTerm, setSearchTerm] = useState('')
  const [showPayment, setShowPayment] = useState(false)
  const [showCustomerSearch, setShowCustomerSearch] = useState(false)
  const [showTableDialog, setShowTableDialog] = useState(false)
  const [showOrderConfirmation, setShowOrderConfirmation] = useState(false)
  const [orderConfirmationData, setOrderConfirmationData] = useState<{
    billNumber: string
    table?: RestaurantTableWithDetails | null
    customer?: BusinessPartnerForPOS | null
    items: CartItem[]
    subtotal: number
    tax: number
    serviceCharge: number
    discount: number
    tips: number
    total: number
    paymentMethod: string
    paymentAmount: number
    change: number
    waiter: string
    orderType: string
    createdAt: Date
  } | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const loadData = useCallback(async () => {
    setIsLoading(true)
    try {
      console.log('Loading POS data for business unit:', terminal.businessUnit.id)
      const [items, payments, discountList, tableList] = await Promise.all([
        getMenuItems(terminal.businessUnit.id),
        getPaymentMethods(),
        getDiscounts(),
        getRestaurantTables(terminal.businessUnit.id)
      ])
      
      console.log('Loaded menu items:', items.length)
      console.log('Menu items:', items)
      
      setMenuItems(items)
      setPaymentMethods(payments)
      setDiscounts(discountList)
      setTables(tableList)
    } catch (error) {
      console.error('Error loading POS data:', error)
      toast.error('Failed to load POS data')
    } finally {
      setIsLoading(false)
    }
  }, [terminal.businessUnit.id])

  useEffect(() => {
    loadData()
  }, [loadData])

  const filteredItems = menuItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const addToCart = (item: MenuItemWithDetails, tableId?: string) => {
    setCart(prev => {
      const existing = prev.find(cartItem => 
        cartItem.itemCode === item.code && cartItem.tableId === tableId
      )
      if (existing) {
        return prev.map(cartItem =>
          cartItem.itemCode === item.code && cartItem.tableId === tableId
            ? { ...cartItem, quantity: cartItem.quantity + 1, total: (cartItem.quantity + 1) * Number(item.price) }
            : cartItem
        )
      } else {
        return [...prev, {
          itemCode: item.code,
          description: item.name,
          price: Number(item.price),
          quantity: 1,
          total: Number(item.price),
          tableId: tableId || null
        }]
      }
    })
  }

  const updateQuantity = (itemCode: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(itemCode)
      return
    }
    
    setCart(prev =>
      prev.map(item =>
        item.itemCode === itemCode
          ? { ...item, quantity: newQuantity, total: newQuantity * item.price }
          : item
      )
    )
  }

  const removeFromCart = (itemCode: string) => {
    setCart(prev => prev.filter(item => item.itemCode !== itemCode))
  }

  const clearCart = () => {
    setCart([])
    setSelectedTable(null)
    setSelectedCustomer(null)
  }

  const subtotal = cart.reduce((sum, item) => sum + item.total, 0)
  const tax = subtotal * 0.12 // 12% VAT
  const total = subtotal + tax

  const handlePayment = async (payments: PaymentItem[], appliedDiscounts: AppliedDiscount[]) => {
    if (!shift) {
      toast.error('No active shift. Please start a shift first.')
      return
    }

    if (cart.length === 0) {
      toast.error('Cart is empty')
      return
    }

    try {
      const orderData = {
        terminalId: terminal.id,
        shiftId: shift.id,
        tableId: selectedTable?.id,
        customerId: selectedCustomer?.id,
        orderType: (orderType === 'Dine-In' ? 'Dine-in' : orderType === 'Take-Out' ? 'Takeaway' : 'Delivery') as 'Dine-in' | 'Takeaway' | 'Delivery',
        lines: cart.map(item => ({
          menuItemId: item.itemCode,
          quantity: item.quantity,
          unitPrice: item.price,
          notes: item.description
        })),
        payments: payments.map(payment => ({
          paymentMethodId: payment.paymentMethodId,
          amount: payment.amount
        })),
        discounts: appliedDiscounts.length > 0 ? appliedDiscounts.map(discount => ({
          discountId: discount.discountId,
          amount: discount.amount
        })) : undefined
      }

      const result = await createPOSOrder(orderData)
      
      if (result.success) {
        // Calculate additional charges
        const serviceCharge = subtotal * 0.10 // 10% service charge
        const tips = 0 // Can be added later
        const discount = appliedDiscounts.reduce((sum, discount) => sum + discount.amount, 0)
        const paymentAmount = payments.reduce((sum, payment) => sum + payment.amount, 0)
        const change = paymentAmount - total

        // Prepare order confirmation data
        const confirmationData = {
          billNumber: result.data?.number || `BILL-${Date.now()}`,
          table: selectedTable,
          customer: selectedCustomer,
          items: cart,
          subtotal,
          tax,
          serviceCharge,
          discount,
          tips,
          total,
          paymentMethod: payments.map(p => p.paymentMethodName).join(', '),
          paymentAmount,
          change,
          waiter: `${shift.user.employee?.firstName} ${shift.user.employee?.lastName}`,
          orderType: orderType,
          createdAt: new Date()
        }

        setOrderConfirmationData(confirmationData)
        setShowOrderConfirmation(true)
        clearCart()
        setShowPayment(false)
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      console.error('Error processing order:', error)
      toast.error('Failed to process order')
    }
  }

  const handleShiftStart = async (startAmount: number, userId: string) => {
    const result = await startPOSShift(terminal.id, userId, startAmount)
    if (result.success && result.data) {
      setShift(result.data)
      toast.success('Shift started successfully')
    } else {
      toast.error(result.error)
    }
  }

  const handleShiftEnd = async (endAmount: number) => {
    if (!shift) return
    
    const result = await endPOSShift(shift.id, endAmount)
    if (result.success) {
      setShift(null)
      toast.success('Shift ended successfully')
    } else {
      toast.error(result.error)
    }
  }

  const handleTableSelect = (tableId: string) => {
    const table = tables.find(t => t.id === tableId)
    setSelectedTable(table || null)
    setShowTableDialog(true)
  }

  if (!shift) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Start Shift - {terminal.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <ShiftDialog onStartShift={handleShiftStart}>
              <Button className="w-full">
                <Clock className="mr-2 h-4 w-4" />
                Start Shift
              </Button>
            </ShiftDialog>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading POS system...</p>
        </div>
      </div>
    )
  }
  return (
    <div className="flex h-full bg-gray-50">
      {/* Left Panel - Tables and Menu Items */}
      <div className="flex-1 p-6 overflow-y-auto">
        {/* Tables Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Restaurant Tables</h2>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="px-3 py-1">
                {tables.filter(t => t.status === 'Available').length} Available
              </Badge>
            </div>
          </div>
          
          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3">
            {tables.map((table) => (
              <Card 
                key={table.id} 
                className={`cursor-pointer transition-all duration-200 hover:scale-105 border-2 ${
                  selectedTable?.id === table.id 
                    ? 'border-blue-500 bg-blue-50 shadow-lg' 
                    : table.status === 'Available'
                    ? 'border-green-200 bg-white hover:border-green-400'
                    : 'border-purple-200 bg-purple-50'
                }`}
                onClick={() => handleTableSelect(table.id)}
              >
                <CardContent className="p-3 text-center">
                  <div className={`h-12 rounded-lg mb-2 flex items-center justify-center ${
                    selectedTable?.id === table.id 
                      ? 'bg-blue-100' 
                      : table.status === 'Available'
                      ? 'bg-green-100'
                      : 'bg-purple-100'
                  }`}>
                    <span className="text-xl">🪑</span>
                  </div>
                  <h3 className="font-semibold text-sm mb-1 text-gray-800">Table {table.number}</h3>
                  <p className="text-xs text-gray-500 mb-1">Cap: {table.capacity}</p>
                  <Badge 
                    variant={table.status === 'Available' ? 'default' : 'secondary'}
                    className={table.status === 'Available' ? 'bg-green-600' : 'bg-purple-600'}
                  >
                    {table.status}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Menu Items Section */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Menu Items</h2>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
          
          {filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🍽️</span>
              </div>
              <p className="text-lg font-medium text-gray-600">No menu items found</p>
              <p className="text-sm text-gray-400">Try adjusting your search or check if items are configured</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredItems.map((item) => (
                <Card 
                  key={item.id} 
                  className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 border-0 shadow-md bg-white"
                  onClick={() => addToCart(item)}
                >
                  <CardContent className="p-4 text-center">
                    <div className="h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mb-3 flex items-center justify-center">
                      <span className="text-2xl">🍽️</span>
                    </div>
                    <h3 className="font-semibold text-sm mb-1 text-gray-800 line-clamp-2">{item.name}</h3>
                    <p className="text-xs text-gray-500 mb-2">{item.code}</p>
                    <p className="text-lg font-bold text-green-600">${Number(item.price).toFixed(2)}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Cart and Controls */}
      <div className="w-96 bg-white border-l border-gray-200 p-6 flex flex-col shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Current Order</h2>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="px-3 py-1">
              {shift.user.employee?.firstName} {shift.user.employee?.lastName}
            </Badge>
            <ShiftDialog 
              currentShift={shift}
              onEndShift={handleShiftEnd}
            >
              <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                End Shift
              </Button>
            </ShiftDialog>
          </div>
        </div>

        {/* Order Type and Customer Selection */}
        <div className="space-y-4 mb-6">
          <div className="grid grid-cols-2 gap-2">
            {(['Dine-In', 'Take-Out', 'Delivery', 'Room-Service'] as const).map((type) => (
              <Button
                key={type}
                variant={orderType === type ? 'default' : 'outline'}
                size="sm"
                className={orderType === type ? 'bg-blue-600 hover:bg-blue-700' : 'hover:bg-blue-50'}
                onClick={() => setOrderType(type)}
              >
                {type}
              </Button>
            ))}
          </div>

          {orderType === 'Dine-In' && selectedTable && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-800">Selected Table</p>
                  <p className="text-lg font-bold text-blue-900">Table {selectedTable.number}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedTable(null)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Customer</label>
            <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCustomerSearch(true)}
              className="flex-1 justify-start"
            >
              <User className="mr-2 h-4 w-4" />
              {selectedCustomer ? selectedCustomer.cardName : 'Walk-in'}
            </Button>
            {selectedCustomer && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedCustomer(null)}
                className="text-gray-500 hover:text-red-600"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            </div>
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto mb-6">
          {cart.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="h-10 w-10 text-gray-400" />
              </div>
              <p className="text-lg font-medium">Cart is empty</p>
              <p className="text-sm text-gray-400">Add items to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Group items by table */}
              {(() => {
                const tableGroups = cart.reduce((groups, item) => {
                  const tableId = item.tableId || 'general'
                  if (!groups[tableId]) {
                    groups[tableId] = []
                  }
                  groups[tableId].push(item)
                  return groups
                }, {} as Record<string, CartItem[]>)

                return Object.entries(tableGroups).map(([tableId, items]) => {
                  const table = tableId !== 'general' ? tables.find(t => t.id === tableId) : null
                  const tableTotal = items.reduce((sum, item) => sum + item.total, 0)

                  return (
                    <div key={tableId} className="border border-gray-200 rounded-lg overflow-hidden">
                      {table && (
                        <div className="bg-blue-50 px-3 py-2 border-b border-gray-200">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm text-blue-800">
                              Table {table.number} - {table.status}
                            </span>
                            <Badge 
                              variant={table.status === 'Available' ? 'default' : 'secondary'}
                              className={table.status === 'Available' ? 'bg-green-600' : 'bg-purple-600'}
                            >
                              {table.status}
                            </Badge>
                          </div>
                        </div>
                      )}
                      <div className="space-y-2 p-3">
                        {items.map((item) => (
                          <div key={item.itemCode} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                            <div className="flex-1">
                              <h4 className="font-semibold text-sm text-gray-800">{item.description}</h4>
                              <p className="text-xs text-gray-500">${item.price.toFixed(2)} each</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => updateQuantity(item.itemCode, item.quantity - 1)}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => updateQuantity(item.itemCode, item.quantity + 1)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                onClick={() => removeFromCart(item.itemCode)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                            <div className="w-16 text-right">
                              <span className="font-bold text-sm text-gray-800">${item.total.toFixed(2)}</span>
                            </div>
                          </div>
                        ))}
                        {table && (
                          <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                            <span className="text-sm font-medium text-gray-600">Table Total:</span>
                            <span className="font-bold text-blue-600">${tableTotal.toFixed(2)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })
              })()}
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="border-t border-gray-200 pt-4 space-y-3 bg-gray-50 -mx-6 px-6 py-4 rounded-t-lg">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal:</span>
            <span className="font-semibold">${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Tax (12%):</span>
            <span className="font-semibold">${tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-xl border-t border-gray-300 pt-2">
            <span className="text-gray-800">Total:</span>
            <span className="text-green-600">${total.toFixed(2)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 mt-6">
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              onClick={clearCart}
              disabled={cart.length === 0}
              className="h-12 border-gray-300 hover:bg-gray-50"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Clear
            </Button>
            <Button
              variant="outline"
              disabled={cart.length === 0}
              className="h-12 border-gray-300 hover:bg-gray-50"
            >
              <StopCircle className="mr-2 h-4 w-4" />
              Hold
            </Button>
          </div>
          
          <Button 
            className="w-full h-14 text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg" 
            disabled={cart.length === 0}
            onClick={() => setShowPayment(true)}
          >
            <CreditCard className="mr-2 h-4 w-4" />
            Pay ${total.toFixed(2)}
          </Button>
        </div>

        <PaymentDialog
          total={total}
          paymentMethods={paymentMethods}
          discounts={discounts}
          onPayment={handlePayment}
          open={showPayment}
          onOpenChange={setShowPayment}
        />

        <CustomerSearchDialog
          open={showCustomerSearch}
          onOpenChange={setShowCustomerSearch}
          onSelectCustomer={setSelectedCustomer}
        />

        <TableDialog
          table={selectedTable}
          isOpen={showTableDialog}
          onClose={() => setShowTableDialog(false)}
          onAddToCart={(item) => addToCart(item, selectedTable?.id)}
          menuItems={menuItems}
          cart={cart}
        />

        {orderConfirmationData && (
          <OrderConfirmationDialog
            isOpen={showOrderConfirmation}
            onClose={() => {
              setShowOrderConfirmation(false)
              setOrderConfirmationData(null)
            }}
            orderData={orderConfirmationData}
          />
        )}
      </div>
    </div>
  )
}