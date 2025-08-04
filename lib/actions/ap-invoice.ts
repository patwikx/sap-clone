'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { DocStatus } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'

// Define the form data interface based on the actual schema
interface APInvoiceFormData {
  number: string
  status: DocStatus
  invoiceDate: Date
  totalAmount: number
  businessUnitId: string
  supplierId: string
  lines: Array<{
    itemId: string
    description: string
    quantity: number
    unitPrice: number
    lineTotal: number
    taxCodeId?: string
    taxAmount?: number
  }>
}

export async function getAPInvoices() {
  try {
    const apInvoices = await prisma.aPInvoice.findMany({
      include: {
        supplier: true,
        lines: {
          include: {
            item: true,
            taxCode: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    return apInvoices
  } catch (error) {
    console.error('Error fetching AP invoices:', error)
    return []
  }
}

export async function getAPInvoiceById(id: string) {
  try {
    const apInvoice = await prisma.aPInvoice.findUnique({
      where: { id },
      include: {
        supplier: true,
        lines: {
          include: {
            item: true,
            taxCode: true
          }
        }
      }
    })
    return apInvoice
  } catch (error) {
    console.error('Error fetching AP invoice:', error)
    return null
  }
}

export async function createAPInvoice(data: APInvoiceFormData) {
  try {
    const apInvoice = await prisma.aPInvoice.create({
      data: {
        number: data.number,
        status: data.status,
        invoiceDate: data.invoiceDate,
        totalAmount: new Decimal(data.totalAmount),
        businessUnitId: data.businessUnitId,
        supplierId: data.supplierId,
        lines: {
          create: data.lines.map(line => ({
            itemId: line.itemId,
            description: line.description,
            quantity: new Decimal(line.quantity),
            unitPrice: new Decimal(line.unitPrice),
            lineTotal: new Decimal(line.lineTotal),
            taxCodeId: line.taxCodeId,
            taxAmount: line.taxAmount ? new Decimal(line.taxAmount) : new Decimal(0)
          }))
        }
      }
    })

    revalidatePath('/dashboard/ap-invoice')
    return { success: true, data: apInvoice }
  } catch (error) {
    console.error('Error creating AP invoice:', error)
    return { success: false, error: 'Failed to create AP invoice' }
  }
}

export async function updateAPInvoiceStatus(id: string, status: DocStatus) {
  try {
    const apInvoice = await prisma.aPInvoice.update({
      where: { id },
      data: { status: status }
    })

    revalidatePath('/dashboard/ap-invoice')
    return { success: true, data: apInvoice }
  } catch (error) {
    console.error('Error updating AP invoice status:', error)
    return { success: false, error: 'Failed to update AP invoice status' }
  }
}

export async function deleteAPInvoice(id: string) {
  try {
    await prisma.aPInvoice.delete({
      where: { id }
    })

    revalidatePath('/dashboard/ap-invoice')
    return { success: true }
  } catch (error) {
    console.error('Error deleting AP invoice:', error)
    return { success: false, error: 'Failed to delete AP invoice' }
  }
}