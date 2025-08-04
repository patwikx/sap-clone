'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { DocStatus } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'

// Define the form data interface based on the actual schema
interface ARInvoiceFormData {
  number: string
  status: DocStatus
  invoiceDate: Date
  totalAmount: number
  businessUnitId: string
  customerId: string
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

export async function getARInvoices() {
  try {
    const arInvoices = await prisma.aRInvoice.findMany({
      include: {
        customer: true,
        lines: {
          include: {
            item: true,
            taxCode: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    return arInvoices
  } catch (error) {
    console.error('Error fetching AR invoices:', error)
    return []
  }
}

export async function getARInvoiceById(id: string) {
  try {
    const arInvoice = await prisma.aRInvoice.findUnique({
      where: { id },
      include: {
        customer: true,
        lines: {
          include: {
            item: true,
            taxCode: true
          }
        }
      }
    })
    return arInvoice
  } catch (error) {
    console.error('Error fetching AR invoice:', error)
    return null
  }
}

export async function createARInvoice(data: ARInvoiceFormData) {
  try {
    const arInvoice = await prisma.aRInvoice.create({
      data: {
        number: data.number,
        status: data.status,
        invoiceDate: data.invoiceDate,
        totalAmount: new Decimal(data.totalAmount),
        businessUnitId: data.businessUnitId,
        customerId: data.customerId,
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

    revalidatePath('/dashboard/ar-invoice')
    return { success: true, data: arInvoice }
  } catch (error) {
    console.error('Error creating AR invoice:', error)
    return { success: false, error: 'Failed to create AR invoice' }
  }
}

export async function updateARInvoiceStatus(id: string, status: DocStatus) {
  try {
    const arInvoice = await prisma.aRInvoice.update({
      where: { id },
      data: { status: status }
    })

    revalidatePath('/dashboard/ar-invoice')
    return { success: true, data: arInvoice }
  } catch (error) {
    console.error('Error updating AR invoice status:', error)
    return { success: false, error: 'Failed to update AR invoice status' }
  }
}

export async function deleteARInvoice(id: string) {
  try {
    await prisma.aRInvoice.delete({
      where: { id }
    })

    revalidatePath('/dashboard/ar-invoice')
    return { success: true }
  } catch (error) {
    console.error('Error deleting AR invoice:', error)
    return { success: false, error: 'Failed to delete AR invoice' }
  }
}