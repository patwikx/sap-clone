'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { DocStatus } from '@prisma/client'

const purchaseOrderSchema = z.object({
  businessPartnerId: z.string().min(1, 'Business Partner is required'),
  docDate: z.date(),
  docDueDate: z.date(),
  taxDate: z.date(),
  comments: z.string().optional(),
  lines: z.array(z.object({
    itemCode: z.string().min(1),
    description: z.string().min(1),
    quantity: z.number().min(1),
    price: z.number().min(0)
  })).min(1, 'At least one line item is required')
})

export type PurchaseOrderFormData = z.infer<typeof purchaseOrderSchema>

export type PurchaseOrderWithRelations = Awaited<ReturnType<typeof getPurchaseOrderById>>

export async function createPurchaseOrder(data: PurchaseOrderFormData) {
  try {
    const validatedData = purchaseOrderSchema.parse(data)
    
    // Calculate total
    const docTotal = validatedData.lines.reduce((total, line) => {
      return total + (line.quantity * line.price)
    }, 0)

    // Get next document number
    const lastOrder = await prisma.purchaseOrder.findFirst({
      orderBy: { docNum: 'desc' }
    })
    const nextDocNum = (lastOrder?.docNum || 0) + 1

    const purchaseOrder = await prisma.purchaseOrder.create({
      data: {
        docNum: nextDocNum,
        businessPartnerId: validatedData.businessPartnerId,
        docDate: validatedData.docDate,
        docDueDate: validatedData.docDueDate,
        taxDate: validatedData.taxDate,
        docTotal,
        comments: validatedData.comments,
        lines: {
          create: validatedData.lines.map((line, index) => ({
            lineNum: index + 1,
            itemCode: line.itemCode,
            description: line.description,
            quantity: line.quantity,
            openQty: line.quantity,
            price: line.price,
            lineTotal: line.quantity * line.price
          }))
        }
      },
      include: {
        businessPartner: true,
        lines: {
          include: {
            item: true
          }
        }
      }
    })

    revalidatePath('/purchase-orders')
    return { success: true, data: purchaseOrder }
  } catch (error) {
    console.error('Error creating purchase order:', error)
    return { success: false, error: 'Failed to create purchase order' }
  }
}

export async function getPurchaseOrders() {
  try {
    return await prisma.purchaseOrder.findMany({
      include: {
        businessPartner: true,
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
    console.error('Error fetching purchase orders:', error)
    return []
  }
}

export async function getPurchaseOrderById(id: number) {
  try {
    return await prisma.purchaseOrder.findUnique({
      where: { id },
      include: {
        businessPartner: true,
        lines: {
          include: {
            item: true
          }
        }
      }
    })
  } catch (error) {
    console.error('Error fetching purchase order:', error)
    return null
  }
}

export async function updatePurchaseOrderStatus(id: number, status: DocStatus) {
  try {
    const purchaseOrder = await prisma.purchaseOrder.update({
      where: { id },
      data: { docStatus: status },
      include: {
        businessPartner: true,
        lines: {
          include: {
            item: true
          }
        }
      }
    })

    revalidatePath('/purchase-orders')
    revalidatePath(`/purchase-orders/${id}`)
    return { success: true, data: purchaseOrder }
  } catch (error) {
    console.error('Error updating purchase order status:', error)
    return { success: false, error: 'Failed to update purchase order status' }
  }
}

export async function deletePurchaseOrder(id: number) {
  try {
    await prisma.purchaseOrder.delete({
      where: { id }
    })

    revalidatePath('/purchase-orders')
    return { success: true }
  } catch (error) {
    console.error('Error deleting purchase order:', error)
    return { success: false, error: 'Failed to delete purchase order' }
  }
}