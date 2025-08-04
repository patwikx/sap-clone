'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function getItemGroups() {
  try {
    const itemGroups = await prisma.itemGroup.findMany({
      include: {
        items: true
      },
      orderBy: { name: 'asc' }
    })
    return itemGroups
  } catch (error) {
    console.error('Error fetching item groups:', error)
    return []
  }
}

export async function createItemGroup(data: { name: string }) {
  try {
    const itemGroup = await prisma.itemGroup.create({
      data: {
        name: data.name
      }
    })

    revalidatePath('/dashboard/item-groups')
    return { success: true, data: itemGroup }
  } catch (error) {
    console.error('Error creating item group:', error)
    return { success: false, error: 'Failed to create item group' }
  }
}

export async function deleteItemGroup(id: string) {
  try {
    await prisma.itemGroup.delete({
      where: { id }
    })

    revalidatePath('/dashboard/item-groups')
    return { success: true }
  } catch (error) {
    console.error('Error deleting item group:', error)
    return { success: false, error: 'Failed to delete item group' }
  }
}