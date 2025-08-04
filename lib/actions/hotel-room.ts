'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { RoomStatus, HousekeepingStatus } from '@prisma/client'

interface HotelRoomFormData {
  number: string
  businessUnitId: string
  roomTypeId: string
  status: RoomStatus
  housekeepingStatus: HousekeepingStatus
}

export async function getHotelRooms() {
  try {
    const rooms = await prisma.hotelRoom.findMany({
      include: {
        roomType: true,
        bookings: true,
        maintenanceRequests: true
      },
      orderBy: { number: 'asc' }
    })
    return rooms
  } catch (error) {
    console.error('Error fetching hotel rooms:', error)
    return []
  }
}

export async function getHotelRoomById(id: string) {
  try {
    const room = await prisma.hotelRoom.findUnique({
      where: { id },
      include: {
        roomType: true,
        bookings: {
          include: {
            guest: true
          }
        },
        maintenanceRequests: true
      }
    })
    return room
  } catch (error) {
    console.error('Error fetching hotel room:', error)
    return null
  }
}

export async function createHotelRoom(data: HotelRoomFormData) {
  try {
    const room = await prisma.hotelRoom.create({
      data: {
        number: data.number,
        businessUnitId: data.businessUnitId,
        roomTypeId: data.roomTypeId,
        status: data.status,
        housekeepingStatus: data.housekeepingStatus
      }
    })

    revalidatePath('/dashboard/hotel/rooms')
    return { success: true, data: room }
  } catch (error) {
    console.error('Error creating hotel room:', error)
    return { success: false, error: 'Failed to create hotel room' }
  }
}

export async function updateHotelRoom(id: string, data: HotelRoomFormData) {
  try {
    const room = await prisma.hotelRoom.update({
      where: { id },
      data: {
        number: data.number,
        businessUnitId: data.businessUnitId,
        roomTypeId: data.roomTypeId,
        status: data.status,
        housekeepingStatus: data.housekeepingStatus
      }
    })

    revalidatePath('/dashboard/hotel/rooms')
    revalidatePath(`/dashboard/hotel/rooms/${id}`)
    return { success: true, data: room }
  } catch (error) {
    console.error('Error updating hotel room:', error)
    return { success: false, error: 'Failed to update hotel room' }
  }
}

export async function updateRoomStatus(id: string, status: RoomStatus) {
  try {
    const room = await prisma.hotelRoom.update({
      where: { id },
      data: { status }
    })

    revalidatePath('/dashboard/hotel/rooms')
    revalidatePath(`/dashboard/hotel/rooms/${id}`)
    return { success: true, data: room }
  } catch (error) {
    console.error('Error updating room status:', error)
    return { success: false, error: 'Failed to update room status' }
  }
}

export async function updateHousekeepingStatus(id: string, status: HousekeepingStatus) {
  try {
    const room = await prisma.hotelRoom.update({
      where: { id },
      data: { housekeepingStatus: status }
    })

    revalidatePath('/dashboard/hotel/rooms')
    revalidatePath(`/dashboard/hotel/rooms/${id}`)
    return { success: true, data: room }
  } catch (error) {
    console.error('Error updating housekeeping status:', error)
    return { success: false, error: 'Failed to update housekeeping status' }
  }
}

export async function deleteHotelRoom(id: string) {
  try {
    await prisma.hotelRoom.delete({
      where: { id }
    })

    revalidatePath('/dashboard/hotel/rooms')
    return { success: true }
  } catch (error) {
    console.error('Error deleting hotel room:', error)
    return { success: false, error: 'Failed to delete hotel room' }
  }
} 