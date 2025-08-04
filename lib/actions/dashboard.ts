import { prisma } from '@/lib/prisma'

export async function getDashboardStats() {
  try {
    const [
      businessPartners,
      items,
      employees,
      openPurchaseOrders,
      openPOSOrders,
      recentPurchaseOrders,
      recentPOSOrders,
      lowStockItems
    ] = await Promise.all([
      prisma.businessPartner.count(),
      prisma.item.count(),
      prisma.employee.count(),
      prisma.purchaseOrder.count({ where: { status: 'OPEN' } }),
      prisma.pOSOrder.count({ where: { status: 'OPEN' } }),
      prisma.purchaseOrder.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          supplier: true
        }
      }),
      prisma.pOSOrder.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: true,
          table: true
        }
      }),
      prisma.item.findMany({
        where: {
          itemWarehouses: {
            some: {
              onHand: { lte: 10 }
            }
          }
        },
        include: {
          itemGroup: true,
          itemWarehouses: true
        },
        take: 10
      })
    ])

    return {
      stats: {
        businessPartners,
        items,
        employees,
        openPurchaseOrders,
        openPOSOrders
      },
      recentActivity: {
        purchaseOrders: recentPurchaseOrders,
        posOrders: recentPOSOrders
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
        openPurchaseOrders: 0,
        openPOSOrders: 0
      },
      recentActivity: {
        purchaseOrders: [],
        posOrders: []
      },
      alerts: {
        lowStockItems: []
      }
    }
  }
}