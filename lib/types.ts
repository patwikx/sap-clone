import { Decimal } from '@prisma/client/runtime/library'

// POS Types
export interface POSOrderFormData {
  terminalId: string
  shiftId: string
  customerId?: string
  tableId?: string
  orderType: 'Dine-in' | 'Takeaway' | 'Delivery'
  lines: POSOrderLineFormData[]
  payments: POSPaymentFormData[]
  discounts?: POSDiscountFormData[]
}

export interface POSOrderLineFormData {
  menuItemId: string
  quantity: number
  unitPrice: number
  notes?: string
}

export interface POSPaymentFormData {
  paymentMethodId: string
  amount: number
}

export interface POSDiscountFormData {
  discountId: string
  amount: number
}

export interface POSTerminalWithShifts {
  id: string
  name: string
  businessUnit: {
    id: string
    name: string
  }
  shifts: Array<{
    id: string
    status: string
    startTime: Date
    endTime?: Date | null
    startAmount: Decimal
    endAmount?: Decimal | null
    user: {
      id: string
      email: string
      employee?: {
        firstName: string
        lastName: string
      }
    }
  }>
}

export interface POSShiftWithDetails {
  id: string
  startAmount: Decimal
  endAmount?: Decimal
  startTime: Date
  endTime?: Date | null
  status: string
  user: {
    id: string
    employee?: {
      firstName: string
      lastName: string
    }
  }
  terminal: {
    id: string
    name: string
    businessUnit: {
      id: string
      name: string
    }
  }
  posOrders: POSOrderWithDetails[]
}

export interface POSOrderWithDetails {
  id: string
  number: string
  orderDate: Date
  totalAmount: Decimal
  status: string
  orderType: string
  createdAt: Date
  customer?: {
    id: string
    name: string
  }
  table?: {
    id: string
    number: string
  }
  lines: Array<{
    id: string
    quantity: Decimal
    unitPrice: Decimal
    lineTotal: Decimal
    description: string
    item: {
      id: string
      name: string
      type: string
    }
  }>
  payments: Array<{
    id: string
    amount: Decimal
    paymentMethod: {
      id: string
      name: string
    }
  }>
}

export interface MenuItemWithDetails {
  id: string
  name: string
  code: string
  type: string
  price: Decimal
  cost: Decimal
  currency: string
  isActive: boolean
}

export interface PaymentMethodData {
  id: string
  name: string
  isActive: boolean
}

export interface DiscountData {
  id: string
  name: string
  type: 'Percentage' | 'Fixed'
  value: Decimal
  isActive: boolean
}

export interface RestaurantTableWithDetails {
  id: string
  number: string
  capacity: number
  status: string
  businessUnit: {
    id: string
    name: string
  }
}

export interface BusinessPartnerForPOS {
  id: string
  cardName: string
  cardCode: string
  phone?: string
  email?: string
}

export interface DailySalesReport {
  date: Date
  totalSales: number
  totalOrders: number
  averageOrderValue: number
  salesByPaymentMethod: Array<{
    paymentMethod: string
    amount: number
    count: number
  }>
  salesByCategory: Array<{
    category: string
    amount: number
    quantity: number
  }>
}

export interface ShiftReport {
  shiftId: string
  startTime: Date
  endTime?: Date | null
  startAmount: number
  endAmount?: number
  totalSales: number
  totalOrders: number
  cashSales: number
  cardSales: number
  voidedOrders: number
  voidedAmount: number
}

export interface MenuWithRelations {
  id: string
  name: string
  businessUnit: {
    id: string
    name: string
  }
  isActive: boolean
}

// Payment Dialog Types
export interface PaymentItem {
  paymentMethodId: string
  paymentMethodName: string
  amount: number
}

export interface AppliedDiscount {
  discountId: string
  discountName: string
  amount: number
}

// Cart Types
export interface CartItem {
  itemCode: string
  description: string
  price: number
  quantity: number
  total: number
  tableId?: string | null
}

// Shift Dialog Types
export interface ShiftFormData {
  startAmount: number
  userId: string
}

export interface EndShiftFormData {
  endAmount: number
}

// Kitchen Display Types
export interface KitchenOrderData {
  id: string
  number: string
  createdAt: Date
  status: string
  orderType: string
  customer?: {
    id: string
    code: string
    name: string
    type: string
    email?: string
    phone?: string
  } | null
  table?: {
    id: string
    number: string
  } | null
  lines: Array<{
    id: string
    code: string
    description: string
    quantity: number
  }>
}

 