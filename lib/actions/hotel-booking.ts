'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { BookingStatus } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'

interface HotelBookingFormData {
  confirmationCode: string
  guestId: string
  roomId: string
  ratePlanId?: string
  packageDealId?: string
  channelId?: string
  groupBookingId?: string
  checkInDate: Date
  checkOutDate: Date
  totalAmount: number
  businessUnitId: string
  status: BookingStatus
}

// Type for update operations that handles Decimal conversion
type HotelBookingUpdateData = {
  confirmationCode?: string
  guestId?: string
  roomId?: string
  ratePlanId?: string | null
  packageDealId?: string | null
  channelId?: string | null
  groupBookingId?: string | null
  checkInDate?: Date
  checkOutDate?: Date
  totalAmount?: Decimal
  businessUnitId?: string
  status?: BookingStatus
}

export async function getHotelBookings() {
  try {
    const bookings = await prisma.hotelBooking.findMany({
      include: {
        guest: true,
        room: {
          include: {
            roomType: true
          }
        },
        ratePlan: true,
        folio: true
      },
      orderBy: { checkInDate: 'desc' }
    })
    return bookings
  } catch (error) {
    console.error('Error fetching hotel bookings:', error)
    return []
  }
}

export async function getHotelBookingById(id: string) {
  try {
    const booking = await prisma.hotelBooking.findUnique({
      where: { id },
      include: {
        guest: true,
        room: {
          include: {
            roomType: true
          }
        },
        ratePlan: true,
        folio: true
      }
    })
    return booking
  } catch (error) {
    console.error('Error fetching hotel booking:', error)
    return null
  }
}

export async function createHotelBooking(data: HotelBookingFormData) {
  try {
    const booking = await prisma.hotelBooking.create({
      data: {
        confirmationCode: data.confirmationCode,
        guestId: data.guestId,
        roomId: data.roomId,
        ratePlanId: data.ratePlanId,
        packageDealId: data.packageDealId,
        channelId: data.channelId,
        groupBookingId: data.groupBookingId,
        checkInDate: data.checkInDate,
        checkOutDate: data.checkOutDate,
        totalAmount: new Decimal(data.totalAmount),
        businessUnitId: data.businessUnitId,
        status: data.status
      }
    })

    revalidatePath('/dashboard/hotel/bookings')
    return { success: true, data: booking }
  } catch (error) {
    console.error('Error creating hotel booking:', error)
    return { success: false, error: 'Failed to create hotel booking' }
  }
}

export async function updateHotelBooking(id: string, data: Partial<HotelBookingFormData>) {
  try {
    const { totalAmount, ...updateData } = data
    const finalData: HotelBookingUpdateData = { ...updateData }
    
    if (totalAmount !== undefined) {
      finalData.totalAmount = new Decimal(totalAmount)
    }

    const booking = await prisma.hotelBooking.update({
      where: { id },
      data: finalData
    })

    revalidatePath('/dashboard/hotel/bookings')
    revalidatePath(`/dashboard/hotel/bookings/${id}`)
    return { success: true, data: booking }
  } catch (error) {
    console.error('Error updating hotel booking:', error)
    return { success: false, error: 'Failed to update hotel booking' }
  }
}

export async function updateBookingStatus(id: string, status: BookingStatus) {
  try {
    const booking = await prisma.hotelBooking.update({
      where: { id },
      data: { status }
    })

    revalidatePath('/dashboard/hotel/bookings')
    revalidatePath(`/dashboard/hotel/bookings/${id}`)
    return { success: true, data: booking }
  } catch (error) {
    console.error('Error updating booking status:', error)
    return { success: false, error: 'Failed to update booking status' }
  }
}

export async function checkInBooking(id: string) {
  try {
    const booking = await prisma.hotelBooking.update({
      where: { id },
      data: { status: 'CHECKED_IN' }
    })

    // Update room status to occupied
    await prisma.hotelRoom.update({
      where: { id: booking.roomId },
      data: { status: 'OCCUPIED' }
    })

    revalidatePath('/dashboard/hotel/bookings')
    revalidatePath(`/dashboard/hotel/bookings/${id}`)
    return { success: true, data: booking }
  } catch (error) {
    console.error('Error checking in booking:', error)
    return { success: false, error: 'Failed to check in booking' }
  }
}

export async function checkOutBooking(id: string) {
  try {
    const booking = await prisma.hotelBooking.update({
      where: { id },
      data: { status: 'CHECKED_OUT' }
    })

    // Update room status to available and mark as dirty
    await prisma.hotelRoom.update({
      where: { id: booking.roomId },
      data: { 
        status: 'AVAILABLE',
        housekeepingStatus: 'DIRTY'
      }
    })

    revalidatePath('/dashboard/hotel/bookings')
    revalidatePath(`/dashboard/hotel/bookings/${id}`)
    return { success: true, data: booking }
  } catch (error) {
    console.error('Error checking out booking:', error)
    return { success: false, error: 'Failed to check out booking' }
  }
}

export async function cancelBooking(id: string) {
  try {
    const booking = await prisma.hotelBooking.update({
      where: { id },
      data: { status: 'CANCELLED' }
    })

    revalidatePath('/dashboard/hotel/bookings')
    revalidatePath(`/dashboard/hotel/bookings/${id}`)
    return { success: true, data: booking }
  } catch (error) {
    console.error('Error cancelling booking:', error)
    return { success: false, error: 'Failed to cancel booking' }
  }
}

export async function deleteHotelBooking(id: string) {
  try {
    await prisma.hotelBooking.delete({
      where: { id }
    })

    revalidatePath('/dashboard/hotel/bookings')
    return { success: true }
  } catch (error) {
    console.error('Error deleting hotel booking:', error)
    return { success: false, error: 'Failed to delete hotel booking' }
  }
} 