'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

interface MenuFormData {
  name: string
  businessUnitId: string
}

export async function getMenus() {
  try {
    const menus = await prisma.menu.findMany({
      include: {
        businessUnit: true
      },
      orderBy: { name: 'asc' }
    })
    return menus
  } catch (error) {
    console.error('Error fetching menus:', error)
    return []
  }
}

export async function getMenuById(id: string) {
  try {
    const menu = await prisma.menu.findUnique({
      where: { id },
      include: {
        businessUnit: true
      }
    })
    return menu
  } catch (error) {
    console.error('Error fetching menu:', error)
    return null
  }
}

export async function createMenu(data: MenuFormData) {
  try {
    const menu = await prisma.menu.create({
      data: {
        name: data.name,
        businessUnitId: data.businessUnitId
      }
    })

    revalidatePath('/dashboard/restaurant/menus')
    return { success: true, data: menu }
  } catch (error) {
    console.error('Error creating menu:', error)
    return { success: false, error: 'Failed to create menu' }
  }
}

export async function updateMenu(id: string, data: MenuFormData) {
  try {
    const menu = await prisma.menu.update({
      where: { id },
      data: {
        name: data.name,
        businessUnitId: data.businessUnitId
      }
    })

    revalidatePath('/dashboard/restaurant/menus')
    revalidatePath(`/dashboard/restaurant/menus/${id}`)
    return { success: true, data: menu }
  } catch (error) {
    console.error('Error updating menu:', error)
    return { success: false, error: 'Failed to update menu' }
  }
}

export async function deleteMenu(id: string) {
  try {
    await prisma.menu.delete({
      where: { id }
    })

    revalidatePath('/dashboard/restaurant/menus')
    return { success: true }
  } catch (error) {
    console.error('Error deleting menu:', error)
    return { success: false, error: 'Failed to delete menu' }
  }
}

export async function getMenusByBusinessUnit(businessUnitId: string) {
  try {
    const menus = await prisma.menu.findMany({
      where: { businessUnitId },
      include: {
        businessUnit: true
      },
      orderBy: { name: 'asc' }
    })
    return menus
  } catch (error) {
    console.error('Error fetching menus by business unit:', error)
    return []
  }
} 