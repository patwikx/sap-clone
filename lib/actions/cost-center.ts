'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { Decimal } from '@prisma/client/runtime/library'

interface CostCenterFormData {
  code: string
  name: string
  managerId?: string
  budgetAmount?: number
}

export async function getCostCenters() {
  try {
    const costCenters = await prisma.costCenter.findMany({
      include: {
        journalEntryLines: {
          include: {
            journalEntry: true
          }
        }
      },
      orderBy: { name: 'asc' }
    })
    return costCenters
  } catch (error) {
    console.error('Error fetching cost centers:', error)
    return []
  }
}

export async function getCostCenterById(id: string) {
  try {
    const costCenter = await prisma.costCenter.findUnique({
      where: { id },
      include: {
        journalEntryLines: {
          include: {
            journalEntry: true
          },
          orderBy: {
            journalEntry: {
              date: 'desc'
            }
          },
          take: 20
        }
      }
    })
    return costCenter
  } catch (error) {
    console.error('Error fetching cost center:', error)
    return null
  }
}

export async function createCostCenter(data: CostCenterFormData) {
  try {
    const costCenter = await prisma.costCenter.create({
      data: {
        code: data.code,
        name: data.name,
        managerId: data.managerId,
        budgetAmount: data.budgetAmount ? new Decimal(data.budgetAmount) : null
      }
    })

    revalidatePath('/dashboard/financial/cost-centers')
    return { success: true, data: costCenter }
  } catch (error) {
    console.error('Error creating cost center:', error)
    return { success: false, error: 'Failed to create cost center' }
  }
}

export async function updateCostCenter(id: string, data: CostCenterFormData) {
  try {
    const costCenter = await prisma.costCenter.update({
      where: { id },
      data: {
        code: data.code,
        name: data.name,
        managerId: data.managerId,
        budgetAmount: data.budgetAmount ? new Decimal(data.budgetAmount) : null
      }
    })

    revalidatePath('/dashboard/financial/cost-centers')
    revalidatePath(`/dashboard/financial/cost-centers/${id}`)
    return { success: true, data: costCenter }
  } catch (error) {
    console.error('Error updating cost center:', error)
    return { success: false, error: 'Failed to update cost center' }
  }
}

export async function deleteCostCenter(id: string) {
  try {
    await prisma.costCenter.delete({
      where: { id }
    })

    revalidatePath('/dashboard/financial/cost-centers')
    return { success: true }
  } catch (error) {
    console.error('Error deleting cost center:', error)
    return { success: false, error: 'Failed to delete cost center' }
  }
}

export async function getCostCentersByBusinessUnit(businessUnitId: string) {
  try {
    const costCenters = await prisma.costCenter.findMany({
      include: {
        journalEntryLines: {
          include: {
            journalEntry: true
          }
        }
      },
      orderBy: { name: 'asc' }
    })
    return costCenters
  } catch (error) {
    console.error('Error fetching cost centers by business unit:', error)
    return []
  }
} 