'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const itemGroupSchema = z.object({
  groupName: z.string().min(1, 'Group name is required')
})

export type ItemGroupFormData = z.infer<typeof itemGroupSchema>

export async function createItemGroup(data: ItemGroupFormData) {
  try {
    const validatedData = itemGroupSchema.parse(data)
    
    const itemGroup = await prisma.itemGroup.create({
      data: validatedData
    })

    revalidatePath('/item-groups')
    return { success: true, data: itemGroup }
  } catch (error) {
    console.error('Error creating item group:', error)
    return { success: false, error: 'Failed to create item group' }
  }
}

export async function getItemGroups() {
  try {
    return await prisma.itemGroup.findMany({
      include: {
        items: true
      },
      orderBy: {
        groupName: 'asc'
      }
    })
  } catch (error) {
    console.error('Error fetching item groups:', error)
    return []
  }
}

export async function getItemGroupById(id: string) {
  try {
    return await prisma.itemGroup.findUnique({
      where: { id },
      include: {
        items: true
      }
    })
  } catch (error) {
    console.error('Error fetching item group:', error)
    return null
  }
}

export async function updateItemGroup(id: string, data: ItemGroupFormData) {
  try {
    const validatedData = itemGroupSchema.parse(data)
    
    const itemGroup = await prisma.itemGroup.update({
      where: { id },
      data: validatedData
    })

    revalidatePath('/item-groups')
    revalidatePath(`/item-groups/${id}`)
    return { success: true, data: itemGroup }
  } catch (error) {
    console.error('Error updating item group:', error)
    return { success: false, error: 'Failed to update item group' }
  }
}

export async function deleteItemGroup(id: string) {
  try {
    await prisma.itemGroup.delete({
      where: { id }
    })

    revalidatePath('/item-groups')
    return { success: true }
  } catch (error) {
    console.error('Error deleting item group:', error)
    return { success: false, error: 'Failed to delete item group' }
  }
}