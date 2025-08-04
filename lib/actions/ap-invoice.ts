'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { DocStatus } from '@prisma/client'

const apInvoiceSchema = z.object({
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

export type APInvoiceFormData = z.infer<typeof apInvoiceSchema>

export type APInvoiceWithRelations = Awaited<ReturnType<typeof getAPInvoiceById>>

export async function createAPInvoice(data: APInvoiceFormData) {
  try {
    const validatedData = apInvoiceSchema.parse(data)
    
    // Calculate total
    const docTotal = validatedData.lines.reduce((total, line) => {
      return total + (line.quantity * line.price)
    }, 0)

    // Get next document number
    const lastInvoice = await prisma.aPInvoice.findFirst({
      orderBy: { docNum: 'desc' }
    })
    const nextDocNum = (lastInvoice?.docNum || 0) + 1

    const apInvoice = await prisma.aPInvoice.create({
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

    revalidatePath('/ap-invoices')
    return { success: true, data: apInvoice }
  } catch (error) {
    console.error('Error creating AP invoice:', error)
    return { success: false, error: 'Failed to create AP invoice' }
  }
}

export async function getAPInvoices() {
  try {
    return await prisma.aPInvoice.findMany({
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
    console.error('Error fetching AP invoices:', error)
    return []
  }
}

export async function getAPInvoiceById(id: number) {
  try {
    return await prisma.aPInvoice.findUnique({
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
    console.error('Error fetching AP invoice:', error)
    return null
  }
}

export async function updateAPInvoiceStatus(id: number, status: DocStatus) {
  try {
    const apInvoice = await prisma.aPInvoice.update({
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

    revalidatePath('/ap-invoices')
    revalidatePath(`/ap-invoices/${id}`)
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

    revalidatePath('/ap-invoices')
    return { success: true }
  } catch (error) {
    console.error('Error deleting AP invoice:', error)
    return { success: false, error: 'Failed to delete AP invoice' }
  }
}