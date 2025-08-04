'use server'

import { prisma } from '@/lib/prisma'
import { ProductionOrderFormData } from '@/lib/types'
import { revalidatePath } from 'next/cache'

export async function getProductionOrders() {
  try {
    const productionOrders = await prisma.productionOrder.findMany({
      include: {
        item: true,
        lines: true
      },
      orderBy: { createdAt: 'desc' }
    })
    return productionOrders
  } catch (error) {
    console.error('Error fetching production orders:', error)
    return []
  }
}

export async function getProductionOrderById(id: number) {
  try {
    const productionOrder = await prisma.productionOrder.findUnique({
      where: { id },
      include: {
        item: true,
        lines: true
      }
    })
    return productionOrder
  } catch (error) {
    console.error('Error fetching production order:', error)
    return null
  }
}

export async function createProductionOrder(data: ProductionOrderFormData) {
  try {
    const lastOrder = await prisma.productionOrder.findFirst({
      orderBy: { docNum: 'desc' }
    })
    const nextDocNum = (lastOrder?.docNum || 0) + 1

    const productionOrder = await prisma.productionOrder.create({
      data: {
        docNum: nextDocNum,
        itemId: data.itemId,
        type: data.type,
        plannedQty: data.plannedQty,
        postingDate: data.postingDate,
        dueDate: data.dueDate,
        lines: data.lines ? {
          create: data.lines.map(line => ({
            itemCode: line.itemCode,
            baseQty: line.baseQty,
            plannedQty: line.plannedQty
          }))
        } : undefined
      }
    })

    revalidatePath('/dashboard/production-order')
    return { success: true, data: productionOrder }
  } catch (error) {
    console.error('Error creating production order:', error)
    return { success: false, error: 'Failed to create production order' }
  }
}

export async function updateProductionOrderStatus(id: number, status: 'P' | 'R' | 'C' | 'L') {
  try {
    const productionOrder = await prisma.productionOrder.update({
      where: { id },
      data: { status }
    })

    revalidatePath('/dashboard/production-order')
    return { success: true, data: productionOrder }
  } catch (error) {
    console.error('Error updating production order status:', error)
    return { success: false, error: 'Failed to update production order status' }
  }
}

export async function deleteProductionOrder(id: number) {
  try {
    await prisma.productionOrder.delete({
      where: { id }
    })

    revalidatePath('/dashboard/production-order')
    return { success: true }
  } catch (error) {
    console.error('Error deleting production order:', error)
    return { success: false, error: 'Failed to delete production order' }
  }
}