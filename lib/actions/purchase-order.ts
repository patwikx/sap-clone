'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { DocStatus } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'

// Define the form data interface based on the actual schema
interface PurchaseOrderFormData {
  number: string
  status: DocStatus
  orderDate: Date
  dueDate: Date
  totalAmount: number
  businessUnitId: string
  supplierId: string
  purchaseRequestId?: string
  lines: {
    itemId: string
    description: string
    quantity: number
    unitPrice: number
    lineTotal: number
  }[]
}

export async function getPurchaseOrders() {
  try {
    const purchaseOrders = await prisma.purchaseOrder.findMany({
      include: {
        supplier: true,
        lines: {
          include: {
            item: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    return purchaseOrders
  } catch (error) {
    console.error('Error fetching purchase orders:', error)
    return []
  }
}

export async function getPurchaseOrderById(id: string) {
  try {
    const purchaseOrder = await prisma.purchaseOrder.findUnique({
      where: { id },
      include: {
        supplier: true,
        lines: {
          include: {
            item: true
          }
        }
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
    const purchaseOrder = await prisma.purchaseOrder.create({
      data: {
        number: data.number,
        status: data.status,
        orderDate: data.orderDate,
        dueDate: data.dueDate,
        totalAmount: new Decimal(data.totalAmount),
        businessUnitId: data.businessUnitId,
        supplierId: data.supplierId,
        purchaseRequestId: data.purchaseRequestId,
        lines: {
          create: data.lines.map(line => ({
            itemId: line.itemId,
            description: line.description,
            quantity: new Decimal(line.quantity),
            unitPrice: new Decimal(line.unitPrice),
            lineTotal: new Decimal(line.lineTotal)
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

export async function updatePurchaseOrderStatus(id: string, status: DocStatus) {
  try {
    const purchaseOrder = await prisma.purchaseOrder.update({
      where: { id },
      data: { status: status }
    })

    revalidatePath('/dashboard/purchase-orders')
    return { success: true, data: purchaseOrder }
  } catch (error) {
    console.error('Error updating purchase order status:', error)
    return { success: false, error: 'Failed to update purchase order status' }
  }
}

export async function deletePurchaseOrder(id: string) {
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