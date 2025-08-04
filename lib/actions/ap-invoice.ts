'use server'

import { prisma } from '@/lib/prisma'
import { APInvoiceFormData } from '@/lib/types'
import { revalidatePath } from 'next/cache'
import { DocStatus } from '@prisma/client'

export async function getAPInvoices() {
  try {
    const apInvoices = await prisma.aPInvoice.findMany({
      include: {
        businessPartner: true,
        lines: true
      },
      orderBy: { createdAt: 'desc' }
    })
    return apInvoices
  } catch (error) {
    console.error('Error fetching AP invoices:', error)
    return []
  }
}

export async function getAPInvoiceById(id: number) {
  try {
    const apInvoice = await prisma.aPInvoice.findUnique({
      where: { id },
      include: {
        businessPartner: true,
        lines: true
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
    const lastInvoice = await prisma.aPInvoice.findFirst({
      orderBy: { docNum: 'desc' }
    })
    const nextDocNum = (lastInvoice?.docNum || 0) + 1

    const totalBeforeTax = data.lines.reduce((sum, line) => sum + (line.quantity * line.price), 0)
    const taxAmount = totalBeforeTax * 0.12
    const docTotal = totalBeforeTax + taxAmount

    const apInvoice = await prisma.aPInvoice.create({
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

    revalidatePath('/dashboard/ap-invoice')
    return { success: true, data: apInvoice }
  } catch (error) {
    console.error('Error creating AP invoice:', error)
    return { success: false, error: 'Failed to create AP invoice' }
  }
}

export async function updateAPInvoiceStatus(id: number, status: DocStatus) {
  try {
    const apInvoice = await prisma.aPInvoice.update({
      where: { id },
      data: { docStatus: status }
    })

    revalidatePath('/dashboard/ap-invoice')
    return { success: true, data: apInvoice }
  } catch (error) {
    console.error('Error updating AP invoice status:', error)
    return { success: false, error: 'Failed to update AP invoice status' }
  }
}

export async function deleteAPInvoice(id: number) {
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