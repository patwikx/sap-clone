'use server'

import { prisma } from '@/lib/prisma'
import { PurchaseOrderFormData } from '@/lib/types'
import { revalidatePath } from 'next/cache'
import { DocStatus } from '@prisma/client'

export async function getPurchaseOrders() {
  try {
    const purchaseOrders = await prisma.purchaseOrder.findMany({
      include: {
        businessPartner: true,
        lines: true
      },
      orderBy: { createdAt: 'desc' }
    })
    return purchaseOrders
  } catch (error) {
    console.error('Error fetching purchase orders:', error)
    return []
  }
}

export async function getPurchaseOrderById(id: number) {
  try {
    const purchaseOrder = await prisma.purchaseOrder.findUnique({
      where: { id },
      include: {
        businessPartner: true,
        lines: true
      }
    })
    return purchaseOrder
  } catch (error) {
    console.error('Error fetching purchase order:', error)
    return null
  }
}

export async function createPurchaseOrder(data: PurchaseOrderFormData) {
  try {
    const lastOrder = await prisma.purchaseOrder.findFirst({
      orderBy: { docNum: 'desc' }
    })
    const nextDocNum = (lastOrder?.docNum || 0) + 1

    const totalBeforeTax = data.lines.reduce((sum, line) => sum + (line.quantity * line.price), 0)
    const taxAmount = totalBeforeTax * 0.12
    const docTotal = totalBeforeTax + taxAmount

    const purchaseOrder = await prisma.purchaseOrder.create({
      data: {
        docNum: nextDocNum,
        businessPartnerId: data.businessPartnerId,
        docDate: data.docDate,
        docDueDate: data.docDueDate,
        taxDate: data.taxDate,
        totalBeforeTax,
        taxAmount,
        docTotal,
        comments: data.comments,
        lines: {
          create: data.lines.map(line => ({
            itemCode: line.itemCode,
            description: line.description,
            quantity: line.quantity,
            openQty: line.quantity,
            price: line.price,
            lineTotal: line.quantity * line.price
          }))
        }
      }
    })

    revalidatePath('/dashboard/purchase-orders')
    return { success: true, data: purchaseOrder }
  } catch (error) {
    console.error('Error creating purchase order:', error)
    return { success: false, error: 'Failed to create purchase order' }
  }
}

export async function updatePurchaseOrderStatus(id: number, status: DocStatus) {
  try {
    const purchaseOrder = await prisma.purchaseOrder.update({
      where: { id },
      data: { docStatus: status }
    })

    revalidatePath('/dashboard/purchase-orders')
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

    revalidatePath('/dashboard/purchase-orders')
    return { success: true }
  } catch (error) {
    console.error('Error deleting purchase order:', error)
    return { success: false, error: 'Failed to delete purchase order' }
  }
}