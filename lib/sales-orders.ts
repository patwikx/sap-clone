'use server'

import { prisma } from '@/lib/prisma'
import { salesOrderSchema } from '@/lib/validations'
import { SalesOrderFormData, SalesOrderWithRelations } from '@/lib/types'
import { revalidatePath } from 'next/cache'

export async function createSalesOrder(data: SalesOrderFormData) {
  try {
    const validatedData = salesOrderSchema.parse(data)
    
    // Calculate total
    const docTotal = validatedData.lines.reduce((total, line) => {
      return total + (line.quantity * line.price)
    }, 0)

    // Get next document number
    const lastOrder = await prisma.salesOrder.findFirst({
      orderBy: { docNum: 'desc' }
    })
    const nextDocNum = (lastOrder?.docNum || 0) + 1

    const salesOrder = await prisma.salesOrder.create({
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

    revalidatePath('/sales-orders')
    return { success: true, data: salesOrder }
  } catch (error) {
    console.error('Error creating sales order:', error)
    return { success: false, error: 'Failed to create sales order' }
  }
}

export async function getSalesOrders(): Promise<SalesOrderWithRelations[]> {
  try {
    return await prisma.salesOrder.findMany({
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
    console.error('Error fetching sales orders:', error)
    return []
  }
}

export async function getSalesOrderById(id: number): Promise<SalesOrderWithRelations | null> {
  try {
    return await prisma.salesOrder.findUnique({
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
    console.error('Error fetching sales order:', error)
    return null
  }
}

export async function updateSalesOrderStatus(id: number, status: 'O' | 'C' | 'L') {
  try {
    const salesOrder = await prisma.salesOrder.update({
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

    revalidatePath('/sales-orders')
    revalidatePath(`/sales-orders/${id}`)
    return { success: true, data: salesOrder }
  } catch (error) {
    console.error('Error updating sales order status:', error)
    return { success: false, error: 'Failed to update sales order status' }
  }
}

export async function deleteSalesOrder(id: number) {
  try {
    await prisma.salesOrder.delete({
      where: { id }
    })

    revalidatePath('/sales-orders')
    return { success: true }
  } catch (error) {
    console.error('Error deleting sales order:', error)
    return { success: false, error: 'Failed to delete sales order' }
  }
}