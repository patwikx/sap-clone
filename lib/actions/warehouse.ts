'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getWarehouses() {
  try {
    const warehouses = await prisma.warehouse.findMany({
      include: {
        itemWarehouses: {
          include: {
            item: true
          }
        }
      },
      orderBy: { name: 'asc' }
    })
    return warehouses
  } catch (error) {
    console.error('Error fetching warehouses:', error)
    return []
  }
}

export async function createWarehouse(data: { code: string; name: string }) {
  try {
    const warehouse = await prisma.warehouse.create({
      data: {
        code: data.code,
        name: data.name
      }
    })

    revalidatePath('/dashboard/warehouse')
    return { success: true, data: warehouse }
  } catch (error) {
    console.error('Error creating warehouse:', error)
    return { success: false, error: 'Failed to create warehouse' }
  }
}

export async function deleteWarehouse(id: string) {
  try {
    await prisma.warehouse.delete({
      where: { id }
    })

    revalidatePath('/dashboard/warehouse')
    return { success: true }
  } catch (error) {
    console.error('Error deleting warehouse:', error)
    return { success: false, error: 'Failed to delete warehouse' }
  }
}