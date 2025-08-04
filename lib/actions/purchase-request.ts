'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { DocStatus } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'

// Define the form data interface based on the actual schema
interface PurchaseRequestFormData {
  number: string
  status: DocStatus
  requestDate: Date
  requiredDate: Date
  comments?: string
  businessUnitId: string
  requesterId: string
  supplierId?: string
  totalAmount: number
  lines: {
    itemId: string
    description: string
    quantity: number
    estimatedPrice: number
    lineTotal: number
  }[]
}

export async function getPurchaseRequests() {
  try {
    const purchaseRequests = await prisma.purchaseRequest.findMany({
      include: {
        requester: true,
        supplier: true,
        businessUnit: true,
        lines: {
          include: {
            item: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    return purchaseRequests
  } catch (error) {
    console.error('Error fetching purchase requests:', error)
    return []
  }
}

export async function getPurchaseRequestById(id: string) {
  try {
    const purchaseRequest = await prisma.purchaseRequest.findUnique({
      where: { id },
      include: {
        requester: true,
        supplier: true,
        businessUnit: true,
        lines: {
          include: {
            item: true
          }
        }
      }
    })
    return purchaseRequest
  } catch (error) {
    console.error('Error fetching purchase request:', error)
    return null
  }
}

export async function createPurchaseRequest(data: PurchaseRequestFormData) {
  try {
    const purchaseRequest = await prisma.purchaseRequest.create({
      data: {
        number: data.number,
        status: data.status,
        requestDate: data.requestDate,
        requiredDate: data.requiredDate,
        comments: data.comments,
        businessUnitId: data.businessUnitId,
        requesterId: data.requesterId,
        supplierId: data.supplierId,
        totalAmount: new Decimal(data.totalAmount),
        lines: {
          create: data.lines.map(line => ({
            itemId: line.itemId,
            description: line.description,
            quantity: new Decimal(line.quantity),
            estimatedPrice: new Decimal(line.estimatedPrice),
            lineTotal: new Decimal(line.lineTotal)
          }))
        }
      }
    })

    revalidatePath('/dashboard/purchase-requests')
    return { success: true, data: purchaseRequest }
  } catch (error) {
    console.error('Error creating purchase request:', error)
    return { success: false, error: 'Failed to create purchase request' }
  }
}

export async function updatePurchaseRequestStatus(id: string, status: DocStatus) {
  try {
    const purchaseRequest = await prisma.purchaseRequest.update({
      where: { id },
      data: { status: status }
    })

    revalidatePath('/dashboard/purchase-requests')
    return { success: true, data: purchaseRequest }
  } catch (error) {
    console.error('Error updating purchase request status:', error)
    return { success: false, error: 'Failed to update purchase request status' }
  }
}

export async function deletePurchaseRequest(id: string) {
  try {
    await prisma.purchaseRequest.delete({
      where: { id }
    })

    revalidatePath('/dashboard/purchase-requests')
    return { success: true }
  } catch (error) {
    console.error('Error deleting purchase request:', error)
    return { success: false, error: 'Failed to delete purchase request' }
  }
}