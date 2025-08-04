'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { DocStatus } from '@prisma/client'

const arInvoiceSchema = z.object({
  businessPartnerId: z.string().min(1, 'Business Partner is required'),
  docDate: z.date(),
  docDueDate: z.date(),
  taxDate: z.date(),
  comments: z.string().optional(),
  baseDocType: z.string().optional(),
  baseDocNum: z.number().optional(),
  lines: z.array(z.object({
    itemCode: z.string().min(1),
    description: z.string().min(1),
    quantity: z.number().min(1),
    price: z.number().min(0),
    baseDocType: z.string().optional(),
    baseDocNum: z.number().optional(),
    baseLineNum: z.number().optional()
  })).min(1, 'At least one line item is required')
})

export type ARInvoiceFormData = z.infer<typeof arInvoiceSchema>

export type ARInvoiceWithRelations = Awaited<ReturnType<typeof getARInvoiceById>>

export async function createARInvoice(data: ARInvoiceFormData) {
  try {
    const validatedData = arInvoiceSchema.parse(data)
    
    // Calculate total
    const docTotal = validatedData.lines.reduce((total, line) => {
      return total + (line.quantity * line.price)
    }, 0)

    // Get next document number
    const lastInvoice = await prisma.aRInvoice.findFirst({
      orderBy: { docNum: 'desc' }
    })
    const nextDocNum = (lastInvoice?.docNum || 0) + 1

    const arInvoice = await prisma.aRInvoice.create({
      data: {
        docNum: nextDocNum,
        businessPartnerId: validatedData.businessPartnerId,
        docDate: validatedData.docDate,
        docDueDate: validatedData.docDueDate,
        taxDate: validatedData.taxDate,
        docTotal,
        comments: validatedData.comments,
        baseDocType: validatedData.baseDocType,
        baseDocNum: validatedData.baseDocNum,
        lines: {
          create: validatedData.lines.map((line, index) => ({
            lineNum: index + 1,
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

    revalidatePath('/ar-invoices')
    return { success: true, data: arInvoice }
  } catch (error) {
    console.error('Error creating AR invoice:', error)
    return { success: false, error: 'Failed to create AR invoice' }
  }
}

export async function getARInvoices() {
  try {
    return await prisma.aRInvoice.findMany({
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
    console.error('Error fetching AR invoices:', error)
    return []
  }
}

export async function getARInvoiceById(id: number) {
  try {
    return await prisma.aRInvoice.findUnique({
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
    console.error('Error fetching AR invoice:', error)
    return null
  }
}

export async function updateARInvoiceStatus(id: number, status: DocStatus) {
  try {
    const arInvoice = await prisma.aRInvoice.update({
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

    revalidatePath('/ar-invoices')
    revalidatePath(`/ar-invoices/${id}`)
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

    revalidatePath('/ar-invoices')
    return { success: true }
  } catch (error) {
    console.error('Error deleting AR invoice:', error)
    return { success: false, error: 'Failed to delete AR invoice' }
  }
}