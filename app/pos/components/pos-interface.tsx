'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
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
  Search,
  X,
  StopCircle,
  Receipt,
  Grid3X3,
  List,
  Users,
  Table,
  ChefHat,
} from 'lucide-react'
import { toast } from 'sonner'
import { 
  createPOSOrder, 
  getMenuItems, 
  getPaymentMethods, 
  getDiscounts,
  getRestaurantTables,
  startPOSShift,
  endPOSShift,
} from '@/lib/actions/pos'
import { PaymentDialog } from './payment-dialog'
import { CustomerSearchDialog } from './customer-search-dialog'
import { ShiftDialog } from './shift-dialog'
import { TableDialog } from './table-dialog'
import { OrderConfirmationDialog } from './order-confirmation-dialog'
import { QuickActionsPanel } from './quick-actions-panel'
import { NumericKeypad } from './numeric-keypad'
import { POSShortcuts } from './pos-shortcuts'
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

interface OrderConfirmationData {
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
}

interface POSInterfaceProps {
  terminal: POSTerminalWithShifts
  currentShift: POSShiftWithDetails | null
}

type OrderType = 'Dine-In' | 'Take-Out' | 'Delivery' | 'Room-Service'
type ViewMode = 'grid' | 'list'
type POSView = 'tables' | 'menu' | 'kitchen' | 'reports'

