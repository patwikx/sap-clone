'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const warehouseSchema = z.object({
  whsCode: z.string().min(1, 'Warehouse code is required'),
  whsName: z.string().min(1, 'Warehouse name is required')
})

export type WarehouseFormData = z.infer<typeof warehouseSchema>

export async function createWarehouse(data: WarehouseFormData) {
  try {
    const validatedData = warehouseSchema.parse(data)
    
    const warehouse = await prisma.warehouse.create({
      data: validatedData
    })

    revalidatePath('/warehouses')
    return { success: true, data: warehouse }
  } catch (error) {
    console.error('Error creating warehouse:', error)
    return { success: false, error: 'Failed to create warehouse' }
  }
}

export async function getWarehouses() {
  try {
    return await prisma.warehouse.findMany({
      include: {
        itemWarehouses: {
          include: {
            item: true
          }
        }
      },
      orderBy: {
        whsCode: 'asc'
      }
    })
  } catch (error) {
    console.error('Error fetching warehouses:', error)
    return []
  }
}

export async function getWarehouseById(id: string) {
  try {
    return await prisma.warehouse.findUnique({
      where: { id },
      include: {
        itemWarehouses: {
          include: {
            item: true
          }
        }
      }
    })
  } catch (error) {
    console.error('Error fetching warehouse:', error)
    return null
  }
}

export async function updateWarehouse(id: string, data: WarehouseFormData) {
  try {
    const validatedData = warehouseSchema.parse(data)
    
    const warehouse = await prisma.warehouse.update({
      where: { id },
      data: validatedData
    })

    revalidatePath('/warehouses')
    revalidatePath(`/warehouses/${id}`)
    return { success: true, data: warehouse }
  } catch (error) {
    console.error('Error updating warehouse:', error)
    return { success: false, error: 'Failed to update warehouse' }
  }
}

export async function deleteWarehouse(id: string) {
  try {
    await prisma.warehouse.delete({
      where: { id }
    })

    revalidatePath('/warehouses')
    return { success: true }
  } catch (error) {
    console.error('Error deleting warehouse:', error)
    return { success: false, error: 'Failed to delete warehouse' }
  }
}