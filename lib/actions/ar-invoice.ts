'use server'

import { prisma } from '@/lib/prisma'
import { ARInvoiceFormData } from '@/lib/types'
import { revalidatePath } from 'next/cache'
import { DocStatus } from '@prisma/client'

export async function getARInvoices() {
  try {
    const arInvoices = await prisma.aRInvoice.findMany({
      include: {
        businessPartner: true,
        lines: true
      },
      orderBy: { createdAt: 'desc' }
    })
    return arInvoices
  } catch (error) {
    console.error('Error fetching AR invoices:', error)
    return []
  }
}

export async function getARInvoiceById(id: number) {
  try {
    const arInvoice = await prisma.aRInvoice.findUnique({
      where: { id },
      include: {
        businessPartner: true,
        lines: true
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
    const lastInvoice = await prisma.aRInvoice.findFirst({
      orderBy: { docNum: 'desc' }
    })
    const nextDocNum = (lastInvoice?.docNum || 0) + 1

    const totalBeforeTax = data.lines.reduce((sum, line) => sum + (line.quantity * line.price), 0)
    const taxAmount = totalBeforeTax * 0.12
    const docTotal = totalBeforeTax + taxAmount

    const arInvoice = await prisma.aRInvoice.create({
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
        baseDocType: data.baseDocType,
        baseDocNum: data.baseDocNum,
        lines: {
          create: data.lines.map(line => ({
            itemCode: line.itemCode,
            description: line.description,
            quantity: line.quantity,
            price: line.price,
            lineTotal: line.quantity * line.price,
            baseDocType: line.baseDocType,
            baseDocNum: line.baseDocNum,
            baseLineNum: line.baseLineNum
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

export async function updateARInvoiceStatus(id: number, status: DocStatus) {
  try {
    const arInvoice = await prisma.aRInvoice.update({
      where: { id },
      data: { docStatus: status }
    })

    revalidatePath('/dashboard/ar-invoice')
    return { success: true, data: arInvoice }
  } catch (error) {
    console.error('Error updating AR invoice status:', error)
    return { success: false, error: 'Failed to update AR invoice status' }
  }
}

export async function deleteARInvoice(id: number) {
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