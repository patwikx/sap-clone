'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { POSOrderFormData } from '@/lib/types'

// POS Shift Management
export async function startPOSShift(terminalId: string, userId: string, startAmount: number) {
  try {
    // Check if there's already an open shift for this terminal
    const existingShift = await prisma.pOSShift.findFirst({
      where: {
        terminalId,
        status: 'Open'
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
        status: 'Open'
      }
    })

    revalidatePath('/dashboard/pos')
    return { success: true, data: shift }
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
        status: 'Closed'
      }
    })

    revalidatePath('/dashboard/pos')
    return { success: true, data: shift }
  } catch (error) {
    console.error('Error ending POS shift:', error)
    return { success: false, error: 'Failed to end shift' }
  }
}

export async function getCurrentShift(terminalId: string) {
  try {
    const shift = await prisma.pOSShift.findFirst({
      where: {
        terminalId,
        status: 'Open'
      },
      include: {
        user: true,
        terminal: true
      }
    })

    return shift
  } catch (error) {
    console.error('Error getting current shift:', error)
    return null
  }
}

// POS Order Management
export async function createPOSOrder(data: POSOrderFormData) {
  try {
    // Get next document number
    const lastOrder = await prisma.pOSOrder.findFirst({
      orderBy: { docNum: 'desc' }
    })
    const nextDocNum = (lastOrder?.docNum || 0) + 1

    // Calculate totals
    const totalBeforeTax = data.lines.reduce((sum, line) => sum + (line.quantity * line.price), 0)
    const discountAmount = data.discounts?.reduce((sum, discount) => sum + discount.amount, 0) || 0
    const taxAmount = (totalBeforeTax - discountAmount) * 0.12 // 12% VAT
    const docTotal = totalBeforeTax - discountAmount + taxAmount

    const order = await prisma.pOSOrder.create({
      data: {
        docNum: nextDocNum,
        docDate: new Date(),
        totalBeforeTax,
        docTotal,
        taxAmount,
        orderType: data.orderType,
        businessUnitId: data.businessUnitId,
        terminalId: data.terminalId,
        shiftId: data.shiftId,
        tableId: data.tableId,
        customerId: data.customerId,
        lines: {
          create: data.lines.map(line => ({
            itemCode: line.itemCode,
            description: line.description,
            quantity: line.quantity,
            price: line.price,
            lineTotal: line.quantity * line.price
          }))
        },
        payments: {
          create: data.payments.map(payment => ({
            paymentMethodId: payment.paymentMethodId,
            amount: payment.amount
          }))
        },
        discounts: data.discounts ? {
          create: data.discounts.map(discount => ({
            discountId: discount.discountId,
            amount: discount.amount
          }))
        } : undefined
      },
      include: {
        lines: true,
        payments: {
          include: {
            paymentMethod: true
          }
        },
        discounts: {
          include: {
            discount: true
          }
        }
      }
    })

    revalidatePath('/dashboard/pos')
    return { success: true, data: order }
  } catch (error) {
    console.error('Error creating POS order:', error)
    return { success: false, error: 'Failed to create order' }
  }
}

