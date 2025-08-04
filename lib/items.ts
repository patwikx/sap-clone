'use server'

import { prisma } from '@/lib/prisma'
import { itemSchema } from '@/lib/validations'
import { ItemFormData, ItemWithRelations } from '@/lib/types'
import { revalidatePath } from 'next/cache'

export async function createItem(data: ItemFormData) {
  try {
    const validatedData = itemSchema.parse(data)
    
    const item = await prisma.item.create({
      data: {
        itemCode: validatedData.itemCode,
        itemName: validatedData.itemName,
        itemType: validatedData.itemType,
        price: validatedData.price,
        currency: validatedData.currency,
        itemGroupId: validatedData.itemGroupId,
        procurementMethod: validatedData.procurementMethod,
        leadTime: validatedData.leadTime
      },
      include: {
        itemGroup: true,
        itemWarehouses: {
          include: {
            warehouse: true
          }
        }
      }
    })

    revalidatePath('/items')
    return { success: true, data: item }
  } catch (error) {
    console.error('Error creating item:', error)
    return { success: false, error: 'Failed to create item' }
  }
}

export async function getItems(): Promise<ItemWithRelations[]> {
  try {
    return await prisma.item.findMany({
      include: {
        itemGroup: true,
        itemWarehouses: {
          include: {
            warehouse: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
  } catch (error) {
    console.error('Error fetching items:', error)
    return []
  }
}

export async function getItemGroups() {
  try {
    return await prisma.itemGroup.findMany({
      orderBy: {
        groupName: 'asc'
      }
    })
  } catch (error) {
    console.error('Error fetching item groups:', error)
    return []
  }
}

export async function createItemGroup(groupName: string) {
  try {
    const itemGroup = await prisma.itemGroup.create({
      data: { groupName }
    })

    revalidatePath('/items')
    return { success: true, data: itemGroup }
  } catch (error) {
    console.error('Error creating item group:', error)
    return { success: false, error: 'Failed to create item group' }
  }
}

export async function getItemById(id: string): Promise<ItemWithRelations | null> {
  try {
    return await prisma.item.findUnique({
      where: { id },
      include: {
        itemGroup: true,
        itemWarehouses: {
          include: {
            warehouse: true
          }
        }
      }
    })
  } catch (error) {
    console.error('Error fetching item:', error)
    return null
  }
}

export async function updateItem(id: string, data: ItemFormData) {
  try {
    const validatedData = itemSchema.parse(data)
    
    const item = await prisma.item.update({
      where: { id },
      data: {
        itemCode: validatedData.itemCode,
        itemName: validatedData.itemName,
        itemType: validatedData.itemType,
        price: validatedData.price,
        currency: validatedData.currency,
        itemGroupId: validatedData.itemGroupId,
        procurementMethod: validatedData.procurementMethod,
        leadTime: validatedData.leadTime
      },
      include: {
        itemGroup: true,
        itemWarehouses: {
          include: {
            warehouse: true
          }
        }
      }
    })

    revalidatePath('/items')
    revalidatePath(`/items/${id}`)
    return { success: true, data: item }
  } catch (error) {
    console.error('Error updating item:', error)
    return { success: false, error: 'Failed to update item' }
  }
}

export async function deleteItem(id: string) {
  try {
    await prisma.item.delete({
      where: { id }
    })

    revalidatePath('/items')
    return { success: true }
  } catch (error) {
    console.error('Error deleting item:', error)
    return { success: false, error: 'Failed to delete item' }
  }
}