'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { 
  POSOrderFormData, 
  POSOrderLineFormData,
  POSPaymentFormData,
  POSTerminalWithShifts, 
  POSShiftWithDetails, 
  POSOrderWithDetails,
  MenuItemWithDetails,
  PaymentMethodData,
  DiscountData,
  RestaurantTableWithDetails,
  BusinessPartnerForPOS,
  DailySalesReport,
  ShiftReport,
  MenuWithRelations
} from '@/lib/types'

// POS Shift Management
export async function startPOSShift(terminalId: string, userId: string, startAmount: number) {
  try {
    // Check if there's already an open shift for this terminal
    const existingShift = await prisma.pOSShift.findFirst({
      where: {
        terminalId,
        status: 'OPEN'
      }
    })

    if (existingShift) {
      return { success: false, error: 'There is already an open shift for this terminal' }
    }

    const shift = await prisma.pOSShift.create({
      data: {
        startAmount,
        userId,
        terminalId,
        status: 'OPEN'
      },
      include: {
        user: {
          include: {
            employee: true
          }
        },
        terminal: {
          include: {
            businessUnit: true
          }
        },
        posOrders: {
          include: {
            lines: {
              include: {
                item: true
              }
            },
            payments: {
              include: {
                paymentMethod: true
              }
            }
          }
        }
      }
    })

    revalidatePath('/dashboard/pos')
    return { success: true, data: shift as unknown as POSShiftWithDetails }
  } catch (error) {
    console.error('Error starting POS shift:', error)
    return { success: false, error: 'Failed to start shift' }
  }
}

export async function endPOSShift(shiftId: string, endAmount: number) {
  try {
    const shift = await prisma.pOSShift.update({
      where: { id: shiftId },
      data: {
        endAmount,
        endTime: new Date(),
        status: 'CLOSED'
      }
    })

    revalidatePath('/dashboard/pos')
    return { success: true, data: shift }
  } catch (error) {
    console.error('Error ending POS shift:', error)
    return { success: false, error: 'Failed to end shift' }
  }
}

export async function getCurrentShift(terminalId: string): Promise<POSShiftWithDetails | null> {
  try {
    const shift = await prisma.pOSShift.findFirst({
      where: {
        terminalId,
        status: 'OPEN'
      },
      include: {
        user: {
          include: {
            employee: true
          }
        },
        terminal: {
          include: {
            businessUnit: true
          }
        },
        posOrders: {
          include: {
            lines: {
              include: {
                item: true
              }
            },
            payments: {
              include: {
                paymentMethod: true
              }
            }
          }
        }
      }
    })

    return shift as unknown as POSShiftWithDetails | null
  } catch (error) {
    console.error('Error getting current shift:', error)
    return null
  }
}

// POS Order Management
export async function createPOSOrder(data: POSOrderFormData) {
  try {
    // Get the next order number
    const lastOrder = await prisma.pOSOrder.findFirst({
      orderBy: { number: 'desc' }
    })
    const nextOrderNumber = (parseInt(lastOrder?.number || '0') + 1).toString().padStart(6, '0')

    // Calculate totals
    const totalBeforeTax = data.lines.reduce((sum: number, line: POSOrderLineFormData) => sum + (line.quantity * line.unitPrice), 0)
    const taxAmount = 0 // Calculate tax based on your tax logic
    const totalAmount = totalBeforeTax + taxAmount

    const order = await prisma.pOSOrder.create({
      data: {
        number: nextOrderNumber,
        orderDate: new Date(),
        totalBeforeTax,
        taxAmount,
        totalAmount,
        orderType: data.orderType,
        status: 'OPEN',
        businessUnitId: data.terminalId, // This should be the business unit ID
        terminalId: data.terminalId,
        shiftId: data.shiftId,
        tableId: data.tableId,
        customerId: data.customerId,
        lines: {
          create: data.lines.map((line: POSOrderLineFormData) => ({
            itemId: line.menuItemId,
            description: line.notes || '',
            quantity: line.quantity,
            unitPrice: line.unitPrice,
            lineTotal: line.quantity * line.unitPrice,
            taxAmount: 0
          }))
        },
        payments: {
          create: data.payments.map((payment: POSPaymentFormData) => ({
            paymentMethodId: payment.paymentMethodId,
            amount: payment.amount,
            status: 'COMPLETED'
          }))
        }
      },
      include: {
        lines: {
          include: {
            item: true
          }
        },
        payments: {
          include: {
            paymentMethod: true
          }
        },
        customer: true,
        table: true
      }
    })

    revalidatePath('/dashboard/pos')
    return { success: true, data: order as unknown as POSOrderWithDetails }
  } catch (error) {
    console.error('Error creating POS order:', error)
    return { success: false, error: 'Failed to create order' }
  }
}

