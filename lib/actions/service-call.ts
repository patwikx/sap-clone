'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const serviceCallSchema = z.object({
  subject: z.string().min(1, 'Subject is required'),
  customerId: z.string().min(1, 'Customer is required'),
  itemCode: z.string().optional(),
  serialNumber: z.string().optional(),
  priority: z.enum(['L', 'M', 'H']).default('M'),
  contractId: z.string().optional()
})

export type ServiceCallFormData = z.infer<typeof serviceCallSchema>

export type ServiceCallWithRelations = Awaited<ReturnType<typeof getServiceCallById>>

export async function createServiceCall(data: ServiceCallFormData) {
  try {
    const validatedData = serviceCallSchema.parse(data)
    
    const serviceCall = await prisma.serviceCall.create({
      data: validatedData,
      include: {
        customer: true,
        equipmentCard: {
          include: {
            item: true
          }
        },
        contract: true
      }
    })

    revalidatePath('/service-calls')
    return { success: true, data: serviceCall }
  } catch (error) {
    console.error('Error creating service call:', error)
    return { success: false, error: 'Failed to create service call' }
  }
}

export async function getServiceCalls() {
  try {
    return await prisma.serviceCall.findMany({
      include: {
        customer: true,
        equipmentCard: {
          include: {
            item: true
          }
        },
        contract: true
      },
      orderBy: {
        createdOn: 'desc'
      }
    })
  } catch (error) {
    console.error('Error fetching service calls:', error)
    return []
  }
}

export async function getServiceCallById(id: number) {
  try {
    return await prisma.serviceCall.findUnique({
      where: { id },
      include: {
        customer: true,
        equipmentCard: {
          include: {
            item: true
          }
        },
        contract: true
      }
    })
  } catch (error) {
    console.error('Error fetching service call:', error)
    return null
  }
}

export async function updateServiceCallStatus(id: number, status: number) {
  try {
    const serviceCall = await prisma.serviceCall.update({
      where: { id },
      data: { 
        status,
        closedOn: status === -2 ? new Date() : null
      },
      include: {
        customer: true,
        equipmentCard: {
          include: {
            item: true
          }
        },
        contract: true
      }
    })

    revalidatePath('/service-calls')
    revalidatePath(`/service-calls/${id}`)
    return { success: true, data: serviceCall }
  } catch (error) {
    console.error('Error updating service call status:', error)
    return { success: false, error: 'Failed to update service call status' }
  }
}

export async function deleteServiceCall(id: number) {
  try {
    await prisma.serviceCall.delete({
      where: { id }
    })

    revalidatePath('/service-calls')
    return { success: true }
  } catch (error) {
    console.error('Error deleting service call:', error)
    return { success: false, error: 'Failed to delete service call' }
  }
}