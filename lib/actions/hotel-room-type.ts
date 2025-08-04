'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { Decimal } from '@prisma/client/runtime/library'

interface HotelRoomTypeFormData {
  name: string
  description?: string
  baseRate: number
  maxOccupancy: number
}

export async function getHotelRoomTypes() {
  try {
    const roomTypes = await prisma.hotelRoomType.findMany({
      include: {
        rooms: true
      },
      orderBy: { name: 'asc' }
    })
    return roomTypes
  } catch (error) {
    console.error('Error fetching hotel room types:', error)
    return []
  }
}

export async function getHotelRoomTypeById(id: string) {
  try {
    const roomType = await prisma.hotelRoomType.findUnique({
      where: { id },
      include: {
        rooms: true
      }
    })
    return roomType
  } catch (error) {
    console.error('Error fetching hotel room type:', error)
    return null
  }
}

export async function createHotelRoomType(data: HotelRoomTypeFormData) {
  try {
    const roomType = await prisma.hotelRoomType.create({
      data: {
        name: data.name,
        description: data.description,
        baseRate: new Decimal(data.baseRate),
        maxOccupancy: data.maxOccupancy
      }
    })

    revalidatePath('/dashboard/hotel/room-types')
    return { success: true, data: roomType }
  } catch (error) {
    console.error('Error creating hotel room type:', error)
    return { success: false, error: 'Failed to create hotel room type' }
  }
}

export async function updateHotelRoomType(id: string, data: HotelRoomTypeFormData) {
  try {
    const roomType = await prisma.hotelRoomType.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        baseRate: new Decimal(data.baseRate),
        maxOccupancy: data.maxOccupancy
      }
    })

    revalidatePath('/dashboard/hotel/room-types')
    revalidatePath(`/dashboard/hotel/room-types/${id}`)
    return { success: true, data: roomType }
  } catch (error) {
    console.error('Error updating hotel room type:', error)
    return { success: false, error: 'Failed to update hotel room type' }
  }
}

export async function deleteHotelRoomType(id: string) {
  try {
    await prisma.hotelRoomType.delete({
      where: { id }
    })

    revalidatePath('/dashboard/hotel/room-types')
    return { success: true }
  } catch (error) {
    console.error('Error deleting hotel room type:', error)
    return { success: false, error: 'Failed to delete hotel room type' }
  }
} 