export function POSInterface({ terminal, currentShift }: POSInterfaceProps) {
  const [shift, setShift] = useState<POSShiftWithDetails | null>(currentShift)
  const [cart, setCart] = useState<CartItem[]>([])
  const [heldOrders, setHeldOrders] = useState<CartItem[][]>([])
  const [menuItems, setMenuItems] = useState<MenuItemWithDetails[]>([])
  const [filteredItems, setFilteredItems] = useState<MenuItemWithDetails[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodData[]>([])
  const [discounts, setDiscounts] = useState<DiscountData[]>([])
  const [tables, setTables] = useState<RestaurantTableWithDetails[]>([])
  const [selectedTable, setSelectedTable] = useState<RestaurantTableWithDetails | null>(null)
  const [selectedCustomer, setSelectedCustomer] = useState<BusinessPartnerForPOS | null>(null)
  const [orderType, setOrderType] = useState<'Dine-in' | 'Takeaway' | 'Delivery'>('Dine-in')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [currentView, setCurrentView] = useState<POSView>('tables')
  const [showPayment, setShowPayment] = useState(false)
  const [showCustomerSearch, setShowCustomerSearch] = useState(false)
  const [showTableDialog, setShowTableDialog] = useState(false)
  const [showOrderConfirmation, setShowOrderConfirmation] = useState(false)
  const [showNumericKeypad, setShowNumericKeypad] = useState(false)
  const [quantityInputItem, setQuantityInputItem] = useState<string | null>(null)
  const [orderConfirmationData, setOrderConfirmationData] = useState<OrderConfirmationData | null>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [menuData, paymentData, discountData, tablesData] = await Promise.all([
          getMenuItems(terminal.businessUnit.id),
          getPaymentMethods(),
          getDiscounts(),
          getRestaurantTables(terminal.businessUnit.id)
        ])
        
        setMenuItems(menuData)
        setFilteredItems(menuData)
        setPaymentMethods(paymentData)
        setDiscounts(discountData)
        setTables(tablesData)
        console.log('Tables loaded:', tablesData)
      } catch (error) {
        console.error('Error loading POS data:', error)
        toast.error('Failed to load POS data')
      }
    }

    loadData()
  }, [terminal.businessUnit.id])

  // Filter menu items based on search
  useEffect(() => {
    let filtered = menuItems

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.code.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredItems(filtered)
  }, [menuItems, searchTerm])

  // Categories not available in current data structure
  const categories = ['All']

  const addToCart = (item: MenuItemWithDetails, quantity: number = 1) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.itemCode === item.code)
      
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.itemCode === item.code
            ? { ...cartItem, quantity: cartItem.quantity + quantity }
            : cartItem
        )
      } else {
        const newItem: CartItem = {
          itemCode: item.code,
          description: item.name,
          price: Number(item.price),
          quantity,
          total: Number(item.price) * quantity,
          tableId: selectedTable?.id || null
        }
        return [...prevCart, newItem]
      }
    })
  }

  const updateQuantity = (itemCode: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(itemCode)
    } else {
      setCart(prevCart =>
        prevCart.map(item =>
          item.itemCode === itemCode ? { ...item, quantity: newQuantity } : item
        )
      )
    }
  }

  const removeFromCart = (itemCode: string) => {
    setCart(prevCart => prevCart.filter(item => item.itemCode !== itemCode))
  }

  const clearCart = () => {
    setCart([])
    setSelectedTable(null)
    setSelectedCustomer(null)
  }

  const holdCurrentOrder = () => {
    if (cart.length > 0) {
      setHeldOrders(prev => [...prev, [...cart]])
      setCart([])
      toast.success('Order held successfully')
    }
  }

  const recallHeldOrder = (index: number) => {
    if (heldOrders[index]) {
      setCart(heldOrders[index])
      setHeldOrders(prev => prev.filter((_, i) => i !== index))
      toast.success('Order recalled')
    }
  }

  const applyDiscount = (discountPercent: number) => {
    // Implementation for applying discount
    toast.success(`${discountPercent}% discount applied`)
  }

  const handlePayment = async (payments: PaymentItem[], appliedDiscounts: AppliedDiscount[]) => {
    if (!shift) {
      toast.error('No active shift')
      return
    }

    try {
      const orderData = {
        terminalId: terminal.id,
        shiftId: shift.id,
        orderType,
        customerId: selectedCustomer?.id,
        tableId: selectedTable?.id,
        lines: cart.map(item => ({
          menuItemId: item.itemCode,
          quantity: item.quantity,
          unitPrice: Number(item.price)
        })),
        payments: payments.map(payment => ({
          paymentMethodId: payment.paymentMethodId,
          amount: payment.amount
        }))
      }

      const result = await createPOSOrder(orderData)

      if (result.success) {
        setOrderConfirmationData({
          billNumber: result.data?.number || 'N/A',
          table: selectedTable,
          customer: selectedCustomer,
          items: cart,
          subtotal: cart.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0),
          tax: 0,
          serviceCharge: 0,
          discount: appliedDiscounts.reduce((sum, discount) => sum + discount.amount, 0),
          tips: 0,
          total: payments.reduce((sum, payment) => sum + payment.amount, 0),
          paymentMethod: payments[0]?.paymentMethodName || 'Multiple',
          paymentAmount: payments.reduce((sum, payment) => sum + payment.amount, 0),
          change: 0,
          waiter: `${shift.user.employee?.firstName} ${shift.user.employee?.lastName}`,
          orderType,
          createdAt: new Date()
        })

        setShowPayment(false)
        setShowOrderConfirmation(true)
        clearCart()
        toast.success('Order completed successfully')
      } else {
        toast.error(result.error || 'Failed to create order')
      }
    } catch (error) {
      console.error('Error processing payment:', error)
      toast.error('Failed to process payment')
    }
  }

  const handleShiftStart = async (startAmount: number, userId: string) => {
    try {
      const result = await startPOSShift(terminal.id, userId, startAmount)
      if (result.success) {
        setShift(result.data || null)
        toast.success('Shift started successfully')
      } else {
        toast.error(result.error || 'Failed to start shift')
      }
    } catch (error) {
      console.error('Error starting shift:', error)
      toast.error('Failed to start shift')
    }
  }

  const handleShiftEnd = async (endAmount: number) => {
    if (!shift) return

    try {
      const result = await endPOSShift(shift.id, endAmount)
      if (result.success) {
        setShift(null)
        toast.success('Shift ended successfully')
      } else {
        toast.error(result.error || 'Failed to end shift')
      }
    } catch (error) {
      console.error('Error ending shift:', error)
      toast.error('Failed to end shift')
    }
  }

  const handleQuantityInput = (itemCode: string) => {
    setQuantityInputItem(itemCode)
    setShowNumericKeypad(true)
  }

  const handleQuantityConfirm = (quantity: number) => {
    if (quantityInputItem) {
      updateQuantity(quantityInputItem, quantity)
      setQuantityInputItem(null)
      setShowNumericKeypad(false)
    }
  }

  const focusSearch = () => {
    searchInputRef.current?.focus()
  }

  const handleTableClick = (table: RestaurantTableWithDetails) => {
    setSelectedTable(table)
    setShowTableDialog(true)
  }

  const getTableStatusColor = (status: string) => {
    switch (status) {
      case 'Available':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'Occupied':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'Reserved':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getTableStatusIcon = (status: string) => {
    switch (status) {
      case 'Available':
        return '🟢'
      case 'Occupied':
        return '🔴'
      case 'Reserved':
        return '🟡'
      default:
        return '⚪'
    }
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <Button
              variant={currentView === 'tables' ? 'default' : 'ghost'}
              onClick={() => setCurrentView('tables')}
              className="flex items-center space-x-2"
            >
              <Table className="h-4 w-4" />
              <span>Tables</span>
            </Button>
            <Button
              variant={currentView === 'menu' ? 'default' : 'ghost'}
              onClick={() => setCurrentView('menu')}
              className="flex items-center space-x-2"
            >
              <ChefHat className="h-4 w-4" />
              <span>Menu</span>
            </Button>
            <Button
              variant={currentView === 'kitchen' ? 'default' : 'ghost'}
              onClick={() => setCurrentView('kitchen')}
              className="flex items-center space-x-2"
            >
              <ChefHat className="h-4 w-4" />
              <span>Kitchen</span>
            </Button>
            <Button
              variant={currentView === 'reports' ? 'default' : 'ghost'}
              onClick={() => setCurrentView('reports')}
              className="flex items-center space-x-2"
            >
              <Receipt className="h-4 w-4" />
              <span>Reports</span>
            </Button>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              Shift: {shift?.user.employee?.firstName} {shift?.user.employee?.lastName}
            </div>
            <ShiftDialog 
              currentShift={shift}
              onEndShift={handleShiftEnd}
            >
              <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                <StopCircle className="h-3 w-3" />
                End Shift
              </Button>
            </ShiftDialog>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Tables View */}
        {currentView === 'tables' && (
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Restaurant Tables</h2>
              <p className="text-gray-600">Click on a table to start taking orders</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {tables.map((table) => (
                <Card 
                  key={table.id} 
                  className={`cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 border-2 ${
                    table.status === 'Available' 
                      ? 'border-green-200 hover:border-green-300' 
                      : table.status === 'Occupied'
                      ? 'border-red-200 hover:border-red-300'
                      : 'border-yellow-200 hover:border-yellow-300'
                  }`}
                  onClick={() => handleTableClick(table)}
                >
                  <CardContent className="p-4 text-center">
                    <div className="text-4xl mb-2">{getTableStatusIcon(table.status)}</div>
                    <h3 className="font-bold text-lg text-gray-800 mb-1">Table {table.number}</h3>
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">{table.capacity} seats</span>
                    </div>
                    <Badge 
                      variant="outline"
                      className={`${getTableStatusColor(table.status)}`}
                    >
                      {table.status}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>

            {tables.length === 0 && (
              <div className="text-center py-12">
                <Table className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-600">No tables configured</p>
                <p className="text-sm text-gray-400">Configure tables in settings</p>
              </div>
            )}
          </div>
        )}

        {/* Menu View (for Take-Out, Delivery, Room Service) */}
        {currentView === 'menu' && (
          <div className="flex-1 p-4 overflow-y-auto">
            {/* Header Controls */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <h2 className="text-2xl font-bold text-gray-800">Menu</h2>
                <div className="flex items-center space-x-2">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    ref={searchInputRef}
                    placeholder="Search items..."
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

            {/* Menu Items Grid/List */}
            {filteredItems.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🍽️</span>
                </div>
                <p className="text-lg font-medium text-gray-600">No menu items found</p>
                <p className="text-sm text-gray-400">Try adjusting your search or category filter</p>
              </div>
            ) : (
              <div className={viewMode === 'grid' 
                ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
                : "space-y-2"
              }>
                {filteredItems.map((item) => (
                  <Card 
                    key={item.id} 
                    className={`cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 border-0 shadow-md bg-white ${
                      viewMode === 'list' ? 'p-2' : ''
                    }`}
                    onClick={() => addToCart(item)}
                  >
                    <CardContent className={viewMode === 'grid' ? "p-4 text-center" : "p-3 flex items-center justify-between"}>
                      {viewMode === 'grid' ? (
                        <>
                          <div className="h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mb-3 flex items-center justify-center">
                            <span className="text-2xl">🍽️</span>
                          </div>
                          <h3 className="font-semibold text-sm mb-1 text-gray-800 line-clamp-2">{item.name}</h3>
                          <p className="text-xs text-gray-500 mb-2">{item.code}</p>
                          <p className="text-lg font-bold text-green-600">₱{Number(item.price).toFixed(2)}</p>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                              <span className="text-lg">🍽️</span>
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-800">{item.name}</h3>
                              <p className="text-xs text-gray-500">{item.code}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-green-600">₱{Number(item.price).toFixed(2)}</p>
                            <Button size="sm" className="mt-1">
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Kitchen View */}
        {currentView === 'kitchen' && (
          <div className="flex-1 p-6">
            <div className="text-center py-12">
              <ChefHat className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Kitchen Display</h2>
              <p className="text-gray-600">Kitchen orders will appear here</p>
            </div>
          </div>
        )}

        {/* Reports View */}
        {currentView === 'reports' && (
          <div className="flex-1 p-6">
            <div className="text-center py-12">
              <Receipt className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Reports</h2>
              <p className="text-gray-600">Sales reports and analytics will appear here</p>
            </div>
          </div>
        )}

        {/* Right Panel - Cart and Controls */}
        <div className="w-96 bg-white border-l border-gray-200 p-4 flex flex-col shadow-lg">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">Order</h2>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="px-2 py-1 text-xs">
                {shift?.user.employee?.firstName} {shift?.user.employee?.lastName}
              </Badge>
            </div>
          </div>

          {/* Order Type Selection */}
          <div className="space-y-3 mb-4">
            <div className="grid grid-cols-2 gap-2">
              {(['Dine-in', 'Takeaway', 'Delivery'] as const).map((type) => (
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

            {orderType === 'Dine-in' && selectedTable && (
              <div className="p-2 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-blue-800">Table</p>
                    <p className="text-sm font-bold text-blue-900">Table {selectedTable.number}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedTable(null)}
                    className="text-blue-600 hover:text-blue-800 h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )}

            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCustomerSearch(true)}
                className="flex-1 justify-start text-xs"
              >
                <User className="mr-2 h-3 w-3" />
                {selectedCustomer ? selectedCustomer.cardName : 'Walk-in'}
              </Button>
              {selectedCustomer && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedCustomer(null)}
                  className="text-gray-500 hover:text-red-600 h-8 w-8 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <QuickActionsPanel
            onHoldOrder={holdCurrentOrder}
            onRecallOrder={recallHeldOrder}
            onApplyDiscount={applyDiscount}
            heldOrdersCount={heldOrders.length}
            currentDiscount={0}
          />

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto mt-4">
            <div className="space-y-2">
              {cart.map((item) => (
                <div key={item.itemCode} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.description}</p>
                    <p className="text-xs text-gray-500">{item.itemCode}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateQuantity(item.itemCode, item.quantity - 1)}
                      className="h-6 w-6 p-0"
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="text-sm font-medium min-w-[2rem] text-center">{item.quantity}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateQuantity(item.itemCode, item.quantity + 1)}
                      className="h-6 w-6 p-0"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeFromCart(item.itemCode)}
                      className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="text-right ml-2">
                    <p className="font-bold text-sm">₱{(Number(item.price) * item.quantity).toFixed(2)}</p>
                    <p className="text-xs text-gray-500">₱{Number(item.price).toFixed(2)} each</p>
                  </div>
                </div>
              ))}
            </div>

            {cart.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No items in cart</p>
                <p className="text-xs">Select items to add to order</p>
              </div>
            )}
          </div>

          {/* Cart Summary */}
          {cart.length > 0 && (
            <div className="border-t pt-4 mt-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>₱{cart.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax:</span>
                  <span>₱0.00</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Service Charge:</span>
                  <span>₱0.00</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>₱{cart.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <Button
                className="w-full mt-4 bg-green-600 hover:bg-green-700"
                onClick={() => setShowPayment(true)}
                disabled={showPayment}
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Process Payment
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Dialogs */}
      <PaymentDialog
        open={showPayment}
        onOpenChange={setShowPayment}
        onPayment={handlePayment}
        total={cart.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0)}
        paymentMethods={paymentMethods}
        discounts={discounts}
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
        onAddToCart={addToCart}
        menuItems={menuItems}
        cart={cart}
      />

      {orderConfirmationData && (
        <OrderConfirmationDialog
          isOpen={showOrderConfirmation}
          onClose={() => setShowOrderConfirmation(false)}
          orderData={orderConfirmationData}
        />
      )}

      <NumericKeypad
        isOpen={showNumericKeypad}
        onClose={() => setShowNumericKeypad(false)}
        onConfirm={handleQuantityConfirm}
        title="Enter Quantity"
      />

      <POSShortcuts
        onPayment={() => cart.length > 0 && setShowPayment(true)}
        onClearCart={clearCart}
        onHoldOrder={holdCurrentOrder}
        onRecallOrder={() => heldOrders.length > 0 && recallHeldOrder(0)}
        onSearch={focusSearch}
        disabled={showPayment || showCustomerSearch || showTableDialog || showNumericKeypad}
      />
    </div>
  )
}