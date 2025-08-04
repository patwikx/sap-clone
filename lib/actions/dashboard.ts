import { prisma } from '@/lib/prisma'

export async function getDashboardStats() {
  try {
    const [
      businessPartners,
      items,
      employees,
      openSalesOrders,
      openPurchaseOrders,
      openServiceCalls,
      recentSalesOrders,
      recentPurchaseOrders,
      lowStockItems
    ] = await Promise.all([
      prisma.businessPartner.count(),
      prisma.item.count(),
      prisma.employee.count(),
      prisma.salesOrder.count({ where: { docStatus: 'O' } }),
      prisma.purchaseOrder.count({ where: { docStatus: 'O' } }),
      prisma.serviceCall.count({ where: { status: -3 } }),
      prisma.salesOrder.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          businessPartner: true
        }
      }),
      prisma.purchaseOrder.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          businessPartner: true
        }
      }),
      prisma.item.findMany({
        where: {
          onHand: { lte: 10 }
        },
        include: {
          itemGroup: true
        },
        take: 10
      })
    ])

    return {
      stats: {
        businessPartners,
        items,
        employees,
        openSalesOrders,
        openPurchaseOrders,
        openServiceCalls
      },
      recentActivity: {
        salesOrders: recentSalesOrders,
        purchaseOrders: recentPurchaseOrders
      },
      alerts: {
        lowStockItems
      }
    }
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return {
      stats: {
        businessPartners: 0,
        items: 0,
        employees: 0,
        openSalesOrders: 0,
        openPurchaseOrders: 0,
        openServiceCalls: 0
      },
      recentActivity: {
        salesOrders: [],
        purchaseOrders: []
      },
      alerts: {
        lowStockItems: []
      }
    }
  }
}