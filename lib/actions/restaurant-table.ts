'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

interface RestaurantTableFormData {
  number: string
  capacity: number
  status: string
  businessUnitId: string
  isActive: boolean
}

export async function getRestaurantTables() {
  try {
    const tables = await prisma.restaurantTable.findMany({
      include: {
        businessUnit: true,
        posOrders: {
          where: {
            status: 'OPEN'
          }
        }
      },
      orderBy: { number: 'asc' }
    })
    return tables
  } catch (error) {
    console.error('Error fetching restaurant tables:', error)
    return []
  }
}

export async function getRestaurantTableById(id: string) {
  try {
    const table = await prisma.restaurantTable.findUnique({
      where: { id },
      include: {
        businessUnit: true,
        posOrders: {
          include: {
            customer: true,
            lines: {
              include: {
                item: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    })
    return table
  } catch (error) {
    console.error('Error fetching restaurant table:', error)
    return null
  }
}

export async function createRestaurantTable(data: RestaurantTableFormData) {
  try {
    const table = await prisma.restaurantTable.create({
      data: {
        number: data.number,
        capacity: data.capacity,
        status: data.status,
        businessUnitId: data.businessUnitId,
        isActive: data.isActive
      }
    })

    revalidatePath('/dashboard/restaurant/tables')
    return { success: true, data: table }
  } catch (error) {
    console.error('Error creating restaurant table:', error)
    return { success: false, error: 'Failed to create restaurant table' }
  }
}

export async function updateRestaurantTable(id: string, data: RestaurantTableFormData) {
  try {
    const table = await prisma.restaurantTable.update({
      where: { id },
      data: {
        number: data.number,
        capacity: data.capacity,
        status: data.status,
        businessUnitId: data.businessUnitId,
        isActive: data.isActive
      }
    })

    revalidatePath('/dashboard/restaurant/tables')
    revalidatePath(`/dashboard/restaurant/tables/${id}`)
    return { success: true, data: table }
  } catch (error) {
    console.error('Error updating restaurant table:', error)
    return { success: false, error: 'Failed to update restaurant table' }
  }
}

export async function updateTableStatus(id: string, status: string) {
  try {
    const table = await prisma.restaurantTable.update({
      where: { id },
      data: { status }
    })

    revalidatePath('/dashboard/restaurant/tables')
    revalidatePath(`/dashboard/restaurant/tables/${id}`)
    return { success: true, data: table }
  } catch (error) {
    console.error('Error updating table status:', error)
    return { success: false, error: 'Failed to update table status' }
  }
}

export async function deleteRestaurantTable(id: string) {
  try {
    await prisma.restaurantTable.delete({
      where: { id }
    })

    revalidatePath('/dashboard/restaurant/tables')
    return { success: true }
  } catch (error) {
    console.error('Error deleting restaurant table:', error)
    return { success: false, error: 'Failed to delete restaurant table' }
  }
}

export async function getAvailableTables() {
  try {
    const tables = await prisma.restaurantTable.findMany({
      where: { 
        status: 'AVAILABLE',
        isActive: true
      },
      include: {
        businessUnit: true
      },
      orderBy: { number: 'asc' }
    })
    return tables
  } catch (error) {
    console.error('Error fetching available tables:', error)
    return []
  }
}

export async function getOccupiedTables() {
  try {
    const tables = await prisma.restaurantTable.findMany({
      where: { 
        status: 'OCCUPIED',
        isActive: true
      },
      include: {
        businessUnit: true,
        posOrders: {
          where: { status: 'OPEN' },
          include: {
            customer: true
          }
        }
      },
      orderBy: { number: 'asc' }
    })
    return tables
  } catch (error) {
    console.error('Error fetching occupied tables:', error)
    return []
  }
} 