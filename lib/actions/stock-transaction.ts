'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { Decimal } from '@prisma/client/runtime/library'

interface StockTransactionFormData {
  itemId: string
  warehouseId: string
  transactionType: string
  quantity: number
  unitCost: number
  totalCost: number
  referenceType?: string
  referenceId?: string
  batchNumber?: string
  serialNumber?: string
}

export async function getStockTransactions() {
  try {
    const transactions = await prisma.stockTransaction.findMany({
      include: {
        item: true,
        warehouse: true
      },
      orderBy: { createdAt: 'desc' }
    })
    return transactions
  } catch (error) {
    console.error('Error fetching stock transactions:', error)
    return []
  }
}

export async function getStockTransactionById(id: string) {
  try {
    const transaction = await prisma.stockTransaction.findUnique({
      where: { id },
      include: {
        item: true,
        warehouse: true
      }
    })
    return transaction
  } catch (error) {
    console.error('Error fetching stock transaction:', error)
    return null
  }
}

export async function createStockTransaction(data: StockTransactionFormData) {
  try {
    const transaction = await prisma.stockTransaction.create({
      data: {
        itemId: data.itemId,
        warehouseId: data.warehouseId,
        transactionType: data.transactionType,
        quantity: new Decimal(data.quantity),
        unitCost: new Decimal(data.unitCost),
        totalCost: new Decimal(data.totalCost),
        referenceType: data.referenceType,
        referenceId: data.referenceId,
        batchNumber: data.batchNumber,
        serialNumber: data.serialNumber
      }
    })

    // Update item warehouse stock levels
    await updateItemWarehouseStock(data.itemId, data.warehouseId, data.transactionType, data.quantity, data.unitCost)

    revalidatePath('/dashboard/inventory/stock-transactions')
    return { success: true, data: transaction }
  } catch (error) {
    console.error('Error creating stock transaction:', error)
    return { success: false, error: 'Failed to create stock transaction' }
  }
}

async function updateItemWarehouseStock(
  itemId: string, 
  warehouseId: string, 
  transactionType: string, 
  quantity: number, 
  unitCost: number
) {
  const itemWarehouse = await prisma.itemWarehouse.findUnique({
    where: {
      itemId_warehouseId: {
        itemId,
        warehouseId
      }
    }
  })

  if (itemWarehouse) {
    // Update existing record
    let newOnHand = Number(itemWarehouse.onHand)
    let newAvgCost = Number(itemWarehouse.avgCost)

    if (transactionType === 'IN') {
      newOnHand += quantity
      // Calculate new average cost using weighted average
      const currentValue = Number(itemWarehouse.onHand) * Number(itemWarehouse.avgCost)
      const newValue = quantity * unitCost
      const totalValue = currentValue + newValue
      newAvgCost = totalValue / newOnHand
    } else if (transactionType === 'OUT') {
      newOnHand = Math.max(0, newOnHand - quantity) // Prevent negative stock
    }

    await prisma.itemWarehouse.update({
      where: {
        itemId_warehouseId: {
          itemId,
          warehouseId
        }
      },
      data: {
        onHand: new Decimal(newOnHand),
        avgCost: new Decimal(newAvgCost)
      }
    })
  } else {
    // Create new record for IN transactions
    if (transactionType === 'IN') {
      await prisma.itemWarehouse.create({
        data: {
          itemId,
          warehouseId,
          onHand: new Decimal(quantity),
          avgCost: new Decimal(unitCost),
          committed: new Decimal(0),
          onOrder: new Decimal(0)
        }
      })
    }
  }
}

export async function getItemStockLevels(itemId: string) {
  try {
    const stockLevels = await prisma.itemWarehouse.findMany({
      where: { itemId },
      include: {
        warehouse: true
      }
    })
    return stockLevels
  } catch (error) {
    console.error('Error fetching item stock levels:', error)
    return []
  }
}

export async function getWarehouseStockLevels(warehouseId: string) {
  try {
    const stockLevels = await prisma.itemWarehouse.findMany({
      where: { warehouseId },
      include: {
        item: {
          include: {
            itemGroup: true
          }
        }
      },
      orderBy: {
        item: {
          name: 'asc'
        }
      }
    })
    return stockLevels
  } catch (error) {
    console.error('Error fetching warehouse stock levels:', error)
    return []
  }
}

export async function getStockMovements(itemId?: string, warehouseId?: string, startDate?: Date, endDate?: Date) {
  try {
    const where: {
      itemId?: string
      warehouseId?: string
      createdAt?: {
        gte?: Date
        lte?: Date
      }
    } = {}
    
    if (itemId) where.itemId = itemId
    if (warehouseId) where.warehouseId = warehouseId
    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) where.createdAt.gte = startDate
      if (endDate) where.createdAt.lte = endDate
    }

    const transactions = await prisma.stockTransaction.findMany({
      where,
      include: {
        item: true,
        warehouse: true
      },
      orderBy: { createdAt: 'desc' }
    })
    return transactions
  } catch (error) {
    console.error('Error fetching stock movements:', error)
    return []
  }
} 