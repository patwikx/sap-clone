'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { Decimal } from '@prisma/client/runtime/library'

interface ItemFormData {
  code: string
  name: string
  type: string
  price: number
  cost: number
  currency: string
  procurementMethod: string
  trackingMethod: string
  itemGroupId: string
}

export async function getItems() {
  try {
    const items = await prisma.item.findMany({
      include: {
        itemGroup: true,
        itemWarehouses: {
          include: {
            warehouse: true
          }
        }
      },
      orderBy: { name: 'asc' }
    })
    return items
  } catch (error) {
    console.error('Error fetching items:', error)
    return []
  }
}

export async function getItemById(id: string) {
  try {
    const item = await prisma.item.findUnique({
      where: { id },
      include: {
        itemGroup: true,
        itemWarehouses: {
          include: {
            warehouse: true
          }
        },
        stockTransactions: {
          include: {
            warehouse: true
          },
          orderBy: { createdAt: 'desc' },
          take: 20
        }
      }
    })
    return item
  } catch (error) {
    console.error('Error fetching item:', error)
    return null
  }
}

export async function createItem(data: ItemFormData) {
  try {
    const item = await prisma.item.create({
      data: {
        code: data.code,
        name: data.name,
        type: data.type,
        price: new Decimal(data.price),
        cost: new Decimal(data.cost),
        currency: data.currency,
        procurementMethod: data.procurementMethod,
        trackingMethod: data.trackingMethod,
        itemGroupId: data.itemGroupId
      }
    })

    revalidatePath('/dashboard/inventory/items')
    return { success: true, data: item }
  } catch (error) {
    console.error('Error creating item:', error)
    return { success: false, error: 'Failed to create item' }
  }
}

export async function updateItem(id: string, data: ItemFormData) {
  try {
    const item = await prisma.item.update({
      where: { id },
      data: {
        code: data.code,
        name: data.name,
        type: data.type,
        price: new Decimal(data.price),
        cost: new Decimal(data.cost),
        currency: data.currency,
        procurementMethod: data.procurementMethod,
        trackingMethod: data.trackingMethod,
        itemGroupId: data.itemGroupId
      }
    })

    revalidatePath('/dashboard/inventory/items')
    revalidatePath(`/dashboard/inventory/items/${id}`)
    return { success: true, data: item }
  } catch (error) {
    console.error('Error updating item:', error)
    return { success: false, error: 'Failed to update item' }
  }
}

export async function deleteItem(id: string) {
  try {
    await prisma.item.delete({
      where: { id }
    })

    revalidatePath('/dashboard/inventory/items')
    return { success: true }
  } catch (error) {
    console.error('Error deleting item:', error)
    return { success: false, error: 'Failed to delete item' }
  }
}

export async function getLowStockItems(threshold: number = 10) {
  try {
    const items = await prisma.item.findMany({
      where: {
        itemWarehouses: {
          some: {
            onHand: {
              lte: new Decimal(threshold)
            }
          }
        }
      },
      include: {
        itemGroup: true,
        itemWarehouses: {
          include: {
            warehouse: true
          }
        }
      },
      orderBy: { name: 'asc' }
    })
    return items
  } catch (error) {
    console.error('Error fetching low stock items:', error)
    return []
  }
} 