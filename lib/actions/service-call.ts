'use server'

import { prisma } from '@/lib/prisma'
import { ServiceCallFormData } from '@/lib/types'
import { revalidatePath } from 'next/cache'

export async function getServiceCalls() {
  try {
    const serviceCalls = await prisma.serviceCall.findMany({
      include: {
        customer: true,
        equipmentCard: true,
        contract: true
      },
      orderBy: { createdAt: 'desc' }
    })
    return serviceCalls
  } catch (error) {
    console.error('Error fetching service calls:', error)
    return []
  }
}

export async function getServiceCallById(id: number) {
  try {
    const serviceCall = await prisma.serviceCall.findUnique({
      where: { id },
      include: {
        customer: true,
        equipmentCard: true,
        contract: true
      }
    })
    return serviceCall
  } catch (error) {
    console.error('Error fetching service call:', error)
    return null
  }
}

export async function createServiceCall(data: ServiceCallFormData) {
  try {
    const serviceCall = await prisma.serviceCall.create({
      data: {
        subject: data.subject,
        customerId: data.customerId,
        itemCode: data.itemCode,
        serialNumber: data.serialNumber,
        priority: data.priority,
        contractId: data.contractId,
        status: -3 // Open
      }
    })

    revalidatePath('/dashboard/service-call')
    return { success: true, data: serviceCall }
  } catch (error) {
    console.error('Error creating service call:', error)
    return { success: false, error: 'Failed to create service call' }
  }
}

export async function updateServiceCallStatus(id: number, status: number) {
  try {
    const updateData: any = { status }
    
    if (status === -2) { // Closed
      updateData.closedOn = new Date()
    }

    const serviceCall = await prisma.serviceCall.update({
      where: { id },
      data: updateData
    })

    revalidatePath('/dashboard/service-call')
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

    revalidatePath('/dashboard/service-call')
    return { success: true }
  } catch (error) {
    console.error('Error deleting service call:', error)
    return { success: false, error: 'Failed to delete service call' }
  }
}