export async function getPOSOrders(terminalId?: string, shiftId?: string): Promise<POSOrderWithDetails[]> {
  try {
    const where: { terminalId?: string; shiftId?: string } = {}
    if (terminalId) where.terminalId = terminalId
    if (shiftId) where.shiftId = shiftId

    const orders = await prisma.pOSOrder.findMany({
      where,
      include: {
        lines: {
          include: {
            item: true
          }
        },
        payments: {
          include: {
            paymentMethod: true
          }
        },
        customer: true,
        table: true
      },
      orderBy: { orderDate: 'desc' }
    })

    return orders as unknown as POSOrderWithDetails[]
  } catch (error) {
    console.error('Error getting POS orders:', error)
    return []
  }
}

export async function getPOSOrderById(id: string): Promise<POSOrderWithDetails | null> {
  try {
    const order = await prisma.pOSOrder.findUnique({
      where: { id },
      include: {
        lines: {
          include: {
            item: true
          }
        },
        payments: {
          include: {
            paymentMethod: true
          }
        },
        customer: true,
        table: true
      }
    })

    return order as unknown as POSOrderWithDetails | null
  } catch (error) {
    console.error('Error getting POS order:', error)
    return null
  }
}

export async function voidPOSOrder(id: string) {
  try {
    await prisma.pOSOrder.update({
      where: { id },
      data: {
        status: 'CANCELLED'
      }
    })

    revalidatePath('/dashboard/pos')
    return { success: true }
  } catch (error) {
    console.error('Error voiding POS order:', error)
    return { success: false, error: 'Failed to void order' }
  }
}

// POS Terminal Management
export async function getPOSTerminals(): Promise<POSTerminalWithShifts[]> {
  try {
    const terminals = await prisma.pOSTerminal.findMany({
      include: {
        businessUnit: true,
        shifts: {
          where: {
            status: 'OPEN'
          },
          include: {
            user: {
              include: {
                employee: true
              }
            }
          }
        }
      }
    })

    return terminals as POSTerminalWithShifts[]
  } catch (error) {
    console.error('Error getting POS terminals:', error)
    return []
  }
}

export async function getPOSTerminalById(id: string): Promise<POSTerminalWithShifts | null> {
  try {
    const terminal = await prisma.pOSTerminal.findUnique({
      where: { id },
      include: {
        businessUnit: true,
        shifts: {
          include: {
            user: {
              include: {
                employee: true
              }
            }
          }
        }
      }
    })
    return terminal as POSTerminalWithShifts
  } catch (error) {
    console.error('Error fetching POS terminal:', error)
    return null
  }
}

export async function getRecentOrdersByTerminal(terminalId: string, limit: number = 10): Promise<POSOrderWithDetails[]> {
  try {
    const orders = await prisma.pOSOrder.findMany({
      where: { terminalId },
      include: {
        customer: true,
        table: true,
        lines: {
          include: {
            item: true
          }
        },
        payments: {
          include: {
            paymentMethod: true
          }
        }
      },
      orderBy: { orderDate: 'desc' },
      take: limit
    })
    return orders as unknown as POSOrderWithDetails[]
  } catch (error) {
    console.error('Error fetching recent orders:', error)
    return []
  }
}

export async function createPOSTerminal(name: string, businessUnitId: string) {
  try {
    const terminal = await prisma.pOSTerminal.create({
      data: {
        name,
        businessUnitId
      }
    })

    revalidatePath('/dashboard/pos')
    return { success: true, data: terminal }
  } catch (error) {
    console.error('Error creating POS terminal:', error)
    return { success: false, error: 'Failed to create terminal' }
  }
}

// Restaurant Table Management
export async function getRestaurantTables(businessUnitId?: string): Promise<RestaurantTableWithDetails[]> {
  try {
    const where: { businessUnitId?: string } = {}
    if (businessUnitId) where.businessUnitId = businessUnitId

    const tables = await prisma.restaurantTable.findMany({
      where,
      include: {
        businessUnit: true
      },
      orderBy: { number: 'asc' }
    })

    return tables as unknown as RestaurantTableWithDetails[]
  } catch (error) {
    console.error('Error getting restaurant tables:', error)
    return []
  }
}

export async function updateTableStatus(tableId: string, status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED') {
  try {
    await prisma.restaurantTable.update({
      where: { id: tableId },
      data: { status }
    })

    revalidatePath('/dashboard/pos')
    return { success: true }
  } catch (error) {
    console.error('Error updating table status:', error)
    return { success: false, error: 'Failed to update table status' }
  }
}

// Menu Management
export async function getMenus(businessUnitId?: string): Promise<MenuWithRelations[]> {
  try {
    const where: { businessUnitId?: string } = {}
    if (businessUnitId) where.businessUnitId = businessUnitId

    const menus = await prisma.menu.findMany({
      where,
      include: {
        businessUnit: true
      }
    })

    return menus as unknown as MenuWithRelations[]
  } catch (error) {
    console.error('Error getting menus:', error)
    return []
  }
}

