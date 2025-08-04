import { prisma } from '@/lib/prisma'
import { SalesOrderFormData, SalesOrderWithRelations } from '@/lib/types'
import { revalidatePath } from 'next/cache'

export async function getSalesOrders(): Promise<SalesOrderWithRelations[]> {
  try {
    const salesOrders = await prisma.salesOrder.findMany({
      include: {
        businessPartner: true,
        businessUnit: true,
        lines: {
          include: {
            item: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    return salesOrders as SalesOrderWithRelations[]
  } catch (error) {
    console.error('Error fetching sales orders:', error)
    return []
  }
}

export async function getSalesOrderById(id: number): Promise<SalesOrderWithRelations | null> {
  try {
    const salesOrder = await prisma.salesOrder.findUnique({
      where: { id },
      include: {
        businessPartner: true,
        businessUnit: true,
        lines: {
          include: {
            item: true
          }
        }
      }
    })
    return salesOrder as SalesOrderWithRelations | null
  } catch (error) {
    console.error('Error fetching sales order:', error)
    return null
  }
}

export async function createSalesOrder(data: SalesOrderFormData) {
  try {
    const lastOrder = await prisma.salesOrder.findFirst({
      orderBy: { docNum: 'desc' }
    })
    const nextDocNum = (lastOrder?.docNum || 0) + 1

    const totalBeforeTax = data.lines.reduce((sum, line) => sum + (line.quantity * line.price), 0)
    const taxAmount = totalBeforeTax * 0.12
    const docTotal = totalBeforeTax + taxAmount

    const salesOrder = await prisma.salesOrder.create({
      data: {
        docNum: nextDocNum,
        businessPartnerId: data.businessPartnerId,
        businessUnitId: data.businessUnitId,
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

    revalidatePath('/dashboard/sales-order')
    return { success: true, data: salesOrder }
  } catch (error) {
    console.error('Error creating sales order:', error)
    return { success: false, error: 'Failed to create sales order' }
  }
}

export async function updateSalesOrderStatus(id: number, status: 'O' | 'C' | 'L') {
  try {
    const salesOrder = await prisma.salesOrder.update({
      where: { id },
      data: { docStatus: status }
    })

    revalidatePath('/dashboard/sales-order')
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

    revalidatePath('/dashboard/sales-order')
    return { success: true }
  } catch (error) {
    console.error('Error deleting sales order:', error)
    return { success: false, error: 'Failed to delete sales order' }
  }
}