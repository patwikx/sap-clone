'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { Decimal } from '@prisma/client/runtime/library'

interface RatePlanFormData {
  name: string
  roomTypeId: string
  startDate: Date
  endDate: Date
  rate: number
}

export async function getRatePlans() {
  try {
    const ratePlans = await prisma.ratePlan.findMany({
      include: {
        roomType: true
      },
      orderBy: { name: 'asc' }
    })
    return ratePlans
  } catch (error) {
    console.error('Error fetching rate plans:', error)
    return []
  }
}

export async function getRatePlanById(id: string) {
  try {
    const ratePlan = await prisma.ratePlan.findUnique({
      where: { id },
      include: {
        roomType: true
      }
    })
    return ratePlan
  } catch (error) {
    console.error('Error fetching rate plan:', error)
    return null
  }
}

export async function createRatePlan(data: RatePlanFormData) {
  try {
    const ratePlan = await prisma.ratePlan.create({
      data: {
        name: data.name,
        roomTypeId: data.roomTypeId,
        startDate: data.startDate,
        endDate: data.endDate,
        rate: new Decimal(data.rate)
      }
    })

    revalidatePath('/dashboard/hotel/rate-plans')
    return { success: true, data: ratePlan }
  } catch (error) {
    console.error('Error creating rate plan:', error)
    return { success: false, error: 'Failed to create rate plan' }
  }
}

export async function updateRatePlan(id: string, data: RatePlanFormData) {
  try {
    const ratePlan = await prisma.ratePlan.update({
      where: { id },
      data: {
        name: data.name,
        roomTypeId: data.roomTypeId,
        startDate: data.startDate,
        endDate: data.endDate,
        rate: new Decimal(data.rate)
      }
    })

    revalidatePath('/dashboard/hotel/rate-plans')
    revalidatePath(`/dashboard/hotel/rate-plans/${id}`)
    return { success: true, data: ratePlan }
  } catch (error) {
    console.error('Error updating rate plan:', error)
    return { success: false, error: 'Failed to update rate plan' }
  }
}

export async function deleteRatePlan(id: string) {
  try {
    await prisma.ratePlan.delete({
      where: { id }
    })

    revalidatePath('/dashboard/hotel/rate-plans')
    return { success: true }
  } catch (error) {
    console.error('Error deleting rate plan:', error)
    return { success: false, error: 'Failed to delete rate plan' }
  }
}

export async function getRatePlansByRoomType(roomTypeId: string) {
  try {
    const ratePlans = await prisma.ratePlan.findMany({
      where: { roomTypeId },
      include: {
        roomType: true
      },
      orderBy: { startDate: 'asc' }
    })
    return ratePlans
  } catch (error) {
    console.error('Error fetching rate plans by room type:', error)
    return []
  }
} 