export async function getPOSOrders(terminalId?: string, shiftId?: string) {
  try {
    const orders = await prisma.pOSOrder.findMany({
      where: {
        ...(terminalId && { terminalId }),
        ...(shiftId && { shiftId })
      },
      include: {
        customer: true,
        terminal: true,
        shift: true,
        table: true,
        businessUnit: true,
        lines: true,
        payments: {
          include: {
            paymentMethod: true
          }
        },
        discounts: {
          include: {
            discount: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return orders
  } catch (error) {
    console.error('Error fetching POS orders:', error)
    return []
  }
}

export async function getPOSOrderById(id: number) {
  try {
    const order = await prisma.pOSOrder.findUnique({
      where: { id },
      include: {
        customer: true,
        terminal: true,
        shift: true,
        table: true,
        businessUnit: true,
        lines: true,
        payments: {
          include: {
            paymentMethod: true
          }
        },
        discounts: {
          include: {
            discount: true
          }
        }
      }
    })

    return order
  } catch (error) {
    console.error('Error fetching POS order:', error)
    return null
  }
}

export async function voidPOSOrder(id: number) {
  try {
    const order = await prisma.pOSOrder.update({
      where: { id },
      data: {
        status: 'Voided',
        voidedAt: new Date()
      }
    })

    revalidatePath('/dashboard/pos')
    return { success: true, data: order }
  } catch (error) {
    console.error('Error voiding POS order:', error)
    return { success: false, error: 'Failed to void order' }
  }
}

// Terminal Management
export async function getPOSTerminals() {
  try {
    const terminals = await prisma.pOSTerminal.findMany({
      include: {
        businessUnit: true,
        shifts: {
          where: { status: 'Open' },
          include: {
            user: true
          }
        }
      },
      orderBy: { name: 'asc' }
    })

    return terminals
  } catch (error) {
    console.error('Error fetching POS terminals:', error)
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

// Table Management
export async function getRestaurantTables(businessUnitId?: string) {
  try {
    const tables = await prisma.restaurantTable.findMany({
      where: businessUnitId ? { businessUnitId } : undefined,
      include: {
        businessUnit: true
      },
      orderBy: { tableNumber: 'asc' }
    })

    return tables
  } catch (error) {
    console.error('Error fetching restaurant tables:', error)
    return []
  }
}

export async function updateTableStatus(tableId: string, status: 'Available' | 'Occupied' | 'Reserved') {
  try {
    const table = await prisma.restaurantTable.update({
      where: { id: tableId },
      data: { status }
    })

    revalidatePath('/dashboard/pos')
    return { success: true, data: table }
  } catch (error) {
    console.error('Error updating table status:', error)
    return { success: false, error: 'Failed to update table status' }
  }
}

// Menu Management
export async function getMenus(businessUnitId?: string) {
  try {
    const menus = await prisma.menu.findMany({
      where: businessUnitId ? { businessUnitId } : undefined,
      include: {
        categories: {
          include: {
            menuItems: {
              include: {
                item: true
              }
            }
          }
        },
        businessUnit: true
      },
      orderBy: { name: 'asc' }
    })

    return menus
  } catch (error) {
    console.error('Error fetching menus:', error)
    return []
  }
}

export async function getMenuItems(businessUnitId?: string) {
  try {
    const menuItems = await prisma.item.findMany({
      where: {
        itemType: 'M',
        ...(businessUnitId && {
          menuItems: {
            some: {
              menuCategory: {
                menu: {
                  businessUnitId
                }
              }
            }
          }
        })
      },
      include: {
        itemGroup: true,
        menuItems: {
          include: {
            menuCategory: {
              include: {
                menu: true
              }
            }
          }
        }
      },
      orderBy: { itemName: 'asc' }
    })

    return menuItems
  } catch (error) {
    console.error('Error fetching menu items:', error)
    return []
  }
}

// Payment Methods
export async function getPaymentMethods() {
  try {
    const paymentMethods = await prisma.paymentMethod.findMany({
      orderBy: { name: 'asc' }
    })

    return paymentMethods
  } catch (error) {
    console.error('Error fetching payment methods:', error)
    return []
  }
}

// Discounts
export async function getDiscounts() {
  try {
    const discounts = await prisma.discount.findMany({
      orderBy: { name: 'asc' }
    })

    return discounts
  } catch (error) {
    console.error('Error fetching discounts:', error)
    return []
  }
}

// Reports
export async function getPOSShiftReport(shiftId: string) {
  try {
    const shift = await prisma.pOSShift.findUnique({
      where: { id: shiftId },
      include: {
        user: true,
        terminal: true,
        orders: {
          include: {
            lines: true,
            payments: {
              include: {
                paymentMethod: true
              }
            }
          }
        }
      }
    })

    if (!shift) {
      return null
    }

    // Calculate shift totals
    const totalSales = shift.orders.reduce((sum, order) => sum + order.docTotal, 0)
    const totalOrders = shift.orders.length
    const paymentBreakdown = shift.orders.reduce((acc, order) => {
      order.payments.forEach(payment => {
        const method = payment.paymentMethod.name
        acc[method] = (acc[method] || 0) + payment.amount
      })
      return acc
    }, {} as Record<string, number>)

    return {
      shift,
      totalSales,
      totalOrders,
      paymentBreakdown
    }
  } catch (error) {
    console.error('Error generating shift report:', error)
    return null
  }
}

export async function getDailySalesReport(date: Date, businessUnitId?: string) {
  try {
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    const orders = await prisma.pOSOrder.findMany({
      where: {
        docDate: {
          gte: startOfDay,
          lte: endOfDay
        },
        ...(businessUnitId && { businessUnitId }),
        status: { not: 'Voided' }
      },
      include: {
        lines: true,
        payments: {
          include: {
            paymentMethod: true
          }
        },
        terminal: true
      }
    })

    const totalSales = orders.reduce((sum, order) => sum + order.docTotal, 0)
    const totalOrders = orders.length
    const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0

    // Payment method breakdown
    const paymentBreakdown = orders.reduce((acc, order) => {
      order.payments.forEach(payment => {
        const method = payment.paymentMethod.name
        acc[method] = (acc[method] || 0) + payment.amount
      })
      return acc
    }, {} as Record<string, number>)

    // Top selling items
    const itemSales = orders.reduce((acc, order) => {
      order.lines.forEach(line => {
        if (!acc[line.itemCode]) {
          acc[line.itemCode] = {
            itemCode: line.itemCode,
            description: line.description,
            quantity: 0,
            revenue: 0
          }
        }
        acc[line.itemCode].quantity += line.quantity
        acc[line.itemCode].revenue += line.lineTotal
      })
      return acc
    }, {} as Record<string, any>)

    const topItems = Object.values(itemSales)
      .sort((a: any, b: any) => b.revenue - a.revenue)
      .slice(0, 10)

    return {
      date,
      totalSales,
      totalOrders,
      averageOrderValue,
      paymentBreakdown,
      topItems,
      orders
    }
  } catch (error) {
    console.error('Error generating daily sales report:', error)
    return null
  }
}

// Kitchen Display System
export async function getKitchenOrders(businessUnitId: string) {
  try {
    const orders = await prisma.pOSOrder.findMany({
      where: {
        businessUnitId,
        status: 'Pending',
        orderType: { in: ['Dine-In', 'Take-Out', 'Room-Service'] }
      },
      include: {
        lines: {
          include: {
            item: true
          }
        },
        table: true,
        customer: true
      },
      orderBy: { createdAt: 'asc' }
    })

    return orders
  } catch (error) {
    console.error('Error fetching kitchen orders:', error)
    return []
  }
}

export async function updateOrderStatus(orderId: number, status: 'Pending' | 'Preparing' | 'Ready' | 'Served' | 'Voided') {
  try {
    const order = await prisma.pOSOrder.update({
      where: { id: orderId },
      data: { status }
    })

    revalidatePath('/dashboard/pos')
    return { success: true, data: order }
  } catch (error) {
    console.error('Error updating order status:', error)
    return { success: false, error: 'Failed to update order status' }
  }
}

// Customer Management for POS
export async function searchCustomers(query: string) {
  try {
    const customers = await prisma.businessPartner.findMany({
      where: {
        cardType: { in: ['C', 'G'] },
        OR: [
          { cardName: { contains: query, mode: 'insensitive' } },
          { cardCode: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
          { phone1: { contains: query, mode: 'insensitive' } }
        ]
      },
      take: 10,
      orderBy: { cardName: 'asc' }
    })

    return customers
  } catch (error) {
    console.error('Error searching customers:', error)
    return []
  }
}

// Quick service functions
export async function holdOrder(orderId: number) {
  try {
    const order = await prisma.pOSOrder.update({
      where: { id: orderId },
      data: { status: 'Hold' }
    })

    revalidatePath('/dashboard/pos')
    return { success: true, data: order }
  } catch (error) {
    console.error('Error holding order:', error)
    return { success: false, error: 'Failed to hold order' }
  }
}

export async function recallOrder(orderId: number) {
  try {
    const order = await prisma.pOSOrder.update({
      where: { id: orderId },
      data: { status: 'Pending' }
    })

    revalidatePath('/dashboard/pos')
    return { success: true, data: order }
  } catch (error) {
    console.error('Error recalling order:', error)
    return { success: false, error: 'Failed to recall order' }
  }
}

export async function printReceipt(orderId: number) {
  try {
    const order = await prisma.pOSOrder.findUnique({
      where: { id: orderId },
      include: {
        customer: true,
        terminal: true,
        table: true,
        lines: true,
        payments: {
          include: {
            paymentMethod: true
          }
        },
        discounts: {
          include: {
            discount: true
          }
        }
      }
    })

    if (!order) {
      return { success: false, error: 'Order not found' }
    }

    // In a real implementation, this would send to a printer
    // For now, we'll just return the order data for display
    return { success: true, data: order }
  } catch (error) {
    console.error('Error printing receipt:', error)
    return { success: false, error: 'Failed to print receipt' }
  }
}