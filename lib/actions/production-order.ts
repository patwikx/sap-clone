'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const productionOrderSchema = z.object({
  itemId: z.string().min(1, 'Item is required'),
  type: z.enum(['S', 'P', 'D']).default('S'),
  plannedQty: z.number().min(1, 'Planned quantity must be greater than 0'),
  postingDate: z.date(),
  dueDate: z.date(),
  lines: z.array(z.object({
    itemCode: z.string().min(1),
    baseQty: z.number().min(0),
    plannedQty: z.number().min(0)
  })).optional()
})

export type ProductionOrderFormData = z.infer<typeof productionOrderSchema>

export type ProductionOrderWithRelations = Awaited<ReturnType<typeof getProductionOrderById>>

export async function createProductionOrder(data: ProductionOrderFormData) {
  try {
    const validatedData = productionOrderSchema.parse(data)
    
    // Get next document number
    const lastOrder = await prisma.productionOrder.findFirst({
      orderBy: { docNum: 'desc' }
    })
    const nextDocNum = (lastOrder?.docNum || 0) + 1

    const productionOrder = await prisma.productionOrder.create({
      data: {
        docNum: nextDocNum,
        itemId: validatedData.itemId,
        type: validatedData.type,
        plannedQty: validatedData.plannedQty,
        postingDate: validatedData.postingDate,
        dueDate: validatedData.dueDate,
        lines: validatedData.lines ? {
          create: validatedData.lines.map((line, index) => ({
            lineNumber: index + 1,
            itemCode: line.itemCode,
            baseQty: line.baseQty,
            plannedQty: line.plannedQty,
            issuedQty: 0
          }))
        } : undefined
      },
      include: {
        item: true,
        lines: {
          include: {
            item: true
          }
        }
      }
    })

    revalidatePath('/production-orders')
    return { success: true, data: productionOrder }
  } catch (error) {
    console.error('Error creating production order:', error)
    return { success: false, error: 'Failed to create production order' }
  }
}

export async function getProductionOrders() {
  try {
    return await prisma.productionOrder.findMany({
      include: {
        item: true,
        lines: {
          include: {
            item: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
  } catch (error) {
    console.error('Error fetching production orders:', error)
    return []
  }
}

export async function getProductionOrderById(id: number) {
  try {
    return await prisma.productionOrder.findUnique({
      where: { id },
      include: {
        item: true,
        lines: {
          include: {
            item: true
          }
        }
      }
    })
  } catch (error) {
    console.error('Error fetching production order:', error)
    return null
  }
}

export async function updateProductionOrderStatus(id: number, status: 'P' | 'R' | 'C' | 'L') {
  try {
    const productionOrder = await prisma.productionOrder.update({
      where: { id },
      data: { status },
      include: {
        item: true,
        lines: {
          include: {
            item: true
          }
        }
      }
    })

    revalidatePath('/production-orders')
    revalidatePath(`/production-orders/${id}`)
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

    revalidatePath('/production-orders')
    return { success: true }
  } catch (error) {
    console.error('Error deleting production order:', error)
    return { success: false, error: 'Failed to delete production order' }
  }
}