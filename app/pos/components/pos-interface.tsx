'use client'

import { useState, useEffect } from 'react'
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
import { Select } from '@/components/ui/select'
import { PaymentDialog } from './payment-dialog'
import { CustomerSearchDialog } from './customer-search-dialog'

interface POSInterfaceProps {
  terminal: any
  currentShift: any
}

interface CartItem {
  itemCode: string
  description: string
  price: number
  quantity: number
  total: number
}

export function POSInterface({ terminal, currentShift }: POSInterfaceProps) {
  const [shift, setShift] = useState(currentShift)
  const [cart, setCart] = useState<CartItem[]>([])
  const [menuItems, setMenuItems] = useState<any[]>([])
  const [paymentMethods, setPaymentMethods] = useState<any[]>([])
  const [discounts, setDiscounts] = useState<any[]>([])
  const [tables, setTables] = useState<any[]>([])
  const [SelectedTable, setSelectedTable] = useState<any>(null)
  const [SelectedCustomer, setSelectedCustomer] = useState<any>(null)
  const [orderType, setOrderType] = useState<'Dine-In' | 'Take-Out' | 'Delivery' | 'Room-Service'>('Dine-In')
  const [searchTerm, setSearchTerm] = useState('')
  const [showPayment, setShowPayment] = useState(false)
  const [showCustomerSearch, setShowCustomerSearch] = useState(false)

  useEffect(() => {
    loadData()
  }, [terminal.businessUnitId])

  const loadData = async () => {
    const [items, payments, discountList, tableList] = await Promise.all([
      getMenuItems(terminal.businessUnitId),
      getPaymentMethods(),
      getDiscounts(),
      getRestaurantTables(terminal.businessUnitId)
    ])
    
    setMenuItems(items)
    setPaymentMethods(payments)
    setDiscounts(discountList)
    setTables(tableList)
  }

  const filteredItems = menuItems.filter(item =>
    item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.itemCode.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const addToCart = (item: any) => {
    setCart(prev => {
      const existing = prev.find(cartItem => cartItem.itemCode === item.itemCode)
      if (existing) {
        return prev.map(cartItem =>
          cartItem.itemCode === item.itemCode
            ? { ...cartItem, quantity: cartItem.quantity + 1, total: (cartItem.quantity + 1) * cartItem.price }
            : cartItem
        )
      } else {
        return [...prev, {
          itemCode: item.itemCode,
          description: item.itemName,
          price: item.price,
          quantity: 1,
          total: item.price
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

  const handlePayment = async (payments: any[], appliedDiscounts: any[]) => {
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
        businessUnitId: terminal.businessUnitId,
        terminalId: terminal.id,
        shiftId: shift.id,
        tableId: SelectedTable?.id,
        customerId: SelectedCustomer?.id,
        orderType,
        lines: cart.map(item => ({
          itemCode: item.itemCode,
          description: item.description,
          quantity: item.quantity,
          price: item.price
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
        toast.success('Order created successfully')
        clearCart()
        setShowPayment(false)
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      toast.error('Failed to process order')
    }
  }

  const handleShiftStart = async (startAmount: number, userId: string) => {
    const result = await startPOSShift(terminal.id, userId, startAmount)
    if (result.success) {
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

  return (
    <div className="flex h-full">
      {/* Left Panel - Menu Items */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Menu Items</h2>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredItems.map((item) => (
              <Card 
                key={item.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => addToCart(item)}
              >
                <CardContent className="p-4">
                  <h3 className="font-medium text-sm mb-1">{item.itemName}</h3>
                  <p className="text-xs text-gray-600 mb-2">{item.itemCode}</p>
                  <p className="text-lg font-bold text-green-600">${item.price.toFixed(2)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Cart and Controls */}
      <div className="w-96 bg-white border-l p-4 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Order</h2>
          <div className="flex items-center space-x-2">
            <Badge variant="outline">
              {shift.user.name}
            </Badge>
            <ShiftDialog 
              currentShift={shift}
              onEndShift={handleShiftEnd}
            >
              <Button variant="outline" size="sm">
                End Shift
              </Button>
            </ShiftDialog>
          </div>
        </div>

        {/* Order Type and Table Selection */}
        <div className="space-y-3 mb-4">
          <div className="flex space-x-2">
            {(['Dine-In', 'Take-Out', 'Delivery', 'Room-Service'] as const).map((type) => (
              <Button
                key={type}
                variant={orderType === type ? 'default' : 'outline'}
                size="sm"
                onClick={() => setOrderType(type)}
              >
                {type}
              </Button>
            ))}
          </div>

          {orderType === 'Dine-In' && (
            <div className="flex items-center space-x-2">
              <span className="text-sm">Table:</span>
              <Select
                className="flex-1 p-2 border rounded"
                value={SelectedTable?.id || ''}
                onChange={(e) => {
                  const table = tables.find(t => t.id === e.target.value)
                  setSelectedTable(table)
                }}
              >
                <option value="">Select Table</option>
                {tables.filter(t => t.status === 'Available').map((table) => (
                  <option key={table.id} value={table.id}>
                    {table.tableNumber}
                  </option>
                ))}
              </Select>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <span className="text-sm">Customer:</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCustomerSearch(true)}
              className="flex-1"
            >
              <User className="mr-2 h-4 w-4" />
              {SelectedCustomer ? SelectedCustomer.cardName : 'Walk-in'}
            </Button>
            {SelectedCustomer && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedCustomer(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto mb-4">
          {cart.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <ShoppingCart className="mx-auto h-12 w-12 mb-2" />
              <p>Cart is empty</p>
            </div>
          ) : (
            <div className="space-y-2">
              {cart.map((item) => (
                <div key={item.itemCode} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{item.description}</h4>
                    <p className="text-xs text-gray-600">${item.price.toFixed(2)} each</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuantity(item.itemCode, item.quantity - 1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuantity(item.itemCode, item.quantity + 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFromCart(item.itemCode)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="w-16 text-right">
                    <span className="font-medium">${item.total.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="border-t pt-4 space-y-2">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax (12%):</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg">
            <span>Total:</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 mt-4">
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              onClick={clearCart}
              disabled={cart.length === 0}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Clear
            </Button>
            <Button
              variant="outline"
              disabled={cart.length === 0}
            >
              <StopCircle className="mr-2 h-4 w-4" />
              Hold
            </Button>
          </div>
          
          <PaymentDialog
            total={total}
            paymentMethods={paymentMethods}
            discounts={discounts}
            onPayment={handlePayment}
            open={showPayment}
            onOpenChange={setShowPayment}
          >
            <Button 
              className="w-full" 
              size="lg"
              disabled={cart.length === 0}
              onClick={() => setShowPayment(true)}
            >
              <CreditCard className="mr-2 h-4 w-4" />
              Pay ${total.toFixed(2)}
            </Button>
          </PaymentDialog>
        </div>

        <CustomerSearchDialog
          open={showCustomerSearch}
          onOpenChange={setShowCustomerSearch}
          onSelectCustomer={setSelectedCustomer}
        />
      </div>
    </div>
  )
}