export async function getMenuItems(businessUnitId?: string): Promise<MenuItemWithDetails[]> {
  try {
    const where: { type: string; businessUnitId?: string } = {
      type: 'M' // Menu items
    }

    if (businessUnitId) {
      where.businessUnitId = businessUnitId
    }

    const menuItems = await prisma.item.findMany({
      where,
      orderBy: { name: 'asc' }
    })

    console.log('Found menu items:', menuItems.length)
    return menuItems as unknown as MenuItemWithDetails[]
  } catch (error) {
    console.error('Error getting menu items:', error)
    return []
  }
}

// Payment Methods
export async function getPaymentMethods(): Promise<PaymentMethodData[]> {
  try {
    const paymentMethods = await prisma.paymentMethod.findMany({
      where: {
        isActive: true
      }
    })

    return paymentMethods.map(pm => ({
      id: pm.id,
      name: pm.name,
      isActive: pm.isActive
    }))
  } catch (error) {
    console.error('Error getting payment methods:', error)
    return []
  }
}

// Discounts (using Promotions from schema)
export async function getDiscounts(): Promise<DiscountData[]> {
  try {
    const promotions = await prisma.promotion.findMany({
      where: {
        isActive: true
      }
    })

    return promotions.map(p => ({
      id: p.id,
      name: p.name,
      type: p.type === 'PERCENTAGE' ? 'Percentage' : 'Fixed',
      value: p.value,
      isActive: p.isActive
    }))
  } catch (error) {
    console.error('Error getting discounts:', error)
    return []
  }
}

// Reports
export async function getPOSShiftReport(shiftId: string): Promise<ShiftReport | null> {
  try {
    const shift = await prisma.pOSShift.findUnique({
      where: { id: shiftId },
      include: {
        posOrders: {
          include: {
            payments: {
              include: {
                paymentMethod: true
              }
            }
          }
        }
      }
    })

    if (!shift) return null

    const totalSales = shift.posOrders.reduce((sum, order) => sum + Number(order.totalAmount), 0)
    const totalOrders = shift.posOrders.length
    const paymentBreakdown = shift.posOrders.reduce((acc, order) => {
      order.payments.forEach(payment => {
        const methodName = payment.paymentMethod.name
        if (!acc[methodName]) {
          acc[methodName] = { amount: 0, count: 0 }
        }
        acc[methodName].amount += Number(payment.amount)
        acc[methodName].count += 1
      })
      return acc
    }, {} as Record<string, { amount: number; count: number }>)

    const cashSales = paymentBreakdown['CASH']?.amount || 0
    const cardSales = totalSales - cashSales

    return {
      shiftId: shift.id,
      startTime: shift.startTime,
      endTime: shift.endTime,
      startAmount: Number(shift.startAmount),
      endAmount: shift.endAmount ? Number(shift.endAmount) : undefined,
      totalSales,
      totalOrders,
      cashSales,
      cardSales,
      voidedOrders: 0, // Calculate based on voided orders
      voidedAmount: 0
    }
  } catch (error) {
    console.error('Error getting shift report:', error)
    return null
  }
}

export async function getDailySalesReport(date: Date, businessUnitId?: string): Promise<DailySalesReport | null> {
  try {
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    const where: { 
      orderDate: { gte: Date; lte: Date }; 
      status: { not: 'CANCELLED' }; 
      businessUnitId?: string 
    } = {
      orderDate: {
        gte: startOfDay,
        lte: endOfDay
      },
      status: { not: 'CANCELLED' }
    }

    if (businessUnitId) {
      where.businessUnitId = businessUnitId
    }

    const orders = await prisma.pOSOrder.findMany({
      where,
      include: {
        lines: {
          include: {
            item: true
          }
        },
        payments: {
          include: {
            paymentMethod: true
          }
        }
      }
    })

    const totalSales = orders.reduce((sum, order) => sum + Number(order.totalAmount), 0)
    const totalOrders = orders.length
    const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0

    const paymentBreakdown = orders.reduce((acc, order) => {
      order.payments.forEach(payment => {
        const methodName = payment.paymentMethod.name
        if (!acc[methodName]) {
          acc[methodName] = { amount: 0, count: 0 }
        }
        acc[methodName].amount += Number(payment.amount)
        acc[methodName].count += 1
      })
      return acc
    }, {} as Record<string, { amount: number; count: number }>)

    const salesByCategory = orders.reduce((acc, order) => {
      order.lines.forEach(line => {
        const category = line.item.type || 'Other'
        if (!acc[category]) {
          acc[category] = { amount: 0, quantity: 0 }
        }
        acc[category].amount += Number(line.lineTotal)
        acc[category].quantity += Number(line.quantity)
      })
      return acc
    }, {} as Record<string, { amount: number; quantity: number }>)

    return {
      date,
      totalSales,
      totalOrders,
      averageOrderValue,
      salesByPaymentMethod: Object.entries(paymentBreakdown).map(([method, data]: [string, { amount: number; count: number }]) => ({
        paymentMethod: method,
        amount: data.amount,
        count: data.count
      })),
      salesByCategory: Object.entries(salesByCategory).map(([category, data]: [string, { amount: number; quantity: number }]) => ({
        category,
        amount: data.amount,
        quantity: data.quantity
      }))
    }
  } catch (error) {
    console.error('Error getting daily sales report:', error)
    return null
  }
}

