'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

interface FiscalYearFormData {
  name: string
  startDate: Date
  endDate: Date
  status: string
}

export async function getFiscalYears() {
  try {
    const fiscalYears = await prisma.fiscalYear.findMany({
      include: {
        periods: {
          orderBy: { startDate: 'asc' }
        }
      },
      orderBy: { startDate: 'desc' }
    })
    return fiscalYears
  } catch (error) {
    console.error('Error fetching fiscal years:', error)
    return []
  }
}

export async function getFiscalYearById(id: string) {
  try {
    const fiscalYear = await prisma.fiscalYear.findUnique({
      where: { id },
      include: {
        periods: {
          orderBy: { startDate: 'asc' }
        }
      }
    })
    return fiscalYear
  } catch (error) {
    console.error('Error fetching fiscal year:', error)
    return null
  }
}

export async function createFiscalYear(data: FiscalYearFormData) {
  try {
    const fiscalYear = await prisma.fiscalYear.create({
      data: {
        name: data.name,
        startDate: data.startDate,
        endDate: data.endDate,
        status: data.status
      }
    })

    revalidatePath('/dashboard/financial/fiscal-years')
    return { success: true, data: fiscalYear }
  } catch (error) {
    console.error('Error creating fiscal year:', error)
    return { success: false, error: 'Failed to create fiscal year' }
  }
}

export async function updateFiscalYear(id: string, data: FiscalYearFormData) {
  try {
    const fiscalYear = await prisma.fiscalYear.update({
      where: { id },
      data: {
        name: data.name,
        startDate: data.startDate,
        endDate: data.endDate,
        status: data.status
      }
    })

    revalidatePath('/dashboard/financial/fiscal-years')
    revalidatePath(`/dashboard/financial/fiscal-years/${id}`)
    return { success: true, data: fiscalYear }
  } catch (error) {
    console.error('Error updating fiscal year:', error)
    return { success: false, error: 'Failed to update fiscal year' }
  }
}

export async function closeFiscalYear(id: string) {
  try {
    const fiscalYear = await prisma.fiscalYear.update({
      where: { id },
      data: { status: 'CLOSED' }
    })

    revalidatePath('/dashboard/financial/fiscal-years')
    return { success: true, data: fiscalYear }
  } catch (error) {
    console.error('Error closing fiscal year:', error)
    return { success: false, error: 'Failed to close fiscal year' }
  }
}

export async function deleteFiscalYear(id: string) {
  try {
    await prisma.fiscalYear.delete({
      where: { id }
    })

    revalidatePath('/dashboard/financial/fiscal-years')
    return { success: true }
  } catch (error) {
    console.error('Error deleting fiscal year:', error)
    return { success: false, error: 'Failed to delete fiscal year' }
  }
} 