// Kitchen Display System
export async function getKitchenOrders(businessUnitId?: string): Promise<POSOrderWithDetails[]> {
  try {
    const where: { 
      status: { in: ['OPEN', 'PENDING'] }; 
      businessUnitId?: string 
    } = {
      status: { in: ['OPEN', 'PENDING'] }
    }

    if (businessUnitId) {
      where.businessUnitId = businessUnitId
    }

    const orders = await prisma.pOSOrder.findMany({
      where,
      include: {
        lines: {
          include: {
            item: true
          }
        },
        payments: {
          include: {
            paymentMethod: true
          }
        },
        customer: true,
        table: true
      },
      orderBy: { orderDate: 'asc' }
    })

    return orders as unknown as POSOrderWithDetails[]
  } catch (error) {
    console.error('Error getting kitchen orders:', error)
    return []
  }
}

export async function updateOrderStatus(orderId: string, status: 'OPEN' | 'PENDING' | 'APPROVED' | 'CLOSED' | 'CANCELLED') {
  try {
    await prisma.pOSOrder.update({
      where: { id: orderId },
      data: { status }
    })

    revalidatePath('/dashboard/pos')
    return { success: true }
  } catch (error) {
    console.error('Error updating order status:', error)
    return { success: false, error: 'Failed to update order status' }
  }
}

// Customer Search
export async function searchCustomers(query: string): Promise<BusinessPartnerForPOS[]> {
  try {
    const customers = await prisma.businessPartner.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { code: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
          { phone: { contains: query, mode: 'insensitive' } }
        ],
        type: 'CUSTOMER',
        isActive: true
      },
      select: {
        id: true,
        name: true,
        code: true,
        email: true,
        phone: true
      },
      orderBy: { name: 'asc' },
      take: 10
    })

    return customers.map(c => ({
      id: c.id,
      cardName: c.name,
      cardCode: c.code,
      phone: c.phone || undefined,
      email: c.email || undefined
    }))
  } catch (error) {
    console.error('Error searching customers:', error)
    return []
  }
}

// Get all business partners for cashier selection
export async function getBusinessPartners(): Promise<BusinessPartnerForPOS[]> {
  try {
    const partners = await prisma.businessPartner.findMany({
      where: {
        isActive: true
      },
      select: {
        id: true,
        name: true,
        code: true,
        email: true,
        phone: true
      },
      orderBy: { name: 'asc' },
      take: 50
    })

    return partners.map(p => ({
      id: p.id,
      cardName: p.name,
      cardCode: p.code,
      phone: p.phone || undefined,
      email: p.email || undefined
    }))
  } catch (error) {
    console.error('Error getting business partners:', error)
    return []
  }
}

// Order Management
export async function holdOrder(orderId: string) {
  try {
    await prisma.pOSOrder.update({
      where: { id: orderId },
      data: { status: 'PENDING' }
    })

    revalidatePath('/dashboard/pos')
    return { success: true }
  } catch (error) {
    console.error('Error holding order:', error)
    return { success: false, error: 'Failed to hold order' }
  }
}

export async function recallOrder(orderId: string) {
  try {
    await prisma.pOSOrder.update({
      where: { id: orderId },
      data: { status: 'OPEN' }
    })

    revalidatePath('/dashboard/pos')
    return { success: true }
  } catch (error) {
    console.error('Error recalling order:', error)
    return { success: false, error: 'Failed to recall order' }
  }
}

export async function printReceipt(orderId: string) {
  try {
    const order = await prisma.pOSOrder.findUnique({
      where: { id: orderId },
      include: {
        lines: {
          include: {
            item: true
          }
        },
        payments: {
          include: {
            paymentMethod: true
          }
        },
        customer: true,
        table: true
      }
    })

    if (!order) {
      return { success: false, error: 'Order not found' }
    }

    // Here you would implement the actual receipt printing logic
    // For now, we'll just return success
    return { success: true, data: order }
  } catch (error) {
    console.error('Error printing receipt:', error)
    return { success: false, error: 'Failed to print receipt' }
  }
}